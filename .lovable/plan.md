
# Fix Performance Chart Data

The `PerformanceChart.tsx` component currently has incorrect/scrambled data points compared to the spec. Replace both data arrays and supporting values with the exact figures provided.

## Changes to `src/components/presentation/PerformanceChart.tsx`

### 1. Replace `SP500_DATA` (red line — S&P 500 Direct)
```ts
const SP500_DATA = [
  { year: 1999, value: 100000.00 },
  { year: 2000, value: 82480.21 },
  { year: 2002, value: 59880.41 },
  { year: 2003, value: 61468.66 },
  { year: 2005, value: 84954.62 },
  { year: 2006, value: 85580.91 },
  { year: 2008, value: 125786.28 },
  { year: 2009, value: 139090.51 },
  { year: 2010, value: 152359.74 },
  { year: 2011, value: 170594.45 },
  { year: 2014, value: 263961.83 },
  { year: 2018, value: 307071.03 },
  { year: 2020, value: 283383.18 },
  { year: 2021, value: 408888.23 },
];
```

### 2. Replace `INDEXED_DATA` (green line — Indexed 0%/12% Cap)
```ts
const INDEXED_DATA = [
  { year: 1999, value: 100000.00 },
  { year: 2000, value: 100000.00 },
  { year: 2001, value: 100000.00 },
  { year: 2003, value: 122068.80 },
  { year: 2004, value: 140818.57 },
  { year: 2006, value: 145789.46 },
  { year: 2007, value: 182878.30 },
  { year: 2008, value: 229402.54 },
  { year: 2009, value: 255531.49 },
  { year: 2011, value: 313498.30 },
  { year: 2013, value: 344064.38 },
  { year: 2015, value: 431594.35 },
  { year: 2017, value: 483385.28 },
  { year: 2021, value: 541391.51 },
];
```

### 3. Extend X-axis to 2025
- `MAX_YEAR` stays as the right edge of plotted data (2021) so spacing for actual points doesn't break, BUT the subtitle/axis must show through 2025 per spec. Update to:
  - `MAX_YEAR = 2025`
  - This re-scales x-positions so 1999–2025 fits across the panel; the last green/red points (2021) land ~85% across, leaving room for the highlight oval.

### 4. Y-axis grid
- Change `ySteps` to exactly `$50k → $550k` in `$50k` increments (drop the extra `0` and `580000` rows). Keep `MAX_VAL = 580000` for headroom so labels don't clip at the top.

### 5. Subtitle in `Slide16_PerformanceChart.tsx`
- Update the date range from `(1999–2021)` to `(1999–2025)` to match the spec.

## Out of scope
- No changes to colors, fonts, panel styling, legend, highlight/oval treatment, or bottom pill values (the 2021 endpoints `$408,888.23` and `$541,391.51` already match the spec).
- No animation timing changes.
