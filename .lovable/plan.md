
## Letter-by-Letter Spotlight Animation on RETIREMENT

### What You're Getting

Instead of a gradient sliding across all pills at once, a single gold "spotlight" will illuminate each letter pill in sequence: R → E → T → I → R → E → M → E → N → T — then reverse back T → N → E → M → E → R → I → T → E → R. One letter glows gold at a time, the rest stay deep forest green. Clean, precise, modern.

### Visual Behavior

- Each pill sits at its **resting state**: deep forest green background, subtle border
- As the spotlight reaches a pill, it **blooms** to a bright gold accent: the background brightens, the border intensifies, and a subtle gold glow appears
- The spotlight dwells briefly on each letter before moving to the next
- The full forward + reverse sweep takes ~4 seconds per cycle, looping infinitely
- The transition between lit/unlit states is smooth (ease-in-out), not a hard cut

### Technical Approach

**CSS-only, no JS changes needed.**

The key insight: we define one `@keyframes retirement-spotlight` that animates a pill from its resting dark state → lit gold state → back to dark. Then we assign each of the 10 letter pills a staggered `animation-delay` using `nth-child`, so they fire in sequence.

The total cycle duration is set to `4s`. With 10 letters going forward + 10 going back = 20 steps, each letter's spotlight window is `4s / 20 = 0.2s`. We use a single keyframe where the "lit" phase occupies a small window (e.g., 0%–10%–20%), then stays dark for the rest of its delay cycle.

**`@keyframes retirement-spotlight`**
```css
@keyframes retirement-spotlight {
  0%, 100%  { background: hsla(160, 48%, 16%, 0.9);  border-color: hsla(51, 78%, 70%, 0.15); box-shadow: none; }
  10%       { background: hsla(51,  78%, 48%, 0.55); border-color: hsla(51, 78%, 70%, 0.80); box-shadow: 0 0 18px hsla(51, 78%, 65%, 0.35); }
  20%       { background: hsla(160, 48%, 16%, 0.9);  border-color: hsla(51, 78%, 70%, 0.15); box-shadow: none; }
}
```

**Animation timing per letter (10 letters, ping-pong)**

The duration on every pill is the same (`4s linear infinite`), but the delay staggers each letter so the spotlight hits at the right moment. The forward pass delays: 0, 0.2s, 0.4s … 1.8s. After the forward pass (2s), it reverses: letter 9 fires at 2.0s, letter 8 at 2.2s … letter 0 at 3.8s. This is achieved by staggering delays individually with `nth-child`.

```css
.retirement-letter-pill:nth-child(1)  { animation-delay: 0s;    }
.retirement-letter-pill:nth-child(2)  { animation-delay: 0.2s;  }
.retirement-letter-pill:nth-child(3)  { animation-delay: 0.4s;  }
.retirement-letter-pill:nth-child(4)  { animation-delay: 0.6s;  }
.retirement-letter-pill:nth-child(5)  { animation-delay: 0.8s;  }
.retirement-letter-pill:nth-child(6)  { animation-delay: 1.0s;  }
.retirement-letter-pill:nth-child(7)  { animation-delay: 1.2s;  }
.retirement-letter-pill:nth-child(8)  { animation-delay: 1.4s;  }
.retirement-letter-pill:nth-child(9)  { animation-delay: 1.6s;  }
.retirement-letter-pill:nth-child(10) { animation-delay: 1.8s;  }
```

True ping-pong (reversing back letter by letter) requires a second pass of delays on the same pills. Since CSS `animation-delay` can only handle one pass, the cleanest approach is to use a **longer total duration** (`8s`) and encode both the forward lit-window and the reverse lit-window inside the single keyframe percentage range for each letter. 

Concretely: with an `8s` cycle, each 10%-wide keyframe window = 0.8s. Forward pass occupies 0%–50% (letters 1–10), reverse occupies 50%–100% (letters 10–1). Each letter has two lit windows in the keyframe:
- Letter 1 (R): lit at ~0% and ~95% 
- Letter 2 (E): lit at ~6.25% and ~87.5%
- ... etc.

This is complex to hand-code, so the simpler and equally premium approach is: use `animation-direction: alternate` with a stagger that naturally creates the bouncing effect — forward on odd cycles, reversed on even. This can be achieved by setting the keyframe duration to `4s`, using `animation-iteration-count: infinite`, and `animation-direction: alternate` for the container, while keeping per-letter delays consistent.

The cleanest implementation:
- **Duration per pill**: `4s` with `animation-fill-mode: both`
- **animation-direction on each pill**: `normal` 
- A helper `@keyframes` where the lit peak occupies a narrow band (8% wide), and each letter's delay offsets it so only one is lit at a time
- After the 10th letter fires (delay 1.8s), the cycle naturally reverses because each subsequent loop re-fires in the same sequence — creating the appearance of the spotlight bouncing back when the gap between end of loop and start of new loop causes a visual "reverse" flow

**For a true ping-pong**, we add a second keyframe class `.retirement-letter-pill--reverse` and alternate them in the React component so even-indexed letters animate slightly differently — but this requires minimal JSX changes.

**Simplest approach that looks perfect**: Use an `8s` animation total, encode both the forward and reverse spotlight windows into the keyframe `%` stops per pill using `nth-child`. This is pure CSS, zero JS.

### Files to Edit

- **`src/index.css`**: Replace the `retirement-gradient-sweep` keyframe and `.retirement-letter-pill` animation with the new spotlight system using `retirement-spotlight` keyframes and `nth-child` delays
- **`src/components/home/sections/Hero.tsx`**: Add `nth-child`-compatible wrapping OR confirm the existing `flex` row works with `:nth-child` selectors (it does, since each `motion.span` is a direct child of the parent `span`)
