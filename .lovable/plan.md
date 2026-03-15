

## Rewrite /socorro-isd — Post-Workshop Discovery Call Page

### Context Shift
The current page speaks to people who haven't attended the workshop yet ("Reserve Your Seat," "Join us for an exclusive financial education session"). The new audience has **already attended** the workshop and is now considering booking a free discovery call to look deeper into their finances. The copy needs to reflect that shift: they've seen the information, now it's time to act.

### Copy Framework: Hook → Story → Offer

**Structure (same components, new copy):**

#### 1. SocorroNavbar
- Badge text: keep "Socorro ISD" branding
- CTA button: "Book Now" → **"Book Your Call"**

#### 2. SocorroHero (THE HOOK)
- Badge: `"SISD OFFICIAL VENDOR · LIMITED DISCOVERY SESSIONS"`
- Headline: **"You Saw the Numbers. Now What Are You Going to Do About It?"**
- Subheadline: **"The workshop showed you what's possible. This call makes it real."**
- Body: **"You sat through the session. You saw how hidden fees, outdated strategies, and missed tax advantages quietly drain your retirement. Now you have a choice — go back to hoping, or sit down with someone who can actually show you your options."**
- CTA: **"Book Your Discovery Call →"**
- Detail: `"Free · No Obligation · 100% Confidential"`

#### 3. SocialProof (unchanged stats, updated context)
- Keep the animated numbers (500+ Families, 20+ Years, $150M+ Assets Protected) — these reinforce credibility post-workshop.

#### 4. CuriosityCards (THE STORY — Reframe as "What You Learned")
- Section label: `"WHAT THE WORKSHOP REVEALED"`
- Heading: **"You Can't Unsee the Truth"**
- Card 1: 🔒 **"Your 401(k) isn't as safe as you thought — and now you know why."**
- Card 2: 💰 **"The fees you're paying could cost you six figures by retirement."**
- Card 3: 📊 **"There are tax strategies your HR department was never required to share."**
- Bottom text: **"The question isn't whether these apply to you. It's what you're going to do about it."**

#### 5. HowItWorks (THE OFFER — Reframe as "What Happens Next")
- Section label: `"YOUR NEXT MOVE"`
- Heading: **"Here's How the Call Works"**
- Step 1: **"Pick Your Advisor"** — "Choose from our licensed team — someone who understands public school retirement."
- Step 2: **"Schedule 15 Minutes"** — "Pick a time that works. No prep needed — just show up."
- Step 3: **"Get Your Personal Snapshot"** — "We'll walk through your current situation and show you what's possible. No pressure. No pitch."

#### 6. RetirementCalculator (kept, copy tweaks)
- Heading: **"Remember This Number?"**
- Subtext: **"You saw it at the workshop. Now plug in your own numbers."**
- Bottom CTA: **"Ready to stop losing money to fees?"** → **"Book Your Discovery Call →"**

#### 7. TrustStrip (unchanged — carrier logos still relevant)

#### 8. SocorroFinalCTA (CLOSE WITH A QUESTION)
- Headline: **"You Already Know What's at Stake. The Only Question Is — Are You Going to Act?"**
- Body: **"This call is free. It's confidential. And it could be the most important 15 minutes of your financial life. Don't let what you learned at the workshop go to waste."**
- CTA: **"Book Your Discovery Call →"**
- Subtext: `"No cost · No commitment · Your finances, your decision"`

#### 9. SocorroFooter (minor tweak)
- Description: "Independent financial guidance for the Socorro ISD community." → **"Helping Socorro ISD employees take control of their retirement."**

### Files to Edit
1. `src/components/socorro/SocorroNavbar.tsx` — CTA text
2. `src/components/socorro/SocorroHero.tsx` — full copy rewrite
3. `src/components/socorro/CuriosityCards.tsx` — card content + headings
4. `src/components/socorro/HowItWorks.tsx` — step copy rewrite
5. `src/components/socorro/RetirementCalculator.tsx` — heading/subtext/CTA copy
6. `src/components/socorro/SocorroFinalCTA.tsx` — full copy rewrite
7. `src/components/socorro/SocorroFooter.tsx` — tagline update

No structural/layout changes. Same components, same design system. Pure copy overhaul.

