

# Replace Desktop Navbar with 3D Adaptive Navigation Pill

## Overview
Replace the current desktop navigation menu with the 3D adaptive pill component, adapted to match the site's dark evergreen/gold brand palette. The mobile menu and logo/right-side actions remain unchanged -- only the center desktop menu area gets the new pill.

## What Changes

### 1. New file: `src/components/ui/3d-adaptive-navigation-bar.tsx`
Create the pill component adapted for this site:
- **Brand colors**: Replace the silver/light pill with a dark evergreen (`#1A4D3E`) base and gold (`#C5A059`) accents
- **Navigation items**: Philosophy, Strategies, Education, About (matching current nav structure)
- **Font**: Use `font-nav` (Raleway) to match existing nav typography
- **Text colors**: White/gold instead of dark gray -- collapsed label in white, expanded items in white with gold active state
- **Gloss/shadow layers**: Tinted with evergreen and gold instead of gray
- **Routing integration**: Each item navigates using `react-router-dom` `useNavigate` with the current language prefix
- **Dropdown support**: Strategies, Education, and About will show dropdown submenus on click (matching current dropdown content with icons)
- **Collapsed state**: Shows the active section label in the pill
- **Expanded state**: Shows all 4 nav items horizontally with hover/active styling

### 2. Update: `src/components/home/Header.tsx`
- Replace the center `<Menu>` component block (the `hidden lg:flex items-center justify-center` div) with the new `<NavigationPill />` component
- Remove imports for the old `Menu`, `MenuItem`, `HoveredLink` from `navbar-menu`
- The pill will be positioned in the center column of the existing grid layout
- Keep logo (left), right-side actions (language switcher, Get Started button, Portal link), and mobile menu completely unchanged

### 3. No changes to:
- Mobile menu (stays as-is)
- Logo and right-side actions
- `tailwind.config.ts` (brand colors already defined)
- `framer-motion` (already installed)

## Technical Details

### Pill Visual Adaptation
| Original (Light) | Brand Adapted (Dark) |
|---|---|
| White/silver base | `bg-prime-900/95` with evergreen gradient overlay |
| Gray text `#656565` | `text-white/70` for inactive items |
| Dark text `#1a1a1a` active | `text-prime-gold` for active item |
| Gray shadows | Gold-tinted shadows (`shadow-prime-gold/10`) |
| White gloss highlights | Subtle white/5 and gold/10 highlights |

### Navigation Items with Dropdowns
- **Philosophy**: Direct link to `/{lang}/philosophy` (no dropdown)
- **Strategies**: Dropdown with IUL, Whole Life, Tax-Free Retirement, Asset Protection
- **Education**: Dropdown with Blog, Q&A, Financial Terms
- **About**: Dropdown with Our Team, Why Fiduciary, Client Stories

### Expanded pill width
- Adjusted from 580px to ~520px to fit 4 items comfortably
- Collapse timeout remains 600ms for smooth UX

