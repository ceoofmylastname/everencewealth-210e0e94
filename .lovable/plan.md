
# Fix Performance Chart — Exact Year-Indexed Data

Replot `src/components/presentation/PerformanceChart.tsx` so every dot sits on its exact year column and labels follow visibility rules.

## 1. Replace `INDEXED_DATA` (green, non-decreasing, one entry per year 1999–2021)
```
1999=100000.00, 2000=100000.00, 2001=100000.00, 2002=100000.00,
2003=122068.80, 2004=140818.57, 2005=140818.57, 2006=145789.46,
2007=182878.30, 2008=229402.54, 2009=255531.49, 2010=255531.49,
2011=313498.30, 2012=313498.30, 2013=344064.38, 2014=344064.38,
2015=431594.35, 2016=431594.35, 2017=483385.28, 2018=483385.28,
2019=483385.28, 2020=483385.28, 2021=541391.51
```

## 2. Replace `SP500_DATA` (red, one entry per year 1999–2021)
```
1999=100000.00, 2000=82480.21, 2001=59880.41, 2002=59880.41,
2003=61468.66, 2004=84954.62, 2005=85580.91, 2006=85580.91,
2007=125786.28, 2008=85580.91, 2009=139090.51, 2010=152359.74,
2011=152359.74, 2012=170594.45, 2013=170594.45, 2014=263961.83,
2015=263961.83, 2016=263961.83, 2017=307071.03, 2018=307071.03,
2019=307071.03, 2020=283383.18, 2021=408888.23
```

## 3. Label dedupe rule
In the `drawLine` loop, only render the value pill when `i === 0 || data[i].value !== data[i-1].value`. Dots still render at every year. Green labels stay above (`labelAbove=true`), red below. Drop the odd/even alternation — use fixed side per line as the spec requires.

## 4. Axis
- `MAX_VAL = 600000`, keep gridlines `$50k → $600k` (extend ySteps to include 600000).
- Keep `MIN_YEAR=1999`, `MAX_YEAR=2025`; x-axis ticks every year already loop 1999→2025 (no data after 2021, columns remain empty per spec).
- Y label format: `$XXX,XXX` (already correct via `(val/1000).toFixed(0)`).

## 5. Highlight (2021 endpoints)
No change — `data[data.length-1]` is still 2021 for both arrays, so the dashed ellipse + boxed callouts at `$541,391.51` / `$408,888.23` still work.

## Out of scope
Colors, fonts, panel styling, legend, animation timing, slide subtitle (already 1999–2025).
