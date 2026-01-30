import { AdminLayout } from "@/components/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Calendar, Languages, Ban, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResolverSummaryCards } from "@/components/admin/not-found-resolver/ResolverSummaryCards";
import { MalformedUrlsTab } from "@/components/admin/not-found-resolver/MalformedUrlsTab";
import { LanguageMismatchTab } from "@/components/admin/not-found-resolver/LanguageMismatchTab";
import { ConfirmedGoneTab } from "@/components/admin/not-found-resolver/ConfirmedGoneTab";
import { useNotFoundSummary } from "@/hooks/useNotFoundAnalysis";
import { useQueryClient } from "@tanstack/react-query";

const NotFoundResolver = () => {
  const { data: summary, isLoading, refetch } = useNotFoundSummary();
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["not-found-summary"] });
    queryClient.invalidateQueries({ queryKey: ["malformed-urls"] });
    queryClient.invalidateQueries({ queryKey: ["language-mismatches"] });
    queryClient.invalidateQueries({ queryKey: ["confirmed-gone-urls"] });
    refetch();
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
              404 Resolution Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Identify and resolve 404 issues by category: malformed URLs, language mismatches, and confirmed 410s
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Summary Cards */}
        <ResolverSummaryCards summary={summary} isLoading={isLoading} />

        {/* Tabs */}
        <Tabs defaultValue="malformed" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="malformed" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Malformed URLs</span>
              <span className="sm:hidden">Malformed</span>
              {summary?.malformed ? (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 rounded">
                  {summary.malformed}
                </span>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="language" className="flex items-center gap-2">
              <Languages className="h-4 w-4" />
              <span className="hidden sm:inline">Language Mismatches</span>
              <span className="sm:hidden">Mismatches</span>
              {summary?.languageMismatch ? (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                  {summary.languageMismatch}
                </span>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="confirmed" className="flex items-center gap-2">
              <Ban className="h-4 w-4" />
              <span className="hidden sm:inline">Confirmed 410s</span>
              <span className="sm:hidden">410s</span>
              {summary?.trulyMissing ? (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded">
                  {summary.trulyMissing}
                </span>
              ) : null}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="malformed">
            <MalformedUrlsTab />
          </TabsContent>

          <TabsContent value="language">
            <LanguageMismatchTab />
          </TabsContent>

          <TabsContent value="confirmed">
            <ConfirmedGoneTab />
          </TabsContent>
        </Tabs>

        {/* Workflow Guide */}
        <div className="border rounded-lg p-6 bg-muted/30">
          <h3 className="font-semibold text-lg mb-4">Resolution Workflow</h3>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 text-xs font-medium">1</span>
              <span><strong>Malformed URLs:</strong> Delete all {summary?.malformed || 0} date-appended URLs. These were never valid pages.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium">2</span>
              <span><strong>Language Mismatches:</strong> Fix all {summary?.languageMismatch || 0} mismatches. Edge function will auto-redirect.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs font-medium">3</span>
              <span><strong>Confirmed 410s:</strong> Review {summary?.trulyMissing || 0} truly gone URLs. Keep these for proper 410 response.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-medium">4</span>
              <span><strong>Regenerate Sitemaps:</strong> Go to System Health and regenerate all sitemaps.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-medium">5</span>
              <span><strong>Ping IndexNow:</strong> Notify search engines of the changes.</span>
            </li>
          </ol>
        </div>
      </div>
    </AdminLayout>
  );
};

export default NotFoundResolver;
