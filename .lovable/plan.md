
# Celebration Button with Confetti After Screenshot Upload

## What Changes

### Modified: `SureLCSetup.tsx`

After the screenshot is successfully uploaded, instead of just showing a static "Screenshot Uploaded!" message, the component will:

1. **Show a celebration button** that only appears once the screenshot is uploaded
2. **On click, fire a massive confetti explosion** from both sides of the screen using a lightweight canvas-based confetti function (no new dependencies -- we'll use a self-contained confetti utility)
3. **Display an epic congratulations message** personalized with the agent's first name:
   - "You're officially a Gladiator in a Suit!"
   - "Let's go help families, {firstName}!"
   - Celebratory styling with the brand green/gold palette, animated entrance

### Confetti Implementation (no new packages)
A small `fireConfetti()` utility function will be added directly inside the component file. It creates a temporary canvas overlay and shoots colorful particles from both the left and right edges of the screen simultaneously. The canvas auto-removes after the animation completes (~3 seconds). Colors will use brand green and gold plus celebratory extras.

### Flow
1. Agent uploads screenshot -- upload zone changes to green success state (existing)
2. A bold "Complete Your Onboarding" button appears below the success state, pulsing with brand gold
3. Agent clicks the button -- confetti erupts from both sides, button transforms into a full celebration card:
   - Shield/trophy icon
   - "CONGRATULATIONS, {firstName}!"
   - "You're officially a Gladiator in a Suit."
   - "Let's go help families, {firstName}!"
   - Animated fade-in with scale effect
4. After a 4-second delay, the page reloads to advance the pipeline (replaces the current 2-second auto-reload)

### Visual Design
- The celebration card uses the brand gradient background (deep green to teal)
- Gold accent sparkle effects
- Text is white with gold highlights for "Gladiator in a Suit"
- Smooth `animate-fade-in` and `animate-scale-in` entrance animations

## Technical Details

| Item | Detail |
|---|---|
| Files modified | `SureLCSetup.tsx` |
| New dependencies | None (confetti is self-contained canvas code) |
| New state | `showCelebration` boolean |
| DB changes | None |
| Behavior change | Replaces auto-reload with button-triggered celebration, then reload after 4s |
