

# Replace Apartments Footer with Homepage Footer

## What Changes

The apartments pages currently use a minimal landing footer (`src/components/landing/Footer.tsx`) that only shows a logo, copyright, and a few links. It should instead use the full homepage footer (`src/components/home/Footer.tsx`) which includes the brand section with social links, contact info, navigation links, and legal links.

## Change

### `src/pages/apartments/ApartmentsLanding.tsx`

- Replace the import `import Footer from '@/components/landing/Footer'` with `import { Footer } from '@/components/home/Footer'`
- The `<Footer />` JSX stays the same (no props needed -- the homepage Footer uses the translation system internally)

That is the only file change required. The homepage Footer component is self-contained with its own translations, links, and styling.

