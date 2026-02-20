import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Download, Target, DollarSign, TrendingUp, Shield, BarChart3 } from "lucide-react";

const BRAND_GREEN = "#1A4D3E";

const goalLabels: Record<string, string> = {
  goal_retirement_age: "Retirement Age",
  goal_monthly_amount: "Monthly Income",
  goal_vacation: "Vacation Home",
  goal_home: "Primary Home",
  goal_travel: "Travel",
  goal_education: "Education",
  goal_retire_parents: "Retire Parents",
  goal_other_goals: "Other",
};

const fmt = (n: number | null | undefined) =>
  n != null ? `$${Number(n).toLocaleString()}` : "—";

export default function ClientCNAView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { portalUser } = usePortalAuth();
  const [cna, setCna] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !portalUser) return;
    supabase
      .from("client_needs_analysis")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) console.error(error);
        setCna(data);
        setLoading(false);
      });
  }, [id, portalUser]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-60" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!cna) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Analysis not found.</p>
        <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
      </div>
    );
  }

  const ai = cna.ai_retirement_projection;
  const goals = Object.entries(goalLabels)
    .filter(([key]) => cna[key])
    .map(([, label]) => label);

  return (
    <div className="max-w-3xl mx-auto space-y-6 print:space-y-4 print:max-w-none">
      {/* Header - hide back/download on print */}
      <div className="flex items-center justify-between print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <Button
          onClick={() => window.print()}
          className="gap-2 text-white"
          style={{ background: BRAND_GREEN }}
        >
          <Download className="h-4 w-4" /> Download PDF
        </Button>
      </div>

      {/* Title */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 print:shadow-none print:border-0 print:p-0 print:mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Financial Needs Analysis</h1>
        <p className="text-sm text-gray-500 mt-1">
          Prepared for {cna.applicant_name} · {new Date(cna.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Goals */}
      {goals.length > 0 && (
        <Section title="Financial Goals" icon={Target}>
          <div className="flex flex-wrap gap-2">
            {goals.map((g) => (
              <span key={g} className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                {g}
              </span>
            ))}
          </div>
          {cna.risk_tolerance && (
            <p className="text-sm text-gray-600 mt-3">
              <span className="text-gray-400">Risk Tolerance:</span>{" "}
              <span className="font-medium capitalize">{cna.risk_tolerance.replace(/_/g, " ")}</span>
            </p>
          )}
        </Section>
      )}

      {/* Income & Expenses */}
      <Section title="Income & Expenses" icon={DollarSign}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <Stat label="Net Income" value={fmt(cna.combined_net_income)} sub="/mo" />
          <Stat label="Total Expenses" value={fmt(cna.total_monthly_expenses)} sub="/mo" />
          <Stat
            label="Surplus/Deficit"
            value={fmt(cna.monthly_surplus_deficit)}
            sub="/mo"
            color={Number(cna.monthly_surplus_deficit) >= 0 ? "#10B981" : "#EF4444"}
          />
        </div>
      </Section>

      {/* Assets & Liabilities */}
      <Section title="Assets & Liabilities" icon={TrendingUp}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <Stat label="Total Assets" value={fmt(cna.total_assets)} />
          <Stat label="Total Liabilities" value={fmt(cna.total_liabilities)} />
          <Stat
            label="Net Worth"
            value={fmt(cna.net_worth)}
            color={Number(cna.net_worth) >= 0 ? "#10B981" : "#EF4444"}
          />
        </div>
      </Section>

      {/* AI Analysis */}
      {ai && (
        <>
          <Section title="Retirement Readiness" icon={BarChart3}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <Stat label="Retirement Score" value={`${ai.retirement_score}%`} color={ai.retirement_score >= 70 ? "#10B981" : ai.retirement_score >= 40 ? "#F59E0B" : "#EF4444"} />
              {ai.years_to_goal && <Stat label="Years to Goal" value={ai.years_to_goal} />}
              {ai.projected_monthly_income && <Stat label="Projected Income" value={fmt(ai.projected_monthly_income)} sub="/mo" />}
              {ai.savings_gap && <Stat label="Savings Gap" value={fmt(ai.savings_gap)} />}
            </div>
          </Section>

          {ai.key_recommendations?.length > 0 && (
            <Section title="Recommendations" icon={Shield}>
              <ul className="space-y-2">
                {ai.key_recommendations.map((r: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: BRAND_GREEN }}>
                      {i + 1}
                    </span>
                    {r}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {ai.action_steps?.length > 0 && (
            <Section title="Action Plan" icon={Target}>
              <div className="space-y-3">
                {ai.action_steps.map((s: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg bg-gray-50">
                    <p className="text-sm font-semibold text-gray-900">{s.title}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{s.description}</p>
                    <div className="flex gap-3 mt-1 text-xs text-gray-400">
                      {s.estimated_cost && <span>{s.estimated_cost}</span>}
                      {s.timeline && <span>· {s.timeline}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </>
      )}

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .max-w-3xl, .max-w-3xl * { visibility: visible; }
          .max-w-3xl { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 print:shadow-none print:border print:p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: `${BRAND_GREEN}15` }}>
          <Icon className="h-4 w-4" style={{ color: BRAND_GREEN }} />
        </div>
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Stat({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-lg font-bold" style={color ? { color } : { color: "#111827" }}>
        {value}
        {sub && <span className="text-xs font-normal text-gray-400">{sub}</span>}
      </p>
    </div>
  );
}
