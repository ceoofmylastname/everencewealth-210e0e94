import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ImageIcon, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2,
  MapPin,
  ArrowLeft,
  RefreshCw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface LocationPageWithoutImage {
  id: string;
  city_name: string;
  city_slug: string;
  topic_slug: string;
  headline: string;
  language: string;
  intent_type: string | null;
}

type GenerationStatus = 'pending' | 'generating' | 'success' | 'error';

interface GenerationState {
  status: GenerationStatus;
  error?: string;
  imageUrl?: string;
}

const BatchLocationImageGeneration = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStates, setGenerationStates] = useState<Record<string, GenerationState>>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: pagesWithoutImages, isLoading, refetch } = useQuery({
    queryKey: ["location-pages-without-images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("location_pages")
        .select("id, city_name, city_slug, topic_slug, headline, language, intent_type")
        .is("featured_image_url", null)
        .order("city_name", { ascending: true });
      
      if (error) throw error;
      return (data || []) as LocationPageWithoutImage[];
    },
  });

  const generateImageForPage = async (page: LocationPageWithoutImage): Promise<boolean> => {
    try {
      setGenerationStates(prev => ({
        ...prev,
        [page.id]: { status: 'generating' }
      }));

      const { data, error } = await supabase.functions.invoke('generate-location-image', {
        body: {
          location_page_id: page.id,
          city_name: page.city_name,
          city_slug: page.city_slug,
          topic_slug: page.topic_slug,
          intent_type: page.intent_type,
        }
      });

      if (error) throw error;

      if (data?.success && data?.image?.url) {
        setGenerationStates(prev => ({
          ...prev,
          [page.id]: { status: 'success', imageUrl: data.image.url }
        }));
        return true;
      } else {
        throw new Error(data?.error || 'Unknown error');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Generation failed';
      setGenerationStates(prev => ({
        ...prev,
        [page.id]: { status: 'error', error: errorMessage }
      }));
      return false;
    }
  };

  const handleGenerateAll = async () => {
    if (!pagesWithoutImages || pagesWithoutImages.length === 0) return;

    setIsGenerating(true);
    setCurrentIndex(0);
    
    // Initialize all as pending
    const initialStates: Record<string, GenerationState> = {};
    pagesWithoutImages.forEach(page => {
      initialStates[page.id] = { status: 'pending' };
    });
    setGenerationStates(initialStates);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < pagesWithoutImages.length; i++) {
      setCurrentIndex(i);
      const page = pagesWithoutImages[i];
      
      const success = await generateImageForPage(page);
      if (success) {
        successCount++;
      } else {
        errorCount++;
      }

      // Delay between generations to avoid rate limiting
      if (i < pagesWithoutImages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    setIsGenerating(false);
    
    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ["location-pages"] });
    queryClient.invalidateQueries({ queryKey: ["location-pages-without-images"] });

    if (errorCount === 0) {
      toast.success(`Successfully generated ${successCount} images!`);
    } else {
      toast.warning(`Generated ${successCount} images, ${errorCount} failed`);
    }
  };

  const handleRetryFailed = async () => {
    if (!pagesWithoutImages) return;

    const failedPages = pagesWithoutImages.filter(
      page => generationStates[page.id]?.status === 'error'
    );

    if (failedPages.length === 0) {
      toast.info("No failed generations to retry");
      return;
    }

    setIsGenerating(true);

    for (const page of failedPages) {
      await generateImageForPage(page);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    setIsGenerating(false);
    queryClient.invalidateQueries({ queryKey: ["location-pages"] });
    queryClient.invalidateQueries({ queryKey: ["location-pages-without-images"] });
  };

  const getStatusIcon = (status: GenerationStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'generating':
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusBadge = (status: GenerationStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'generating':
        return <Badge className="bg-blue-500">Generating...</Badge>;
      case 'success':
        return <Badge className="bg-green-500">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Failed</Badge>;
    }
  };

  const completedCount = Object.values(generationStates).filter(
    s => s.status === 'success' || s.status === 'error'
  ).length;
  const successCount = Object.values(generationStates).filter(s => s.status === 'success').length;
  const errorCount = Object.values(generationStates).filter(s => s.status === 'error').length;
  const totalCount = pagesWithoutImages?.length || 0;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/location-pages')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <ImageIcon className="h-8 w-8" />
                Generate Location Images
              </h1>
              <p className="text-muted-foreground">
                Generate featured images for location pages missing them
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()} disabled={isGenerating}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            {errorCount > 0 && !isGenerating && (
              <Button variant="outline" onClick={handleRetryFailed}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry Failed ({errorCount})
              </Button>
            )}
            <Button 
              onClick={handleGenerateAll} 
              disabled={isGenerating || !pagesWithoutImages || pagesWithoutImages.length === 0}
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating ({currentIndex + 1}/{totalCount})
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  Generate All ({totalCount})
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Progress Card */}
        {isGenerating && (
          <Card className="border-primary/50">
            <CardContent className="py-6">
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Progress: {completedCount} of {totalCount}</span>
                  <span className="text-muted-foreground">
                    {successCount} successful, {errorCount} failed
                  </span>
                </div>
                <Progress value={progress} className="h-3" />
                <p className="text-sm text-muted-foreground text-center">
                  Estimated time remaining: ~{Math.ceil((totalCount - completedCount) * 7 / 60)} minutes
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Pages Without Images
            </CardTitle>
            <CardDescription>
              {isLoading ? 'Loading...' : `${totalCount} location pages need featured images`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : pagesWithoutImages && pagesWithoutImages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-medium">All Done!</h3>
                <p>All location pages have featured images.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {pagesWithoutImages?.map((page, index) => {
                  const state = generationStates[page.id];
                  const isCurrentlyGenerating = isGenerating && currentIndex === index && state?.status === 'generating';
                  
                  return (
                    <div 
                      key={page.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        isCurrentlyGenerating ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {state ? getStatusIcon(state.status) : <Clock className="h-4 w-4 text-muted-foreground" />}
                        <div>
                          <p className="font-medium text-sm">{page.city_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {page.topic_slug} • {page.language.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {state?.error && (
                          <span className="text-xs text-destructive max-w-[200px] truncate">
                            {state.error}
                          </span>
                        )}
                        {state ? getStatusBadge(state.status) : <Badge variant="outline">Waiting</Badge>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default BatchLocationImageGeneration;
