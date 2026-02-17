import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Share2, Linkedin, Mail, Link as LinkIcon, BookOpen } from "lucide-react";
import { Helmet } from "react-helmet";
import { toast } from "@/hooks/use-toast";
import { EmailGateModal } from "@/components/guides/EmailGateModal";

export default function GuidePage() {
  const { slug } = useParams<{ slug: string }>();
  const [gateOpen, setGateOpen] = useState(false);

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

  const { data: relatedGuides } = useQuery({
    queryKey: ["related-guides", brochure?.category, brochure?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brochures")
        .select("id, title, slug, category, meta_description, cover_image_url, cover_image_alt, download_count")
        .eq("status", "published")
        .eq("category", brochure!.category)
        .neq("id", brochure!.id)
        .limit(3);
      if (error) throw error;
      return data;
    },
    enabled: !!brochure?.category && !!brochure?.id,
  });

  const handleDownload = () => {
    if (brochure?.gated) {
      setGateOpen(true);
    } else if (brochure?.pdf_url) {
      window.open(brochure.pdf_url, "_blank");
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copied!" });
  };

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

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <main className="min-h-screen bg-background">
      <Helmet>
        <title>{brochure.meta_title || brochure.title}</title>
        <meta name="description" content={brochure.meta_description} />
        {brochure.canonical_url && <link rel="canonical" href={brochure.canonical_url} />}
        {brochure.json_ld_schema && (
          <script type="application/ld+json">{JSON.stringify(brochure.json_ld_schema)}</script>
        )}
      </Helmet>

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
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" /> Download PDF
            </Button>
            <span className="text-sm text-white/60">{brochure.download_count ?? 0} downloads</span>
            {/* Share */}
            <div className="flex items-center gap-1 ml-auto">
              <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10" asChild>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10" asChild>
                <a href={`mailto:?subject=${encodeURIComponent(brochure.title)}&body=${encodeURIComponent(shareUrl)}`}>
                  <Mail className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10" onClick={copyLink}>
                <LinkIcon className="h-4 w-4" />
              </Button>
            </div>
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
                <img src={section.image_url} alt={section.image_alt || section.title} className="w-full rounded-lg" loading="lazy" />
                {section.image_caption && (
                  <figcaption className="mt-2 text-sm italic text-muted-foreground text-center">{section.image_caption}</figcaption>
                )}
              </figure>
            )}
          </section>
        ))}
      </article>

      {/* Related Guides */}
      {relatedGuides && relatedGuides.length > 0 && (
        <section className="bg-muted/50 py-12 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>Related Guides</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedGuides.map((g) => (
                <Link key={g.id} to={`/guides/${g.slug}`} className="group border rounded-lg overflow-hidden bg-card hover:shadow-lg transition-shadow">
                  {g.cover_image_url && (
                    <img src={g.cover_image_url} alt={g.cover_image_alt || g.title} className="w-full h-36 object-cover" loading="lazy" />
                  )}
                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold group-hover:text-primary transition-colors">{g.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{g.meta_description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-3 flex items-center justify-between sm:hidden z-40">
        <div className="text-xs text-muted-foreground">
          <Download className="h-3 w-3 inline mr-1" />{brochure.download_count ?? 0} downloads
        </div>
        <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white" onClick={handleDownload}>
          <Download className="h-3 w-3 mr-1" /> Download PDF
        </Button>
      </div>

      <EmailGateModal
        open={gateOpen}
        onOpenChange={setGateOpen}
        brochureId={brochure.id}
        brochureTitle={brochure.title}
        pdfUrl={brochure.pdf_url}
      />
    </main>
  );
}
