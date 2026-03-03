

## Plan: Update Phone Number to 925-433-7724

Update `src/constants/company.ts` to change the phone number from the current placeholder to the real number:

- `phone`: `'+1 (925) 433-7724'`
- `phoneClean`: `'19254337724'`
- `whatsappBase`: `'https://wa.me/19254337724'`
- `whatsappWithMessage`: update the base number to `19254337724`

Also update the hardcoded phone in `src/components/about/AboutCTA.tsx` which displays `"+34 630 03 90 90"` — change to `"+1 (925) 433-7724"`.

**Files to edit:**
1. `src/constants/company.ts` — update all phone references
2. `src/components/about/AboutCTA.tsx` — update hardcoded phone string

