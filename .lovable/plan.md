

## Plan: Remove Logo from Hero Slide

The `logo-new.png` asset is showing the wrong (Del Sol) logo on the first presentation slide. Remove the logo entirely from the hero slide.

### Change
**File:** `src/components/presentation/slides/Slide01_Hero.tsx`
- Remove the `import logo` line (line 8)
- Remove the entire logo RevealElement block (lines 34-41)

The slide will keep the beach background, gradient overlay, gold rule, headline text, and presenter badge — just no logo.

