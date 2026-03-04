

## Plan: Fix Highlight Pill Overlap

The `bg-[#C5A059]/20` background with `py-0.5` padding is extending vertically and visually overlapping "This Day" on the line above due to tight `leading-[1.1]` line-height.

### Fix in `src/pages/TrainingEvent.tsx` (line 262)

Change the highlight from a block-level background to an inline decoration that doesn't affect line-box height:
- Remove `py-0.5` vertical padding (this is what causes the overlap into the line above)
- Add `inline` and `decoration-clone` to keep it tight
- Use `py-0 leading-normal` so the background stays within the text bounds

```tsx
// From:
<span className="bg-[#C5A059]/20 px-2 sm:px-3 py-0.5 rounded-lg">Removes It</span>.

// To:
<span className="bg-[#C5A059]/20 px-2 sm:px-3 rounded-md" style={{ boxDecorationBreak: 'clone' }}>Removes It</span>.
```

Single line change — removes `py-0.5` and switches from `rounded-lg` to `rounded-md` for a tighter, non-overlapping pill.

