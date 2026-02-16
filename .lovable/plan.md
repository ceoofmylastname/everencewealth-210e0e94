

## Full Language Audit: Restrict Everything to English and Spanish Only

### Scope of the Problem
The old real estate platform supported 10 European languages (en, de, nl, fr, pl, sv, da, hu, fi, no). After rebranding to Everence Wealth, only **English (en)** and **Spanish (es)** should exist anywhere. Legacy language references were found in **80+ files** across frontend components, edge functions, types, scripts, and schemas.

### Affected Areas (Organized by Priority)

---

### 1. Core Type Definitions

**`src/types/blog.ts`** (line 3)
- Change `Language` type from `'en' | 'de' | 'nl' | 'fr' | 'pl' | 'sv' | 'da' | 'hu' | 'fi' | 'no'` to `'en' | 'es'`

---

### 2. User-Facing Components (What visitors see)

| File | What to fix |
|------|------------|
| `src/components/blog-article/ArticleHeader.tsx` | `LANGUAGE_META` object -- remove 8 extra languages, keep en + es |
| `src/components/comparison/ComparisonLanguageSwitcher.tsx` | `LANGUAGES` array -- reduce to en + es only |
| `src/components/comparison/ComparisonFilterBar.tsx` | `LANGUAGES` array -- reduce to en + es only |
| `src/components/chatbot/ContactForm.tsx` | Language `<Select>` options -- remove de, nl, fr, pl, sv, da, hu |
| `src/components/contact/ContactForm.tsx` | `LANGUAGES` array -- reduce to en + es |
| `src/pages/QAIndex.tsx` | `LANGUAGES` array -- reduce to en + es |
| `src/pages/LocationHub.tsx` | Hardcoded "10 languages" text -- change to "2" |
| `src/pages/apartments/ApartmentsLanding.tsx` | `SUPPORTED_LANGS` -- reduce to en + es |

---

### 3. Admin / Editor Components (What you see in admin panels)

| File | What to fix |
|------|------------|
| `src/components/article-editor/TranslationsSection.tsx` | `LANGUAGES` array -- reduce to en + es |
| `src/components/article-editor/BasicInfoSection.tsx` | Language `<Select>` -- remove extra languages |
| `src/components/admin/BulkCaptionGenerator.tsx` | `LANGUAGE_OPTIONS` -- reduce to en + es |
| `src/components/admin/cluster-manager/AdvancedFilters.tsx` | `LANGUAGES` filter list -- reduce |
| `src/pages/admin/ComparisonGenerator.tsx` | `LANGUAGES` and `LanguageCode` type -- reduce |
| `src/pages/admin/QAGenerator.tsx` | `LANGUAGES` array -- reduce |
| `src/pages/admin/QADashboard.tsx` | `SUPPORTED_LANGUAGES`, `LANGUAGE_FLAGS`, `LANGUAGE_NAMES` -- reduce |
| `src/pages/admin/LocationPages.tsx` | Language `<Select>` -- reduce |
| `src/pages/admin/SpeakableTestBench.tsx` | `LANGUAGE_NAMES` -- reduce |
| `src/pages/admin/ImageHealthDashboard.tsx` | `LANGUAGE_NAMES` -- reduce |
| `src/pages/admin/BrochureManager.tsx` | `SUPPORTED_LANGUAGES`, `LANGUAGE_LABELS` -- reduce |

---

### 4. CRM Components

| File | What to fix |
|------|------------|
| `src/pages/crm/admin/CrmAnalytics.tsx` | `languageChartConfig` -- reduce |
| `src/pages/crm/admin/LeadsOverview.tsx` | Language filter `<Select>` -- reduce |
| `src/pages/crm/agent/AgentProfilePage.tsx` | `LANGUAGE_NAMES` -- reduce |
| `src/hooks/useCrmAnalytics.ts` | `LANGUAGE_LABELS` -- reduce |
| `src/hooks/useDashboardStats.ts` | `languages` array -- reduce |

---

### 5. Schema / SEO Generators

| File | What to fix |
|------|------------|
| `src/lib/brochureSchemaGenerator.ts` | `knowsLanguage` array -- reduce to `['en', 'es']` |

---

### 6. Edge Functions (Backend)

| Function | What to fix |
|----------|------------|
| `generate-qa-pages` | `LANGUAGE_NAMES`, `ALL_SUPPORTED_LANGUAGES`, `TRANSLATION_LANGUAGES`, language patterns, example questions |
| `generate-10lang-qa` | `ALL_LANGUAGES`, `LANGUAGE_WORD_COUNTS`, language patterns |
| `generate-city-qa-pages` | `ALL_SUPPORTED_LANGUAGES` |
| `generate-comparison-batch` | `ALL_SUPPORTED_LANGUAGES`, `LANGUAGE_NAMES` |
| `translate-cluster` | `TARGET_LANGUAGES` |
| `translate-cluster-to-language` | `TARGET_LANGUAGES`, `LANGUAGE_INFO` |
| `translate-qas-to-language` | `LANGUAGE_NAMES` |
| `translate-glossary` | `SUPPORTED_LANGUAGES`, `LANGUAGE_NAMES` |
| `populate-translation-queue` | `TARGET_LANGUAGES` |
| `find-internal-links` | Language name map |
| `replace-citation-markers` | Language instructions, domain patterns |
| `ping-indexnow` | `languages` array |
| `create-crm-agent` | `languageNames` |

---

### 7. Scripts

| File | What to fix |
|------|------------|
| `scripts/generateStaticHomePage.ts` | `LANGUAGES` array |
| `scripts/sampleQAPages.ts` | `LANGUAGES` array, `BASE_URL` (still says delsolprimehomes.com) |

---

### Implementation Approach

Due to the large number of files (80+), this will be implemented in **batches**:

1. **Batch 1**: Core types + user-facing components (highest impact -- what visitors see)
2. **Batch 2**: Admin/editor components + CRM components
3. **Batch 3**: Edge functions (backend)
4. **Batch 4**: Scripts and schema generators

Every LANGUAGES/SUPPORTED_LANGUAGES array will be reduced to:
```
[
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
]
```

Every Language type will become `'en' | 'es'`.

All references to German, Dutch, French, Polish, Swedish, Danish, Hungarian, Finnish, and Norwegian will be removed.

