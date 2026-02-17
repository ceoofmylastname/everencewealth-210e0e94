import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MapPin, Sparkles, Loader2, Eye, Trash2, CheckCircle, Globe,
  Plus, Search, AlertCircle, Languages,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// US States list
const US_STATES = [
  { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" }, { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" }, { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" }, { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" }, { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" }, { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" }, { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" }, { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" }, { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" }, { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" }, { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" }, { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" }, { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" }, { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" }, { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" }, { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" }, { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" }, { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" }, { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" }, { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" }, { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" }, { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" }, { code: "WY", name: "Wyoming" },
];

const INTENT_OPTIONS = [
  { value: "retirement-planning", label: "Retirement Planning" },
  { value: "tax-advantages", label: "Tax Advantages" },
  { value: "estate-planning", label: "Estate Planning" },
  { value: "wealth-protection", label: "Wealth Protection" },
  { value: "insurance-guide", label: "Insurance Guide" },
];

interface LocationPage {
  id: string;
  city_slug: string;
  city_name: string;
  topic_slug: string;
  headline: string;
  meta_title: string;
  state_code: string | null;
  status: string;
  language: string;
  created_at: string;
  updated_at: string;
  featured_image_url: string | null;
}

const AdminStatePages = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("generate");

  // --- Generator State ---
  const [selectedState, setSelectedState] = useState("");
  const [intentType, setIntentType] = useState("retirement-planning");
  const [batchMode, setBatchMode] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0, status: "" });
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // --- List State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [pageToDelete, setPageToDelete] = useState<string | null>(null);

  // Fetch existing state pages
  const { data: statePages, isLoading } = useQuery({
    queryKey: ["admin-state-pages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("location_pages")
        .select("id, city_slug, city_name, topic_slug, headline, meta_title, state_code, status, language, created_at, updated_at, featured_image_url")
        .not("state_code", "is", null)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data || []) as LocationPage[];
    },
  });

  // Get unique state codes from existing pages
  const existingStates = [...new Set(statePages?.map(p => p.state_code).filter(Boolean) || [])];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("location_pages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-state-pages"] });
      toast.success("State page deleted");
      setPageToDelete(null);
    },
    onError: (e) => toast.error(`Delete failed: ${e.message}`),
  });

  // Bulk publish
  const publishMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from("location_pages")
        .update({ status: "published", date_published: now, date_modified: now })
        .in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-state-pages"] });
      toast.success("Pages published");
    },
    onError: (e) => toast.error(`Publish failed: ${e.message}`),
  });

  // Cleanup polling
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // Poll job status
  const pollJob = useCallback(async (jobId: string, hreflangGroupId: string, total: number) => {
    try {
      const { data: job, error } = await supabase
        .from("generation_jobs")
        .select("*")
        .eq("id", jobId)
        .single();
      if (error || !job) return;

      const completed = (job as any).completed_languages?.length || 0;
      setGenerationProgress({
        current: completed,
        total,
        status: job.status === "completed" ? "Complete!" : job.status === "failed" ? "Failed" : `Generating ${completed}/${total}...`,
      });

      if (job.status === "completed" || job.status === "failed") {
        if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
        setIsGenerating(false);
        setCurrentJobId(null);
        queryClient.invalidateQueries({ queryKey: ["admin-state-pages"] });
        if (job.status === "completed") {
          toast.success("State page(s) generated successfully!");
          setActiveTab("manage");
        } else {
          toast.error((job as any).error_message || "Generation failed");
        }
      }
    } catch (err) {
      console.error("Poll error:", err);
    }
  }, [queryClient]);

  const handleGenerate = async () => {
    if (!selectedState) { toast.error("Please select a state"); return; }

    const state = US_STATES.find(s => s.code === selectedState);
    if (!state) return;

    // Check if state already has pages for this intent
    const existing = statePages?.find(
      p => p.state_code === selectedState && p.topic_slug.includes(intentType)
    );
    if (existing) {
      toast.warning(`${state.name} already has a "${intentType}" page. Consider editing the existing one.`);
    }

    setIsGenerating(true);
    setGenerationProgress({ current: 0, total: batchMode ? 2 : 1, status: "Starting..." });

    try {
      const { data, error } = await supabase.functions.invoke("generate-location-page", {
        body: {
          city: state.name,
          region: state.code,
          country: "United States",
          intent_type: intentType,
          goal: "retirement planning clients",
          batch_mode: batchMode,
          languages: batchMode ? ["en", "es"] : undefined,
          language: batchMode ? undefined : "en",
        },
      });

      if (error) console.warn("Request error (may be timeout):", error);

      if (batchMode && data?.status === "started" && data?.job_id) {
        setCurrentJobId(data.job_id);
        const jobId = data.job_id;
        const hreflangGroupId = data.hreflang_group_id;
        const total = data.languages?.length || 2;
        setGenerationProgress({ current: 0, total, status: `Generating ${total} languages...` });

        pollingRef.current = setInterval(() => pollJob(jobId, hreflangGroupId, total), 3000);
        setTimeout(() => pollJob(jobId, hreflangGroupId, total), 1000);
      } else if (!batchMode && data?.success) {
        // Single mode — save directly with state_code
        const page = data.locationPage;
        const { error: insertErr } = await supabase
          .from("location_pages")
          .insert({ ...page, state_code: selectedState, status: "draft" });
        if (insertErr) throw insertErr;

        setIsGenerating(false);
        queryClient.invalidateQueries({ queryKey: ["admin-state-pages"] });
        toast.success(`${state.name} page generated!`);
        setActiveTab("manage");
      } else if (data?.error) {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error("Generation error:", err);
      toast.error(err instanceof Error ? err.message : "Generation failed");
      setIsGenerating(false);
    }
  };

  // Filter pages
  const filteredPages = statePages?.filter(p => {
    const matchesSearch = !searchQuery ||
      p.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.state_code || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesState = stateFilter === "all" || p.state_code === stateFilter;
    return matchesSearch && matchesStatus && matchesState;
  }) || [];

    return (
    <AdminLayout>
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-foreground">
          <MapPin className="h-8 w-8 text-primary" />
          State Page Generator
        </h1>
        <p className="text-muted-foreground mt-1">
          Generate AI-powered state-specific retirement planning pages with SEO optimization.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Generate
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Manage ({statePages?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* ===== GENERATE TAB ===== */}
        <TabsContent value="generate" className="mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Generate State Page
                </CardTitle>
                <CardDescription>
                  Select a US state and strategy type to generate a retirement planning page with AI.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* State Selector */}
                <div className="space-y-2">
                  <Label>State</Label>
                  <Select value={selectedState} onValueChange={setSelectedState}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a state..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {US_STATES.map(s => (
                        <SelectItem key={s.code} value={s.code}>
                          <span className="flex items-center gap-2">
                            {s.name} ({s.code})
                            {existingStates.includes(s.code) && (
                              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                                exists
                              </Badge>
                            )}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Intent Type */}
                <div className="space-y-2">
                  <Label>Strategy Focus</Label>
                  <Select value={intentType} onValueChange={setIntentType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INTENT_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Bilingual Toggle */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                  <Checkbox
                    id="batch-mode"
                    checked={batchMode}
                    onCheckedChange={(c) => setBatchMode(c as boolean)}
                  />
                  <div>
                    <Label htmlFor="batch-mode" className="cursor-pointer font-medium flex items-center gap-2">
                      <Languages className="h-4 w-4" />
                      Generate bilingual (EN + ES)
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Creates both English and Spanish versions automatically
                    </p>
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !selectedState}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Generating...</>
                  ) : (
                    <><Sparkles className="mr-2 h-5 w-5" />Generate State Page</>
                  )}
                </Button>

                {/* Progress */}
                {isGenerating && generationProgress.total > 0 && (
                  <div className="space-y-2">
                    <Progress
                      value={(generationProgress.current / generationProgress.total) * 100}
                      className="h-2"
                    />
                    <p className="text-sm text-muted-foreground text-center">
                      {generationProgress.status}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Info Panel */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Coverage Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 rounded-lg bg-primary/10">
                      <p className="text-2xl font-bold text-primary">{existingStates.length}</p>
                      <p className="text-xs text-muted-foreground">States Covered</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <p className="text-2xl font-bold">{50 - existingStates.length}</p>
                      <p className="text-xs text-muted-foreground">Remaining</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <p className="text-2xl font-bold">
                        {statePages?.filter(p => p.status === "published").length || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Published</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <p className="text-2xl font-bold">
                        {statePages?.filter(p => p.status === "draft").length || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Drafts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Priority States */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Priority States</CardTitle>
                  <CardDescription>High-value states for retirement planning</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {["CA", "TX", "FL", "NY", "AZ", "NV", "WA", "CO", "IL", "PA"].map(code => {
                      const hasPage = existingStates.includes(code);
                      const state = US_STATES.find(s => s.code === code);
                      return (
                        <Badge
                          key={code}
                          variant={hasPage ? "default" : "outline"}
                          className={`cursor-pointer transition-colors ${
                            hasPage ? "bg-primary/80" : "hover:bg-primary/10"
                          }`}
                          onClick={() => {
                            if (!hasPage) {
                              setSelectedState(code);
                              setActiveTab("generate");
                            }
                          }}
                        >
                          {hasPage && <CheckCircle className="h-3 w-3 mr-1" />}
                          {state?.name || code}
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ===== MANAGE TAB ===== */}
        <TabsContent value="manage" className="mt-6 space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by headline, state..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={stateFilter} onValueChange={setStateFilter}>
                  <SelectTrigger><SelectValue placeholder="State" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    {existingStates.sort().map(code => {
                      const state = US_STATES.find(s => s.code === code);
                      return <SelectItem key={code} value={code!}>{state?.name || code}</SelectItem>;
                    })}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => {
                    const draftIds = filteredPages.filter(p => p.status === "draft").map(p => p.id);
                    if (draftIds.length === 0) { toast.info("No drafts to publish"); return; }
                    publishMutation.mutate(draftIds);
                  }}
                  disabled={publishMutation.isPending}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Publish All Drafts ({filteredPages.filter(p => p.status === "draft").length})
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pages Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">State</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Headline</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Lang</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Updated</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                          <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                          Loading state pages...
                        </td>
                      </tr>
                    ) : filteredPages.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                          <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          No state pages found. Generate your first one!
                        </td>
                      </tr>
                    ) : (
                      filteredPages.map(page => {
                        const state = US_STATES.find(s => s.code === page.state_code);
                        return (
                          <tr key={page.id} className="hover:bg-muted/50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="font-mono">
                                  {page.state_code}
                                </Badge>
                                <span className="text-sm">{state?.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-sm truncate max-w-xs">{page.headline}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                /{page.language}/retirement-planning/{page.topic_slug}
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              <Badge
                                className={
                                  page.status === "published"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }
                              >
                                {page.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="secondary">{page.language.toUpperCase()}</Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              {new Date(page.updated_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    window.open(
                                      `/${page.language}/retirement-planning/${page.topic_slug}`,
                                      "_blank"
                                    )
                                  }
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {page.status === "draft" && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-green-600 hover:text-green-700"
                                    onClick={() => publishMutation.mutate([page.id])}
                                    disabled={publishMutation.isPending}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => setPageToDelete(page.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation */}
      <AlertDialog open={!!pageToDelete} onOpenChange={() => setPageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete State Page?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this state page. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => pageToDelete && deleteMutation.mutate(pageToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </AdminLayout>
  );
};

export default AdminStatePages;
