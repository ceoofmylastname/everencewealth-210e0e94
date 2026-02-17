

## Optimize Stats Cards Layout (Desktop and Mobile)

The "$500M+" stat value is getting clipped/cut off inside its glassmorphic card because the large font size (`text-7xl` on desktop) combined with padding doesn't leave enough room for wider values like "$500M+".

### Changes

**File: `src/components/homepage/Stats.tsx`**

1. **Reduce font size for better fit** -- Change from `text-5xl md:text-7xl` to `text-4xl sm:text-5xl md:text-6xl` so values fit within cards across all breakpoints
2. **Add `whitespace-nowrap`** to prevent values from wrapping to a second line
3. **Reduce horizontal padding** on cards from `p-8 md:p-10` to `p-6 md:p-8` to give the text more room
4. **Improve mobile grid** -- Use `grid-cols-2` on small screens instead of `grid-cols-1` so the 4 stat cards display in a compact 2x2 grid on mobile (matching the desktop feel), then `lg:grid-cols-4` for the full row
5. **Add `overflow-hidden`** as a safety net so nothing bleeds outside the rounded card

### Technical Details

| Property | Before | After |
|---|---|---|
| Font size | `text-5xl md:text-7xl` | `text-4xl sm:text-5xl md:text-6xl` |
| Card padding | `p-8 md:p-10` | `p-6 md:p-8` |
| Grid columns | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` | `grid-cols-2 lg:grid-cols-4` |
| Text wrapping | none | `whitespace-nowrap` |

Single file change, purely visual/layout fix.

