

# Turn Grey Text to Gold Across All Dark Sections

## Problem
All the small, secondary, and label text on the dark background sections appears as barely-visible grey (`text-white/40` to `text-white/65`). The user wants these changed to **gold** (`text-[#D4AF37]` or `text-primary`) to match the logo and brand identity, making the content pop and feel cohesive.

## Scope
Every `text-white/XX` instance used for **labels, badges, subtitles, descriptions, and supporting copy** on dark backgrounds will be converted to gold. White headlines and primary text remain white for contrast hierarchy.

## Rules
- **Headlines (h1, h2, h3)**: Stay `text-white` (they're already visible)
- **Badges, labels, tracking-text**: Change to `text-primary` (gold)
- **Subtitles and paragraphs**: Change to `text-primary/80` or `text-primary/70`
- **List items and descriptions**: Change to `text-primary/60` or `text-primary/70`
- **Side decorative text**: Change to `text-primary/50`

## Files and Changes

### 1. `src/components/home/sections/Hero.tsx`
- Side text "WEALTH ARCHITECTURE" / "STRATEGIC FIDUCIARY": `text-white/40` to `text-primary/50`
- Badge: `text-white/60` to `text-primary/70`
- "the": `text-white/50` to `text-primary/60`
- Subline1: `text-white/80` to `text-primary/80`
- HUD labels: `text-white/45` to `text-primary/60`
- HUD values: `text-white/65` and `text-white/75` to `text-primary/70` and `text-primary/80`
- CTA button text: `text-white/70` to `text-primary/70`

### 2. `src/components/homepage/TaxBuckets.tsx`
- Badge: `text-white/55` to `text-primary/70`
- Subtitle: `text-white/55` to `text-primary/70`
- Bucket labels: `text-white/50` to `text-primary/60`
- Bucket treatment text: `text-white/70` to `text-primary/80`
- Bucket examples: `text-white/55` to `text-primary/60`
- CTA button: `text-white` to `text-primary`

### 3. `src/components/homepage/WealthPhilosophy.tsx`
- Badge: `text-white/50` to `text-primary/60`
- Paragraph: `text-white/65` to `text-primary/70`
- List items: `text-white/60` to `text-primary/60`
- HLV paragraph: `text-white/65` to `text-primary/70`
- Living benefit descriptions: `text-white/55` to `text-primary/60`

### 4. `src/components/homepage/SilentKillers.tsx`
- Badge: `text-white/40` to `text-primary/60`
- Descriptions: `text-white/60` to `text-primary/70`

### 5. `src/components/homepage/Services.tsx`
- Descriptions: `text-white/50` to `text-primary/60`
- List items: `text-white/60` to `text-primary/70`

### 6. `src/components/homepage/BlogPreview.tsx`
- Subtitle: `text-white/50` to `text-primary/60`
- Article descriptions: `text-white/50` to `text-primary/60`

### 7. `src/components/homepage/FAQ.tsx`
- Answer text: `text-white/60` to `text-primary/70`

### 8. `src/components/homepage/Assessment.tsx`
- Subtitle: `text-white/60` to `text-primary/70`
- Step descriptions: `text-white/50` to `text-primary/60`

### 9. `src/components/homepage/Stats.tsx`
- Stat labels: `text-white/50` to `text-primary/60`

### 10. `src/components/homepage/WakeUpCall.tsx`
- Quote author: `text-white/50` to `text-primary/60`

### 11. `src/components/homepage/FiduciaryDifference.tsx`
- Subtitle: `text-white/70` to `text-primary/80`
- Feature items: `text-white/60` to `text-primary/70`
- List items: `text-white/80` to `text-primary/80`

### 12. `src/components/homepage/CTA.tsx`
- Subtitle: `text-white/60` to `text-primary/70`

## Result
All secondary copy on dark backgrounds will render in **brand gold** at varying opacities, creating a cohesive luxury gold-on-dark aesthetic that matches the Everence logo.

