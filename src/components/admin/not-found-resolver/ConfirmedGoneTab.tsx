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
import { Ban, Download, Search, Loader2, Trash2 } from "lucide-react";
import {
  useConfirmedGoneUrls,
  useDeleteGoneUrl,
  exportUrlsToCsv,
} from "@/hooks/useNotFoundAnalysis";
import { format } from "date-fns";

const REASON_LABELS: Record<string, string> = {
  legacy_structure: "Legacy URL",
  content_removed: "Content Removed",
  duplicate_content: "Duplicate",
  migration_cleanup: "Migration",
  gsc_import: "GSC Import",
  other: "Other",
};

export function ConfirmedGoneTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: goneUrls, isLoading } = useConfirmedGoneUrls();
  const deleteMutation = useDeleteGoneUrl();

  const filteredUrls = goneUrls?.filter(u =>
    u.url_path.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleExport = () => {
    if (goneUrls) {
      exportUrlsToCsv(goneUrls, "confirmed-410s");
    }
  };

  // Group by reason for stats
  const reasonCounts = goneUrls?.reduce((acc, u) => {
    const reason = u.reason || "other";
    acc[reason] = (acc[reason] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-destructive" />
              Confirmed 410 URLs
            </CardTitle>
            <CardDescription>
              Truly missing content that should remain marked as 410 Gone. These will never return.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {goneUrls?.length || 0} URLs
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Reason Stats */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(reasonCounts).map(([reason, count]) => (
            <Badge key={reason} variant="outline" className="text-xs">
              {REASON_LABELS[reason] || reason}: {count}
            </Badge>
          ))}
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search URLs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredUrls.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery ? "No URLs match your search" : "No confirmed 410 URLs found"}
          </div>
        ) : (
          <div className="border rounded-lg max-h-[500px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead>URL Path</TableHead>
                  <TableHead className="w-32">Reason</TableHead>
                  <TableHead className="w-40">Added</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUrls.slice(0, 100).map((url) => (
                  <TableRow key={url.id}>
                    <TableCell className="font-mono text-sm max-w-md truncate">
                      {url.url_path}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {REASON_LABELS[url.reason || "other"] || url.reason}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(url.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove from 410 list?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove the URL from the gone_urls table. 
                              If the content doesn't exist, it will return a 404 instead of 410.
                              <br /><br />
                              <code className="text-xs bg-muted p-1 rounded">{url.url_path}</code>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteMutation.mutate(url.id)}>
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredUrls.length > 100 && (
              <div className="p-4 text-center text-sm text-muted-foreground border-t">
                Showing 100 of {filteredUrls.length} URLs. Use search to find specific URLs.
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <h4 className="font-medium text-destructive mb-2">These URLs are truly gone</h4>
          <p className="text-sm text-muted-foreground">
            These URLs don't match any existing content in any language. They should remain in the 
            gone_urls table so they return a proper 410 Gone status to search engines. Only remove 
            a URL if you're certain the content has been restored.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
