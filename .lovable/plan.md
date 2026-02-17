

# Unify All System Emails with Everence Wealth Branding

## Overview
There are **8 edge functions** that send emails via Resend. Currently, they use inconsistent designs -- some have no logo, mismatched color schemes (blue headers, generic Arial fonts), and lack the Everence brand identity. This plan creates a **shared email template** and applies it uniformly across all functions.

## Current State

| Function | Purpose | Current Design Issues |
|---|---|---|
| `create-agent` | Advisor portal invitation | No logo, plain green header, no footer address |
| `create-crm-agent` | CRM agent welcome | No logo, **navy blue** header (#1a365d), no brand colors |
| `send-portal-invitation` | Client portal invite | Has logo, good branding (already closest to target) |
| `reassign-lead` | Lead reassignment notice | No logo, **blue** header (#1E40AF), minimal footer |
| `send-lead-notification` | New lead broadcast | No logo, **gold gradient** header, no brand header |
| `send-escalating-alarms` | Escalating reminders | No logo, varies by urgency, generic footer |
| `send-reminder-emails` | Calendar reminders | No logo, gold gradient, minimal footer |
| `check-claim-window-expiry` | Admin: unclaimed lead alert | No logo, **red** header, CSS classes (unreliable in email) |
| `check-contact-window-expiry` | Admin: contact SLA breach | No logo, **amber** header, CSS classes (unreliable in email) |

## Unified Email Template Design

Every email will share this common structure:

```text
+--------------------------------------------------+
|  [Logo Icon]  EVERENCE WEALTH                    |
|  Tagline (varies by email type)                  |
|  Background: Evergreen #1A4D3E                   |
+--------------------------------------------------+
|                                                  |
|  [Content area - specific to each email]         |
|                                                  |
|  [CTA Button - Evergreen or contextual color]    |
|                                                  |
+--------------------------------------------------+
|  (c) 2026 Everence Wealth. All rights reserved.  |
|  455 Market St Ste 1940 PMB 350011,              |
|  San Francisco, CA 94105                         |
+--------------------------------------------------+
```

**Brand Constants:**
- Logo: `https://everencewealth.com/logo-icon.png` (48x48)
- Primary: Evergreen `#1A4D3E`
- Accent: Gold `#C5A059`
- Background: Cream `#F0F2F1`
- Text: Slate `#4A5565`
- Font: Georgia, serif (matching `send-portal-invitation` template)

## Implementation Plan

### Step 1: Create shared email wrapper utility
Create `supabase/functions/shared/email-template.ts` with a `wrapEmailHtml()` function that provides the branded header (with logo) and footer, accepting the inner content and a subtitle string.

### Step 2: Update each edge function (8 functions)

1. **`create-agent/index.ts`** -- Replace the inline HTML with the shared wrapper. Keep the password reset link as the CTA.

2. **`create-crm-agent/index.ts`** -- Rewrite `generateWelcomeEmailHtml()` to use the shared wrapper. Replace the navy blue scheme with Evergreen branding.

3. **`send-portal-invitation/index.ts`** -- Already well-branded; minor alignment to use the shared wrapper for consistency.

4. **`reassign-lead/index.ts`** -- Replace inline blue-themed HTML with the shared wrapper. Keep lead details table.

5. **`send-lead-notification/index.ts`** -- Update `generateEmailHtml()`, `generateUrgentEmailHtml()`, and `generateAdminUnclaimedEmailHtml()` to wrap content with the branded header/footer. Urgent emails will keep their red accent but within the branded frame.

6. **`send-escalating-alarms/index.ts`** -- Add branded header with logo above the existing urgency-level content.

7. **`send-reminder-emails/index.ts`** -- Update `generateEmailHtml()` to use the branded wrapper instead of the plain gold header.

8. **`check-claim-window-expiry/index.ts`** and **`check-contact-window-expiry/index.ts`** -- Replace CSS `<style>` blocks (unreliable in email clients) with inline styles and the branded wrapper.

### Key Design Rules
- All styles are **inline** (no `<style>` blocks) for maximum email client compatibility
- Logo image is always present in the header
- CTA buttons use `border-radius: 8px`, `padding: 14px 32px`, `font-weight: 600`
- Urgent/alert emails: branded Evergreen header stays, but the content area uses red/amber accent borders to convey urgency
- Footer always includes copyright year, company name, and full address

### Files to Modify
- `supabase/functions/shared/email-template.ts` (new)
- `supabase/functions/create-agent/index.ts`
- `supabase/functions/create-crm-agent/index.ts`
- `supabase/functions/send-portal-invitation/index.ts`
- `supabase/functions/reassign-lead/index.ts`
- `supabase/functions/send-lead-notification/index.ts`
- `supabase/functions/send-escalating-alarms/index.ts`
- `supabase/functions/send-reminder-emails/index.ts`
- `supabase/functions/check-claim-window-expiry/index.ts`
- `supabase/functions/check-contact-window-expiry/index.ts`

All 8 edge functions will be redeployed after changes.

