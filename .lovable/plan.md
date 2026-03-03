

## Plan: Make SMS Consent Checkboxes Optional

Two changes in `src/components/contact/ContactForm.tsx`:

1. **Line 101** — Remove `smsTransactionalConsent` from the required fields validation check:
   - Change `!formData.privacy || !formData.smsTransactionalConsent` → `!formData.privacy`

2. **Lines 374-384** — Remove the `*` asterisk from the transactional consent label text and update the comment from "Required" to "Optional":
   - Remove ` *` at the end of the transactional consent text
   - Change comment from `{/* SMS Transactional Consent (Required) */}` to `{/* SMS Transactional Consent (Optional) */}`

Both SMS consent checkboxes will remain on the form but neither will block submission.

