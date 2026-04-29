import { lazy, Suspense } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";

const BASE_URL = "https://www.everencewealth.com";

type Lang = "en" | "es";

interface StrategyCard {
  title: string;
  href: string;
  description: string;
}

const COPY: Record<Lang, {
  title: string;
  metaDescription: string;
  intro: string;
  cards: StrategyCard[];
  ctaHeading: string;
  ctaBody: string;
  ctaLabel: string;
  ctaHref: string;
  breadcrumbHome: string;
  breadcrumbCurrent: string;
}> = {
  en: {
    title: "Wealth Management Strategies | Everence Wealth",
    metaDescription:
      "Indexed Universal Life, Whole Life, Tax-Free Retirement, and Asset Protection strategies from Everence Wealth — independent advisor licensed in 50 states.",
    intro:
      "Everence Wealth builds tax-advantaged retirement income through four core strategies: Indexed Universal Life (IUL), Whole Life, Tax-Free Retirement planning, and Asset Protection. Each strategy is independently advised by Steven Rosenberg, licensed in 50 states, and structured around the Three Tax Buckets framework.",
    cards: [
      {
        title: "Indexed Universal Life Insurance (IUL)",
        href: "/en/strategies/iul/",
        description:
          "Build cash value tied to market index performance with a 0% floor that protects principal against losses. IUL combines life insurance protection with tax-free retirement income potential, no contribution limits, and no required minimum distributions.",
      },
      {
        title: "Whole Life Insurance",
        href: "/en/strategies/whole-life/",
        description:
          "Permanent life insurance with guaranteed cash value growth, lifetime protection, and dividend potential when issued by a mutual carrier. Stable, contractually guaranteed, and the foundation of many high-net-worth banking strategies.",
      },
      {
        title: "Tax-Free Retirement",
        href: "/en/strategies/tax-free-retirement/",
        description:
          "Build retirement income you will never owe taxes on. Combines Roth conversion timing, cash-value life insurance, and asset location strategy to insulate income from rising tax rates.",
      },
      {
        title: "Asset Protection",
        href: "/en/strategies/asset-protection/",
        description:
          "Shield wealth from lawsuits, creditors, and avoidable taxes. Includes irrevocable life insurance trusts, properly structured annuities, and state-specific creditor-protection planning.",
      },
    ],
    ctaHeading: "Talk to an Independent Advisor",
    ctaBody:
      "Free 30-minute consultation. No sales pressure. We map your retirement gap before recommending any strategy.",
    ctaLabel: "Contact Us",
    ctaHref: "/en/contact/",
    breadcrumbHome: "Home",
    breadcrumbCurrent: "Strategies",
  },
  es: {
    title: "Estrategias de Gestión Patrimonial | Everence Wealth",
    metaDescription:
      "Estrategias de Seguro Universal Indexado, Seguro de Vida Entera, Retiro Libre de Impuestos y Protección de Activos de Everence Wealth — asesor independiente con licencia en los 50 estados.",
    intro:
      "Everence Wealth construye ingresos de jubilación con ventajas fiscales a través de cuatro estrategias principales: Seguro Universal Indexado (IUL), Seguro de Vida Entera, planificación de Retiro Libre de Impuestos y Protección de Activos. Cada estrategia es asesorada de forma independiente por Steven Rosenberg, con licencia en los 50 estados, y estructurada en torno al marco de los Tres Cubos Fiscales.",
    cards: [
      {
        title: "Seguro Universal Indexado (IUL)",
        href: "/es/estrategias/seguro-universal-indexado/",
        description:
          "Acumule valor en efectivo ligado al rendimiento de un índice de mercado con un piso del 0% que protege el capital contra pérdidas. El IUL combina protección de vida con ingresos de jubilación libres de impuestos, sin límites de contribución y sin distribuciones mínimas obligatorias.",
      },
      {
        title: "Seguro de Vida Entera",
        href: "/es/estrategias/seguro-vida-entera/",
        description:
          "Seguro de vida permanente con crecimiento garantizado del valor en efectivo, protección vitalicia y potencial de dividendos cuando es emitido por una aseguradora mutualista. Estable, garantizado contractualmente y base de muchas estrategias de banca personal de alto patrimonio.",
      },
      {
        title: "Retiro Libre de Impuestos",
        href: "/es/estrategias/retiro-libre-impuestos/",
        description:
          "Construya ingresos de jubilación por los que nunca pagará impuestos. Combina el momento óptimo de conversión Roth, seguro de vida con valor en efectivo y estrategia de ubicación de activos para aislar sus ingresos de futuras subidas de impuestos.",
      },
      {
        title: "Protección de Activos",
        href: "/es/estrategias/proteccion-de-activos/",
        description:
          "Proteja su patrimonio de demandas, acreedores e impuestos evitables. Incluye fideicomisos irrevocables de seguro de vida (ILIT), anualidades correctamente estructuradas y planificación de protección frente a acreedores específica por estado.",
      },
    ],
    ctaHeading: "Hable con un asesor independiente",
    ctaBody:
      "Consulta gratuita de 30 minutos. Sin presión comercial. Analizamos su brecha de jubilación antes de recomendar cualquier estrategia.",
    ctaLabel: "Contáctenos",
    ctaHref: "/es/contact/",
    breadcrumbHome: "Inicio",
    breadcrumbCurrent: "Estrategias",
  },
};

function buildJsonLd(lang: Lang) {
  const enHubUrl = `${BASE_URL}/en/strategies/`;
  const esHubUrl = `${BASE_URL}/es/estrategias/`;
  const canonical = lang === "es" ? esHubUrl : enHubUrl;

  return [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${canonical}#webpage`,
      url: canonical,
      name: COPY[lang].title,
      description: COPY[lang].metaDescription,
      inLanguage: lang,
      isPartOf: { "@id": `${BASE_URL}/#website` },
      about: { "@id": `${BASE_URL}/#organization` },
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: [".speakable-answer", "h1"],
      },
      hasPart: COPY[lang].cards.map((c) => ({
        "@type": "FinancialProduct",
        name: c.title,
        url: `${BASE_URL}${c.href}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "@id": `${canonical}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: COPY[lang].breadcrumbHome, item: `${BASE_URL}/${lang}/` },
        { "@type": "ListItem", position: 2, name: COPY[lang].breadcrumbCurrent, item: canonical },
      ],
    },
  ];
}

export default function StrategiesIndex() {
  const { lang: rawLang } = useParams<{ lang: string }>();
  const lang: Lang = rawLang === "es" ? "es" : "en";
  const copy = COPY[lang];
  const canonical = lang === "es" ? `${BASE_URL}/es/estrategias/` : `${BASE_URL}/en/strategies/`;
  const enHref = `${BASE_URL}/en/strategies/`;
  const esHref = `${BASE_URL}/es/estrategias/`;
  const jsonLd = buildJsonLd(lang);

  return (
    <>
      <Helmet>
        <title>{copy.title}</title>
        <meta name="description" content={copy.metaDescription} />
        <link rel="canonical" href={canonical} />
        <link rel="alternate" hrefLang="en" href={enHref} />
        <link rel="alternate" hrefLang="es" href={esHref} />
        <link rel="alternate" hrefLang="x-default" href={enHref} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical} />
        <meta property="og:title" content={copy.title} />
        <meta property="og:description" content={copy.metaDescription} />
        {jsonLd.map((schema, idx) => (
          <script key={idx} type="application/ld+json">
            {JSON.stringify(schema)}
          </script>
        ))}
      </Helmet>

      <Header />

      <main className="min-h-screen bg-background">
        <section className="container mx-auto px-6 py-16 md:py-24">
          <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted-foreground">
            <Link to={`/${lang}/`} className="hover:text-foreground">
              {copy.breadcrumbHome}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{copy.breadcrumbCurrent}</span>
          </nav>

          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
            {copy.breadcrumbCurrent === "Strategies"
              ? "Wealth Management Strategies"
              : "Estrategias de Gestión Patrimonial"}
          </h1>

          <p className="speakable-answer text-lg text-muted-foreground max-w-3xl mb-12">
            {copy.intro}
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            {copy.cards.map((card) => (
              <Link
                key={card.href}
                to={card.href}
                className="block rounded-2xl border border-border bg-card p-8 hover:shadow-lg transition-shadow"
              >
                <h2 className="text-2xl font-semibold text-foreground mb-3">{card.title}</h2>
                <p className="text-muted-foreground">{card.description}</p>
              </Link>
            ))}
          </div>

          <div className="mt-16 rounded-2xl bg-primary/5 border border-primary/20 p-8 text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-3">{copy.ctaHeading}</h2>
            <p className="text-muted-foreground mb-6">{copy.ctaBody}</p>
            <Link
              to={copy.ctaHref}
              className="inline-flex items-center px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:brightness-110 transition"
            >
              {copy.ctaLabel}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}