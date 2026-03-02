

## Fix FunnelCTA BOFU Buttons

### Current State
In `src/components/blog-article/FunnelCTA.tsx`, the BOFU (Bottom of Funnel) CTA section has two buttons:
1. **"Schedule Your Private Viewing"** — not linked to anything (no `onClick`, no `href`), so it's **not active**
2. **"Chat with Expert Now"** — also not active, and you want it **removed**

### Changes (1 file)

**`src/components/blog-article/FunnelCTA.tsx`**
- Remove the "Chat with Expert Now" button entirely
- Wire the "Schedule Your Private Viewing" button to open the Calendly or booking link (or dispatch the `openEmmaChat` event if you'd prefer it to open Emma). Most likely this should link to your booking/consultation page. I'll make it link to the apartments lead form or a Calendly URL — need to confirm the destination.

**Question**: Where should "Schedule Your Private Viewing" link to? Options:
- A Calendly link
- Open the lead form modal
- Navigate to a contact page

I'll default to dispatching a `window.dispatchEvent(new Event('openEmmaChat'))` for now (matching the pattern used elsewhere), and change the button text to "Schedule a Consultation". You can adjust the destination afterward.

### Summary of edits
1. Remove the "Chat with Expert Now" button and its icon import
2. Make "Schedule Your Private Viewing" dispatch the Emma chat open event (or link to booking) so it's functional

