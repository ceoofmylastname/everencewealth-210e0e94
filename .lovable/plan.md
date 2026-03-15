

## Fix Headline — Small Connector Text Not Visible on Line 2

The problem: On line 2, the `.hero-sm` span ("For You. It Was Built To Be") uses `-webkit-text-fill-color: transparent` inherited from `.line-2`'s gradient text effect. Combined with `opacity: 0.55`, the small text is nearly invisible — making the headline read as just "Paid By You." with no context.

The sentence should read:
> *The* **Retirement System** *Was Not* **Built**  
> *For You. It Was Built To Be* **Paid By You.**

### Fix

**`src/styles/socorro.css`** — Override the gradient fill on `.hero-sm` inside `.line-2` so the small connector words are actually visible:

```css
.hero-headline .line-2 .hero-sm {
  font-weight: 500;
  -webkit-text-fill-color: rgba(255, 255, 255, 0.55);
  background: none;
}
```

This makes "For You. It Was Built To Be" render as subtle white text instead of inheriting the shimmer gradient at near-invisible opacity.

### File
`src/styles/socorro.css` — 2 lines added to the existing `.line-2 .hero-sm` rule.

