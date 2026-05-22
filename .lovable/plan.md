# Fix Carrier Label Mismatches (Slide 05)

The logos on the "Bridging the Gap" carrier slide are correct, but the text labels underneath are misaligned. Update only the `name` field for each entry in the `carriers` array in `src/components/presentation/slides/Slide05_CarrierLogos.tsx` — logo URLs stay as-is.

## Label corrections (in grid order)

| # | Current label | Corrected label (matches logo) |
|---|---|---|
| 1 | Prudential | Fidelity & Guaranty |
| 2 | Principal | Lafayette Life |
| 3 | Lincoln Financial Group | American Equity |
| 4 | Allianz | Baltimore Life |
| 5 | Global Atlantic | Royal Neighbors of America |
| 6 | American National | American Amicable |
| 7 | Securian Financial | Allianz |
| 8 | John Hancock | Foresters |
| 9 | Mutual of Omaha | Transamerica |
| 10 | National Life Group | North American |
| 11 | North American | National Life Group |
| 12 | Equitable | Global Atlantic |

## Scope
- Single file edit: `src/components/presentation/slides/Slide05_CarrierLogos.tsx`
- No logo URL changes, no layout/styling changes, no ordering changes.
- `alt` text updates automatically since it reads from `carrier.name`.
