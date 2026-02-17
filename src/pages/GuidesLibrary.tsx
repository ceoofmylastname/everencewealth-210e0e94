import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, BookOpen } from "lucide-react";

export default function GuidesLibrary() {
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

  return (
    <main className="min-h-screen bg-background">
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

      <section className="max-w-6xl mx-auto px-4 py-12">
        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">Loading guides...</div>
        ) : !brochures?.length ? (
          <div className="text-center py-20">
            <BookOpen className="mx-auto h-16 w-16 text-muted-foreground/30" />
            <p className="mt-4 text-muted-foreground">Guides coming soon</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {brochures.map((b) => (
              <Link
                key={b.id}
                to={`/guides/${b.slug}`}
                className="group border rounded-lg overflow-hidden bg-card hover:shadow-lg transition-shadow"
              >
                {b.cover_image_url && (
                  <img
                    src={b.cover_image_url}
                    alt={b.cover_image_alt || b.title}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                )}
                <div className="p-5 space-y-3">
                  <Badge variant="outline" className="capitalize text-xs">
                    {b.category?.replace(/_/g, " ")}
                  </Badge>
                  {b.featured && <Badge className="ml-2 text-xs">Staff Pick</Badge>}
                  <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                    {b.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{b.meta_description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                    <span className="flex items-center gap-1"><Download className="h-3 w-3" /> {b.download_count ?? 0} downloads</span>
                    <span>{Array.isArray(b.sections) ? (b.sections as unknown[]).length : 0} chapters</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
