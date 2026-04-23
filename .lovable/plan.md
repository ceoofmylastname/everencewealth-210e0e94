

## Fix the blue-flash on `everencewealth.com` before the green hero loads

### Root cause (confirmed)

The file Cloudflare serves at `https://everencewealth.com/` is `dist/index.html`, which is **pre-rendered at build time** by `scripts/generateStaticHomePage.ts`. That script injects a static SEO hero block:

```html
<section class="static-hero">  <!-- background: linear-gradient(135deg, hsl(220 20% 12%), hsl(220 20% 10%)) -->
  <h1>Architecting Your <span>Financial Legacy</span></h1>
  …
</section>
```

`--prime-900: 220 20% 12%` and `--prime-950: 220 20% 10%` are **dark slate-blue / navy** — that's the blue you see for ~300–800 ms. Then React hydrates, mounts `src/pages/Home.tsx → <Hero />` which uses `bg-dark-bg` (`#020806`, near-black with green tint), and the rest of the site replaces it.

So it's not a CSS bug — it's a **stale pre-rendered static hero** that doesn't match the current React hero anymore.

### Bonus issues found in the same file

- Line 501-504 of `scripts/generateStaticHomePage.ts` still renders legacy real-estate links: `Properties`, `Buyers Guide`. This violates `mem://project/cleanup-legacy-purge` and would also be visible in the flash for SEO crawlers.
- Hero copy says "Architecting Your Financial Legacy" — the live React hero says "BRIDGE THE RETIREMENT GAP". Mismatch hurts both the visual continuity and Google's first-paint signal.

### Fix plan

Update `scripts/generateStaticHomePage.ts` so the pre-rendered hero **visually matches** the React hero. Two color/copy changes — no architecture change, no new files.

**1. Recolor the static hero to match `bg-dark-bg` (`#020806`)**

In `CRITICAL_CSS` (lines 200-210), repoint the prime-900/950 vars used by `.static-hero`:

```css
--prime-900: 160 48% 4%;   /* was 220 20% 12% — dark blue-gray */
--prime-950: 160 48% 3%;   /* was 220 20% 10% — dark blue-gray */
```

These HSL values produce near-black with the same green tint as `#020806`, eliminating the blue cast. The `.hero-highlight` (`--prime-gold`) stays gold, matching the React hero's `text-primary` accent.

Add a subtle radial-gradient overlay in `.static-hero` (mirroring the React hero's mesh-gradient blobs) so the static frame and the React frame are visually indistinguishable during hydration:

```css
.static-hero {
  background:
    radial-gradient(60vw 60vw at 10% 30%, hsla(160,48%,25%,0.12), transparent 70%),
    radial-gradient(50vw 50vw at 100% 100%, hsla(160,48%,30%,0.08), transparent 70%),
    linear-gradient(135deg, hsl(var(--prime-900)), hsl(var(--prime-950)));
}
```

**2. Replace the static hero copy with the live React hero copy**

In the `META` map (lines 50-66) update both EN and ES:
- `heroHeadline` → `"Bridge the Retirement"`
- `heroHighlight` → `"Gap"`
- `heroDescription` → US-market subline matching `homepage.hero.subline1`/`subline2` from the EN translations file
- `speakableSummary` → keep, but rewrite to use the new positioning ("Independent broker offering tax-free retirement strategies…")
- ES variants translated equivalently

**3. Purge the legacy real-estate nav links from the static header**

Lines 500-505 — replace with the actual current nav (`Strategies`, `Philosophy`, `About`, `Blog`, `Contact`) so crawlers and the flash both reflect the real site:

```html
<nav>
  <a href="/en/strategies">Strategies</a>
  <a href="/en/philosophy">Philosophy</a>
  <a href="/en/about">About</a>
  <a href="/en/blog">Blog</a>
  <a href="/en/contact">Contact</a>
</nav>
```

**4. Add `theme-color` matching the new hero**

In the `<head>` of the static template, set `<meta name="theme-color" content="#020806">` (currently `#d4a574` in `index.html`, which causes mobile browser chrome to flash tan). This eliminates the mobile address-bar color flash too.

### Files to change

- `scripts/generateStaticHomePage.ts` — only file touched
  - `CRITICAL_CSS` block: recolor `--prime-900` / `--prime-950`, add gradient overlay
  - `META` (EN + ES): update hero headline / highlight / description / speakable
  - `<head>`: change `theme-color` meta
  - `<header>` static nav: remove `Properties` + `Buyers Guide`, replace with live nav

### Out of scope

- No change to React `<Hero />` — it stays exactly as-is
- No change to `index.html`, `app-shell.html`, `_middleware.js`, or sitemap files
- No DB or edge function changes
- ES translations of the new headline are direct equivalents; if you want a different ES tagline, say so

### Verification

After deploy:
1. Hard-refresh `https://everencewealth.com/` in an incognito window (or throttle to Slow 3G).
2. Watch the first paint — should be near-black with subtle green tint and "Bridge the Retirement Gap" copy. No blue cast, no copy swap.
3. View source — `<section class="static-hero">` headline reads "Bridge the Retirement", highlight "Gap".
4. Mobile Safari address bar should be near-black, not tan.
5. The transition into the hydrated React hero should be visually seamless (only the animated letters/particles arriving differ).

