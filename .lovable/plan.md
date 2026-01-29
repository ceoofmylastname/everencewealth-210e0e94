
# Add Click Interactivity to Founders Section on About Page

## Problem
The "Meet The Founders" section on the About page displays founder cards, but clicking on them does nothing. Users expect to click a card to see more details (similar to how the Team page works).

## Solution
Add click handling and modal functionality to the `FounderProfiles.tsx` component, reusing the existing `TeamMemberModal` component for consistency.

---

## Implementation Steps

### Step 1: Update FounderProfiles Component

Add state management and click handlers to make founder cards interactive:

- Import `useState` from React
- Import the existing `TeamMemberModal` component  
- Add `selectedFounder` state to track which founder was clicked
- Add `onClick` handler to each founder card
- Add cursor pointer styling to indicate cards are clickable
- Render `TeamMemberModal` at the bottom of the component

### Step 2: Transform Founder Data for Modal

The `FounderProfiles` component uses a simpler `Founder` interface than the `TeamMember` interface expected by `TeamMemberModal`. Need to map the founder data to match:

| Founder Field | Maps To TeamMember Field |
|--------------|-------------------------|
| `name` | `name` |
| `role` | `role` |
| `bio` | `bio` |
| `photo_url` | `photo_url` |
| `linkedin_url` | `linkedin_url` |
| `languages` | `languages_spoken` |
| `credentials` | `credentials` |
| `years_experience` | `years_experience` |
| `specialization` | `specializations` (as array) |

### Step 3: Add Visual Click Affordance

Make it clear the cards are clickable:
- Add `cursor-pointer` class to cards
- Add hover effect enhancement (slight scale or lift)
- Keep the existing hover shadow effect

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/about/FounderProfiles.tsx` | Add state, click handler, modal, data transformation |

---

## Technical Details

```text
Component Flow:
┌─────────────────────────────────────────┐
│         FounderProfiles                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │  Card 1  │ │  Card 2  │ │  Card 3  │ │
│  │  onClick │ │  onClick │ │  onClick │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ │
│       │            │            │       │
│       └────────────┼────────────┘       │
│                    ▼                    │
│          setSelectedFounder(founder)    │
│                    │                    │
│                    ▼                    │
│            TeamMemberModal              │
│         (reused from Team page)         │
└─────────────────────────────────────────┘
```

The transformation creates a compatible TeamMember object:
```typescript
const transformedMember = {
  id: founder.name.toLowerCase().replace(/\s+/g, '-'),
  name: founder.name,
  role: founder.role,
  bio: founder.bio,
  photo_url: founder.photo_url,
  linkedin_url: founder.linkedin_url,
  languages_spoken: founder.languages,
  credentials: founder.credentials,
  years_experience: founder.years_experience,
  specializations: [founder.specialization],
  is_founder: true,
  // Nullable fields
  role_translations: null,
  bio_translations: null,
  email: null,
  phone: null,
  whatsapp: null,
  areas_of_expertise: null
};
```

---

## Expected Result

After implementation:
- Clicking any founder card opens a modal with full details
- Modal shows the founder's photo, bio, languages, credentials
- Modal has WhatsApp, Email, and Call buttons
- LinkedIn button in modal links to their profile
- Contact form available in modal
- Clicking outside modal or X button closes it
