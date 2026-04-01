

## Two Changes: Email Notification to Agent + Best Time to Contact Field

### 1. Email notification via Resend when response card is submitted

**What:** After a successful response card submission, call a new edge function that sends an email to the selected agent with all the submission details.

**How:**
- Create a new edge function `send-response-card-notification/index.ts` modeled after the existing `send-strategy-form-notification` function
- The function receives the submission data + the agent's email
- It looks up the agent's email from the `advisors` table using the `assigned_advisor_id`
- Sends a branded HTML email via Resend (API key already configured) with all submission fields: name, phone, email, marital status, address, income, topics, availability, best contact times, comments
- In `src/pages/ResponseCard.tsx`, after the successful `.insert()`, invoke the edge function (fire-and-forget — don't block the success screen)

### 2. Add "Best Time to Contact" with two selectable time slots

**What:** Replace the current free-text "Best Day & Time to Meet" textarea on step 6 with a structured picker where the user selects **two preferred contact times** from predefined options.

**Options (tappable cards, select exactly 2):**
- Morning (8am – 12pm)
- Afternoon (12pm – 4pm)
- Evening (4pm – 7pm)
- Weekends Only

**Implementation:**
- Add `best_contact_times: string[]` to the form state (replaces `availability`)
- Add a database migration to add a `best_contact_times text[]` column to `response_card_submissions`
- Render as tappable card buttons (same style as meeting topics) with "Select 2 preferred times" instruction
- Validate that exactly 2 are selected before advancing
- Store in DB and include in the email notification
- Update the advisor dashboard (`ResponseCardSubmissions.tsx`) and admin dashboard (`AdminResponseCards.tsx`) to display the best contact times

### Files to create/update
- **New:** `supabase/functions/send-response-card-notification/index.ts` — Resend email to agent
- **Migration:** Add `best_contact_times` column to `response_card_submissions`
- **Edit:** `src/pages/ResponseCard.tsx` — add contact time picker, invoke notification edge function after submit
- **Edit:** `src/pages/portal/advisor/ResponseCardSubmissions.tsx` — display best contact times
- **Edit:** `src/pages/portal/admin/AdminResponseCards.tsx` — display best contact times

