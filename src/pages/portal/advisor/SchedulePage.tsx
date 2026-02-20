import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Clock, Video, Users, Plus, Pencil, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const BRAND_GREEN = "#1A4D3E";

const typeColors: Record<string, string> = {
  training: "bg-blue-50 text-blue-700 border border-blue-200",
  webinar: "bg-purple-50 text-purple-700 border border-purple-200",
  call: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  meeting: "bg-amber-50 text-amber-700 border border-amber-200",
  other: "bg-gray-100 text-gray-600 border border-gray-200",
};

function getEventIcon(type: string) {
  switch (type) { case "training": case "webinar": return Video; case "call": return Users; default: return Calendar; }
}

const defaultNewEvent = { title: "", description: "", event_date: new Date().toISOString().split("T")[0], event_time: "10:00", event_type: "meeting" };
const inputCls = "border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 rounded-lg";

export default function SchedulePage() {
  const { portalUser } = usePortalAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [form, setForm] = useState({ ...defaultNewEvent });

  useEffect(() => { loadEvents(); }, []);

  async function loadEvents() {
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase.from("schedule_events").select("*, creator:portal_users!schedule_events_created_by_fkey(role)").gte("event_date", today).order("event_date").order("event_time");
    const filtered = (data ?? []).filter(
      (e: any) => e.creator?.role === 'admin' || e.created_by === portalUser?.id
    );
    setEvents(filtered); setLoading(false);
  }

  function openAdd() { setEditingEvent(null); setForm({ ...defaultNewEvent }); setShowDialog(true); }
  function openEdit(ev: any) {
    setEditingEvent(ev);
    setForm({ title: ev.title, description: ev.description || "", event_date: ev.event_date, event_time: ev.event_time || "10:00", event_type: ev.event_type || "meeting" });
    setShowDialog(true);
  }

  async function handleSave() {
    if (!portalUser) return;
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    if (editingEvent) {
      const { error } = await supabase.from("schedule_events").update(form).eq("id", editingEvent.id);
      if (error) { toast.error("Failed to update event"); return; }
      toast.success("Event updated!");
    } else {
      const { error } = await supabase.from("schedule_events").insert({ ...form, created_by: portalUser.id });
      if (error) { toast.error("Failed to create event"); return; }
      toast.success("Event created!");
    }
    setShowDialog(false); setForm({ ...defaultNewEvent }); loadEvents();
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("schedule_events").delete().eq("id", id);
    if (error) { toast.error("Failed to delete event"); return; }
    toast.success("Event deleted"); loadEvents();
  }

  // Agents can only manage their own events
  const canManage = (event: any) => event.created_by === portalUser?.id;

  const groupedEvents = useMemo(() => events.reduce<Record<string, any[]>>((acc, event) => {
    const date = event.event_date; if (!acc[date]) acc[date] = []; acc[date].push(event); return acc;
  }, {}), [events]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule &amp; Events</h1>
          <p className="text-sm text-gray-500 mt-0.5">View upcoming trainings, meetings, and webinars</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}>
          <Plus className="h-4 w-4" /> Add Event
        </button>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader><DialogTitle className="text-gray-900">{editingEvent ? "Edit Event" : "Create New Event"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div><label className="text-sm font-medium text-gray-600">Title</label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Event title..." className={inputCls} /></div>
            <div><label className="text-sm font-medium text-gray-600">Description</label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Event description..." rows={3} className={inputCls} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium text-gray-600">Date</label><Input type="date" value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })} className={inputCls} /></div>
              <div><label className="text-sm font-medium text-gray-600">Time</label><Input type="time" value={form.event_time} onChange={e => setForm({ ...form, event_time: e.target.value })} className={inputCls} /></div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Type</label>
              <select value={form.event_type} onChange={e => setForm({ ...form, event_type: e.target.value })}
                className="w-full mt-1 rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white text-gray-900 focus:ring-1 focus:outline-none">
                <option value="meeting">Meeting</option><option value="training">Training</option>
                <option value="webinar">Webinar</option><option value="call">Call</option><option value="other">Other</option>
              </select>
            </div>
            <button onClick={handleSave} className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}>{editingEvent ? "Update Event" : "Create Event"}</button>
          </div>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: BRAND_GREEN, borderTopColor: "transparent" }} /></div>
      ) : Object.keys(groupedEvents).length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No upcoming events</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedEvents).map(([date, dateEvents]) => (
            <div key={date}>
              <h2 className="text-xs font-bold uppercase tracking-widest mb-3 text-gray-400">
                {new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </h2>
              <div className="space-y-3">
                {dateEvents.map((event: any) => {
                  const EventIcon = getEventIcon(event.event_type);
                  const isAdmin = event.creator?.role === "admin";
                  return (
                    <div key={event.id} className={`bg-white rounded-xl border shadow-sm p-4 hover:shadow-md transition-all ${isAdmin ? "border-l-4 border-l-amber-400 border-gray-100" : "border-l-4 border-l-emerald-400 border-gray-100"}`}>
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${BRAND_GREEN}15` }}>
                          <EventIcon className="h-5 w-5" style={{ color: BRAND_GREEN }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium text-gray-900">{event.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Clock className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">{event.event_time}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isAdmin ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
                                {isAdmin ? "Admin" : "Agent"}
                              </span>
                              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${typeColors[event.event_type] || typeColors.other}`}>
                                {event.event_type}
                              </span>
                              {canManage(event) && (
                                <>
                                  <button onClick={() => openEdit(event)} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"><Pencil className="h-3.5 w-3.5" /></button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild><button className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button></AlertDialogTrigger>
                                    <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete this event?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(event.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                                  </AlertDialog>
                                </>
                              )}
                            </div>
                          </div>
                          {event.description && <p className="text-sm text-gray-500 mt-2">{event.description}</p>}
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
  );
}
