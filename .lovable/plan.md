

## Add State Pages, Location Pages, and Brochures to Public Navigation

Add three new navigation links to the desktop pill navbar and mobile menu, placed under the **Education** dropdown alongside the existing Blog, Q&A, Glossary, and Comparisons items.

---

### New Navigation Items

| Label (EN) | Label (ES) | Route | Icon |
|---|---|---|---|
| State Guides | Guias Estatales | `/:lang/retirement-planning` or `/:lang/guides` | `MapPin` |
| Location Pages | Paginas por Ciudad | `/:lang/locations` | `Building2` |
| Guides Library | Biblioteca de Guias | `/:lang/guides` | `Library` |

Note: We will confirm exact labels and routes based on the public-facing pages that already exist in the router.

---

### Files to Change

**1. `src/i18n/translations/en.ts`** -- Add three new keys under `header.nav`:
- `stateGuides: "State Guides"`
- `locations: "Locations"`
- `guidesLibrary: "Guides Library"`

**2. `src/i18n/translations/es.ts`** -- Add matching Spanish translations under `header.nav`:
- `stateGuides: "Guías Estatales"`
- `locations: "Ubicaciones"`
- `guidesLibrary: "Biblioteca de Guías"`

**3. `src/components/ui/3d-adaptive-navigation-bar.tsx`** -- Add three new children to the `education` nav group:
```
{ label: nav.stateGuides, path: `/${lang}/retirement-planning`, icon: <MapPin /> }
{ label: nav.locations, path: `/${lang}/locations`, icon: <Building2 /> }
{ label: nav.guidesLibrary, path: `/${lang}/guides`, icon: <Library /> }
```
Also update the active-section detection to highlight "education" for these paths.

**4. `src/components/home/Header.tsx`** -- Add the same three `<MobileLink>` entries inside the Education mobile menu section, matching the desktop items.

