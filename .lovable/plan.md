## Plan

The route `/portal/advisor/presentation-v2` already exists from the previous turn (registered in `src/App.tsx` under the `<AdvisorRoute>` guard, rendering `src/pages/portal/advisor/PresentationV2.tsx`). Two things still need to happen:

### 1. Upload the real HTML
`public/presentation-v2.html` is currently a placeholder. The file `everence-bridging-the-gap.html` referenced in the message is **not actually attached to this turn**. Please re-attach it — once attached I will copy it verbatim to `public/presentation-v2.html`, overwriting the placeholder. No edits to the HTML contents.

### 2. Update iframe attributes
Update `src/pages/portal/advisor/PresentationV2.tsx` to match the exact spec:
- `allow="autoplay; fullscreen; encrypted-media"` (currently missing `encrypted-media`)
- `allowFullScreen`
- `style={{ border: "none", display: "block", width: "100vw", height: "100vh", position: "fixed", inset: 0 }}`
- No header / footer / sidebar / padding (already true — page is mounted outside any layout wrapper, only wrapped in `<AdvisorRoute>`).

### 3. Deploy
Frontend changes only — deployment requires you to click **Publish → Update** in the editor. I cannot trigger a production publish from here. After you re-attach the HTML and I apply the two edits above, hit Update to push live.

### Technical notes
- Auth guard: `<AdvisorRoute>` from `src/components/portal/AdvisorRoute.tsx`, identical wrapper used by `/portal/advisor/presentation`.
- Static serving: `public/_routes.json` already excludes `/*.html` from SPA fallback, so `/presentation-v2.html` is served directly by Cloudflare Pages.
- No router, dependency, backend, or design-token changes.
