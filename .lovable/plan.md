

## Plan: A2P SMS Compliance for Contact Form, Privacy Policy & Terms of Service

Based on the compliance checklist images, there are three areas to update to pass the Opt-In Form Review (8/8), Privacy Policy Review (7/7), and Terms of Service Review (7/7).

---

### 1. Contact Form (`src/components/contact/ContactForm.tsx`)

Update the form to match the A2P-compliant opt-in reference image:

- **Split the single privacy checkbox into three separate consent areas:**
  - **Transactional SMS consent checkbox** (required): "I consent to receive transactional messages from Everence Wealth at the phone number provided. Message frequency may vary. Message & Data rates may apply. Reply HELP for help or STOP to opt-out."
  - **Marketing SMS consent checkbox** (optional, unchecked by default): "I consent to receive marketing and promotional messages from Everence Wealth at the phone number provided. Message frequency may vary. Message & Data rates may apply. Reply HELP for help or STOP to opt-out."
  - **Privacy & Terms acknowledgment** (required): Keep existing privacy + terms links
- **Business name "Everence Wealth" clearly displayed** in both consent disclosures
- Update form state to track `smsTransactionalConsent` and `smsMarketingConsent` separately
- Marketing consent must NOT block form submission (optional only)
- Store consent flags in the `leads` table insert (add to comment or metadata)

### 2. Privacy Policy (`src/pages/PrivacyPolicy.tsx`)

Add two missing sections to pass 7/7:

- **SMS Opt-In Details** (new section 03): Explain what SMS messages users may receive, how consent is collected, how to opt out (STOP), how to get help (HELP), message frequency disclosure, and that message & data rates may apply
- **Mobile Information Sharing Statement** (add to existing section or new section): Explicitly state that mobile information/SMS consent is **not shared with third parties** (except SMS service providers)

### 3. Terms of Service (`src/pages/TermsOfService.tsx`)

Add missing sections to pass 7/7:

- **SMS Use Cases** (new section): Description of what SMS messages are used for (appointment reminders, account alerts, marketing with consent)
- **Opt-Out Instructions**: Reply STOP to any message to unsubscribe
- **Customer Support Contact**: Reply HELP or email info@everencewealth.com
- **Message & Data Rate Disclosure**: Standard carrier rates apply
- **Carrier Liability Disclaimer**: Carriers not liable for delayed/undelivered messages
- **Age Restriction (18+)**: Must be 18+ to use SMS services
- **Link to Privacy Policy**: Cross-reference to the privacy policy page

### Technical Notes

- No database migration needed — consent flags will be stored as part of the existing `comment` field or added as metadata
- The form validation logic changes: only transactional consent + privacy are required; marketing consent is optional
- All three pages keep their existing visual design (dark theme bento grid layout)

