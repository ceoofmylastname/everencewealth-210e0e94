

## Replace All Logos with New Everence Wealth Logo

Swap every instance of the old logo image and the Shield icon placeholder with the new logo across all pages -- headers, footers, login screens, and landing pages.

### New Logo URL
```
https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png
```

### Files to Update

| File | Current Logo | Change |
|---|---|---|
| `src/components/home/Header.tsx` | Old GCS image URL | Replace URL with new logo |
| `src/components/home/Footer.tsx` | Shield icon + "Everence" text | Replace with new logo `<img>` tag, styled for dark background |
| `src/components/landing/Footer.tsx` | Old GCS image URL | Replace URL |
| `src/components/landing/LandingLayout.tsx` | Old GCS image URL (2 instances: mobile + desktop) | Replace both URLs |
| `src/components/retargeting/RetargetingFooter.tsx` | Old GCS image URL | Replace URL |
| `src/pages/RetargetingLanding.tsx` | Old GCS image URL | Replace URL |
| `src/pages/crm/CrmLogin.tsx` | Old GCS image URL | Replace URL + update alt text |
| `src/pages/crm/AgentLogin.tsx` | Old GCS image URL | Replace URL + update alt text |
| `src/pages/apartments/ApartmentsLanding.tsx` | Old GCS image URL | Replace URL + update alt text |
| `src/components/ApartmentsEditorLayout.tsx` | Local `logo.png` import | Replace with new logo URL |

### Styling Approach

- **Light backgrounds** (landing pages, login screens): Logo displayed as-is with a subtle drop shadow
- **Dark backgrounds** (home Footer on neutral-950): Logo with `brightness-0 invert` filter or displayed naturally if the logo works on dark, with the Shield icon + text block replaced by the actual logo image
- **Header scroll states**: Maintain the existing brightness filter logic for transparent-to-solid transitions
- Consistent sizing: `h-14 md:h-16` across most placements for visual harmony

### Details

This is a straightforward find-and-replace of the old URL:
```
https://storage.googleapis.com/msgsndr/9m2UBN29nuaCWceOgW2Z/media/6926151522d3b65c0becbaf4.png
```
with the new URL in all 10 files listed above. The home Footer additionally requires converting the Shield icon + text into an `<img>` element.

