import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

/**
 * Retirement Income Calculator hub page (PROMPT 27 Fix 1C).
 *
 * Hydrates over the SSR'd intro produced by
 * scripts/generateStaticCalculatorPage.ts. The SSR copy lives outside React
 * and supplies indexable body content for crawlers; this component renders
 * an interactive 3-input projection beneath it for live users.
 */

type Lang = "en" | "es";

const COPY: Record<Lang, {
  title: string;
  description: string;
  h1: string;
  intro: string;
  longIntro: string;
  labels: {
    currentAge: string;
    retireAge: string;
    currentSavings: string;
    monthlyContribution: string;
    expectedReturn: string;
    targetMonthlyIncome: string;
    portfolioAtRetirement: string;
    sustainableMonthly: string;
    monthlyGap: string;
    cta: string;
    disclaimer: string;
  };
}> = {
  en: {
    title: "Retirement Income Calculator | Everence Wealth",
    description:
      "Project tax-free retirement income from current savings, 401(k), and Social Security. Map the gap between your projection and target lifestyle.",
    h1: "Retirement Income Calculator",
    intro:
      "The Everence Wealth Retirement Income Calculator projects how much tax-free retirement income your current savings, 401(k), and Social Security will produce, then maps the gap against your target lifestyle. Inputs include current age, target retirement age, current savings, monthly contribution, expected return assumption, and target monthly retirement income. Output shows projected portfolio value at retirement, sustainable monthly withdrawal at the 4% rule, and the dollar gap to close.",
    longIntro:
      "Designed by Steven Rosenberg, an independent wealth strategist licensed in 50 states. The calculator uses standard sequence-of-returns assumptions and does not factor advanced strategies like Indexed Universal Life cash value, Roth conversion timing, or annuity laddering. For a personalized strategy that incorporates those, schedule a 30-minute consultation after running your calculation.",
    labels: {
      currentAge: "Current age",
      retireAge: "Retirement age",
      currentSavings: "Current savings ($)",
      monthlyContribution: "Monthly contribution ($)",
      expectedReturn: "Expected annual return (%)",
      targetMonthlyIncome: "Target monthly retirement income ($)",
      portfolioAtRetirement: "Projected portfolio at retirement",
      sustainableMonthly: "Sustainable monthly income (4% rule)",
      monthlyGap: "Monthly income gap",
      cta: "Schedule a 30-minute consultation",
      disclaimer:
        "Estimates only. Not advice. Actual results depend on tax treatment, sequence of returns, and personal circumstances.",
    },
  },
  es: {
    title: "Calculadora de Ingresos de Jubilación | Everence Wealth",
    description:
      "Proyecte ingresos libres de impuestos en la jubilación a partir de ahorros, 401(k) y Seguro Social. Mapee la brecha contra el estilo de vida deseado.",
    h1: "Calculadora de Ingresos de Jubilación",
    intro:
      "La Calculadora de Ingresos de Jubilación de Everence Wealth proyecta cuántos ingresos libres de impuestos producirán sus ahorros actuales, 401(k) y Seguro Social, y luego mapea la brecha contra el estilo de vida deseado. Las entradas incluyen edad actual, edad objetivo de jubilación, ahorros actuales, contribución mensual, supuesto de retorno esperado e ingresos mensuales objetivo. La salida muestra el valor proyectado del portafolio al jubilarse, el retiro mensual sostenible bajo la regla del 4% y la brecha en dólares por cerrar.",
    longIntro:
      "Diseñada por Steven Rosenberg, asesor independiente de patrimonio con licencia en los 50 estados. La calculadora usa supuestos estándar de secuencia de retornos y no incluye estrategias avanzadas como el valor en efectivo del Seguro Universal Indexado, momento de conversiones Roth o escaleras de anualidades. Para una estrategia personalizada que las incorpore, agende una consulta de 30 minutos tras correr el cálculo.",
    labels: {
      currentAge: "Edad actual",
      retireAge: "Edad de jubilación",
      currentSavings: "Ahorros actuales ($)",
      monthlyContribution: "Contribución mensual ($)",
      expectedReturn: "Retorno anual esperado (%)",
      targetMonthlyIncome: "Ingreso mensual objetivo ($)",
      portfolioAtRetirement: "Portafolio proyectado al jubilarse",
      sustainableMonthly: "Ingreso mensual sostenible (regla 4%)",
      monthlyGap: "Brecha mensual de ingresos",
      cta: "Agendar consulta de 30 minutos",
      disclaimer:
        "Solo estimaciones. No es asesoría. Los resultados reales dependen del tratamiento fiscal, la secuencia de retornos y circunstancias personales.",
    },
  },
};

function fmtUSD(n: number): string {
  if (!isFinite(n)) return "$0.00";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function Calculator() {
  const params = useParams<{ lang?: string }>();
  const lang: Lang = params.lang === "es" ? "es" : "en";
  const copy = COPY[lang];

  const [currentAge, setCurrentAge] = useState(35);
  const [retireAge, setRetireAge] = useState(65);
  const [currentSavings, setCurrentSavings] = useState(50000);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [expectedReturn, setExpectedReturn] = useState(7);
  const [targetMonthly, setTargetMonthly] = useState(5000);

  const result = useMemo(() => {
    const years = Math.max(0, retireAge - currentAge);
    const r = expectedReturn / 100 / 12;
    const n = years * 12;
    const fvLump = currentSavings * Math.pow(1 + r, n);
    const fvContrib = r > 0 ? monthlyContribution * ((Math.pow(1 + r, n) - 1) / r) : monthlyContribution * n;
    const portfolio = fvLump + fvContrib;
    const sustainable = (portfolio * 0.04) / 12;
    const gap = Math.max(0, targetMonthly - sustainable);
    return { portfolio, sustainable, gap };
  }, [currentAge, retireAge, currentSavings, monthlyContribution, expectedReturn, targetMonthly]);

  // After hydration, replace any SSR placeholder if present.
  useEffect(() => {
    const mount = document.getElementById("calculator-mount");
    if (mount && mount.children.length === 1 && mount.children[0].tagName === "P") {
      mount.innerHTML = "";
    }
  }, []);

  const canonical = `https://www.everencewealth.com/${lang}/calculator/`;

  useEffect(() => {
    document.title = copy.title;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", copy.description);
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", canonical);
  }, [copy.title, copy.description, canonical]);

  return (
    <>
      <main className="ssr-calculator-intro mx-auto max-w-3xl px-4 py-12">
        <header className="mb-8">
          <h1 className="font-display text-4xl font-semibold text-foreground mb-4">{copy.h1}</h1>
          <div className="speakable-summary speakable-answer text-muted-foreground" id="speakable-summary">
            <p>{copy.intro}</p>
          </div>
          <p className="text-muted-foreground mt-4">{copy.longIntro}</p>
        </header>

        <section
          id="calculator-mount"
          className="rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <NumInput label={copy.labels.currentAge} value={currentAge} onChange={setCurrentAge} min={18} max={80} />
            <NumInput label={copy.labels.retireAge} value={retireAge} onChange={setRetireAge} min={40} max={90} />
            <NumInput label={copy.labels.currentSavings} value={currentSavings} onChange={setCurrentSavings} min={0} step={1000} />
            <NumInput label={copy.labels.monthlyContribution} value={monthlyContribution} onChange={setMonthlyContribution} min={0} step={50} />
            <NumInput label={copy.labels.expectedReturn} value={expectedReturn} onChange={setExpectedReturn} min={0} max={15} step={0.1} />
            <NumInput label={copy.labels.targetMonthlyIncome} value={targetMonthly} onChange={setTargetMonthly} min={0} step={100} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
            <Stat label={copy.labels.portfolioAtRetirement} value={fmtUSD(result.portfolio)} />
            <Stat label={copy.labels.sustainableMonthly} value={fmtUSD(result.sustainable)} />
            <Stat label={copy.labels.monthlyGap} value={fmtUSD(result.gap)} highlight={result.gap > 0} />
          </div>

          <p className="text-xs text-muted-foreground mt-6">{copy.labels.disclaimer}</p>

          <a
            href={`/${lang}/contact/`}
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-3 font-medium text-primary-foreground transition hover:opacity-90"
          >
            {copy.labels.cta}
          </a>
        </section>
      </main>
    </>
  );
}

function NumInput({
  label, value, onChange, min, max, step = 1,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded-lg border border-border bg-background px-3 py-2 text-foreground"
      />
    </label>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? "border-primary bg-primary/5" : "border-border bg-muted/30"}`}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-semibold text-foreground">{value}</div>
    </div>
  );
}