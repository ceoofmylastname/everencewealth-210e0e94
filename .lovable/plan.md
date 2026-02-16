
## Rebrand Blog Hero to Everence Wealth Style

### Problem
The blog hero still shows a Costa del Sol background image and the headline "LATEST BLOG FOR RENT AND BUY" -- completely mismatched with the Everence Wealth financial brand.

### Changes

**File: `src/components/blog-index/BlogHeader.tsx`**

1. **Remove the old background image import** (`costa-del-sol-bg.jpg`) and replace with a CSS gradient background matching the brand palette (Evergreen `#1A4D3E`, Gold `#C5A059`, dark `#020806`), consistent with other hero sections (AboutHero, ContactHero) that use gradient backgrounds rather than photos.

2. **Update the headline** from "LATEST BLOG FOR RENT AND BUY" to "INSIGHTS & STRATEGIES" with a subheadline "Expert perspectives on retirement, tax efficiency, and wealth protection."

3. **Restyle to match the brand aesthetic**:
   - Use `bg-gradient-to-br from-[#020806] via-[#1A4D3E] to-[#020806]` as the background
   - Add decorative gold blur orbs (matching AboutHero/ContactHero pattern)
   - Add subtle grid pattern overlay
   - Use the brand's font styling for the headline
   - Add a gold accent line above the headline
   - Reduce min-height to match other hero sections (~50-60vh)
   - Remove the negative margins (`-mx-4 md:-mx-8`) for cleaner layout

### Technical Details

Single file change to `src/components/blog-index/BlogHeader.tsx`:

```tsx
export const BlogHeader = ({ totalCount }: BlogHeaderProps) => {
  return (
    <header className="relative w-full min-h-[50vh] md:min-h-[45vh] flex items-center justify-center mb-12 md:mb-16 overflow-hidden bg-gradient-to-br from-[#020806] via-[#1A4D3E] to-[#020806]">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#C5A059] rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#C5A059] rounded-full blur-3xl" />
      </div>
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(...gold grid...)]" />

      <div className="relative z-10 text-center px-4">
        <div className="w-16 h-1 bg-[#C5A059] mx-auto mb-6" />
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
          INSIGHTS & STRATEGIES
        </h1>
        <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto">
          Expert perspectives on retirement, tax efficiency, and wealth protection.
        </p>
      </div>
    </header>
  );
};
```

No image file needed -- the old `costa-del-sol-bg.jpg` import is removed entirely in favor of CSS gradients, matching the pattern used across all other Everence Wealth hero sections.
