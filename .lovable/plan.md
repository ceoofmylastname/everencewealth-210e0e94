

## Chat Buttons Across the Site — Audit

Here are all the places that have "Chat with Emma" or similar chat trigger buttons:

### Currently Active Chat Buttons

| Location | File | Button Text | Action |
|----------|------|-------------|--------|
| **About Page CTA** | `src/components/about/AboutCTA.tsx` | "Chat with Emma" | Opens Emma chat |
| **Landing Page Sticky Button** | `src/components/landing/StickyActionButton.tsx` | "Chat with Emma Now" | Opens Emma chat |
| **Landing Page Video CTA** | `src/components/landing/AutoplayVideo.tsx` | Golden button over video | Opens Emma chat |
| **Landing Emma Section** | `src/components/landing/EmmaSection.tsx` | Emma intro card | Opens Emma chat |
| **Location Pages CTA** | `src/components/location/LocationCTASection.tsx` | "Chat with EMMA" | Opens Emma chat |
| **Retargeting Page** | `src/components/retargeting/RetargetingEmmaSection.tsx` | Emma CTA button | Opens Emma chat |
| **Blog Articles** | `src/components/blog-article/BlogEmmaChat.tsx` | Floating chat bubble (bottom-right) | Opens Emma chat |
| **Blog BOFU CTA** | `src/components/blog-article/FunnelCTA.tsx` | "Schedule a Consultation" | Opens Emma chat |
| **Client Stories CTA** | `src/components/client-stories/CSCTA.tsx` | "Get Your Free Consultation" | Opens Emma chat |
| **Comparison Page** | `src/pages/ComparisonPage.tsx` | Chat click handler | Opens Emma chat |
| **Brochure Pages** | `src/components/brochures/BrochureChatbot.tsx` | Floating chat bubble | Opens separate brochure chatbot |
| **Apartments Landing** | `src/pages/apartments/ApartmentsLanding.tsx` | Multiple triggers | Opens Emma chat |
| **Explainer Video** | `src/components/landing/ExplainerVideo.tsx` | Button under video | Opens Emma chat |

### Which Should Be Removed?

Before I remove anything, I need to know your intent:

- **Remove ALL chat buttons site-wide?** (Emma chat completely gone)
- **Keep some specific ones?** (e.g., keep the floating bubble on blog, remove the rest)
- **Only remove the ones that say "Chat with Emma" specifically?** (keep consultation/booking CTAs)

Please let me know which ones to remove and I'll make the changes.

