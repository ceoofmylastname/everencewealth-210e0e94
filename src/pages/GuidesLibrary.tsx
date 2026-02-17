import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Download, BookOpen, Search, Star } from "lucide-react";
import { Helmet } from "react-helmet";

const CATEGORIES = [
  { value: "all", label: "All Guides" },
  { value: "tax_planning", label: "Tax Planning" },
  { value: "retirement_strategies", label: "Retirement Strategies" },
  { value: "iul_education", label: "IUL Education" },
  { value: "estate_planning", label: "Estate Planning" },
];

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "downloads", label: "Most Downloaded" },
  { value: "newest", label: "Newest" },
];

export default function GuidesLibrary() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("featured");

  const { data: brochures, isLoading } = useQuery({
    queryKey: ["public-brochures"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brochures")
        .select("id, title, slug, category, meta_description, cover_image_url, cover_image_alt, download_count, featured, sections, tags")
        .eq("status", "published")
        .order("featured", { ascending: false })
        .order("download_count", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    if (!brochures) return [];
    let list = brochures.filter((b) => {
      const matchSearch = !search || b.title.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "all" || b.category === category;
      return matchSearch && matchCat;
    });

    if (sort === "downloads") list.sort((a, b) => (b.download_count ?? 0) - (a.download_count ?? 0));
    else if (sort === "newest") list.sort((a, b) => b.id.localeCompare(a.id));
    else list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

    return list;
  }, [brochures, search, category, sort]);

  const featuredGuides = filtered.filter((b) => b.featured).slice(0, 3);
  const regularGuides = filtered.filter((b) => !featuredGuides.includes(b));

  return (
    <main className="min-h-screen bg-background">
      <Helmet>
        <title>Financial Education Library | Everence Wealth</title>
        <meta name="description" content="Free retirement planning guides covering tax strategies, IUL education, estate planning, and more." />
      </Helmet>

      <section className="bg-[#1A4D3E] text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            Financial Education Library
          </h1>
          <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
            Free guides to help you build tax-free retirement income
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search guides..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  category === c.value
                    ? "bg-[#1A4D3E] text-white border-[#1A4D3E]"
                    : "bg-background text-muted-foreground border-border hover:border-[#1A4D3E]/50"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div className="flex gap-2 mb-6">
          {SORT_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => setSort(s.value)}
              className={`text-xs px-2 py-1 rounded ${
                sort === s.value ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">Loading guides...</div>
        ) : !filtered.length ? (
          <div className="text-center py-20">
            <BookOpen className="mx-auto h-16 w-16 text-muted-foreground/30" />
            <p className="mt-4 text-muted-foreground">No guides found</p>
          </div>
        ) : (
          <>
            {/* Featured */}
            {featuredGuides.length > 0 && (
              <div className="mb-10">
                <h2 className="text-sm font-semibold uppercase text-muted-foreground mb-4 flex items-center gap-1">
                  <Star className="h-3.5 w-3.5" /> Staff Picks
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredGuides.map((b) => (
                    <GuideCard key={b.id} brochure={b} featured />
                  ))}
                </div>
              </div>
            )}

            {/* Regular */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularGuides.map((b) => (
                <GuideCard key={b.id} brochure={b} />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function GuideCard({ brochure: b, featured = false }: { brochure: any; featured?: boolean }) {
  return (
    <Link
      to={`/guides/${b.slug}`}
      className={`group border rounded-lg overflow-hidden bg-card hover:shadow-lg transition-shadow ${
        featured ? "ring-2 ring-amber-500/30" : ""
      }`}
    >
      {b.cover_image_url && (
        <img src={b.cover_image_url} alt={b.cover_image_alt || b.title} className="w-full h-48 object-cover" loading="lazy" />
      )}
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize text-xs">
            {b.category?.replace(/_/g, " ")}
          </Badge>
          {featured && (
            <Badge className="text-xs bg-amber-500/10 text-amber-700 border-amber-500/30">
              <Star className="h-2.5 w-2.5 mr-1" /> Staff Pick
            </Badge>
          )}
        </div>
        <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{b.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{b.meta_description}</p>
        {b.tags && b.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {(b.tags as string[]).slice(0, 3).map((tag: string) => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground">{tag}</span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
          <span className="flex items-center gap-1"><Download className="h-3 w-3" /> {b.download_count ?? 0}</span>
          <span>{Array.isArray(b.sections) ? (b.sections as unknown[]).length : 0} chapters</span>
        </div>
      </div>
    </Link>
  );
}
