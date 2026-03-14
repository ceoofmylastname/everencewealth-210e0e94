

## Plan: Enlarge Carrier Logos

Increase logo dimensions so they're clearly visible at presentation scale.

### Change: `src/components/presentation/slides/Slide05_CarrierLogos.tsx`

- **Logo size**: Change `maxWidth` from `140` → `200` and `maxHeight` from `48` → `72` on the `<img>` element (line 70-71)
- **Card padding**: Increase vertical padding to give logos more breathing room — bump from `32px 24px` to `40px 28px` in the card styles

Single file, two inline style tweaks.

