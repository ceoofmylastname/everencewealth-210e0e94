
## Add Blog Preview Section to Homepage

### Current State
The homepage (`src/pages/Home.tsx`) has no blog section. There is an existing `BlogTeaser` component in `src/components/home/sections/ReviewsAndBlog.tsx` from an older layout, but it is not used on the current homepage and follows the old real-estate styling (white backgrounds, slate colors) -- not the dark "tactical institutional" aesthetic used by the current homepage sections.

### What Will Change
Create a new `BlogPreview` component in `src/components/homepage/` that matches the dark homepage aesthetic, fetches the 3 most recent published articles from the database, and displays them in a modern card layout. Add it to `Home.tsx` between the FAQ and CTA sections.

### Design
- **Section background**: Deep dark (`bg-[hsl(160_80%_2%)]`) with a subtle radial emerald glow, consistent with other homepage sections
- **Header**: Gold eyebrow label ("FROM THE BLOG"), serif headline ("Insights for Smarter Wealth"), brief subtitle
- **3-card grid**: Each card features:
  - Featured image with hover zoom and a glassmorphic date pill overlay
  - Article headline (white, serif) that highlights gold on hover
  - Short meta description excerpt (white/60 opacity)
  - "Read more" link with animated arrow
  - Cards have a glass-morphic dark border (`border-white/10`) with hover glow effect
- **"View All Articles" CTA button** below the grid, linking to `/en/blog`
- Scroll-reveal animations using existing `ScrollReveal` and stagger variants
- Loading skeleton state while articles load
- Fallback message if no published articles exist

### Technical Details

**New file: `src/components/homepage/BlogPreview.tsx`**
- Uses `useQuery` to fetch 3 latest published articles from `blog_articles` table (status = 'published', ordered by `date_published` desc)
- Uses `ScrollReveal`, `staggerContainer`, `staggerItem` from existing `ScrollReveal.tsx`
- Uses `framer-motion` for card grid animations
- Links to `/en/blog/:slug` for individual articles and `/en/blog` for the full index
- Uses `date-fns` `format()` for date formatting

**Modified file: `src/pages/Home.tsx`**
- Import and add `<BlogPreview />` between `<FAQ />` and `<CTA />`
