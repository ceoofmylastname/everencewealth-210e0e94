
# Enhance Cluster Manager: Comprehensive Dashboard and Bulk Operations

## Executive Summary

The Cluster Manager already has solid foundations with image health tracking, QA management, and citation tabs. This enhancement adds:
1. **Comprehensive Dashboard Overview** with all content health statistics
2. **Bulk Operations Panel** with "Fix Missing Images" and "Fix Missing External Links" buttons
3. **Advanced Filtering** for articles list
4. **Individual Article Actions** with quick operations
5. **Validation Warnings Panel** for content quality issues
6. **Rate-Limited Batch Processing** with progress tracking and pause/resume

---

## Current State

| Feature | Status |
|---------|--------|
| Image health per cluster | Exists (via `get_cluster_image_health` RPC) |
| Image regeneration per article | Exists (`regenerate-article-image` function) |
| Citation discovery per cluster | Exists (`discover-cluster-citations` function) |
| Batch image generation page | Exists (`BatchImageGeneration.tsx`) |
| Dashboard with article stats | Exists (`useDashboardStats` hook) |
| Rate limiting library (Bottleneck) | Not installed |
| Global bulk operations | Missing |
| Article-level quick actions | Missing |
| Validation warnings panel | Missing |
| Progress tracking with pause/resume | Missing |

---

## Phase 1: Dashboard Overview Statistics

### Add new statistics section at top of ClusterManager

Create a new component `ClusterManagerDashboard.tsx` displaying:

| Metric | Query | Source |
|--------|-------|--------|
| Total clusters created | Count unique `cluster_id` | blog_articles table |
| Total articles generated | Count all articles with `cluster_id` | blog_articles table |
| Articles by status (draft/published) | Group by status | blog_articles table |
| Articles missing images | Where `featured_image_url IS NULL` | blog_articles table |
| Articles missing external links | Where `external_citations IS NULL OR = '[]'` | blog_articles table |
| Articles by language breakdown | Group by language | blog_articles table |
| Word count validation | Articles < 1500 or > 2500 words | blog_articles table |

### UI Layout

```text
+----------------------------------------------------------------------+
| CLUSTER MANAGER DASHBOARD                                             |
+----------------------------------------------------------------------+
| +----------------+ +----------------+ +----------------+ +------------+|
| | 24 Clusters    | | 1,440 Articles | | 95% Published  | | 10 Lang.  ||
| +----------------+ +----------------+ +----------------+ +------------+|
|                                                                       |
| CONTENT HEALTH                                                        |
| +---------------------------+ +---------------------------+           |
| | 🖼️ Images                 | | 🔗 External Links         |           |
| | ✅ 1,380 have images      | | ✅ 1,200 have citations   |           |
| | ⚠️ 60 missing             | | ⚠️ 240 missing            |           |
| | [Fix Missing Images]      | | [Fix Missing Links]       |           |
| +---------------------------+ +---------------------------+           |
|                                                                       |
| VALIDATION WARNINGS                                                   |
| +--------------------------------------------------------------------+|
| | ⚠️ 15 articles < 1500 words  | ⚠️ 8 articles > 2500 words          ||
| | ⚠️ 12 broken internal links  | ⚠️ 5 articles missing FAQ schema   ||
| +--------------------------------------------------------------------+|
+----------------------------------------------------------------------+
```

---

## Phase 2: Bulk Operations with Rate Limiting

### Install Rate Limiting

The project doesn't use Bottleneck, but we can implement rate limiting using a custom utility with `setTimeout` delays:

```typescript
// src/lib/rateLimiter.ts
export class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private running = false;
  private paused = false;
  private completed = 0;
  private failed = 0;
  
  constructor(
    private requestsPerMinute: number,
    private onProgress?: (progress: ProgressState) => void,
    private onCheckpoint?: (state: CheckpointState) => void
  ) {}

  async add<T>(fn: () => Promise<T>): Promise<T> { ... }
  pause(): void { ... }
  resume(): void { ... }
  getProgress(): ProgressState { ... }
}
```

### Bulk "Fix Missing Images" Button

**Edge Function Invocation Flow:**
1. Query all articles where `featured_image_url IS NULL`
2. Batch into groups of 10
3. For each article, invoke `regenerate-article-image` function
4. Track progress with checkpoint saves every 10 articles
5. Handle failures gracefully (log and continue)

**UI Component:**

```typescript
interface BulkOperationProgress {
  isRunning: boolean;
  isPaused: boolean;
  currentIndex: number;
  totalCount: number;
  successCount: number;
  failCount: number;
  currentArticle: string;
  estimatedTimeRemaining: string;
  errors: Array<{ articleId: string; error: string }>;
  checkpointId?: string;
}
```

### Bulk "Fix Missing External Links" Button

**Edge Function Invocation Flow:**
1. Query all articles where `external_citations IS NULL OR external_citations = '[]'`
2. Batch into groups of 8 (Perplexity rate limit: 30/min)
3. For each article, invoke `find-citations-perplexity` function
4. Filter results through approved domains
5. Update article with 3-5 verified citations
6. Track progress and save checkpoints

---

## Phase 3: Advanced Article Filters

### Add new filter controls to ClusterManager

| Filter | Type | Options |
|--------|------|---------|
| Has Image | Select | Yes / No / All |
| Has Citations | Select | Yes / No / All |
| Language | Select | en, de, nl, fr, pl, sv, da, hu, fi, no, All |
| Funnel Stage | Select | TOFU / MOFU / BOFU / All |
| Cluster | Select | (dropdown of cluster themes) |
| Status | Select | draft / published / archived / All |
| Word Count | Select | < 1500 / 1500-2500 / > 2500 / All |

### Filter Implementation

Enhance the existing `filteredClusters` memo to support all new filters, or add a new article-level filtered view:

```typescript
const [filters, setFilters] = useState<FilterState>({
  hasImage: 'all',
  hasCitations: 'all',
  language: 'all',
  funnelStage: 'all',
  clusterId: 'all',
  status: 'all',
  wordCount: 'all'
});
```

---

## Phase 4: Individual Article Actions

### Add per-article action buttons in ClusterArticlesTab

| Action | Icon | Behavior |
|--------|------|----------|
| Regenerate Image | ImageIcon | Invoke `regenerate-article-image` |
| Refresh Citations | Link2 | Invoke `find-citations-perplexity` |
| Edit Article | Edit | Navigate to `/admin/articles/{id}/edit` |
| Preview | Eye | Open public URL in new tab |
| Publish/Unpublish | CheckCircle/XCircle | Toggle status |

### UI Enhancement

```text
+---------------------------------------------------------------------+
| Article: "Best Areas to Buy Property in Marbella"                   |
| EN | TOFU | Published | 2,100 words                                 |
+---------------------------------------------------------------------+
| 🖼️ Image: ✅ | 🔗 Citations: 3 | 📝 FAQ: ✅                          |
| [🔄 Regen Image] [🔗 Refresh Links] [✏️ Edit] [👁️ View] [Unpublish] |
+---------------------------------------------------------------------+
```

---

## Phase 5: Validation Warnings Panel

### Create ValidationWarningsPanel component

Queries for content quality issues:

| Validation | Query | Severity |
|------------|-------|----------|
| Word count < 1500 | `LENGTH(detailed_content) < X` | Warning |
| Word count > 2500 | `LENGTH(detailed_content) > Y` | Info |
| Missing FAQ schema | `qa_entities IS NULL OR = '[]'` | Warning |
| Broken internal links | Cross-check `internal_links` URLs | Error |
| Invalid external links (404s) | Check `external_citation_health` table | Error |

### UI Layout

```text
+----------------------------------------------------------------------+
| ⚠️ VALIDATION WARNINGS (45 issues)                                   |
+----------------------------------------------------------------------+
| Type               | Count | Severity |                              |
|--------------------|-------|----------|------------------------------|
| Word count < 1500  | 15    | ⚠️ Warn  | [View] [Fix All]             |
| Word count > 2500  | 8     | ℹ️ Info  | [View]                       |
| Missing FAQ schema | 12    | ⚠️ Warn  | [View] [Generate All]        |
| Broken internal    | 5     | 🔴 Error | [View] [Fix All]             |
| Invalid citations  | 5     | 🔴 Error | [View] [Replace All]         |
+----------------------------------------------------------------------+
```

---

## Phase 6: Progress Tracking System

### Create BulkOperationProgress component

Features:
- Real-time progress bar with percentage
- Current article being processed (headline)
- Estimated time remaining (based on average processing time)
- Pause/Resume buttons
- Error log with expandable details
- Retry failed items button

### Checkpoint System

Store progress in localStorage:

```typescript
interface BulkOperationCheckpoint {
  operationType: 'fix_images' | 'fix_citations' | 'regenerate_all_images' | 'refresh_all_citations';
  startedAt: string;
  articleIds: string[];
  completedIds: string[];
  failedIds: Array<{ id: string; error: string }>;
  pausedAt?: string;
}

// Save checkpoint every 10 articles
localStorage.setItem('bulkOperationCheckpoint', JSON.stringify(checkpoint));
```

### Resume Flow

On page load, check for existing checkpoint:
```typescript
useEffect(() => {
  const checkpoint = localStorage.getItem('bulkOperationCheckpoint');
  if (checkpoint) {
    setShowResumePrompt(true);
    setPendingCheckpoint(JSON.parse(checkpoint));
  }
}, []);
```

---

## Phase 7: API Rate Limit Handling

### Rate Limits to Respect

| API | Limit | Delay Between Calls |
|-----|-------|---------------------|
| Fal.ai (images) | 20/min | 3 seconds |
| Perplexity (citations) | 30/min | 2 seconds |
| OpenAI (alt text) | 50/min | 1.2 seconds |

### Implementation

Use sequential processing with delays instead of Bottleneck:

```typescript
async function processBatch<T>(
  items: T[],
  processor: (item: T) => Promise<void>,
  delayMs: number,
  onProgress: (completed: number, total: number) => void
) {
  for (let i = 0; i < items.length; i++) {
    try {
      await processor(items[i]);
      onProgress(i + 1, items.length);
    } catch (error) {
      console.error(`Failed item ${i}:`, error);
      // Log and continue
    }
    if (i < items.length - 1) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
}
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/admin/cluster-manager/ClusterManagerDashboard.tsx` | Overview statistics panel |
| `src/components/admin/cluster-manager/BulkOperationsPanel.tsx` | Fix images/links buttons |
| `src/components/admin/cluster-manager/ValidationWarningsPanel.tsx` | Content quality warnings |
| `src/components/admin/cluster-manager/BulkOperationProgress.tsx` | Progress tracking UI |
| `src/components/admin/cluster-manager/ArticleActionsRow.tsx` | Per-article action buttons |
| `src/components/admin/cluster-manager/AdvancedFilters.tsx` | Enhanced filter controls |
| `src/lib/rateLimiter.ts` | Custom rate limiting utility |
| `src/hooks/useClusterManagerStats.ts` | Dashboard statistics hook |
| `src/hooks/useBulkOperation.ts` | Bulk operation state management |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/admin/ClusterManager.tsx` | Integrate dashboard, bulk ops panel, filters |
| `src/components/admin/cluster-manager/ClusterArticlesTab.tsx` | Add per-article actions |
| `src/components/admin/cluster-manager/types.ts` | Add new type definitions |

---

## Database Queries (Already Existing Tables)

No new tables required. All data comes from existing:
- `blog_articles` - articles with images, citations, content
- `external_citation_health` - citation status tracking
- `cluster_generations` - cluster job status

---

## Implementation Order

1. **Phase 1**: Create `useClusterManagerStats` hook and `ClusterManagerDashboard` component
2. **Phase 2**: Create `rateLimiter.ts` utility and `useBulkOperation` hook
3. **Phase 3**: Create `BulkOperationsPanel` with Fix Images/Fix Links buttons
4. **Phase 4**: Create `BulkOperationProgress` component with pause/resume
5. **Phase 5**: Create `AdvancedFilters` component
6. **Phase 6**: Enhance `ClusterArticlesTab` with `ArticleActionsRow`
7. **Phase 7**: Create `ValidationWarningsPanel` component
8. **Phase 8**: Integrate all components into `ClusterManager.tsx`

---

## Testing Checklist

- [ ] Dashboard shows accurate counts for all metrics
- [ ] "Fix Missing Images" button queries correct articles
- [ ] Image generation respects 3-second delay (20/min Fal limit)
- [ ] Progress bar updates in real-time
- [ ] Pause button stops processing, Resume continues from where left off
- [ ] Checkpoint saves every 10 articles
- [ ] Page refresh shows "Resume Operation" prompt
- [ ] "Fix Missing Links" uses correct Perplexity rate limit
- [ ] Citations filtered through approved domains
- [ ] Filters work correctly in combination
- [ ] Individual article actions work (regenerate image, refresh links)
- [ ] Validation warnings show accurate counts
- [ ] Error log displays failed items with retry option

---

## Technical Details

### Rate Limiter Implementation

```typescript
// src/lib/rateLimiter.ts
export async function processWithRateLimit<T>(
  items: T[],
  processor: (item: T, index: number) => Promise<void>,
  options: {
    delayMs: number;
    batchSize?: number;
    onProgress?: (state: ProgressState) => void;
    onCheckpoint?: (completed: number) => void;
    checkpointInterval?: number;
    isPausedRef?: React.MutableRefObject<boolean>;
  }
): Promise<{ success: number; failed: number; errors: Array<{ index: number; error: string }> }> {
  const { delayMs, batchSize = 1, onProgress, onCheckpoint, checkpointInterval = 10, isPausedRef } = options;
  let success = 0;
  let failed = 0;
  const errors: Array<{ index: number; error: string }> = [];

  for (let i = 0; i < items.length; i++) {
    // Check for pause
    while (isPausedRef?.current) {
      await new Promise(r => setTimeout(r, 500));
    }

    try {
      await processor(items[i], i);
      success++;
    } catch (error) {
      failed++;
      errors.push({ index: i, error: error instanceof Error ? error.message : 'Unknown error' });
    }

    // Progress callback
    onProgress?.({
      currentIndex: i + 1,
      totalCount: items.length,
      successCount: success,
      failCount: failed,
      percentComplete: Math.round(((i + 1) / items.length) * 100)
    });

    // Checkpoint callback
    if ((i + 1) % checkpointInterval === 0) {
      onCheckpoint?.(i + 1);
    }

    // Rate limit delay
    if (i < items.length - 1) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }

  return { success, failed, errors };
}
```

### Fix Images Mutation

```typescript
const fixMissingImagesMutation = useMutation({
  mutationFn: async () => {
    // Query articles missing images
    const { data: articles } = await supabase
      .from('blog_articles')
      .select('id, headline, language, cluster_id, funnel_stage')
      .is('featured_image_url', null)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (!articles?.length) return { success: 0, failed: 0 };

    return processWithRateLimit(articles, async (article) => {
      const { error } = await supabase.functions.invoke('regenerate-article-image', {
        body: { articleId: article.id }
      });
      if (error) throw error;
    }, {
      delayMs: 3000, // 20/min for Fal.ai
      onProgress: (state) => setBulkProgress(state),
      onCheckpoint: (completed) => saveCheckpoint('fix_images', completed),
      isPausedRef
    });
  }
});
```

### Fix Citations Mutation

```typescript
const fixMissingCitationsMutation = useMutation({
  mutationFn: async () => {
    // Query articles missing citations
    const { data: articles } = await supabase
      .from('blog_articles')
      .select('id, headline, language, detailed_content, cluster_id')
      .or('external_citations.is.null,external_citations.eq.[]')
      .eq('status', 'published');

    if (!articles?.length) return { success: 0, failed: 0 };

    return processWithRateLimit(articles, async (article) => {
      const { data, error } = await supabase.functions.invoke('find-citations-perplexity', {
        body: { 
          articleId: article.id,
          headline: article.headline,
          content: article.detailed_content?.substring(0, 3000),
          language: article.language
        }
      });
      if (error) throw error;
      
      // Update article with citations
      if (data?.citations?.length) {
        await supabase
          .from('blog_articles')
          .update({ external_citations: data.citations })
          .eq('id', article.id);
      }
    }, {
      delayMs: 2000, // 30/min for Perplexity
      batchSize: 8,
      onProgress: (state) => setBulkProgress(state),
      onCheckpoint: (completed) => saveCheckpoint('fix_citations', completed),
      isPausedRef
    });
  }
});
```
