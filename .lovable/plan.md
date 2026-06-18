# Add LeadConnector chat widget + hide opt-in forms

## 1. Embed the chat widget site-wide
Add the LeadConnector loader script to `index.html`, just before `</body>` so it loads on every route:

```html
<script
  src="https://widgets.leadconnectorhq.com/loader.js"
  data-resources-url="https://widgets.leadconnectorhq.com/chat-widget/loader.js"
  data-widget-id="6a344e321beacbb27327f210"
  data-source="WEB_USER"
></script>
```

Because it's in `index.html`, it auto-loads on every page (Home, strategies, blog, landing pages, etc.).

## 2. Hide all client-facing opt-in forms (revertible)
Add a single feature flag in `src/lib/featureFlags.ts`:

```ts
export const HIDE_CLIENT_OPT_IN_FORMS = true; // flip to false to restore forms
```

Each affected form component checks this flag at render time. When `true`, it returns a small replacement block:

> "Tap the chat widget in the lower-right corner to get in touch with our team."

When flipped back to `false`, every form re-appears exactly as it was — **no form code is deleted**, only short-circuited.

### Components wrapped
| File | What it is |
|---|---|
| `src/components/strategies/shared/StrategyFormCTA.tsx` | Powers IUL, TFR, Whole Life, Asset Protection CTAs |
| `src/components/landing/LeadCaptureForm.tsx` | Landing page modal |
| `src/components/landing/LeadForm.tsx` | Inline landing lead form |
| `src/pages/OptIn.tsx` | Standalone `/opt-in` page |
| `src/pages/Contact.tsx` (ContactForm section) | Contact page form |
| `src/pages/ResponseCard.tsx` | Public response-card wizard |
| `src/pages/FinancialAssessment.tsx` (if present) | Lead capture wizard |
| Any "Sticky CTA" / "Get Blueprint" buttons that open these modals | Hidden when flag is on |

### Out of scope (NOT hidden — internal/portal/non-prospect flows)
- `/portal/**` (advisor & client portals — internal auth)
- `/broker-training`, `/contracting`, `/recruit*` (recruitment, not client opt-in)
- Auth/login/signup forms
- `/socorro*` workshop registration (separate event flow)
- CRM admin forms

If you want any of the "out of scope" items also hidden, say which and I'll add them.

## 3. Revert path (future)
1. Open `src/lib/featureFlags.ts`, set `HIDE_CLIENT_OPT_IN_FORMS = false`.
2. Remove the `<script>` block from `index.html`.

That's the entire rollback — no migrations, no rewrites.

## Technical notes
- The widget script is rendered once globally in `index.html`, so it survives SPA navigation without re-mounting.
- The replacement message uses existing typography tokens (no new styles).
- Flag lives in code (not env) so it's visible in git history and trivially toggled.
