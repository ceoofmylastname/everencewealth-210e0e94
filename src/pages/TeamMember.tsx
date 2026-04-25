import { useEffect, useMemo } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { supabase } from "@/integrations/supabase/client";
import { BUSINESS } from "@/config/business";

const BASE_URL = "https://www.everencewealth.com";

// Phase 3 ships with a single founder bio. Slug -> author UUID lookup keeps
// the route open for additional team members later without requiring schema
// changes to authors.
const SLUG_TO_AUTHOR_ID: Record<string, string> = {
  "steven-rosenberg": "1a709766-817f-45b4-aea6-06f8e4fc8d6c",
};

interface AuthorRecord {
  id: string;
  name: string;
  job_title: string | null;
  bio: string | null;
  bio_short: string | null;
  bio_full_markdown: string | null;
  photo_url: string | null;
  linkedin_url: string | null;
  credentials: string[] | null;
  years_experience: number | null;
}

const COPY = {
  en: {
    breadcrumbHome: "Home",
    breadcrumbTeam: "Our Team",
    aboutHeading: "About",
    credentialsHeading: "Credentials",
    experienceLabel: (n: number) => `${n}+ years of experience`,
    ctaHeading: "Schedule a free 30-minute consultation",
    ctaBody:
      "Talk through your retirement income, tax exposure, and asset protection with Steven directly. No sales pressure — just a clear look at whether the Everence Wealth approach fits your goals.",
    ctaButton: "Book a consultation",
    linkedinLabel: "LinkedIn profile",
  },
  es: {
    breadcrumbHome: "Inicio",
    breadcrumbTeam: "Nuestro Equipo",
    aboutHeading: "Acerca de",
    credentialsHeading: "Credenciales",
    experienceLabel: (n: number) => `${n}+ años de experiencia`,
    ctaHeading: "Agende una consulta gratuita de 30 minutos",
    ctaBody:
      "Revise su ingreso de jubilación, exposición fiscal y protección de activos directamente con Steven. Sin presión de ventas — solo una evaluación clara de si el enfoque de Everence Wealth se ajusta a sus objetivos.",
    ctaButton: "Reservar una consulta",
    linkedinLabel: "Perfil de LinkedIn",
  },
} as const;

function renderMarkdownParagraphs(markdown: string) {
  // The bio_full_markdown column currently stores plain paragraphs separated
  // by blank lines. No inline markdown features are used yet, so a simple
  // paragraph split is enough — and avoids pulling in a markdown dep just for
  // this page.
  return markdown
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

const TeamMember = () => {
  const { lang, slug } = useParams<{ lang: string; slug: string }>();
  const language: "en" | "es" = lang === "es" ? "es" : "en";
  const copy = COPY[language];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const authorId = slug ? SLUG_TO_AUTHOR_ID[slug] : undefined;

  const { data: author, isLoading } = useQuery({
    queryKey: ["team-member", authorId],
    queryFn: async () => {
      if (!authorId) return null;
      const { data, error } = await supabase
        .from("authors")
        .select(
          "id, name, job_title, bio, bio_short, bio_full_markdown, photo_url, linkedin_url, credentials, years_experience"
        )
        .eq("id", authorId)
        .maybeSingle();
      if (error) throw error;
      return data as AuthorRecord | null;
    },
    enabled: Boolean(authorId),
    staleTime: 60 * 60 * 1000,
  });

  const personSchema = useMemo(() => {
    if (!author) return null;
    const personUrl = `${BASE_URL}/${language}/team/${slug}/`;
    return {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": `${BASE_URL}/#steven-rosenberg`,
      name: author.name,
      jobTitle: author.job_title || undefined,
      url: personUrl,
      image: author.photo_url || undefined,
      description: author.bio_short || author.bio || undefined,
      worksFor: { "@id": `${BASE_URL}/#organization` },
      sameAs: author.linkedin_url ? [author.linkedin_url] : undefined,
      hasCredential: (author.credentials || []).map((c) => ({
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "professional certification",
        name: c,
      })),
    };
  }, [author, language, slug]);

  if (slug && !authorId) {
    return <Navigate to={`/${language}/team`} replace />;
  }

  const canonicalUrl = `${BASE_URL}/${language}/team/${slug}/`;
  const altLang = language === "en" ? "es" : "en";
  const altUrl = `${BASE_URL}/${altLang}/team/${slug}/`;

  const paragraphs = author?.bio_full_markdown
    ? renderMarkdownParagraphs(author.bio_full_markdown)
    : author?.bio
      ? [author.bio]
      : [];

  const metaTitle = author
    ? `${author.name} | ${author.job_title || "Everence Wealth"}`
    : "Team Member | Everence Wealth";
  const metaDescription =
    author?.bio_short || author?.bio || "Independent wealth strategist at Everence Wealth.";

  return (
    <>
      {personSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      )}

      <div className="min-h-screen bg-background">
        <Helmet>
          <title>{metaTitle}</title>
          <meta name="description" content={metaDescription} />
          <link rel="canonical" href={canonicalUrl} />
          <link rel="alternate" hrefLang={language} href={canonicalUrl} />
          <link rel="alternate" hrefLang={altLang} href={altUrl} />
          <link rel="alternate" hrefLang="x-default" href={`${BASE_URL}/en/team/${slug}/`} />
          <meta property="og:type" content="profile" />
          <meta property="og:title" content={metaTitle} />
          <meta property="og:description" content={metaDescription} />
          <meta property="og:url" content={canonicalUrl} />
          {author?.photo_url && <meta property="og:image" content={author.photo_url} />}
          <meta name="twitter:card" content="summary_large_image" />
        </Helmet>

        <Header />

        <main className="mx-2 md:mx-4 lg:mx-6 py-6 md:py-10" data-author-id={author?.id}>
          <article className="max-w-4xl mx-auto bg-card rounded-3xl shadow-sm p-6 md:p-12">
            <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-6">
              <Link to={`/${language}`} className="hover:underline">
                {copy.breadcrumbHome}
              </Link>
              <span className="mx-2">/</span>
              <Link to={`/${language}/team`} className="hover:underline">
                {copy.breadcrumbTeam}
              </Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">{author?.name || "—"}</span>
            </nav>

            <header className="flex flex-col md:flex-row gap-6 md:gap-10 items-start mb-10">
              {author?.photo_url && (
                <img
                  src={author.photo_url}
                  alt={author.name}
                  className="w-32 h-32 md:w-44 md:h-44 rounded-2xl object-cover border border-border shadow-sm"
                  loading="eager"
                />
              )}
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                  {author?.name || (isLoading ? "Loading…" : "Team Member")}
                </h1>
                {author?.job_title && (
                  <p className="mt-2 text-lg text-muted-foreground">{author.job_title}</p>
                )}
                {author?.years_experience ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {copy.experienceLabel(author.years_experience)}
                  </p>
                ) : null}
                {author?.linkedin_url && (
                  <a
                    href={author.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer me"
                    className="inline-block mt-3 text-primary underline text-sm"
                  >
                    {copy.linkedinLabel}
                  </a>
                )}
              </div>
            </header>

            {paragraphs.length > 0 && (
              <section className="prose prose-neutral max-w-none mb-10">
                <h2 className="text-2xl font-semibold mb-4">
                  {copy.aboutHeading} {author?.name?.split(" ")[0]}
                </h2>
                {paragraphs.map((p, i) => (
                  <p key={i} className="mb-4 leading-relaxed text-foreground/90">
                    {p}
                  </p>
                ))}
              </section>
            )}

            {author?.credentials && author.credentials.length > 0 && (
              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4">{copy.credentialsHeading}</h2>
                <ul className="space-y-2">
                  {author.credentials.map((c) => (
                    <li
                      key={c}
                      className="flex items-start gap-2 text-foreground/90"
                    >
                      <span className="text-primary mt-1">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <aside className="rounded-2xl bg-muted/40 p-6 md:p-8 border border-border">
              <h2 className="text-xl md:text-2xl font-semibold mb-2">{copy.ctaHeading}</h2>
              <p className="text-muted-foreground mb-4">{copy.ctaBody}</p>
              <Link
                to={`/${language}/contact`}
                className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-5 py-3 font-medium hover:opacity-90 transition"
              >
                {copy.ctaButton}
              </Link>
            </aside>
          </article>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default TeamMember;