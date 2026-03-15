

## Fix Green Line Data

Update `INDEXED_DATA` in `src/components/presentation/PerformanceChart.tsx` so that $541,391.51 only appears at 2025. Years 2016–2024 should all be $483,385.28 instead of $541,391.51.

### Changes (single file)

**`src/components/presentation/PerformanceChart.tsx`** — update these entries in `INDEXED_DATA`:
- 2016: `541391.51` → `483385.28`
- 2017: `541391.51` → `483385.28`
- 2018: `541391.51` → `483385.28`
- 2019: `541391.51` → `483385.28`
- 2020: `541391.51` → `483385.28`
- 2021: `541391.51` → `483385.28`
- 2024: `541391.51` → `483385.28`
- 2025 stays at `541391.51` (the only point at that value)

Red line and all other chart settings remain unchanged.

