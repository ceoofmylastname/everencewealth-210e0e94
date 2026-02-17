import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function GuidePage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: brochure, isLoading } = useQuery({
    queryKey: ["brochure-public", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brochures")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading guide...</div>;
  }

  if (!brochure) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Guide not found</h1>
          <p className="text-muted-foreground mt-2">This guide may not exist or isn't published yet.</p>
        </div>
      </div>
    );
  }

  const sections = Array.isArray(brochure.sections) ? (brochure.sections as Array<{
    section_number: number;
    title: string;
    content: string;
    image_url?: string;
    image_alt?: string;
    image_caption?: string;
  }>) : [];

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-[#1A4D3E] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Badge variant="outline" className="text-white/70 border-white/30 capitalize mb-4">
            {brochure.category?.replace(/_/g, " ")}
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            {brochure.hero_headline}
          </h1>
          {brochure.subtitle && (
            <p className="mt-4 text-lg text-white/80">{brochure.subtitle}</p>
          )}
          <div className="mt-6 flex items-center gap-4">
            <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white">
              <Download className="h-4 w-4 mr-2" /> Download PDF
            </Button>
            <span className="text-sm text-white/60">{brochure.download_count ?? 0} downloads</span>
          </div>
        </div>
      </section>

      {/* Speakable Intro */}
      <section className="max-w-3xl mx-auto px-4 py-10">
        <div itemProp="speakable" className="text-lg leading-relaxed text-muted-foreground border-l-4 border-primary pl-6">
          {brochure.speakable_intro}
        </div>
      </section>

      {/* Table of Contents */}
      {sections.length > 1 && (
        <nav className="max-w-3xl mx-auto px-4 pb-8">
          <h2 className="text-sm font-semibold uppercase text-muted-foreground mb-3">Table of Contents</h2>
          <ol className="space-y-1">
            {sections.map((s, i) => (
              <li key={i}>
                <a href={`#section-${i + 1}`} className="text-primary hover:underline text-sm">
                  {i + 1}. {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Sections */}
      <article className="max-w-3xl mx-auto px-4 pb-16 space-y-12">
        {sections.map((section, idx) => (
          <section key={idx} id={`section-${idx + 1}`} className="scroll-mt-24">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                {idx + 1}
              </span>
              <h2 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                {section.title}
              </h2>
            </div>
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
            {section.image_url && (
              <figure className="mt-6">
                <img
                  src={section.image_url}
                  alt={section.image_alt || section.title}
                  className="w-full rounded-lg"
                  loading="lazy"
                />
                {section.image_caption && (
                  <figcaption className="mt-2 text-sm italic text-muted-foreground text-center">
                    {section.image_caption}
                  </figcaption>
                )}
              </figure>
            )}
          </section>
        ))}
      </article>
    </main>
  );
}
