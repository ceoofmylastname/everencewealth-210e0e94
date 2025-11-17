import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle, CheckCircle2, ExternalLink, Link as LinkIcon, Code } from "lucide-react";

interface AffectedArticle {
  id: string;
  headline: string;
  language: string;
  slug: string;
  citation_markers_count: number;
  internal_link_markers_count: number;
  code_fence_count: number;
  total_issues: number;
  citation_markers: string[];
  internal_link_markers: string[];
}

interface Statistics {
  total_affected: number;
  total_citation_markers: number;
  total_internal_link_markers: number;
  total_code_fences: number;
  by_language: Record<string, number>;
  articles_scanned: number;
}

export function ContentMarkerCleanup() {
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [affectedArticles, setAffectedArticles] = useState<AffectedArticle[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set());
  const [backupEnabled, setBackupEnabled] = useState(true);
  const [dryRun, setDryRun] = useState(false);
  const [progress, setProgress] = useState(0);

  const scanArticles = async () => {
    setIsScanning(true);
    setAffectedArticles([]);
    setStatistics(null);
    setSelectedArticles(new Set());

    try {
      const { data, error } = await supabase.functions.invoke('detect-content-markers');

      if (error) throw error;

      setAffectedArticles(data.affected_articles);
      setStatistics(data.statistics);

      toast({
        title: "Scan Complete",
        description: `Found ${data.statistics.total_affected} articles with content markers`,
      });
    } catch (error) {
      console.error('Error scanning:', error);
      toast({
        variant: "destructive",
        title: "Scan Failed",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const toggleArticle = (articleId: string) => {
    const newSelection = new Set(selectedArticles);
    if (newSelection.has(articleId)) {
      newSelection.delete(articleId);
    } else {
      newSelection.add(articleId);
    }
    setSelectedArticles(newSelection);
  };

  const selectAll = () => {
    setSelectedArticles(new Set(affectedArticles.map(a => a.id)));
  };

  const deselectAll = () => {
    setSelectedArticles(new Set());
  };

  const processSelected = async () => {
    if (selectedArticles.size === 0) {
      toast({
        variant: "destructive",
        title: "No Articles Selected",
        description: "Please select at least one article to process",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const articleIds = Array.from(selectedArticles);
      
      const { data, error } = await supabase.functions.invoke('cleanup-content-markers', {
        body: {
          article_ids: articleIds,
          backup_enabled: backupEnabled,
          user_id: user.id,
          dry_run: dryRun,
        },
      });

      if (error) throw error;

      const summary = data.summary;
      
      toast({
        title: dryRun ? "Dry Run Complete" : "Cleanup Complete",
        description: `${summary.successful} articles processed successfully${summary.failed > 0 ? `, ${summary.failed} failed` : ''}`,
      });

      if (!dryRun) {
        // Refresh scan after cleanup
        await scanArticles();
      }
    } catch (error) {
      console.error('Error processing:', error);
      toast({
        variant: "destructive",
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Marker Cleanup</CardTitle>
        <CardDescription>
          Intelligently clean citation markers, internal link placeholders, and code fence artifacts using AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Scan Section */}
        <div className="space-y-4">
          <Button 
            onClick={scanArticles} 
            disabled={isScanning}
            className="w-full"
          >
            {isScanning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scanning Articles...
              </>
            ) : (
              "Scan All Published Articles"
            )}
          </Button>

          {statistics && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-semibold">Scan Results:</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Articles Scanned: <strong>{statistics.articles_scanned}</strong></div>
                    <div>Articles Affected: <strong>{statistics.total_affected}</strong></div>
                    <div>Citation Markers: <strong>{statistics.total_citation_markers}</strong></div>
                    <div>Internal Link Markers: <strong>{statistics.total_internal_link_markers}</strong></div>
                    <div>Code Fences: <strong>{statistics.total_code_fences}</strong></div>
                  </div>
                  {Object.keys(statistics.by_language).length > 0 && (
                    <div className="mt-2">
                      <div className="text-sm font-medium">By Language:</div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {Object.entries(statistics.by_language).map(([lang, count]) => (
                          <Badge key={lang} variant="secondary">
                            {lang}: {count}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Article List */}
        {affectedArticles.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Affected Articles ({affectedArticles.length})
              </h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAll}>
                  Deselect All
                </Button>
              </div>
            </div>

            <div className="border rounded-lg max-h-96 overflow-y-auto">
              {affectedArticles.map((article) => (
                <div
                  key={article.id}
                  className="p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={selectedArticles.has(article.id)}
                      onCheckedChange={() => toggleArticle(article.id)}
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-medium">{article.headline}</div>
                          <div className="text-sm text-muted-foreground">
                            {article.slug} • {article.language}
                          </div>
                        </div>
                        <Badge variant="destructive">
                          {article.total_issues} issues
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm">
                        {article.citation_markers_count > 0 && (
                          <Badge variant="outline" className="gap-1">
                            <ExternalLink className="h-3 w-3" />
                            {article.citation_markers_count} citations
                          </Badge>
                        )}
                        {article.internal_link_markers_count > 0 && (
                          <Badge variant="outline" className="gap-1">
                            <LinkIcon className="h-3 w-3" />
                            {article.internal_link_markers_count} internal links
                          </Badge>
                        )}
                        {article.code_fence_count > 0 && (
                          <Badge variant="outline" className="gap-1">
                            <Code className="h-3 w-3" />
                            {article.code_fence_count} code fences
                          </Badge>
                        )}
                      </div>
                      {article.citation_markers.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          <div className="font-medium">Citation needs:</div>
                          <div className="mt-1 space-y-1">
                            {article.citation_markers.slice(0, 3).map((marker, i) => (
                              <div key={i} className="truncate">• {marker}</div>
                            ))}
                            {article.citation_markers.length > 3 && (
                              <div>... and {article.citation_markers.length - 3} more</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Processing Options */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <Label htmlFor="backup" className="flex flex-col gap-1">
                  <span>Create Backup (24hr rollback)</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    Recommended for safety
                  </span>
                </Label>
                <Switch
                  id="backup"
                  checked={backupEnabled}
                  onCheckedChange={setBackupEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="dryrun" className="flex flex-col gap-1">
                  <span>Dry Run Mode</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    Preview changes without applying
                  </span>
                </Label>
                <Switch
                  id="dryrun"
                  checked={dryRun}
                  onCheckedChange={setDryRun}
                />
              </div>

              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>How it works:</strong>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>Citations: AI finds authoritative sources using Perplexity</li>
                    <li>Internal Links: Matches content to existing articles</li>
                    <li>Code Fences: Removes markdown artifacts cleanly</li>
                    <li>Markers removed if no suitable replacement found</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <Button
                onClick={processSelected}
                disabled={isProcessing || selectedArticles.size === 0}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing {selectedArticles.size} Articles...
                  </>
                ) : (
                  <>
                    {dryRun ? "Preview Changes" : "Clean Selected Articles"} ({selectedArticles.size})
                  </>
                )}
              </Button>

              {isProcessing && (
                <Progress value={progress} className="w-full" />
              )}
            </div>
          </div>
        )}

        {!isScanning && affectedArticles.length === 0 && statistics && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              No articles found with content markers. All content is clean! 🎉
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
