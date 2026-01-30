
# Add Buyers Guide Download Link Across All Pages

## Current State

The "Download PDF Guide" button in `BuyersGuideCTA.tsx` (line 168) is currently non-functional - it's a `<button>` element without any click handler or link functionality.

```tsx
<button className="flex items-center justify-center gap-2 ...">
  <Download className="w-5 h-5" />
  {t.cta.form.download}  // "Download PDF Guide"
</button>
```

## Solution

### Step 1: Add URL to Centralized Constants

**File:** `src/constants/company.ts`

Add a new `COMPANY_RESOURCES` constant to store downloadable resource URLs:

```tsx
export const COMPANY_RESOURCES = {
  buyersGuideUrl: 'https://gamma.app/docs/The-Complete-Costa-del-Sol-Property-Buyers-Guide-2026-xatxssoipntjvc5',
} as const;
```

This makes it easy to update the URL in one place if it ever changes.

---

### Step 2: Update BuyersGuideCTA Download Button

**File:** `src/components/buyers-guide/BuyersGuideCTA.tsx`

1. Import the new constant
2. Convert the button to an anchor tag that opens the guide in a new tab

**Current (lines 168-173):**
```tsx
<button
  className="flex items-center justify-center gap-2 w-full py-4 px-6 border-2 border-prime-900 text-prime-900 font-semibold rounded-xl hover:bg-prime-900 hover:text-white transition-all duration-300"
>
  <Download className="w-5 h-5" />
  {t.cta.form.download}
</button>
```

**New:**
```tsx
<a
  href={COMPANY_RESOURCES.buyersGuideUrl}
  target="_blank"
  rel="noopener noreferrer"
  className="flex items-center justify-center gap-2 w-full py-4 px-6 border-2 border-prime-900 text-prime-900 font-semibold rounded-xl hover:bg-prime-900 hover:text-white transition-all duration-300"
>
  <Download className="w-5 h-5" />
  {t.cta.form.download}
</a>
```

---

## Summary of Changes

| File | Change |
|------|--------|
| `src/constants/company.ts` | Add `COMPANY_RESOURCES.buyersGuideUrl` constant |
| `src/components/buyers-guide/BuyersGuideCTA.tsx` | Convert download button to anchor tag linking to the Gamma.app guide |

---

## Result

- The "Download PDF Guide" button on `/en/buyers-guide` (and all 10 language versions) will open the Gamma.app buyers guide in a new tab
- The URL is centralized in `company.ts` for easy future updates
- Uses proper accessibility attributes (`target="_blank"`, `rel="noopener noreferrer"`)
