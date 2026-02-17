

# Fix Agent Invitation Email Button

## Problem
When agents receive invitation emails, clicking the "Set Your Password" button does not work. There are two root causes:

1. **Wrong redirect URL**: The `create-agent` backend function has a hardcoded app URL (`id-preview--...lovable.app`) that does not match the actual app domain (`...lovableproject.com`). When agents click the button, the authentication system redirects them to a non-existent or incorrect domain.

2. **Site URL configuration**: The authentication system needs to know the correct site URL to generate proper redirect links.

## Solution

### Step 1: Fix the hardcoded URL in the `create-agent` backend function
Update `supabase/functions/create-agent/index.ts` to dynamically determine the app URL from the request's `Origin` or `Referer` header, with a sensible fallback. This ensures the recovery link always redirects to the correct domain regardless of which environment (preview, published) is being used.

### Step 2: Add allowed redirect URL configuration
Ensure the authentication system's redirect URL allowlist includes both the preview and production domains so password reset redirects are not blocked.

### Technical Details

**File: `supabase/functions/create-agent/index.ts`**
- Replace the hardcoded `appUrl` constant with dynamic origin detection from the request headers
- Fallback to the preview URL if no origin header is present
- The `redirectTo` in `generateLink` will then point to the correct domain's `/portal/reset-password` page

**Before:**
```typescript
const appUrl = "https://id-preview--29324b25-4616-48ca-967b-28e362789bf6.lovable.app";
```

**After:**
```typescript
const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/$/, "") || "https://id-preview--29324b25-4616-48ca-967b-28e362789bf6.lovable.app";
const appUrl = origin;
```

This single change ensures that whichever domain the admin is using when they invite the agent, the email link will redirect back to that same domain's reset password page.

