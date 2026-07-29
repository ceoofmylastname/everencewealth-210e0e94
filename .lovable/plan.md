## Goal
Add David Rosenberg as Co-Founder & Chief Operating Officer to the About page and the Team page, with his uploaded headshot.

## Current state (verified)
- The About page renders its founder cards from `about_page_content.founders` (JSON), which is currently **empty** — so the "Meet The Founders" section shows nothing today.
- The Team page reads `team_members`, which currently contains only **Steven Rosenberg** (Founder & Chief Wealth Strategist, no photo).

## Steps

1. **Host the headshot**
   Upload `David_Rosenberg_Headshot_edited.png` to a public storage bucket (or CDN asset) and get a stable public URL, since both the About founders JSON and `team_members.photo_url` need a URL string.

2. **About page — founders section**
   Add David's entry to `about_page_content.founders`:
   - Name: David Rosenberg
   - Role: Co-Founder & Chief Operating Officer
   - Bio: the supplied paragraph
   - Photo: hosted headshot URL
   - LinkedIn: `https://www.linkedin.com/in/david-rosenberg-201194137/` (redirect param stripped)
   - Specialization: Operations, Advisor Training & Client Service
   - Languages: English
   This makes the "Meet The Founders" section visible again with David's card (existing card layout, no design changes).

3. **Team page**
   Insert David into `team_members` with the same name/role/bio/photo/LinkedIn, `is_founder = true`, `display_order = 2` so he appears after Steven.

## Notes
- No layout or component changes needed — both pages already render whatever records exist.
- Steven's About-page card is not added in this pass (his data isn't in the founders JSON); tell me if you also want him added there so the section shows both founders.
