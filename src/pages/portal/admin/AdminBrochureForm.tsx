import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/AdminLayout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2, GripVertical, Save, Sparkles, Loader2, ImagePlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

interface Section {
  section_number: number;
  title: string;
  content: string;
  image_url?: string;
  image_alt?: string;
  image_caption?: string;
}

const CATEGORIES = [
  { value: "tax_planning", label: "Tax Planning" },
  { value: "retirement_strategies", label: "Retirement Strategies" },
  { value: "iul_education", label: "IUL Education" },
  { value: "estate_planning", label: "Estate Planning" },
];

const CALCULATOR_TYPES = [
  { value: "retirement_gap", label: "Retirement Gap Calculator" },
  { value: "tax_bucket", label: "Tax Bucket Allocation Tool" },
  { value: "iul_comparison", label: "IUL vs 401k Comparison" },
];

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function AdminBrochureForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    category: "tax_planning",
    meta_title: "",
    meta_description: "",
    hero_headline: "",
    subtitle: "",
    speakable_intro: "",
    cover_image_url: "",
    cover_image_alt: "",
    gated: true,
    featured: false,
    has_calculator: false,
    calculator_type: "",
    has_worksheet: false,
    status: "draft" as "draft" | "published",
    tags: [] as string[],
    language: "en",
  });

  const [sections, setSections] = useState<Section[]>([
    { section_number: 1, title: "", content: "" },
  ]);

  const [tagInput, setTagInput] = useState("");

  const { data: existing } = useQuery({
    queryKey: ["brochure", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("brochures")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title,
        slug: existing.slug,
        category: existing.category,
        meta_title: existing.meta_title,
        meta_description: existing.meta_description,
        hero_headline: existing.hero_headline,
        subtitle: existing.subtitle || "",
        speakable_intro: existing.speakable_intro,
        cover_image_url: existing.cover_image_url || "",
        cover_image_alt: existing.cover_image_alt || "",
        gated: existing.gated ?? true,
        featured: existing.featured ?? false,
        has_calculator: existing.has_calculator ?? false,
        calculator_type: existing.calculator_type || "",
        has_worksheet: existing.has_worksheet ?? false,
        status: existing.status as "draft" | "published",
        tags: existing.tags || [],
        language: existing.language || "en",
      });
      if (Array.isArray(existing.sections) && existing.sections.length > 0) {
        setSections(existing.sections as unknown as Section[]);
      }
    }
  }, [existing]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const slug = form.slug || slugify(form.title);
      const payload = {
        ...form,
        slug,
        sections: JSON.parse(JSON.stringify(sections)),
        published_at: form.status === "published" ? new Date().toISOString() : null,
      };

      if (isEdit) {
        const { error } = await supabase.from("brochures").update(payload).eq("id", id!);
        if (error) throw error;
      } else {
        // Try insert, if slug conflict append random suffix
        const { error } = await supabase.from("brochures").insert([payload]);
        if (error && error.message.includes("brochures_slug_key")) {
          payload.slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
          const { error: retryError } = await supabase.from("brochures").insert([payload]);
          if (retryError) throw retryError;
        } else if (error) {
          throw error;
        }
      }
    },
    onSuccess: () => {
      toast({ title: isEdit ? "Brochure updated" : "Brochure created" });
      navigate("/admin/brochures");
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const updateField = (key: string, value: unknown) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "title" && !isEdit) {
        next.slug = slugify(value as string);
      }
      return next;
    });
  };

  const addSection = () => {
    setSections((prev) => [
      ...prev,
      { section_number: prev.length + 1, title: "", content: "" },
    ]);
  };

  const removeSection = (idx: number) => {
    setSections((prev) =>
      prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, section_number: i + 1 }))
    );
  };

  const updateSection = (idx: number, key: keyof Section, value: string) => {
    setSections((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [key]: value } : s))
    );
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !form.tags.includes(tag)) {
      updateField("tags", [...form.tags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    updateField("tags", form.tags.filter((t) => t !== tag));
  };

  const wordCount = form.speakable_intro.split(/\s+/).filter(Boolean).length;

  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiAudience, setAiAudience] = useState("pre-retirees aged 50-65");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGenerateCover, setAiGenerateCover] = useState(true);
  const [coverGenerating, setCoverGenerating] = useState(false);

  const generateWithAI = async () => {
    if (!aiTopic) return;
    setAiGenerating(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-guide-content`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        body: JSON.stringify({ category: form.category, topic: aiTopic, target_audience: aiAudience, language: form.language, generate_cover_image: aiGenerateCover }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      const b = data.brochure;
      setForm((prev) => ({
        ...prev,
        title: b.title, slug: b.slug, hero_headline: b.hero_headline,
        subtitle: b.subtitle || "", meta_title: b.meta_title, meta_description: b.meta_description,
        speakable_intro: b.speakable_intro, tags: b.tags || [],
        cover_image_url: b.cover_image_url || prev.cover_image_url,
        cover_image_alt: b.cover_image_alt || prev.cover_image_alt,
      }));
      setSections(b.sections || []);
      toast({ title: "AI content generated!", description: b.cover_image_url ? "Content and cover image ready. Review before saving." : "Review and edit before saving." });
      setAiDialogOpen(false);
    } catch (err: any) {
      toast({ title: "AI Generation Failed", description: err.message, variant: "destructive" });
    } finally {
      setAiGenerating(false);
    }
  };

  const generateCoverImage = async () => {
    if (!form.title) {
      toast({ title: "Title required", description: "Enter a title first so the AI can generate a relevant image.", variant: "destructive" });
      return;
    }
    setCoverGenerating(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-guide-content`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        body: JSON.stringify({ category: form.category, topic: form.title, target_audience: "cover image only", language: form.language, generate_cover_image: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Image generation failed");

      const b = data.brochure;
      if (b.cover_image_url) {
        setForm((prev) => ({
          ...prev,
          cover_image_url: b.cover_image_url,
          cover_image_alt: b.cover_image_alt || prev.cover_image_alt,
        }));
        toast({ title: "Cover image generated!" });
      } else {
        toast({ title: "No image generated", description: "The AI did not return an image. Try again.", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Image Generation Failed", description: err.message, variant: "destructive" });
    } finally {
      setCoverGenerating(false);
    }
  };

  return (
    <AdminLayout>
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/brochures")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
          {isEdit ? "Edit Brochure" : "New Brochure"}
        </h1>
        <div className="ml-auto">
          <Button variant="outline" onClick={() => setAiDialogOpen(true)}>
            <Sparkles className="h-4 w-4 mr-2" /> Generate with AI
          </Button>
        </div>
      </div>

      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Brochure with AI</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Topic *</Label>
              <Input value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} placeholder="e.g., Tax-Free Retirement Income Strategies" />
            </div>
            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Input value={aiAudience} onChange={(e) => setAiAudience(e.target.value)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Generate Cover Image</Label>
              <Switch checked={aiGenerateCover} onCheckedChange={setAiGenerateCover} />
            </div>
            <Button onClick={generateWithAI} disabled={aiGenerating || !aiTopic} className="w-full">
              {aiGenerating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating{aiGenerateCover ? " (content + image)..." : "..."}</> : <><Sparkles className="h-4 w-4 mr-2" /> Generate Content</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Basic Info */}
      <Card>
        <CardHeader><CardTitle>Basic Info</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => updateField("title", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => updateField("slug", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={form.category} onValueChange={(v) => updateField("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={form.language} onValueChange={(v) => updateField("language", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Meta Title <span className="text-xs text-muted-foreground">({form.meta_title.length}/60)</span></Label>
            <Input value={form.meta_title} onChange={(e) => updateField("meta_title", e.target.value)} maxLength={60} />
          </div>
          <div className="space-y-2">
            <Label>Meta Description <span className="text-xs text-muted-foreground">({form.meta_description.length}/155)</span></Label>
            <Textarea value={form.meta_description} onChange={(e) => updateField("meta_description", e.target.value)} maxLength={155} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Hero Headline *</Label>
            <Input value={form.hero_headline} onChange={(e) => updateField("hero_headline", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Subtitle</Label>
            <Input value={form.subtitle} onChange={(e) => updateField("subtitle", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>
              Speakable Intro * <span className={`text-xs ${wordCount < 40 || wordCount > 60 ? "text-destructive" : "text-muted-foreground"}`}>({wordCount}/40-60 words)</span>
            </Label>
            <Textarea value={form.speakable_intro} onChange={(e) => updateField("speakable_intro", e.target.value)} rows={3} />
          </div>
        </CardContent>
      </Card>

      {/* Cover */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Cover Image</CardTitle>
            <Button variant="outline" size="sm" onClick={generateCoverImage} disabled={coverGenerating}>
              {coverGenerating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</> : <><ImagePlus className="h-4 w-4 mr-2" /> Generate with AI</>}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {form.cover_image_url && (
            <img src={form.cover_image_url} alt={form.cover_image_alt || "Cover preview"} className="w-full max-h-48 object-cover rounded-lg border" />
          )}
          <div className="space-y-2">
            <Label>Cover Image URL</Label>
            <Input value={form.cover_image_url} onChange={(e) => updateField("cover_image_url", e.target.value)} placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <Label>Alt Text</Label>
            <Input value={form.cover_image_alt} onChange={(e) => updateField("cover_image_alt", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Content Sections */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Content Sections</CardTitle>
            <Button variant="outline" size="sm" onClick={addSection}>
              <Plus className="h-4 w-4 mr-1" /> Add Section
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {sections.map((section, idx) => (
            <div key={idx} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Section {idx + 1}</span>
                </div>
                {sections.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => removeSection(idx)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={section.title} onChange={(e) => updateSection(idx, "title", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Content (HTML)</Label>
                <Textarea value={section.content} onChange={(e) => updateSection(idx, "content", e.target.value)} rows={5} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Image URL</Label>
                  <Input value={section.image_url || ""} onChange={(e) => updateSection(idx, "image_url", e.target.value)} placeholder="Optional" />
                </div>
                <div className="space-y-2">
                  <Label>Image Alt</Label>
                  <Input value={section.image_alt || ""} onChange={(e) => updateSection(idx, "image_alt", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Image Caption</Label>
                  <Input value={section.image_caption || ""} onChange={(e) => updateSection(idx, "image_caption", e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Interactive Features */}
      <Card>
        <CardHeader><CardTitle>Interactive Features</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Has Calculator</Label>
            <Switch checked={form.has_calculator} onCheckedChange={(v) => updateField("has_calculator", v)} />
          </div>
          {form.has_calculator && (
            <div className="space-y-2">
              <Label>Calculator Type</Label>
              <Select value={form.calculator_type} onValueChange={(v) => updateField("calculator_type", v)}>
                <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                <SelectContent>
                  {CALCULATOR_TYPES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex items-center justify-between">
            <Label>Has Worksheet</Label>
            <Switch checked={form.has_worksheet} onCheckedChange={(v) => updateField("has_worksheet", v)} />
          </div>
        </CardContent>
      </Card>

      {/* Lead Magnet & Publishing */}
      <Card>
        <CardHeader><CardTitle>Lead Magnet & Publishing</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Gated (require email to download)</Label>
            <Switch checked={form.gated} onCheckedChange={(v) => updateField("gated", v)} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Featured</Label>
            <Switch checked={form.featured} onCheckedChange={(v) => updateField("featured", v)} />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => updateField("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader><CardTitle>Tags</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add tag..."
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
            />
            <Button variant="outline" onClick={addTag}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                {tag} ×
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end gap-3 pb-8">
        <Button variant="outline" onClick={() => navigate("/admin/brochures")}>Cancel</Button>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {saveMutation.isPending ? "Saving..." : isEdit ? "Update Brochure" : "Create Brochure"}
        </Button>
      </div>
    </div>
    </AdminLayout>
  );
}
