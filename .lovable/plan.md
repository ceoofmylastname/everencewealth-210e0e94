## Goal
Remove the LeadConnector chat widget and re-activate all opt-in forms (including the `/contact` "Get in Touch" page) to their pre-widget state.

## Changes

1. **`src/lib/clientFormsFlag.ts`** — flip `HIDE_CLIENT_OPT_IN_FORMS` from `true` to `false`. This single switch automatically restores:
   - `src/components/landing/LeadCaptureForm.tsx`
   - `src/components/landing/LeadForm.tsx`
   - `src/components/strategies/shared/StrategyFormCTA.tsx`
   - `src/pages/Assessment.tsx`
   - `src/pages/OptIn.tsx`
   - `src/pages/ResponseCard.tsx`
   - The `/contact` route in `src/App.tsx` (renders real `<Contact />` again)

2. **`index.html`** — remove the LeadConnector `<script src="https://widgets.leadconnectorhq.com/loader.js" ...>` tag added earlier.

3. **`build.sh`** — remove the post-SSG "Injecting LeadConnector chat widget" block (the `WIDGET_TAG` export + `find dist -type f -name '*.html'` loop) so generated static pages no longer get the widget injected.

4. **Leave in place (harmless, reusable later):**
   - `src/components/shared/UseChatWidgetNotice.tsx` — unused once flag is false, but kept for future re-enable.
   - `src/lib/clientFormsFlag.ts` itself — kept so the kill-switch remains available.
   - The conditional import in `src/App.tsx` — still works correctly when flag is false.

## Verification
- Confirm `/contact` renders the full Contact page (hero, office info, FAQ, mobile sticky contact).
- Confirm strategy CTAs, `/opt-in`, `/assessment`, `/response-card` show their real forms.
- Confirm no chat bubble appears in the lower-right on the deployed site after next build.

## To revert again later
Flip `HIDE_CLIENT_OPT_IN_FORMS` back to `true`, re-add the `<script>` to `index.html`, and re-add the build.sh injection block.