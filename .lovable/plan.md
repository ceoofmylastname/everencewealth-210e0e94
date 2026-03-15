

## Update Hero Copy — Full Narrative Rewrite

The user provided a complete rewrite. The new copy is longer and more narrative-driven, so the Hero section needs to accommodate multiple body paragraphs while keeping the same visual structure.

### Changes to `SocorroHero.tsx`

**Headline** (two animated lines):
- Line 1: `"The Retirement System Was Not Built"`
- Line 2: `"For You. It Was Built To Be Paid By You."`

**Subheadline** (gold text):
- `"Every fee, every market swing, every tax bill in retirement — someone else planned for that. The question is whether you did."`

**Body** — Replace the single paragraph with the full narrative, broken into multiple `<motion.p>` blocks with staggered delays:
1. "You saw the chart..." paragraph (variable account vs protected indexed strategy)
2. "Hidden fees don't announce themselves..." paragraph (tax time bombs, market crashes)
3. "You came to this workshop..." paragraph (trust that instinct)
4. "The Financial Needs Assessment isn't a pitch..." paragraph (stress test, thirty minutes)
5. "No pressure. No products pushed. Just clarity."

**CTA** stays: "Book Your Discovery Call →"

**Detail text** stays: "Free · No Obligation · 100% Confidential"

### Changes to `SocorroFinalCTA.tsx`

**Headline**: `"You Now Know What the Gap Looks Like."` / `"Are You Going to Close It — or Hope It Closes Itself?"`

Body stays the same (already works with the new narrative).

### Files to edit
1. `src/components/socorro/SocorroHero.tsx` — headline, subheadline, body paragraphs
2. `src/components/socorro/SocorroFinalCTA.tsx` — closing headline update

