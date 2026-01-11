import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, ImageIcon, AlertTriangle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface ImageHealthData {
  cluster_id: string;
  unique_images: number;
  total_images: number;
  health_percent: number;
}

interface ClusterWithHealth {
  cluster_id: string;
  cluster_theme: string | null;
  created_at: string;
  image_health?: number;
  unique_images?: number;
  total_images?: number;
}

interface BulkImageRegenerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clusters: ClusterWithHealth[];
  imageHealthData?: ImageHealthData[];
}

interface RegenerationProgress {
  currentCluster: string;
  currentIndex: number;
  total: number;
  clusterResult?: { success: number; failed: number; total: number };
}

interface ClusterResult {
  clusterId: string;
  theme: string;
  success: number;
  failed: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export const BulkImageRegenerationDialog = ({
  open,
  onOpenChange,
  clusters,
  imageHealthData,
}: BulkImageRegenerationDialogProps) => {
  const [selectedClusters, setSelectedClusters] = useState<Set<string>>(new Set());
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [progress, setProgress] = useState<RegenerationProgress | null>(null);
  const [clusterResults, setClusterResults] = useState<ClusterResult[]>([]);
  const queryClient = useQueryClient();

  // Merge health data with clusters
  const clustersWithHealth = clusters.map(cluster => {
    const health = imageHealthData?.find(h => h.cluster_id === cluster.cluster_id);
    return {
      ...cluster,
      image_health: health?.health_percent ?? 100,
      unique_images: health ? Number(health.unique_images) : undefined,
      total_images: health ? Number(health.total_images) : undefined,
    };
  });

  // Sort by image health (worst first)
  const sortedClusters = [...clustersWithHealth].sort(
    (a, b) => (a.image_health ?? 100) - (b.image_health ?? 100)
  );

  const criticalClusters = sortedClusters.filter(c => (c.image_health ?? 100) < 20);
  const warningClusters = sortedClusters.filter(c => {
    const health = c.image_health ?? 100;
    return health >= 20 && health < 80;
  });

  const handleSelectAllCritical = () => {
    setSelectedClusters(new Set(criticalClusters.map(c => c.cluster_id)));
  };

  const handleSelectAll = () => {
    setSelectedClusters(new Set(sortedClusters.map(c => c.cluster_id)));
  };

  const handleClearSelection = () => {
    setSelectedClusters(new Set());
  };

  const toggleCluster = (clusterId: string) => {
    const newSelected = new Set(selectedClusters);
    if (newSelected.has(clusterId)) {
      newSelected.delete(clusterId);
    } else {
      newSelected.add(clusterId);
    }
    setSelectedClusters(newSelected);
  };

  const estimatedTime = Math.ceil(selectedClusters.size * 1.5); // ~1.5 min per cluster

  const handleRegenerate = async () => {
    if (selectedClusters.size === 0) return;

    setIsRegenerating(true);
    const clusterIds = Array.from(selectedClusters);
    
    // Initialize results
    const initialResults: ClusterResult[] = clusterIds.map(id => {
      const cluster = clustersWithHealth.find(c => c.cluster_id === id);
      return {
        clusterId: id,
        theme: cluster?.cluster_theme || id.slice(0, 8),
        success: 0,
        failed: 0,
        status: 'pending' as const,
      };
    });
    setClusterResults(initialResults);

    let totalSuccess = 0;
    let totalFailed = 0;

    for (let i = 0; i < clusterIds.length; i++) {
      const clusterId = clusterIds[i];
      const cluster = clustersWithHealth.find(c => c.cluster_id === clusterId);
      const theme = cluster?.cluster_theme || clusterId.slice(0, 8);

      setProgress({
        currentCluster: theme,
        currentIndex: i + 1,
        total: clusterIds.length,
      });

      // Update status to processing
      setClusterResults(prev => prev.map(r => 
        r.clusterId === clusterId ? { ...r, status: 'processing' as const } : r
      ));

      try {
        const { data, error } = await supabase.functions.invoke('regenerate-cluster-images', {
          body: { clusterId },
        });

        if (error) throw error;

        const success = data?.successCount ?? 0;
        const failed = data?.failedCount ?? 0;
        totalSuccess += success;
        totalFailed += failed;

        setClusterResults(prev => prev.map(r => 
          r.clusterId === clusterId 
            ? { ...r, success, failed, status: 'completed' as const } 
            : r
        ));

        setProgress(prev => prev ? {
          ...prev,
          clusterResult: { success, failed, total: success + failed },
        } : null);

      } catch (err: any) {
        console.error(`Failed to regenerate images for ${clusterId}:`, err);
        setClusterResults(prev => prev.map(r => 
          r.clusterId === clusterId 
            ? { ...r, status: 'failed' as const } 
            : r
        ));
        totalFailed += 1;
      }
    }

    setIsRegenerating(false);
    setProgress(null);
    
    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ["cluster-image-health"] });
    queryClient.invalidateQueries({ queryKey: ["cluster-articles"] });

    toast.success(`Regenerated ${totalSuccess} images across ${clusterIds.length} clusters`, {
      description: totalFailed > 0 ? `${totalFailed} failed` : undefined,
    });

    // Close dialog after short delay
    setTimeout(() => {
      onOpenChange(false);
      setClusterResults([]);
      setSelectedClusters(new Set());
    }, 2000);
  };

  const getHealthBadge = (health: number) => {
    if (health >= 95) {
      return <Badge className="bg-green-100 text-green-700 border-green-300">🖼️ {health}%</Badge>;
    }
    if (health >= 50) {
      return <Badge className="bg-amber-100 text-amber-700 border-amber-300">🖼️ {health}%</Badge>;
    }
    return <Badge className="bg-red-100 text-red-700 border-red-300">🖼️ {health}%</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Bulk Regenerate Images
          </DialogTitle>
          <DialogDescription>
            Select clusters to regenerate their article images using the new AI model.
          </DialogDescription>
        </DialogHeader>

        {!isRegenerating ? (
          <>
            {/* Stats Summary */}
            <div className="flex gap-2 flex-wrap">
              {criticalClusters.length > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {criticalClusters.length} Critical (&lt;20%)
                </Badge>
              )}
              {warningClusters.length > 0 && (
                <Badge variant="outline" className="bg-amber-50 border-amber-300 text-amber-700">
                  {warningClusters.length} Need Attention (&lt;80%)
                </Badge>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAllCritical}
                disabled={criticalClusters.length === 0}
              >
                Select Critical ({criticalClusters.length})
              </Button>
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                Select All ({sortedClusters.length})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
                disabled={selectedClusters.size === 0}
              >
                Clear
              </Button>
            </div>

            {/* Cluster List */}
            <ScrollArea className="flex-1 max-h-[300px] border rounded-md">
              <div className="p-2 space-y-1">
                {sortedClusters.map((cluster) => (
                  <div
                    key={cluster.cluster_id}
                    className={`flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer ${
                      selectedClusters.has(cluster.cluster_id) ? 'bg-muted' : ''
                    }`}
                    onClick={() => toggleCluster(cluster.cluster_id)}
                  >
                    <Checkbox
                      checked={selectedClusters.has(cluster.cluster_id)}
                      onCheckedChange={() => toggleCluster(cluster.cluster_id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-sm">
                        {cluster.cluster_theme || cluster.cluster_id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(cluster.created_at).toLocaleDateString()}
                        {cluster.unique_images !== undefined && cluster.total_images !== undefined && (
                          <span className="ml-2">
                            ({cluster.unique_images}/{cluster.total_images} unique)
                          </span>
                        )}
                      </p>
                    </div>
                    {getHealthBadge(cluster.image_health ?? 100)}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Selection Summary */}
            <div className="text-sm text-muted-foreground">
              Selected: <strong>{selectedClusters.size}</strong> clusters
              {selectedClusters.size > 0 && (
                <span className="ml-2">• Estimated time: ~{estimatedTime} minutes</span>
              )}
            </div>
          </>
        ) : (
          /* Progress View */
          <div className="space-y-4 py-4">
            <div className="text-center">
              <p className="text-lg font-medium">
                Regenerating Images... ({progress?.currentIndex}/{progress?.total})
              </p>
              <p className="text-muted-foreground">
                Current: {progress?.currentCluster}
              </p>
            </div>

            <Progress 
              value={progress ? (progress.currentIndex / progress.total) * 100 : 0} 
              className="h-2"
            />

            {/* Cluster Results */}
            <ScrollArea className="max-h-[200px] border rounded-md">
              <div className="p-2 space-y-1">
                {clusterResults.map((result) => (
                  <div
                    key={result.clusterId}
                    className="flex items-center gap-3 p-2 text-sm"
                  >
                    {result.status === 'pending' && (
                      <span className="text-muted-foreground">⏳</span>
                    )}
                    {result.status === 'processing' && (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    )}
                    {result.status === 'completed' && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                    {result.status === 'failed' && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="flex-1 truncate">{result.theme}</span>
                    {result.status === 'completed' && (
                      <span className="text-xs text-muted-foreground">
                        {result.success} ✓ {result.failed > 0 && `${result.failed} ✗`}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        <DialogFooter>
          {!isRegenerating ? (
            <>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleRegenerate}
                disabled={selectedClusters.size === 0}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Regenerate {selectedClusters.size > 0 ? `(${selectedClusters.size})` : ''}
              </Button>
            </>
          ) : (
            <Button variant="ghost" disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
