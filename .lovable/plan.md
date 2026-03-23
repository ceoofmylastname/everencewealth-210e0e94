

## Add QR Code Button to Legacy Slide

**Goal**: Add a small button on the Legacy (final) slide that admins can click to navigate to a dedicated QR code page. This will be extensible to support multiple locations.

### Changes

**1. Create QR Code page** — `src/pages/admin/PresentationQR.tsx`
- Simple page displaying the QR code image from `https://link.everencewealth.com/qr/x0UKirG-340V`
- Show location name ("Socorro") and a back button
- Clean, centered layout with dark background to match presentation feel
- Designed to be extensible for multiple locations later (could accept location as a route param)

**2. Add route** — `src/App.tsx` (or wherever admin routes are defined)
- Add route `/portal/admin/presentation/qr/socorro` pointing to the new page
- Structure supports future locations like `/qr/san-diego`, `/qr/el-paso`, etc.

**3. Add QR button to Legacy slide** — `src/components/presentation/slides/Slide26_Legacy.tsx`
- Add a small, subtle button (e.g. bottom-right corner) with a QR icon
- Uses `window.open` to open the QR page in a new tab (so the presentation isn't interrupted)
- Styled to be unobtrusive — small, semi-transparent, only visible on hover or as a subtle icon

### Technical details
- The QR code URL is an external link that renders a QR image — we'll embed it in an `<img>` tag or iframe on the dedicated page
- No database changes needed
- Button will use `lucide-react` QrCode icon

