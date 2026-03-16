

## Fix: "[DONE]" displayed instead of AI response

### Root Cause (two bugs)

1. **Format mismatch**: The edge function (`underwriting-chat`) sends OpenAI-compatible SSE with content at `choices[0].delta.content`, but the frontend parser at lines 119-124 reads `parsed.content` — which is always undefined, so no tokens are ever captured.

2. **`[DONE]` leaks into content**: When the stream sends `data: [DONE]`, `JSON.parse("[DONE]")` throws. The `catch` block (line 122-124) blindly appends `line.slice(6)` (i.e. the literal string `[DONE]`) to `assistantContent`.

Both bugs exist in two duplicate streaming blocks (lines ~108-138 and ~211-239).

### Fix (one file: `src/pages/UnderwritingAI.tsx`)

In both streaming parser blocks:

1. **Skip `[DONE]`** — before attempting JSON.parse, check `if (jsonStr === "[DONE]") continue;`
2. **Read the correct path** — change `parsed.content` to `parsed.choices?.[0]?.delta?.content`
3. **Read sources correctly** — change `parsed.sources` to `parsed.choices?.[0]?.sources`
4. **Don't append raw text on parse failure** — remove the `catch` fallback that appends raw SSE data

### Affected file
- `src/pages/UnderwritingAI.tsx` — fix both streaming blocks (~lines 116-126 and ~218-228)

