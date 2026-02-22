

# Portal Onboarding Tour -- First-Time Welcome Experience

## Overview
A multi-step guided tour that appears as a fullscreen modal overlay the first time an advisor signs in. Each step highlights one sidebar navigation group with a modern, animated design. Users can click "Next" to advance or "X" to dismiss. The tour state persists in localStorage so it only shows once.

## Tour Steps (5 total)

1. **Welcome / Portal** -- "Your command center. The Dashboard gives you a full snapshot of your business. Clients lets you invite and manage clients. Policies tracks all active coverage. CNA helps you understand each client's needs. Messages keeps the conversation going."

2. **Market** -- "Stay ahead of the industry. Browse Carriers, read the latest News, and track your Performance all in one place."

3. **Resources** -- "Everything you need to grow. Access quoting Tools, complete Training courses, grab Marketing materials, and manage your Schedule."

4. **Contracting** -- "Onboard new agents seamlessly. Track the full pipeline from application to completion, manage documents, and monitor analytics."

5. **Compliance** -- "Stay compliant and organized. Monitor licensing, manage documents, invite clients, and configure your settings."

## Visual Design

- Fullscreen semi-transparent backdrop (blur effect)
- Centered card (max-w-lg) with smooth slide/fade animations between steps
- Each step features:
  - Large icon cluster representing the section (using existing Lucide icons)
  - Section name as a styled heading
  - Brief description paragraph
  - Step indicator dots at the bottom
  - "Next" button (brand green) + "Skip Tour" text link
  - Final step shows "Get Started" button instead of Next
- Mobile: card goes full-width with adjusted padding, larger touch targets

## Persistence

- Uses `localStorage` key `portal_tour_completed` set to `true` on dismiss or completion
- Checked on mount in PortalLayout -- if not set and user is an advisor, show the tour

## Technical Details

### New File
`src/components/portal/PortalOnboardingTour.tsx` -- Self-contained tour component with all 5 steps, animations via Framer Motion, and localStorage logic.

### Modified File
`src/components/portal/PortalLayout.tsx` -- Import and render `<PortalOnboardingTour />` inside the layout, passing `isAdvisor` and `portalUser` to control visibility.

### Implementation Notes
- Uses Framer Motion `AnimatePresence` + `motion.div` for step transitions (slide left/right + fade)
- Each step has a curated icon grid showing the nav items for that section
- Step dots are clickable for random access
- Responsive: on mobile the card is nearly full-screen with bottom-anchored buttons
- No database changes needed -- localStorage is sufficient for this feature
