import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExternalLink, Calculator, Wrench, Search, Lock, ChevronDown, ChevronUp, DollarSign, TrendingUp, Calendar, Building2, Scale, TrendingDown, Coffee, Heart, Shield, Wallet, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import IULvs401k from "./calculators/IULvs401k";
import InflationImpact from "./calculators/InflationImpact";
import RetirementGap from "./calculators/RetirementGap";
import SocialSecurityEstimator from "./calculators/SocialSecurityEstimator";
import RMDCalculator from "./calculators/RMDCalculator";
import LifeExpectancy from "./calculators/LifeExpectancy";
import TaxBucketOptimizer from "./calculators/TaxBucketOptimizer";
import EstateTaxCalculator from "./calculators/EstateTaxCalculator";
import DebtVsInvesting from "./calculators/DebtVsInvesting";
import PurchasingPower from "./calculators/PurchasingPower";
import InflationRetirement from "./calculators/InflationRetirement";
import HabitsWealth from "./calculators/HabitsWealth";
import LifetimeEarnings from "./calculators/LifetimeEarnings";
import InsuranceLongevity from "./calculators/InsuranceLongevity";
import CommissionCalculator from "./calculators/CommissionCalculator";

const BRAND_GREEN = "#1A4D3E";
const inputCls = "border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 rounded-lg";

const CALC_COMPONENTS: Record<string, React.ComponentType<{ onClose: () => void }>> = {
  "IUL vs 401k Comparison": IULvs401k,
  "Inflation Impact Calculator": InflationImpact,
  "Retirement Gap Calculator": RetirementGap,
  "Social Security Estimator": SocialSecurityEstimator,
  "RMD Calculator": RMDCalculator,
  "Life Expectancy Calculator": LifeExpectancy,
  "Tax Bucket Optimizer": TaxBucketOptimizer,
  "Estate Tax Calculator": EstateTaxCalculator,
  "Debt vs Investing Calculator": DebtVsInvesting,
  "Purchasing Power Calculator": PurchasingPower,
  "Inflation Retirement Calculator": InflationRetirement,
  "Habits to Wealth Calculator": HabitsWealth,
  "Lifetime Earnings Calculator": LifetimeEarnings,
  "Insurance Longevity Calculator": InsuranceLongevity,
  "Commission Calculator": CommissionCalculator,
};

const CALC_TIME: Record<string, string> = {
  "IUL vs 401k Comparison": "~3 min", "Inflation Impact Calculator": "~1 min", "Retirement Gap Calculator": "~2 min",
  "Social Security Estimator": "~2 min", "RMD Calculator": "~2 min", "Life Expectancy Calculator": "~1 min",
  "Tax Bucket Optimizer": "~2 min", "Estate Tax Calculator": "~2 min", "Debt vs Investing Calculator": "~2 min",
  "Purchasing Power Calculator": "~1 min", "Inflation Retirement Calculator": "~2 min", "Habits to Wealth Calculator": "~2 min",
  "Lifetime Earnings Calculator": "~1 min", "Insurance Longevity Calculator": "~2 min", "Commission Calculator": "~2 min",
};

const CATEGORY_META: Record<string, { title: string; tagline: string; disclaimer: string; gradient: string }> = {
  cash_flow: {
    title: "Cash Flow Intelligence",
    tagline: "See what inflation steals — and what strategy protects",
    disclaimer: "Calculations are estimates based on standard models. Actual results vary by circumstances.",
    gradient: "from-blue-500 to-cyan-400",
  },
  retirement: {
    title: "Retirement Intelligence",
    tagline: "Plan the life you want — not the one inflation leaves you",
    disclaimer: "All projections are estimates based on assumptions and averages. Outcomes vary depending on market conditions and personal factors.",
    gradient: "from-emerald-500 to-teal-400",
  },
  life_income: {
    title: "Life & Income",
    tagline: "Build trust through education — not pressure",
    disclaimer: "Estimates are based on averages and assumptions. Actual results vary. This tool is for educational purposes only — not financial advice.",
    gradient: "from-purple-500 to-pink-400",
  },
  tax_planning: {
    title: "Tax Planning",
    tagline: "Optimize your tax strategy across all buckets",
    disclaimer: "Tax estimates are general in nature. Consult a tax professional for advice specific to your situation.",
    gradient: "from-orange-500 to-amber-400",
  },
  estate_planning: {
    title: "Estate Planning",
    tagline: "Protect what you've built for the next generation",
    disclaimer: "Estate tax estimates are based on current federal exemptions. State laws and future changes may affect results.",
    gradient: "from-violet-500 to-indigo-400",
  },
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; accent: string }> = {
  cash_flow: { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE", accent: "#3B82F6" },
  retirement: { bg: "#ECFDF5", text: "#065F46", border: "#6EE7B7", accent: "#10B981" },
  life_income: { bg: "#FDF4FF", text: "#7E22CE", border: "#E9D5FF", accent: "#8B5CF6" },
  tax_planning: { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA", accent: "#F97316" },
  estate_planning: { bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE", accent: "#7C3AED" },
};

const TOOL_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  quick_quote: { bg: "#ECFDF5", text: "#065F46" },
  agent_portal: { bg: "#EFF6FF", text: "#1D4ED8" },
  microsite: { bg: "#FDF4FF", text: "#7E22CE" },
};

const TOOL_TYPES = [
  { key: "quick_quote", label: "Quick Quotes" },
  { key: "agent_portal", label: "Agent Portals" },
  { key: "microsite", label: "Microsites" },
];

const CALC_CATEGORIES = [
  { key: "cash_flow", label: "Cash Flow", icon: DollarSign },
  { key: "retirement", label: "Retirement", icon: Calendar },
  { key: "life_income", label: "Life & Income", icon: TrendingUp },
  { key: "tax_planning", label: "Tax Planning", icon: Calculator },
  { key: "estate_planning", label: "Estate Planning", icon: Calculator },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${active ? "text-white border-transparent shadow-md" : "border-gray-200 text-gray-600 bg-white hover:bg-gray-50 hover:border-gray-300"}`}
      style={active ? { background: BRAND_GREEN, boxShadow: `0 4px 14px ${BRAND_GREEN}40` } : {}}>
      {label}
    </button>
  );
}

function Card3D({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const [transform, setTransform] = useState("perspective(600px) rotateX(0deg) rotateY(0deg)");
  const isTouch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  return (
    <motion.div
      variants={cardVariants}
      whileHover={isTouch ? undefined : { y: -6, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.12)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`${className}`}
      style={isTouch ? undefined : { transform }}
      onMouseMove={isTouch ? undefined : e => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setTransform(`perspective(600px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`);
      }}
      onMouseLeave={isTouch ? undefined : () => setTransform("perspective(600px) rotateX(0deg) rotateY(0deg)")}>
      {children}
    </motion.div>
  );
}

export default function ToolsHub() {
  const [tools, setTools] = useState<any[]>([]);
  const [calculators, setCalculators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [expandedInstructions, setExpandedInstructions] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [openCalculator, setOpenCalculator] = useState<{ name: string; component: React.ComponentType<{ onClose: () => void }> } | null>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const [t, c] = await Promise.all([
      supabase.from("quoting_tools").select("*, carriers(carrier_name, carrier_logo_url)").order("tool_name"),
      supabase.from("calculators").select("*").eq("active", true).order("sort_order"),
    ]);
    setTools(t.data ?? []);
    setCalculators(c.data ?? []);
    setLoading(false);
  }

  const filteredTools = useMemo(() => {
    let result = tools;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => t.tool_name?.toLowerCase().includes(q) || t.carriers?.carrier_name?.toLowerCase().includes(q));
    }
    if (selectedType) result = result.filter(t => t.tool_type === selectedType);
    return result;
  }, [tools, searchQuery, selectedType]);

  const handleOpenCalculator = (calcName: string) => {
    const component = CALC_COMPONENTS[calcName];
    if (component) setOpenCalculator({ name: calcName, component });
  };
  const ActiveCalculator = openCalculator?.component;

  if (loading) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: BRAND_GREEN, borderTopColor: "transparent" }} />
    </div>
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold text-gray-900">Tools Hub</h1>
        <p className="text-sm text-gray-500 mt-0.5">Access quoting tools and financial calculators.</p>
      </motion.div>

      <Dialog open={!!openCalculator} onOpenChange={(open) => { if (!open) setOpenCalculator(null); }}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto p-0 mx-2 sm:mx-auto">
          <DialogHeader className="px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: `${BRAND_GREEN}15` }}>
                <Calculator className="h-4 w-4" style={{ color: BRAND_GREEN }} />
              </div>
              <DialogTitle className="text-gray-900 text-base font-semibold">{openCalculator?.name}</DialogTitle>
            </div>
          </DialogHeader>
          <div className="p-6">{ActiveCalculator && <ActiveCalculator onClose={() => setOpenCalculator(null)} />}</div>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="quoting">
        <TabsList className="bg-gray-100 rounded-lg p-1 w-full sm:w-auto">
          <TabsTrigger value="quoting" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 text-gray-500 py-2.5 sm:py-1.5 flex-1 sm:flex-none touch-manipulation">
            <Wrench className="h-4 w-4 mr-1" />Quoting Tools
          </TabsTrigger>
          <TabsTrigger value="calculators" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 text-gray-500 py-2.5 sm:py-1.5 flex-1 sm:flex-none touch-manipulation">
            <Calculator className="h-4 w-4 mr-1" />Calculators
          </TabsTrigger>
        </TabsList>

        {/* ── QUOTING TAB ── */}
        <TabsContent value="quoting" className="mt-6 space-y-5">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
            <h2 className="text-lg font-bold text-gray-900">
              Quick Access to{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Quote Systems</span>
            </h2>
            <p className="text-sm text-gray-500">Direct links to carrier quoting portals and agent tools for fast client illustrations</p>
          </motion.div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by tool or carrier name…" className={`pl-9 ${inputCls}`} />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <FilterChip label="All" active={selectedType === null} onClick={() => setSelectedType(null)} />
            {TOOL_TYPES.map(tt => (
              <FilterChip key={tt.key} label={tt.label} active={selectedType === tt.key}
                onClick={() => setSelectedType(selectedType === tt.key ? null : tt.key)} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {filteredTools.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="bg-white rounded-xl border border-gray-100 shadow-sm text-center py-12">
                <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No tools match your search.</p>
              </motion.div>
            ) : (
              <motion.div key="grid" variants={containerVariants} initial="hidden" animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTools.map(t => {
                  const typeColor = TOOL_TYPE_COLORS[t.tool_type] || { bg: "#F3F4F6", text: "#374151" };
                  return (
                    <Card3D key={t.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 transition-all">
                      <div className="flex items-center gap-3 min-w-0">
                        {t.carriers?.carrier_logo_url ? (
                          <img src={t.carriers.carrier_logo_url} alt={t.carriers.carrier_name} className="h-10 w-10 object-contain rounded-lg bg-gray-50 p-1" />
                        ) : (
                          <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ background: `${BRAND_GREEN}12` }}>
                            <Building2 className="h-5 w-5" style={{ color: BRAND_GREEN }} />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 truncate">{t.tool_name}</p>
                          {t.carriers?.carrier_name && <p className="text-xs text-gray-400">{t.carriers.carrier_name}</p>}
                        </div>
                        {t.requires_login && (
                          <div className="h-6 w-6 rounded-full flex items-center justify-center bg-amber-100" title="Login Required">
                            <Lock className="h-3 w-3 text-amber-600" />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-xs px-2.5 py-0.5 rounded-full capitalize font-medium"
                          style={{ background: typeColor.bg, color: typeColor.text }}>
                          {t.tool_type?.replace(/_/g, " ")}
                        </span>
                      </div>

                      {t.description && <p className="text-xs text-gray-400 line-clamp-2">{t.description}</p>}
                      <div className="flex-1" />

                      {t.login_instructions && (
                        <div>
                          <button onClick={() => setExpandedInstructions(expandedInstructions === t.id ? null : t.id)}
                            className="text-xs flex items-center gap-1 hover:underline transition-opacity" style={{ color: BRAND_GREEN }}>
                            Login Instructions {expandedInstructions === t.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          </button>
                          {expandedInstructions === t.id && (
                            <p className="text-xs text-gray-500 mt-1 p-2 rounded-lg bg-gray-50 border border-gray-100">{t.login_instructions}</p>
                          )}
                        </div>
                      )}

                      <a href={t.tool_url} target="_blank" rel="noopener noreferrer">
                        <button className="w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 text-white transition-all hover:opacity-90 hover:shadow-md"
                          style={{ background: BRAND_GREEN }}>
                          <ExternalLink className="h-3.5 w-3.5" /> Open Tool
                        </button>
                      </a>
                    </Card3D>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-xs text-gray-400 flex items-center gap-1.5">
            <Lock className="h-3 w-3 text-amber-500" /> Tools with a lock icon require carrier agent credentials to access.
          </p>
        </TabsContent>

        {/* ── CALCULATORS TAB ── */}
        <TabsContent value="calculators" className="mt-6 space-y-6">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <FilterChip label="All" active={selectedCategory === null} onClick={() => setSelectedCategory(null)} />
            {CALC_CATEGORIES.map(cat => (
              <FilterChip key={cat.key} label={cat.label} active={selectedCategory === cat.key}
                onClick={() => setSelectedCategory(selectedCategory === cat.key ? null : cat.key)} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {CALC_CATEGORIES.map(cat => {
              const categoryCalcs = calculators.filter(c => c.category === cat.key);
              if (selectedCategory && selectedCategory !== cat.key) return null;
              if (categoryCalcs.length === 0) return null;
              const meta = CATEGORY_META[cat.key] || CATEGORY_META.retirement;
              const colors = CATEGORY_COLORS[cat.key] || CATEGORY_COLORS.retirement;
              const Icon = cat.icon;

              return (
                <motion.div key={cat.key} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="space-y-4">
                  {/* Category Header */}
                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center shadow-lg`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{meta.title}</h3>
                      <p className="text-sm text-gray-500 italic">"{meta.tagline}"</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full text-gray-400 bg-gray-100 ml-auto">{categoryCalcs.length}</span>
                  </div>

                  {/* Calculator Cards */}
                  <motion.div variants={containerVariants} initial="hidden" animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {categoryCalcs.map(c => {
                      const hasComponent = !!CALC_COMPONENTS[c.calculator_name];
                      const timeLabel = CALC_TIME[c.calculator_name] || "~2 min";

                      return (
                        <Card3D key={c.id}
                          className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-all">
                          {/* Gradient accent bar */}
                          <div className={`h-1 bg-gradient-to-r ${meta.gradient}`} />

                          <div className="p-5 flex flex-col gap-3 flex-1">
                            <div className="flex items-start gap-3">
                              <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                                style={{ background: `${colors.accent}18` }}>
                                <Icon className="h-5 w-5" style={{ color: colors.accent }} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="font-semibold text-gray-900">{c.calculator_name}</p>
                                  <span className="text-xs px-2 py-0.5 rounded-full border font-medium shrink-0"
                                    style={{ background: colors.bg, color: colors.text, borderColor: colors.border }}>
                                    {cat.label}
                                  </span>
                                </div>
                                {c.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{c.description}</p>}
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-auto">
                              <span className="text-xs text-gray-400 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full inline-block animate-pulse" style={{ background: colors.accent }} />
                                {timeLabel}
                              </span>
                              {hasComponent && (
                                <span className="text-xs px-2 py-0.5 rounded-full font-medium text-white" style={{ background: BRAND_GREEN }}>
                                  Interactive
                                </span>
                              )}
                            </div>

                            <button onClick={() => handleOpenCalculator(c.calculator_name)} disabled={!hasComponent}
                              className="w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 text-white transition-all hover:opacity-90 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                              style={{ background: BRAND_GREEN }}>
                              <Calculator className="h-3.5 w-3.5" />Open Calculator
                            </button>
                          </div>
                        </Card3D>
                      );
                    })}
                  </motion.div>

                  {/* Category Disclaimer */}
                  <p className="text-xs text-gray-400 italic pl-1">* {meta.disclaimer}</p>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
}
