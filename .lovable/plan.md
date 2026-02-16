

## Remove Email Domain Restriction from Add Agent Form

### What Changes
The "Add New Agent" form currently requires emails to end with `@everencewealth.com`. This restriction will be removed so admins can add agents with any email address. The agent will then receive a Resend-powered invitation email to log in.

### Technical Details

**File: `src/pages/portal/admin/AdminAgentNew.tsx`**

1. Remove the email domain validation check (lines 46-49) that blocks non-`@everencewealth.com` emails
2. Remove the placeholder hint text "Must be an @everencewealth.com email" below the email input
3. Update the email input placeholder from `name@everencewealth.com` to a generic `agent@example.com`

No other files or database changes are needed -- the invitation sending logic and Resend integration already support any email address.

