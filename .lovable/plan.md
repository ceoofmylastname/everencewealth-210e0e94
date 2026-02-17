

# Improve Text Visibility on Dark Sections

## Problem
Across the homepage, several sections use a near-black background (`#020806`) with extremely low-opacity white text (`text-white/25`, `text-white/30`, `text-white/40`). This makes the copy almost invisible to users -- particularly the Hero subline, badges, labels, and supporting text in the TaxBuckets and WealthPhilosophy sections.

## Solution
Increase text contrast across all dark-background sections while adding subtle visual enhancements (gradient accents, gold highlights) to maintain the premium editorial look without sacrificing readability.

## Files to Update

### 1. `src/components/home/sections/Hero.tsx`
- **Badge** (`text-white/40`): Bump to `text-white/60` with a subtle gold border accent
- **"the"** (`text-white/40`): Increase to `text-white/50`
- **sublineSmall** (`text-white/25` at 9px): Increase to `text-white/50` at `text-[10px]` and add a gold left-border accent or use `text-primary/60` for the gold color to make it pop
- **Side text** (`text-white/30`): Increase to `text-white/40`
- **HUD panel labels** (`text-white/30`): Increase to `text-white/45`
- **HUD panel values** (`text-white/50`, `text-white/60`): Increase to `text-white/65` and `text-white/75`

### 2. `src/components/homepage/TaxBuckets.tsx`
- **Badge** (`text-white/40`): Increase to `text-white/55`
- **Subtitle** (`text-white/40`): Increase to `text-white/55`
- **Bucket labels** (`text-white/30`): Increase to `text-white/50`
- **Bucket descriptions** (`text-white/40`, `text-white/60`): Increase to `text-white/55` and `text-white/70`
- **Quote** (`text-white/30`): Increase to `text-white/50` with a gold tint via `text-primary/50`

### 3. `src/components/homepage/WealthPhilosophy.tsx`
- **Badge** (`text-white/30`): Increase to `text-white/50`
- **Paragraph** (`text-white/50`): Increase to `text-white/65`
- **List items** (`text-white/50`): Increase to `text-white/60`
- **Living benefit descriptions** (`text-white/40`): Increase to `text-white/55`
- **HLV paragraph** (`text-white/50`): Increase to `text-white/65`

## Design Principle
The goal is to raise minimum opacity from 25-30% to 45-55% for secondary text, and from 40-50% to 60-70% for body/supporting text, while keeping the visual hierarchy intact (headlines still brightest, labels still subtlest, but all readable).

