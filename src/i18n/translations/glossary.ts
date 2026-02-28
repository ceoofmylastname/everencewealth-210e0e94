// Glossary page translations - English and Spanish

export const glossaryTranslations = {
  en: {
    // Loading & errors
    loading: "Loading glossary...",
    loadError: "Failed to load glossary data.",
    
    // Hero section
    badge: "{count}+ Terms Explained",
    headline: "Wealth Management",
    headlineHighlight: "Glossary",
    description: "Your comprehensive guide to financial planning, insurance, retirement, and tax-efficient wealth terminology. Essential knowledge for building and protecting your legacy.",
    searchPlaceholder: "Search terms (e.g., IUL, Annuity, Roth IRA...)",
    
    // E-E-A-T trust signals
    compiledBy: "Compiled by",
    licensedExperts: "Licensed Independent Advisors",
    lastUpdated: "Last updated:",
    verifiedDefinitions: "verified definitions",
    
    // Category tabs
    allTerms: "All Terms",
    
    // Empty state
    noTermsFound: "No terms found matching your search.",
    clearSearch: "Clear search",
    
    // Term cards
    related: "Related:",
    learnMore: "Learn more",
    
    // CTA section
    ctaHeadline: "Ready to Build Your",
    ctaHighlight: "Wealth Strategy?",
    ctaDescription: "Our independent team can guide you through retirement planning, tax optimization, and asset protection. Get personalized advice tailored to your financial goals.",
    ctaButton1: "Explore Our Services",
    ctaButton2: "Schedule a Consultation",
    
    // Categories (for tabs)
    categories: {
      retirement: "Retirement Planning",
      insurance: "Insurance & Protection",
      tax: "Tax Strategy",
      investment: "Investment Terms",
      estate: "Estate Planning",
      general: "General Finance",
    },
    
    // SEO metadata
    meta: {
      title: "Wealth Management Glossary | Financial Terms Explained | Everence Wealth",
      description: "Complete glossary of 60+ financial planning, insurance, retirement, and tax terms. Essential definitions for IUL, 401(k), Roth IRA, annuities, and more from Everence Wealth.",
    }
  },
  es: {
    loading: "Cargando glosario...",
    loadError: "Error al cargar los datos del glosario.",
    badge: "{count}+ Términos Explicados",
    headline: "Gestión Patrimonial",
    headlineHighlight: "Glosario",
    description: "Su guía completa de terminología de planificación financiera, seguros, jubilación y estrategias fiscales eficientes. Conocimiento esencial para construir y proteger su legado.",
    searchPlaceholder: "Buscar términos (ej., IUL, Anualidad, Roth IRA...)",
    compiledBy: "Compilado por",
    licensedExperts: "Asesores Fiduciarios Licenciados",
    lastUpdated: "Última actualización:",
    verifiedDefinitions: "definiciones verificadas",
    allTerms: "Todos los Términos",
    noTermsFound: "No se encontraron términos que coincidan con su búsqueda.",
    clearSearch: "Borrar búsqueda",
    related: "Relacionado:",
    learnMore: "Más información",
    ctaHeadline: "¿Listo para Construir Su",
    ctaHighlight: "Estrategia Patrimonial?",
    ctaDescription: "Nuestro equipo fiduciario puede guiarle en la planificación de jubilación, optimización fiscal y protección de activos. Reciba asesoramiento personalizado según sus objetivos financieros.",
    ctaButton1: "Explorar Nuestros Servicios",
    ctaButton2: "Agendar una Consulta",
    categories: {
      retirement: "Planificación de Jubilación",
      insurance: "Seguros y Protección",
      tax: "Estrategia Fiscal",
      investment: "Términos de Inversión",
      estate: "Planificación Patrimonial",
      general: "Finanzas Generales",
    },
    meta: {
      title: "Glosario de Gestión Patrimonial | Términos Financieros Explicados | Everence Wealth",
      description: "Glosario completo de más de 60 términos de planificación financiera, seguros, jubilación e impuestos. Definiciones esenciales de IUL, 401(k), Roth IRA, anualidades y más de Everence Wealth.",
    }
  },
};

export type GlossaryTranslation = typeof glossaryTranslations.en;
