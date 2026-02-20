

# Mobile-First Optimization for CNA Form

## Problems Identified

1. **Pie chart labels truncated**: "Mortgage/Rent" renders as "gage/Rent 83%" because long label text overflows the small chart container. The `labelLine={false}` with inline labels doesn't have enough room.
2. **Mobile chart overflow**: On mobile the chart is inside a 220px container and labels go outside the visible area.
3. **Desktop spacing**: The left column (expense inputs) and right column (chart) could use better proportions.

## Changes (single file: `src/pages/portal/advisor/CNAForm.tsx`)

### Fix 1: Pie chart label rendering
- Replace inline pie labels with a **legend list below the chart** instead of text overlaying the pie slices
- Remove the `label` prop from `<Pie>` and add a custom legend beneath the chart showing colored dots + category name + percentage
- This completely eliminates the truncation problem on both mobile and desktop

### Fix 2: Improve chart container sizing
- Increase `ResponsiveContainer` height from 220 to 250 on desktop
- On mobile, reduce outer radius so the pie doesn't clip

### Fix 3: Mobile-first expense layout
- Change the grid from `lg:grid-cols-2` to show expense inputs full-width on mobile, with the summary card below
- On desktop (`lg:`), keep the two-column sticky layout
- Make the summary card non-sticky on mobile (remove `lg:sticky` behavior on small screens -- already correct)

### Fix 4: Pie chart for AI allocation (Step 7)
- Apply the same legend-based approach to the recommended allocation pie chart to prevent label clipping there too

## Technical Details

In `renderStep3()` (Expenses step):
- Remove `label` and `labelLine` props from `<Pie>`
- Add a legend div below the `<ResponsiveContainer>` that maps over `expensePieData` with colored circles and truncated names
- Each legend item shows: colored dot, label (truncated with `truncate` class), percentage, and dollar amount

In `renderStep6()` (AI Analysis step):
- Same legend pattern for the allocation pie chart

The legend approach is standard for Recharts when labels overlap and is more mobile-friendly since text is rendered as HTML (not SVG) and respects container bounds.

