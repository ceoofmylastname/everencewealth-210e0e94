import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExternalLink, Calculator, Wrench, Search, Lock, ChevronDown, ChevronUp, DollarSign, TrendingUp, Calendar } from "lucide-react";

import IULvs401k from "./calculators/IULvs401k";
import InflationImpact from "./calculators/InflationImpact";
import RetirementGap from "./calculators/RetirementGap";
import SocialSecurityEstimator from "./calculators/SocialSecurityEstimator";
import RMDCalculator from "./calculators/RMDCalculator";
import LifeExpectancy from "./calculators/LifeExpectancy";
import TaxBucketOptimizer from "./calculators/TaxBucketOptimizer";
import EstateTaxCalculator from "./calculators/EstateTaxCalculator";

const BRAND_GREEN = "#1A4D3E";

const CALC_COMPONENTS: Record<string, React.ComponentType<{ onClose: () => void }>> = {
  "IUL vs 401k Comparison": IULvs401k,
  "Inflation Impact Calculator": InflationImpact,
  "Retirement Gap Calculator": RetirementGap,
  "Social Security Estimator": SocialSecurityEstimator,
  "RMD Calculator": RMDCalculator,
  "Life Expectancy Calculator": LifeExpectancy,
  "Tax Bucket Optimizer": TaxBucketOptimizer,
  "Estate Tax Calculator": EstateTaxCalculator,
};

const CALC_TIME: Record<string, string> = {
  "IUL vs 401k Comparison": "~3 min",
  "Inflation Impact Calculator": "~1 min",
  "Retirement Gap Calculator": "~2 min",
  "Social Security Estimator": "~2 min",
  "RMD Calculator": "~2 min",
  "Life Expectancy Calculator": "~1 min",
  "Tax Bucket Optimizer": "~2 min",
  "Estate Tax Calculator": "~2 min",
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  cash_flow: { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  retirement: { bg: "#ECFDF5", text: "#065F46", border: "#6EE7B7" },
  life_income: { bg: "#FDF4FF", text: "#7E22CE", border: "#E9D5FF" },
  tax_planning: { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  estate_planning: { bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE" },
};

const TOOL_TYPES = [
  { key: "quick_quote", label: "Quick Quote" }, { key: "agent_portal", label: "Agent Portal" },
  { key: "microsite", label: "Microsite" }, { key: "illustration_system", label: "Illustration System" },
  { key: "application_portal", label: "Application Portal" },
];

const CALC_CATEGORIES = [
  { key: "cash_flow", label: "Cash Flow", icon: DollarSign },
  { key: "retirement", label: "Retirement", icon: Calendar },
  { key: "life_income", label: "Life & Income", icon: TrendingUp },
  { key: "tax_planning", label: "Tax Planning", icon: Calculator },
  { key: "estate_planning", label: "Estate Planning", icon: Calculator },
];

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border ${active ? "text-white border-transparent" : "border-gray-200 text-gray-600 bg-white hover:bg-gray-50"}`}
      style={active ? { background: BRAND_GREEN } : {}}>
      {label}
    </button>
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

  useEffect(() => {
    Promise.all([
      supabase.from("quoting_tools").select("*, carriers(carrier_name, carrier_logo_url)").order("tool_name"),
      supabase.from("calculators").select("*").eq("active", true).order("sort_order"),
    ]).then(([t, c]) => { setTools(t.data ?? []); setCalculators(c.data ?? []); setLoading(false); });
  }, []);

  const filteredTools = useMemo(() => {
    let result = tools;
    if (searchQuery) { const q = searchQuery.toLowerCase(); result = result.filter(t => t.tool_name?.toLowerCase().includes(q) || t.carriers?.carrier_name?.toLowerCase().includes(q)); }
    if (selectedType) result = result.filter(t => t.tool_type === selectedType);
    return result;
  }, [tools, searchQuery, selectedType]);

  const handleOpenCalculator = (calcName: string) => {
    const component = CALC_COMPONENTS[calcName];
    if (component) setOpenCalculator({ name: calcName, component });
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: BRAND_GREEN, borderTopColor: "transparent" }} />
    </div>
  );

  const ActiveCalculator = openCalculator?.component;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tools Hub</h1>
        <p className="text-sm text-gray-500 mt-0.5">Access quoting tools and financial calculators.</p>
      </div>

      {/* Calculator Modal */}
      <Dialog open={!!openCalculator} onOpenChange={(open) => { if (!open) setOpenCalculator(null); }}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: `${BRAND_GREEN}15` }}>
                <Calculator className="h-4 w-4" style={{ color: BRAND_GREEN }} />
              </div>
              <DialogTitle className="text-gray-900 text-base font-semibold">{openCalculator?.name}</DialogTitle>
            </div>
          </DialogHeader>
          <div className="p-6">
            {ActiveCalculator && <ActiveCalculator onClose={() => setOpenCalculator(null)} />}
          </div>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="quoting">
        <TabsList className="bg-gray-100 rounded-lg p-1">
          <TabsTrigger value="quoting" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 text-gray-500">
            <Wrench className="h-4 w-4 mr-1" />Quoting Tools
          </TabsTrigger>
          <TabsTrigger value="calculators" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 text-gray-500">
            <Calculator className="h-4 w-4 mr-1" />Calculators
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quoting" className="mt-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by tool or carrier name…"
              className="pl-9 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 rounded-lg" />
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterChip label="All" active={selectedType === null} onClick={() => setSelectedType(null)} />
            {TOOL_TYPES.map(tt => <FilterChip key={tt.key} label={tt.label} active={selectedType === tt.key} onClick={() => setSelectedType(selectedType === tt.key ? null : tt.key)} />)}
          </div>
          {filteredTools.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm text-center py-12">
              <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No tools match your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTools.map(t => (
                <div key={t.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md hover:border-gray-200 transition-all">
                  <div className="flex items-center gap-3">
                    {t.carriers?.carrier_logo_url ? (
                      <img src={t.carriers.carrier_logo_url} alt={t.carriers.carrier_name} className="h-8 w-8 object-contain rounded bg-gray-50" />
                    ) : (
                      <div className="h-8 w-8 rounded flex items-center justify-center" style={{ background: `${BRAND_GREEN}15` }}>
                        <Wrench className="h-4 w-4" style={{ color: BRAND_GREEN }} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{t.tool_name}</p>
                      {t.carriers?.carrier_name && <p className="text-xs text-gray-400">{t.carriers.carrier_name}</p>}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-xs px-2 py-0.5 rounded-full capitalize bg-gray-100 text-gray-600 border border-gray-200">{t.tool_type?.replace(/_/g, " ")}</span>
                    {t.requires_login && (
                      <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1 text-white" style={{ background: BRAND_GREEN }}>
                        <Lock className="h-3 w-3" /> Login Required
                      </span>
                    )}
                  </div>
                  {t.description && <p className="text-xs text-gray-400 line-clamp-2">{t.description}</p>}
                  <div className="flex-1" />
                  {t.login_instructions && (
                    <div>
                      <button onClick={() => setExpandedInstructions(expandedInstructions === t.id ? null : t.id)}
                        className="text-xs flex items-center gap-1 hover:underline transition-opacity" style={{ color: BRAND_GREEN }}>
                        Login Instructions
                        {expandedInstructions === t.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>
                      {expandedInstructions === t.id && (
                        <p className="text-xs text-gray-500 mt-1 p-2 rounded-lg bg-gray-50 border border-gray-100">{t.login_instructions}</p>
                      )}
                    </div>
                  )}
                  <a href={t.tool_url} target="_blank" rel="noopener noreferrer">
                    <button className="w-full py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}>
                      <ExternalLink className="h-3 w-3" /> Open Tool
                    </button>
                  </a>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="calculators" className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            <FilterChip label="All" active={selectedCategory === null} onClick={() => setSelectedCategory(null)} />
            {CALC_CATEGORIES.map(cat => <FilterChip key={cat.key} label={cat.label} active={selectedCategory === cat.key} onClick={() => setSelectedCategory(selectedCategory === cat.key ? null : cat.key)} />)}
          </div>
          {CALC_CATEGORIES.map(cat => {
            const categoryCalcs = calculators.filter(c => c.category === cat.key);
            if (selectedCategory && selectedCategory !== cat.key) return null;
            if (categoryCalcs.length === 0) return null;
            const Icon = cat.icon;
            const colors = CATEGORY_COLORS[cat.key] || CATEGORY_COLORS.retirement;
            return (
              <div key={cat.key} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" style={{ color: BRAND_GREEN }} />
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">{cat.label}</h3>
                  <span className="text-xs px-1.5 rounded-full text-gray-400 bg-gray-100">{categoryCalcs.length}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {categoryCalcs.map(c => {
                    const CatIcon = cat.icon;
                    const hasComponent = !!CALC_COMPONENTS[c.calculator_name];
                    const timeLabel = CALC_TIME[c.calculator_name] || "~2 min";
                    return (
                      <div key={c.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md hover:border-gray-200 transition-all">
                        <div className="flex items-start gap-3">
                          <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${BRAND_GREEN}15` }}>
                            <CatIcon className="h-5 w-5" style={{ color: BRAND_GREEN }} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-medium text-gray-900">{c.calculator_name}</p>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-xs px-2 py-0.5 rounded-full border font-medium"
                                  style={{ background: colors.bg, color: colors.text, borderColor: colors.border }}>
                                  {cat.label}
                                </span>
                              </div>
                            </div>
                            {c.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{c.description}</p>}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: BRAND_GREEN }} />
                            {timeLabel}
                          </span>
                          {hasComponent && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium text-white" style={{ background: BRAND_GREEN }}>Interactive</span>
                          )}
                        </div>
                        <button
                          onClick={() => handleOpenCalculator(c.calculator_name)}
                          disabled={!hasComponent}
                          className="w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{ background: BRAND_GREEN }}>
                          <Calculator className="h-3.5 w-3.5" />
                          Open Calculator
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
