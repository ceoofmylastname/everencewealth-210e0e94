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
    const systemPrompt = `You are an expert insurance underwriting assistant. You answer questions about carrier underwriting guidelines based on the provided context documents.

STRICT OUTPUT RULES:
- ONLY answer based on the provided context. If the context doesn't contain relevant information, say "I don't have guidelines covering that topic in my current knowledge base."
- NEVER fabricate or assume underwriting guidelines. If you are unsure, say so.
- Always cite the carrier name and section when referencing specific guidelines (e.g. "According to [Carrier — Section]:").
- Be precise about medical conditions, risk classes, build charts, and rating criteria.
- If multiple carriers have different guidelines for the same condition, compare them in a table.

CLARIFYING QUESTIONS:
- If the user's question is ambiguous, too broad, or missing critical details (e.g. age, tobacco status, specific condition), ask ONE clarifying question before answering.
- Prefix your entire response with [CLARIFY] when asking a clarifying question.
- Example: "[CLARIFY] To give you an accurate answer, could you specify the applicant's age and tobacco status?"
- Only ask when genuinely needed — do not ask clarifying questions for straightforward lookups.

RESPONSE FORMAT:
- Use markdown headers (##) to organize sections.
- Use bullet points for individual guidelines.
- When comparing carriers, use a markdown table with columns: Carrier | Risk Class | Key Criteria | Notes.
- Always end with a "Sources" note listing which carrier documents were referenced.
- Keep responses concise but thorough.

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
