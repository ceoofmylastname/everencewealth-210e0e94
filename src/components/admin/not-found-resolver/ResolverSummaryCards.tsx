import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Calendar, Languages, Ban, Loader2 } from "lucide-react";
import type { AnalysisSummary } from "@/hooks/useNotFoundAnalysis";

interface ResolverSummaryCardsProps {
  summary: AnalysisSummary | undefined;
  isLoading: boolean;
}

export function ResolverSummaryCards({ summary, isLoading }: ResolverSummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Total 404s
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary?.total || 0}</div>
          <p className="text-xs text-muted-foreground">URLs in gone_urls table</p>
        </CardContent>
      </Card>

      <Card className="border-amber-500/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4 text-amber-500" />
            Malformed URLs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600">{summary?.malformed || 0}</div>
          <p className="text-xs text-muted-foreground">Date patterns to delete</p>
        </CardContent>
      </Card>

      <Card className="border-blue-500/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Languages className="h-4 w-4 text-blue-500" />
            Language Mismatches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{summary?.languageMismatch || 0}</div>
          <p className="text-xs text-muted-foreground">Fixable with redirects</p>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Ban className="h-4 w-4 text-destructive" />
            Truly Missing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{summary?.trulyMissing || 0}</div>
          <p className="text-xs text-muted-foreground">Should remain 410</p>
        </CardContent>
      </Card>
    </div>
  );
}
