

## Create Two New Edge Functions for Underwriting AI

### Overview
Two new edge functions that power the Underwriting AI chat page: one for processing/uploading carrier PDFs into a vector store, and one for RAG-based chat using those vectors.

### Secrets Required
The functions need these secrets (already configured): `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`. Three new secrets are needed: `PINECONE_API_KEY`, `PINECONE_INDEX_URL`, `LLAMA_PARSE_API_KEY`.

### Function 1: `underwriting-process`

**Path**: `supabase/functions/underwriting-process/index.ts`

Accepts multipart/form-data with `carrier_name` (string) and `file` (PDF blob).

Flow:
1. Parse multipart form data to extract carrier name and PDF file
2. Upload PDF to LlamaParse (`https://api.cloud.llamaindex.ai/api/parsing/upload`) with `LLAMA_PARSE_API_KEY`
3. Poll job status until complete (`/api/parsing/job/{id}`)
4. Fetch markdown result (`/api/parsing/job/{id}/result/markdown`)
5. Chunk markdown by section headers (`## ` or `# `)—each chunk prefixed with `{carrier_name} — {section_title}`
6. Embed each chunk via Gemini `gemini-embedding-001` (768 dims, `RETRIEVAL_DOCUMENT` task type) using `GEMINI_API_KEY`
7. Upsert vectors to Pinecone at `PINECONE_INDEX_URL` with metadata: `carrier`, `section`, `text`, `source_file`

CORS headers included. `verify_jwt = false` in config.toml (auth validated in code).

### Function 2: `underwriting-chat`

**Path**: `supabase/functions/underwriting-chat/index.ts`

Accepts JSON `{ question, messages }`.

Flow:
1. Embed `question` via Gemini `gemini-embedding-001` (768 dims, `RETRIEVAL_QUERY` task type)
2. Query Pinecone with `topK: 6`, `includeMetadata: true`
3. Filter matches below 0.75 score
4. Build a system prompt with the retrieved chunks as context
5. Call Anthropic `claude-sonnet-4-20250514` with streaming enabled using `ANTHROPIC_API_KEY`
6. Pipe SSE stream back in OpenAI-compatible format (`data: {"choices":[{"delta":{"content":"..."}}]}`)
7. Include source carrier names in a final `data:` event or as metadata for citation badges

CORS headers included. Returns `text/event-stream`.

### Config Changes

Add to `supabase/config.toml`:
```toml
[functions.underwriting-process]
verify_jwt = false

[functions.underwriting-chat]
verify_jwt = false
```

### New Secrets Needed
Before implementation, three new secrets must be added:
- `PINECONE_API_KEY`
- `PINECONE_INDEX_URL` (e.g., `https://your-index-xxxxx.svc.pinecone.io`)
- `LLAMA_PARSE_API_KEY`

### Files Created
- `supabase/functions/underwriting-process/index.ts`
- `supabase/functions/underwriting-chat/index.ts`

### Files Modified
- `supabase/config.toml` (append two new function entries)

