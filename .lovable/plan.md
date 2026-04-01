

## Show Agent Photo Instead of Initials Everywhere

### Current State
- The `advisors` table already has a `photo_url` column
- Advisors can already upload photos via **Advisor Settings** (`/portal/advisor/settings`) — photos are stored in the `advisor-photos` bucket and the URL is saved to `advisors.photo_url`
- The Response Card query only fetches `id, first_name, last_name` — it does **not** fetch `photo_url`
- Other places (client dashboard, client signup) already use `photo_url` when available

### What to do
**Yes, this is already possible.** The infrastructure exists — we just need to wire `photo_url` into every place that currently shows initials.

### Changes

1. **`src/pages/ResponseCard.tsx`** — Add `photo_url` to the advisor query (line 108: change `select("id, first_name, last_name")` to `select("id, first_name, last_name, photo_url")`). Then in the dropdown list and selected-agent display, show `<img>` when `photo_url` exists, fall back to gradient initials avatar when it doesn't.

2. **Any other advisor avatar locations** — Search for places showing advisor initials (dashboard headers, submission views, etc.) and add the same `photo_url` check. The advisor settings page already handles upload, so no new upload UI is needed.

### Result
- Advisors who have uploaded a photo will show their real photo in the response card dropdown and everywhere else
- Advisors without a photo continue to show the gradient initials avatar
- No database changes needed — `photo_url` column and `advisor-photos` bucket already exist

