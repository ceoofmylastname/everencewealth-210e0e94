
# Messaging Email Notifications — Bidirectional Alert System

## What We're Building

When either an advisor or a client sends a message, an email notification fires automatically to the **recipient** containing:
- A preview of the message content
- Who sent it
- A direct login link to the portal to reply

This uses a single new backend function `notify-portal-message` triggered from both `AdvisorMessages.tsx` and `ClientMessages.tsx` immediately after a message is successfully inserted.

---

## How It Works (Flow)

**Advisor sends message to Client:**
1. Advisor types and sends message in `/portal/advisor/messages`
2. Message inserts into `portal_messages` (already working)
3. Frontend calls `notify-portal-message` edge function with `{ conversation_id, message_content, sender_role: "advisor" }`
4. Edge function looks up the conversation → finds the `client_id` → gets client's email from `portal_users`
5. Resend delivers email to client: "Your advisor sent you a message" + message preview + "Login to Reply" button → `/portal/login`

**Client sends message to Advisor:**
1. Client types and sends in `/portal/client/messages`
2. Message inserts into `portal_messages` (already working)
3. Frontend calls `notify-portal-message` with `{ conversation_id, message_content, sender_role: "client" }`
4. Edge function looks up the conversation → finds the `advisor_id` → gets advisor's email from `portal_users`
5. Resend delivers email to advisor: "Your client sent you a message" + message preview + "Login to Reply" button → `/portal/login`

---

## Architecture

```text
[Advisor UI sends message]           [Client UI sends message]
         │                                      │
         ▼                                      ▼
portal_messages INSERT               portal_messages INSERT
         │                                      │
         ▼                                      ▼
invoke("notify-portal-message", {    invoke("notify-portal-message", {
  conversation_id,                     conversation_id,
  message_content,                     message_content,
  sender_role: "advisor"               sender_role: "client"
})                                   })
         │                                      │
         └──────────────┬───────────────────────┘
                        ▼
         notify-portal-message edge function
                        │
         ┌──────────────▼──────────────┐
         │  Look up conversation       │
         │  Determine recipient:       │
         │  - if sender=advisor →      │
         │    recipient = client       │
         │  - if sender=client  →      │
         │    recipient = advisor      │
         │                             │
         │  Fetch recipient email      │
         │  from portal_users          │
         └──────────────┬──────────────┘
                        │
                        ▼
              Resend API → Email sent
```

---

## Email Templates

### To Client (when advisor sends message)
```
Subject: [Advisor Name] sent you a message — Everence Wealth Portal

Header: Everence Wealth (branded green)

Hi [Client First Name],

Your advisor, [Advisor Name], has sent you a new message:

┌──────────────────────────────────────────────┐
│ "[Message content preview, up to 300 chars]" │
└──────────────────────────────────────────────┘

[Login to Reply]  ← button → https://everencewealth.lovable.app/portal/login

You received this because you have an active conversation in your Everence Wealth portal.
```

### To Advisor (when client sends message)
```
Subject: [Client Name] replied to your message — Everence Wealth Portal

Hi [Advisor First Name],

Your client, [Client Name], has sent you a new message:

┌──────────────────────────────────────────────┐
│ "[Message content preview, up to 300 chars]" │
└──────────────────────────────────────────────┘

[View Message]  ← button → https://everencewealth.lovable.app/portal/login

```

---

## Files Changed

### New File: `supabase/functions/notify-portal-message/index.ts`
- Accepts `{ conversation_id, message_content, sender_role }` in body
- Uses service role client to look up `portal_conversations` and join `portal_users` for both parties
- Determines recipient based on `sender_role`
- Sends branded Resend email via `portal@everencewealth.com`
- Returns `{ success: true }` — errors are logged but non-blocking (message is already delivered)
- Auth-protected: requires valid JWT from the caller

### Modified: `src/pages/portal/advisor/AdvisorMessages.tsx`
- After successful `portal_messages` insert in `handleSend()`, invoke `notify-portal-message` with `sender_role: "advisor"`
- Fire-and-forget (no await needed, won't block the UI)

### Modified: `src/pages/portal/client/ClientMessages.tsx`
- After successful `portal_messages` insert in `handleSend()`, invoke `notify-portal-message` with `sender_role: "client"`
- Fire-and-forget (no await needed, won't block the UI)

---

## Technical Details

### Edge Function Auth
- `verify_jwt = false` in config.toml
- Manually validates the JWT using `getClaims()` to get sender's identity
- Uses `SUPABASE_SERVICE_ROLE_KEY` admin client only for DB lookups (not for auth bypass)

### Email Sender
- `from: "Everence Wealth Portal <portal@everencewealth.com>"`
- Subject lines follow existing CRM convention

### Error Handling
- If recipient email is not found → log and return gracefully (message was already sent)
- If Resend fails → log error, return `{ success: false }` but don't throw (non-blocking)
- The message itself is never blocked by the notification system

### Login URL
- Points to `https://everencewealth.lovable.app/portal/login` (published URL, always valid)

### No Database Changes Required
- All data needed already exists: `portal_conversations`, `portal_messages`, `portal_users`
- No new tables or schema migrations needed
