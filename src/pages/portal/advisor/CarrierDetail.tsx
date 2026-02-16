import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Shield } from "lucide-react";

export default function CarrierDetail() {
  const { id } = useParams<{ id: string }>();
  const [carrier, setCarrier] = useState<any>(null);
  const [tools, setTools] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from("carriers").select("*").eq("id", id).single(),
      supabase.from("quoting_tools").select("*").eq("carrier_id", id),
      supabase.from("carrier_news").select("*").eq("carrier_id", id).eq("status", "published").order("published_at", { ascending: false }).limit(5),
    ]).then(([c, t, n]) => {
      setCarrier(c.data);
      setTools(t.data ?? []);
      setNews(n.data ?? []);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!carrier) return <p className="text-muted-foreground">Carrier not found.</p>;

  return (
    <div className="space-y-6">
      <Link to="/portal/advisor/carriers">
        <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back to Carriers</Button>
      </Link>

      <div className="flex items-center gap-4">
        {carrier.carrier_logo_url ? (
          <img src={carrier.carrier_logo_url} alt={carrier.carrier_name} className="h-16 w-16 rounded object-contain" />
        ) : (
          <div className="h-16 w-16 rounded bg-primary/10 flex items-center justify-center"><Shield className="h-8 w-8 text-primary" /></div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>{carrier.carrier_name}</h1>
          {carrier.am_best_rating && <Badge variant="outline">AM Best: {carrier.am_best_rating}</Badge>}
        </div>
      </div>

      {carrier.products_offered && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Products Offered</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {carrier.products_offered.map((p: string) => <Badge key={p} variant="secondary">{p}</Badge>)}
            </div>
          </CardContent>
        </Card>
      )}

      {carrier.notes && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Notes</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">{carrier.notes}</p></CardContent>
        </Card>
      )}

      {tools.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Quoting Tools</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {tools.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{t.tool_name}</p>
                  <Badge variant="outline" className="text-xs capitalize mt-1">{t.tool_type.replace(/_/g, " ")}</Badge>
                </div>
                <a href={t.tool_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm"><ExternalLink className="h-3 w-3 mr-1" />Open</Button>
                </a>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {news.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Recent News</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {news.map((n: any) => (
              <div key={n.id} className="border-b border-border pb-3 last:border-0">
                <p className="text-sm font-medium text-foreground">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.content}</p>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline" className="text-xs capitalize">{n.article_type?.replace(/_/g, " ")}</Badge>
                  <span className="text-xs text-muted-foreground">{n.published_at ? new Date(n.published_at).toLocaleDateString() : ""}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
