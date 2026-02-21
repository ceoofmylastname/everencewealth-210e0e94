import { useContractingAuth } from "@/hooks/useContractingAuth";
import { useContractingAnalytics } from "@/hooks/useContractingAnalytics";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, TrendingUp, Bell, Activity } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend,
} from "recharts";

const BRAND = "#1A4D3E";
const ACCENT = "#EBD975";
const COLORS = ["#3B82F6", "#8B5CF6", "#F59E0B", "#EC4899", "#10B981", "#6366F1", "#14B8A6", "#1A4D3E"];

export default function ContractingAnalytics() {
  const { contractingRole, canManage, canViewAll, loading: authLoading } = useContractingAuth();
  const { data, isLoading, error } = useContractingAnalytics();

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${BRAND} transparent ${BRAND} ${BRAND}` }} />
      </div>
    );
  }

  if (!canManage && !canViewAll) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">You don't have access to analytics.</p>
        <Link to="/portal/advisor/contracting" className="text-sm underline mt-2 inline-block" style={{ color: BRAND }}>Back to Dashboard</Link>
      </div>
    );
  }

  if (error || !data) {
    return <div className="text-center py-20 text-red-500">Failed to load analytics.</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/portal/advisor/contracting" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contracting Analytics</h1>
          <p className="text-sm text-gray-500">Pipeline insights and onboarding metrics</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={<Clock className="h-5 w-5" />} label="Avg Onboarding Time" value={`${data.avgOnboardingDays} days`} color="#3B82F6" />
        <KpiCard icon={<TrendingUp className="h-5 w-5" />} label="Completion Rate" value={`${data.completionRate}%`} color="#10B981" />
        <KpiCard icon={<Bell className="h-5 w-5" />} label="Active Reminders" value={String(data.activeReminders)} color="#F59E0B" />
        <KpiCard icon={<Activity className="h-5 w-5" />} label="Activity (30d)" value={String(data.totalActivityLogs)} color="#8B5CF6" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Drop-off Funnel */}
        <ChartCard title="Pipeline Funnel" subtitle="Agents at each stage">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.funnelData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="stage" type="category" tick={{ fontSize: 11 }} width={80} />
              <Tooltip />
              <Bar dataKey="count" fill={BRAND} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Time per Stage */}
        <ChartCard title="Avg Time Per Stage" subtitle="Days from start to step completion">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.stageTimeData} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="stage" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="avgDays" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reminder Distribution */}
        <ChartCard title="Reminder Distribution" subtitle="Active reminders by escalation phase">
          {data.reminderData.length === 0 ? (
            <div className="flex items-center justify-center h-[250px] text-gray-400 text-sm">No active reminders</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={data.reminderData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                  {data.reminderData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Activity Frequency */}
        <ChartCard title="Activity Frequency" subtitle="Actions per day (last 30 days)">
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data.activityData} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke={BRAND} fill={`${BRAND}20`} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Drop-off Steps Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Top Drop-Off Steps</h3>
        <p className="text-sm text-gray-500 mb-4">Steps where agents are most frequently stuck</p>
        {data.dropOffSteps.length === 0 ? (
          <p className="text-sm text-gray-400">No incomplete steps found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-4 font-medium text-gray-500">Step</th>
                  <th className="text-left py-2 pr-4 font-medium text-gray-500">Stage</th>
                  <th className="text-right py-2 font-medium text-gray-500">Stuck Agents</th>
                </tr>
              </thead>
              <tbody>
                {data.dropOffSteps.map((s, i) => (
                  <tr key={s.stepId} className="border-b border-gray-50">
                    <td className="py-2.5 pr-4 text-gray-700">{s.title}</td>
                    <td className="py-2.5 pr-4 text-gray-500">{s.stage}</td>
                    <td className="py-2.5 text-right">
                      <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700">
                        {s.count}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] p-5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, color }}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{subtitle}</p>
      {children}
    </div>
  );
}
