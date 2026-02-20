import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ExternalLink, Shield, Star, Phone, Globe, Calculator, FileText, Newspaper, Zap, Clock, MapPin, Users, Calendar, Building2, Download, Mail, RefreshCcw } from "lucide-react";

const BRAND_GREEN = "#1A4D3E";

function getRatingBadge(rating: string | null) {
  if (!rating) return "";
  if (rating.startsWith("A+")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (rating.startsWith("A")) return "bg-blue-50 text-blue-700 border-blue-200";
  return "bg-amber-50 text-amber-700 border-amber-200";
}

export default function CarrierDetail() {
  const { id } = useParams<{ id: string }>();
  const [carrier, setCarrier] = useState<any>(null);
  const [tools, setTools] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from("carriers").select("*").eq("id", id).maybeSingle(),
      supabase.from("quoting_tools").select("*").eq("carrier_id", id),
      supabase.from("carrier_news").select("*").eq("carrier_id", id).eq("status", "published").order("published_at", { ascending: false }).limit(5),
      supabase.from("carrier_documents").select("*").eq("carrier_id", id).order("document_name"),
    ]).then(([c, t, n, d]) => {
      setCarrier(c.data);
      setTools(t.data ?? []);
      setNews(n.data ?? []);
      setDocs(d.data ?? []);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: BRAND_GREEN, borderTopColor: "transparent" }} /></div>;

  if (!carrier) return (
    <div className="space-y-4">
      <Link to="/portal/advisor/carriers"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back to Carriers</Button></Link>
      <p className="text-gray-500">Carrier not found.</p>
    </div>
  );

  const reparenting = carrier.reparenting_info as Record<string, any> | null;
  const hasReparenting = reparenting && Object.keys(reparenting).length > 0;

  const tabCount = 4 + (docs.length > 0 ? 1 : 0) + (hasReparenting ? 1 : 0);

  return (
    <div className="space-y-6">
      <Link to="/portal/advisor/carriers"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back to Carriers</Button></Link>

      {/* Hero */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {carrier.carrier_logo_url ? (
              <img src={carrier.carrier_logo_url} alt={carrier.carrier_name} className="h-16 w-16 rounded-xl object-contain bg-gray-50 p-1" />
            ) : (
              <div className="h-16 w-16 rounded-xl flex items-center justify-center" style={{ background: `${BRAND_GREEN}12` }}>
                <Shield className="h-8 w-8" style={{ color: BRAND_GREEN }} />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {carrier.carrier_name}
                {carrier.short_code && <span className="text-base font-normal text-gray-400 ml-2">({carrier.short_code})</span>}
              </h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {carrier.am_best_rating && (
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${getRatingBadge(carrier.am_best_rating)}`}>AM Best: {carrier.am_best_rating}</span>
                )}
                {carrier.turnaround && (
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1 border ${carrier.turnaround === "Fast" ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-600 border-gray-200"}`}>
                    {carrier.turnaround === "Fast" ? <Zap className="h-3 w-3" /> : <Clock className="h-3 w-3" />} {carrier.turnaround} Turnaround
                  </span>
                )}
                {carrier.featured && <Star className="h-4 w-4 fill-current" style={{ color: "hsla(51, 78%, 65%, 1)" }} />}
              </div>
              {/* Quick stats */}
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 flex-wrap">
                {carrier.founded_year && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Est. {carrier.founded_year}</span>}
                {carrier.headquarters && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {carrier.headquarters}</span>}
                {carrier.employees && <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {carrier.employees}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Contact bar */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100 flex-wrap">
          {carrier.phone && (
            <a href={`tel:${carrier.phone}`} className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
              <Phone className="h-3 w-3" /> {carrier.phone}
            </a>
          )}
          {carrier.website && (
            <a href={carrier.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
              <Globe className="h-3 w-3" /> Website
            </a>
          )}
          {carrier.portal_url && (
            <a href={carrier.portal_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-white transition-all hover:opacity-90 px-3 py-1.5 rounded-lg" style={{ background: BRAND_GREEN }}>
              <ExternalLink className="h-3 w-3" /> Agent Portal
            </a>
          )}
          {carrier.quotes_url && (
            <a href={carrier.quotes_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-white transition-all hover:opacity-90 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700">
              <Calculator className="h-3 w-3" /> Quick Quote
            </a>
          )}
          {carrier.illustration_url && (
            <a href={carrier.illustration_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
              <FileText className="h-3 w-3" /> Illustrations
            </a>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-white border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          {docs.length > 0 && <TabsTrigger value="documents">Documents ({docs.length})</TabsTrigger>}
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="news">News</TabsTrigger>
          {hasReparenting && <TabsTrigger value="reparenting">Reparenting</TabsTrigger>}
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          {carrier.description && (
             <Card className="border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)]">
              <CardHeader><CardTitle className="text-base">About</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-gray-600 leading-relaxed">{carrier.description}</p></CardContent>
            </Card>
          )}
          {carrier.underwriting_strengths && (
             <Card className="border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)]">
              <CardHeader><CardTitle className="text-base">Underwriting Strengths</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-gray-600 leading-relaxed">{carrier.underwriting_strengths}</p></CardContent>
            </Card>
          )}
          {carrier.notes && (
             <Card className="border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)]">
              <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-gray-500 whitespace-pre-line">{carrier.notes}</p></CardContent>
            </Card>
          )}
          {carrier.contracting_requirements && (
             <Card className="border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)]">
              <CardHeader><CardTitle className="text-base">Contracting Requirements</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-gray-500 whitespace-pre-line">{carrier.contracting_requirements}</p></CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Products */}
        <TabsContent value="products" className="space-y-4 mt-4">
          {carrier.products_offered && carrier.products_offered.length > 0 && (
             <Card className="border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)]">
              <CardHeader><CardTitle className="text-base">Products Offered</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {carrier.products_offered.map((p: string) => (
                    <span key={p} className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: `${BRAND_GREEN}10`, color: BRAND_GREEN, border: `1px solid ${BRAND_GREEN}25` }}>{p}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {carrier.niches && carrier.niches.length > 0 && (
             <Card className="border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)]">
              <CardHeader><CardTitle className="text-base">Market Niches</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {carrier.niches.map((n: string) => <Badge key={n} variant="outline" className="capitalize text-xs">{n.replace(/_/g, " ")}</Badge>)}
                </div>
              </CardContent>
            </Card>
          )}
          {carrier.special_products && carrier.special_products.length > 0 && (
             <Card className="border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)]">
              <CardHeader><CardTitle className="text-base">Special Products & Features</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {carrier.special_products.map((sp: string, i: number) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0" style={{ background: BRAND_GREEN }} />
                      {sp}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Documents */}
        {docs.length > 0 && (
          <TabsContent value="documents" className="mt-4">
             <Card className="border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)]">
              <CardHeader><CardTitle className="text-base">Carrier Documents & Guides</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {docs.map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-red-500 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{doc.document_name}</p>
                        <p className="text-[11px] text-gray-400 capitalize">{doc.document_type.replace(/_/g, " ")}</p>
                      </div>
                    </div>
                    <a href={doc.document_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="text-xs h-8">
                        <Download className="h-3 w-3 mr-1" /> Download
                      </Button>
                    </a>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Tools */}
        <TabsContent value="tools" className="space-y-4 mt-4">
          {tools.length > 0 && (
             <Card className="border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)]">
              <CardHeader><CardTitle className="text-base">Quoting & Application Tools</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {tools.map((t: any) => (
                  <div key={t.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0">
                    <div className="flex items-center gap-3">
                      <Calculator className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{t.tool_name}</p>
                        <Badge variant="outline" className="text-[11px] capitalize mt-0.5">{t.tool_type?.replace(/_/g, " ")}</Badge>
                      </div>
                    </div>
                    <a href={t.tool_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="text-xs"><ExternalLink className="h-3 w-3 mr-1" />Open</Button>
                    </a>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          {tools.length === 0 && !carrier.portal_url && !carrier.quotes_url && !carrier.illustration_url && (
            <p className="text-sm text-gray-400 py-4">No tools available for this carrier.</p>
          )}
        </TabsContent>

        {/* News */}
        <TabsContent value="news" className="space-y-4 mt-4">
          {news.length > 0 ? (
            <Card className="border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)]">
              <CardHeader><CardTitle className="text-base">Latest Updates</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {news.map((n: any) => (
                  <div key={n.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-gray-800">{n.title}</p>
                      {n.priority && <Badge variant="outline" className="text-[11px] capitalize shrink-0">{n.priority}</Badge>}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-3">{n.content}</p>
                    <span className="text-[11px] text-gray-400 mt-1 block">{n.published_at ? new Date(n.published_at).toLocaleDateString() : ""}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <p className="text-sm text-gray-400 py-4">No recent news.</p>
          )}
        </TabsContent>

        {/* Reparenting */}
        {hasReparenting && (
          <TabsContent value="reparenting" className="mt-4">
            <Card className="border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] border-l-4" style={{ borderLeftColor: BRAND_GREEN }}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><RefreshCcw className="h-4 w-4" /> Reparenting Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {reparenting?.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">Email:</span>
                    <a href={`mailto:${reparenting.email}`} className="font-medium hover:underline" style={{ color: BRAND_GREEN }}>{reparenting.email}</a>
                  </div>
                )}
                {reparenting?.subject && (
                  <div className="text-sm">
                    <span className="text-gray-500">Subject Line:</span>
                    <span className="ml-2 font-medium text-gray-800">{reparenting.subject}</span>
                  </div>
                )}
                {reparenting?.template && (
                  <div className="text-sm">
                    <span className="text-gray-500 block mb-1">Template / Notes:</span>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 text-gray-700 text-xs whitespace-pre-line">{reparenting.template}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
