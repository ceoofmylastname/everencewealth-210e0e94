

## Plan: Add "Get In Touch" Button to Hero Section

Add a styled CTA button below the subline text (after line 208) that links to `/en/contact`. It will appear with the same stage-4 animation timing as the subline.

### Change in `src/components/home/sections/Hero.tsx`

After the subline `motion.div` (line 208), insert a new animated button:

```tsx
<motion.div
  className="mt-6"
  initial={{ opacity: 0, y: 20 }}
  animate={stage >= 4 ? { opacity: 1, y: 0 } : {}}
  transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
>
  <a
    href="/en/contact"
    className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary/10 border border-primary/30 text-primary font-hero font-bold text-sm tracking-[0.12em] uppercase rounded-full hover:bg-primary/20 hover:border-primary/50 hover:scale-105 transition-all duration-300"
    style={{
      boxShadow: '0 0 20px hsla(51,78%,65%,0.2), 0 0 40px hsla(51,78%,65%,0.1)',
    }}
  >
    Get In Touch
    <ArrowRight className="w-4 h-4" />
  </a>
</motion.div>
```

- Import `ArrowRight` from `lucide-react` at the top of the file
- Rounded-full pill shape with gold glow, matching the existing HUD aesthetic
- Hover: subtle scale + brighter glow
- Links to `/en/contact`

