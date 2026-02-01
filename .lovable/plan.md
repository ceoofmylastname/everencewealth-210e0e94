

# Update German Testimonials Widget ID

## Problem
The German language pages are displaying the wrong testimonials widget. The current German widget ID (`aa95873f-40c9-4b8a-a930-c887d6afb4c4`) needs to be replaced with the correct German widget.

## Solution
Update the `WIDGET_IDS` mapping in the centralized `ElfsightGoogleReviews` component. This single change will automatically apply to **all German pages** across the site (homepage, landing pages, retargeting pages, etc.) because they all use this shared component.

## Change Required

**File:** `src/components/reviews/ElfsightGoogleReviews.tsx`

| Language | Current Widget ID | New Widget ID |
|----------|-------------------|---------------|
| `de` (German) | `aa95873f-40c9-4b8a-a930-c887d6afb4c4` | `3c8586b9-ec6b-4bc3-94fe-c278e8e284bd` |

**Code change (line 11):**
```typescript
// FROM:
de: 'aa95873f-40c9-4b8a-a930-c887d6afb4c4',

// TO:
de: '3c8586b9-ec6b-4bc3-94fe-c278e8e284bd',
```

## Note About Dutch (nl)
Currently Dutch (`nl`) shares the same widget as German with a comment `// Uses same widget as German`. After this update, Dutch will still point to the **old** German widget ID. 

**Question:** Should Dutch also be updated to use the new German widget, or should it have its own dedicated widget ID?

## Pages Affected
This single change will update all German (`/de/...`) pages including:
- `/de` (Homepage)
- `/de/about` (About page)
- `/de/landing` (Landing page)
- `/de/willkommen-zurueck` (Retargeting page)
- Any other page using the `ElfsightGoogleReviews` component

