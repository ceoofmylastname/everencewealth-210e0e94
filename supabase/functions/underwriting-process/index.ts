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

    // --- Parse JSON body ---
    const { carrier_name: carrierName, file_name: fileName, file_base64 } = await req.json();

    if (!carrierName || !file_base64 || !fileName) {
      return new Response(
        JSON.stringify({ error: "carrier_name, file_name, and file_base64 are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Decode base64 to binary
    const binaryStr = atob(file_base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    const fileBlob = new Blob([bytes], { type: "application/pdf" });

    const LLAMA_PARSE_API_KEY = Deno.env.get("LLAMA_PARSE_API_KEY")!;
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
    const PINECONE_API_KEY = Deno.env.get("PINECONE_API_KEY")!;
    const PINECONE_INDEX_URL = Deno.env.get("PINECONE_INDEX_URL")!;

    // --- Step 1: Upload PDF to LlamaParse ---
    console.log("Uploading PDF to LlamaParse...");
    const uploadForm = new FormData();
    uploadForm.append("file", fileBlob, fileName);

    const uploadRes = await fetch(
      "https://api.cloud.llamaindex.ai/api/parsing/upload",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${LLAMA_PARSE_API_KEY}` },
        body: uploadForm,
      }
    );

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error("LlamaParse upload error:", errText);
      throw new Error(`LlamaParse upload failed: ${uploadRes.status}`);
    }

    const { id: jobId } = await uploadRes.json();
    console.log("LlamaParse job created:", jobId);

    // --- Step 2: Poll for completion ---
    let status = "PENDING";
    let attempts = 0;
    const maxAttempts = 120; // 10 minutes max

    while (status !== "SUCCESS" && attempts < maxAttempts) {
      await new Promise((r) => setTimeout(r, 5000));
      attempts++;

      const statusRes = await fetch(
        `https://api.cloud.llamaindex.ai/api/parsing/job/${jobId}`,
        { headers: { Authorization: `Bearer ${LLAMA_PARSE_API_KEY}` } }
      );
      const statusData = await statusRes.json();
      status = statusData.status;
      console.log(`Poll attempt ${attempts}: ${status}`);

      if (status === "ERROR") {
        throw new Error("LlamaParse processing failed");
      }
    }

    if (status !== "SUCCESS") {
      throw new Error("LlamaParse timed out");
    }

    // --- Step 3: Fetch markdown result ---
    const mdRes = await fetch(
      `https://api.cloud.llamaindex.ai/api/parsing/job/${jobId}/result/markdown`,
      { headers: { Authorization: `Bearer ${LLAMA_PARSE_API_KEY}` } }
    );
    const { markdown } = await mdRes.json();
    console.log("Markdown fetched, length:", markdown.length);

    // --- Step 4: Chunk by section headers ---
    const lines = markdown.split("\n");
    const chunks: { section: string; text: string }[] = [];
    let currentSection = "Introduction";
    let currentText: string[] = [];

    for (const line of lines) {
      const headerMatch = line.match(/^(#{1,3})\s+(.+)/);
      if (headerMatch) {
        if (currentText.length > 0) {
          const text = currentText.join("\n").trim();
          if (text.length > 50) {
            chunks.push({ section: currentSection, text });
          }
        }
        currentSection = headerMatch[2].trim();
        currentText = [];
      } else {
        currentText.push(line);
      }
    }
    // Push remaining
    if (currentText.length > 0) {
      const text = currentText.join("\n").trim();
      if (text.length > 50) {
        chunks.push({ section: currentSection, text });
      }
    }

    console.log(`Created ${chunks.length} chunks`);

    // --- Step 5: Embed chunks with Gemini ---
    const BATCH_SIZE = 20;
    const allVectors: {
      id: string;
      values: number[];
      metadata: { carrier: string; section: string; text: string; source_file: string };
    }[] = [];

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      const texts = batch.map(
        (c) => `${carrierName} — ${c.section}\n\n${c.text}`
      );

      const batchEmbedRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:batchEmbedContents?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requests: texts.map((t) => ({
              model: "models/gemini-embedding-001",
              content: { parts: [{ text: t }] },
              outputDimensionality: 768,
              taskType: "RETRIEVAL_DOCUMENT",
            })),
          }),
        }
      );

      if (!batchEmbedRes.ok) {
        const errText = await batchEmbedRes.text();
        console.error("Gemini embed error:", errText);
        throw new Error(`Gemini embedding failed: ${batchEmbedRes.status}`);
      }

      const embedData = await batchEmbedRes.json();
      const embeddings = embedData.embeddings;

      for (let j = 0; j < batch.length; j++) {
        const chunkIndex = i + j;
        allVectors.push({
          id: `${carrierName.toLowerCase().replace(/\s+/g, "-")}-${chunkIndex}`,
          values: embeddings[j].values,
          metadata: {
            carrier: carrierName,
            section: batch[j].section,
            text: batch[j].text.substring(0, 8000),
            source_file: file.name,
          },
        });
      }
    }

    // --- Step 6: Upsert to Pinecone ---
    console.log(`Upserting ${allVectors.length} vectors to Pinecone...`);
    const PINECONE_BATCH = 100;

    for (let i = 0; i < allVectors.length; i += PINECONE_BATCH) {
      const batch = allVectors.slice(i, i + PINECONE_BATCH);
      const upsertRes = await fetch(`${PINECONE_INDEX_URL}/vectors/upsert`, {
        method: "POST",
        headers: {
          "Api-Key": PINECONE_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ vectors: batch }),
      });

      if (!upsertRes.ok) {
        const errText = await upsertRes.text();
        console.error("Pinecone upsert error:", errText);
        throw new Error(`Pinecone upsert failed: ${upsertRes.status}`);
      }
    }

    console.log("All vectors upserted successfully");

    return new Response(
      JSON.stringify({
        success: true,
        carrier: carrierName,
        chunks_processed: allVectors.length,
        source_file: file.name,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("underwriting-process error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
