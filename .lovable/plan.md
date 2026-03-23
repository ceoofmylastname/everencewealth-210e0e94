

## Remove "The Opportunity" Slide from Presentation

**File**: `src/components/presentation/PresentationViewer.tsx`

Three changes needed — all in the same file:

1. **Remove the slide import** (line 34): Delete the `Slide25_TheOpportunity` lazy import.

2. **Remove its title** (line 63): Delete `"The Opportunity"` from `SLIDE_TITLES`.

3. **Remove its config** (line 93): Delete `{ totalReveals: 7 }` entry from `SLIDE_CONFIGS`.

4. **Update watermark exclusion** (line 98): Change `24` to `23` in `WATERMARK_EXCLUDE_INDICES` since Legacy (currently index 24) shifts down to index 23.

5. **Update the comment** (line 8): Change "26 slides" to "25 slides".

No other files need changes. The slide file itself (`Slide25_TheOpportunity.tsx`) will be left in place but unused — no risk of breakage.

