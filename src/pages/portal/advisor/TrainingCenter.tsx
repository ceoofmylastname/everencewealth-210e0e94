import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap, Clock, Search, Play, CheckCircle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const levelColors: Record<string, string> = {
  beginner: "bg-green-100 text-green-800",
  intermediate: "bg-blue-100 text-blue-800",
  advanced: "bg-purple-100 text-purple-800",
};

interface TrainingProgress {
  training_id: string;
  progress_percent: number;
  completed: boolean;
}

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
        const { data: prog } = await supabase
          .from("training_progress")
          .select("training_id, progress_percent, completed")
          .eq("advisor_id", a.data.id);
        setProgressRecords(prog ?? []);
      }
      setLoading(false);
    });
  }, [portalUser]);

  const progressMap = useMemo(() => {
    const map: Record<string, TrainingProgress> = {};
    progressRecords.forEach(p => { map[p.training_id] = p; });
    return map;
  }, [progressRecords]);

  const categories = useMemo(() => [...new Set(trainings.map(t => t.category))], [trainings]);

  const filtered = useMemo(() => {
    return trainings.filter(t => {
      const matchesSearch = !searchQuery ||
        t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = !selectedCategory || t.category === selectedCategory;
      const matchesLevel = !selectedLevel || t.level === selectedLevel;
      return matchesSearch && matchesCat && matchesLevel;
    });
  }, [trainings, searchQuery, selectedCategory, selectedLevel]);

  const stats = useMemo(() => {
    const completed = progressRecords.filter(p => p.completed);
    const inProgress = progressRecords.filter(p => p.progress_percent > 0 && !p.completed);
    const totalMinutes = completed.reduce((sum, p) => {
      const training = trainings.find(t => t.id === p.training_id);
      return sum + (training?.duration_minutes ?? 0);
    }, 0);
    return { completedCount: completed.length, totalMinutes, inProgressCount: inProgress.length };
  }, [progressRecords, trainings]);

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>Training Center</h1>
        <p className="text-muted-foreground mt-1">Build your expertise with product training, sales techniques, and compliance education.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Trainings Completed", value: stats.completedCount, icon: CheckCircle },
          { label: "Total Watch Time", value: `${stats.totalMinutes} min`, icon: Clock },
          { label: "In Progress", value: stats.inProgressCount, icon: TrendingUp },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search trainings..."
              className="pl-10"
            />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Category</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant={!selectedCategory ? "default" : "outline"} className="cursor-pointer capitalize" onClick={() => setSelectedCategory(null)}>All</Badge>
              {categories.map(cat => (
                <Badge key={cat} variant={selectedCategory === cat ? "default" : "outline"} className="cursor-pointer capitalize" onClick={() => setSelectedCategory(cat)}>
                  {cat.replace(/_/g, " ")}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Level</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant={!selectedLevel ? "default" : "outline"} className="cursor-pointer" onClick={() => setSelectedLevel(null)}>All Levels</Badge>
              {["beginner", "intermediate", "advanced"].map(lvl => (
                <Badge key={lvl} variant={selectedLevel === lvl ? "default" : "outline"} className="cursor-pointer capitalize" onClick={() => setSelectedLevel(lvl)}>
                  {lvl}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(t => {
          const prog = progressMap[t.id];
          const isCompleted = prog?.completed ?? false;
          const percent = prog?.progress_percent ?? 0;

          return (
            <Link key={t.id} to={`/portal/advisor/training/${t.id}`} className="block">
              <Card className="hover:shadow-md transition-shadow h-full flex flex-col overflow-hidden">
                {t.thumbnail_url ? (
                  <img src={t.thumbnail_url} alt={t.title} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <GraduationCap className="h-10 w-10 text-primary/40" />
                  </div>
                )}
                <CardContent className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={cn("text-xs", levelColors[t.level] || "")}>{t.level}</Badge>
                    {t.duration_minutes && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{t.duration_minutes}m</span>
                    )}
                    {isCompleted && <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />}
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{t.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{t.description}</p>

                  {percent > 0 && !isCompleted && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span><span>{percent}%</span>
                      </div>
                      <Progress value={percent} className="h-1.5" />
                    </div>
                  )}

                  <div className="mt-auto">
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <Play className="h-3 w-3" />
                      {isCompleted ? "Watch Again" : percent > 0 ? "Continue" : "Start Training"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No trainings match your filters</p>
        </div>
      )}
    </div>
  );
}
