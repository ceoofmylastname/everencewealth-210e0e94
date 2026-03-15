

## Fix Chart: Only Plot Labeled Data Points

The current chart has 27 data points per line (every year 1999–2025), many of which were guessed/interpolated. The fix is to only plot the points that have actual labeled callouts on the reference chart, with straight lines between them.

### Data Changes in `src/components/presentation/PerformanceChart.tsx`

**Replace `SP500_DATA` with only labeled points (14 points):**
```
1999: 100000, 2000: 59880.41, 2001: 82480.21, 2002: 61468.66,
2004: 84954.62, 2005: 85580.91, 2008: 125786.28, 2009: 139090.51,
2011: 152359.74, 2012: 170594.45, 2013: 263961.83, 2014: 313498.30,
2015: 307071.03, 2019: 283383.18, 2020: 408888.23
```

**Replace `INDEXED_DATA` with only labeled points (11 points):**
```
2003: 122068.80, 2004: 140818.57, 2006: 145789.46, 2007: 182878.30,
2009: 229402.54, 2010: 255531.49, 2012: 313498.30, 2013: 344064.38,
2014: 431594.35, 2015: 483385.28, 2024: 541391.51
```

### Rendering Changes

- **`getKeyIndices`**: No longer needed since every point is now a key/labeled point. Mark all points as key points (big dot + label).
- **X-axis**: Keep labels for every year 1999–2025 (unchanged).
- **Lines**: Straight segments between labeled points only — years without data simply have no dot or line vertex. The line jumps directly from one labeled year to the next.
- All other chart settings (Y-axis range, colors, legend, animation, gradient fill) remain unchanged.

### One consideration

The green line currently starts at 1999 with $100,000 showing the flat floor years. With only labeled points, it would start at 2003. Similarly the red line would end at 2020. I will add start/end anchor points (1999: $100,000 for green, 2025: $408,888.23 for red) to ensure lines span the full chart width — unless you want the lines to only cover the labeled range. I will include these anchors by default.

