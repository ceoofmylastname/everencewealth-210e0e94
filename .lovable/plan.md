
# Fix: "Create Your Account" Button Points to Wrong URL

## The Problem

In `supabase/functions/send-portal-invitation/index.ts`, the signup link is built dynamically using the `Origin` or `Referer` HTTP header from the request:

```ts
const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/[^/]*$/, "") || "";
const portalSignupUrl = `${origin}/portal/signup?token=${invitation.invitation_token}`;
```

When the advisor clicks "Send Invitation" from the portal, the browser sends the request from wherever they are viewing the app. If they are on the **preview environment** (`https://id-preview--29324b25-4616-48ca-967b-28e362789bf6.lovable.app`), the generated link sent to the client will point to that preview URL — which is:

1. Not accessible to clients (it's an internal dev URL)
2. May time out or show auth errors
3. Will be different every time the preview rebuilds

The `supabase.functions.invoke()` call on the frontend doesn't pass a reliable origin for email generation purposes.

## The Fix

Replace the dynamic origin detection with the **hardcoded published production URL**:

```ts
const portalSignupUrl = `https://everencewealth.lovable.app/portal/signup?token=${invitation.invitation_token}`;
```

This is correct because:
- Client-facing email links must **always** point to the live published site
- The token itself is environment-agnostic (it's stored in the database and works regardless of which URL is used)
- The published URL is the only URL clients should ever interact with
- This is consistent with how other notification emails in the system already handle links

## File Changed

- `supabase/functions/send-portal-invitation/index.ts` — replace dynamic origin with hardcoded `https://everencewealth.lovable.app`

No database changes. No frontend changes. Deploy takes ~30 seconds automatically.
