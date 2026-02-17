
# Fix Mobile Sticky CTA and Chat Button for Everence Wealth Branding

## Problems Identified (from the screenshot)

1. **"Explore Homes" button** in the sticky mobile CTA bar -- leftover real estate text. Needs to be rebranded to a financial services CTA (e.g., "Get Started" or "Book a Call").
2. **Emma avatar image** on the floating chat button -- shows a person's photo. Should be replaced with a branded icon (e.g., a `MessageCircle` icon styled with brand colors) instead of a human avatar.
3. **Colors** -- the sticky bar uses a generic gold gradient; needs to use the Everence brand palette (Evergreen `#1A4D3E`, Gold `#D4AF37`, Slate `#4A5565`).

## Changes

### 1. `src/components/blog-article/StickyMobileCTA.tsx`
- Replace "Explore Homes" with "Get Started" and link to `/contact` instead of `/properties`
- Replace `Home` icon with `Sparkles` or `ArrowRight`
- Update gradient colors to use Evergreen (`from-[#1A4D3E]`) and Gold (`to-[#D4AF37]`)
- Update the outline button border/text to use Evergreen

### 2. `src/components/blog-article/BlogEmmaChat.tsx`
- Remove the `emmaAvatar` image URL and the `<img>` tag
- Replace the floating button with a styled icon-only button using `MessageCircle` inside a circle with Evergreen background and Gold accent (matching the brand, no human photo)

---

### Technical Details

**StickyMobileCTA.tsx** -- key changes:
- Import `Sparkles` instead of `Home`
- Button text: "Get Started" / link: `/contact`
- Primary button class: `bg-gradient-to-r from-[#1A4D3E] to-[#1A4D3E]/80 text-white shadow-xl shadow-[#1A4D3E]/30`
- Outline button class: `border-2 border-[#1A4D3E] text-[#1A4D3E]`

**BlogEmmaChat.tsx** -- key changes:
- Remove `emmaAvatar` variable
- Replace `<img>` with a `<div>` containing a `MessageCircle` icon, styled as a circular button with `bg-[#1A4D3E]` and a gold pulse dot
