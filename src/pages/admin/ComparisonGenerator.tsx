import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Scale, Trash2, Eye, CheckCircle, Zap, Link as LinkIcon, Quote, Globe, Languages, RefreshCcw, AlertTriangle, Check, ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
];

type LanguageCode = 'en' | 'es';

const SUGGESTED_COMPARISONS = [
  { a: 'Term Life', b: 'Whole Life', context: 'Which Life Insurance Is Right for You?' },
  { a: 'IUL', b: 'Traditional 401(k)', context: 'Best Retirement Savings Vehicle?' },
  { a: 'Fixed Annuity', b: 'Variable Annuity', context: 'Which Annuity Fits Your Goals?' },
  { a: 'ROP Term', b: 'Standard Term', context: 'Is Return of Premium Worth It?' },
  { a: 'Universal Life', b: 'Indexed Universal Life', context: 'Which UL Policy Should You Choose?' },
  { a: 'Roth IRA', b: 'Traditional IRA', context: 'Best Tax Strategy for Retirement?' },
  { a: 'Whole Life', b: 'IUL', context: 'Cash Value Accumulation Comparison' },
  { a: 'Fixed Index Annuity', b: 'RILA', context: 'Protected Growth Options Compared' },
];

// Phase 3 MOFU Comparisons with AI-query friendly titles
const PHASE3_MOFU_COMPARISONS = [
  {
    optionA: 'Term Life',
    optionB: 'Whole Life Insurance',
    aiHeadline: 'Term Life vs Whole Life Insurance: Which Policy Is Right for You in 2025?',
    targetAudience: 'individuals and families evaluating life insurance options for financial protection',
    niche: 'wealth-management',
    relatedKeywords: ['life insurance comparison', 'cash value', 'death benefit', 'premium costs'],
    description: 'Comprehensive guide comparing term life and whole life insurance policies',
  },
  {
    optionA: 'IUL',
    optionB: '401(k) for Retirement',
    aiHeadline: 'IUL vs 401(k): Which Retirement Strategy Builds More Wealth?',
    targetAudience: 'professionals planning for retirement seeking tax-efficient growth strategies',
    niche: 'wealth-management',
    relatedKeywords: ['indexed universal life', 'tax-free retirement', 'market-linked growth', 'employer match'],
    description: 'Retirement vehicle comparison for tax-efficient wealth accumulation',
  },
  {
    optionA: 'Fixed Annuity',
    optionB: 'Variable Annuity',
    aiHeadline: 'Fixed Annuity vs Variable Annuity: Which Provides Better Retirement Income?',
    targetAudience: 'pre-retirees and retirees comparing guaranteed vs market-linked income options',
    niche: 'wealth-management',
    relatedKeywords: ['guaranteed income', 'annuity rates', 'market risk', 'retirement income planning'],
    description: 'Annuity comparison for retirement income planning',
  },
];

export default function ComparisonGenerator() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [niche, setNiche] = useState('wealth-management');
  const [targetAudience, setTargetAudience] = useState('individuals planning for retirement and financial protection');
  const [suggestedHeadline, setSuggestedHeadline] = useState('');
  const [generatedComparison, setGeneratedComparison] = useState<any>(null);
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0, status: '' });
  const [translatingId, setTranslatingId] = useState<string | null>(null);
  const [translatingLang, setTranslatingLang] = useState<string | null>(null);
  
  // Image generation state
  const [imageGenerating, setImageGenerating] = useState(false);
  
  // Backfill state for "Add All Missing" button
  const [backfillingTopic, setBackfillingTopic] = useState<string | null>(null);

  // Fetch existing comparisons
  const { data: comparisons, isLoading: loadingComparisons } = useQuery({
    queryKey: ['admin-comparisons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comparison_pages')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Check which Phase 3 comparisons are missing
  const missingPhase3 = PHASE3_MOFU_COMPARISONS.filter(mofu => {
    const exists = comparisons?.some(c => 
      (c.option_a.toLowerCase().includes(mofu.optionA.toLowerCase().split(' ')[0]) &&
       c.option_b.toLowerCase().includes(mofu.optionB.toLowerCase().split(' ')[0])) ||
      (c.option_a.toLowerCase().includes(mofu.optionB.toLowerCase().split(' ')[0]) &&
       c.option_b.toLowerCase().includes(mofu.optionA.toLowerCase().split(' ')[0]))
    );
    return !exists;
  });

  // Helper to generate AI image and upload to storage
  const generateAndUploadImage = async (savedRecord: any) => {
    try {
      setImageGenerating(true);
      
      // Call generate-image edge function with headline
      const { data: imageData, error: imageError } = await supabase.functions.invoke('generate-image', {
        body: { headline: savedRecord.headline }
      });
      
      if (imageError || !imageData?.images?.[0]?.url) {
        console.error('Image generation failed:', imageError || 'No image returned');
        return;
      }
      
      const tempImageUrl = imageData.images[0].url;
      
      // Download and re-upload to article-images bucket for permanence
      const imageResponse = await fetch(tempImageUrl);
      const imageBlob = await imageResponse.blob();
      const fileName = `comparison-${savedRecord.id}-${Date.now()}.png`;
      
      const { error: uploadError } = await supabase.storage
        .from('article-images')
        .upload(fileName, imageBlob, { contentType: 'image/png', upsert: true });
      
      if (uploadError) {
        console.error('Image upload failed:', uploadError);
        return;
      }
      
      const { data: publicUrlData } = supabase.storage
        .from('article-images')
        .getPublicUrl(fileName);
      
      const permanentUrl = publicUrlData.publicUrl;
      const altText = `${savedRecord.option_a} vs ${savedRecord.option_b} - ${savedRecord.headline}`;
      const caption = `${savedRecord.headline} - Everence Wealth`;
      
      // Update comparison record with image data
      await supabase
        .from('comparison_pages')
        .update({
          featured_image_url: permanentUrl,
          featured_image_alt: altText,
          featured_image_caption: caption,
        })
        .eq('id', savedRecord.id);
      
      toast({ title: "Image generated", description: "AI featured image added to comparison." });
    } catch (err) {
      console.error('Image generation pipeline error:', err);
    } finally {
      setImageGenerating(false);
    }
  };

  // Generate English-only comparison + AI image
  const generateMutation = useMutation({
    mutationFn: async (params: { optionA: string; optionB: string; targetAudience: string; niche: string; suggestedHeadline?: string }) => {
      // Generate English comparison
      const { data, error } = await supabase.functions.invoke('generate-comparison', {
        body: { 
          option_a: params.optionA, 
          option_b: params.optionB, 
          niche: params.niche, 
          target_audience: params.targetAudience, 
          suggested_headline: params.suggestedHeadline,
          language: 'en',
          include_internal_links: true,
          include_citations: true,
        }
      });
      
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      const comparison = data.comparison;

      // Ensure unique slug before saving
      let uniqueSlug = comparison.slug;
      if (uniqueSlug) {
        const { data: existingSlugs } = await supabase
          .from('comparison_pages')
          .select('slug')
          .like('slug', `${uniqueSlug}%`);
        if (existingSlugs && existingSlugs.length > 0) {
          const existingSet = new Set(existingSlugs.map(r => r.slug));
          if (existingSet.has(uniqueSlug)) {
            let suffix = 2;
            while (existingSet.has(`${uniqueSlug}-${suffix}`)) suffix++;
            uniqueSlug = `${uniqueSlug}-${suffix}`;
          }
        }
      }

      // Save and get record with id
      const { data: savedRecord, error: saveError } = await supabase
        .from('comparison_pages')
        .insert({
          ...comparison,
          slug: uniqueSlug,
          status: 'draft',
          date_modified: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (saveError) throw saveError;

      // Generate AI image in background (non-blocking for UX)
      if (savedRecord) {
        generateAndUploadImage(savedRecord);
      }

      return savedRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comparisons'] });
      toast({ 
        title: "Comparison generated!",
        description: 'English comparison saved as draft. AI image generating...',
      });
      setOptionA('');
      setOptionB('');
      setSuggestedHeadline('');
    },
    onError: (error: Error) => {
      toast({ title: "Generation failed", description: error.message, variant: "destructive" });
    },
  });

  // Save comparison (single)
  const saveMutation = useMutation({
    mutationFn: async (status: 'draft' | 'published') => {
      if (!generatedComparison) throw new Error('No comparison to save');
      
      const { error } = await supabase
        .from('comparison_pages')
        .insert({
          ...generatedComparison,
          status,
          date_published: status === 'published' ? new Date().toISOString() : null,
          date_modified: new Date().toISOString(),
        });
      
      if (error) throw error;
    },
    onSuccess: (_, status) => {
      toast({ title: "Saved!", description: `Comparison ${status === 'published' ? 'published' : 'saved as draft'}.` });
      setGeneratedComparison(null);
      setOptionA('');
      setOptionB('');
      queryClient.invalidateQueries({ queryKey: ['admin-comparisons'] });
    },
    onError: (error: Error) => {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    },
  });

  // Delete comparison
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('comparison_pages').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Deleted" });
      queryClient.invalidateQueries({ queryKey: ['admin-comparisons'] });
    },
  });

  // Toggle publish status
  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, currentStatus }: { id: string; currentStatus: string }) => {
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      const { error } = await supabase
        .from('comparison_pages')
        .update({ 
          status: newStatus,
          date_published: newStatus === 'published' ? new Date().toISOString() : null,
          date_modified: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comparisons'] });
    },
  });

  // Translate comparison to another language
  const translateMutation = useMutation({
    mutationFn: async ({ comparisonId, targetLanguage }: { comparisonId: string; targetLanguage: string }) => {
      setTranslatingId(comparisonId);
      setTranslatingLang(targetLanguage);
      
      const { data, error } = await supabase.functions.invoke('translate-comparison', {
        body: { comparison_id: comparisonId, target_language: targetLanguage }
      });
      
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      toast({ 
        title: "Translation created!", 
        description: `Created ${LANGUAGES.find(l => l.code === data.language)?.name} version: ${data.slug}` 
      });
      queryClient.invalidateQueries({ queryKey: ['admin-comparisons'] });
      setTranslatingId(null);
      setTranslatingLang(null);
    },
    onError: (error: Error) => {
      toast({ title: "Translation failed", description: error.message, variant: "destructive" });
      setTranslatingId(null);
      setTranslatingLang(null);
    },
  });

  // Backfill all missing languages for a comparison topic
  const backfillMissingLanguagesMutation = useMutation({
    mutationFn: async ({ topic, englishId }: { topic: string; englishId: string }) => {
      setBackfillingTopic(topic);
      
      const existingLangs = getExistingLanguages(topic);
      const missingLangs = LANGUAGES.filter(l => !existingLangs.includes(l.code)).map(l => l.code);
      
      const results: { success: string[]; errors: { lang: string; error: string }[] } = {
        success: [],
        errors: [],
      };
      
      for (const lang of missingLangs) {
        try {
          const { data, error } = await supabase.functions.invoke('translate-comparison', {
            body: { comparison_id: englishId, target_language: lang }
          });
          
          if (error) throw error;
          if (data.error) throw new Error(data.error);
          
          results.success.push(lang);
        } catch (err: any) {
          results.errors.push({ lang, error: err.message });
        }
      }
      
      return results;
    },
    onSuccess: (results, variables) => {
      setBackfillingTopic(null);
      queryClient.invalidateQueries({ queryKey: ['admin-comparisons'] });
      
      toast({
        title: `Added ${results.success.length} translations`,
        description: results.errors.length > 0 
          ? `${results.errors.length} failed: ${results.errors.map(e => e.lang.toUpperCase()).join(', ')}`
          : 'All missing languages added.',
        variant: results.errors.length > 0 ? 'destructive' : 'default',
      });
    },
    onError: (error: Error) => {
      setBackfillingTopic(null);
      toast({ title: "Backfill failed", description: error.message, variant: "destructive" });
    },
  });

  // Group comparisons by topic for showing language coverage
  const getComparisonsByTopic = () => {
    if (!comparisons) return {};
    const grouped: Record<string, typeof comparisons> = {};
    for (const c of comparisons) {
      const topic = c.comparison_topic;
      if (!grouped[topic]) grouped[topic] = [];
      grouped[topic].push(c);
    }
    return grouped;
  };

  const getExistingLanguages = (topic: string): string[] => {
    const grouped = getComparisonsByTopic();
    return grouped[topic]?.map(c => c.language) || [];
  };

  const getEnglishComparison = (topic: string) => {
    const grouped = getComparisonsByTopic();
    return grouped[topic]?.find(c => c.language === 'en');
  };

  // Bulk generate all missing Phase 3 comparisons
  const handleBulkGenerate = async () => {
    if (missingPhase3.length === 0) {
      toast({ title: "All Phase 3 pages exist", description: "No new comparisons to generate." });
      return;
    }

    setBulkGenerating(true);
    setBulkProgress({ current: 0, total: missingPhase3.length, status: 'Starting...' });

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < missingPhase3.length; i++) {
      const mofu = missingPhase3[i];
      setBulkProgress({ 
        current: i + 1, 
        total: missingPhase3.length, 
        status: `Generating: ${mofu.optionA} vs ${mofu.optionB}` 
      });

      try {
        const { data, error } = await supabase.functions.invoke('generate-comparison', {
          body: { 
            option_a: mofu.optionA, 
            option_b: mofu.optionB, 
            niche: mofu.niche, 
            target_audience: mofu.targetAudience, 
            suggested_headline: mofu.aiHeadline,
            language: 'en',
            include_internal_links: true,
            include_citations: true,
          }
        });

        if (error || data.error) throw error || new Error(data.error);

        // Save as draft
        const { error: saveError } = await supabase
          .from('comparison_pages')
          .insert({
            ...data.comparison,
            status: 'draft',
            date_modified: new Date().toISOString(),
          });

        if (saveError) throw saveError;
        successCount++;
      } catch (err) {
        console.error(`Failed to generate ${mofu.optionA} vs ${mofu.optionB}:`, err);
        errorCount++;
      }
    }

    setBulkGenerating(false);
    setBulkProgress({ current: 0, total: 0, status: '' });
    queryClient.invalidateQueries({ queryKey: ['admin-comparisons'] });

    toast({ 
      title: "Bulk generation complete", 
      description: `Generated ${successCount} comparisons. ${errorCount > 0 ? `${errorCount} failed.` : ''}`,
      variant: errorCount > 0 ? 'destructive' : 'default',
    });
  };

  const handleSuggestionClick = (suggestion: { a: string; b: string }) => {
    setOptionA(suggestion.a);
    setOptionB(suggestion.b);
  };

  // Calculate overall language coverage stats
  const languageCoverageStats = () => {
    const grouped = getComparisonsByTopic();
    const topics = Object.keys(grouped);
    const totalPossible = topics.length * LANGUAGES.length;
    const totalExisting = comparisons?.length || 0;
    const incompleteTopics = topics.filter(t => grouped[t].length < LANGUAGES.length).length;
    
    return { totalPossible, totalExisting, incompleteTopics, totalTopics: topics.length };
  };

  const stats = languageCoverageStats();

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Scale className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Comparison Generator</h1>
            <p className="text-muted-foreground">Create AI-citation optimized comparison pages (English first, then translate)</p>
          </div>
        </div>

        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList>
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Create Comparison
            </TabsTrigger>
            <TabsTrigger value="phase3" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Phase 3 MOFU
            </TabsTrigger>
            <TabsTrigger value="manage">
              <Languages className="h-4 w-4 mr-1" />
              Manage ({comparisons?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* English-Only Generation Tab */}
          <TabsContent value="generate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Create English Comparison
                </CardTitle>
                <CardDescription>Generate an English comparison page with AI image. Translate via the Manage tab.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Option A</Label>
                    <Input
                      value={optionA}
                      onChange={(e) => setOptionA(e.target.value)}
                      placeholder="e.g., Term Life Insurance"
                      disabled={generateMutation.isPending}
                    />
                  </div>
                  <div>
                    <Label>Option B</Label>
                    <Input
                      value={optionB}
                      onChange={(e) => setOptionB(e.target.value)}
                      placeholder="e.g., Whole Life Insurance"
                      disabled={generateMutation.isPending}
                    />
                  </div>
                </div>

                <div>
                  <Label>Target Audience</Label>
                  <Textarea
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g., individuals planning for retirement"
                    rows={2}
                    disabled={generateMutation.isPending}
                  />
                </div>

                <div>
                  <Label>Suggested Headline (Optional)</Label>
                  <Input
                    value={suggestedHeadline}
                    onChange={(e) => setSuggestedHeadline(e.target.value)}
                    placeholder="e.g., Term Life vs Whole Life: Which Policy Is Right for You?"
                    disabled={generateMutation.isPending}
                  />
                </div>

                <div>
                  <Label>Niche</Label>
                  <Input
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="e.g., wealth-management"
                    disabled={generateMutation.isPending}
                  />
                </div>

                {/* Suggestions */}
                <div className="pt-2">
                  <Label className="text-xs text-muted-foreground">Quick suggestions:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {SUGGESTED_COMPARISONS.slice(0, 4).map((s, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => handleSuggestionClick(s)}
                      >
                        {s.a} vs {s.b}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => generateMutation.mutate({ 
                    optionA, 
                    optionB, 
                    targetAudience, 
                    niche,
                    suggestedHeadline: suggestedHeadline || undefined,
                  })}
                  disabled={!optionA || !optionB || generateMutation.isPending}
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating English Comparison...
                    </>
                  ) : (
                    <>
                      <Globe className="h-4 w-4 mr-2" />
                      Generate English Comparison
                    </>
                  )}
                </Button>

                {imageGenerating && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
                    <ImageIcon className="h-4 w-4 animate-pulse text-primary" />
                    Generating AI featured image...
                  </div>
                )}

                <p className="text-xs text-muted-foreground text-center">
                  Comparison saved as draft. Use Manage tab to translate to Spanish and publish.
                </p>
              </CardContent>
            </Card>

            {/* Generated Preview (for single generation) */}
            {generatedComparison && (
              <Card className="border-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Generated Comparison</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => saveMutation.mutate('draft')}
                        disabled={saveMutation.isPending}
                      >
                        Save as Draft
                      </Button>
                      <Button
                        onClick={() => saveMutation.mutate('published')}
                        disabled={saveMutation.isPending}
                      >
                        {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Publish'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Headline</Label>
                    <p className="font-semibold">{generatedComparison.headline}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Speakable Answer</Label>
                    <p className="text-sm bg-primary/5 p-3 rounded-lg">{generatedComparison.speakable_answer}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Phase 3 MOFU Bulk Generation */}
          <TabsContent value="phase3" className="space-y-6">
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      Phase 3: MOFU Expansion
                    </CardTitle>
                    <CardDescription>
                      Generate missing comparison pages with automatic internal linking to BOFU content
                    </CardDescription>
                  </div>
                  <Badge variant={missingPhase3.length === 0 ? "default" : "secondary"}>
                    {missingPhase3.length === 0 ? 'All Complete' : `${missingPhase3.length} Missing`}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Phase 3 Comparison Cards */}
                <div className="grid gap-4">
                  {PHASE3_MOFU_COMPARISONS.map((mofu, i) => {
                    const exists = !missingPhase3.includes(mofu);
                    return (
                      <div key={i} className={`p-4 rounded-lg border ${exists ? 'bg-green-50 border-green-200' : 'bg-background border-border'}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold flex items-center gap-2">
                              {mofu.aiHeadline || `${mofu.optionA} vs ${mofu.optionB}`}
                              {exists && <CheckCircle className="h-4 w-4 text-green-600" />}
                            </h3>
                            <p className="text-sm text-muted-foreground">{mofu.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <LinkIcon className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Links to: {mofu.relatedKeywords.join(', ')}</span>
                            </div>
                          </div>
                          {!exists && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setOptionA(mofu.optionA);
                                setOptionB(mofu.optionB);
                                setTargetAudience(mofu.targetAudience);
                                setNiche(mofu.niche);
                                generateMutation.mutate({ 
                                  optionA: mofu.optionA, 
                                  optionB: mofu.optionB, 
                                  targetAudience: mofu.targetAudience, 
                                  niche: mofu.niche,
                                  suggestedHeadline: mofu.aiHeadline,
                                });
                              }}
                              disabled={generateMutation.isPending}
                            >
                              Generate
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bulk Generate Button */}
                {missingPhase3.length > 0 && (
                  <div className="pt-4 border-t">
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleBulkGenerate}
                      disabled={bulkGenerating}
                    >
                      {bulkGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {bulkProgress.status} ({bulkProgress.current}/{bulkProgress.total})
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Generate All {missingPhase3.length} Missing Comparisons
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Comparisons will be saved as drafts for review before publishing
                    </p>
                  </div>
                )}

                {/* Features */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="flex items-start gap-2">
                    <LinkIcon className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Internal Linking</p>
                      <p className="text-xs text-muted-foreground">Auto-links to BOFU articles (Golden Visa, Costs, NIE)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Quote className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">External Citations</p>
                      <p className="text-xs text-muted-foreground">Sources from approved domains only</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Tab with Enhanced Language Coverage */}
          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Languages className="h-5 w-5" />
                      All Comparisons by Topic
                    </CardTitle>
                    <CardDescription>
                      Language coverage matrix. Click language badges to translate, or use "Add Missing" to complete all.
                    </CardDescription>
                  </div>
                  
                  {/* Overall Stats */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{stats.totalTopics}</p>
                      <p className="text-xs text-muted-foreground">Topics</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{stats.totalExisting}</p>
                      <p className="text-xs text-muted-foreground">Pages</p>
                    </div>
                    {stats.incompleteTopics > 0 && (
                      <div className="text-center">
                        <p className="text-2xl font-bold text-amber-600">{stats.incompleteTopics}</p>
                        <p className="text-xs text-muted-foreground">Incomplete</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingComparisons ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : comparisons?.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No comparisons yet</p>
                ) : (
                  <div className="space-y-4">
                    {/* Group by comparison_topic and show language matrix */}
                    {Object.entries(getComparisonsByTopic()).map(([topic, topicComparisons]) => {
                      const englishVersion = topicComparisons.find(c => c.language === 'en');
                      const existingLangs = topicComparisons.map(c => c.language);
                      const missingLangs = LANGUAGES.filter(l => !existingLangs.includes(l.code));
                      const completionPercent = (existingLangs.length / LANGUAGES.length) * 100;
                      const isBackfilling = backfillingTopic === topic;
                      
                      return (
                        <Card key={topic} className="border">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-base flex items-center gap-2">
                                  {topic}
                                  {completionPercent === 100 && (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  )}
                                </CardTitle>
                                <div className="flex items-center gap-3 mt-2">
                                  <Progress value={completionPercent} className="h-2 w-32" />
                                  <span className="text-xs text-muted-foreground">
                                    {existingLangs.length} / {LANGUAGES.length} languages
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {topicComparisons.every(c => c.status === 'published') ? (
                                  <Badge variant="default" className="text-xs">All Published</Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-xs">
                                    {topicComparisons.filter(c => c.status === 'published').length} Published
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            {/* Language Matrix - Visual overview */}
                            <div className="flex flex-wrap gap-1.5 mb-4 p-3 bg-muted/30 rounded-lg">
                              {LANGUAGES.map(lang => {
                                const exists = existingLangs.includes(lang.code);
                                const comparison = topicComparisons.find(c => c.language === lang.code);
                                const isPublished = comparison?.status === 'published';
                                
                                return (
                                  <TooltipProvider key={lang.code}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div 
                                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm cursor-pointer transition-all
                                            ${exists 
                                              ? isPublished 
                                                ? 'bg-green-100 text-green-700 border border-green-300' 
                                                : 'bg-amber-100 text-amber-700 border border-amber-300'
                                              : 'bg-muted text-muted-foreground border border-dashed border-border hover:bg-primary/10 hover:border-primary'
                                            }`}
                                          onClick={() => {
                                            if (exists && comparison) {
                                              window.open(`/${lang.code}/compare/${comparison.slug}`, '_blank');
                                            } else if (englishVersion) {
                                              translateMutation.mutate({ 
                                                comparisonId: englishVersion.id, 
                                                targetLanguage: lang.code 
                                              });
                                            }
                                          }}
                                        >
                                          {exists ? (
                                            isPublished ? '✓' : '○'
                                          ) : (
                                            translatingLang === lang.code && translatingId === englishVersion?.id
                                              ? <Loader2 className="h-3 w-3 animate-spin" />
                                              : '+'
                                          )}
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="font-medium">{lang.flag} {lang.name}</p>
                                        <p className="text-xs">
                                          {exists 
                                            ? isPublished ? 'Published - click to view' : 'Draft - click to view'
                                            : englishVersion ? 'Click to translate' : 'Need English first'
                                          }
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                );
                              })}
                            </div>

                            {/* Add Missing Languages Button */}
                            {englishVersion && missingLangs.length > 0 && (
                              <div className="flex items-center gap-2 mb-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => backfillMissingLanguagesMutation.mutate({ 
                                    topic, 
                                    englishId: englishVersion.id 
                                  })}
                                  disabled={isBackfilling || translateMutation.isPending}
                                >
                                  {isBackfilling ? (
                                    <>
                                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                      Adding...
                                    </>
                                  ) : (
                                    <>
                                      <RefreshCcw className="h-3 w-3 mr-1" />
                                      Add Missing {missingLangs.length} Languages
                                    </>
                                  )}
                                </Button>
                                <span className="text-xs text-muted-foreground">
                                  {missingLangs.map(l => l.flag).join(' ')}
                                </span>
                              </div>
                            )}

                            {!englishVersion && (
                              <p className="text-xs text-amber-600 mb-3 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                No English version - create English first to enable translations
                              </p>
                            )}

                            {/* Actions Table for each version */}
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-[60px]">Lang</TableHead>
                                  <TableHead>Slug</TableHead>
                                  <TableHead className="w-[80px]">Status</TableHead>
                                  <TableHead className="text-right w-[120px]">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {topicComparisons.map((c) => (
                                  <TableRow key={c.id}>
                                    <TableCell>
                                      <Badge variant="outline" className="uppercase text-xs">
                                        {LANGUAGES.find(l => l.code === c.language)?.flag} {c.language}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground font-mono">
                                      {c.slug}
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant={c.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                                        {c.status}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                                          <Link to={`/${c.language}/compare/${c.slug}`} target="_blank">
                                            <Eye className="h-3.5 w-3.5" />
                                          </Link>
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7"
                                          onClick={() => togglePublishMutation.mutate({ id: c.id, currentStatus: c.status })}
                                        >
                                          <CheckCircle className={`h-3.5 w-3.5 ${c.status === 'published' ? 'text-green-500' : ''}`} />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7"
                                          onClick={() => {
                                            if (confirm('Delete this comparison?')) {
                                              deleteMutation.mutate(c.id);
                                            }
                                          }}
                                        >
                                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
