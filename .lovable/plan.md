
# Change Gold Text to #09301B on White-Background Sections (4 Strategy Pages)

## The Problem
On all 4 strategy pages, large headings and icons that use `text-primary` (which resolves to light gold: `hsl(51, 78%, 70%)`) appear on white or light muted backgrounds. This is poor contrast and the user wants them to be dark forest green `#09301B` instead.

## What "gold text" means in this codebase
- `text-primary` = CSS variable `--primary: 51 78% 70%` = Light Gold `#EDDB77`
- This is used for: h2 headings, icon colors, testimonial labels, inline `text-primary` badges, border-primary accents
- The screenshots confirm: large section titles like "How Whole Life Works", "How IUL Works", "The Tax Time Bomb", "The Threat Landscape" all appear in light gold against a near-white background

## Strategy
We cannot change the CSS variable globally as gold is correct on dark/green hero/CTA backgrounds. Instead, we replace `text-primary` → `text-[#09301B]` (and inline color styles) **only in the light-background components** across the 4 pages.

## Files to Update

### Whole Life Page
1. **`WLHowItWorks.tsx`** — Section uses `bg-muted/30` (light)
   - Line 58: `text-primary` heading → `text-[#09301B]`

2. **`WLComparison.tsx`** — `bg-white`
   - Line 51: `text-primary` heading → `text-[#09301B]`
   - Line 67: Scale icon inline color → `#09301B`
   - Line 68: `text-primary` winner text → `text-[#09301B]`

3. **`WLIdealClient.tsx`** — `bg-white`
   - Line 34: `text-primary` heading → `text-[#09301B]`
   - Line 40: `!border-l-primary` → keep (border accent stays gold)
   - Line 42: `text-primary` CheckCircle icon → `text-[#09301B]`
   - Line 55: `text-primary` list icons → `text-[#09301B]`

4. **`WLInfiniteBanking.tsx`** — Light gradient background
   - Line 24: `text-primary` heading → `text-[#09301B]`
   - Line 71: `text-primary` MessageCircle icon → `text-[#09301B]`
   - Line 72: `text-primary` testimonial label → `text-[#09301B]`

5. **`WLSpeakable.tsx`** — `bg-white` (only trust badges, no primary text here — OK as-is)

### IUL Page
6. **`IULHowItWorks.tsx`** — `bg-muted/30` (light)
   - Line 29: `text-primary` heading → `text-[#09301B]`

7. **`IULComparison.tsx`** — `bg-white`
   - Line 47: `text-primary` heading → `text-[#09301B]`
   - Line 57: Trophy icon inline color → `#09301B`
   - Line 58: `text-primary` winner text → `text-[#09301B]`

8. **`IULLivingBenefits.tsx`** — Light gradient background
   - Line 22: `text-primary` heading → `text-[#09301B]`
   - Line 40: `text-primary` benefit text → `text-[#09301B]`
   - Line 51: `text-primary` MessageCircle icon → `text-[#09301B]`
   - Line 52: `text-primary` testimonial label → `text-[#09301B]`

9. **`IULIdealClient.tsx`** — `bg-white`
   - Line 33: `text-primary` heading → `text-[#09301B]`
   - Line 40: CheckCircle icon → `text-[#09301B]`
   - Line 49: list icons → `text-[#09301B]`

### Tax-Free Retirement Page
10. **`TFRTaxTimeBomb.tsx`** — `bg-muted/30` (light)
    - Line 53: `text-primary` heading → `text-[#09301B]`
    - Line 75: `text-primary` inline withdrawal label → `text-[#09301B]`
    - Line 141: `text-primary` "$0" value → `text-[#09301B]`

11. **`TFRIncomeStacking.tsx`** — `bg-white`
    - Line 25: `text-primary` heading → `text-[#09301B]`
    - Line 78: `text-primary` total value → `text-[#09301B]`

12. **`TFRIdealClient.tsx`** — `bg-white`
    - Line 34: `text-primary` heading → `text-[#09301B]`
    - Line 42: CheckCircle → `text-[#09301B]`
    - Line 55: list icons → `text-[#09301B]`

13. **`TFRComparison.tsx`** — `bg-muted/30` (light)
    - Line 45: `text-primary` heading → `text-[#09301B]`
    - Line 61-63: `text-primary` winner badge → `text-[#09301B]` + border/bg updated

### Asset Protection Page
14. **`APThreatLandscape.tsx`** — `bg-muted/30` (light)
    - Line 37: `text-primary` heading → `text-[#09301B]`

15. **`APProtectionVehicles.tsx`** — `bg-white`
    - Line 25: `text-primary` heading → `text-[#09301B]`

16. **`APIdealClient.tsx`** — `bg-white`
    - Line 34: `text-primary` heading → `text-[#09301B]`
    - Line 42: CheckCircle → `text-[#09301B]`
    - Line 55: list icons → `text-[#09301B]`

17. **`APComparison.tsx`** — `bg-muted/30` (light)
    - Line 47: `text-primary` heading → `text-[#09301B]`
    - Line 63: `text-primary` winner badge → `text-[#09301B]`

## What is NOT changed
- Hero sections (dark/green backgrounds — gold is correct there)
- CTA sections (dark green backgrounds — gold text is correct)
- Chart SVG lines/bars (gold accents are decorative, not text)
- The numbered step circles (gold background with dark text — those are correct)
- Speakable sections (no prominent `text-primary` headings)
- `border-primary` and `bg-primary` elements (borders/fills stay as-is)
- Dark background testimonials (gold text correct on dark)

## Files Modified (17 components)
All files are in `src/components/strategies/` subfolders.
