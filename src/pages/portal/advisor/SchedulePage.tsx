import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar, Clock, Video, Users, Plus } from "lucide-react";
import { toast } from "sonner";

const typeColors: Record<string, string> = {
  training: "bg-blue-100 text-blue-800",
  webinar: "bg-purple-100 text-purple-800",
  call: "bg-green-100 text-green-800",
  meeting: "bg-amber-100 text-amber-800",
  other: "bg-gray-100 text-gray-800",
};

function getEventIcon(type: string) {
  switch (type) {
    case "training":
    case "webinar":
      return Video;
    case "call":
      return Users;
    default:
      return Calendar;
  }
}

const defaultNewEvent = {
  title: "",
  description: "",
  event_date: new Date().toISOString().split("T")[0],
  event_time: "10:00",
  event_type: "meeting",
};

export default function SchedulePage() {
  const { portalUser } = usePortalAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newEvent, setNewEvent] = useState({ ...defaultNewEvent });

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("schedule_events")
      .select("*")
      .gte("event_date", today)
      .order("event_date")
      .order("event_time");
    setEvents(data ?? []);
    setLoading(false);
  }

  async function handleAddEvent() {
    if (!portalUser) return;
    if (!newEvent.title.trim()) {
      toast.error("Title is required");
      return;
    }

    const { error } = await supabase.from("schedule_events").insert({
      ...newEvent,
      created_by: portalUser.id,
    });

    if (error) {
      toast.error("Failed to create event");
      return;
    }

    toast.success("Event created!");
    setShowAddDialog(false);
    setNewEvent({ ...defaultNewEvent });
    loadEvents();
  }

  const groupedEvents = useMemo(() => {
    return events.reduce<Record<string, any[]>>((acc, event) => {
      const date = event.event_date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(event);
      return acc;
    }, {});
  }, [events]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
            Schedule &amp; Events
          </h1>
          <p className="text-muted-foreground mt-1">View upcoming trainings, meetings, and webinars</p>
        </div>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Event title..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Event description..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    value={newEvent.event_date}
                    onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Time</label>
                  <Input
                    type="time"
                    value={newEvent.event_time}
                    onChange={(e) => setNewEvent({ ...newEvent, event_time: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <select
                  value={newEvent.event_type}
                  onChange={(e) => setNewEvent({ ...newEvent, event_type: e.target.value })}
                  className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="meeting">Meeting</option>
                  <option value="training">Training</option>
                  <option value="webinar">Webinar</option>
                  <option value="call">Call</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <Button onClick={handleAddEvent} className="w-full">Create Event</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : Object.keys(groupedEvents).length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">No upcoming events</p>
          <p className="text-sm text-muted-foreground mt-2">Create your first event using the button above</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedEvents).map(([date, dateEvents]) => (
            <div key={date}>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                {new Date(date + "T00:00:00").toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h2>
              <div className="space-y-3">
                {dateEvents.map((event: any) => {
                  const EventIcon = getEventIcon(event.event_type);
                  return (
                    <Card key={event.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <EventIcon className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-medium text-foreground">{event.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">{event.event_time}</span>
                                </div>
                              </div>
                              <Badge className={typeColors[event.event_type] || typeColors.other}>
                                {event.event_type}
                              </Badge>
                            </div>
                            {event.description && (
                              <p className="text-sm text-muted-foreground mt-2">{event.description}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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
