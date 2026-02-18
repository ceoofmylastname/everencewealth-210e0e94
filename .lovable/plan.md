

# Change All Green Text to #EDDB77 (Light Gold)

## Problem
All text using `text-primary` renders as dark green (HSL `160 48% 21%`). The user wants this changed to `#EDDB77` -- a warm light gold.

## Solution
Update the `--primary` CSS variable in `src/index.css` from the green value to the HSL equivalent of `#EDDB77`, which is `51 78% 70%`. This single change will cascade across every component using `text-primary`, `bg-primary`, `border-primary`, etc.

## File: `src/index.css`

### Light mode (line 26)
- `--primary: 160 48% 21%;` --> `--primary: 51 78% 70%;`

### Dark mode (line 74)
- `--primary: 160 48% 30%;` --> `--primary: 51 78% 70%;`

### Sidebar variants (lines 51, 94)
- `--sidebar-primary: 160 48% 21%;` --> `--sidebar-primary: 51 78% 70%;`
- `--sidebar-primary: 160 48% 30%;` --> `--sidebar-primary: 51 78% 70%;`

## Impact
This changes the primary color globally, affecting:
- All `text-primary/XX` labels, badges, subtitles (the gold text we just set up)
- Button backgrounds using `bg-primary`
- Border accents using `border-primary`
- Glow effects, gradients, and animations referencing `hsl(var(--primary))`

All will shift from green to `#EDDB77` gold automatically.

