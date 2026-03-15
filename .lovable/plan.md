

## Trim Chart to 1999–2021

### Changes

**1. `src/components/presentation/PerformanceChart.tsx`**

- **SP500_DATA**: Remove `{ year: 2025, value: 408888.23 }`. Add `{ year: 2021, value: 408888.23 }` as the final point. No other points are post-2021 so nothing else to remove.
- **INDEXED_DATA**: Remove `{ year: 2024, value: 541391.51 }`. Add `{ year: 2021, value: 541391.51 }` as the final point.
- **MAX_YEAR**: Change from `2025` to `2021`.
- X-axis loop already uses `MIN_YEAR` to `MAX_YEAR`, so it will automatically show 1999–2021.

**2. `src/components/presentation/slides/Slide16_PerformanceChart.tsx`**

- Line 19: Change subtitle from `(1999–2025)` to `(1999–2021)`.
- Line 71: `CountingNumber value` is already `541391` — update to `541391.51` for precision.
- Line 79: Change `+$132,503` to `+$132,503.28`.

Summary bar values and difference pill already display the correct numbers (just minor decimal precision fixes).

