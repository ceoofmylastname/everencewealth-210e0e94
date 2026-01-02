import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, HelpCircle, Loader2, PlayCircle, AlertTriangle, FileText } from "lucide-react";
import { ClusterData, getLanguageFlag, getAllExpectedLanguages } from "./types";

interface ClusterQATabProps {
  cluster: ClusterData;
  onPublishQAs: () => void;
  onGenerateQAs: (articleId?: string) => void;
  publishingQAs: string | null;
  generatingQALanguage: { clusterId: string; lang: string } | null;
}

// Correct architecture: 6 articles × 4 Q&A types × 10 languages = 240 Q&As per cluster
// Per language: 6 articles × 4 Q&A types = 24 Q&As
const QAS_PER_ARTICLE = 4;
const ARTICLES_PER_LANGUAGE = 6;
const EXPECTED_QAS_PER_LANGUAGE = QAS_PER_ARTICLE * ARTICLES_PER_LANGUAGE; // 24
const TOTAL_LANGUAGES = 10;
const EXPECTED_QAS_PER_CLUSTER = EXPECTED_QAS_PER_LANGUAGE * TOTAL_LANGUAGES; // 240

export const ClusterQATab = ({
  cluster,
  onPublishQAs,
  onGenerateQAs,
  publishingQAs,
  generatingQALanguage,
}: ClusterQATabProps) => {
  const isPublishing = publishingQAs === cluster.cluster_id;
  const isGenerating = generatingQALanguage?.clusterId === cluster.cluster_id;

  // Calculate correct totals based on actual articles per language
  const getQAStatusForLanguage = (lang: string) => {
    const articleCount = cluster.languages[lang]?.total || 0;
    // Expected: 4 Q&As per article in that language
    const expectedQAs = articleCount * QAS_PER_ARTICLE;
    const actualQAs = cluster.qa_pages[lang]?.total || 0;
    const publishedQAs = cluster.qa_pages[lang]?.published || 0;

    return {
      articleCount,
      expectedQAs,
      actualQAs,
      publishedQAs,
      isComplete: actualQAs >= expectedQAs && expectedQAs > 0,
      allPublished: publishedQAs >= actualQAs && actualQAs > 0,
    };
  };

  // Calculate cluster-wide expectations
  const totalExpectedQAs = Object.values(cluster.languages).reduce(
    (sum, lang) => sum + (lang.total * QAS_PER_ARTICLE), 
    0
  );
  const completionPercent = totalExpectedQAs > 0 
    ? Math.round((cluster.total_qa_pages / totalExpectedQAs) * 100) 
    : 0;

  const expectedLanguages = getAllExpectedLanguages(cluster);
  const languagesNeedingQAs = expectedLanguages.filter((lang) => {
    const status = getQAStatusForLanguage(lang);
    return status.articleCount > 0 && !status.isComplete;
  });

  const draftQAsCount = cluster.total_qa_pages - cluster.total_qa_published;

  return (
    <div className="space-y-4">
      {/* Summary Stats - Updated with correct expectations */}
      <div className="grid grid-cols-4 gap-4">
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <div className="text-2xl font-bold">{cluster.total_qa_pages}</div>
          <div className="text-xs text-muted-foreground">Total Q&As</div>
          <div className="text-xs text-muted-foreground/70">of {totalExpectedQAs} expected</div>
        </div>
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{cluster.total_qa_published}</div>
          <div className="text-xs text-muted-foreground">Published</div>
        </div>
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <div className="text-2xl font-bold text-amber-600">{draftQAsCount}</div>
          <div className="text-xs text-muted-foreground">Draft</div>
        </div>
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <div className="text-2xl font-bold">{completionPercent}%</div>
          <div className="text-xs text-muted-foreground">Complete</div>
        </div>
      </div>

      {/* Completion Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Q&A Generation Progress</span>
          <span className="font-medium">
            {cluster.total_qa_pages}/{totalExpectedQAs} Q&As
          </span>
        </div>
        <Progress value={completionPercent} className="h-2" />
        <p className="text-xs text-muted-foreground">
          Architecture: {Object.keys(cluster.languages).length} languages × {Object.values(cluster.languages)[0]?.total || 0} articles × 4 Q&A types
        </p>
      </div>

      {/* Language-by-Language Q&A Status */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Q&As by Language (expected: 24 per language)</h4>
        <div className="grid grid-cols-5 gap-2">
          {expectedLanguages.map((lang) => {
            const status = getQAStatusForLanguage(lang);

            return (
              <div
                key={lang}
                className={`p-2 rounded-lg border text-center relative ${
                  status.allPublished
                    ? "bg-green-50 border-green-200 dark:bg-green-950/30"
                    : status.isComplete
                    ? "bg-blue-50 border-blue-200 dark:bg-blue-950/30"
                    : status.articleCount === 0
                    ? "bg-gray-50 border-dashed border-gray-200 dark:bg-gray-800/50"
                    : "bg-amber-50 border-amber-200 dark:bg-amber-950/30"
                }`}
              >
                <div className="text-lg">{getLanguageFlag(lang)}</div>
                <div className="text-sm font-medium">
                  {status.actualQAs}/{status.expectedQAs}
                </div>
                <div className="text-xs text-muted-foreground">
                  {status.publishedQAs}P
                  {status.allPublished && " ✓"}
                </div>
                
                {/* Status indicator */}
                {status.isComplete && status.allPublished && (
                  <CheckCircle className="absolute -top-1 -right-1 h-4 w-4 text-green-500" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Warnings */}
      {languagesNeedingQAs.length > 0 && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950/30">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
          <div className="text-sm">
            <span className="font-medium text-amber-800 dark:text-amber-300">
              {languagesNeedingQAs.length} language(s) incomplete:
            </span>
            <span className="text-amber-700 dark:text-amber-400 ml-1">
              {languagesNeedingQAs.map((l) => l.toUpperCase()).join(", ")}
            </span>
            <div className="text-xs text-amber-600 mt-1">
              Use "Generate Q&As" to create Q&As for each English article (40 Q&As per article across all languages)
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-2 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={onPublishQAs}
          disabled={draftQAsCount === 0 || isPublishing}
        >
          {isPublishing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="mr-2 h-4 w-4" />
          )}
          Publish All Q&As ({draftQAsCount} drafts)
        </Button>

        {cluster.total_qa_pages < totalExpectedQAs && (
          <Button
            variant="default"
            size="sm"
            onClick={() => onGenerateQAs()}
            disabled={isGenerating}
            className="bg-amber-500 hover:bg-amber-600"
          >
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            Generate Q&As (40 per article)
          </Button>
        )}
      </div>
      
      {isGenerating && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950/30">
          <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Generating Q&As... This may take several minutes per article.</span>
          </div>
        </div>
      )}
    </div>
  );
};
