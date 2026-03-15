

## Update SP500 and INDEXED Data Points

### Single file change: `src/components/presentation/PerformanceChart.tsx`

**Replace `SP500_DATA` (lines 8–25) with the user's exact 18 points:**
```
1999: 100000, 2000: 59880.41, 2001: 82480.21, 2002: 61468.66,
2004: 84954.62, 2005: 85580.91, 2008: 125786.28, 2009: 139090.51,
2011: 152359.74, 2012: 170594.45, 2013: 263961.83, 2015: 170594.45,
2016: 313498.30, 2017: 344064.38, 2018: 307071.03, 2019: 431594.35,
2020: 283383.18, 2021: 408888.23
```

Key differences from current data:
- Remove 2014: 313498.30 and 2020: 408888.23 (old last point)
- Add 2015: 170594.45 (DOWN), 2016: 313498.30, 2017: 344064.38, 2018: 307071.03, 2019: 431594.35, 2020: 283383.18
- 2021: 408888.23 is the final point

**`INDEXED_DATA` (lines 27–40)** — already matches. No changes needed.

No other files or settings change. Straight line segments between points are already the rendering mode.

