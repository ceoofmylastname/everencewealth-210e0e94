

## Fix: Correct Wrong Data Points in Both Lines

Three data points are wrong in the current code:

### SP500_DATA
- **Line 29:** 2019 is `370000.00` → should be `431594.35`
- **Line 31:** 2021 is `431594.35` → should be `408888.23`

### INDEXED_DATA
- **Line 62:** 2022 is `541391.51` → should be `483385.28`

### File: `src/components/presentation/PerformanceChart.tsx`
Three line edits only. No other changes needed — the rendering logic (straight segments, labels, legend) is already correct.

