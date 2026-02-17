import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, MapPin, FileText, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import usMapHero from "@/assets/us-map-hero.png";

interface StateGuide {
  state_code: string;
  city_name: string; // state name stored here
  topic_slug: string;
  headline: string;
  meta_description: string;
  featured_image_url: string | null;
  status: string;
}

const US_STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri",
  MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
  OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

const StateGuidesIndex = () => {
  const { lang = "en" } = useParams<{ lang: string }>();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const { data: guides = [], isLoading } = useQuery({
    queryKey: ["state-guides", lang],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("location_pages")
        .select("state_code, city_name, topic_slug, headline, meta_description, featured_image_url, status")
        .not("state_code", "is", null)
        .eq("status", "published")
        .eq("language", lang)
        .order("city_name", { ascending: true });

      if (error) throw error;
      return (data || []) as StateGuide[];
    },
  });

  // Group guides by state
  const stateMap = new Map<string, StateGuide[]>();
  guides.forEach((g) => {
    const existing = stateMap.get(g.state_code) || [];
    existing.push(g);
    stateMap.set(g.state_code, existing);
  });

  const states = Array.from(stateMap.entries()).sort((a, b) => {
    const nameA = US_STATE_NAMES[a[0]] || a[0];
    const nameB = US_STATE_NAMES[b[0]] || b[0];
    return nameA.localeCompare(nameB);
  });

  const isEn = lang === "en";
  const title = isEn ? "State-Specific Financial Guides | Everence Wealth" : "Guías Financieras por Estado | Everence Wealth";
  const description = isEn
    ? "Explore state-specific retirement planning, tax strategies, and financial guides tailored to your state's unique regulations and opportunities."
    : "Explore guías de planificación de jubilación, estrategias fiscales y guías financieras adaptadas a las regulaciones y oportunidades de su estado.";

  return (
    <>
      <Helmet>
        <html lang={lang} />
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`https://everencewealth.com/${lang}/retirement-planning`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
      </Helmet>

      <Header variant="solid" />

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a2a1f] via-[#1A4D3E] to-[#0d1f1a]">
            {/* US Map Background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-30 mix-blend-screen">
              <img src={usMapHero} alt="" aria-hidden="true" className="w-full h-full object-contain max-w-4xl mx-auto" />
            </div>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C5A059]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-[#C5A059]/8 rounded-full blur-3xl" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
          </div>

          <div className="container mx-auto px-4 relative z-10 text-center pt-24 pb-16">
            {/* Breadcrumbs */}
            <nav
              aria-label="Breadcrumb"
              className={`mb-8 transition-all duration-700 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <ol className="flex items-center justify-center gap-2 text-sm text-white/70">
                <li>
                  <Link to={`/${lang}`} className="hover:text-primary transition-colors">
                    {isEn ? "Home" : "Inicio"}
                  </Link>
                </li>
                <ChevronRight className="w-4 h-4" />
                <li className="text-white font-medium">{isEn ? "State Guides" : "Guías por Estado"}</li>
              </ol>
            </nav>

            {/* Badge */}
            <div className={`mb-6 transition-all duration-700 delay-100 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <Badge className="bg-white/10 backdrop-blur-md border-white/20 text-white px-5 py-2.5 text-sm font-medium">
                <MapPin className="w-4 h-4 mr-2" />
                {states.length} {isEn ? "States" : "Estados"} • {guides.length} {isEn ? "Guides" : "Guías"}
              </Badge>
            </div>

            <h1
              className={`text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 leading-[1.1] transition-all duration-1000 delay-200 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              {isEn ? "State-Specific" : "Guías Financieras"}
              <span className="block text-gradient-gold">
                {isEn ? "Financial Guides" : "por Estado"}
              </span>
            </h1>

            <p
              className={`text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto transition-all duration-1000 delay-300 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              {description}
            </p>
          </div>
        </section>

        {/* States Grid */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : states.length === 0 ? (
              <div className="text-center py-16">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
                  {isEn ? "Coming Soon" : "Próximamente"}
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {isEn
                    ? "We're building comprehensive state-specific financial guides. Check back soon."
                    : "Estamos creando guías financieras completas por estado. Vuelva pronto."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {states.map(([stateCode, stateGuides]) => {
                  const stateName = US_STATE_NAMES[stateCode] || stateCode;
                  return (
                    <div
                      key={stateCode}
                      className="group relative rounded-2xl border border-border bg-card p-6 hover:shadow-xl hover:border-primary/30 transition-all duration-300"
                    >
                      {/* State Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-bold text-primary">{stateCode}</span>
                        </div>
                        <div>
                          <h2 className="text-xl font-serif font-bold text-foreground">{stateName}</h2>
                          <p className="text-sm text-muted-foreground">
                            {stateGuides.length} {stateGuides.length === 1 ? (isEn ? "guide" : "guía") : (isEn ? "guides" : "guías")}
                          </p>
                        </div>
                      </div>

                      {/* Guide Links */}
                      <div className="space-y-2">
                        {stateGuides.map((guide) => (
                          <Link
                            key={guide.topic_slug}
                            to={`/${lang}/retirement-planning/${guide.topic_slug}`}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group/link"
                          >
                            <FileText className="w-4 h-4 shrink-0" />
                            <span className="truncate">{guide.headline}</span>
                            <ArrowRight className="w-3 h-3 ml-auto shrink-0 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-background to-primary/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              {isEn ? "Need Personalized Guidance?" : "¿Necesita Orientación Personalizada?"}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              {isEn
                ? "Our fiduciary advisors can help you navigate your state's unique financial landscape."
                : "Nuestros asesores fiduciarios pueden ayudarle a navegar el panorama financiero único de su estado."}
            </p>
            <Button asChild size="lg" className="btn-luxury">
              <Link to={`/${lang}/#contact`}>{isEn ? "Schedule a Consultation" : "Agendar Consulta"}</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default StateGuidesIndex;
