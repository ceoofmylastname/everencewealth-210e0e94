## Plan: Add `/portal/advisor/presentation-v2` iframe route

### Files to add
1. **`public/presentation-v2.html`** — uploaded `everence-bridging-the-gap.html` copied verbatim into `public/` so it is served as a static asset at `/presentation-v2.html`.
2. **`src/pages/portal/advisor/PresentationV2.tsx`** — new page component:
   ```tsx
   export default function PresentationV2() {
     return (
       <iframe
         src="/presentation-v2.html"
         title="Everence — Bridging the Gap"
         allow="autoplay; fullscreen"
         allowFullScreen
         style={{
           position: "fixed",
           inset: 0,
           width: "100vw",
           height: "100vh",
           border: 0,
         }}
       />
     );
   }
   ```
   No header, footer, padding, or layout chrome.

### Routing
3. **`src/App.tsx`** — register the new route alongside the existing `/portal/advisor/presentation` route, wrapped in the same `<AdvisorRoute>` guard so only authenticated advisors/admins can view it:
   ```tsx
   <Route element={<AdvisorRoute />}>
     <Route path="/portal/advisor/presentation" element={<Presentation />} />
     <Route path="/portal/advisor/presentation-v2" element={<PresentationV2 />} />
   </Route>
   ```
   (Exact placement will mirror however the existing `/portal/advisor/presentation` route is currently registered — same guard, same nesting, no layout wrapper.)

### Auth guard parity
- Reuses `AdvisorRoute` from `src/components/portal/AdvisorRoute.tsx` — same pattern as `/portal/advisor/presentation`. Unauthenticated users → `/portal/login`. Non-advisors → `/portal/client/dashboard`.

### Notes
- `public/_routes.json` already excludes `/*.html` from the SPA fallback, so `/presentation-v2.html` will be served as a static file directly — no router interception.
- No edits to the uploaded HTML; it ships as-is.
- No new dependencies, no backend changes, no design tokens touched.
