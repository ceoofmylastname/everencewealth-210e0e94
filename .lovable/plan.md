## Contact form compliance update

**File:** `src/components/contact/ContactForm.tsx`

### Changes

1. **SMS consent checkboxes (transactional + marketing)** — confirm optional.
   - They already aren't part of validation, but the surrounding bordered card visually implies "required." Keep them optional in logic; no copy change required beyond what's already there.

2. **Remove the Privacy/Terms checkbox entirely** (lines ~393–411).
   - Delete the `<Checkbox id="privacy">` and the "I agree to the" label wrapper.
   - Remove `privacy` from form validation in the submit handler (line 101) so submission no longer requires it.
   - Remove `privacy: false` from initial state and the `privacy` field from the type if unused elsewhere.

3. **Add centered Privacy Policy & Terms & Conditions links** directly above the Submit button:
   ```tsx
   <p className="text-center text-sm text-muted-foreground">
     <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
     {' & '}
     <Link to="/terms" className="text-primary hover:underline">Terms & Conditions</Link>
   </p>
   ```
   No checkbox, no asterisk, no "I agree" wording.

### Out of scope
- SMS consent copy, layout of the bordered consent card, submit button styling, all other form fields.
- Translation files (`t.form.fields.privacy`) — leave keys in place; just stop rendering them.
