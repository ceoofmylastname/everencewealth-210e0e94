## Goal
Add a new "Illustrations" category and a single illustration card ("Indexing Strategy: 27-Year Backtest") to the advisor Tools Hub (`/portal/advisor/tools`). Clicking the card opens a fullscreen, view-only Dialog rendering the uploaded S&P 500 chart plus seven editorial sections. No download, print, share, drag, or right-click.

## Files

**New**
- `public/resources/everence-sp500-indexing-backtest.png` — copy of the uploaded chart (`user-uploads://S_P500_vs_indexing.png`).
- `src/data/illustrations.ts` — exported `ILLUSTRATIONS` array of card metadata (id, title, subtitle, description, icon name, modal key). Designed for future illustrations without editing the Tools page.
- `src/components/portal/illustrations/IndexingBacktestModal.tsx` — the locked-down modal. Lazy-loaded via `React.lazy` inside `ToolsHub.tsx`.

**Edit**
- `src/pages/portal/advisor/ToolsHub.tsx` — add `illustration` to `TOOL_TYPES`, add illustration cards to the Quoting Tools grid (visible under "All" and "Illustrations"), wire click → open modal via local `useState`. Existing carrier tools and calculators stay untouched.

No shared `ToolCard.tsx` exists today — cards are inlined in `ToolsHub.tsx`. I'll add a small inline branch in the same grid that renders illustration cards with an emerald "Illustration" badge and a "View Illustration" button (no external-link icon) instead of refactoring the existing card markup.

## Tab + card behavior
- New tab "Illustrations" added next to All / Quick Quotes / Agent Portals / Microsites, with `selectedType = "illustration"`.
- Filter logic extended so illustration cards are included in the grid alongside DB-loaded carrier tools. Search matches title/subtitle/description.
- Card: `BarChart3` icon, deep-emerald pill badge (`#0F3B2E` bg, cream text), title, subtitle, description, primary button "View Illustration" → opens modal. No lock icon, no external link icon.

## Modal (`IndexingBacktestModal.tsx`)
- shadcn `Dialog` + `DialogContent`, custom classes: fullscreen on mobile (`w-screen h-screen max-w-none rounded-none`), desktop `md:max-w-[1400px] md:max-h-[90vh] md:rounded-xl`. Charcoal `#1A1A1A` bg, 1px gold `#C9A24B` border.
- Inner scroll container with `overflow-y-auto`, `scrollBehavior: 'smooth'`, `userSelect: 'none'`.
- Close (X) button top-right (shadcn default). No other controls.
- Escape + backdrop close handled by Dialog. Focus trap via Radix.
- `useEffect` adds document-level `contextmenu` preventDefault while modal is open, removed on unmount.
- No `@media print` styles introduced. No download/print/share UI.

### Sections (top → bottom)
1. **Header strip** — gold uppercase pill "EVERENCE WEALTH ILLUSTRATION"; serif H1 ("What Happens When You Cap the Wins and Eliminate the Losses?"); cream subhead (verbatim from task).
2. **Chart** — `<img src="/resources/everence-sp500-indexing-backtest.png">`, `max-w-[1400px]`, `object-contain`, gold border at 30% opacity, soft shadow. Props: `draggable={false}`, `onDragStart`/`onContextMenu` preventDefault, inline `userSelect:'none'`, `WebkitUserDrag:'none'`, `pointerEvents:'none'`. Absolutely-positioned transparent overlay `<div>` on top with its own `onContextMenu` preventDefault to swallow right-click attempts.
3. **Headline number** — gold-bordered centered block: `$622,724` (Full Market), `$950,648` (gold accent, larger, Capped & Floored), `$327,924 more` (smaller) with verbatim subtexts.
4. **Counterintuitive Truth** — parchment-cream Card with thin inner gold border, header "Why Capping the Upside Beats Capturing It.", four verbatim serif body paragraphs, two-column on `md+`, single column mobile.
5. **Stat Cards** — three glassmorphic dark cards with gold top border in `md:grid-cols-3`: "The Win Rate Was Identical", "The Drawdown Story", "Why CAGR Lies" — verbatim copy.
6. **Advisor Talking Points** — muted gray card, header "Three Ways to Frame This in a Client Meeting.", three verbatim scripts.
7. **Assumptions/Source strip** — small light-gray footer paragraph (verbatim).

## Tokens / colors
Inline hex only where tokens don't exist: emerald `#0F3B2E`, gold `#C9A24B`, cream `#F5EFE0`, charcoal `#1A1A1A`, accent red `#C8362C`. Headings `font-serif`, body sans.

## Acceptance verification
- Card appears under "All" and "Illustrations" tabs with emerald badge.
- Click opens modal; Esc and backdrop close; X closes.
- Chart: cannot drag, right-click, or select; no download/print/share controls.
- All 7 sections render correctly on mobile (single column) and desktop (1400px max).
- Rest of Tools page (carrier quoting tools, calculators tab) untouched.
