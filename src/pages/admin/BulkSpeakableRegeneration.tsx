import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, RefreshCw, CheckCircle, XCircle, AlertTriangle, Languages } from "lucide-react";

interface ArticleWithIssue {
  id: string;
  headline: string;
  language: string;
  speakable_answer: string;
  detailed_content: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  newSpeakable?: string;
  error?: string;
}

const LANGUAGE_NAMES: Record<string, string> = {
  'en': 'English', 'de': 'German', 'nl': 'Dutch', 'fr': 'French',
  'pl': 'Polish', 'sv': 'Swedish', 'da': 'Danish', 'hu': 'Hungarian',
  'fi': 'Finnish', 'no': 'Norwegian'
};

// Common English words that indicate the text is in English
const ENGLISH_INDICATORS = [
  ' you ', ' your ', ' the ', ' is ', ' are ', ' can ', ' will ', 
  ' with ', ' for ', ' from ', ' have ', ' this ', ' that ',
  ' discover ', ' explore ', ' find ', ' buy ', ' sell ',
  ' property ', ' home ', ' house ', ' real estate '
];

function isLikelyEnglish(text: string): boolean {
  if (!text) return false;
  const textLower = ' ' + text.toLowerCase() + ' ';
  const matchCount = ENGLISH_INDICATORS.filter(word => textLower.includes(word)).length;
  return matchCount >= 3;
}

export default function BulkSpeakableRegeneration() {
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [articles, setArticles] = useState<ArticleWithIssue[]>([]);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({ total: 0, scanned: 0, withIssues: 0, fixed: 0, errors: 0 });

  const scanForIssues = async () => {
    setIsScanning(true);
    setArticles([]);
    setStats({ total: 0, scanned: 0, withIssues: 0, fixed: 0, errors: 0 });

    try {
      // Fetch all non-English published articles
      const { data, error } = await supabase
        .from('blog_articles')
        .select('id, headline, language, speakable_answer, detailed_content')
        .neq('language', 'en')
        .eq('status', 'published')
        .not('speakable_answer', 'is', null);

      if (error) throw error;

      const articlesWithIssues: ArticleWithIssue[] = [];
      
      for (const article of data || []) {
        if (isLikelyEnglish(article.speakable_answer)) {
          articlesWithIssues.push({
            ...article,
            status: 'pending'
          });
        }
      }

      setArticles(articlesWithIssues);
      setStats({
        total: data?.length || 0,
        scanned: data?.length || 0,
        withIssues: articlesWithIssues.length,
        fixed: 0,
        errors: 0
      });

      toast.success(`Found ${articlesWithIssues.length} articles with English speakable answers`);

    } catch (error) {
      console.error('Scan error:', error);
      toast.error('Failed to scan articles');
    } finally {
      setIsScanning(false);
    }
  };

  const regenerateAll = async () => {
    if (articles.length === 0) {
      toast.error('No articles to process');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    const BATCH_SIZE = 5;
    let fixedCount = 0;
    let errorCount = 0;

    try {
      for (let i = 0; i < articles.length; i += BATCH_SIZE) {
        const batch = articles.slice(i, i + BATCH_SIZE);
        
        // Mark batch as processing
        setArticles(prev => prev.map(a => 
          batch.some(b => b.id === a.id) ? { ...a, status: 'processing' as const } : a
        ));

        const { data, error } = await supabase.functions.invoke('regenerate-speakable-bulk', {
          body: { 
            articles: batch.map(a => ({
              id: a.id,
              headline: a.headline,
              language: a.language,
              detailed_content: a.detailed_content
            }))
          }
        });

        if (error) {
          console.error('Batch error:', error);
          // Mark batch as error
          setArticles(prev => prev.map(a => 
            batch.some(b => b.id === a.id) ? { ...a, status: 'error' as const, error: error.message } : a
          ));
          errorCount += batch.length;
        } else if (data?.results) {
          // Update individual article statuses
          setArticles(prev => prev.map(a => {
            const result = data.results.find((r: { id: string }) => r.id === a.id);
            if (result) {
              if (result.success) {
                fixedCount++;
                return { ...a, status: 'success' as const, newSpeakable: result.newSpeakable };
              } else {
                errorCount++;
                return { ...a, status: 'error' as const, error: result.error };
              }
            }
            return a;
          }));
        }

        setProgress(Math.round(((i + batch.length) / articles.length) * 100));
        setStats(prev => ({ ...prev, fixed: fixedCount, errors: errorCount }));

        // Delay between batches
        if (i + BATCH_SIZE < articles.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      toast.success(`Completed: ${fixedCount} fixed, ${errorCount} errors`);

    } catch (error) {
      console.error('Processing error:', error);
      toast.error('Failed to process articles');
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  };

  const getStatusIcon = (status: ArticleWithIssue['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Bulk Speakable Answer Regeneration</h1>
          <p className="text-muted-foreground">
            Scan for non-English articles with English speakable answers and regenerate them in the correct language.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Total Non-EN Articles</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.withIssues}</div>
              <p className="text-xs text-muted-foreground">With English Speakable</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-600">{stats.fixed}</div>
              <p className="text-xs text-muted-foreground">Fixed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
              <p className="text-xs text-muted-foreground">Errors</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">
                {stats.withIssues > 0 ? Math.round((stats.fixed / stats.withIssues) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              Actions
            </CardTitle>
            <CardDescription>
              First scan to detect issues, then regenerate speakable answers in bulk.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={scanForIssues} 
                disabled={isScanning || isProcessing}
                variant="outline"
              >
                <Search className="h-4 w-4 mr-2" />
                {isScanning ? 'Scanning...' : 'Scan for Issues'}
              </Button>
              <Button 
                onClick={regenerateAll} 
                disabled={isProcessing || articles.length === 0}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
                {isProcessing ? 'Processing...' : `Regenerate All (${articles.length})`}
              </Button>
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  Processing... {progress}% complete
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Articles List */}
        {articles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Articles with Issues ({articles.length})</CardTitle>
              <CardDescription>
                These articles have non-English language codes but English speakable content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {articles.map(article => (
                    <div 
                      key={article.id} 
                      className="p-4 border rounded-lg space-y-2"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(article.status)}
                            <Badge variant="outline">
                              {LANGUAGE_NAMES[article.language] || article.language}
                            </Badge>
                            <span className="text-sm font-medium truncate">
                              {article.headline}
                            </span>
                          </div>
                          
                          <div className="text-xs text-muted-foreground">
                            <span className="font-medium">Current (English):</span>{' '}
                            {article.speakable_answer.substring(0, 100)}...
                          </div>
                          
                          {article.newSpeakable && (
                            <div className="text-xs text-green-600 mt-1">
                              <span className="font-medium">New ({LANGUAGE_NAMES[article.language]}):</span>{' '}
                              {article.newSpeakable.substring(0, 100)}...
                            </div>
                          )}
                          
                          {article.error && (
                            <div className="text-xs text-red-500 mt-1">
                              Error: {article.error}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
