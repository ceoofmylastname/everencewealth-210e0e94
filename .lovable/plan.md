

## Update Socorro Booking Confirmation Email

**Goal**: Replace "Questions? Reply to this email." with a line that shows the advisor's name and email (if available), so users can contact their advisor directly.

### Change

**File**: `supabase/functions/register-socorro-booking/index.ts`

1. After verifying the slot and before building the email HTML, query `socorro_workshop_advisors` by `advisor_id` to fetch the advisor's `first_name`, `last_name`, and `email`.

2. Replace the closing paragraph (lines 124-126):
   - **If advisor has an email**: "Questions? Send an email to {First Last} at {email}."
   - **If advisor has no email**: "Questions? Reply to this email." (fallback, same as current)

3. Use the fetched advisor name instead of the client-passed `advisor_name` for consistency.

### Example output in the email

> Questions? Send an email to Steven Rosenberg at steven@example.com.
> — Everence Wealth

No database changes needed. The edge function will be redeployed after the update.

