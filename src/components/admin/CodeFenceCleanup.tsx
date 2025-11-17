import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Loader2, Search, Sparkles, CheckCircle2, AlertTriangle, Code2, Undo2 } from "lucide-react";

interface AffectedArticle {
  id: string;
  headline: string;
  language: string;
  slug: string;
  fields_affected: string[];
  previews: Record<string, string>;
  fence_types: Record<string, string>;
}

interface ScanResults {
  affected_articles: AffectedArticle[];
  total_affected: number;
}

interface CleanupResult {
  article_id: string;
  headline: string;
  success: boolean;
  changes: Record<string, string>;
  revision_id?: string;
  error?: string;
}

export const CodeFenceCleanup = () => {
  const [scanResults, setScanResults] = useState<ScanResults | null>(null);
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [backupEnabled, setBackupEnabled] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanupProgress, setCleanupProgress] = useState(0);
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0);
  const [cleanupResults, setCleanupResults] = useState<{
    results: CleanupResult[];
    success_count: number;
    error_count: number;
  } | null>(null);

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const handleScan = async () => {
    setIsScanning(true);
    setScanResults(null);
    setSelectedArticles([]);
    setCleanupResults(null);

    try {
      const { data, error } = await supabase.functions.invoke("detect-code-fences");

      if (error) throw error;

      setScanResults(data);
      
      if (data.total_affected === 0) {
        toast.success("No articles with code fence prefixes found!");
      } else {
        toast.info(`Found ${data.total_affected} articles with code fence prefixes`);
      }
    } catch (error: any) {
      console.error("Scan error:", error);
      toast.error(`Scan failed: ${error.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && scanResults) {
      setSelectedArticles(scanResults.affected_articles.map((a) => a.id));
    } else {
      setSelectedArticles([]);
    }
  };

  const toggleArticle = (articleId: string) => {
    setSelectedArticles((prev) =>
      prev.includes(articleId)
        ? prev.filter((id) => id !== articleId)
        : [...prev, articleId]
    );
  };

  const handleCleanup = async () => {
    if (selectedArticles.length === 0) return;

    setIsCleaning(true);
    setCleanupProgress(0);
    setCurrentArticleIndex(0);

    try {
      const { data, error } = await supabase.functions.invoke("cleanup-code-fences", {
        body: {
          article_ids: selectedArticles,
          backup_enabled: backupEnabled,
          user_id: user?.id,
        },
      });

      if (error) throw error;

      setCleanupResults(data);
      setCleanupProgress(100);

      if (data.error_count === 0) {
        toast.success(`Successfully cleaned ${data.success_count} articles!`);
      } else {
        toast.warning(
          `Cleaned ${data.success_count} articles. ${data.error_count} failed.`
        );
      }

      // Clear selection and refresh scan
      setSelectedArticles([]);
      handleScan();
    } catch (error: any) {
      console.error("Cleanup error:", error);
      toast.error(`Cleanup failed: ${error.message}`);
    } finally {
      setIsCleaning(false);
    }
  };

  const handleRollback = async (revisionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("rollback-code-fence-cleanup", {
        body: {
          revision_id: revisionId,
          user_id: user?.id,
        },
      });

      if (error) throw error;

      toast.success(`Successfully rolled back: ${data.headline}`);
      
      // Refresh results
      setCleanupResults(null);
      handleScan();
    } catch (error: any) {
      console.error("Rollback error:", error);
      toast.error(`Rollback failed: ${error.message}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code2 className="w-5 h-5" />
          Bulk Code Fence Cleanup
        </CardTitle>
        <CardDescription>
          Remove accidental ```html and other code fence prefixes from article content
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Step 1: Scan Button */}
        <Button onClick={handleScan} disabled={isScanning} size="lg">
          {isScanning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Scan All Articles
            </>
          )}
        </Button>

        {/* Step 2: Results Table */}
        {scanResults && scanResults.total_affected > 0 && (
          <>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Found {scanResults.total_affected} articles with code fence prefixes
              </AlertDescription>
            </Alert>

            {/* Select All Checkbox */}
            <div className="flex items-center gap-2">
              <Checkbox
                checked={
                  selectedArticles.length === scanResults.affected_articles.length &&
                  scanResults.affected_articles.length > 0
                }
                onCheckedChange={handleSelectAll}
              />
              <label className="text-sm font-medium">
                Select All ({scanResults.affected_articles.length})
              </label>
            </div>

            {/* Articles Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Headline</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Fields Affected</TableHead>
                    <TableHead>Preview</TableHead>
                    <TableHead>Fence Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scanResults.affected_articles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedArticles.includes(article.id)}
                          onCheckedChange={() => toggleArticle(article.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{article.headline}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{article.language}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {article.fields_affected.map((field) => (
                            <Badge key={field} variant="secondary" className="text-xs">
                              {field}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <code className="text-xs bg-muted p-1 rounded block truncate">
                          {Object.values(article.previews)[0]?.substring(0, 60)}...
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">
                          {Object.values(article.fence_types)[0] || 'generic'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Backup Toggle */}
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <Switch checked={backupEnabled} onCheckedChange={setBackupEnabled} />
              <div className="flex-1">
                <label className="text-sm font-medium">
                  Backup original content before cleanup (recommended)
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  Creates a backup with 24-hour rollback window
                </p>
              </div>
              {backupEnabled && (
                <Badge variant="outline" className="ml-auto">
                  24hr rollback
                </Badge>
              )}
            </div>

            {/* Action Buttons */}
            <Button
              onClick={handleCleanup}
              disabled={selectedArticles.length === 0 || isCleaning}
              size="lg"
              className="w-full"
            >
              {isCleaning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cleaning...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Fix {selectedArticles.length} Selected Articles
                </>
              )}
            </Button>

            {/* Progress Bar */}
            {isCleaning && (
              <div className="space-y-2">
                <Progress value={cleanupProgress} />
                <p className="text-sm text-muted-foreground text-center">
                  Processing article {currentArticleIndex + 1} of {selectedArticles.length}
                </p>
              </div>
            )}
          </>
        )}

        {/* Results Summary */}
        {cleanupResults && (
          <>
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription>
                Successfully cleaned {cleanupResults.success_count} articles.
                {cleanupResults.error_count > 0 && (
                  <span className="text-destructive ml-2">
                    {cleanupResults.error_count} failed.
                  </span>
                )}
              </AlertDescription>
            </Alert>

            {/* Cleaned Articles with Rollback */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Recently Cleaned Articles</h3>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Headline</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Changes Made</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cleanupResults.results.map((result) => (
                      <TableRow key={result.article_id}>
                        <TableCell className="font-medium">{result.headline}</TableCell>
                        <TableCell>
                          {result.success ? (
                            <Badge className="bg-green-500">Cleaned</Badge>
                          ) : (
                            <Badge variant="destructive">Failed</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {Object.entries(result.changes).map(([field, change]) => (
                              <div key={field} className="text-xs">
                                <code className="bg-muted px-1 rounded">{field}:</code>{" "}
                                {change}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {result.success && result.revision_id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRollback(result.revision_id!)}
                            >
                              <Undo2 className="w-3 h-3" />
                              Rollback
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </>
        )}

        {scanResults && scanResults.total_affected === 0 && (
          <Alert>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription>
              ✅ No articles with code fence prefixes found. All content is clean!
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
