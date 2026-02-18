
# Show Advisor Info + First Message on Client Signup Success Screen

## What We're Changing

Right now, after a client creates their account, they see a plain "Account Created!" success screen with just a "Go to Login" and "Resend Verification" button. There's no advisor context at all.

The request is to enhance this success screen so the client:
1. **Sees their advisor's name** (and photo if available) immediately after account creation
2. **Can compose and send a first message** to their advisor right from the signup success screen — before they've even verified and logged in

Since the user hasn't verified their email yet (they're not logged in), we can't use the authenticated Supabase client to insert a `portal_messages` row. The cleanest solution is to store the message text locally and pass it as a URL parameter to the login page, where — after they log in — we check for a pending message and send it automatically. Alternatively, and more elegantly, we simply encourage them to go to login and send from there. However, the most seamless approach is:

**Show the advisor intro on the success screen** + **provide a pre-filled message button that takes them to the messages page after login**, since that doesn't require any unauthenticated writes.

## Approach

### Step 1 — Fetch advisor name during token validation

The invitation record already has `advisor_id` (which maps to `advisors.id`). We extend the `validateToken` query to join the `advisors` table and pull `first_name`, `last_name`, `title`, and `photo_url`.

```ts
// Extended query in validateToken()
const { data } = await supabase
  .from("client_invitations")
  .select(`
    id, first_name, last_name, email, phone, advisor_id, status, expires_at,
    advisors!advisor_id (
      first_name, last_name, title, photo_url
    )
  `)
  .eq("invitation_token", token)
  .maybeSingle();
```

The `advisors` table is referenced directly via the FK `client_invitations.advisor_id → advisors.id`, so this join works without needing authentication (the `client_invitations` table already has an anon-accessible policy for token validation per the existing memory).

### Step 2 — Store advisor info in state

Add a new `AdvisorPreview` interface and state variable to hold the advisor's display info alongside the invitation.

### Step 3 — Enhance the success screen

Update the `if (success)` render to show:

```
┌─────────────────────────────────────────────────┐
│  ✓  Account Created!                            │
│                                                 │
│  [Advisor Photo / Initial Avatar]               │
│  Your advisor is:                               │
│  [First Name Last Name]                         │
│  [Title / "Financial Advisor"]                  │
│                                                 │
│  "Once you verify your email and log in, you    │
│   can message [Advisor First Name] directly     │
│   from your portal."                            │
│                                                 │
│  [ Go to Login ]                                │
│  [ Resend Verification Email ]                  │
└─────────────────────────────────────────────────┘
```

The advisor card uses the same branded green styling as the rest of the dark-themed signup page.

### Step 4 — Pre-fill the message page (optional UX touch)

The "Go to Login" button can navigate to `/portal/login?next=/portal/client/messages` so after login the client lands directly on the messages page ready to send their first message. This is a simple `navigate()` change — no extra state management needed.

## Files Changed

- **`src/pages/portal/ClientSignup.tsx`** only — extend the token validation query to include advisor join, add `AdvisorPreview` state, update the success screen UI

No database changes. No new edge functions. No schema migrations.

## Key Details

- The `client_invitations` table's anon policy already allows reading by token (required for the current signup flow to work), so the advisor join will succeed without auth
- `advisor_id` on `client_invitations` is a FK to `advisors.id` — Supabase supports this join syntax directly
- Photo display: if `photo_url` is null, fall back to a branded initials avatar (same pattern as `ClientDashboard.tsx`)
- The success state is set only after `signUp()` succeeds, so the advisor info will already be loaded in state from the earlier `validateToken` call — no extra fetch needed
