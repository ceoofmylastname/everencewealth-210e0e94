

## Fix: Agent Invitation Email Not Sending

### Problem
The `create-agent` edge function silently ignores email delivery failures:
1. The Resend API response is never checked for errors (status code, error messages)
2. Any exception is caught and only logged to console (which doesn't persist well in edge function logs)
3. The function returns `success: true` even when the email fails

### Solution

**File: `supabase/functions/create-agent/index.ts`**

1. **Check the Resend API response** for errors after the fetch call -- if Resend returns a non-2xx status, capture the error details
2. **Return email status in the response** so the UI can show whether the invitation was sent or failed:
   - `{ success: true, portal_user_id: "...", invitation_sent: true }` on success
   - `{ success: true, portal_user_id: "...", invitation_sent: false, invitation_error: "Domain not verified" }` on email failure
3. **Log the full Resend response** so failures are visible in the function logs
4. **Fix the redirect URL** on line 153 -- the current code has a convoluted URL replacement that may produce an incorrect reset link

**File: `src/pages/portal/admin/AdminAgentNew.tsx`**

5. **Show a warning toast** if the agent was created but the invitation email failed, so you know to resend or troubleshoot:
   - Success + email sent: green toast "Agent created and invitation sent"
   - Success + email failed: yellow warning toast "Agent created but invitation email failed: [reason]"

### Why the Email Likely Failed
The Resend `from` address is `portal@everencewealth.com`. If the `everencewealth.com` domain hasn't been verified in your Resend account, Resend rejects the email silently. The fix will surface this error so you can see exactly what went wrong.
