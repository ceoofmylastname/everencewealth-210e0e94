import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { SignaturePad } from "@/components/portal/SignaturePad";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Target, Home, Plane, GraduationCap, Heart, Gift, DollarSign,
  TrendingUp, TrendingDown, ChevronLeft, ChevronRight, CheckCircle,
  AlertTriangle, Loader2, ArrowLeft, ShoppingBag, Users, Calendar,
  Shield, BarChart3, Share2,
} from "lucide-react";

const BRAND_GREEN = "#1A4D3E";
const STEPS = ["Goals", "Applicant", "Income", "Expenses", "Assets", "Budget", "AI Analysis", "Review & Sign"];

const goalCards = [
  { key: "goal_retirement_age", label: "Retirement Age", icon: Calendar, expandable: true, targetKey: "goal_retirement_age_target", targetLabel: "Target Age", inputType: "number" },
  { key: "goal_monthly_amount", label: "Monthly Income", icon: DollarSign, expandable: true, targetKey: "goal_monthly_amount_target", targetLabel: "Monthly Amount ($)", inputType: "number" },
  { key: "goal_vacation", label: "Vacation Home", icon: Home },
  { key: "goal_home", label: "Primary Home", icon: Home },
  { key: "goal_travel", label: "Travel", icon: Plane },
  { key: "goal_education", label: "Education", icon: GraduationCap },
  { key: "goal_retire_parents", label: "Retire Parents", icon: Heart },
  { key: "goal_other_goals", label: "Other", icon: Gift, expandable: true, targetKey: "goal_other_description", targetLabel: "Describe", inputType: "text" },
];

const riskLevels = [
  { value: "conservative", label: "Conservative", color: "#EF4444" },
  { value: "moderately_conservative", label: "Mod. Conservative", color: "#F59E0B" },
  { value: "moderate", label: "Moderate", color: "#EAB308" },
  { value: "moderately_aggressive", label: "Mod. Aggressive", color: "#22C55E" },
  { value: "aggressive", label: "Aggressive", color: "#10B981" },
];

const nonDiscExpenses = [
  { key: "expense_mortgage_rent", label: "Mortgage/Rent" },
  { key: "expense_insurance", label: "Insurance" },
  { key: "expense_utilities", label: "Utilities" },
  { key: "expense_car_payment", label: "Car Payment(s)" },
  { key: "expense_health_premiums", label: "Health Premiums" },
  { key: "expense_debt_service", label: "Debt Service" },
];

const discExpenses = [
  { key: "expense_groceries", label: "Groceries" },
  { key: "expense_dining_out", label: "Dining Out" },
  { key: "expense_child_care", label: "Child Care" },
  { key: "expense_clothing", label: "Clothing" },
  { key: "expense_gifts", label: "Gifts" },
  { key: "expense_travel", label: "Travel" },
  { key: "expense_other", label: "Other" },
];

const assetFields = [
  { key: "asset_home_value", label: "Home Value" },
  { key: "asset_savings_cds", label: "Savings/CDs" },
  { key: "asset_investments", label: "Investments" },
  { key: "asset_retirement_accounts", label: "Retirement Accounts" },
  { key: "asset_life_insurance_cv", label: "Life Insurance (Cash Value)" },
  { key: "asset_other", label: "Other" },
];

const liabilityFields = [
  { key: "liability_mortgage", label: "Mortgage" },
  { key: "liability_car_loans", label: "Car Loan(s)" },
  { key: "liability_credit_cards", label: "Credit Cards" },
  { key: "liability_student_loans", label: "Student Loans" },
  { key: "liability_other", label: "Other" },
];

function CurrencyInput({ label, value, onChange, placeholder }: { label: string; value: number | null; onChange: (v: number | null) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-1">{label}</label>
      <div className="relative">
        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="number"
          step="0.01"
          min="0"
          placeholder={placeholder || "0.00"}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : null)}
          className="pl-9"
        />
      </div>
    </div>
  );
}

function calculateAge(dob: string): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

const PIE_COLORS = ["#1A4D3E", "#C9A84C", "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444"];

export default function CNAForm() {
  const { portalUser } = usePortalAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Form data - all fields
  const [form, setForm] = useState<Record<string, any>>({
    applicant_name: "",
    risk_tolerance: "moderate",
    status: "draft",
  });

  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [clients, setClients] = useState<{ id: string; first_name: string; last_name: string; email: string }[]>([]);

  // Load advisor's clients for assignment
  useEffect(() => {
    if (!portalUser) return;
    supabase
      .from("portal_users")
      .select("id, first_name, last_name, email")
      .eq("advisor_id", portalUser.id)
      .eq("role", "client")
      .eq("is_active", true)
      .order("last_name")
      .then(({ data }) => setClients(data ?? []));
  }, [portalUser]);

  // Load existing CNA if editing
  useEffect(() => {
    if (!id) return;
    supabase
      .from("client_needs_analysis")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          toast.error("Failed to load analysis");
          return;
        }
        if (data) {
          setForm(data as Record<string, any>);
          if (data.ai_retirement_projection) {
            setAiAnalysis(data.ai_retirement_projection);
          }
        }
      });
  }, [id]);

  const update = useCallback((key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const num = useCallback((key: string): number => Number(form[key]) || 0, [form]);

  // Calculations
  const totalNonDisc = useMemo(() => nonDiscExpenses.reduce((s, e) => s + num(e.key), 0), [num]);
  const totalDisc = useMemo(() => discExpenses.reduce((s, e) => s + num(e.key), 0), [num]);
  const totalExpenses = totalNonDisc + totalDisc;
  const totalIncome = num("combined_net_income") + num("other_income");
  const surplus = totalIncome - totalExpenses;
  const totalAssets = useMemo(() => assetFields.reduce((s, a) => s + num(a.key), 0), [num]);
  const totalLiabilities = useMemo(() => liabilityFields.reduce((s, l) => s + num(l.key), 0), [num]);
  const netWorth = totalAssets - totalLiabilities;
  const dti = num("combined_gross_income") > 0
    ? ((num("expense_mortgage_rent") + num("expense_car_payment") + num("expense_debt_service")) / num("combined_gross_income")) * 100
    : 0;

  const applicantAge = calculateAge(form.applicant_dob);
  const spouseAge = calculateAge(form.spouse_dob);

  // Auto-save draft on step change
  useEffect(() => {
    if (!portalUser || step === 0) return;
    const timer = setTimeout(() => saveDraft(), 2000);
    return () => clearTimeout(timer);
  }, [step]);

  async function saveDraft() {
    if (!portalUser) return;
    try {
      const { id: _id, created_at: _ca, updated_at: _ua, _savedId: _sid, ...rest } = form;
      const payload: Record<string, any> = {
        ...rest,
        advisor_id: portalUser.id,
        total_monthly_expenses: totalExpenses,
        total_assets: totalAssets,
        total_liabilities: totalLiabilities,
        net_worth: netWorth,
        monthly_surplus_deficit: surplus,
        debt_to_income_ratio: Math.round(dti * 100) / 100,
        ai_retirement_projection: aiAnalysis || form.ai_retirement_projection,
      };

      if (isEditing) {
        await supabase.from("client_needs_analysis").update(payload).eq("id", id);
      } else if (!form._savedId) {
        const { data, error } = await supabase
          .from("client_needs_analysis")
          .insert(payload as any)
          .select("id")
          .single();
        if (!error && data) {
          setForm((prev) => ({ ...prev, _savedId: data.id }));
        }
      } else {
        await supabase.from("client_needs_analysis").update(payload).eq("id", form._savedId);
      }
    } catch (err) {
      console.error("Auto-save failed:", err);
    }
  }

  async function runAIAnalysis() {
    setAiLoading(true);
    setAiError(null);
    try {
      const goals = goalCards
        .filter((g) => form[g.key])
        .map((g) => g.label);

      const { data, error } = await supabase.functions.invoke("financial-analysis", {
        body: {
          applicant_age: applicantAge,
          spouse_age: spouseAge,
          combined_gross_income: num("combined_gross_income"),
          combined_net_income: num("combined_net_income"),
          total_expenses: totalExpenses,
          net_worth: netWorth,
          total_assets: totalAssets,
          total_liabilities: totalLiabilities,
          retirement_age_goal: form.goal_retirement_age_target,
          monthly_retirement_goal: form.goal_monthly_amount_target,
          risk_tolerance: form.risk_tolerance,
          smoking_status: form.applicant_smoking_status,
          goals,
          monthly_surplus: surplus,
        },
      });

      if (error) throw error;
      setAiAnalysis(data);
    } catch (err: any) {
      console.error("AI analysis failed:", err);
      setAiError(err.message || "Failed to generate analysis. Please try again.");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit() {
    if (!portalUser) return;
    setSaving(true);
    try {
      const { id: _id2, created_at: _ca2, updated_at: _ua2, _savedId: _sid2, ...restSubmit } = form;
      const payload: Record<string, any> = {
        ...restSubmit,
        advisor_id: portalUser.id,
        status: "completed",
        completed_at: new Date().toISOString(),
        total_monthly_expenses: totalExpenses,
        total_assets: totalAssets,
        total_liabilities: totalLiabilities,
        net_worth: netWorth,
        monthly_surplus_deficit: surplus,
        debt_to_income_ratio: Math.round(dti * 100) / 100,
        ai_retirement_projection: aiAnalysis,
        ai_recommendations: aiAnalysis?.key_recommendations ? { recommendations: aiAnalysis.key_recommendations } : null,
        ai_insurance_gap: aiAnalysis ? {
          life: aiAnalysis.recommended_life_coverage,
          disability: aiAnalysis.recommended_disability_coverage,
          ltc: aiAnalysis.recommended_ltc_coverage,
          gap: aiAnalysis.life_insurance_gap,
        } : null,
        ai_risk_assessment: aiAnalysis?.recommended_allocation ? { allocation: aiAnalysis.recommended_allocation, summary: aiAnalysis.risk_profile_summary } : null,
        signature_date: form.client_signature ? new Date().toISOString() : null,
      };

      const saveId = isEditing ? id : form._savedId;
      if (saveId) {
        const { error } = await supabase.from("client_needs_analysis").update(payload).eq("id", saveId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("client_needs_analysis").insert(payload as any);
        if (error) throw error;
      }

      toast.success("Analysis completed successfully!");
      navigate("/portal/advisor/cna");
    } catch (err: any) {
      console.error("Submit failed:", err);
      toast.error("Failed to save: " + (err.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  }

  const canProceed = () => {
    if (step === 0) return true;
    if (step === 1) return !!form.applicant_name;
    return true;
  };

  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  // Expense pie data
  const expensePieData = useMemo(() => {
    const items = [
      ...nonDiscExpenses.map((e) => ({ name: e.label, value: num(e.key) })),
      ...discExpenses.map((e) => ({ name: e.label, value: num(e.key) })),
    ].filter((d) => d.value > 0);
    return items;
  }, [num]);

  // ─── STEP RENDERERS ───
  const renderStep0 = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">What Are Your Financial Goals?</h2>
        <p className="text-sm text-gray-500">Select all that apply</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {goalCards.map((g, i) => {
          const Icon = g.icon;
          const selected = !!form[g.key];
          return (
            <motion.div
              key={g.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <button
                type="button"
                onClick={() => update(g.key, !selected)}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  selected ? "border-[#1A4D3E] bg-[#F0F5F3]" : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <Icon className="h-5 w-5 mb-2" style={{ color: selected ? BRAND_GREEN : "#9CA3AF" }} />
                <p className={`text-sm font-medium ${selected ? "text-gray-900" : "text-gray-600"}`}>{g.label}</p>
                {selected && <CheckCircle className="h-4 w-4 mt-1" style={{ color: BRAND_GREEN }} />}
              </button>
              {selected && g.expandable && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} className="mt-2">
                  <Input
                    type={g.inputType || "text"}
                    placeholder={g.targetLabel}
                    value={form[g.targetKey!] ?? ""}
                    onChange={(e) => update(g.targetKey!, g.inputType === "number" ? (e.target.value ? parseFloat(e.target.value) : null) : e.target.value)}
                    className="text-sm"
                  />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Risk Tolerance */}
      <div className="mt-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Risk Tolerance</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          {riskLevels.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => update("risk_tolerance", r.value)}
              className={`flex-1 px-3 py-3 rounded-xl border-2 text-xs sm:text-sm font-medium transition-all ${
                form.risk_tolerance === r.value
                  ? "border-[#1A4D3E] bg-[#F0F5F3] text-gray-900"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              <div className="h-2 w-2 rounded-full mx-auto mb-1.5" style={{ background: r.color }} />
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Applicant & Spouse Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Applicant */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-gray-900 border-b pb-2">Applicant</h3>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Full Name *</label>
            <Input value={form.applicant_name || ""} onChange={(e) => update("applicant_name", e.target.value)} placeholder="Full name" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
            <Input type="email" value={form.email || ""} onChange={(e) => update("email", e.target.value)} placeholder="email@example.com" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Phone</label>
            <Input value={form.phone || ""} onChange={(e) => update("phone", e.target.value)} placeholder="(555) 000-0000" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Address</label>
            <Input value={form.address || ""} onChange={(e) => update("address", e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">City</label>
              <Input value={form.city || ""} onChange={(e) => update("city", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">State</label>
              <Input value={form.state || ""} onChange={(e) => update("state", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">ZIP</label>
              <Input value={form.zip || ""} onChange={(e) => update("zip", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Date of Birth</label>
            <Input type="date" value={form.applicant_dob || ""} onChange={(e) => update("applicant_dob", e.target.value)} />
            {applicantAge !== null && <p className="text-xs text-gray-500 mt-1">Age: {applicantAge}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Smoking Status</label>
            <div className="flex gap-3">
              {["non_smoker", "smoker"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => update("applicant_smoking_status", s)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                    form.applicant_smoking_status === s ? "border-[#1A4D3E] bg-[#F0F5F3] text-gray-900" : "border-gray-200 text-gray-500"
                  }`}
                >
                  {s === "non_smoker" ? "Non-Smoker" : "Smoker"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Spouse */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-gray-900 border-b pb-2">Spouse (Optional)</h3>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Full Name</label>
            <Input value={form.spouse_name || ""} onChange={(e) => update("spouse_name", e.target.value)} placeholder="Spouse name" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Date of Birth</label>
            <Input type="date" value={form.spouse_dob || ""} onChange={(e) => update("spouse_dob", e.target.value)} />
            {spouseAge !== null && <p className="text-xs text-gray-500 mt-1">Age: {spouseAge}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Smoking Status</label>
            <div className="flex gap-3">
              {["non_smoker", "smoker"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => update("spouse_smoking_status", s)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                    form.spouse_smoking_status === s ? "border-[#1A4D3E] bg-[#F0F5F3] text-gray-900" : "border-gray-200 text-gray-500"
                  }`}
                >
                  {s === "non_smoker" ? "Non-Smoker" : "Smoker"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Monthly Income</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CurrencyInput label="Combined Gross Income" value={form.combined_gross_income} onChange={(v) => update("combined_gross_income", v)} />
        <CurrencyInput label="Combined Net Income" value={form.combined_net_income} onChange={(v) => update("combined_net_income", v)} />
        <CurrencyInput label="Other Income" value={form.other_income} onChange={(v) => update("other_income", v)} />
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Other Income Source</label>
          <Input value={form.other_income_description || ""} onChange={(e) => update("other_income_description", e.target.value)} placeholder="e.g. Rental, dividends" />
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-3">Income Summary</h3>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total Monthly Income</span>
          <span className="text-2xl font-bold" style={{ color: BRAND_GREEN }}>${fmt(totalIncome)}</span>
        </div>
        <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
          <span>Annual Income</span>
          <span>${fmt(totalIncome * 12)}</span>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Monthly Expenses</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Home className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Non-Discretionary</h3>
            </div>
            <div className="space-y-3">
              {nonDiscExpenses.map((e) => (
                <CurrencyInput key={e.key} label={e.label} value={form[e.key]} onChange={(v) => update(e.key, v)} />
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBag className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Discretionary</h3>
            </div>
            <div className="space-y-3">
              {discExpenses.map((e) => (
                <CurrencyInput key={e.key} label={e.label} value={form[e.key]} onChange={(v) => update(e.key, v)} />
              ))}
              {num("expense_other") > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Other Description</label>
                  <Input value={form.expense_other_description || ""} onChange={(e) => update("expense_other_description", e.target.value)} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Chart & Summary */}
        <div className="lg:sticky lg:top-8 space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Expense Breakdown</h3>
            {expensePieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={expensePieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={30}>
                      {expensePieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => `$${fmt(v)}`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {expensePieData.map((item, i) => {
                    const pct = totalExpenses > 0 ? ((item.value / totalExpenses) * 100).toFixed(0) : "0";
                    return (
                      <div key={i} className="flex items-center gap-2 min-w-0">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-xs text-gray-600 truncate">{item.name}</span>
                        <span className="text-xs font-semibold text-gray-900 ml-auto shrink-0">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">Enter expenses to see breakdown</p>
            )}

            <div className="mt-4 space-y-3 border-t pt-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Expenses</span>
                <span className="font-bold text-gray-900">${fmt(totalExpenses)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Net Income</span>
                <span className="font-bold text-gray-900">${fmt(totalIncome)}</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="text-sm font-semibold text-gray-900">Surplus/Deficit</span>
                <span className={`text-lg font-bold ${surplus >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {surplus >= 0 ? "+" : ""}${fmt(surplus)}
                </span>
              </div>
            </div>

            {surplus < 0 && (
              <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-100">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-xs text-red-700">
                  Expenses exceed income by ${fmt(Math.abs(surplus))}/month.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Assets & Liabilities</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets */}
        <div className="bg-white rounded-xl border-l-4 border-l-green-500 border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-bold text-gray-900">Assets</h3>
          </div>
          <div className="space-y-3">
            {assetFields.map((a) => (
              <CurrencyInput key={a.key} label={a.label} value={form[a.key]} onChange={(v) => update(a.key, v)} />
            ))}
            {num("asset_other") > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Other Description</label>
                <Input value={form.asset_other_description || ""} onChange={(e) => update("asset_other_description", e.target.value)} />
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-green-100 flex justify-between items-center">
            <span className="font-semibold text-gray-900">Total Assets</span>
            <span className="text-2xl font-bold text-green-600">${fmt(totalAssets)}</span>
          </div>
        </div>

        {/* Liabilities */}
        <div className="bg-white rounded-xl border-l-4 border-l-red-500 border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-bold text-gray-900">Liabilities</h3>
          </div>
          <div className="space-y-3">
            {liabilityFields.map((l) => (
              <CurrencyInput key={l.key} label={l.label} value={form[l.key]} onChange={(v) => update(l.key, v)} />
            ))}
            {num("liability_other") > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Other Description</label>
                <Input value={form.liability_other_description || ""} onChange={(e) => update("liability_other_description", e.target.value)} />
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-red-100 flex justify-between items-center">
            <span className="font-semibold text-gray-900">Total Liabilities</span>
            <span className="text-2xl font-bold text-red-600">${fmt(totalLiabilities)}</span>
          </div>
        </div>
      </div>

      {/* Net Worth Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Net Worth</h3>
        <p className={`text-4xl sm:text-5xl font-bold ${netWorth >= 0 ? "text-green-600" : "text-red-600"}`}>
          ${fmt(netWorth)}
        </p>
        <p className="text-sm text-gray-500 mt-2">Assets − Liabilities</p>

        {num("combined_gross_income") > 0 && (
          <div className="mt-6 inline-block">
            <p className="text-sm font-semibold text-gray-700 mb-1">Debt-to-Income Ratio</p>
            <p className={`text-2xl font-bold ${dti < 36 ? "text-green-600" : dti < 43 ? "text-yellow-600" : "text-red-600"}`}>
              {dti.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {dti < 36 ? "Healthy" : dti < 43 ? "Moderate" : "High"}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep5 = () => {
    const budgetAmounts = [400, 800, 1600];
    return (
      <div className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Monthly Budget for Financial Goals</h2>
        <p className="text-sm text-gray-600">
          Based on your income and expenses, you have{" "}
          <span className="font-bold" style={{ color: BRAND_GREEN }}>${fmt(Math.max(surplus, 0))}</span>{" "}
          available monthly. How much would you like to allocate?
        </p>

        <div className="flex flex-wrap gap-3">
          {budgetAmounts.map((amt) => {
            const key = `budget_available_${amt}` as string;
            return (
              <button
                key={amt}
                type="button"
                onClick={() => {
                  budgetAmounts.forEach((a) => update(`budget_available_${a}`, false));
                  update(key, true);
                  update("budget_available_other", null);
                }}
                className={`px-6 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                  form[key] ? "border-[#1A4D3E] bg-[#F0F5F3] text-gray-900" : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                ${fmt(amt)}/mo
              </button>
            );
          })}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">or</span>
            <div className="relative w-36">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="number"
                placeholder="Custom"
                value={form.budget_available_other ?? ""}
                onChange={(e) => {
                  budgetAmounts.forEach((a) => update(`budget_available_${a}`, false));
                  update("budget_available_other", e.target.value ? parseFloat(e.target.value) : null);
                }}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <label className="text-sm font-medium text-gray-700 block mb-2">Additional Notes</label>
          <Textarea
            rows={4}
            value={form.advisor_notes || ""}
            onChange={(e) => update("advisor_notes", e.target.value)}
            placeholder="Any additional concerns, questions, or information..."
          />
        </div>
      </div>
    );
  };

  const aiLoadingMessages = [
    "Analyzing your financial profile...",
    "Calculating retirement readiness...",
    "Identifying coverage gaps...",
    "Generating personalized recommendations...",
  ];
  const [aiMsgIndex, setAiMsgIndex] = useState(0);

  useEffect(() => {
    if (!aiLoading) return;
    const interval = setInterval(() => setAiMsgIndex((i) => (i + 1) % aiLoadingMessages.length), 3000);
    return () => clearInterval(interval);
  }, [aiLoading]);

  const renderStep6 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">AI Financial Analysis</h2>
        {!aiLoading && (
          <Button onClick={runAIAnalysis} className="gap-2 text-white" style={{ background: BRAND_GREEN }}>
            <BarChart3 className="h-4 w-4" /> {aiAnalysis ? "Re-analyze" : "Generate Analysis"}
          </Button>
        )}
      </div>

      {aiLoading ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" style={{ color: BRAND_GREEN }} />
          <p className="text-lg font-semibold text-gray-900">{aiLoadingMessages[aiMsgIndex]}</p>
          <p className="text-sm text-gray-500 mt-2">This may take 15-30 seconds</p>
        </div>
      ) : aiError ? (
        <div className="bg-red-50 rounded-xl border border-red-200 p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-medium">{aiError}</p>
          <Button onClick={runAIAnalysis} variant="outline" className="mt-4">Try Again</Button>
        </div>
      ) : aiAnalysis ? (
        <div className="space-y-6">
          {/* Retirement Score */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Retirement Readiness</h3>
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="relative h-32 w-32 shrink-0">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke={aiAnalysis.retirement_score >= 70 ? "#10B981" : aiAnalysis.retirement_score >= 40 ? "#F59E0B" : "#EF4444"}
                    strokeWidth="8"
                    strokeDasharray={`${(aiAnalysis.retirement_score / 100) * 264} 264`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">{aiAnalysis.retirement_score}%</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700">{aiAnalysis.retirement_summary}</p>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {aiAnalysis.projected_retirement_age && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Projected Age</p>
                      <p className="text-lg font-bold text-gray-900">{aiAnalysis.projected_retirement_age}</p>
                    </div>
                  )}
                  {aiAnalysis.projected_monthly_income && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Monthly Income</p>
                      <p className="text-lg font-bold text-gray-900">${fmt(aiAnalysis.projected_monthly_income)}</p>
                    </div>
                  )}
                  {aiAnalysis.retirement_gap != null && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Gap</p>
                      <p className="text-lg font-bold text-red-600">${fmt(aiAnalysis.retirement_gap)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Insurance Gaps */}
          {(aiAnalysis.recommended_life_coverage || aiAnalysis.recommended_disability_coverage) && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Insurance Coverage</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {aiAnalysis.recommended_life_coverage && (
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                    <Shield className="h-5 w-5 text-blue-600 mb-2" />
                    <p className="text-xs text-blue-600 font-semibold">Life Insurance</p>
                    <p className="text-lg font-bold text-gray-900">${fmt(aiAnalysis.recommended_life_coverage)}</p>
                    <p className="text-xs text-gray-500">Recommended</p>
                  </div>
                )}
                {aiAnalysis.recommended_disability_coverage && (
                  <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                    <Shield className="h-5 w-5 text-purple-600 mb-2" />
                    <p className="text-xs text-purple-600 font-semibold">Disability</p>
                    <p className="text-lg font-bold text-gray-900">${fmt(aiAnalysis.recommended_disability_coverage)}/mo</p>
                    <p className="text-xs text-gray-500">Recommended</p>
                  </div>
                )}
                {aiAnalysis.recommended_ltc_coverage && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                    <Shield className="h-5 w-5 text-amber-600 mb-2" />
                    <p className="text-xs text-amber-600 font-semibold">Long-Term Care</p>
                    <p className="text-lg font-bold text-gray-900">${fmt(aiAnalysis.recommended_ltc_coverage)}</p>
                    <p className="text-xs text-gray-500">Recommended</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Allocation Chart */}
          {aiAnalysis.recommended_allocation?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Recommended Allocation</h3>
              <p className="text-sm text-gray-600 mb-4">{aiAnalysis.risk_profile_summary}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                <div>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={aiAnalysis.recommended_allocation} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={30}>
                        {aiAnalysis.recommended_allocation.map((_: any, i: number) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                    {aiAnalysis.recommended_allocation.map((item: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 min-w-0">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-xs text-gray-600 truncate">{item.name}</span>
                        <span className="text-xs font-semibold text-gray-900 ml-auto shrink-0">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  {aiAnalysis.key_recommendations?.map((rec: string, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <p className="text-sm text-gray-700">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Steps */}
          {aiAnalysis.action_steps?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Action Plan</h3>
              <div className="space-y-3">
                {aiAnalysis.action_steps.map((s: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                      s.priority === "high" ? "bg-red-500" : s.priority === "medium" ? "bg-yellow-500" : "bg-blue-500"
                    }`}>
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{s.title}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{s.description}</p>
                      <div className="flex gap-3 mt-1 text-xs text-gray-400">
                        {s.estimated_cost && <span>{s.estimated_cost}</span>}
                        {s.timeline && <span>· {s.timeline}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Click "Generate Analysis" to get AI-powered recommendations</p>
          <p className="text-sm text-gray-400 mt-1">Based on your financial data from previous steps</p>
        </div>
      )}
    </div>
  );

  const renderStep7 = () => (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Review & Sign</h2>

      <Accordion type="multiple" defaultValue={["goals", "demographics", "income", "assets"]}>
        <AccordionItem value="goals">
          <AccordionTrigger className="text-sm font-semibold">Goals & Risk Tolerance</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Goals:</span> {goalCards.filter((g) => form[g.key]).map((g) => g.label).join(", ") || "None"}</p>
              <p><span className="text-gray-500">Risk Tolerance:</span> {riskLevels.find((r) => r.value === form.risk_tolerance)?.label || "—"}</p>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="demographics">
          <AccordionTrigger className="text-sm font-semibold">Applicant Information</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-1 text-sm">
              <p><span className="text-gray-500">Name:</span> {form.applicant_name}</p>
              {form.email && <p><span className="text-gray-500">Email:</span> {form.email}</p>}
              {form.phone && <p><span className="text-gray-500">Phone:</span> {form.phone}</p>}
              {applicantAge !== null && <p><span className="text-gray-500">Age:</span> {applicantAge}</p>}
              {form.spouse_name && <p><span className="text-gray-500">Spouse:</span> {form.spouse_name} {spouseAge !== null ? `(Age ${spouseAge})` : ""}</p>}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="income">
          <AccordionTrigger className="text-sm font-semibold">Income & Expenses</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-1 text-sm">
              <p><span className="text-gray-500">Net Income:</span> ${fmt(totalIncome)}/mo</p>
              <p><span className="text-gray-500">Total Expenses:</span> ${fmt(totalExpenses)}/mo</p>
              <p><span className="text-gray-500">Surplus:</span> <span className={surplus >= 0 ? "text-green-600" : "text-red-600"}>${fmt(surplus)}/mo</span></p>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="assets">
          <AccordionTrigger className="text-sm font-semibold">Assets & Liabilities</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-1 text-sm">
              <p><span className="text-gray-500">Total Assets:</span> ${fmt(totalAssets)}</p>
              <p><span className="text-gray-500">Total Liabilities:</span> ${fmt(totalLiabilities)}</p>
              <p><span className="text-gray-500">Net Worth:</span> <span className={netWorth >= 0 ? "text-green-600" : "text-red-600"}>${fmt(netWorth)}</span></p>
              {num("combined_gross_income") > 0 && <p><span className="text-gray-500">DTI Ratio:</span> {dti.toFixed(1)}%</p>}
            </div>
          </AccordionContent>
        </AccordionItem>
        {aiAnalysis && (
          <AccordionItem value="ai">
            <AccordionTrigger className="text-sm font-semibold">AI Recommendations</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-500">Retirement Score:</span> {aiAnalysis.retirement_score}%</p>
                {aiAnalysis.key_recommendations?.map((r: string, i: number) => (
                  <p key={i}>• {r}</p>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>

      {/* Assign to Client */}
      {clients.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-2">
            <Share2 className="h-4 w-4" style={{ color: BRAND_GREEN }} />
            <h3 className="text-base font-semibold text-gray-900">Assign to Client</h3>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Push this analysis to a client's dashboard so they can view and download it.
          </p>
          <Select
            value={form.client_id || ""}
            onValueChange={(v) => update("client_id", v || null)}
          >
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Select a client (optional)" />
            </SelectTrigger>
            <SelectContent className="bg-white z-50">
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.first_name} {c.last_name} — {c.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Signature */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-2">Client Signature</h3>
        <p className="text-xs text-gray-500 mb-4">
          By signing, you acknowledge the information provided is accurate and authorize Everence Wealth to use this data for financial planning.
        </p>
        <SignaturePad
          value={form.client_signature}
          onChange={(sig) => update("client_signature", sig)}
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={saving || !form.applicant_name}
        className="w-full sm:w-auto min-w-[200px] gap-2 text-white"
        style={{ background: BRAND_GREEN }}
        size="lg"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
        Complete Analysis
      </Button>
    </div>
  );

  const stepRenderers = [renderStep0, renderStep1, renderStep2, renderStep3, renderStep4, renderStep5, renderStep6, renderStep7];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate("/portal/advisor/cna")}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </button>

      {/* Progress */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-gray-500">
            Step {step + 1} of {STEPS.length}: {STEPS[step]}
          </p>
          <p className="text-xs text-gray-400">{Math.round(((step + 1) / STEPS.length) * 100)}%</p>
        </div>
        <Progress value={((step + 1) / STEPS.length) * 100} className="h-2" />
        <div className="flex justify-between mt-2">
          {STEPS.map((s, i) => (
            <button
              key={s}
              onClick={() => i <= step && setStep(i)}
              className={`text-[10px] hidden sm:block ${
                i === step ? "font-bold text-gray-900" : i < step ? "text-gray-500 cursor-pointer hover:text-gray-700" : "text-gray-300"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {stepRenderers[step]()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      {step < 7 && (
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          <Button
            onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))}
            disabled={!canProceed()}
            className="gap-2 text-white"
            style={{ background: BRAND_GREEN }}
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
