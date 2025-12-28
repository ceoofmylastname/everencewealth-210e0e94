import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Clock, AlertCircle, ListTodo, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TranslationResult {
  success: boolean;
  headline?: string;
  error?: string;
}

interface TranslationProgressModalProps {
  open: boolean;
  onClose: () => void;
  clusterTheme: string;
  targetLanguage: string;
  languageName: string;
  languageFlag: string;
  isTranslating: boolean;
  progress: {
    current: number;
    total: number;
    currentHeadline?: string;
  };
  results?: TranslationResult[];
  error?: string | null;
  duration?: string;
  onRetry?: () => void;
  // New queue-based props
  mode?: 'direct' | 'queue';
  jobsCreated?: number;
  jobsSkipped?: number;
  queueUrl?: string;
}

export function TranslationProgressModal({
  open,
  onClose,
  clusterTheme,
  targetLanguage,
  languageName,
  languageFlag,
  isTranslating,
  progress,
  results = [],
  error = null,
  duration,
  onRetry,
  mode = 'direct',
  jobsCreated = 0,
  jobsSkipped = 0,
  queueUrl,
}: TranslationProgressModalProps) {
  const navigate = useNavigate();
  
  const progressPercent = progress.total > 0 
    ? Math.round((progress.current / progress.total) * 100) 
    : 0;

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  const isComplete = !isTranslating && (results.length > 0 || mode === 'queue');
  const hasErrors = failCount > 0 || error;

  // Queue mode: jobs were created successfully
  const isQueueMode = mode === 'queue' && jobsCreated > 0;

  const handleGoToQueue = () => {
    onClose();
    navigate(queueUrl || '/admin/translation-queue');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{languageFlag}</span>
            {isTranslating 
              ? `Queuing ${languageName} translations...`
              : isQueueMode
                ? 'Jobs Queued Successfully!'
                : hasErrors 
                  ? 'Translation Completed with Errors'
                  : 'Translation Complete!'}
          </DialogTitle>
          <DialogDescription className="truncate">
            {clusterTheme}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Loading/Queuing indicator */}
          {isTranslating && (
            <>
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Creating translation jobs...
              </p>
            </>
          )}

          {/* Queue Mode Success */}
          {isQueueMode && isComplete && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2">
                  <ListTodo className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-green-700 dark:text-green-400">
                    {jobsCreated} translation job{jobsCreated !== 1 ? 's' : ''} queued
                  </span>
                </div>
                {jobsSkipped > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {jobsSkipped} article{jobsSkipped !== 1 ? 's' : ''} already translated (skipped)
                  </p>
                )}
                {duration && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Completed in {duration}
                  </p>
                )}
              </div>

              <div className="p-3 rounded-lg bg-muted">
                <p className="text-sm">
                  <strong>Next step:</strong> Go to Translation Queue to process these jobs one at a time. 
                  This prevents timeout errors.
                </p>
              </div>

              <Button onClick={handleGoToQueue} className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Translation Queue
              </Button>
            </div>
          )}

          {/* All already translated */}
          {mode === 'queue' && jobsCreated === 0 && jobsSkipped > 0 && isComplete && (
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-blue-700 dark:text-blue-400">
                  All {jobsSkipped} articles already translated to {languageName}
                </span>
              </div>
            </div>
          )}

          {/* Direct Mode Progress (legacy fallback) */}
          {mode === 'direct' && isTranslating && (
            <>
              <Progress value={progressPercent} className="w-full" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Translating article {progress.current} of {progress.total}...
                </span>
                <span className="font-medium">{progressPercent}%</span>
              </div>
              {progress.currentHeadline && (
                <p className="text-xs text-muted-foreground truncate">
                  Current: "{progress.currentHeadline}"
                </p>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Estimated time: ~{Math.ceil((progress.total - progress.current) * 30 / 60)} minutes remaining</span>
              </div>
            </>
          )}

          {/* Direct Mode Results (legacy) */}
          {mode === 'direct' && isComplete && results.length > 0 && (
            <div className="space-y-3">
              <div className={`p-3 rounded-lg ${hasErrors ? 'bg-yellow-500/10' : 'bg-green-500/10'}`}>
                <div className="flex items-center gap-2">
                  {hasErrors ? (
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  )}
                  <span className="font-medium">
                    {successCount} article{successCount !== 1 ? 's' : ''} translated
                    {failCount > 0 && `, ${failCount} failed`}
                  </span>
                </div>
                {duration && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Duration: {duration}
                  </p>
                )}
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1">
                {results.map((result, i) => (
                  <div 
                    key={i} 
                    className={`flex items-start gap-2 text-sm p-2 rounded ${
                      result.success ? 'bg-muted/50' : 'bg-destructive/10'
                    }`}
                  >
                    {result.success ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate">{result.headline || 'Unknown article'}</p>
                      {result.error && (
                        <p className="text-xs text-destructive break-words">
                          {result.error.includes('timeout') || result.error.includes('timed out')
                            ? '⏱️ Translation timed out - article may be too long'
                            : result.error.includes('too long')
                            ? '📏 Article content exceeds translation limit'
                            : result.error.includes('Failed to send') || result.error.includes('Failed to fetch')
                            ? '🔌 Backend request timed out - use Translation Queue instead'
                            : result.error}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex items-center gap-2 text-destructive">
                <XCircle className="w-5 h-5" />
                <span className="font-medium">
                  {error.includes('Failed to send') || error.includes('Failed to fetch')
                    ? 'Request Timed Out'
                    : 'Translation Failed'}
                </span>
              </div>
              <p className="text-sm text-destructive mt-1">
                {error.includes('Failed to send') || error.includes('Failed to fetch')
                  ? 'The request took too long. Translation jobs may have been created - check the Translation Queue.'
                  : error}
              </p>
              {(error.includes('Failed to send') || error.includes('Failed to fetch')) && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleGoToQueue}
                  className="mt-2"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Check Translation Queue
                </Button>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            {mode === 'direct' && hasErrors && onRetry && (
              <Button variant="outline" onClick={onRetry}>
                Retry Failed
              </Button>
            )}
            {!isQueueMode && (
              <Button 
                onClick={onClose}
                disabled={isTranslating}
              >
                {isTranslating ? 'Please wait...' : 'Close'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
