import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Shield, ArrowRight } from "lucide-react";

export default function CarrierDirectory() {
  const [carriers, setCarriers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("carriers").select("*").order("carrier_name").then(({ data }) => {
      setCarriers(data ?? []);
      setLoading(false);
    });
  }, []);

  const filtered = carriers.filter(c =>
    c.carrier_name.toLowerCase().includes(search.toLowerCase()) ||
    (c.products_offered ?? []).some((p: string) => p.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>Carrier Directory</h1>
        <p className="text-muted-foreground mt-1">Browse all available carriers and their products.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search carriers or products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(carrier => (
            <Link key={carrier.id} to={`/portal/advisor/carriers/${carrier.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {carrier.carrier_logo_url ? (
                        <img src={carrier.carrier_logo_url} alt={carrier.carrier_name} className="h-10 w-10 rounded object-contain" />
                      ) : (
                        <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                          <Shield className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-foreground">{carrier.carrier_name}</p>
                        {carrier.am_best_rating && (
                          <Badge variant="outline" className="text-xs mt-1">AM Best: {carrier.am_best_rating}</Badge>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                  {carrier.products_offered && carrier.products_offered.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {carrier.products_offered.slice(0, 4).map((p: string) => (
                        <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
                      ))}
                      {carrier.products_offered.length > 4 && (
                        <Badge variant="secondary" className="text-xs">+{carrier.products_offered.length - 4}</Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
