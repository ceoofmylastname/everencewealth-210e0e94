

# Comprehensive Internal Admin Dashboard Implementation Plan

## Executive Summary

The project already has a solid admin infrastructure with:
- **Existing Dashboard** at `/admin` showing blog article stats, schema health, image health, and internal linking
- **CRM Admin Dashboard** at `/crm/admin/dashboard` with agent/lead management
- **Multiple specialized admin pages** for content, SEO, and system health

The task requires creating a **new unified admin dashboard** that consolidates all data sources (properties, leads, content, SEO) into a single command center at `/admin/dashboard`.

---

## Current State Analysis

| Feature | Status | Location |
|---------|--------|----------|
| Article statistics | Exists | `/admin` via `useDashboardStats` |
| CRM lead/agent stats | Exists | `/crm/admin/dashboard` via `useAdminStats` |
| Properties management | Exists | `/admin/properties` (basic list) |
| Team activity feed | Exists | `TeamActivityFeed` component |
| Role-based access | Exists | `user_roles` table + `has_role()` function |
| Dark mode | Not implemented | N/A |
| CSV export | Partial | `/admin/export` page exists |
| Real-time updates | Exists | CRM uses Supabase Realtime |

### Database Tables Available

| Table | Purpose |
|-------|---------|
| `blog_articles` | 3,271 articles with status, language, funnel_stage |
| `crm_leads` | Leads with source, language, status, agent assignment |
| `crm_agents` | Active agents with lead counts |
| `crm_activities` | Activity log for leads |
| `properties` | Property listings (12 active) |
| `qa_pages` | 9,600 Q&A pages |
| `comparison_pages` | 47 comparison pages |
| `location_pages` | 198 location pages |
| `external_citation_health` | Citation status tracking |
| `article_image_issues` | Image health tracking |
| `user_roles` | Role-based permissions |

---

## Phase 1: Create Unified Dashboard Hook

### New file: `src/hooks/useUnifiedDashboardStats.ts`

Consolidates all statistics into a single hook:

```typescript
interface UnifiedDashboardStats {
  // Properties
  totalProperties: number;
  propertiesByStatus: { active: number; pending: number; sold: number };
  propertiesByLocation: Record<string, number>;
  
  // Leads
  totalLeads: number;
  leadsToday: number;
  leadsThisWeek: number;
  leadsThisMonth: number;
  leadsTrend: number; // percentage vs last week
  leadsBySource: { source: string; count: number }[];
  leadsByLanguage: { language: string; count: number }[];
  leadsByStatus: { status: string; count: number }[];
  leadAssignmentsByAgent: { agentId: string; name: string; count: number }[];
  
  // Content
  articlesByStatus: { draft: number; published: number; archived: number };
  articlesByLanguage: Record<string, number>;
  articlesMissingTranslations: number;
  articlesMissingImages: number;
  articlesMissingCitations: number;
  
  // Agents
  activeAgents: number;
  totalAgents: number;
  
  // SEO
  citationHealthScore: number;
  brokenCitations: number;
  imageIssues: number;
}
```

**Queries:**
- Use `count: 'exact'` for efficient counting
- Parallel `Promise.all()` for multiple queries
- 30-second stale time for dashboard freshness

---

## Phase 2: Dashboard Layout Components

### New file: `src/components/admin/dashboard/DashboardOverviewCards.tsx`

Top row of 5 key metric cards:

```text
+------------------+------------------+------------------+------------------+------------------+
| Total Properties | Total Leads      | Blog Articles    | Active Agents    | Pending Tasks    |
| 12               | 847 (+12% ↑)     | 3,271            | 4                | 8                |
+------------------+------------------+------------------+------------------+------------------+
```

Features:
- Trend indicator for leads (vs last week)
- Color-coded based on thresholds
- Click to navigate to detail page

### New file: `src/components/admin/dashboard/LeadsSection.tsx`

Leads management panel with:
- Time-based lead counts (today/week/month)
- Source distribution pie chart (Emma, organic, paid, referral)
- Language distribution bar chart
- Status breakdown (new, contacted, qualified, converted, lost)
- Agent assignment table
- Quick actions: Assign Lead, Change Status, Add Note buttons

### New file: `src/components/admin/dashboard/ContentSection.tsx`

Content overview with:
- Articles by status cards
- Language distribution pie chart (using recharts - already installed)
- Content health alerts (missing translations, images, citations)
- Quick link to Cluster Manager

### New file: `src/components/admin/dashboard/PropertiesSection.tsx`

Properties panel with:
- Status breakdown (active/pending/sold)
- Location distribution
- Properties needing updates alert

### New file: `src/components/admin/dashboard/SEOHealthSection.tsx`

SEO metrics combining existing health checks:
- Citation health score (from `external_citation_health`)
- Image issues count
- Broken links count
- Link to SEO Monitor page

### New file: `src/components/admin/dashboard/ActivityLogSection.tsx`

Recent activity feed:
- Uses existing `crm_activities` table
- Shows admin actions, lead activities, content changes
- Real-time updates via Supabase Realtime
- Filterable by activity type

---

## Phase 3: Enhanced AdminLayout with Collapsible Sidebar

### Modify `src/components/AdminLayout.tsx`

Reorganize navigation into grouped sections with collapsible categories:

```text
DASHBOARD
  └─ Overview

LEADS & CRM
  └─ Leads Management (link to /crm/admin/leads)
  └─ Team Activity

PROPERTIES
  └─ Properties
  └─ New Builds (if applicable)

CONTENT
  ├─ Blog Articles
  ├─ Cluster Manager
  ├─ Q&A Pages
  └─ Location Pages

PAGES
  ├─ Comparison Pages
  ├─ Retargeting Pages
  └─ City Brochures

TEAM
  └─ Agents (link to /crm/admin/agents)

SEO & HEALTH
  ├─ SEO Monitor
  ├─ Citation Health
  ├─ Image Health
  └─ System Health

SETTINGS
  └─ Settings
  └─ Export
```

Use existing `Collapsible` component for sections.

---

## Phase 4: Role-Based Access Control

### Modify `src/components/ProtectedRoute.tsx` or create `src/components/AdminProtectedRoute.tsx`

Check user roles using existing `has_role()` database function:

```typescript
// Check if user has admin role
const { data: isAdmin } = await supabase.rpc('is_admin', { _user_id: userId });

// Check for specific roles
const { data: hasRole } = await supabase.rpc('has_role', { 
  _user_id: userId, 
  _role: 'content_manager' 
});
```

**Access Levels:**
| Role | Dashboard Access | Leads | Content | Properties | Settings |
|------|------------------|-------|---------|------------|----------|
| admin | Full | Full | Full | Full | Full |
| agent | Overview only | Own leads | View only | View only | No |
| content_manager | Content section | No | Full | No | No |

---

## Phase 5: Date Range Filters

### New file: `src/components/admin/dashboard/DashboardFilters.tsx`

Filter component with:
- Date range selector (Today, 7 days, 30 days, Custom)
- Language filter (for leads/content)
- Export to CSV button

State management via URL params for shareable links.

---

## Phase 6: Real-time Updates

Leverage existing Supabase Realtime patterns from CRM:

```typescript
// Subscribe to changes
const channel = supabase
  .channel('dashboard-updates')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'crm_leads' },
    () => queryClient.invalidateQueries(['dashboard-stats'])
  )
  .subscribe();
```

Apply to:
- Lead counts (new leads appear instantly)
- Activity log
- Properties (if added/modified)

---

## Phase 7: Dark Mode Support

### New file: `src/components/ThemeProvider.tsx`

Use `next-themes` (already in dependencies):

```typescript
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem>
      {children}
    </NextThemesProvider>
  );
}
```

### Add theme toggle to AdminLayout header

```typescript
const { theme, setTheme } = useTheme();
// Toggle button in header
```

---

## Phase 8: CSV Export Enhancement

### Modify `src/pages/admin/Export.tsx`

Add dashboard-specific exports:
- Leads export with all fields
- Content audit export
- Properties export
- Activity log export

Use existing `useLeadsExport` hook pattern.

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useUnifiedDashboardStats.ts` | Consolidated statistics hook |
| `src/components/admin/dashboard/DashboardOverviewCards.tsx` | Top metrics cards |
| `src/components/admin/dashboard/LeadsSection.tsx` | Leads management panel |
| `src/components/admin/dashboard/ContentSection.tsx` | Content overview |
| `src/components/admin/dashboard/PropertiesSection.tsx` | Properties panel |
| `src/components/admin/dashboard/SEOHealthSection.tsx` | SEO metrics |
| `src/components/admin/dashboard/ActivityLogSection.tsx` | Activity feed |
| `src/components/admin/dashboard/DashboardFilters.tsx` | Date/filter controls |
| `src/components/admin/dashboard/index.ts` | Barrel export |
| `src/components/ThemeProvider.tsx` | Dark mode provider |
| `src/components/ThemeToggle.tsx` | Theme toggle button |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/admin/Dashboard.tsx` | Complete rewrite with new sections |
| `src/components/AdminLayout.tsx` | Reorganized sidebar, add theme toggle |
| `src/App.tsx` | Wrap with ThemeProvider |
| `index.html` or `src/index.css` | Add dark mode class support |

---

## Mobile Responsiveness

The dashboard already uses Tailwind's responsive utilities:
- Grid cols: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
- Sidebar collapses on mobile (Sheet component)
- Cards stack vertically on small screens

---

## Performance Optimizations

1. **Parallel queries** via `Promise.all()` in the unified hook
2. **Count-only queries** using `{ count: 'exact', head: true }`
3. **Stale-while-revalidate** with 30-second staleTime
4. **Lazy loading** for chart components
5. **Memoization** of expensive calculations

---

## Implementation Order

1. **Phase 1**: Create `useUnifiedDashboardStats` hook
2. **Phase 2**: Create dashboard section components
3. **Phase 3**: Update Dashboard.tsx with new layout
4. **Phase 4**: Reorganize AdminLayout sidebar
5. **Phase 5**: Add date range filters
6. **Phase 6**: Add real-time subscriptions
7. **Phase 7**: Implement dark mode
8. **Phase 8**: Enhance CSV export

---

## Testing Checklist

- [ ] All stat cards show real data from database
- [ ] Lead trends calculate correctly (this week vs last week)
- [ ] Charts render with proper data
- [ ] Activity log updates in real-time
- [ ] Mobile layout works correctly
- [ ] Dark mode toggle works
- [ ] CSV export downloads correct data
- [ ] Navigation sidebar groups expand/collapse
- [ ] Role-based access restricts content correctly
- [ ] Date filters affect all sections

