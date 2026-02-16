import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Star, ExternalLink, Shield, Building2, X } from "lucide-react";

const ALL_PRODUCTS = ["Term", "WL", "IUL", "FE", "Annuity", "DI", "LTC"];
const ALL_NICHES = [
  "senior", "final_expense", "simplified_issue", "fast_approval",
  "no_exam", "digital", "high_net_worth", "smoker", "diabetes",
  "accelerated_underwriting", "annuity", "preferred",
];

const getRatingColor = (rating: string | null) => {
  if (!rating) return "";
  if (rating.startsWith("A+")) return "bg-green-100 text-green-800 border-green-200";
  if (rating.startsWith("A")) return "bg-blue-100 text-blue-800 border-blue-200";
  if (rating.startsWith("B")) return "bg-yellow-100 text-yellow-800 border-yellow-200";
  return "";
};

export default function CarrierDirectory() {
  const [carriers, setCarriers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("carriers").select("*").order("carrier_name").then(({ data }) => {
      setCarriers(data ?? []);
      setLoading(false);
    });
  }, []);

  const hasFilters = search || selectedProducts.length > 0 || selectedNiches.length > 0;

  const filtered = carriers.filter(c => {
    const matchesSearch = !search ||
      c.carrier_name.toLowerCase().includes(search.toLowerCase()) ||
      (c.notes ?? "").toLowerCase().includes(search.toLowerCase());

    const matchesProducts = selectedProducts.length === 0 ||
      selectedProducts.some(p => (c.products_offered ?? []).includes(p));

    const matchesNiches = selectedNiches.length === 0 ||
      selectedNiches.some(n => (c.niches ?? []).includes(n));

    return matchesSearch && matchesProducts && matchesNiches;
  });

  const toggleProduct = (p: string) =>
    setSelectedProducts(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  const toggleNiche = (n: string) =>
    setSelectedNiches(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]);

  const clearFilters = () => {
    setSearch("");
    setSelectedProducts([]);
    setSelectedNiches([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
          Carrier Directory
        </h1>
        <p className="text-muted-foreground mt-1">
          Browse {carriers.length} partnered carriers and their product offerings.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search carriers by name or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Products</p>
          <div className="flex flex-wrap gap-2">
            {ALL_PRODUCTS.map(p => (
              <Badge
                key={p}
                variant={selectedProducts.includes(p) ? "default" : "outline"}
                className="cursor-pointer select-none"
                onClick={() => toggleProduct(p)}
              >
                {p}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Specialties</p>
          <div className="flex flex-wrap gap-2">
            {ALL_NICHES.map(n => (
              <Badge
                key={n}
                variant={selectedNiches.includes(n) ? "default" : "outline"}
                className="cursor-pointer select-none"
                onClick={() => toggleNiche(n)}
              >
                {n.replace(/_/g, " ")}
              </Badge>
            ))}
          </div>
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
            <X className="h-3 w-3 mr-1" /> Clear All Filters
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground font-medium">No carriers match your filters</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(carrier => (
            <Card key={carrier.id} className="hover:shadow-md transition-shadow h-full flex flex-col">
              <CardContent className="p-5 flex flex-col flex-1">
                {/* Header row */}
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
                      <p className="font-semibold text-foreground">
                        {carrier.carrier_name}
                        {carrier.short_code && (
                          <span className="text-xs text-muted-foreground ml-1">({carrier.short_code})</span>
                        )}
                      </p>
                    </div>
                  </div>
                  {carrier.featured && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 shrink-0" />}
                </div>

                {/* AM Best */}
                {carrier.am_best_rating && (
                  <Badge variant="outline" className={`text-xs w-fit mb-2 ${getRatingColor(carrier.am_best_rating)}`}>
                    AM Best: {carrier.am_best_rating}
                  </Badge>
                )}

                {/* Products */}
                {carrier.products_offered && carrier.products_offered.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {carrier.products_offered.map((p: string) => (
                      <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
                    ))}
                  </div>
                )}

                {/* Description */}
                {carrier.notes && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{carrier.notes}</p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 mt-auto pt-2">
                  <Link to={`/portal/advisor/carriers/${carrier.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs">View Details</Button>
                  </Link>
                  {carrier.portal_url && (
                    <a href={carrier.portal_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm" className="text-xs">
                        <ExternalLink className="h-3 w-3 mr-1" /> Portal
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
