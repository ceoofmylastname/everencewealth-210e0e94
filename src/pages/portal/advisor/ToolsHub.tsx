import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Calculator, Wrench, Search, Lock, ChevronDown, ChevronUp, DollarSign, TrendingUp, Calendar } from "lucide-react";

const TOOL_TYPES = [
  { key: "quick_quote", label: "Quick Quote" },
  { key: "agent_portal", label: "Agent Portal" },
  { key: "microsite", label: "Microsite" },
  { key: "illustration_system", label: "Illustration System" },
  { key: "application_portal", label: "Application Portal" },
];

const CALC_CATEGORIES = [
  { key: "cash_flow", label: "Cash Flow", icon: DollarSign },
  { key: "retirement", label: "Retirement", icon: Calendar },
  { key: "life_income", label: "Life & Income", icon: TrendingUp },
  { key: "tax_planning", label: "Tax Planning", icon: Calculator },
  { key: "estate_planning", label: "Estate Planning", icon: Calculator },
];

const getCategoryIcon = (category: string) => {
  return CALC_CATEGORIES.find((c) => c.key === category)?.icon || Calculator;
};

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
    ]).then(([t, c]) => {
      setTools(t.data ?? []);
      setCalculators(c.data ?? []);
      setLoading(false);
    });
  }, []);

  const filteredTools = useMemo(() => {
    let result = tools;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.tool_name?.toLowerCase().includes(q) ||
          t.carriers?.carrier_name?.toLowerCase().includes(q)
      );
    }
    if (selectedType) {
      result = result.filter((t) => t.tool_type === selectedType);
    }
    return result;
  }, [tools, searchQuery, selectedType]);

  

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
          Tools Hub
        </h1>
        <p className="text-muted-foreground mt-1">Access quoting tools and financial calculators.</p>
      </div>

      <Tabs defaultValue="quoting">
        <TabsList>
          <TabsTrigger value="quoting"><Wrench className="h-4 w-4 mr-1" />Quoting Tools</TabsTrigger>
          <TabsTrigger value="calculators"><Calculator className="h-4 w-4 mr-1" />Calculators</TabsTrigger>
        </TabsList>

        <TabsContent value="quoting" className="mt-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by tool or carrier name…"
              className="pl-9"
            />
          </div>

          {/* Type filter badges */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedType === null ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedType(null)}
            >
              All
            </Badge>
            {TOOL_TYPES.map((tt) => (
              <Badge
                key={tt.key}
                variant={selectedType === tt.key ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedType(selectedType === tt.key ? null : tt.key)}
              >
                {tt.label}
              </Badge>
            ))}
          </div>

          {/* Tools grid */}
          {filteredTools.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No tools match your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTools.map((t) => (
                <Card key={t.id} className="flex flex-col">
                  <CardContent className="p-4 flex flex-col flex-1 gap-3">
                    {/* Logo + name */}
                    <div className="flex items-center gap-3">
                      {t.carriers?.carrier_logo_url ? (
                        <img
                          src={t.carriers.carrier_logo_url}
                          alt={t.carriers.carrier_name}
                          className="h-8 w-8 object-contain rounded"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                          <Wrench className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{t.tool_name}</p>
                        {t.carriers?.carrier_name && (
                          <p className="text-xs text-muted-foreground">{t.carriers.carrier_name}</p>
                        )}
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {t.tool_type?.replace(/_/g, " ")}
                      </Badge>
                      {t.requires_login && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Lock className="h-3 w-3" /> Login Required
                        </Badge>
                      )}
                    </div>

                    {/* Description */}
                    {t.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>
                    )}

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Login instructions expandable */}
                    {t.login_instructions && (
                      <div>
                        <button
                          onClick={() =>
                            setExpandedInstructions(expandedInstructions === t.id ? null : t.id)
                          }
                          className="text-xs text-primary flex items-center gap-1 hover:underline"
                        >
                          Login Instructions
                          {expandedInstructions === t.id ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </button>
                        {expandedInstructions === t.id && (
                          <p className="text-xs text-muted-foreground mt-1 bg-muted/50 rounded p-2">
                            {t.login_instructions}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Open button */}
                    <a href={t.tool_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="h-3 w-3 mr-1" /> Open Tool
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="calculators" className="mt-4 space-y-4">
          {/* Category filter badges */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedCategory === null ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Badge>
            {CALC_CATEGORIES.map((cat) => (
              <Badge
                key={cat.key}
                variant={selectedCategory === cat.key ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(selectedCategory === cat.key ? null : cat.key)}
              >
                {cat.label}
              </Badge>
            ))}
          </div>

          {/* Grouped calculator sections */}
          {CALC_CATEGORIES.map((cat) => {
            const categoryCalcs = calculators.filter((c) => c.category === cat.key);
            if (selectedCategory && selectedCategory !== cat.key) return null;
            if (categoryCalcs.length === 0) return null;
            const Icon = cat.icon;

            return (
              <div key={cat.key} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    {cat.label}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {categoryCalcs.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {categoryCalcs.map((c) => {
                    const CatIcon = getCategoryIcon(c.category);
                    return (
                      <Card key={c.id}>
                        <CardContent className="p-4 flex flex-col gap-3">
                          <div className="flex items-start gap-3">
                            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <CatIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-foreground">{c.calculator_name}</p>
                              {c.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.description}</p>
                              )}
                            </div>
                          </div>
                          {c.external_url && (
                            <a href={c.external_url} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline" size="sm" className="w-full">
                                <Calculator className="h-3 w-3 mr-1" /> Use Calculator
                              </Button>
                            </a>
                          )}
                        </CardContent>
                      </Card>
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
