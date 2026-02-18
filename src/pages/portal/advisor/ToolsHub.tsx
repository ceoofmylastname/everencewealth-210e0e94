import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Calculator, Wrench, Search, Lock, ChevronDown, ChevronUp, DollarSign, TrendingUp, Calendar } from "lucide-react";

const GOLD = "hsla(51, 78%, 65%, 1)";
const GOLD_BG = "hsla(51, 78%, 65%, 0.12)";
const GOLD_BORDER = "hsla(51, 78%, 65%, 0.3)";
const GLASS = { background: "hsla(160,48%,21%,0.08)", border: "1px solid hsla(0,0%,100%,0.08)", backdropFilter: "blur(16px)" };

const TOOL_TYPES = [
  { key: "quick_quote", label: "Quick Quote" }, { key: "agent_portal", label: "Agent Portal" },
  { key: "microsite", label: "Microsite" }, { key: "illustration_system", label: "Illustration System" },
  { key: "application_portal", label: "Application Portal" },
];

const CALC_CATEGORIES = [
  { key: "cash_flow", label: "Cash Flow", icon: DollarSign }, { key: "retirement", label: "Retirement", icon: Calendar },
  { key: "life_income", label: "Life & Income", icon: TrendingUp }, { key: "tax_planning", label: "Tax Planning", icon: Calculator },
  { key: "estate_planning", label: "Estate Planning", icon: Calculator },
];

function MeshOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, hsla(160,60%,25%,0.5) 0%, transparent 70%)", filter: "blur(60px)" }} />
      <div className="absolute bottom-0 right-0 h-[350px] w-[350px] rounded-full opacity-20"
        style={{ background: `radial-gradient(circle, ${GOLD_BG} 0%, transparent 70%)`, filter: "blur(80px)" }} />
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer"
      style={active ? { background: GOLD_BG, color: GOLD, border: `1px solid ${GOLD_BORDER}` }
        : { background: "hsla(0,0%,100%,0.04)", color: "hsla(0,0%,100%,0.5)", border: "1px solid hsla(0,0%,100%,0.08)" }}>
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

  if (loading) return (
    <div className="relative min-h-screen -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8 flex justify-center items-center" style={{ background: "#020806" }}>
      <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: GOLD, borderTopColor: "transparent" }} />
    </div>
  );

  return (
    <div className="relative min-h-screen -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8" style={{ background: "#020806" }}>
      <MeshOrbs />
      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-xs font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full"
              style={{ background: GOLD_BG, color: GOLD, border: `1px solid ${GOLD_BORDER}` }}>TOOLS HUB</span>
          </div>
          <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Tools Hub</h1>
          <p className="text-white/50 mt-1 text-sm">Access quoting tools and financial calculators.</p>
        </div>

        <Tabs defaultValue="quoting">
          <TabsList className="rounded-xl p-1" style={{ background: "hsla(0,0%,100%,0.05)", border: "1px solid hsla(0,0%,100%,0.08)" }}>
            <TabsTrigger value="quoting" className="rounded-lg data-[state=active]:text-black text-white/50"
              style={{ "--tw-ring-shadow": "none" } as any}>
              <Wrench className="h-4 w-4 mr-1" />Quoting Tools
            </TabsTrigger>
            <TabsTrigger value="calculators" className="rounded-lg data-[state=active]:text-black text-white/50">
              <Calculator className="h-4 w-4 mr-1" />Calculators
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quoting" className="mt-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by tool or carrier name…"
                className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-0 focus-visible:border-white/20 rounded-xl" />
            </div>
            <div className="flex flex-wrap gap-2">
              <FilterChip label="All" active={selectedType === null} onClick={() => setSelectedType(null)} />
              {TOOL_TYPES.map(tt => <FilterChip key={tt.key} label={tt.label} active={selectedType === tt.key} onClick={() => setSelectedType(selectedType === tt.key ? null : tt.key)} />)}
            </div>

            {filteredTools.length === 0 ? (
              <div className="text-center py-12 rounded-2xl" style={GLASS}>
                <Search className="h-8 w-8 text-white/20 mx-auto mb-2" />
                <p className="text-white/50">No tools match your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTools.map(t => (
                  <div key={t.id} className="rounded-2xl p-4 flex flex-col gap-3" style={GLASS}>
                    <div className="flex items-center gap-3">
                      {t.carriers?.carrier_logo_url ? (
                        <img src={t.carriers.carrier_logo_url} alt={t.carriers.carrier_name} className="h-8 w-8 object-contain rounded" />
                      ) : (
                        <div className="h-8 w-8 rounded flex items-center justify-center" style={{ background: GOLD_BG }}>
                          <Wrench className="h-4 w-4" style={{ color: GOLD }} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate">{t.tool_name}</p>
                        {t.carriers?.carrier_name && <p className="text-xs text-white/40">{t.carriers.carrier_name}</p>}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                        style={{ background: "hsla(0,0%,100%,0.06)", color: "hsla(0,0%,100%,0.6)", border: "1px solid hsla(0,0%,100%,0.08)" }}>
                        {t.tool_type?.replace(/_/g, " ")}
                      </span>
                      {t.requires_login && (
                        <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                          style={{ background: GOLD_BG, color: GOLD, border: `1px solid ${GOLD_BORDER}` }}>
                          <Lock className="h-3 w-3" /> Login Required
                        </span>
                      )}
                    </div>
                    {t.description && <p className="text-xs text-white/40 line-clamp-2">{t.description}</p>}
                    <div className="flex-1" />
                    {t.login_instructions && (
                      <div>
                        <button onClick={() => setExpandedInstructions(expandedInstructions === t.id ? null : t.id)}
                          className="text-xs flex items-center gap-1 hover:opacity-80 transition-opacity" style={{ color: GOLD }}>
                          Login Instructions
                          {expandedInstructions === t.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </button>
                        {expandedInstructions === t.id && (
                          <p className="text-xs text-white/40 mt-1 p-2 rounded-lg" style={{ background: "hsla(0,0%,100%,0.04)" }}>{t.login_instructions}</p>
                        )}
                      </div>
                    )}
                    <a href={t.tool_url} target="_blank" rel="noopener noreferrer">
                      <button className="w-full py-1.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition-all"
                        style={{ background: GOLD_BG, color: GOLD, border: `1px solid ${GOLD_BORDER}` }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = `0 0 16px ${GOLD_BG}`}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = "none"}>
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
              return (
                <div key={cat.key} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" style={{ color: GOLD }} />
                    <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: GOLD }}>{cat.label}</h3>
                    <span className="text-xs px-1.5 rounded-full text-white/40" style={{ background: "hsla(0,0%,100%,0.06)" }}>{categoryCalcs.length}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {categoryCalcs.map(c => {
                      const CatIcon = cat.icon;
                      return (
                        <div key={c.id} className="rounded-2xl p-4 flex flex-col gap-3" style={GLASS}>
                          <div className="flex items-start gap-3">
                            <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: GOLD_BG }}>
                              <CatIcon className="h-5 w-5" style={{ color: GOLD }} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-white">{c.calculator_name}</p>
                              {c.description && <p className="text-xs text-white/40 mt-1 line-clamp-2">{c.description}</p>}
                            </div>
                          </div>
                          {c.external_url && (
                            <a href={c.external_url} target="_blank" rel="noopener noreferrer">
                              <button className="w-full py-1.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition-all"
                                style={{ background: GOLD_BG, color: GOLD, border: `1px solid ${GOLD_BORDER}` }}>
                                <Calculator className="h-3 w-3" /> Use Calculator
                              </button>
                            </a>
                          )}
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
    </div>
  );
}
