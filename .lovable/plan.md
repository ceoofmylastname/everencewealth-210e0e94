

## Fix QR Code Page

### Problems
1. Route is nested inside the admin dashboard layout — shows sidebar/nav chrome
2. The URL `https://link.everencewealth.com/qr/x0UKirG-340V` is a landing page, not a QR image — the `<img>` tag can't render it

### Changes

**1. Move route to top level** — `src/App.tsx`
- Remove the QR route from inside the admin layout nesting (line 482)
- Add it as a standalone public route near the other public routes (around line 522), e.g.: `/presentation/qr/:location`
- No auth required — it's just a display page

**2. Generate a real QR code** — `src/pages/admin/PresentationQR.tsx`
- Use a free QR API to render the code: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://link.everencewealth.com/qr/x0UKirG-340V`
- Keep the same page layout (dark bg, centered, location label, back button)

**3. Update button URL** — `src/components/presentation/slides/Slide26_Legacy.tsx`
- Change `window.open` path from `/portal/admin/presentation/qr/socorro` to `/presentation/qr/socorro`

