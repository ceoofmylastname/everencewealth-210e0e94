import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ExternalLink, Shield, Star, Phone, Globe, Mail, Calculator, FileText, Newspaper } from "lucide-react";

export default function CarrierDetail() {
  const { id } = useParams<{ id: string }>();
  const [carrier, setCarrier] = useState<any>(null);
  const [tools, setTools] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from("carriers").select("*").eq("id", id).maybeSingle(),
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

  if (!carrier) return (
    <div className="space-y-4">
      <Link to="/portal/advisor/carriers">
        <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back to Carriers</Button>
      </Link>
      <p className="text-muted-foreground">Carrier not found.</p>
    </div>
  );

  const contactInfo = carrier.contact_info as Record<string, any> | null;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to="/portal/advisor/carriers">
        <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back to Carriers</Button>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {carrier.carrier_logo_url ? (
            <img src={carrier.carrier_logo_url} alt={carrier.carrier_name} className="h-16 w-16 rounded object-contain" />
          ) : (
            <div className="h-16 w-16 rounded bg-primary/10 flex items-center justify-center"><Shield className="h-8 w-8 text-primary" /></div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
              {carrier.carrier_name}
              {carrier.short_code && <span className="text-base font-normal text-muted-foreground ml-2">({carrier.short_code})</span>}
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {carrier.am_best_rating && <Badge variant="outline">AM Best: {carrier.am_best_rating}</Badge>}
              {carrier.portal_url && (
                <a href={carrier.portal_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="text-xs h-7"><ExternalLink className="h-3 w-3 mr-1" /> Agent Portal</Button>
                </a>
              )}
            </div>
          </div>
        </div>
        {carrier.featured && <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 shrink-0" />}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="news">News</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4">
          {contactInfo && Object.keys(contactInfo).length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Contact Information</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {contactInfo.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${contactInfo.phone}`} className="text-primary hover:underline">{contactInfo.phone}</a>
                  </div>
                )}
                {contactInfo.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${contactInfo.email}`} className="text-primary hover:underline">{contactInfo.email}</a>
                  </div>
                )}
                {contactInfo.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a href={contactInfo.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{contactInfo.website}</a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {carrier.notes && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Notes</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground whitespace-pre-line">{carrier.notes}</p></CardContent>
            </Card>
          )}

          {carrier.contracting_requirements && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Contracting Requirements</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground whitespace-pre-line">{carrier.contracting_requirements}</p></CardContent>
            </Card>
          )}

          {carrier.commission_structure && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Commission Structure</CardTitle></CardHeader>
              <CardContent>
                <pre className="text-sm text-muted-foreground bg-muted p-3 rounded-md overflow-auto">
                  {typeof carrier.commission_structure === "string" ? carrier.commission_structure : JSON.stringify(carrier.commission_structure, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {!contactInfo && !carrier.notes && !carrier.contracting_requirements && !carrier.commission_structure && (
            <p className="text-sm text-muted-foreground py-4">No overview information available.</p>
          )}
        </TabsContent>

        {/* Products */}
        <TabsContent value="products" className="space-y-4">
          {carrier.products_offered && carrier.products_offered.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Products Offered</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {carrier.products_offered.map((p: string) => <Badge key={p} variant="secondary">{p}</Badge>)}
                </div>
              </CardContent>
            </Card>
          )}

          {carrier.niches && carrier.niches.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Market Niches</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {carrier.niches.map((n: string) => (
                    <Badge key={n} variant="outline" className="capitalize">{n.replace(/_/g, " ")}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {(!carrier.products_offered || carrier.products_offered.length === 0) && (!carrier.niches || carrier.niches.length === 0) && (
            <p className="text-sm text-muted-foreground py-4">No product information available.</p>
          )}
        </TabsContent>

        {/* Tools */}
        <TabsContent value="tools" className="space-y-4">
          {tools.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Quoting & Application Tools</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {tools.map((t: any) => (
                  <div key={t.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                    <div className="flex items-center gap-3">
                      <Calculator className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{t.tool_name}</p>
                        <Badge variant="outline" className="text-xs capitalize mt-1">{t.tool_type?.replace(/_/g, " ")}</Badge>
                      </div>
                    </div>
                    <a href={t.tool_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm"><ExternalLink className="h-3 w-3 mr-1" />Open</Button>
                    </a>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {carrier.portal_url && (
            <Card>
              <CardContent className="pt-6">
                <a href={carrier.portal_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-primary hover:underline">
                  <Globe className="h-5 w-5" />
                  <span className="text-sm font-medium">Agent Portal</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </CardContent>
            </Card>
          )}

          {tools.length === 0 && !carrier.portal_url && (
            <p className="text-sm text-muted-foreground py-4">No tools available.</p>
          )}
        </TabsContent>

        {/* News */}
        <TabsContent value="news" className="space-y-4">
          {news.length > 0 ? (
            <Card>
              <CardHeader><CardTitle className="text-lg">Latest Updates</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {news.map((n: any) => (
                  <div key={n.id} className="border-b border-border pb-4 last:border-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{n.title}</p>
                      {n.priority && <Badge variant="outline" className="text-xs capitalize shrink-0">{n.priority}</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{n.content}</p>
                    <div className="flex gap-2 mt-2">
                      {n.article_type && <Badge variant="secondary" className="text-xs capitalize">{n.article_type.replace(/_/g, " ")}</Badge>}
                      <span className="text-xs text-muted-foreground">{n.published_at ? new Date(n.published_at).toLocaleDateString() : ""}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <p className="text-sm text-muted-foreground py-4">No recent news.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
