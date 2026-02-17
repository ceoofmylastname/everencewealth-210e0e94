import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "@/components/ui/alert-dialog";
import { ArrowRight, Download, Search, Loader2, Languages, CheckCircle2, ExternalLink } from "lucide-react";
import {
  useLanguageMismatches,
  useDeleteMismatchUrls,
  exportUrlsToCsv,
  type LanguageMismatch,
} from "@/hooks/useNotFoundAnalysis";

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  de: "German",
  nl: "Dutch",
  fr: "French",
  sv: "Swedish",
  no: "Norwegian",
  da: "Danish",
  fi: "Finnish",
  pl: "Polish",
  hu: "Hungarian",
};

export function LanguageMismatchTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: mismatches, isLoading } = useLanguageMismatches();
  const deleteMutation = useDeleteMismatchUrls();

  const filteredMismatches = mismatches?.filter(m =>
    m.url_path.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.slug.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleFixAll = () => {
    if (mismatches && mismatches.length > 0) {
      deleteMutation.mutate(mismatches.map(m => m.id));
    }
  };

  const handleExport = () => {
    if (mismatches) {
      const exportData = mismatches.map(m => ({
        url_path: m.url_path,
        url_lang: m.url_lang,
        actual_language: m.actual_language,
        correct_url: m.correct_url,
      }));
      const csv = [
        "url_path,url_lang,actual_language,correct_url",
        ...exportData.map(d => `"${d.url_path}","${d.url_lang}","${d.actual_language}","${d.correct_url}"`),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `language-mismatches-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5 text-blue-500" />
              Language Mismatch URLs
            </CardTitle>
            <CardDescription>
              URLs where content exists but with a different language. Removing from gone_urls lets the edge function redirect.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {mismatches?.length || 0} URLs
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Actions Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search URLs or slugs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="default" 
                  size="sm"
                  disabled={!mismatches?.length || deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  Fix All ({mismatches?.length || 0})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Fix All Language Mismatches?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove {mismatches?.length || 0} URLs from the gone_urls table.
                    The edge function will then automatically redirect these URLs to the correct language version.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleFixAll}>
                    Fix All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredMismatches.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery ? "No URLs match your search" : "No language mismatch URLs found"}
          </div>
        ) : (
          <div className="border rounded-lg max-h-[500px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead>URL Path</TableHead>
                  <TableHead className="w-32">Type</TableHead>
                  <TableHead className="w-40">Language Change</TableHead>
                  <TableHead className="w-48">Correct URL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMismatches.slice(0, 100).map((mismatch) => (
                  <TableRow key={mismatch.id}>
                    <TableCell className="font-mono text-sm max-w-md truncate">
                      {mismatch.url_path}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {mismatch.content_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="text-xs">
                          {mismatch.url_lang.toUpperCase()}
                        </Badge>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <Badge className="text-xs bg-green-600">
                          {mismatch.actual_language.toUpperCase()}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <a
                        href={`https://www.everencewealth.com${mismatch.correct_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                      >
                        {mismatch.correct_url.slice(0, 30)}...
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredMismatches.length > 100 && (
              <div className="p-4 text-center text-sm text-muted-foreground border-t">
                Showing 100 of {filteredMismatches.length} URLs. Use search to find specific URLs.
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">How this works</h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            These URLs exist in the database but with a different language prefix. By removing them from 
            the gone_urls table, the <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">serve-seo-page</code> edge 
            function will detect the content and automatically redirect to the correct language version with a 301 status.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
