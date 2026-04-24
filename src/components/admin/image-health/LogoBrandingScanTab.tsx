import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  ShieldAlert,
  ScanSearch,
  Loader2,
  Wand2,
  CheckCircle2,
  XCircle,
  ImageIcon,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoIssue {
  id: string;
  article_id: string;
  severity: 'low' | 'medium' | 'high';
  details: {
    brand_name?: string | null;
    text_type?: string;
    description?: string;
    imageUrl?: string;
    original_url?: string;
  };
  analyzed_at: string;
  resolved_at: string | null;
  article?: {
    id: string;
    headline: string;
    language: string;
    slug: string;
    featured_image_url: string;
  };
}

interface ScanJob {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  total: number;
  processed: number;
  flagged: number;
  error_message: string | null;
  started_at: string | null;
  finished_at: string | null;
}

const flagFor = (lang: string) => {
  const flags: Record<string, string> = { en: '🇬🇧', es: '🇪🇸' };
  return flags[lang] || '🌐';
};

export function LogoBrandingScanTab() {
  const [issues, setIssues] = useState<LogoIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<ScanJob | null>(null);
  const [starting, setStarting] = useState(false);
  const [replacing, setReplacing] = useState<Set<string>>(new Set());
  const [resolved, setResolved] = useState<Set<string>>(new Set());
  const [bulkReplacing, setBulkReplacing] = useState(false);

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('article_image_issues')
      .select(`
        *,
        article:blog_articles(id, headline, language, slug, featured_image_url)
      `)
      .eq('issue_type', 'logo_detected')
      .is('resolved_at', null)
      .order('analyzed_at', { ascending: false });

    if (error) {
      console.error(error);
      toast.error('Failed to load flagged images');
    } else {
      setIssues((data || []) as unknown as LogoIssue[]);
    }
    setLoading(false);
  }, []);

  const fetchLatestJob = useCallback(async () => {
    const { data } = await supabase
      .from('image_scan_jobs')
      .select('*')
      .eq('scan_type', 'logos')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) setJob(data as ScanJob);
  }, []);

  useEffect(() => {
    fetchIssues();
    fetchLatestJob();
  }, [fetchIssues, fetchLatestJob]);

  // Realtime: subscribe to the active job for live progress
  useEffect(() => {
    if (!job?.id || job.status === 'completed' || job.status === 'failed') return;
    const channel = supabase
      .channel(`scan-job-${job.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'image_scan_jobs', filter: `id=eq.${job.id}` },
        (payload) => {
          setJob(payload.new as ScanJob);
          if ((payload.new as ScanJob).status === 'completed') {
            fetchIssues();
            toast.success(
              `Scan complete — ${(payload.new as ScanJob).flagged} flagged of ${(payload.new as ScanJob).total} scanned`
            );
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [job?.id, job?.status, fetchIssues]);

  const startScan = async () => {
    setStarting(true);
    try {
      const { data: jobRow, error: jobErr } = await supabase
        .from('image_scan_jobs')
        .insert({ scan_type: 'logos', status: 'pending' })
        .select()
        .single();

      if (jobErr || !jobRow) throw jobErr || new Error('Could not create scan job');
      setJob(jobRow as ScanJob);

      // Fire and forget — function streams progress into the job row
      supabase.functions
        .invoke('scan-article-images', { body: { scanType: 'logos', jobId: jobRow.id } })
        .then(({ error }) => {
          if (error) {
            console.error(error);
            toast.error('Logo scan failed to start');
          }
        });

      toast.info('Logo scan started — progress updates live below.');
    } catch (e) {
      console.error(e);
      toast.error('Could not start logo scan');
    } finally {
      setStarting(false);
    }
  };

  const replaceOne = async (issue: LogoIssue) => {
    if (!issue.article) return;
    setReplacing((prev) => new Set([...prev, issue.article_id]));
    try {
      const originalUrl = issue.article.featured_image_url;
      const { error } = await supabase.functions.invoke('regenerate-article-image', {
        body: { articleId: issue.article_id },
      });
      if (error) throw error;

      await supabase
        .from('article_image_issues')
        .update({
          resolved_at: new Date().toISOString(),
          resolved_by: 'logo_replace',
          details: { ...issue.details, original_url: originalUrl },
        })
        .eq('id', issue.id);

      setResolved((prev) => new Set([...prev, issue.article_id]));
      toast.success(`Replaced: "${issue.article.headline.substring(0, 40)}..."`);
    } catch (e) {
      console.error(e);
      toast.error(`Failed to replace image for "${issue.article.headline.substring(0, 30)}..."`);
    } finally {
      setReplacing((prev) => {
        const next = new Set(prev);
        next.delete(issue.article_id);
        return next;
      });
    }
  };

  const approveOne = async (issue: LogoIssue) => {
    await supabase
      .from('article_image_issues')
      .update({
        resolved_at: new Date().toISOString(),
        resolved_by: 'manual_approve',
      })
      .eq('id', issue.id);
    toast.success('Marked as approved (no change made)');
    setIssues((prev) => prev.filter((i) => i.id !== issue.id));
  };

  const replaceAll = async () => {
    setBulkReplacing(true);
    const queue = [...issues];
    let done = 0;
    for (const issue of queue) {
      if (resolved.has(issue.article_id)) continue;
      // Process sequentially to avoid hammering Kie.ai
      // eslint-disable-next-line no-await-in-loop
      await replaceOne(issue);
      done += 1;
      toast.info(`Bulk replace: ${done}/${queue.length}`);
    }
    setBulkReplacing(false);
    toast.success(`Bulk replace finished — ${done} images regenerated`);
    fetchIssues();
  };

  const visibleIssues = issues.filter((i) => !resolved.has(i.article_id));
  const isRunning = job?.status === 'running' || job?.status === 'pending';
  const progressPct = job && job.total > 0 ? Math.round((job.processed / job.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Action header */}
      <Card className="border-primary/30">
        <CardHeader>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-primary" />
                Logo & Branding Scan
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                Detects competitor logos, brand wordmarks, watermarks, and photographer credits
                baked into article images. Replace flagged images with logo-free versions in one click.
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={startScan} disabled={starting || isRunning}>
                {starting || isRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isRunning ? 'Scanning…' : 'Starting…'}
                  </>
                ) : (
                  <>
                    <ScanSearch className="mr-2 h-4 w-4" />
                    Scan All Article Images for Logos
                  </>
                )}
              </Button>

              {visibleIssues.length > 0 && !isRunning && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={bulkReplacing}>
                      {bulkReplacing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Replacing…
                        </>
                      ) : (
                        <>
                          <Wand2 className="mr-2 h-4 w-4" />
                          Replace All Flagged ({visibleIssues.length})
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Replace {visibleIssues.length} flagged images?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will regenerate every flagged image with the hardened
                        no-logo prompt (~8 seconds each, ≈{' '}
                        {Math.ceil((visibleIssues.length * 8) / 60)} min total).
                        Old images will be deleted from storage.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={replaceAll}>Yes, replace all</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Live progress */}
        {job && (
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {job.status === 'running' && 'Scanning…'}
                {job.status === 'pending' && 'Queued…'}
                {job.status === 'completed' && 'Last scan completed'}
                {job.status === 'failed' && 'Last scan failed'}
                {job.status === 'cancelled' && 'Last scan cancelled'}
              </span>
              <span className="text-muted-foreground">
                {job.processed} / {job.total} images • {job.flagged} flagged
              </span>
            </div>
            <Progress value={progressPct} />
            {job.error_message && (
              <p className="text-xs text-destructive">{job.error_message}</p>
            )}
          </CardContent>
        )}
      </Card>

      {/* Flagged gallery */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : visibleIssues.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Sparkles className="h-10 w-10 text-green-500 mb-3" />
            <h3 className="text-lg font-medium">No flagged images</h3>
            <p className="text-muted-foreground max-w-md">
              Run a scan to detect competitor logos, watermarks, or brand marks across all published article images.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleIssues.map((issue) => {
            const isReplacing = replacing.has(issue.article_id);
            const brand = issue.details?.brand_name;
            return (
              <Card key={issue.id} className="overflow-hidden border-destructive/40">
                <div className="aspect-video bg-muted relative">
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
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex gap-1">
                    <Badge variant="destructive" className="gap-1">
                      <ShieldAlert className="h-3 w-3" />
                      {brand ? brand : 'Logo detected'}
                    </Badge>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary">{flagFor(issue.article?.language || 'en')}</Badge>
                  </div>
                </div>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h4 className="font-medium text-sm line-clamp-2">
                      {issue.article?.headline || 'Unknown article'}
                    </h4>
                    {issue.details?.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {issue.details.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => replaceOne(issue)}
                      disabled={isReplacing || bulkReplacing}
                    >
                      {isReplacing ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          Replacing
                        </>
                      ) : (
                        <>
                          <Wand2 className="mr-2 h-3 w-3" />
                          Replace
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => approveOne(issue)}
                      disabled={isReplacing || bulkReplacing}
                    >
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Approve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
