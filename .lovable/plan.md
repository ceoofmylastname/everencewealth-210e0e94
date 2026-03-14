

## Plan: Add Full Indexed Data Labels + Legend Key to Performance Chart

The reference image shows **both** lines with dollar labels — S&P 500 in red and Indexed in green. Currently only S&P 500 labels are shown. The Indexed line also needs exact data from the reference image and visible labels in green.

### 1. Update `src/components/presentation/PerformanceChart.tsx`

**Update INDEXED_DATA** with exact values from the reference:
```
1999: $100,000 → 2000: $100,000 → 2001: $100,000 → 2002: $100,000 →
2003: $100,000 → 2004: $122,068.80 → 2005: $140,818.57 → 2006: $145,789.46 →
2007: $182,878.30 → 2008: $229,402.54 → 2009: $255,531.49 → 2010: $313,498.30 →
2011: $344,064.38 → 2012: $344,064.38 → 2013: $431,594.35 → 2014: $483,385.28 →
2015-2025: $541,391.51
```

**Show labels on BOTH lines:**
- Change `drawLine(INDEXED_DATA, ...)` to pass `showLabels: true`
- S&P 500 labels render in red (`#E87070`)
- Indexed labels render in green (`#1A4D3E`)
- Labels alternate above/below to avoid overlap — use smarter positioning since both lines now have labels

**Add gradient fill under Indexed line** (green gradient, same technique as red S&P fill)

**Draw a canvas legend key** in the top-left area of the chart:
- Red square + "S&P 500" text
- Green square + "S&P 500 Indexed 0% Guarantee 12% Cap" text

**Increase chart height** from 400px to 480px to accommodate more labels

**Adjust Y-axis max** to ~$560k to fit the indexed line values better

### 2. No changes to `Slide16_PerformanceChart.tsx`
The slide wrapper, legend pills, and badges remain as-is since the chart canvas handles everything internally.

