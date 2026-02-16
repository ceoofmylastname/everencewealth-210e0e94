import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, FileText } from "lucide-react";

export default function MarketingResources() {
  const [resources, setResources] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("marketing_resources").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setResources(data ?? []); setLoading(false); });
  }, []);

  const categories = ["all", ...new Set(resources.map(r => r.category))];
  const filtered = resources
    .filter(r => filter === "all" || r.category === filter)
    .filter(r => r.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>Marketing Resources</h1>
        <p className="text-muted-foreground mt-1">Download marketing materials and templates.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search resources..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <Badge key={cat} variant={filter === cat ? "default" : "outline"} className="cursor-pointer capitalize"
              onClick={() => setFilter(cat)}>{cat.replace(/_/g, " ")}</Badge>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No resources found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(r => (
            <Card key={r.id}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{r.title}</p>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="outline" className="text-xs capitalize">{r.resource_type}</Badge>
                      <Badge variant="secondary" className="text-xs capitalize">{r.category.replace(/_/g, " ")}</Badge>
                    </div>
                    {r.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{r.description}</p>}
                    {r.file_url && (
                      <a href={r.file_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="mt-3"><Download className="h-3 w-3 mr-1" />Download</Button>
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
