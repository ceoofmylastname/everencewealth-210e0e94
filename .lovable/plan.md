
# Portal Login Redesign — Split-Screen Animated Layout

## Concept: "Executive Split"

A full-screen two-panel layout — left side is the brand panel with animated elements, right side is the clean white login form. This is a premium, creative, and unique design inspired by top-tier SaaS and financial platforms.

---

## Layout Structure

```text
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  LEFT PANEL (55% width)         RIGHT PANEL (45% width)    │
│  ─────────────────────────────  ──────────────────────────  │
│  Deep brand green background    Pure white background       │
│  #0B1F16 → #1A4D3E gradient     Clean & minimal             │
│                                                             │
│  ┌──────────────────────────┐   ┌────────────────────────┐  │
│  │  Logo (top-left)         │   │                        │  │
│  │                          │   │   Welcome back         │  │
│  │  Animated floating       │   │   Sign in to access    │  │
│  │  abstract mesh shapes    │   │   your portal          │  │
│  │  (brand green + gold     │   │                        │  │
│  │   gradient orbs)         │   │  [Email Input]         │  │
│  │                          │   │  [Password Input]      │  │
│  │  ┌────────────────────┐  │   │  [Forgot Password]     │  │
│  │  │ "Protecting what   │  │   │                        │  │
│  │  │  matters most."    │  │   │  [Sign In Button]      │  │
│  │  │                    │  │   │                        │  │
│  │  │ Tagline below      │  │   │  © 2026 Everence       │  │
│  │  └────────────────────┘  │   └────────────────────────┘  │
│  │                          │                               │
│  │  3 feature bullets        │                              │
│  │  with gold check icons   │                               │
│  └──────────────────────────┘                               │
└─────────────────────────────────────────────────────────────┘
```

On **mobile** (< lg breakpoint): The left panel collapses and the right panel becomes full-screen with a subtle dark-to-evergreen gradient background, logo at top.

---

## Left Panel Design (Brand Side)

### Background
- Deep gradient: `from-[#071912] via-[#0F2922] to-[#1A4D3E]`
- Animated floating orbs using CSS keyframe animations (Framer Motion)
- Subtle noise/grain texture overlay (CSS pseudo-element)

### Animated Elements
1. **Large blurred orbs** (3 orbs, different sizes):
   - Orb 1: Gold `hsla(51,78%,65%,0.12)` — slow float up/down (8s cycle)
   - Orb 2: Evergreen `rgba(26,77,62,0.4)` — float diagonal (12s cycle)
   - Orb 3: Gold `hsla(51,78%,65%,0.06)` — very slow rotation (20s cycle)

2. **Decorative grid lines** — ultra-faint white lines forming a subtle geometric pattern in the background

3. **Animated brand badge** — Logo image fades in with a subtle upward entrance (Framer Motion `initial: opacity 0, y: 20` → `animate: opacity 1, y: 0`)

### Content (bottom-aligned)
```
[Everence Logo Image — large, centered]

"Protecting what matters most."
(Serif, white, 36px, font-light)

"Trusted wealth protection for families and advisors."
(Small, white/60, 14px)

────────────────────────────────

✓  Personalized Financial Planning
✓  Life & Annuity Portfolio Management  
✓  Dedicated Advisor Support

(Each bullet fades in with staggered delay)
```

### Feature Bullets
- Gold checkmark circle icon (`text-[hsla(51,78%,65%,1)]`)
- White text for feature name, white/50 for sub-description

---

## Right Panel Design (Form Side)

### Background
- Pure white `bg-white`
- Centered content with generous padding

### Form Content (vertically centered)
```
[Logo — smaller, for mobile only / or show on right always]

"Welcome back"        ← text-gray-400 small label
"Sign in to your portal"  ← text-gray-900 text-2xl font-bold

Horizontal divider

[Email field]
Label: "Email address" — text-gray-600 text-sm
Input: Clean, border-gray-200, focus ring brand-green

[Password field]
Label: "Password" — with "Forgot password?" link (brand green, right-aligned)
Input: Clean with eye toggle

[Sign In button]
Full width, bg-[#1A4D3E], white text, rounded-xl
Subtle shadow: shadow-lg shadow-[#1A4D3E]/20
Hover: slight lighter green + scale(1.01)

[Error messages]
Inline below button — red-50 bg, red-700 text

[Success messages]  
emerald-50 bg, emerald-700 text
```

### Entrance Animation (Framer Motion)
- Right panel form elements stagger in from right with `x: 20` offset, fading to opacity 1
- Each field animates in with 100ms delay between elements

---

## Animations Detail

### Framer Motion Entrance
```jsx
// Left panel brand content
initial={{ opacity: 0, x: -30 }}
animate={{ opacity: 1, x: 0 }}
transition={{ duration: 0.8, ease: "easeOut" }}

// Right panel form
initial={{ opacity: 0, x: 30 }}
animate={{ opacity: 1, x: 0 }}
transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}

// Staggered form elements
// Each child: delay increments by 0.1s
```

### CSS Keyframe Orbs
```css
@keyframes float-slow {
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-30px) scale(1.05); }
}
/* Applied via inline style: animation: float-slow 10s ease-in-out infinite */
```

### Sign In Button
- `transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]`
- Loading state: spinner icon + "Signing in..." text

---

## Color Breakdown

| Element | Color |
|---|---|
| Left panel bg | `#071912` → `#1A4D3E` gradient |
| Right panel bg | `#FFFFFF` |
| Logo text | White (left), Gray-900 (right mobile) |
| Headline | White serif |
| Feature bullets | White + gold check icons |
| Form labels | `#374151` gray-700 |
| Input borders | `#E5E7EB` gray-200 |
| Input focus ring | `#1A4D3E` brand green |
| Sign In button | `#1A4D3E` bg, white text |
| Forgot password | `#1A4D3E` brand green link |
| Footer | `#9CA3AF` gray-400 |

---

## Files Changed

- **`src/pages/portal/PortalLogin.tsx`** — Complete visual rewrite. All existing auth logic (Supabase calls, navigation, error handling) remains 100% intact. Only JSX and className strings change.

No database changes. No logic changes.
