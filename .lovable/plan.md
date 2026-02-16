

## Update Q&A Tab: EN + ES Only, 48 Total Q&As, Blog Page Integration

### Current Problems

The Q&A management tab (`ClusterQATab.tsx`) still operates on the old 10-language system with 240 Q&As per cluster. The edge functions were already updated to EN + ES, but the UI was not. Additionally, Q&A pages need proper SEO metadata and blog article pages should display their 4 related Q&As.

---

### Changes

#### 1. ClusterQATab.tsx -- Major Rewrite (UI Component)

**Constants to update:**
- `TOTAL_LANGUAGES`: 10 --> 2
- `EXPECTED_QAS_PER_CLUSTER`: 240 --> 48 (24 EN + 24 ES)
- `TARGET_LANGUAGES`: `['de', 'nl', 'fr', 'pl', 'sv', 'da', 'hu', 'fi', 'no']` --> `['es']`
- `MAX_PARALLEL_TRANSLATIONS`: 3 --> 1 (only 1 language)
- `REQUIRED_ARTICLES_PER_LANGUAGE`: remains 6

**Phase 2 section simplification:**
- Remove the 3x3 grid of 9 language cards
- Replace with a single Spanish translation card/button
- Update "Generate All" confirmation text from "240 Q&As" and "9 languages" to "48 Q&As" and "Spanish"
- Update batch logic: instead of 5 batches of 2 languages, just 1 batch of 1 language (`['es']`)

**Verification panel:**
- Update "Complete Groups (10 langs each)" to "Complete Groups (2 langs each)"
- Update expected total from 240 to 48
- Update "all 10 languages" JSONB check to "both languages"
- Update language counts display: only show EN and ES flags

**Progress messages:**
- "Generate all 240 Q&As" --> "Generate all 48 Q&As"
- "25-35 min" --> "10-15 min"
- "Translate to all 9 languages" --> "Translate to Spanish"
- "All 240 Q&As generated" --> "All 48 Q&As generated"

#### 2. QAPage.tsx -- Fix BASE_URL

- Change `const BASE_URL = 'https://www.delsolprimehomes.com'` to `'https://www.everencewealth.com'`
- The page already has proper JSON-LD schema (`generateAllQASchemas`), canonical URL, hreflang tags, and speakable answer rendering
- The hreflang output loop already works dynamically from the `translations` JSONB field

#### 3. qaPageSchemaGenerator.ts -- Fix BASE_URL

- Change `const BASE_URL = 'https://www.delsolprimehomes.com'` to `'https://www.everencewealth.com'`
- Update `LANGUAGE_CODE_MAP` to remove unused European language codes, keep only `en: 'en-US'` (was `en-GB`) and `es: 'es-ES'`
- Update organization schema: name, URL, `knowsAbout` topics (change from real estate to wealth management), `expertise` list, and `areaServed`

#### 4. RelatedQAPages.tsx on Blog Articles (Already Working)

The `RelatedQAPages` component already fetches 4 Q&As per blog article using the funnel-based pattern. It queries `qa_pages` by `source_article_id` and `cluster_id`. This component is already imported and rendered in `BlogArticle.tsx`. No changes needed here -- it will automatically show Q&As once they are generated and published.

---

### What Each Published Q&A Page Will Have

Each Q&A gets its own dedicated page at `/{lang}/qa/{slug}` with:
- **JSON-LD**: QAPage schema, WebPage schema, BreadcrumbList, Organization (via `generateAllQASchemas`)
- **Speakable header**: The quick answer box with `speakable-answer` class
- **Hreflang tags**: Dynamic `<link rel="alternate" hrefLang="...">` for EN and ES versions
- **Canonical URL**: `<link rel="canonical" href="https://www.everencewealth.com/{lang}/qa/{slug}">`
- **4 Q&As on each blog page**: The `RelatedQAPages` component already renders them based on funnel stage

### Summary

| Item | Before | After |
|------|--------|-------|
| Languages | 10 (EN + 9 European) | 2 (EN + ES) |
| Total Q&As per cluster | 240 | 48 |
| Phase 2 grid | 3x3 grid of 9 languages | Single Spanish button |
| BASE_URL | delsolprimehomes.com | everencewealth.com |
| English locale | en-GB | en-US |
| Generate All time | 25-35 min | 10-15 min |
| Blog page Q&As | Already working | Already working |
| JSON-LD / hreflang / canonical | Already implemented | Fix URLs only |

