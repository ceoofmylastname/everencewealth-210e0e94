

## Update Portal Invitation Email Branding

### Current State
- The sender address is **already** `notifications@everencewealth.com` -- no change needed
- `RESEND_API_KEY` is **already** configured in secrets -- no change needed
- The email template needs branding updates (logo, colors, footer)

### Changes to `supabase/functions/send-portal-invitation/index.ts`

**Update the `emailHtml` template** (lines 83-111):

1. **Add logo image** at the top of the email header:
   - `<img src="https://everencewealth.com/logo-icon.png" alt="Everence Wealth" width="48" height="48" />`

2. **Update brand colors**:
   - Headings: change `#1a2332` to Evergreen `#1A4D3E`
   - CTA button: change `#2d5a3d` to `#1A4D3E` for consistency

3. **Add physical address in footer**:
   - `455 Market St Ste 1940 PMB 350011, San Francisco, CA 94105`

4. **Remove the unused `signupUrl` variable** (line 73) -- only `portalSignupUrl` is used

### What Does NOT Need to Change
- Sender email (`notifications@everencewealth.com`) is already correct
- `RESEND_API_KEY` secret is already set
- CRM email functions use `crm@notifications.everencewealth.com` which is a separate subdomain and unrelated to this task

### Domain Verification Note
For production delivery from `notifications@everencewealth.com`, the domain `everencewealth.com` must be verified in the Resend dashboard. This is an external step outside of Lovable -- you would add DNS records (SPF, DKIM, DMARC) in your domain registrar as directed by Resend's domain verification flow.

