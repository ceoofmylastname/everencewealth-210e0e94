

## Audit: Reveal Index vs. Config Alignment

I reviewed every slide's `RevealElement` max index against the `SLIDE_CONFIGS` `totalReveals` value. Here are the results:

| Slide | Max Index Used | Config totalReveals | Status |
|-------|---------------|---------------------|--------|
| 01 Hero | 4 | 4 | OK |
| 02 Retirement Needs | 5 | 5 | OK |
| 03 Ways to Invest | 4 | 4 | OK |
| 04 Our Mission | 5 | 5 | OK |
| 05 Carrier Logos | 3 | 3 | OK |
| 06 Warren Buffett | 4 | 4 | OK |
| 07 Compound Interest | 5 | 5 | OK |
| 08 Darren Hardy | **4** | **3** | **BUG** |
| 09 Retirement Gap | 5 | 5 | OK |
| 10 Sixty Minutes | 4 | 4 | OK |
| 11 Hidden Fees | 5 | 5 | OK |
| 12 Loss Impact | 5 | 5 | OK |
| 14 Indexing Solution | 5 | 5 | OK |
| 15 Side by Side | 4 | 4 | OK |
| 16 Performance Chart | 4 | 4 | OK |
| 17 Tax Buckets Intro | 4 | 4 | OK |
| 18 Tax Categories | 5 | 5 | OK |
| 19 Tax Deep Dive | 5 | 5 | OK |
| 20 Tax Comparison | 4 | 4 | OK |
| 21 Bridging the Gap | 5 | 5 | OK |
| 22 Plan Advantage | 5 | 5 | OK |
| 23 Plan Benefits | 5 | 5 | OK |
| 24 Great Retirement | 4 | 4 | OK |
| 25 The Opportunity | 4 | 4 | OK |
| 26 Legacy | 5 | 5 | OK |

### Finding

**24 of 25 slides are correct** -- elements reveal independently on each click as intended.

**1 bug found: Slide 08 (Darren Hardy)** -- The slide uses reveal indices 1 through 4 (title, quote card, attribution, blob image), but `totalReveals` is set to `3`. This means the right-side blob portrait image at `index={4}` will **never appear** because the reveal counter maxes out at 3 and advances to the next slide.

### Fix

One line change in `PresentationViewer.tsx`:

Change `SLIDE_CONFIGS[7]` from `{ totalReveals: 3 }` to `{ totalReveals: 4 }`.

This will allow all 4 elements on the Darren Hardy slide to reveal one at a time on user clicks before advancing to the next slide.

