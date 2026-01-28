
# Replace Placeholder Visual with AI-Generated Image in RetargetingVisualContext

## Current State
The `RetargetingVisualContext` component (lines 32-77) currently displays a **placeholder abstract visual** made of CSS elements:
- 3 fake "document cards" with gray bars simulating text
- A search icon
- Decorative blur circles

This looks generic and doesn't convey the premium "Research & Clarity" message effectively.

## Solution: Pre-Generate AI Image Using Nano Banana Pro

Instead of generating images at runtime (which would add latency and cost per visitor), I'll:

1. **Create an edge function** to generate a high-quality image using Nano Banana Pro (`google/gemini-3-pro-image-preview` via Lovable AI gateway)
2. **Upload to Supabase Storage** for permanent hosting
3. **Update the component** to display the AI-generated image with proper alt text

---

## Implementation Steps

### Step 1: Create Edge Function to Generate Visual Context Image

**New file: `supabase/functions/generate-retargeting-visual/index.ts`**

This function will:
- Use `LOVABLE_API_KEY` to call Nano Banana Pro via the Lovable AI gateway
- Generate a professional, educational-themed image that matches the "Research & Clarity" concept
- Upload the result to `article-images` storage bucket
- Return the permanent Supabase Storage URL

**Prompt concept** (aligned with the retargeting page's "educational intent" from memory):
```
Professional, calm educational scene: A person thoughtfully reviewing 
real estate research documents in a bright, modern home office. 
Natural light streams through Mediterranean-style windows. 
Documents, laptop, and a coffee cup on a clean wooden desk. 
Costa del Sol landscape visible through window. 
No logos, no text. Peaceful, contemplative mood. 
4:3 aspect ratio, warm natural lighting, lifestyle photography.
```

### Step 2: Add Image URL to Retargeting Translations

**File: `src/lib/retargetingTranslations.ts`**

Add a new field for each language:
```typescript
visualImageUrl: "https://kazggnufaoicopvmwhdl.supabase.co/storage/v1/object/public/article-images/retargeting-visual-en.png",
visualImageAlt: "Person reviewing Costa del Sol property research documents in a bright home office"
```

### Step 3: Update RetargetingVisualContext Component

**File: `src/components/retargeting/RetargetingVisualContext.tsx`**

Replace the placeholder CSS visual (lines 32-77) with:
```tsx
<div className="aspect-[4/3] rounded-xl overflow-hidden">
  <img 
    src={t.visualImageUrl}
    alt={t.visualImageAlt}
    className="w-full h-full object-cover"
    loading="lazy"
  />
</div>
```

Keep the glassmorphism container and floating badge intact.

---

## Technical Details

### Edge Function Architecture

```text
POST /generate-retargeting-visual
  ↓
  Call Lovable AI Gateway (google/gemini-3-pro-image-preview)
  ↓
  Receive base64 image
  ↓
  Upload to Supabase Storage (article-images bucket)
  ↓
  Return permanent URL
```

### Image Specifications
- **Aspect ratio**: 4:3 (matches current container)
- **Quality**: High-end lifestyle/editorial photography
- **Tone**: Calm, educational, professional (per retargeting design memory)
- **Model**: `google/gemini-3-pro-image-preview` (Nano Banana Pro via Lovable AI)

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/functions/generate-retargeting-visual/index.ts` | **Create** - Edge function for AI image generation |
| `src/lib/retargetingTranslations.ts` | **Modify** - Add `visualImageUrl` and `visualImageAlt` fields for all 10 languages |
| `src/components/retargeting/RetargetingVisualContext.tsx` | **Modify** - Replace CSS placeholder with `<img>` element |
| `supabase/config.toml` | **Modify** - Add function configuration |

---

## Execution Plan

1. Create the edge function with proper CORS and storage upload logic
2. Deploy the function
3. Run the function once to generate and store the image
4. Update translations with the generated image URL and localized alt text
5. Update the component to use the real image
6. Test the result on the `/en/welcome-back` page

---

## Expected Result

The "Research & Clarity" section will display a professional AI-generated image showing a calm, educational scene that reinforces the page's intent: "We start with explanation, not listings." The image will be permanently hosted on Supabase Storage, eliminating runtime generation costs.
