Plan to fix `/portal/advisor/presentation-v2`:

1. **Confirm iframe target**
   - Check `src/pages/portal/advisor/PresentationV2.tsx`.
   - Ensure the iframe `src` is exactly `/presentation-v2.html`.
   - Keep the page as iframe-only: no layout, no padding, no sidebar, fullscreen `100vw`/`100vh`, `allowFullScreen`, and `allow="autoplay; fullscreen; encrypted-media"`.

2. **Override iframe-blocking headers for the static deck**
   - Update `public/_headers` by adding this block at the very top, leaving all existing rules below untouched:

```text
/presentation-v2.html
  X-Frame-Options: SAMEORIGIN
  Content-Security-Policy: frame-ancestors 'self'
```

   - This should override the sitewide `X-Frame-Options: DENY` rule for the standalone deck file so the same-origin portal iframe can render it.

3. **Important file note**
   - `public/presentation-v2.html` currently appears to be a placeholder, not the real 24-slide `everence-bridging-the-gap.html` deck.
   - If the real HTML file is attached/available when implementation starts, replace the placeholder with it verbatim. If not, I’ll leave the placeholder and call that out.

4. **Verification after implementation**
   - Confirm the source code contains `src="/presentation-v2.html"`.
   - Confirm the `_headers` override is at the top of `public/_headers`.
   - After you publish/update production, verify:
     - `https://www.everencewealth.com/presentation-v2.html` loads directly.
     - `/portal/advisor/presentation-v2` loads the deck inside the authenticated portal route.

Deployment note: frontend/static header changes require clicking **Publish → Update** in Lovable to deploy to production.