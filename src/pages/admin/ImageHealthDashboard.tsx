import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Copy, 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  ImageIcon,
  Loader2,
  CheckCircle2,
  Wand2
} from 'lucide-react';

interface ImageIssue {
  id: string;
  article_id: string;
  issue_type: 'duplicate' | 'text_detected' | 'expired_url';
  severity: 'low' | 'medium' | 'high';
  details: Record<string, unknown>;
  analyzed_at: string;
  resolved_at: string | null;
  article?: {
    id: string;
    headline: string;
    language: string;
    featured_image_url: string;
    cluster_id: string;
  };
}

interface IssueCounts {
  duplicates: number;
  textIssues: number;
  expiredUrls: number;
  total: number;
}

export default function ImageHealthDashboard() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState<ImageIssue[]>([]);
  const [counts, setCounts] = useState<IssueCounts>({ duplicates: 0, textIssues: 0, expiredUrls: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('duplicates');

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('article_image_issues')
        .select(`
          *,
          article:blog_articles(id, headline, language, featured_image_url, cluster_id)
        `)
        .is('resolved_at', null)
        .order('severity', { ascending: false })
        .order('analyzed_at', { ascending: false });

      if (error) throw error;

      const issuesData = (data || []) as unknown as ImageIssue[];
      setIssues(issuesData);

      // Calculate counts
      const newCounts = {
        duplicates: issuesData.filter(i => i.issue_type === 'duplicate').length,
        textIssues: issuesData.filter(i => i.issue_type === 'text_detected').length,
        expiredUrls: issuesData.filter(i => i.issue_type === 'expired_url').length,
        total: issuesData.length
      };
      setCounts(newCounts);
    } catch (error) {
      console.error('Failed to fetch issues:', error);
      toast.error('Failed to load image issues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleScanAll = async () => {
    setScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke('scan-article-images', {
        body: { scanType: 'all' }
      });

      if (error) throw error;

      toast.success(`Scan complete: ${data.result.duplicates} duplicates, ${data.result.expiredUrls} expired URLs found`);
      await fetchIssues();
    } catch (error) {
      console.error('Scan failed:', error);
      toast.error('Failed to scan images');
    } finally {
      setScanning(false);
    }
  };

  const handleRegenerate = async (issue: ImageIssue) => {
    if (!issue.article) return;
    
    setRegeneratingId(issue.article_id);
    try {
      const { data, error } = await supabase.functions.invoke('regenerate-article-image', {
        body: { articleId: issue.article_id }
      });

      if (error) throw error;

      // Mark issue as resolved
      await supabase
        .from('article_image_issues')
        .update({ 
          resolved_at: new Date().toISOString(),
          resolved_by: 'regeneration'
        })
        .eq('id', issue.id);

      toast.success(`Image regenerated for "${issue.article.headline.substring(0, 50)}..."`);
      await fetchIssues();
    } catch (error) {
      console.error('Regeneration failed:', error);
      toast.error('Failed to regenerate image');
    } finally {
      setRegeneratingId(null);
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, 'destructive' | 'secondary' | 'outline'> = {
      high: 'destructive',
      medium: 'secondary',
      low: 'outline'
    };
    return <Badge variant={variants[severity] || 'outline'}>{severity.toUpperCase()}</Badge>;
  };

  const getLanguageFlag = (lang: string) => {
    const flags: Record<string, string> = {
      en: '🇬🇧', nl: '🇳🇱', de: '🇩🇪', fr: '🇫🇷', es: '🇪🇸', 
      it: '🇮🇹', pt: '🇵🇹', ru: '🇷🇺', zh: '🇨🇳', ar: '🇸🇦'
    };
    return flags[lang] || '🌐';
  };

  const filteredIssues = issues.filter(issue => {
    if (activeTab === 'duplicates') return issue.issue_type === 'duplicate';
    if (activeTab === 'text') return issue.issue_type === 'text_detected';
    if (activeTab === 'expired') return issue.issue_type === 'expired_url';
    return true;
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/clusters')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Image Health Dashboard</h1>
            <p className="text-muted-foreground">
              Identify and fix problematic article images
            </p>
          </div>
        </div>
        <Button onClick={handleScanAll} disabled={scanning}>
          {scanning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Scan All Images
            </>
          )}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Duplicates</CardTitle>
            <Copy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.duplicates}</div>
            <p className="text-xs text-muted-foreground">Articles sharing images</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Text Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.textIssues}</div>
            <p className="text-xs text-muted-foreground">Gibberish/watermarks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Expired URLs</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.expiredUrls}</div>
            <p className="text-xs text-muted-foreground">Broken DALL-E links</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.total}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Issues Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="duplicates" className="gap-2">
            <Copy className="h-4 w-4" />
            Duplicates ({counts.duplicates})
          </TabsTrigger>
          <TabsTrigger value="text" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Text Issues ({counts.textIssues})
          </TabsTrigger>
          <TabsTrigger value="expired" className="gap-2">
            <Clock className="h-4 w-4" />
            Expired URLs ({counts.expiredUrls})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredIssues.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-medium">All Clear!</h3>
                <p className="text-muted-foreground">
                  No {activeTab === 'duplicates' ? 'duplicate' : activeTab === 'text' ? 'text' : 'expired URL'} issues found.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredIssues.map((issue) => (
                <Card key={issue.id} className="overflow-hidden">
                  <div className="flex items-center gap-4 p-4">
                    {/* Thumbnail */}
                    <div className="w-20 h-14 rounded overflow-hidden bg-muted flex-shrink-0">
                      {issue.article?.featured_image_url ? (
                        <img 
                          src={issue.article.featured_image_url} 
                          alt="" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Article Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{getLanguageFlag(issue.article?.language || 'en')}</span>
                        <h4 className="font-medium truncate">
                          {issue.article?.headline || 'Unknown Article'}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {getSeverityBadge(issue.severity)}
                        <span>
                          {issue.issue_type === 'duplicate' && (
                            <>Shared with {(issue.details as { shared_with_count?: number }).shared_with_count || 0} articles</>
                          )}
                          {issue.issue_type === 'text_detected' && (
                            <>{(issue.details as { description?: string }).description || 'Text detected in image'}</>
                          )}
                          {issue.issue_type === 'expired_url' && (
                            <>DALL-E temporary URL (expired)</>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <Button
                      size="sm"
                      onClick={() => handleRegenerate(issue)}
                      disabled={regeneratingId === issue.article_id}
                    >
                      {regeneratingId === issue.article_id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Regenerating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="mr-2 h-4 w-4" />
                          Regenerate
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
