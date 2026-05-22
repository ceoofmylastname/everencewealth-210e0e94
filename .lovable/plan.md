## Update Performance Chart to 1999–2025 with 15% Cap

Two files change. No layout, animation, or design-system edits — only data, labels, axis range, and final callout values.

### 1. `src/components/presentation/PerformanceChart.tsx`

**Replace `SP500_DATA`** with 27 rows (1999–2025) using the user's real S&P 500 price-only values:
1999=$100,000.00, 2000=$89,861.85, 2001=$78,140.92, 2002=$59,882.04, 2003=$75,679.85, 2004=$82,486.00, 2005=$84,961.27, 2006=$96,533.41, 2007=$99,939.42, 2008=$61,477.65, 2009=$75,897.99, 2010=$85,597.41, 2011=$85,594.69, 2012=$97,069.05, 2013=$125,801.94, 2014=$140,134.42, 2015=$139,116.21, 2016=$152,378.36, 2017=$181,968.31, 2018=$170,617.40, 2019=$219,891.66, 2020=$255,644.62, 2021=$324,394.83, 2022=$261,326.05, 2023=$324,643.18, 2024=$400,316.16, 2025=$408,888.23.

**Replace `INDEXED_DATA`** with 27 rows (1999–2025) using the 15% cap / 0% floor green-line values:
1999=$100,000.00, 2000=$100,000.00, 2001=$100,000.00, 2002=$100,000.00, 2003=$115,000.00, 2004=$125,338.50, 2005=$129,098.66, 2006=$146,664.91, 2007=$151,840.99, 2008=$151,840.99, 2009=$174,617.14, 2010=$196,931.21, 2011=$196,931.21, 2012=$223,318.18, 2013=$256,815.91, 2014=$286,067.04, 2015=$286,067.04, 2016=$313,375.81, 2017=$360,382.18, 2018=$360,382.18, 2019=$414,439.51, 2020=$476,605.44, 2021=$548,096.26, 2022=$548,096.26, 2023=$630,310.70, 2024=$724,857.30, 2025=$740,361.45.

**Update constants:**
- `MAX_YEAR = 2025` (already 2025 — no change)
- `MAX_VAL = 800000` (was 600000)

**Update Y-axis gridline array** to step every $50k up to $800k: `[50000, 100000, 150000, 200000, 250000, 300000, 350000, 400000, 450000, 500000, 550000, 600000, 650000, 700000, 750000, 800000]`.

**Update legend label** at line 150: `"S&P 500 Indexed 0% Guarantee 15% Cap"` (was 12%).

Existing dedupe rule (`data[i].value === data[i - 1].value` → skip label) automatically handles the "label first year of flat run only" requirement for green floor years.

### 2. `src/components/presentation/slides/Slide16_PerformanceChart.tsx`

**Pill chips (Reveal 3):**
- Red pill final value: `408888.23` (unchanged — already matches).
- Green pill label: `"Indexed — 0% / 15% Cap"` (was 12%).
- Green pill final value: `740361.45` (was 541391.51).

**Bottom callout bars (Reveal 4):**
- Green bar: `"+$331,473.22 MORE — Protected Strategy"` (was +$132,503.28).
- Tan bar: `"Actual Rate over 26 Years: 8.01%"` (was 20 Years / 5.57%).

### Out of scope
Title, subtitle text, panel styling, glassmorphism, gradients, reveal indices, animation timing, endpoint callout / dashed-ellipse rendering logic (it auto-anchors to the last data point in each array, so it will pick up 2025 automatically).
