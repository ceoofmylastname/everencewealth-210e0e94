

## Update Resend Email Addresses

### Problem
The portal invitation edge function (`send-portal-invitation`) is the only function still using the Resend sandbox address `onboarding@resend.dev`. Sandbox emails only deliver to verified addresses, which blocks production use. Additionally, the CRM Settings page displays a stale sender domain (`delsolprimehomes.com`).

### Changes

**1. `supabase/functions/send-portal-invitation/index.ts` (line 121)**
- Change `from: "Everence Wealth <onboarding@resend.dev>"` to `from: "Everence Wealth <notifications@everencewealth.com>"`
- This aligns with the pattern used by all other edge functions (which use `crm@notifications.everencewealth.com`)

**2. `src/pages/crm/admin/CrmSettings.tsx` (line 214)**
- Change the displayed sender from `crm@notifications.delsolprimehomes.com` to `crm@notifications.everencewealth.com`
- This is a UI-only fix to show the correct domain

### Prerequisites
The domain `notifications.everencewealth.com` (or `everencewealth.com`) must already be verified in Resend. Based on the fact that all other edge functions already use `crm@notifications.everencewealth.com`, this domain should already be configured. If not, the domain will need to be added and verified in the Resend dashboard before these emails will deliver.

### Summary of all sender addresses after this change
| Function | From Address |
|---|---|
| send-portal-invitation | `notifications@everencewealth.com` |
| send-lead-notification | `crm@notifications.everencewealth.com` |
| send-reminder-emails | `crm@notifications.everencewealth.com` |
| send-escalating-alarms | `crm@notifications.everencewealth.com` |
| check-claim-window-expiry | `crm@notifications.everencewealth.com` |
| check-contact-window-expiry | `crm@notifications.everencewealth.com` |
| reassign-lead | `crm@notifications.everencewealth.com` |
| create-crm-agent | `crm@notifications.everencewealth.com` |

