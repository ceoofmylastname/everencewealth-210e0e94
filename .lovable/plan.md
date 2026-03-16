

## Fix 5 Failing Audit Items

### 1. `underwriting-chat` system prompt (lines 124-134)

Replace the current system prompt with an expanded version that includes three missing blocks:

- **STRICT OUTPUT RULES** — instructs Claude to only use provided context, cite carriers/sections, never fabricate guidelines
- **CLARIFYING QUESTIONS** — instructs Claude to ask a clarifying question (prefixed with `[CLARIFY]`) when the user's query is ambiguous or too broad, before answering
- **RESPONSE FORMAT** — specifies markdown formatting rules, comparison table format, and section citation style

The `[CLARIFY]` prefix convention allows the frontend to detect clarifying-question responses.

### 2. Frontend clarifying-question rendering (`UnderwritingAI.tsx`)

In the message rendering loop (~line 373), detect if an assistant message starts with `[CLARIFY]` (strip the tag for display). When detected:
- Render the message bubble with a **teal left border** (`border-l-4 border-teal-600`)
- Keep the rest of the styling the same

### 3. Dynamic textarea placeholder (`UnderwritingAI.tsx`)

At ~line 449, change the static placeholder to be computed:
- If the last message is an assistant message starting with `[CLARIFY]`, show `"Answer the clarifying question above..."`
- Otherwise show `"Ask about underwriting guidelines..."`

### Files modified
- `supabase/functions/underwriting-chat/index.ts` — expanded system prompt
- `src/pages/UnderwritingAI.tsx` — clarifying question border + dynamic placeholder

