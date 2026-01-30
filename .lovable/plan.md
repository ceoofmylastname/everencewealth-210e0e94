
# Update Google Reviews Link

## Problem
The "Read All Reviews" button on the homepage currently links to Google Maps:
```
https://www.google.com/maps/place/Del+Sol+Prime+Homes/@36.5433,-4.6289,17z
```

The user wants it updated to the new Google Business Profile reviews link.

---

## Location Found

**File:** `src/components/home/sections/ReviewsAndBlog.tsx`

**Lines 37-43:**
```jsx
<a 
  href="https://www.google.com/maps/place/Del+Sol+Prime+Homes/@36.5433,-4.6289,17z"
  target="_blank"
  rel="noopener noreferrer"
>
  <Button variant="outline">{t.reviews.cta}</Button>
</a>
```

---

## Change Required

Update the `href` attribute from the old Google Maps URL to the new Google Business Profile reviews URL:

**New URL:**
```
https://www.google.com/search?sca_esv=ab4b4c8b17b2f68e&rlz=1C1FHFK_esES1176ES1176&sxsrf=ANbL-n6cwHuTgRtfDEJAzE8AcYPESuO9sA:1769744919200&kgmid=/g/11zj8zmh9b&q=DelSolPrimeHomes&shem=bdsle,ptotple,shrtsdl&shndl=30&source=sh/x/loc/uni/m1/1&kgs=3deac8e88e622d63&utm_source=bdsle,ptotple,shrtsdl,sh/x/loc/uni/m1/1
```

---

## Summary

| Item | Details |
|------|---------|
| File | `src/components/home/sections/ReviewsAndBlog.tsx` |
| Line | 38 |
| Change | Replace Google Maps URL with Google Business Profile URL |
| Button Text | "Read All Reviews" (from translation key `t.reviews.cta`) |

This is a single-line change that will redirect users clicking "Read All Reviews" to the correct Google Business Profile reviews page.
