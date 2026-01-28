import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, TrendingUp, Globe, Plus, AlertCircle, CheckCircle2, Shield, RefreshCw, Rocket, Link2, ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/AdminLayout";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDashboardStats } from "@/hooks/useDashboardStats";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isRebuilding, setIsRebuilding] = useState(false);
  
  const {
    articleStats,
    languageStats,
    linkingStats,
    imageHealthStats,
    schemaHealthStats,
    isLoading,
    error,
  } = useDashboardStats();

  const languageNames: Record<string, string> = {
    en: 'English', es: 'Spanish', de: 'German', nl: 'Dutch',
    fr: 'French', pl: 'Polish', sv: 'Swedish', da: 'Danish', hu: 'Hungarian'
  };

  // Calculate schema health score from sample
  const schemaHealthScore = schemaHealthStats && schemaHealthStats.sampleSize > 0
    ? Math.round((schemaHealthStats.valid / schemaHealthStats.sampleSize) * 100)
    : 0;

  const handleRebuildSite = async () => {
    setIsRebuilding(true);
    try {
      const { data, error } = await supabase.functions.invoke('trigger-rebuild');
      
      if (error) throw error;
      
      toast.success('Site rebuild triggered!', {
        description: 'Static pages will regenerate in 5-10 minutes',
      });
      
      console.log('Rebuild response:', data);
    } catch (error) {
      console.error('Rebuild error:', error);
      toast.error('Failed to trigger rebuild', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsRebuilding(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">Loading statistics...</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-8 bg-muted rounded w-1/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <AlertCircle className="h-16 w-16 mx-auto text-destructive" />
                <h2 className="text-2xl font-bold">Unable to Load Dashboard</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {error instanceof Error 
                    ? error.message 
                    : "There was a problem loading dashboard statistics. Please try again."}
                </p>
                <Button onClick={() => window.location.reload()}>
                  Reload Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your blog content
            </p>
          </div>
          <Button onClick={() => navigate('/admin/articles/new')} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Create New Article
          </Button>
        </div>

        {/* SSG Status Card */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Static Site Generation</CardTitle>
            <Rocket className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold text-primary">
                {articleStats?.published || 0}
              </div>
              <span className="text-xs text-muted-foreground">static pages</span>
            </div>
            <Button 
              onClick={handleRebuildSite} 
              disabled={isRebuilding}
              size="sm"
              className="w-full"
            >
              {isRebuilding ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Rebuilding...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Rebuild Static Pages
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              Regenerate static HTML for all published articles
            </p>
          </CardContent>
        </Card>

        {/* Status Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Draft Articles</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{articleStats?.draft || 0}</div>
              <p className="text-xs text-muted-foreground">Work in progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Published Articles</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{articleStats?.published || 0}</div>
              <p className="text-xs text-muted-foreground">Live content</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Archived Articles</CardTitle>
              <FileText className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{articleStats?.archived || 0}</div>
              <p className="text-xs text-muted-foreground">Old content</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Schema Health</CardTitle>
              <Shield className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className={`text-2xl font-bold ${
                  schemaHealthScore >= 90 ? 'text-green-600' : 
                  schemaHealthScore >= 70 ? 'text-amber-600' : 
                  'text-red-600'
                }`}>
                  {schemaHealthScore}%
                </div>
                {schemaHealthScore === 100 && (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {schemaHealthStats?.needsAttention ? (
                  <>Based on sample of {schemaHealthStats.sampleSize} articles</>
                ) : (
                  'All schemas valid'
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Funnel Stage Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Articles by Funnel Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">TOFU (Top of Funnel)</span>
                  <span className="text-2xl font-bold text-blue-600">{articleStats?.tofu || 0}</span>
                </div>
                <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${articleStats?.total ? ((articleStats.tofu || 0) / articleStats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">MOFU (Middle of Funnel)</span>
                  <span className="text-2xl font-bold text-amber-600">{articleStats?.mofu || 0}</span>
                </div>
                <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-600 rounded-full"
                    style={{ width: `${articleStats?.total ? ((articleStats.mofu || 0) / articleStats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">BOFU (Bottom of Funnel)</span>
                  <span className="text-2xl font-bold text-green-600">{articleStats?.bofu || 0}</span>
                </div>
                <div className="h-2 bg-green-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-600 rounded-full"
                    style={{ width: `${articleStats?.total ? ((articleStats.bofu || 0) / articleStats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Language Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Articles by Language
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {languageStats && Object.entries(languageStats).map(([lang, count]) => (
                <div key={lang} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">{languageNames[lang] || lang.toUpperCase()}</span>
                  <span className="text-lg font-bold text-primary">{count}</span>
                </div>
              ))}
              {(!languageStats || Object.keys(languageStats).length === 0) && (
                <p className="text-sm text-muted-foreground col-span-3">No articles yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Internal Linking Health */}
        <Card className="border-2 border-amber-500/20 bg-gradient-to-br from-amber-50/50 to-orange-50/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Internal Linking Health</CardTitle>
            <Link2 className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <div className={`text-2xl font-bold ${
                  (linkingStats?.total || 0) === 0 ? 'text-green-600' : 
                  (linkingStats?.total || 0) <= 10 ? 'text-amber-600' : 
                  'text-red-600'
                }`}>
                  {linkingStats?.total || 0}
                </div>
                <span className="text-xs text-muted-foreground">articles need links</span>
              </div>
              
              {linkingStats && linkingStats.total > 0 && (
                <div className="space-y-1">
                  {Object.entries(linkingStats.byLanguage).map(([lang, count]) => (
                    <div key={lang} className="flex justify-between text-xs">
                      <span>{lang.toUpperCase()}: {count} articles</span>
                      {count > 10 && <span className="text-red-600 font-medium">🔴 Critical</span>}
                    </div>
                  ))}
                </div>
              )}
              
              <Button 
                onClick={() => navigate('/admin/bulk-internal-links')}
                size="sm"
                className="w-full"
                variant={(linkingStats?.total || 0) > 0 ? "default" : "outline"}
              >
                <Link2 className="mr-2 h-4 w-4" />
                {(linkingStats?.total || 0) > 0 ? 'Fix Linking Issues' : 'Manage Links'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Image Health */}
        <Card className="border-2 border-purple-500/20 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/30 dark:to-pink-950/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Image Health</CardTitle>
            <ImageIcon className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <div className={`text-2xl font-bold ${
                  (imageHealthStats?.issues || 0) === 0 ? 'text-green-600' : 
                  (imageHealthStats?.issues || 0) <= 10 ? 'text-amber-600' : 
                  'text-red-600'
                }`}>
                  {imageHealthStats?.issues || 0}
                </div>
                <span className="text-xs text-muted-foreground">issues found</span>
              </div>
              
              {imageHealthStats && imageHealthStats.fixed > 0 && (
                <div className="text-xs text-green-600">
                  ✅ {imageHealthStats.fixed} images fixed
                </div>
              )}
              
              <Button 
                onClick={() => navigate('/admin/image-health')}
                size="sm"
                className="w-full"
                variant={(imageHealthStats?.issues || 0) > 0 ? "default" : "outline"}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                {(imageHealthStats?.issues || 0) > 0 ? 'Fix Image Issues' : 'View Image Health'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
