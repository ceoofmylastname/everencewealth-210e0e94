

## Redesign /response-card — Typeform-Style Multi-Step Form

Transform the current single-page form into an animated, multi-step experience matching the brand aesthetic (dark cinematic theme, gold accents, framer-motion transitions, confetti on completion).

### Design Approach
- **Dark cinematic background** (#080f0b) matching TrainingEvent and homepage
- **Multi-step wizard** — one question (or small group) per screen, Typeform-style
- **Framer Motion AnimatePresence** for slide/fade transitions between steps
- **Progress bar** with gold accent showing completion percentage
- **Confetti burst** on successful submission (canvas-confetti, brand colors)
- **Rich success card** with selected advisor name, glassmorphism styling, animated check icon

### Steps Breakdown (8 steps)
1. **Select Your Agent** — styled dropdown with advisor photos/names
2. **Your Name** — first + last name side by side
3. **About You** — marital status as clickable pill buttons (not radio inputs)
4. **Contact Info** — email + phone
5. **Your Address** — street, city, state, zip
6. **Financial Profile** — income range as selectable cards + consultation yes/no toggle
7. **Meeting Interests** — topic checkboxes as selectable cards + availability textarea
8. **Final Comments** — optional comments + submit button

### Navigation
- "Continue" button (gold, animated) advances to next step
- "Back" arrow to go to previous step
- Enter key advances on text fields
- Step counter: "Step 3 of 8"

### Success Screen
- Confetti (brand gold + green)
- Glassmorphism card with animated checkmark
- "Thank you, [First Name]!" heading
- "Your selected advisor, **[Advisor Name]**, will be reaching out to you shortly."
- "Return Home" button

### Technical Details
- **File modified**: `src/pages/ResponseCard.tsx` (full rewrite)
- **Dependencies used**: framer-motion (already installed), canvas-confetti (already installed)
- **No database changes** — same submission logic, same table
- **Same zod validation** — validated per-step before advancing
- Everence Wealth navbar at top with logo + "Response Card" label
- Mobile-responsive throughout

