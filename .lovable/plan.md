

## Add `KIE_API_KEY` secret + clarify intended use

### What I'll do
1. Use the `add_secret` tool to register `KIE_API_KEY` in Lovable Cloud (runtime secret, available to edge functions). This bypasses whatever error the Secrets UI is showing.
2. Confirm it appears in `fetch_secrets` after you paste the value.
3. (Optional, pending your answer below) Wire it into a new or existing edge function so it's actually used.

### What I need from you

**1. What is Kie for?** I want to make sure `KIE_API_KEY` is the right name and that we use it correctly. A few possibilities:
   - **kie.ai** (Veo 3 / Sora video generation API) — common use case, would replace or supplement Fal.ai for video
   - **Kie.so** or another service
   - Something else entirely

**2. What should it power?** Once added, do you want me to:
   - Just store it (you'll wire it up later)
   - Build a new edge function that uses it (tell me what it should do — generate video, images, etc.)
   - Replace an existing service (e.g., swap Fal.ai video generation for Kie)

### Common error troubleshooting (in case you want to retry the UI)

| Error | Fix |
|---|---|
| "Invalid secret name" | Use only `A-Z`, `0-9`, `_` — e.g., `KIE_API_KEY` |
| "Name reserved" | Don't start with `SUPABASE_` |
| "Already exists" | Click the existing row → Update instead of Add |
| "Value required" | Paste the actual key value, no whitespace |
| Generic save failure | Refresh the page once, then retry — sometimes the Secrets panel needs a reload after recent changes |

### Recommended path
Answer the two questions above, then I'll add the secret via tool and (if you want) wire it into an edge function in one shot.

