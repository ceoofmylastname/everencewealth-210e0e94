

# Rebrand /auth Login Page for Everence Wealth

## Overview
Replace the generic white card with "Del Sol Prime Homes CMS" branding with a premium, dark glassmorphic login page matching the Everence Wealth tactical institutional aesthetic used across the CRM and Portal login pages.

## Design
- **Background**: Deep evergreen `#0B1F18` with mesh gradient blobs (`#1A4D3E` and `#C5A059/10`) matching the Privacy Policy and Terms pages
- **Logo**: Everence Wealth logo image (same URL used site-wide) centered above the form
- **Title**: "Everence Wealth" with subtitle "Content Management System"
- **Card**: Glassmorphic panel (`bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-2xl`) -- same style as Portal and CRM login pages
- **Inputs**: Dark translucent inputs (`bg-white/10 border-white/20 text-white`) with gold focus rings
- **Tabs**: Custom styled Sign In / Sign Up tabs with gold active indicator
- **Button**: Gold CTA (`bg-[#C5A059] hover:bg-[#d4b06a] text-[#0B1F18]`) matching the brand
- **Password toggle**: Eye/EyeOff icon button (matching Portal login)
- **Footer**: Copyright line "Everence Wealth. All rights reserved."
- **Animation**: Subtle `framer-motion` fade-in on the card

## Content Changes
- Remove "Del Sol Prime Homes CMS" -- replace with logo + "Everence Wealth"
- Remove "Admin Access" -- replace with "Content Management System"
- Remove the Lock icon circle -- replaced by the brand logo
- Keep all auth logic (signUp, signIn, session check, redirects) exactly as-is

## Technical Details

**File changed:** `src/pages/Auth.tsx`

- Add imports: `framer-motion` (motion), `Eye`/`EyeOff` from lucide-react
- Remove imports: `Card`, `CardContent`, `CardDescription`, `CardHeader`, `CardTitle`, `Lock`
- Add `showPassword` state for password visibility toggle
- Replace the entire JSX return with the new branded layout
- All auth handler functions remain unchanged
- Use the logo URL: `https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png`

