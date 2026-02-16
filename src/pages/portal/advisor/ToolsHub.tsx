import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Calculator, Wrench } from "lucide-react";

export default function ToolsHub() {
  const [tools, setTools] = useState<any[]>([]);
  const [calculators, setCalculators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("quoting_tools").select("*, carriers(carrier_name)").order("tool_name"),
      supabase.from("calculators").select("*").eq("active", true).order("sort_order"),
    ]).then(([t, c]) => {
      setTools(t.data ?? []);
      setCalculators(c.data ?? []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const calcCategories = [...new Set(calculators.map(c => c.category))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>Tools Hub</h1>
        <p className="text-muted-foreground mt-1">Access quoting tools and financial calculators.</p>
      </div>

      <Tabs defaultValue="quoting">
        <TabsList>
          <TabsTrigger value="quoting"><Wrench className="h-4 w-4 mr-1" />Quoting Tools</TabsTrigger>
          <TabsTrigger value="calculators"><Calculator className="h-4 w-4 mr-1" />Calculators</TabsTrigger>
        </TabsList>

        <TabsContent value="quoting" className="mt-4 space-y-4">
          {tools.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No quoting tools available.</p>
          ) : tools.map(t => (
            <Card key={t.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{t.tool_name}</p>
                  <div className="flex gap-2 mt-1">
                    {t.carriers?.carrier_name && <Badge variant="outline" className="text-xs">{t.carriers.carrier_name}</Badge>}
                    <Badge variant="secondary" className="text-xs capitalize">{t.tool_type?.replace(/_/g, " ")}</Badge>
                    {t.requires_login && <Badge variant="secondary" className="text-xs">Login Required</Badge>}
                  </div>
                  {t.description && <p className="text-xs text-muted-foreground mt-1">{t.description}</p>}
                </div>
                <a href={t.tool_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm"><ExternalLink className="h-3 w-3 mr-1" />Open</Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="calculators" className="mt-4 space-y-6">
          {calcCategories.map(cat => (
            <div key={cat}>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{cat.replace(/_/g, " ")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {calculators.filter(c => c.category === cat).map(c => (
                  <Card key={c.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Calculator className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground">{c.calculator_name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{c.description}</p>
                          {c.external_url && (
                            <a href={c.external_url} target="_blank" rel="noopener noreferrer">
                              <Button variant="link" size="sm" className="px-0 mt-1"><ExternalLink className="h-3 w-3 mr-1" />Open</Button>
                            </a>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
