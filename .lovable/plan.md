

## Plan: Modernize Registration Modal Form

Transform the current sharp-cornered, minimal registration modal into a sleek, premium glassmorphism form with rounded corners and polished interactions.

### Changes to `src/pages/TrainingEvent.tsx`

**1. Modal container (line 458)**
- Replace `borderRadius: '0px'` with `borderRadius: '24px'`
- Add glassmorphism: `background: 'rgba(13,26,20,0.85)'`, `backdropFilter: 'blur(24px)'`, stronger border glow `border: '1px solid rgba(200,169,110,0.15)'`
- Add subtle inner shadow/glow: `boxShadow: '0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)'`

**2. Input fields (lines 469-476, 495-502, 529-536)**
- Replace underline style with a filled rounded input: remove `border-0 border-b-2 rounded-none px-0`
- Add `rounded-xl bg-white/5 border border-white/10 px-5` with gold focus ring `focus-visible:ring-1 focus-visible:ring-[#C8A96E] focus-visible:border-[#C8A96E]`
- Reduce text size from `text-2xl` to `text-lg` for a cleaner look

**3. Buttons**
- All buttons: add `borderRadius: '14px'` instead of `'0px'`
- Primary buttons: add subtle shadow `boxShadow: '0 4px 20px rgba(200,169,110,0.3)'` and scale hover
- Back buttons: `borderRadius: '14px'`

**4. Progress indicator (lines 560-568)**
- Change pill `borderRadius` from `'0px'` to `'99px'` for rounded dots/bars
- Increase inactive dot width slightly for better visibility

**5. Confirm button (step 3, line 545)**
- Same rounded treatment, add gradient: `background: 'linear-gradient(135deg, #1A4D3E, #2a6b54)'`

### Files Modified
- `src/pages/TrainingEvent.tsx`

