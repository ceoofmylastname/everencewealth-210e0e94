

## Create `src/pages/UnderwritingAI.tsx` — Full-Page Chat Interface

### What
A new standalone page with a chat interface for insurance underwriting queries. Matches the existing portal design system (teal `#1A4D3E`, gold `hsla(51,78%,65%,1)`, white cards with `rounded-2xl`, deep shadows, Inter font).

### Components Within the File

1. **Header Bar**
   - Title "Underwriting AI" with a shield/brain icon
   - "Upload Guidelines" button (opens upload dialog)

2. **Empty State**
   - Centered icon + welcome text
   - 4 quick-prompt suggestion chips (e.g. "What are the diabetes guidelines for Mutual of Omaha?", "Compare term life underwriting for smokers", etc.)
   - Clicking a chip sends it as a message

3. **Chat Message Area**
   - ScrollArea with messages
   - User messages: right-aligned, teal background (`#1A4D3E`), white text
   - Assistant messages: left-aligned, white card with gray border
   - Source citation badges on assistant messages (small teal/gold pills showing carrier names parsed from response metadata)
   - Auto-scroll to bottom on new messages

4. **Typing Indicator**
   - Three bouncing dots animation when `isLoading` is true

5. **Input Bar**
   - Text input + send button (same pattern as `ClientMessages.tsx`)

6. **Upload Dialog**
   - shadcn Dialog with carrier name input + PDF file input
   - Submit POSTs to `underwriting-process` edge function via `supabase.functions.invoke`
   - Shows loading state, success toast

### API Integration

- **Chat**: POST to `underwriting-chat` via `supabase.functions.invoke("underwriting-chat", { body: { question, history } })`. Auth token is automatically included by the Supabase client.
- **Upload**: POST to `underwriting-process` via `supabase.functions.invoke("underwriting-process", { body: formData })` — carrier name + PDF file (base64-encoded).
- Streaming: Will use `fetch` with the full edge function URL + auth header to read a streaming response, since `supabase.functions.invoke` doesn't support streaming. Construct URL from `VITE_SUPABASE_URL`.

### Conversation History
- Maintain `messages` state array `{ role: 'user' | 'assistant', content: string, sources?: string[] }`
- Send last N messages as `history` to edge function

### File Created
- `src/pages/UnderwritingAI.tsx` — single self-contained file, no modifications to existing files

