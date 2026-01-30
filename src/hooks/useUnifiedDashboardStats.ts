import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { startOfDay, startOfWeek, startOfMonth, subWeeks } from "date-fns";

export interface UnifiedDashboardStats {
  // Properties
  totalProperties: number;
  propertiesByStatus: { active: number; pending: number; sold: number };
  propertiesByLocation: Record<string, number>;
  
  // Leads
  totalLeads: number;
  leadsToday: number;
  leadsThisWeek: number;
  leadsThisMonth: number;
  leadsTrend: number;
  leadsBySource: { source: string; count: number }[];
  leadsByLanguage: { language: string; count: number }[];
  leadsByStatus: { status: string; count: number }[];
  leadAssignmentsByAgent: { agentId: string; name: string; count: number }[];
  
  // Content
  totalArticles: number;
  articlesByStatus: { draft: number; published: number; archived: number };
  articlesByLanguage: Record<string, number>;
  articlesMissingTranslations: number;
  articlesMissingImages: number;
  articlesMissingCitations: number;
  
  // Q&A and other content
  totalQAPages: number;
  totalComparisons: number;
  totalLocationPages: number;
  
  // Agents
  activeAgents: number;
  totalAgents: number;
  
  // SEO
  citationHealthScore: number;
  brokenCitations: number;
  imageIssues: number;
  
  // Pending tasks
  pendingTasks: number;
}

interface PropertyRow {
  is_active: boolean | null;
  location: string;
}

interface LeadRow {
  id: string;
  lead_source: string;
  language: string;
  lead_status: string | null;
  assigned_agent_id: string | null;
}

interface AgentRow {
  id: string;
  first_name: string;
  last_name: string;
  is_active: boolean | null;
  current_lead_count: number | null;
}

async function fetchUnifiedStats(): Promise<UnifiedDashboardStats> {
  const now = new Date();
  const todayStart = startOfDay(now).toISOString();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }).toISOString();
  const monthStart = startOfMonth(now).toISOString();
  const lastWeekStart = subWeeks(startOfWeek(now, { weekStartsOn: 1 }), 1).toISOString();
  const lastWeekEnd = startOfWeek(now, { weekStartsOn: 1 }).toISOString();

  // Parallel fetch all data - using COUNT queries to bypass 1000 row limit
  const [
    propertiesData,
    leadsData,
    leadsToday,
    leadsThisWeek,
    leadsThisMonth,
    leadsLastWeek,
    // Article counts using efficient COUNT queries
    totalArticlesCount,
    publishedArticlesCount,
    draftArticlesCount,
    archivedArticlesCount,
    articlesMissingImagesCount,
    articlesMissingCitationsCount,
    qaCount,
    comparisonsCount,
    locationsCount,
    agentsData,
    citationHealth,
    imageIssues,
    remindersCount,
  ] = await Promise.all([
    // Properties - use 'location' field
    supabase.from('properties').select('is_active, location'),
    
    // All leads
    supabase.from('crm_leads').select('id, lead_source, language, lead_status, assigned_agent_id'),
    
    // Leads today
    supabase.from('crm_leads').select('id', { count: 'exact', head: true }).gte('created_at', todayStart),
    
    // Leads this week
    supabase.from('crm_leads').select('id', { count: 'exact', head: true }).gte('created_at', weekStart),
    
    // Leads this month
    supabase.from('crm_leads').select('id', { count: 'exact', head: true }).gte('created_at', monthStart),
    
    // Leads last week (for trend calculation)
    supabase.from('crm_leads').select('id', { count: 'exact', head: true })
      .gte('created_at', lastWeekStart)
      .lt('created_at', lastWeekEnd),
    
    // Total articles count (bypasses 1000 row limit)
    supabase.from('blog_articles').select('id', { count: 'exact', head: true }),
    
    // Published articles count
    supabase.from('blog_articles').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    
    // Draft articles count
    supabase.from('blog_articles').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
    
    // Archived articles count
    supabase.from('blog_articles').select('id', { count: 'exact', head: true }).eq('status', 'archived'),
    
    // Articles missing images
    supabase.from('blog_articles').select('id', { count: 'exact', head: true }).or('featured_image_url.is.null,featured_image_url.eq.'),
    
    // Articles missing citations
    supabase.from('blog_articles').select('id', { count: 'exact', head: true }).or('external_citations.is.null,external_citations.eq.[]'),
    
    // Q&A count
    supabase.from('qa_pages').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    
    // Comparisons count
    supabase.from('comparison_pages').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    
    // Locations count
    supabase.from('location_pages').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    
    // Agents
    supabase.from('crm_agents').select('id, first_name, last_name, is_active, current_lead_count'),
    
    // Citation health
    supabase.rpc('get_citation_health_stats'),
    
    // Image issues
    supabase.from('article_image_issues').select('id', { count: 'exact', head: true }).is('resolved_at', null),
    
    // Pending reminders/tasks
    supabase.from('crm_reminders').select('id', { count: 'exact', head: true })
      .eq('is_completed', false)
      .gte('due_date', now.toISOString()),
  ]);

  // Process properties data
  const properties = (propertiesData.data || []) as PropertyRow[];
  const propertiesByStatus = {
    active: properties.filter(p => p.is_active).length,
    pending: 0,
    sold: properties.filter(p => !p.is_active).length,
  };
  const propertiesByLocation: Record<string, number> = {};
  properties.forEach(p => {
    if (p.location) {
      propertiesByLocation[p.location] = (propertiesByLocation[p.location] || 0) + 1;
    }
  });

  // Process leads data
  const leads = (leadsData.data || []) as LeadRow[];
  const leadsBySource: Record<string, number> = {};
  const leadsByLanguage: Record<string, number> = {};
  const leadsByStatus: Record<string, number> = {};
  const agentLeadCounts: Record<string, number> = {};

  leads.forEach(lead => {
    const source = lead.lead_source || 'Unknown';
    leadsBySource[source] = (leadsBySource[source] || 0) + 1;
    
    const lang = lead.language || 'en';
    leadsByLanguage[lang] = (leadsByLanguage[lang] || 0) + 1;
    
    const status = lead.lead_status || 'new';
    leadsByStatus[status] = (leadsByStatus[status] || 0) + 1;
    
    if (lead.assigned_agent_id) {
      agentLeadCounts[lead.assigned_agent_id] = (agentLeadCounts[lead.assigned_agent_id] || 0) + 1;
    }
  });

  // Calculate lead trend
  const thisWeekCount = leadsThisWeek.count || 0;
  const lastWeekCount = leadsLastWeek.count || 0;
  const leadsTrend = lastWeekCount > 0 
    ? Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100) 
    : thisWeekCount > 0 ? 100 : 0;

  // Process articles data from COUNT queries (no 1000 row limit)
  const totalArticles = totalArticlesCount.count || 0;
  const articlesByStatus = {
    draft: draftArticlesCount.count || 0,
    published: publishedArticlesCount.count || 0,
    archived: archivedArticlesCount.count || 0,
  };
  
  const articlesMissingImages = articlesMissingImagesCount.count || 0;
  const articlesMissingCitations = articlesMissingCitationsCount.count || 0;
  // For missing translations, we'll estimate based on published count vs expected (9 languages)
  const articlesMissingTranslations = 0; // Would need separate query per language to calculate accurately

  // Articles by language - since we removed row fetching, set empty for now
  // Could add per-language COUNT queries if needed
  const articlesByLanguageMap: Record<string, number> = {};

  // Process agents
  const agents = (agentsData.data || []) as AgentRow[];
  const activeAgents = agents.filter(a => a.is_active).length;
  const leadAssignmentsByAgent = agents.map(agent => ({
    agentId: agent.id,
    name: `${agent.first_name} ${agent.last_name}`,
    count: agentLeadCounts[agent.id] || 0,
  }));

  // Citation health
  const citationStats = citationHealth.data as { total: number; healthy: number; broken: number } | null;
  const citationHealthScore = citationStats && citationStats.total > 0 
    ? Math.round((citationStats.healthy / citationStats.total) * 100) 
    : 100;

  return {
    totalProperties: properties.length,
    propertiesByStatus,
    propertiesByLocation,
    
    totalLeads: leads.length,
    leadsToday: leadsToday.count || 0,
    leadsThisWeek: thisWeekCount,
    leadsThisMonth: leadsThisMonth.count || 0,
    leadsTrend,
    leadsBySource: Object.entries(leadsBySource).map(([source, count]) => ({ source, count })),
    leadsByLanguage: Object.entries(leadsByLanguage).map(([language, count]) => ({ language, count })),
    leadsByStatus: Object.entries(leadsByStatus).map(([status, count]) => ({ status, count })),
    leadAssignmentsByAgent,
    
    totalArticles,
    articlesByStatus,
    articlesByLanguage: articlesByLanguageMap,
    articlesMissingTranslations,
    articlesMissingImages,
    articlesMissingCitations,
    
    totalQAPages: qaCount.count || 0,
    totalComparisons: comparisonsCount.count || 0,
    totalLocationPages: locationsCount.count || 0,
    
    activeAgents,
    totalAgents: agents.length,
    
    citationHealthScore,
    brokenCitations: citationStats?.broken || 0,
    imageIssues: imageIssues.count || 0,
    
    pendingTasks: remindersCount.count || 0,
  };
}

export function useUnifiedDashboardStats() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['unified-dashboard-stats'],
    queryFn: fetchUnifiedStats,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });

  // Real-time subscription for leads
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'crm_leads' }, () => {
        queryClient.invalidateQueries({ queryKey: ['unified-dashboard-stats'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, () => {
        queryClient.invalidateQueries({ queryKey: ['unified-dashboard-stats'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blog_articles' }, () => {
        queryClient.invalidateQueries({ queryKey: ['unified-dashboard-stats'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}
