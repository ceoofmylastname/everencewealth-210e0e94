

## Brand the Response Card Notification Email

### What changes
Rewrite the `send-response-card-notification` edge function to use the same `brandedEmailWrapper` template used by the workshop confirmation emails — with the Everence Wealth logo, Georgia serif font, gold accents (`#C5A059`), green header (`#1A4D3E`), and the San Francisco address footer.

### Implementation

**`supabase/functions/send-response-card-notification/index.ts`** — full rewrite of the email HTML section:

1. Add the `brandedEmailWrapper()` function (identical to the one in `send-workshop-confirmation`)
2. Replace the inline `emailHtml` with a call to `brandedEmailWrapper("New Response Card Lead", innerHtml)`
3. Build `innerHtml` using inline table styles (not CSS classes) matching the workshop email pattern:
   - Greeting: "Hi {advisor name}, a new lead has been assigned to you"
   - Client info displayed as styled field rows: name, email (linked), phone (linked), marital status, address, income range, consultation preference
   - Best contact times in gold highlight pill
   - Meeting topics as a bulleted list
   - Availability and comments if present
4. Update the `from` address to match workshop emails: `notifications@everencewealth.com`
5. Keep all existing logic (advisor lookup, error handling, CORS) unchanged

### Result
Both the response card notification and workshop confirmation emails will share the same branded wrapper — logo, colors, fonts, and footer — giving advisors a consistent, professional experience.

### File
- `supabase/functions/send-response-card-notification/index.ts` — rewrite email template (~60 lines changed)

