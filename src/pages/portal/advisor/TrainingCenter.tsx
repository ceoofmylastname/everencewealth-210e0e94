import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const levelColors: Record<string, string> = {
  beginner: "bg-green-100 text-green-800",
  intermediate: "bg-blue-100 text-blue-800",
  advanced: "bg-purple-100 text-purple-800",
};

export default function TrainingCenter() {
  const { portalUser } = usePortalAuth();
  const [trainings, setTrainings] = useState<any[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!portalUser) return;
    Promise.all([
      supabase.from("trainings").select("*").eq("status", "published").order("category"),
      supabase.from("advisors").select("id").eq("portal_user_id", portalUser.id).maybeSingle(),
    ]).then(async ([t, a]) => {
      setTrainings(t.data ?? []);
      if (a.data) {
        const { data: prog } = await supabase.from("training_progress").select("training_id, progress_percent").eq("advisor_id", a.data.id);
        const map: Record<string, number> = {};
        prog?.forEach(p => { map[p.training_id] = p.progress_percent; });
        setProgress(map);
      }
      setLoading(false);
    });
  }, [portalUser]);

  const categories = ["all", ...new Set(trainings.map(t => t.category))];
  const filtered = filter === "all" ? trainings : trainings.filter(t => t.category === filter);

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>Training Center</h1>
        <p className="text-muted-foreground mt-1">Level up your skills with our training library.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <Badge key={cat} variant={filter === cat ? "default" : "outline"} className="cursor-pointer capitalize"
            onClick={() => setFilter(cat)}>{cat.replace(/_/g, " ")}</Badge>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(t => (
          <Link key={t.id} to={`/portal/advisor/training/${t.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{t.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{t.description}</p>
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={cn("text-xs", levelColors[t.level] || "")}>{t.level}</Badge>
                  {t.duration_minutes && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{t.duration_minutes}m</span>
                  )}
                </div>
                <Progress value={progress[t.id] ?? 0} className="h-1.5" />
                <p className="text-xs text-muted-foreground mt-1">{progress[t.id] ?? 0}% complete</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
