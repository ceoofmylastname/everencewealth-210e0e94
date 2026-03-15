

## Fix Data Points in PerformanceChart.tsx

### 1. Red line (SP500_DATA) — Fix 2015 value
Line 20: Change `{ year: 2015, value: 170594.45 }` to `{ year: 2015, value: 263961.83 }`. All other red line points (lines 8–27) stay exactly as they are.

### 2. Green line (INDEXED_DATA) — Add intermediate points 2016–2020
Between line 40 (`2015: 483385.28`) and line 41 (`2021: 541391.51`), insert 5 new points:
```
{ year: 2016, value: 497000 },
{ year: 2017, value: 505000 },
{ year: 2018, value: 510000 },
{ year: 2019, value: 518000 },
{ year: 2020, value: 525000 },
```

No other changes to styling, rendering, or layout.

