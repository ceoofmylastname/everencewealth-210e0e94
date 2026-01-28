

# Update All Navigation Links to Scroll to Properties Section

## Current State

The header navigation has inconsistent behavior:
- **Apartments** → Scrolls to `#properties` section ✓
- **Penthouses** → Redirects to external Property Finder page ✗
- **Townhouses** → Redirects to external Property Finder page ✗
- **Villas** → Scrolls to `#properties` section ✓

## Solution

Update "Penthouses" and "Townhouses" links to use the same smooth-scroll behavior as "Apartments" and "Villas", directing users to the on-page properties section.

## Implementation

### File: `src/pages/RetargetingLanding.tsx`

Change the `<Link>` components for Penthouses and Townhouses to `<a>` tags with smooth-scroll behavior:

**Before (lines 78-89):**
```tsx
<Link
  to={`/${language}/property-finder?type=penthouse`}
  className="text-landing-navy/70 hover:text-landing-navy transition-colors"
>
  {t.headerPenthouses}
</Link>
<Link
  to={`/${language}/property-finder?type=townhouse`}
  className="text-landing-navy/70 hover:text-landing-navy transition-colors"
>
  {t.headerTownhouses}
</Link>
```

**After:**
```tsx
<a
  href="#properties"
  onClick={(e) => {
    e.preventDefault();
    document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' });
  }}
  className="text-landing-navy/70 hover:text-landing-navy transition-colors cursor-pointer"
>
  {t.headerPenthouses}
</a>
<a
  href="#properties"
  onClick={(e) => {
    e.preventDefault();
    document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' });
  }}
  className="text-landing-navy/70 hover:text-landing-navy transition-colors cursor-pointer"
>
  {t.headerTownhouses}
</a>
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/RetargetingLanding.tsx` | Convert Penthouses and Townhouses from `<Link>` to `<a>` with smooth-scroll |

## Expected Result

All four navigation links (Apartments, Penthouses, Townhouses, Villas) will smoothly scroll to the properties section on the same page.

