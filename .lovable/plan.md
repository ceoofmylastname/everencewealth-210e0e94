## Goal
Add a view-only "Tax History" resource page to the Advisor Portal at `/portal/advisor/resources/tax-history`, linked from the Resources sidebar group. The page renders the uploaded Marginal Tax Rates flyer with right-click/drag/save disabled, plus editorial commentary sections.

## Files to add / change

**New**
- `public/resources/everence-tax-history-flyer.png` — copied from the uploaded `The_History_of_Marginal_tax_rates.png`.
- `src/pages/portal/advisor/resources/TaxHistory.tsx` — the new page.

**Edit**
- `src/components/portal/PortalLayout.tsx` — add a new sidebar item under the existing `Resources` group:
  `{ label: "Tax History", icon: TrendingUp, href: "/portal/advisor/resources/tax-history" }`
- `src/App.tsx` — lazy-import `TaxHistory` and register `<Route path="resources/tax-history" element={<TaxHistory />} />` inside the existing advisor route group (same `AdvisorRoute` + `PortalLayout` guard chain used by `tools`, `training`, `marketing`).

## Page structure (TaxHistory.tsx)

Wrapper `<div onContextMenu={preventDefault}>` + `useEffect` that adds a document-level `contextmenu` listener on mount and removes it on unmount. `<Helmet>` with `<meta name="robots" content="noindex,nofollow" />`.

Sticky sub-nav (anchors: Flyer / Why It Matters / Timeline / Talking Points), smooth scroll via `scroll-behavior: smooth` on a section container.

1. **Hero** — dark gradient (charcoal → emerald `#0F3B2E` → gold `#C9A24B` accent line), gold pill badge "EVERENCE WEALTH RESOURCE", serif H1 "112 Years of Tax History. One Window That's Closing.", cream subhead.
2. **Flyer** — centered `<img src="/resources/everence-tax-history-flyer.png">` max-w 1400px, `object-contain`, 1px gold border + soft shadow. Attributes: `draggable={false}`, `onDragStart={preventDefault}`, `onContextMenu={preventDefault}`, inline style `userSelect:'none', WebkitUserDrag:'none', pointerEvents:'none'`. Absolutely-positioned transparent overlay `<div>` on top to swallow selection while leaving the image visible.
3. **Why This Matters** — 3 glassmorphic cards (gold top border, inner shadow) with the supplied "Discount / Trigger / Strategy" copy verbatim.
4. **Timeline** — parchment-cream background, 2-column serif reading layout on desktop, single column on mobile, long-form paragraphs verbatim from the task (1913→Today).
5. **Talking Points** — muted gray card section with the three advisor scripts verbatim.
6. **Source strip** — small footer paragraph with the sources/disclaimer text verbatim.

## Anti-save lockdown
- No download / print / "save as" buttons anywhere.
- Image is non-draggable, non-right-clickable, non-selectable; transparent overlay sits above it.
- Page-level `contextmenu` listener blocks right-click everywhere in the route.
- No `@media print` styles added.

## Design tokens
- Reuse existing portal Tailwind classes; inline brand hex (emerald `#0F3B2E`, gold `#C9A24B`, cream `#F5EFE0`, charcoal `#1A1A1A`) only where semantic tokens don't exist.
- Serif headings via `font-serif` (matches existing brand serif usage); sans body via default.
- shadcn `Card` for the Why-It-Matters and Talking-Points blocks.
- Mobile-first; grids collapse below `md`.

## Auth
Route is nested under the same `AdvisorRoute` + `PortalLayout` group as other Resources pages, so existing advisor auth gate applies automatically. No new guard needed.

## Out of scope
No DB, no edge functions, no analytics events, no i18n strings added — page is English-only static content.
