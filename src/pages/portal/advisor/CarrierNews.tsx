import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";

const priorityColors: Record<string, string> = {
  urgent: "bg-red-100 text-red-800",
  high: "bg-orange-100 text-orange-800",
  normal: "bg-blue-100 text-blue-800",
  low: "bg-gray-100 text-gray-800",
};

export default function CarrierNews() {
  const [news, setNews] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("carrier_news").select("*, carriers(carrier_name)")
      .eq("status", "published").order("published_at", { ascending: false })
      .then(({ data }) => { setNews(data ?? []); setLoading(false); });
  }, []);

  const filtered = news.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>Carrier News</h1>
        <p className="text-muted-foreground mt-1">Stay up to date with the latest carrier updates.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search news..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No news articles found.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map(n => (
            <Card key={n.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={cn("text-xs", priorityColors[n.priority] || priorityColors.normal)}>{n.priority}</Badge>
                      <Badge variant="outline" className="text-xs capitalize">{n.article_type?.replace(/_/g, " ")}</Badge>
                    </div>
                    <h3 className="text-base font-semibold text-foreground">{n.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2">{n.content}</p>
                    <p className="text-xs text-muted-foreground mt-3">
                      {n.carriers?.carrier_name} · {n.published_at ? new Date(n.published_at).toLocaleDateString() : ""}
                    </p>
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
