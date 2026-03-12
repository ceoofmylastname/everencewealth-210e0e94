import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, Plus, X, Trash2, ChevronDown, ChevronRight, Calendar, Image, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SocorroAdvisor, SocorroAvailabilitySlot } from "@/types/socorro";

const WORKSHOP_DATES = [
  { value: "2026-03-24", label: "Mon Mar 24" },
  { value: "2026-03-25", label: "Tue Mar 25" },
  { value: "2026-03-26", label: "Wed Mar 26" },
  { value: "2026-03-27", label: "Thu Mar 27" },
  { value: "2026-03-28", label: "Fri Mar 28" },
];

const TIME_SLOTS = [
  "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
];

export default function AdminSocorroApproval() {
  const { portalUser } = usePortalAuth();
  const { toast } = useToast();
  const [advisors, setAdvisors] = useState<SocorroAdvisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newAdvisor, setNewAdvisor] = useState({
    first_name: "",
    last_name: "",
    email: "",
    headshot_url: "",
    bio: "",
  });

  useEffect(() => {
    loadAdvisors();
  }, []);

  const loadAdvisors = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("socorro_workshop_advisors" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setAdvisors((data ?? []) as unknown as SocorroAdvisor[]);
    } catch (err) {
      console.error("Failed to load advisors:", err);
    } finally {
      setLoading(false);
    }
  };

  const addAdvisor = async () => {
    if (!newAdvisor.first_name.trim() || !newAdvisor.last_name.trim() || !newAdvisor.email.trim()) {
      toast({ title: "Missing fields", description: "First name, last name, and email are required.", variant: "destructive" });
      return;
    }
    setAdding(true);
    try {
      const { error } = await supabase
        .from("socorro_workshop_advisors" as any)
        .insert({
          first_name: newAdvisor.first_name.trim(),
          last_name: newAdvisor.last_name.trim(),
          email: newAdvisor.email.trim().toLowerCase(),
          headshot_url: newAdvisor.headshot_url.trim() || null,
          bio: newAdvisor.bio.trim() || null,
        });
      if (error) throw error;
      toast({ title: "Advisor added", description: `${newAdvisor.first_name} ${newAdvisor.last_name}` });
      setNewAdvisor({ first_name: "", last_name: "", email: "", headshot_url: "", bio: "" });
      setShowAddForm(false);
      loadAdvisors();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setAdding(false);
    }
  };

  const toggleApproval = async (advisor: SocorroAdvisor) => {
    setTogglingId(advisor.id);
    try {
      const newApproved = !advisor.is_approved;
      const { error } = await supabase
        .from("socorro_workshop_advisors" as any)
        .update({
          is_approved: newApproved,
          approved_by: newApproved ? portalUser?.id : null,
          approved_at: newApproved ? new Date().toISOString() : null,
        })
        .eq("id", advisor.id);
      if (error) throw error;
      setAdvisors((prev) =>
        prev.map((a) =>
          a.id === advisor.id
            ? { ...a, is_approved: newApproved, approved_by: newApproved ? portalUser?.id ?? null : null, approved_at: newApproved ? new Date().toISOString() : null }
            : a
        )
      );
      toast({
        title: newApproved ? "Advisor approved — now visible on public page" : "Advisor hidden from public page",
        description: `${advisor.first_name} ${advisor.last_name}`,
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setTogglingId(null);
    }
  };

  const filtered = advisors.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.first_name.toLowerCase().includes(q) ||
      a.last_name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8 text-gray-400">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading advisors…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search advisors…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          size="sm"
          className="bg-[#1A4D3E] hover:bg-[#163f33]"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? <X className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
          {showAddForm ? "Cancel" : "Add Advisor"}
        </Button>
        <Button variant="outline" size="sm" onClick={loadAdvisors}>
          Refresh
        </Button>
        <span className="text-sm text-gray-400 ml-auto">
          {filtered.length} advisor{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Add Advisor Form */}
      {showAddForm && (
        <div className="border rounded-lg p-5 bg-gray-50 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">New Workshop Advisor</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">First Name *</label>
              <Input
                value={newAdvisor.first_name}
                onChange={(e) => setNewAdvisor((p) => ({ ...p, first_name: e.target.value }))}
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Last Name *</label>
              <Input
                value={newAdvisor.last_name}
                onChange={(e) => setNewAdvisor((p) => ({ ...p, last_name: e.target.value }))}
                placeholder="Smith"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Email *</label>
              <Input
                type="email"
                value={newAdvisor.email}
                onChange={(e) => setNewAdvisor((p) => ({ ...p, email: e.target.value }))}
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Headshot URL</label>
              <Input
                value={newAdvisor.headshot_url}
                onChange={(e) => setNewAdvisor((p) => ({ ...p, headshot_url: e.target.value }))}
                placeholder="https://..."
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Bio</label>
            <Input
              value={newAdvisor.bio}
              onChange={(e) => setNewAdvisor((p) => ({ ...p, bio: e.target.value }))}
              placeholder="Short bio for the public advisor card"
            />
          </div>
          <Button onClick={addAdvisor} disabled={adding} className="bg-[#1A4D3E] hover:bg-[#163f33]">
            {adding ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
            {adding ? "Adding…" : "Add Advisor"}
          </Button>
        </div>
      )}

      {/* Advisor Cards */}
      {filtered.length === 0 ? (
        <p className="py-8 text-center text-gray-400 text-sm">No advisors found. Click "Add Advisor" to get started.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((advisor) => {
            const isExpanded = expandedId === advisor.id;
            return (
              <div key={advisor.id} className="border rounded-lg overflow-hidden bg-white">
                {/* Row header */}
                <div
                  className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : advisor.id)}
                >
                  <div className="text-gray-400">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                  {advisor.headshot_url ? (
                    <img src={advisor.headshot_url} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-400 flex-shrink-0">
                      {advisor.first_name[0]}{advisor.last_name[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {advisor.first_name} {advisor.last_name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{advisor.email}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <span className="text-xs text-gray-400">{advisor.is_approved ? "Live" : "Hidden"}</span>
                    {togglingId === advisor.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Switch
                        checked={advisor.is_approved}
                        onCheckedChange={() => toggleApproval(advisor)}
                      />
                    )}
                  </div>
                </div>

                {/* Expanded panel */}
                {isExpanded && (
                  <div className="border-t px-4 py-5 bg-gray-50 space-y-6">
                    <AdvisorProfileEditor advisor={advisor} onUpdated={loadAdvisors} />
                    <div className="border-t pt-5">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Schedule — Availability Slots
                      </h4>
                      <AdvisorScheduleManager advisorId={advisor.id} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Inline Profile Editor ────────────────────────────────── */

function AdvisorProfileEditor({
  advisor,
  onUpdated,
}: {
  advisor: SocorroAdvisor;
  onUpdated: () => void;
}) {
  const { toast } = useToast();
  const [headshot, setHeadshot] = useState(advisor.headshot_url || "");
  const [bio, setBio] = useState(advisor.bio || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("socorro_workshop_advisors" as any)
        .update({
          headshot_url: headshot.trim() || null,
          bio: bio.trim() || null,
        })
        .eq("id", advisor.id);
      if (error) throw error;
      toast({ title: "Profile updated" });
      onUpdated();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = headshot !== (advisor.headshot_url || "") || bio !== (advisor.bio || "");

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <Image className="w-4 h-4" /> Profile &amp; Photo
      </h4>
      <div className="flex gap-4 items-start">
        {/* Preview */}
        <div className="flex-shrink-0">
          {headshot ? (
            <img src={headshot} alt="Preview" className="w-20 h-20 rounded-lg object-cover border" />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 text-xs border">
              No photo
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Headshot URL</label>
            <Input
              value={headshot}
              onChange={(e) => setHeadshot(e.target.value)}
              placeholder="https://..."
              className="text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Bio</label>
            <Input
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Short bio shown on advisor card"
              className="text-sm"
            />
          </div>
          {hasChanges && (
            <Button size="sm" onClick={save} disabled={saving} className="bg-[#1A4D3E] hover:bg-[#163f33]">
              {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
              Save Changes
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Inline Schedule Manager ──────────────────────────────── */

function AdvisorScheduleManager({ advisorId }: { advisorId: string }) {
  const { toast } = useToast();
  const [slots, setSlots] = useState<SocorroAvailabilitySlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedDate, setSelectedDate] = useState(WORKSHOP_DATES[0].value);
  const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[0]);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadSlots();
  }, [advisorId]);

  const loadSlots = async () => {
    setLoadingSlots(true);
    try {
      const { data, error } = await supabase
        .from("socorro_advisor_availability" as any)
        .select("*")
        .eq("advisor_id", advisorId)
        .order("event_date")
        .order("time_slot");
      if (error) throw error;
      setSlots((data ?? []) as unknown as SocorroAvailabilitySlot[]);
    } catch (err) {
      console.error("Failed to load slots:", err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const addSlot = async () => {
    setAdding(true);
    try {
      const { error } = await supabase
        .from("socorro_advisor_availability" as any)
        .insert({
          advisor_id: advisorId,
          event_date: selectedDate,
          time_slot: selectedTime,
        });
      if (error) throw error;
      toast({ title: "Slot added", description: `${WORKSHOP_DATES.find((d) => d.value === selectedDate)?.label} at ${selectedTime}` });
      loadSlots();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setAdding(false);
    }
  };

  const removeSlot = async (slotId: string) => {
    setDeletingId(slotId);
    try {
      const { error } = await supabase
        .from("socorro_advisor_availability" as any)
        .delete()
        .eq("id", slotId);
      if (error) throw error;
      toast({ title: "Slot removed" });
      loadSlots();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  // Group slots by date
  const slotsByDate: Record<string, SocorroAvailabilitySlot[]> = {};
  for (const s of slots) {
    if (!slotsByDate[s.event_date]) slotsByDate[s.event_date] = [];
    slotsByDate[s.event_date].push(s);
  }

  return (
    <div className="space-y-4">
      {/* Add slot */}
      <div className="flex flex-wrap items-end gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
          <Select value={selectedDate} onValueChange={setSelectedDate}>
            <SelectTrigger className="w-44 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WORKSHOP_DATES.map((d) => (
                <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Time</label>
          <Select value={selectedTime} onValueChange={setSelectedTime}>
            <SelectTrigger className="w-32 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_SLOTS.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={addSlot} disabled={adding} className="bg-[#1A4D3E] hover:bg-[#163f33] h-9">
          {adding ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
          Add
        </Button>
      </div>

      {/* Slots grouped by date */}
      {loadingSlots ? (
        <div className="flex items-center gap-2 py-4 text-gray-400 text-sm">
          <Loader2 className="w-3 h-3 animate-spin" /> Loading…
        </div>
      ) : slots.length === 0 ? (
        <p className="text-sm text-gray-400 py-3">No slots yet. Add time slots above so users can book this advisor.</p>
      ) : (
        <div className="space-y-3">
          {Object.entries(slotsByDate).map(([date, dateSlots]) => {
            const dateLabel = WORKSHOP_DATES.find((d) => d.value === date)?.label || date;
            return (
              <div key={date}>
                <p className="text-xs font-semibold text-gray-500 mb-1.5">{dateLabel}</p>
                <div className="flex flex-wrap gap-2">
                  {dateSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-sm border"
                      style={{
                        background: slot.is_booked ? "#fef3c7" : "#ecfdf5",
                        borderColor: slot.is_booked ? "#fde68a" : "#a7f3d0",
                        color: slot.is_booked ? "#92400e" : "#065f46",
                      }}
                    >
                      <Clock className="w-3 h-3" />
                      {slot.time_slot}
                      {slot.is_booked && <span className="text-xs opacity-70">(booked)</span>}
                      {!slot.is_booked && (
                        <button
                          onClick={() => removeSlot(slot.id)}
                          disabled={deletingId === slot.id}
                          className="ml-1 hover:text-red-600 transition-colors"
                        >
                          {deletingId === slot.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <X className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
