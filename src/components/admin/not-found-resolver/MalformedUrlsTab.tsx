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
import { Trash2, Download, Search, Loader2, Calendar } from "lucide-react";
import {
  useMalformedUrls,
  useDeleteMalformedUrls,
  exportUrlsToCsv,
  type MalformedUrl,
} from "@/hooks/useNotFoundAnalysis";
import { format } from "date-fns";

export function MalformedUrlsTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: malformedUrls, isLoading } = useMalformedUrls();
  const deleteMutation = useDeleteMalformedUrls();

  const filteredUrls = malformedUrls?.filter(u =>
    u.url_path.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleDeleteAll = () => {
    if (malformedUrls && malformedUrls.length > 0) {
      deleteMutation.mutate(malformedUrls.map(u => u.id));
    }
  };

  const handleExport = () => {
    if (malformedUrls) {
      exportUrlsToCsv(malformedUrls, "malformed-urls");
    }
  };

  // Extract the date suffix for display
  const extractDateSuffix = (url: string): string => {
    const match = url.match(/([0-9]{4}-[0-9]{2}-[0-9]{2})$/);
    return match ? match[1] : "";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-500" />
              Malformed URLs (Date Appended)
            </CardTitle>
            <CardDescription>
              URLs with dates incorrectly appended (e.g., slug2025-12-29). These were never valid pages.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {malformedUrls?.length || 0} URLs
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
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
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm"
                  disabled={!malformedUrls?.length || deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete All ({malformedUrls?.length || 0})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete All Malformed URLs?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove {malformedUrls?.length || 0} URLs from the gone_urls table.
                    These URLs have dates incorrectly appended and were never valid pages.
                    They should not return 410 status.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAll}>
                    Delete All
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
        ) : filteredUrls.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery ? "No URLs match your search" : "No malformed URLs found"}
          </div>
        ) : (
          <div className="border rounded-lg max-h-[500px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead>URL Path</TableHead>
                  <TableHead className="w-32">Date Suffix</TableHead>
                  <TableHead className="w-40">Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUrls.slice(0, 100).map((url) => (
                  <TableRow key={url.id}>
                    <TableCell className="font-mono text-sm max-w-md truncate">
                      {url.url_path}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-amber-600 border-amber-500">
                        {extractDateSuffix(url.url_path)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(url.created_at), "MMM d, yyyy")}
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
      </CardContent>
    </Card>
  );
}
