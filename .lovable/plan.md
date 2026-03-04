

## Plan: Optimize Mobile Headline Typography

The headline "Does Your Strategy Have a Ceiling? This Day Removes It." needs better mobile line breaks and sizing at 390px width.

### Changes to `src/pages/TrainingEvent.tsx` (lines 251-263)

1. **Better mobile font size**: Bump from `text-[1.75rem]` to `text-[1.85rem]` for stronger presence
2. **Control line breaks**: Use explicit `<br className="sm:hidden" />` after "Have a" to force clean wrapping on mobile — "Does Your Strategy" / "Have a Ceiling?" / "This Day" / "Removes It."
3. **Remove the forced `<br />` before "Removes It"** on desktop — use `<br className="block sm:hidden" />` so desktop flows naturally
4. **Tighten tracking**: Add `tracking-[-0.02em]` on mobile for a more polished feel
5. **Give the highlight pill slight vertical padding back**: `py-px` (1px) so it doesn't look too flat, without the overlap issue

```tsx
<h1 className="text-[1.85rem] leading-[1.15] sm:text-4xl md:text-6xl lg:text-7xl font-serif font-bold tracking-[-0.02em] sm:tracking-tight">
    Does Your Strategy<br className="sm:hidden" /> Have a{' '}
    <span className="relative inline-block">
        <span className="text-transparent bg-clip-text animate-gradient bg-[length:200%_auto] bg-gradient-to-r from-[#C5A059] via-[#F2E0B2] to-[#C5A059]">
            Ceiling
        </span>
        <svg ...>...</svg>
    </span>?<br className="sm:hidden" /> This Day{' '}<br />
    <span className="bg-[#C5A059]/20 px-2 sm:px-3 py-px rounded-md" style={{ boxDecorationBreak: 'clone' }}>Removes It</span>.
</h1>
```

This gives clean 4-line stacking on mobile with balanced line lengths, and preserves the current desktop layout.

