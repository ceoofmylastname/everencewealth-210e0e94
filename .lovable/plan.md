

# Typeform-Style Assessment Page

## What We're Building
A modern, full-screen assessment experience at `/assessment` -- similar to Typeform -- that walks visitors through a few questions about their tax-free retirement goals, collects their contact info, then celebrates with confetti and a personalized congratulations banner.

## User Flow

1. **Slide 1**: "What is your primary retirement concern?" (multiple choice)
2. **Slide 2**: "What is your current age range?" (multiple choice)  
3. **Slide 3**: "How familiar are you with tax-free retirement strategies?" (multiple choice)
4. **Slide 4**: Contact info form -- First Name, Last Name, Email, Phone
5. **On Submit**: Form disappears, confetti bursts from both sides, and a banner appears: "Congratulations [First Name]! You've completed the assessment. A licensed advisor will contact you shortly."

## Technical Plan

### 1. Database Table
Create an `assessment_leads` table to store submissions:
- `id` (uuid, primary key)
- `first_name` (text, not null)
- `last_name` (text, not null)
- `email` (text, not null)
- `phone` (text)
- `retirement_concern` (text)
- `age_range` (text)
- `tax_strategy_familiarity` (text)
- `created_at` (timestamptz)

RLS policy: Allow anonymous inserts (public-facing form), restrict reads to authenticated admins only.

### 2. New Page: `src/pages/Assessment.tsx`
- Full-screen, dark glassmorphic background matching the brand aesthetic
- One question per screen with smooth slide transitions (framer-motion)
- Progress bar at top showing completion percentage
- Keyboard-friendly: press Enter or click to advance
- Back button to revisit previous questions
- Final slide: validated contact form (zod + react-hook-form)
- On submit: save to `assessment_leads`, trigger confetti + congratulations banner

### 3. Confetti Effect
A custom canvas-based confetti animation that fires from both left and right edges of the screen when the form is submitted. No external library needed -- lightweight CSS/JS particle effect.

### 4. Congratulations Banner
After confetti, a centered card fades in with:
- "Congratulations, [First Name]!"
- "You've completed the assessment"
- "A licensed advisor will contact you shortly"
- A button to return to the homepage

### 5. Route Registration
Add `/assessment` route to `src/App.tsx` pointing to the new Assessment page.

### 6. Fix Hero Button
The existing "Begin Assessment" link in the Hero already points to `/assessment` -- it will work automatically once the route exists.

## Files Changed
- **New**: `src/pages/Assessment.tsx` -- the full assessment experience
- **Modified**: `src/App.tsx` -- add the `/assessment` route
- **Database**: Create `assessment_leads` table with RLS policies
