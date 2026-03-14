

## Plan: Redesign Slide 16 — Performance Chart with Real Data Points and Modern UI

Looking at the uploaded screenshot, the S&P 500 chart shows specific dollar values at key years that need to be displayed as animated labels on the chart line. The data points from the attachment are:

**S&P 500 data points (starting at $100,000):**
- 1999: $100,000
- 2000: $59,880.41
- 2002: $82,480.21
- 2004: $84,954.62
- 2006: $61,468.66
- 2007: $85,580.91
- 2008: $125,786.28
- 2009: $139,090.51
- 2010: $152,359.74
- 2012: $170,594.45
- 2014: $263,961.83
- 2016: $307,071.03
- 2018: $283,383.18
- 2020: $370,000 (approx)
- 2025: $408,888.23

Also includes: "Actual Rate over 20 years 5.57%" gold pill badge.

### Changes

**1. `src/components/presentation/PerformanceChart.tsx`** — Major update:
- Update `SP500_DATA` with the exact values from the attachment (starting at $100,000 not $50,000)
- Add data point labels rendered on the canvas — each value shown as `$XX,XXX.XX` with a small connector line above/below the point
- Labels animate in as the line draws through each point (fade in sequentially with the line progress)
- Add a gradient fill under the S&P 500 line (red-to-transparent) for depth
- Render dots at each labeled data point
- Update year axis to show every year from 1999-2025
- Add the "Actual Rate over 20 years 5.57%" as a gold rounded pill overlay on the chart
- Modern styling: softer grid lines, rounded label backgrounds

**2. `src/components/presentation/slides/Slide16_PerformanceChart.tsx`** — Visual upgrade:
- Add glassmorphism container around the chart with `backdrop-filter: blur(16px)`, `rounded-2xl`
- Add subtle radial glow behind the chart area
- Update legend items to glassmorphism pill style with rounded corners
- Final values use `CountingNumber` with 2 decimal places
- Keep 4 reveals: title, chart, legend, badge
- Add the "5.57%" rate badge as part of reveal 3 or 4

**3. `src/components/presentation/PresentationViewer.tsx`** — No change needed (stays at 4 reveals)

