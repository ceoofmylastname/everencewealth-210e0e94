
# Fix: Agent Invitation Email Logo + Reset Password Page Stuck

## Root Cause Analysis

### Bug 1 — Broken Logo in All Emails
Every edge function uses this logo URL in `brandedEmailWrapper`:
`https://everencewealth.com/logo-icon.png`

This domain either doesn't serve the image, blocks hotlinking, or the path doesn't exist. Email clients show a broken image icon. The correct, publicly accessible logo is:
`https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png`

This affects **8 edge functions** that all share the same `brandedEmailWrapper` pattern.

### Bug 2 — Reset Password Page Stuck on "Verifying your reset link..."
The flow when an agent clicks "Set Your Password":

1. Email link → Supabase auth server verifies token
2. Supabase redirects to `/portal/reset-password#access_token=...&type=recovery`
3. The Supabase JS client detects the hash and fires `PASSWORD_RECOVERY` via `onAuthStateChange`
4. Page sets `ready = true` and shows the form

**The race condition:** `onAuthStateChange` is registered inside a `useEffect` which runs AFTER the initial React render. If the Supabase client processes the URL hash before the listener is registered, the `PASSWORD_RECOVERY` event fires and is missed — `ready` stays `false` forever.

The current hash check `window.location.hash.includes("type=recovery")` should catch this, BUT it only works when the raw hash is still present. Once Supabase's client exchanges the token, it clears the hash, so if the effect runs after token exchange, that check also misses.

**The fix:** Add an immediate `supabase.auth.getSession()` check on mount. If Supabase already auto-established a session from the recovery URL (which it does), the session will exist and we can set `ready = true` right away — no event listener required.

---

## Changes Required

### 1. Fix Logo in All 8 Edge Functions

Replace `https://everencewealth.com/logo-icon.png` with the correct Google Storage URL in every `brandedEmailWrapper` function.

Files to update:
- `supabase/functions/create-agent/index.ts`
- `supabase/functions/send-portal-invitation/index.ts`
- `supabase/functions/check-contact-window-expiry/index.ts`
- `supabase/functions/check-claim-window-expiry/index.ts`
- `supabase/functions/reassign-lead/index.ts`
- `supabase/functions/send-escalating-alarms/index.ts`
- (+ any remaining 2 of the 8)

### 2. Fix PortalResetPassword.tsx — Race Condition

**Current logic (broken):**
```
useEffect → register onAuthStateChange → wait for PASSWORD_RECOVERY event
                                       → check window.location.hash
```

**New logic (fixed):**
```
useEffect → immediately call getSession()
          → if session exists → setReady(true) ✓
          → register onAuthStateChange as backup for PASSWORD_RECOVERY
          → check window.location.hash as secondary fallback
```

The `getSession()` call is the key fix. When Supabase redirects back with a recovery token in the hash, it auto-signs the user in. Calling `getSession()` on mount will immediately return that session, so we can show the form without waiting for any event.

---

## Files Changed

- `supabase/functions/create-agent/index.ts` — logo URL fix
- `supabase/functions/send-portal-invitation/index.ts` — logo URL fix
- `supabase/functions/check-contact-window-expiry/index.ts` — logo URL fix
- `supabase/functions/check-claim-window-expiry/index.ts` — logo URL fix
- `supabase/functions/reassign-lead/index.ts` — logo URL fix
- `supabase/functions/send-escalating-alarms/index.ts` — logo URL fix
- (+ remaining 2 edge function files)
- `src/pages/portal/PortalResetPassword.tsx` — race condition fix with `getSession()` fallback

No database changes required.
