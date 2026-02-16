import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Newspaper, TrendingUp, AlertCircle, Star, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

const priorityColors: Record<string, string> = {
  urgent: "bg-red-100 text-red-800",
  high: "bg-orange-100 text-orange-800",
  normal: "bg-blue-100 text-blue-800",
  low: "bg-gray-100 text-gray-800",
};

const priorities = ["low", "normal", "high", "urgent"];
const articleTypes = ["rate_update", "product_launch", "general", "compliance", "promotion"];

function getTypeIcon(type: string | null) {
  switch (type) {
    case "rate_update": return TrendingUp;
    case "compliance": return AlertCircle;
    default: return Newspaper;
  }
}

export default function CarrierNews() {
  const [news, setNews] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("carrier_news")
      .select("*, carriers(carrier_name, carrier_logo_url)")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .then(({ data }) => {
        setNews(data ?? []);
        setLoading(false);
      });
  }, []);

  const filteredNews = useMemo(() => {
    let filtered = news;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.carriers?.carrier_name?.toLowerCase().includes(q)
      );
    }
    if (selectedPriority) filtered = filtered.filter((n) => n.priority === selectedPriority);
    if (selectedType) filtered = filtered.filter((n) => n.article_type === selectedType);
    return filtered;
  }, [news, searchQuery, selectedPriority, selectedType]);

  async function incrementViews(id: string, currentViews: number) {
    await supabase.from("carrier_news").update({ views: currentViews + 1 }).eq("id", id);
    setNews((prev) => prev.map((n) => (n.id === id ? { ...n, views: (n.views || 0) + 1 } : n)));
  }

  const stats = useMemo(
    () => ({
      total: news.length,
      urgent: news.filter((n) => n.priority === "urgent").length,
      rateUpdates: news.filter((n) => n.article_type === "rate_update").length,
      productLaunches: news.filter((n) => n.article_type === "product_launch").length,
    }),
    [news]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
          Carrier News &amp; Updates
        </h1>
        <p className="text-muted-foreground mt-1">Stay informed about rate changes, product launches, and carrier updates</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Articles", value: stats.total, icon: Newspaper, color: "text-primary" },
          { label: "Urgent Updates", value: stats.urgent, icon: AlertCircle, color: "text-destructive" },
          { label: "Rate Updates", value: stats.rateUpdates, icon: TrendingUp, color: "text-primary" },
          { label: "Product Launches", value: stats.productLaunches, icon: Star, color: "text-yellow-500" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("p-2 rounded-lg bg-muted", s.color)}>
                <s.icon className="h-5 w-5" />
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
            <Input
              placeholder="Search by carrier, title, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Priority</p>
            <div className="flex flex-wrap gap-2">
              <Badge
                className={cn("cursor-pointer", !selectedPriority ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}
                onClick={() => setSelectedPriority(null)}
              >
                All
              </Badge>
              {priorities.map((p) => (
                <Badge
                  key={p}
                  className={cn("cursor-pointer capitalize", selectedPriority === p ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}
                  onClick={() => setSelectedPriority(p)}
                >
                  {p}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Type</p>
            <div className="flex flex-wrap gap-2">
              <Badge
                className={cn("cursor-pointer", !selectedType ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}
                onClick={() => setSelectedType(null)}
              >
                All Types
              </Badge>
              {articleTypes.map((t) => (
                <Badge
                  key={t}
                  className={cn("cursor-pointer capitalize", selectedType === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}
                  onClick={() => setSelectedType(t)}
                >
                  {t.replace(/_/g, " ")}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <Newspaper className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">No news articles match your filters</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setSelectedPriority(null);
              setSelectedType(null);
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNews.map((n) => {
            const TypeIcon = getTypeIcon(n.article_type);
            return (
              <Card
                key={n.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => incrementViews(n.id, n.views || 0)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {n.carriers?.carrier_logo_url && (
                      <img
                        src={n.carriers.carrier_logo_url}
                        alt={n.carriers.carrier_name}
                        className="w-10 h-10 rounded object-contain flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <h3 className="text-base font-semibold text-foreground">{n.title}</h3>
                        </div>
                        <Badge className={cn("text-xs flex-shrink-0", priorityColors[n.priority] || priorityColors.normal)}>
                          {n.priority}
                        </Badge>
                      </div>

                      {n.carriers?.carrier_name && (
                        <p className="text-sm font-medium text-muted-foreground mt-1">{n.carriers.carrier_name}</p>
                      )}

                      <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{n.content}</p>

                      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {n.views || 0} views
                        </span>
                        <span>•</span>
                        <span>{n.published_at ? new Date(n.published_at).toLocaleDateString() : ""}</span>
                        <span>•</span>
                        <span className="capitalize">{n.article_type?.replace(/_/g, " ")}</span>
                      </div>
                    </div>
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
