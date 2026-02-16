import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, Clock } from "lucide-react";

const typeColors: Record<string, string> = {
  training: "bg-purple-100 text-purple-800",
  meeting: "bg-blue-100 text-blue-800",
  webinar: "bg-green-100 text-green-800",
  call: "bg-amber-100 text-amber-800",
  other: "bg-gray-100 text-gray-800",
};

export default function SchedulePage() {
  const [events, setEvents] = useState<any[]>([]);
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    supabase.from("schedule_events").select("*")
      .gte("event_date", today).order("event_date").order("event_time")
      .then(({ data }) => { setEvents(data ?? []); setLoading(false); });
  }, []);

  const filtered = dateFilter ? events.filter(e => e.event_date === dateFilter) : events;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>Schedule</h1>
        <p className="text-muted-foreground mt-1">View upcoming events and meetings.</p>
      </div>

      <div className="max-w-xs">
        <Input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No upcoming events.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(e => (
            <Card key={e.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center">
                    <span className="text-xs font-bold text-primary">{new Date(e.event_date + "T00:00:00").toLocaleDateString("en-US", { month: "short" })}</span>
                    <span className="text-lg font-bold text-primary leading-none">{new Date(e.event_date + "T00:00:00").getDate()}</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{e.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{e.event_time}</span>
                    </div>
                    {e.description && <p className="text-xs text-muted-foreground mt-1">{e.description}</p>}
                  </div>
                </div>
                <Badge className={typeColors[e.event_type] || typeColors.other + " text-xs capitalize"}>{e.event_type}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
