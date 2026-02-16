import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function TrainingDetail() {
  const { id } = useParams<{ id: string }>();
  const { portalUser } = usePortalAuth();
  const [training, setTraining] = useState<any>(null);
  const [advisorId, setAdvisorId] = useState<string | null>(null);
  const [progressPercent, setProgressPercent] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !portalUser) return;
    Promise.all([
      supabase.from("trainings").select("*").eq("id", id).single(),
      supabase.from("advisors").select("id").eq("portal_user_id", portalUser.id).maybeSingle(),
    ]).then(async ([t, a]) => {
      setTraining(t.data);
      if (a.data) {
        setAdvisorId(a.data.id);
        const { data: prog } = await supabase.from("training_progress")
          .select("*").eq("advisor_id", a.data.id).eq("training_id", id!).maybeSingle();
        if (prog) { setProgressPercent(prog.progress_percent); setCompleted(prog.completed); }
      }
      setLoading(false);
    });
  }, [id, portalUser]);

  async function markComplete() {
    if (!advisorId || !id) return;
    const { error } = await supabase.from("training_progress").upsert({
      advisor_id: advisorId, training_id: id, progress_percent: 100, completed: true, completed_at: new Date().toISOString(),
    }, { onConflict: "advisor_id,training_id" });
    if (error) { toast.error("Failed to update progress"); return; }
    setProgressPercent(100);
    setCompleted(true);
    toast.success("Training marked as complete!");
  }

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!training) return <p className="text-muted-foreground">Training not found.</p>;

  return (
    <div className="space-y-6">
      <Link to="/portal/advisor/training"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back to Training</Button></Link>

      <div>
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>{training.title}</h1>
        <div className="flex items-center gap-3 mt-2">
          <Badge variant="outline" className="capitalize">{training.level}</Badge>
          <Badge variant="outline" className="capitalize">{training.category.replace(/_/g, " ")}</Badge>
          {training.duration_minutes && <span className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{training.duration_minutes} min</span>}
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex-1 mr-4">
            <Progress value={progressPercent} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">{progressPercent}% complete</p>
          </div>
          {completed ? (
            <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
          ) : (
            <Button size="sm" onClick={markComplete}>Mark Complete</Button>
          )}
        </CardContent>
      </Card>

      {/* Video */}
      {training.video_url && (
        <Card>
          <CardContent className="p-0">
            <div className="aspect-video">
              <iframe src={training.video_url} className="w-full h-full rounded-lg" allowFullScreen />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Description */}
      {training.description && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Description</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">{training.description}</p></CardContent>
        </Card>
      )}

      {/* Transcript */}
      {training.transcript && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Transcript</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground whitespace-pre-wrap">{training.transcript}</p></CardContent>
        </Card>
      )}
    </div>
  );
}
