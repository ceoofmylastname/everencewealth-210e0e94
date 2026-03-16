import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- Auth check ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { question, messages } = await req.json();

    if (!question) {
      return new Response(JSON.stringify({ error: "question is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
    const PINECONE_API_KEY = Deno.env.get("PINECONE_API_KEY")!;
    const PINECONE_INDEX_URL = Deno.env.get("PINECONE_INDEX_URL")!;
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;

    // --- Step 1: Embed the question ---
    const embedRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "models/gemini-embedding-001",
          content: { parts: [{ text: question }] },
          outputDimensionality: 768,
          taskType: "RETRIEVAL_QUERY",
        }),
      }
    );

    if (!embedRes.ok) {
      const errText = await embedRes.text();
      console.error("Gemini embed error:", errText);
      throw new Error(`Embedding failed: ${embedRes.status}`);
    }

    const embedData = await embedRes.json();
    const queryVector = embedData.embedding.values;

    // --- Step 2: Query Pinecone ---
    const pineconeRes = await fetch(`${PINECONE_INDEX_URL}/query`, {
      method: "POST",
      headers: {
        "Api-Key": PINECONE_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vector: queryVector,
        topK: 6,
        includeMetadata: true,
      }),
    });

    if (!pineconeRes.ok) {
      const errText = await pineconeRes.text();
      console.error("Pinecone query error:", errText);
      throw new Error(`Pinecone query failed: ${pineconeRes.status}`);
    }

    const pineconeData = await pineconeRes.json();

    console.log("Pinecone query debug:", {
      pineconeIndexUrl: PINECONE_INDEX_URL,
      matchesCount: pineconeData.matches?.length || 0,
      matchScores: (pineconeData.matches || []).map((m: { score: number }) => m.score),
    });

    // --- Step 3: Filter by score threshold ---
    const relevantMatches = (pineconeData.matches || []).filter(
      (m: { score: number }) => m.score >= 0.5
    );

    console.log(
      `Pinecone returned ${pineconeData.matches?.length || 0} matches, ${relevantMatches.length} above 0.5`
    );

    // Build context from matches
    const sources: string[] = [];
    const contextChunks = relevantMatches.map(
      (m: { metadata: { carrier: string; section: string; text: string }; score: number }) => {
        if (!sources.includes(m.metadata.carrier)) {
          sources.push(m.metadata.carrier);
        }
        return `[${m.metadata.carrier} — ${m.metadata.section}] (relevance: ${m.score.toFixed(2)})\n${m.metadata.text}`;
      }
    );

    const contextBlock =
      contextChunks.length > 0
        ? contextChunks.join("\n\n---\n\n")
        : "No relevant underwriting guidelines found in the knowledge base.";

    // --- Step 4: Build messages for Claude ---
    const systemPrompt = `You are an expert insurance underwriting advisor. You give clean, accurate, direct answers.

STRICT OUTPUT RULES:
- Never contradict yourself. If you catch an error mid-answer, start over internally before responding.
- Lead with the correct answer in the first sentence. Never correct yourself after the fact.
- Only answer what was asked. Do not include policy fees, riders, minimums, state exceptions, or premium structure unless the agent specifically asks.
- One recommended carrier and product maximum unless the question asks for alternatives.
- Cite only the sections you actually used. Do not list every chunk retrieved.
- If the context contains conflicting information, state the correct rule and explain the conflict in one sentence.

CLARIFYING QUESTIONS:
- Only ask for information that is BOTH missing AND actually required to answer the specific question asked.
- If the question is about coverage limits, age bands, or product eligibility by age — age is the only variable needed. Do not ask for gender or tobacco status.
- If the question already contains the answer to a variable (e.g. "72-year-old" already provides age), never ask for that variable again.
- Do not ask clarifying questions for factual lookups like maximum coverage amounts, condition decisions, or medication eligibility — these do not require a full client profile.
- Only ask clarifying questions when the answer would genuinely change based on the missing information.
- Ask one question maximum per response, never two.
- Examples of when NOT to ask: "what is the max coverage for a 72-year-old" — age is provided, answer the question directly.
- Examples of when to ask: "what can my client qualify for" with no profile at all — ask for age and gender only, not tobacco status or build.
- Format clarifying questions exactly like this:

**I need a bit more information:**
[Your question here]

- Once you have enough information, give the full recommendation using the RESPONSE FORMAT below.

RESPONSE FORMAT:
**Answer:** [Direct answer in one sentence]

**Details:**
[Only the rules directly relevant to the question - age bands, decision, timeframe if applicable]

**Source:** [Carrier name - Section name]

CONTEXT DOCUMENTS:
${contextBlock}`;

    const conversationHistory = (messages || [])
      .filter((m: { role: string }) => m.role === "user" || m.role === "assistant")
      .slice(-10)
      .map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      }));

    const claudeMessages = [
      ...conversationHistory,
      { role: "user", content: question },
    ];

    // --- Step 5: Stream from Claude ---
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: systemPrompt,
        messages: claudeMessages,
        stream: true,
      }),
    });

    if (!claudeRes.ok) {
      const errText = await claudeRes.text();
      console.error("Claude API error:", errText);
      throw new Error(`Claude API failed: ${claudeRes.status}`);
    }

    // --- Step 6: Transform Claude SSE to OpenAI-compatible format ---
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = decoder.decode(chunk, { stream: true });
        const lines = text.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const event = JSON.parse(jsonStr);

            if (event.type === "content_block_delta" && event.delta?.text) {
              const openAIChunk = {
                choices: [
                  {
                    delta: { content: event.delta.text },
                    index: 0,
                    finish_reason: null,
                  },
                ],
              };
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(openAIChunk)}\n\n`)
              );
            }

            if (event.type === "message_stop") {
              // Send sources metadata before [DONE]
              if (sources.length > 0) {
                const sourcesChunk = {
                  choices: [
                    {
                      delta: { content: "" },
                      index: 0,
                      finish_reason: "stop",
                      sources: sources,
                    },
                  ],
                };
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify(sourcesChunk)}\n\n`)
                );
              }
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            }
          } catch {
            // Skip malformed JSON lines
          }
        }
      },
    });

    const stream = claudeRes.body!.pipeThrough(transformStream);

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    console.error("underwriting-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
