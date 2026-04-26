## Hotfix: Replace Spanish WhatsApp link in AuthorBio.tsx

Single-file surgical edit to remove the lingering Costa del Sol Spanish WhatsApp number and replace the message with wealth-management context.

### Change

**File:** `src/components/blog-article/AuthorBio.tsx`

1. Add import at top of file (after existing imports):
   ```ts
   import { BUSINESS } from '@/config/business';
   ```

2. Replace the WhatsApp `<a>` href on line 131:

   **Before:**
   ```tsx
   href="https://wa.me/34630039090?text=Hi,%20I%20have%20a%20question%20about%20Costa%20del%20Sol%20properties"
   ```

   **After:**
   ```tsx
   href={`https://wa.me/${BUSINESS.telephoneE164.replace(/\+/g, '')}?text=Hi%2C%20I%20saw%20your%20article%20and%20have%20a%20question%20about%20wealth%20management`}
   ```

### Notes

- `BUSINESS.telephoneE164` is `+19254337724`; stripping `+` yields the bare `wa.me` digits.
- No other JSX, props, styles, badges, buttons, or logic are touched.
- No other files are modified.

### Verification (post-deploy)

```
curl -sL https://www.everencewealth.com/en/blog/{slug}/ \
  | grep -oE 'wa\.me/[0-9]+\?text=[^"]+' | head -1
```
Expect: `wa.me/19254337724?text=Hi%2C%20I%20saw...`

Project-wide grep should return zero hits:
```
grep -RE "\+34 630|\+34630|6300390|630 03 90" src/ public/
```
