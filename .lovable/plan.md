

## Fix Hidden Fees Chart Numbers

### What
Update `Slide11_HiddenFees.tsx` to use dynamically calculated values via the future value of annuity formula instead of hardcoded numbers. Keep all existing animations, styling, and UI intact.

### Calculations
Using `FV = P × [((1 + r)^n − 1) / r]` with P=$3,600:
- No Fee (8%): 3888, 56312→56324, 177923, 284236, 440445, 669968
- 0.95% Fee (7.05%): 3851→3854, 53143→53372, 157429→158854, 242669→245506, 362077→367324, 529350→538580
- 2% Fee (6%): 3810→3816, 49846→50298, 137775→140374, 204397→209363, 292881→301686, 410402→425235
- 3% Fee (5%): 3771→3780, 46908→47544, 121587→124989, 174153→180408, 240479→251139, 324167→341411

### Changes in `src/components/presentation/slides/Slide11_HiddenFees.tsx`

1. **Replace hardcoded `feeData` array** with a computed version using the annuity formula. Add a helper function:
```ts
function fvAnnuity(pmt: number, rate: number, years: number) {
  if (rate === 0) return pmt * years;
  return pmt * ((Math.pow(1 + rate, years) - 1) / rate);
}
```
Then generate `feeData` dynamically for years [1, 10, 20, 25, 30, 35] with rates [0.08, 0.0705, 0.06, 0.05].

2. **Update `costs` array** to compute differences dynamically from the year-35 row (669968 - 538580 = 131388, 669968 - 425235 = 244733, 669968 - 341411 = 328557).

### Files Modified
- `src/components/presentation/slides/Slide11_HiddenFees.tsx`

