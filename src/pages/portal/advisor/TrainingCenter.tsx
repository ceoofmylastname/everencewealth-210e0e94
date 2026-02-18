import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { GraduationCap, Clock, Search, Play, CheckCircle, TrendingUp } from "lucide-react";

const GOLD = "hsla(51, 78%, 65%, 1)";
const GOLD_BG = "hsla(51, 78%, 65%, 0.12)";
const GOLD_BORDER = "hsla(51, 78%, 65%, 0.3)";
const GLASS = { background: "hsla(160,48%,21%,0.08)", border: "1px solid hsla(0,0%,100%,0.08)", backdropFilter: "blur(16px)" };

function getLevelStyle(level: string) {
  switch (level) {
    case "beginner": return { background: "hsla(160,48%,21%,0.3)", color: "hsla(160,60%,65%,1)", border: "1px solid hsla(160,48%,21%,0.5)" };
    case "intermediate": return { background: "hsla(220,60%,30%,0.3)", color: "hsla(220,70%,70%,1)", border: "1px solid hsla(220,60%,30%,0.5)" };
    case "advanced": return { background: "hsla(280,50%,30%,0.3)", color: "hsla(280,60%,70%,1)", border: "1px solid hsla(280,50%,30%,0.5)" };
    default: return { background: GOLD_BG, color: GOLD, border: `1px solid ${GOLD_BORDER}` };
  }
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer capitalize"
      style={active ? { background: GOLD_BG, color: GOLD, border: `1px solid ${GOLD_BORDER}` }
        : { background: "hsla(0,0%,100%,0.04)", color: "hsla(0,0%,100%,0.5)", border: "1px solid hsla(0,0%,100%,0.08)" }}>
      {label}
    </button>
  );
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

  useEffect(() => {
    if (!portalUser) return;
    Promise.all([
      supabase.from("trainings").select("*").eq("status", "published").order("category"),
      supabase.from("advisors").select("id").eq("portal_user_id", portalUser.id).maybeSingle(),
    ]).then(async ([t, a]) => {
      setTrainings(t.data ?? []);
      if (a.data) {
        const { data: prog } = await supabase.from("training_progress").select("training_id, progress_percent, completed").eq("advisor_id", a.data.id);
        setProgressRecords(prog ?? []);
      }
      setLoading(false);
    });
  }, [portalUser]);

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

  if (loading) return <div className="relative min-h-screen -m-4 sm:-m-6 lg:-m-8 flex justify-center items-center" style={{ background: "#020806" }}><div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: GOLD, borderTopColor: "transparent" }} /></div>;

  return (
    <div className="relative min-h-screen -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8" style={{ background: "#020806" }}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full opacity-30" style={{ background: "radial-gradient(circle, hsla(160,60%,25%,0.5) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute bottom-0 right-0 h-[350px] w-[350px] rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${GOLD_BG} 0%, transparent 70%)`, filter: "blur(80px)" }} />
      </div>
      <div className="relative z-10 space-y-6">
        <div>
          <span className="text-xs font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full" style={{ background: GOLD_BG, color: GOLD, border: `1px solid ${GOLD_BORDER}` }}>TRAINING CENTER</span>
          <h1 className="text-2xl font-black text-white mt-2" style={{ fontFamily: "'Playfair Display', serif" }}>Training Center</h1>
          <p className="text-white/50 mt-1 text-sm">Build your expertise with product training, sales techniques, and compliance education.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[{ label: "Trainings Completed", value: stats.completedCount, icon: CheckCircle }, { label: "Total Watch Time", value: `${stats.totalMinutes} min`, icon: Clock }, { label: "In Progress", value: stats.inProgressCount, icon: TrendingUp }].map(s => (
            <div key={s.label} className="rounded-2xl p-5 flex items-center gap-4" style={GLASS}>
              <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0" style={{ background: GOLD_BG }}>
                <s.icon className="h-5 w-5" style={{ color: GOLD }} />
              </div>
              <div>
                <p className="text-xs text-white/40">{s.label}</p>
                <p className="text-xl font-bold text-white">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl p-5 space-y-4" style={GLASS}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search trainings..." className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-0 focus-visible:border-white/20 rounded-xl" />
          </div>
          <div>
            <p className="text-xs font-medium text-white/40 mb-2">Category</p>
            <div className="flex flex-wrap gap-2">
              <FilterChip label="All" active={!selectedCategory} onClick={() => setSelectedCategory(null)} />
              {categories.map(cat => <FilterChip key={cat} label={cat.replace(/_/g, " ")} active={selectedCategory === cat} onClick={() => setSelectedCategory(cat)} />)}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-white/40 mb-2">Level</p>
            <div className="flex flex-wrap gap-2">
              <FilterChip label="All Levels" active={!selectedLevel} onClick={() => setSelectedLevel(null)} />
              {["beginner", "intermediate", "advanced"].map(lvl => <FilterChip key={lvl} label={lvl} active={selectedLevel === lvl} onClick={() => setSelectedLevel(lvl)} />)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(t => {
            const prog = progressMap[t.id];
            const isCompleted = prog?.completed ?? false;
            const percent = prog?.progress_percent ?? 0;
            return (
              <Link key={t.id} to={`/portal/advisor/training/${t.id}`} className="block">
                <div className="rounded-2xl overflow-hidden flex flex-col h-full transition-all" style={GLASS}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.border = "1px solid hsla(0,0%,100%,0.14)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.border = "1px solid hsla(0,0%,100%,0.08)"}>
                  {t.thumbnail_url ? (
                    <img src={t.thumbnail_url} alt={t.title} className="w-full h-40 object-cover" />
                  ) : (
                    <div className="w-full h-40 flex items-center justify-center" style={{ background: GOLD_BG }}>
                      <GraduationCap className="h-10 w-10 opacity-30" style={{ color: GOLD }} />
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={getLevelStyle(t.level)}>{t.level}</span>
                      {t.duration_minutes && (
                        <span className="text-xs text-white/40 flex items-center gap-1"><Clock className="h-3 w-3" />{t.duration_minutes}m</span>
                      )}
                      {isCompleted && <CheckCircle className="h-4 w-4 ml-auto" style={{ color: "hsla(160,60%,65%,1)" }} />}
                    </div>
                    <h3 className="font-semibold text-white mb-1">{t.title}</h3>
                    <p className="text-xs text-white/40 line-clamp-2 mb-3">{t.description}</p>
                    {percent > 0 && !isCompleted && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-white/40 mb-1"><span>Progress</span><span>{percent}%</span></div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsla(0,0%,100%,0.06)" }}>
                          <div className="h-full rounded-full" style={{ width: `${percent}%`, background: `linear-gradient(90deg, ${GOLD}, hsla(51,78%,65%,0.5))` }} />
                        </div>
                      </div>
                    )}
                    <div className="mt-auto">
                      <button className="w-full py-1.5 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all"
                        style={{ background: GOLD_BG, color: GOLD, border: `1px solid ${GOLD_BORDER}` }}>
                        <Play className="h-3 w-3" />
                        {isCompleted ? "Watch Again" : percent > 0 ? "Continue" : "Start Training"}
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 rounded-2xl" style={GLASS}>
            <GraduationCap className="h-12 w-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/50">No trainings match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
