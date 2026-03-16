

## Replace Hero Slide Beach Image with Young Couple/Family

### What
Generate a new AI image of a young, attractive couple walking on a tropical beach at sunset — matching the current composition but targeting the younger demographic. Then swap it into Slide 01.

### How

1. **Generate image** using Nano Banana Pro (`google/gemini-3-pro-image-preview`) with a prompt like:
   > "Young attractive couple in their late 20s walking hand-in-hand on a tropical beach at golden hour sunset, palm trees, turquoise water, barefoot, casual elegant linen clothing, warm cinematic lighting, ultra-realistic, 4K resolution, shallow depth of field, lifestyle photography"

2. **Save the generated image** to `src/assets/young-couple-beach.jpg` (or `.png` depending on output)

3. **Update `src/components/presentation/slides/Slide01_Hero.tsx`**:
   - Change import from `retirees-beach.jpg` to the new image file
   - Update the alt text to reflect the new subjects

### Files Modified
- `src/assets/young-couple-beach.jpg` — new AI-generated image
- `src/components/presentation/slides/Slide01_Hero.tsx` — update import and alt text

