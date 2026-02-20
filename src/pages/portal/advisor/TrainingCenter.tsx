import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Input } from "@/components/ui/input";
import { GraduationCap, Clock, Search, Play, CheckCircle, TrendingUp } from "lucide-react";

const BRAND_GREEN = "#1A4D3E";
const inputCls = "border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 rounded-lg";

function getLevelBadge(level: string) {
  switch (level) { case "beginner": return "bg-emerald-50 text-emerald-700 border border-emerald-200"; case "intermediate": return "bg-blue-50 text-blue-700 border border-blue-200"; case "advanced": return "bg-purple-50 text-purple-700 border border-purple-200"; default: return "bg-gray-100 text-gray-600 border border-gray-200"; }
}
function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (<button onClick={onClick} className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer capitalize border ${active ? "text-white border-transparent" : "border-gray-200 text-gray-600 bg-white hover:bg-gray-50"}`} style={active ? { background: BRAND_GREEN } : {}}>{label}</button>);
}

interface TrainingProgress { training_id: string; progress_percent: number; completed: boolean; }

export default function TrainingCenter() {
  const { portalUser } = usePortalAuth();
  const [trainings, setTrainings] = useState<any[]>([]);
  const [progressRecords, setProgressRecords] = useState<TrainingProgress[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (portalUser) loadData(); }, [portalUser]);

  async function loadData() {
    const [t, a] = await Promise.all([
      supabase.from("trainings").select("*").eq("status", "published").order("category"),
      supabase.from("advisors").select("id").eq("portal_user_id", portalUser!.id).maybeSingle(),
    ]);
    setTrainings(t.data ?? []);
    if (a.data) {
      const { data: prog } = await supabase.from("training_progress").select("training_id, progress_percent, completed").eq("advisor_id", a.data.id);
      setProgressRecords(prog ?? []);
    }
    setLoading(false);
  }

  const progressMap = useMemo(() => { const map: Record<string, TrainingProgress> = {}; progressRecords.forEach(p => { map[p.training_id] = p; }); return map; }, [progressRecords]);
  const categories = useMemo(() => [...new Set(trainings.map(t => t.category))], [trainings]);
  const filtered = useMemo(() => trainings.filter(t => {
    const matchesSearch = !searchQuery || t.title?.toLowerCase().includes(searchQuery.toLowerCase()) || t.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && (!selectedCategory || t.category === selectedCategory) && (!selectedLevel || t.level === selectedLevel);
  }), [trainings, searchQuery, selectedCategory, selectedLevel]);

  const stats = useMemo(() => {
    const completed = progressRecords.filter(p => p.completed);
    const inProgress = progressRecords.filter(p => p.progress_percent > 0 && !p.completed);
    const totalMinutes = completed.reduce((sum, p) => { const tr = trainings.find(t => t.id === p.training_id); return sum + (tr?.duration_minutes ?? 0); }, 0);
    return { completedCount: completed.length, totalMinutes, inProgressCount: inProgress.length };
  }, [progressRecords, trainings]);

  if (loading) return <div className="flex justify-center items-center min-h-[400px]"><div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: BRAND_GREEN, borderTopColor: "transparent" }} /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Training Center</h1>
        <p className="text-sm text-gray-500 mt-0.5">Build your expertise with product training, sales techniques, and compliance education.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[{ label: "Trainings Completed", value: stats.completedCount, icon: CheckCircle }, { label: "Total Watch Time", value: `${stats.totalMinutes} min`, icon: Clock }, { label: "In Progress", value: stats.inProgressCount, icon: TrendingUp }].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${BRAND_GREEN}15` }}><s.icon className="h-5 w-5" style={{ color: BRAND_GREEN }} /></div>
            <div><p className="text-xs text-gray-500">{s.label}</p><p className="text-xl font-bold text-gray-900">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search trainings..." className={`pl-10 ${inputCls}`} /></div>
        <div><p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Category</p><div className="flex flex-wrap gap-2"><FilterChip label="All" active={!selectedCategory} onClick={() => setSelectedCategory(null)} />{categories.map(cat => <FilterChip key={cat} label={cat.replace(/_/g, " ")} active={selectedCategory === cat} onClick={() => setSelectedCategory(cat)} />)}</div></div>
        <div><p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Level</p><div className="flex flex-wrap gap-2"><FilterChip label="All Levels" active={!selectedLevel} onClick={() => setSelectedLevel(null)} />{["beginner", "intermediate", "advanced"].map(lvl => <FilterChip key={lvl} label={lvl} active={selectedLevel === lvl} onClick={() => setSelectedLevel(lvl)} />)}</div></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(t => {
          const prog = progressMap[t.id];
          const isCompleted = prog?.completed ?? false;
          const percent = prog?.progress_percent ?? 0;
          return (
            <Link key={t.id} to={`/portal/advisor/training/${t.id}`} className="block">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md hover:border-gray-200 transition-all">
                {t.thumbnail_url ? (<img src={t.thumbnail_url} alt={t.title} className="w-full h-40 object-cover" />) : (<div className="w-full h-40 flex items-center justify-center bg-gray-50"><GraduationCap className="h-10 w-10 text-gray-300" /></div>)}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${getLevelBadge(t.level)}`}>{t.level}</span>
                    {t.duration_minutes && <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="h-3 w-3" />{t.duration_minutes}m</span>}
                    {isCompleted && <CheckCircle className="h-4 w-4 ml-auto text-emerald-500" />}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{t.title}</h3>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-3">{t.description}</p>
                  {percent > 0 && !isCompleted && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1"><span>Progress</span><span>{percent}%</span></div>
                      <div className="h-1.5 rounded-full overflow-hidden bg-gray-100"><div className="h-full rounded-full" style={{ width: `${percent}%`, background: BRAND_GREEN }} /></div>
                    </div>
                  )}
                  <div className="mt-auto">
                    <button className="w-full py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-2 text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}>
                      <Play className="h-3 w-3" />{isCompleted ? "Watch Again" : percent > 0 ? "Continue" : "Start Training"}
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm text-center py-12"><GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No trainings match your filters</p></div>
      )}
    </div>
  );
}
