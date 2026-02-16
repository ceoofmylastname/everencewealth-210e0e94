import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, FileText, Video, Megaphone, Eye, Image as ImageIcon, Copy } from "lucide-react";
import { toast } from "sonner";

const categories = [
  { key: "recruiting", label: "Recruiting" },
  { key: "client_acquisition", label: "Client Acquisition" },
  { key: "social_media", label: "Social Media" },
  { key: "email_templates", label: "Email Templates" },
  { key: "presentations", label: "Presentations" },
  { key: "brochures", label: "Brochures" },
  { key: "video_content", label: "Video Content" },
];

const resourceTypes = [
  { key: "creative", label: "Creative" },
  { key: "template", label: "Template" },
  { key: "video", label: "Video" },
  { key: "document", label: "Document" },
  { key: "script", label: "Script" },
];

const typeIcons: Record<string, React.ElementType> = {
  creative: ImageIcon,
  template: FileText,
  video: Video,
  document: FileText,
  script: Copy,
};

export default function MarketingResources() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("marketing_resources").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setResources(data ?? []); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return resources
      .filter(r => !selectedCategory || r.category === selectedCategory)
      .filter(r => !selectedType || r.resource_type === selectedType)
      .filter(r => {
        if (!q) return true;
        if (r.title?.toLowerCase().includes(q)) return true;
        if (r.tags?.some((t: string) => t.toLowerCase().includes(q))) return true;
        return false;
      });
  }, [resources, searchQuery, selectedCategory, selectedType]);

  const stats = useMemo(() => ({
    total: resources.length,
    creatives: resources.filter(r => r.resource_type === "creative").length,
    templates: resources.filter(r => r.resource_type === "template").length,
    videos: resources.filter(r => r.resource_type === "video").length,
  }), [resources]);

  async function handleDownload(r: any) {
    await supabase.from("marketing_resources").update({ download_count: (r.download_count || 0) + 1 }).eq("id", r.id);
    r.download_count = (r.download_count || 0) + 1;
    setResources([...resources]);
    if (r.file_url) window.open(r.file_url, "_blank");
    toast.success("Resource downloaded!");
  }

  const statCards = [
    { label: "Total Resources", value: stats.total, icon: Megaphone },
    { label: "Creatives", value: stats.creatives, icon: ImageIcon },
    { label: "Templates", value: stats.templates, icon: FileText },
    { label: "Videos", value: stats.videos, icon: Video },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>Marketing Resources</h1>
        <p className="text-muted-foreground mt-1">Access social media creatives, email templates, and recruiting materials.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search resources or tags..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Category</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant={!selectedCategory ? "default" : "outline"} className="cursor-pointer" onClick={() => setSelectedCategory(null)}>All</Badge>
              {categories.map(c => (
                <Badge key={c.key} variant={selectedCategory === c.key ? "default" : "outline"} className="cursor-pointer" onClick={() => setSelectedCategory(c.key)}>{c.label}</Badge>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Type</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant={!selectedType ? "default" : "outline"} className="cursor-pointer" onClick={() => setSelectedType(null)}>All Types</Badge>
              {resourceTypes.map(t => (
                <Badge key={t.key} variant={selectedType === t.key ? "default" : "outline"} className="cursor-pointer" onClick={() => setSelectedType(t.key)}>{t.label}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No resources match your filters</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => { setSearchQuery(""); setSelectedCategory(null); setSelectedType(null); }}>Clear Filters</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(r => {
            const TypeIcon = typeIcons[r.resource_type] || FileText;
            const showImage = r.thumbnail_url || (r.resource_type === "creative" && r.file_url);
            return (
              <Card key={r.id} className="overflow-hidden flex flex-col">
                {showImage ? (
                  <img src={r.thumbnail_url || r.file_url} alt={r.title} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-primary/5 flex items-center justify-center">
                    <TypeIcon className="h-12 w-12 text-primary/30" />
                  </div>
                )}
                <CardContent className="p-4 flex-1 flex flex-col">
                  <Badge variant="secondary" className="text-xs capitalize w-fit mb-2">{r.resource_type}</Badge>
                  <p className="font-medium text-foreground truncate">{r.title}</p>
                  {r.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.description}</p>}
                  {r.tags && r.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {r.tags.slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">{tag}</Badge>
                      ))}
                      {r.tags.length > 3 && <span className="text-[10px] text-muted-foreground">+{r.tags.length - 3}</span>}
                    </div>
                  )}
                  <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                    <Download className="h-3 w-3" />
                    {r.download_count || 0} downloads
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <Button size="sm" className="flex-1" onClick={() => handleDownload(r)}><Download className="h-3 w-3 mr-1" />Download</Button>
                    {r.file_url && (
                      <a href={r.file_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm"><Eye className="h-3 w-3 mr-1" />Preview</Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
