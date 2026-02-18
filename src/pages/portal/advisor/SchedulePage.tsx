import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Clock, Video, Users, Plus } from "lucide-react";
import { toast } from "sonner";

const GOLD = "hsla(51, 78%, 65%, 1)";
const GOLD_BG = "hsla(51, 78%, 65%, 0.12)";
const GOLD_BORDER = "hsla(51, 78%, 65%, 0.3)";
const GLASS = { background: "hsla(160,48%,21%,0.08)", border: "1px solid hsla(0,0%,100%,0.08)", backdropFilter: "blur(16px)" };

const typeColors: Record<string, { bg: string; color: string; border: string }> = {
  training: { bg: "hsla(220,60%,30%,0.3)", color: "hsla(220,70%,70%,1)", border: "1px solid hsla(220,60%,30%,0.5)" },
  webinar: { bg: "hsla(280,50%,30%,0.3)", color: "hsla(280,60%,70%,1)", border: "1px solid hsla(280,50%,30%,0.5)" },
  call: { bg: "hsla(160,48%,21%,0.3)", color: "hsla(160,60%,65%,1)", border: "1px solid hsla(160,48%,21%,0.5)" },
  meeting: { bg: GOLD_BG, color: GOLD, border: `1px solid ${GOLD_BORDER}` },
  other: { bg: "hsla(0,0%,100%,0.06)", color: "hsla(0,0%,100%,0.5)", border: "1px solid hsla(0,0%,100%,0.1)" },
};

function getEventIcon(type: string) {
  switch (type) { case "training": case "webinar": return Video; case "call": return Users; default: return Calendar; }
}

const defaultNewEvent = { title: "", description: "", event_date: new Date().toISOString().split("T")[0], event_time: "10:00", event_type: "meeting" };
const inputCls = "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-0 focus-visible:border-white/20 rounded-xl";

export default function SchedulePage() {
  const { portalUser } = usePortalAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newEvent, setNewEvent] = useState({ ...defaultNewEvent });

  useEffect(() => { loadEvents(); }, []);

  async function loadEvents() {
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase.from("schedule_events").select("*").gte("event_date", today).order("event_date").order("event_time");
    setEvents(data ?? []); setLoading(false);
  }

  async function handleAddEvent() {
    if (!portalUser) return;
    if (!newEvent.title.trim()) { toast.error("Title is required"); return; }
    const { error } = await supabase.from("schedule_events").insert({ ...newEvent, created_by: portalUser.id });
    if (error) { toast.error("Failed to create event"); return; }
    toast.success("Event created!"); setShowAddDialog(false); setNewEvent({ ...defaultNewEvent }); loadEvents();
  }

  const groupedEvents = useMemo(() => events.reduce<Record<string, any[]>>((acc, event) => {
    const date = event.event_date; if (!acc[date]) acc[date] = []; acc[date].push(event); return acc;
  }, {}), [events]);

  return (
    <div className="relative min-h-screen -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8" style={{ background: "#020806" }}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full opacity-30" style={{ background: "radial-gradient(circle, hsla(160,60%,25%,0.5) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute bottom-0 right-0 h-[350px] w-[350px] rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${GOLD_BG} 0%, transparent 70%)`, filter: "blur(80px)" }} />
      </div>
      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full" style={{ background: GOLD_BG, color: GOLD, border: `1px solid ${GOLD_BORDER}` }}>SCHEDULE</span>
            <h1 className="text-2xl font-black text-white mt-2" style={{ fontFamily: "'Playfair Display', serif" }}>Schedule &amp; Events</h1>
            <p className="text-white/50 mt-1 text-sm">View upcoming trainings, meetings, and webinars</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: GOLD_BG, color: GOLD, border: `1px solid ${GOLD_BORDER}` }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = `0 0 24px ${GOLD_BG}`}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = "none"}>
                <Plus className="h-4 w-4" /> Add Event
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-md" style={{ background: "#0c1a14", border: "1px solid hsla(0,0%,100%,0.08)" }}>
              <DialogHeader><DialogTitle className="text-white">Create New Event</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-2">
                <div><label className="text-sm font-medium text-white/60">Title</label><Input value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="Event title..." className={inputCls} /></div>
                <div><label className="text-sm font-medium text-white/60">Description</label><Textarea value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} placeholder="Event description..." rows={3} className={inputCls} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium text-white/60">Date</label><Input type="date" value={newEvent.event_date} onChange={e => setNewEvent({ ...newEvent, event_date: e.target.value })} className={inputCls} /></div>
                  <div><label className="text-sm font-medium text-white/60">Time</label><Input type="time" value={newEvent.event_time} onChange={e => setNewEvent({ ...newEvent, event_time: e.target.value })} className={inputCls} /></div>
                </div>
                <div>
                  <label className="text-sm font-medium text-white/60">Type</label>
                  <select value={newEvent.event_type} onChange={e => setNewEvent({ ...newEvent, event_type: e.target.value })}
                    className="w-full mt-1 rounded-xl border px-3 py-2 text-sm bg-white/5 border-white/10 text-white">
                    <option value="meeting">Meeting</option><option value="training">Training</option>
                    <option value="webinar">Webinar</option><option value="call">Call</option><option value="other">Other</option>
                  </select>
                </div>
                <button onClick={handleAddEvent} className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: GOLD_BG, color: GOLD, border: `1px solid ${GOLD_BORDER}` }}>Create Event</button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: GOLD, borderTopColor: "transparent" }} /></div>
        ) : Object.keys(groupedEvents).length === 0 ? (
          <div className="p-12 text-center rounded-2xl" style={GLASS}>
            <Calendar className="h-12 w-12 text-white/20 mx-auto mb-4" />
            <p className="text-lg text-white/50">No upcoming events</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedEvents).map(([date, dateEvents]) => (
              <div key={date}>
                <h2 className="text-sm font-bold uppercase tracking-[0.15em] mb-3" style={{ color: GOLD }}>
                  {new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </h2>
                <div className="space-y-3">
                  {dateEvents.map((event: any) => {
                    const EventIcon = getEventIcon(event.event_type);
                    const typeStyle = typeColors[event.event_type] || typeColors.other;
                    return (
                      <div key={event.id} className="rounded-2xl p-4" style={GLASS}>
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: GOLD_BG }}>
                            <EventIcon className="h-6 w-6" style={{ color: GOLD }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-medium text-white">{event.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Clock className="h-3 w-3 text-white/30" />
                                  <span className="text-xs text-white/40">{event.event_time}</span>
                                </div>
                              </div>
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                                style={{ background: typeStyle.bg, color: typeStyle.color, border: typeStyle.border }}>
                                {event.event_type}
                              </span>
                            </div>
                            {event.description && <p className="text-sm text-white/40 mt-2">{event.description}</p>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
