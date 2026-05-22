
# Re-anchor Performance Chart Data

Update `src/components/presentation/PerformanceChart.tsx` so every anchor value lands on its exact year column. Fill non-anchor years by holding the previous anchor value (step) — labels render only on anchor years via existing dedupe.

## 1. Replace `INDEXED_DATA` (green, 1999–2021)
```
1999=100000.00, 2000=100000.00, 2001=100000.00, 2002=100000.00,
2003=122068.80, 2004=140818.57, 2005=140818.57, 2006=145789.46,
2007=145789.46, 2008=182878.30, 2009=182878.30, 2010=182878.30,
2011=229402.54, 2012=255531.49, 2013=255531.49, 2014=255531.49,
2015=313498.30, 2016=313498.30, 2017=344064.38, 2018=431594.35,
2019=483385.28, 2020=483385.28, 2021=541391.51
```

## 2. Replace `SP500_DATA` (red, 1999–2021)
```
1999=100000.00, 2000=100000.00, 2001=58880.41, 2002=58880.41,
2003=82480.21, 2004=84954.62, 2005=84954.62, 2006=61468.66,
2007=61468.66, 2008=85580.91, 2009=85580.91, 2010=125786.28,
2011=125786.28, 2012=139090.51, 2013=152359.74, 2014=152359.74,
2015=170594.45, 2016=170594.45, 2017=263961.83, 2018=307071.03,
2019=283383.18, 2020=283383.18, 2021=408888.23
```

(Red 2001 uses the user-supplied `$58,880.41`.)

## 3. No other changes
Label dedupe, axes (1999–2025, $0–$600k @ $50k), 2021 callouts, and styling stay as-is. The dedupe rule ensures only anchor years show a value pill; non-anchor years hold the previous anchor's value so the dot is hidden behind the line and no off-year label appears.

## Out of scope
Colors, fonts, panel/legend styling, animation, subtitle.
