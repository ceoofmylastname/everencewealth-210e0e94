

## Plan: Restructure Headline to 3 Lines

The headline currently renders as 2 lines. Restructure the line breaks so it flows as:

- Line 1: "Your Strategy Has a"
- Line 2: "Ceiling. This Day"
- Line 3: "REMOVES IT."

### Change in `src/pages/TrainingEvent.tsx` (line 364)

Replace:
```tsx
Your Strategy Has a Ceiling.<br />
This Day <span ...>
```

With:
```tsx
Your Strategy Has a<br />
Ceiling. This Day<br />
<span ...>{"REMOVES IT"...}</span><span>.</span>
```

The animated letter-by-letter "REMOVES IT" span and the trailing period stay on their own third line. Everything else (keyframes, styling, animations) remains unchanged.

### Files Modified
- `src/pages/TrainingEvent.tsx` (1 line change)

