import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { ArrowLeft, CalendarDays, Clock, Users, MapPin, Video, Loader2, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const BRAND = "#1A4D3E";

interface Workshop {
  id: string;
  title: string;
  description: string | null;
  workshop_date: string;
  workshop_time: string;
  timezone: string;
  duration_minutes: number | null;
  max_attendees: number | null;
  registration_count: number | null;
  status: string | null;
  zoom_meeting_id: string | null;
  zoom_join_url: string | null;
  zoom_passcode: string | null;
  [key: string]: any;
}

interface Registration {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  registered_at: string | null;
}

export default function WorkshopDetail() {
  const { workshopId } = useParams<{ workshopId: string }>();
  const { portalUser, loading: authLoading } = usePortalAuth();
  const navigate = useNavigate();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoomUrl, setZoomUrl] = useState("");
  const [zoomPasscode, setZoomPasscode] = useState("");
  const [savingZoom, setSavingZoom] = useState(false);

  const fetchData = useCallback(async () => {
    if (!portalUser || !workshopId) return;
    setLoading(true);
    setError(null);
    try {
      // Get advisor id
      const { data: advisor } = await supabase
        .from("advisors")
        .select("id")
        .eq("auth_user_id", portalUser.auth_user_id)
        .limit(1)
        .maybeSingle();
      if (!advisor) throw new Error("Advisor not found");

      // Get workshop (only if owned by this advisor)
      const { data: ws, error: wsErr } = await supabase
        .from("workshops")
        .select("*")
        .eq("id", workshopId)
        .eq("advisor_id", advisor.id)
        .maybeSingle();
      if (wsErr) throw wsErr;
      if (!ws) throw new Error("Workshop not found");
      setWorkshop(ws as Workshop);

      // Get registrations
      const { data: regs, error: regErr } = await supabase
        .from("workshop_registrations")
        .select("id, first_name, last_name, email, phone, registered_at")
        .eq("workshop_id", workshopId)
        .order("registered_at", { ascending: false });
      if (regErr) throw regErr;
      setRegistrations((regs || []) as Registration[]);
    } catch (err: any) {
      setError(err.message || "Failed to load workshop");
    } finally {
      setLoading(false);
    }
  }, [portalUser, workshopId]);

  useEffect(() => {
    if (!authLoading && portalUser) fetchData();
  }, [authLoading, portalUser, fetchData]);

  useEffect(() => {
    if (workshop) {
      setZoomUrl(workshop.zoom_join_url || "");
      setZoomPasscode(workshop.zoom_passcode || "");
    }
  }, [workshop?.id]);

  if (authLoading || loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (error || !workshop) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center space-y-4">
        <p className="text-red-600 text-lg">{error || "Workshop not found"}</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => navigate("/portal/advisor/workshops")}
            className="inline-flex items-center gap-2 px-6 py-3 border font-medium"
            style={{ borderColor: BRAND, color: BRAND, borderRadius: 0 }}
          >
            <ArrowLeft className="w-4 h-4" /> Back to Workshops
          </button>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-6 py-3 text-white font-medium"
            style={{ backgroundColor: BRAND, borderRadius: 0 }}
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }


  const handleSaveZoom = async () => {
    if (!workshop) return;
    setSavingZoom(true);
    const { error: updateErr } = await supabase
      .from("workshops")
      .update({ zoom_join_url: zoomUrl || null, zoom_passcode: zoomPasscode || null })
      .eq("id", workshop.id);
    setSavingZoom(false);
    if (updateErr) {
      toast.error("Failed to save Zoom link");
    } else {
      toast.success("Zoom link saved");
      setWorkshop({ ...workshop, zoom_join_url: zoomUrl || null, zoom_passcode: zoomPasscode || null });
    }
  };

  const statusColors: Record<string, string> = {
    draft: "bg-yellow-100 text-yellow-800",
    scheduled: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate("/portal/advisor/workshops")}
        className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
        style={{ color: BRAND }}
      >
        <ArrowLeft className="w-4 h-4" /> Back to Workshops
      </button>

      {/* Workshop header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-bold" style={{ color: BRAND }}>
            {workshop.title}
          </h1>
          <span className={`px-3 py-1 text-xs font-medium ${statusColors[workshop.status || "draft"] || statusColors.draft}`} style={{ borderRadius: 0 }}>
            {workshop.status || "draft"}
          </span>
        </div>
        {workshop.description && (
          <p className="text-gray-600">{workshop.description}</p>
        )}
      </div>

      {/* Workshop details */}
      <div className="border p-6 space-y-4" style={{ borderColor: "#e5e7eb", borderRadius: 0 }}>
        <h2 className="text-lg font-bold" style={{ color: BRAND }}>Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-700">
            <CalendarDays className="w-4 h-4 shrink-0" style={{ color: BRAND }} />
            {format(parseISO(workshop.workshop_date), "EEEE, MMMM d, yyyy")}
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Clock className="w-4 h-4 shrink-0" style={{ color: BRAND }} />
            {workshop.workshop_time} · {workshop.duration_minutes || 60} min
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Users className="w-4 h-4 shrink-0" style={{ color: BRAND }} />
            {workshop.registration_count || 0} / {workshop.max_attendees || "∞"} registered
          </div>
          {workshop.zoom_join_url && (
            <div className="flex items-center gap-2 text-gray-700">
              <Video className="w-4 h-4 shrink-0" style={{ color: BRAND }} />
              <a href={workshop.zoom_join_url} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: BRAND }}>
                Join Zoom
              </a>
              {workshop.zoom_passcode && <span className="text-gray-400">· Code: {workshop.zoom_passcode}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Zoom Link Editor */}
      <div className="border p-6 space-y-4" style={{ borderColor: "#e5e7eb", borderRadius: 0 }}>
        <h2 className="text-lg font-bold" style={{ color: BRAND }}>Zoom Meeting Link</h2>
        <p className="text-sm text-gray-500">Enter the Zoom link so it appears in the 10-minute reminder email sent to registrants.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zoom Join URL</label>
            <input
              type="url"
              value={zoomUrl}
              onChange={(e) => setZoomUrl(e.target.value)}
              placeholder="https://zoom.us/j/..."
              className="w-full border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: "#d1d5db", borderRadius: 0, focusRingColor: BRAND } as any}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Passcode (optional)</label>
            <input
              type="text"
              value={zoomPasscode}
              onChange={(e) => setZoomPasscode(e.target.value)}
              placeholder="123456"
              className="w-full border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: "#d1d5db", borderRadius: 0 } as any}
            />
          </div>
        </div>
        <button
          onClick={handleSaveZoom}
          disabled={savingZoom}
          className="inline-flex items-center gap-2 px-5 py-2 text-white text-sm font-medium disabled:opacity-50"
          style={{ backgroundColor: BRAND, borderRadius: 0 }}
        >
          {savingZoom ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Save Zoom Link
        </button>
      </div>

      {/* Registrations */}
      <div className="border p-6 space-y-4" style={{ borderColor: "#e5e7eb", borderRadius: 0 }}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ color: BRAND }}>
            Registrations ({registrations.length})
          </h2>
        </div>

        {registrations.length === 0 ? (
          <p className="text-gray-400 text-sm py-4 text-center">No registrations yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Email</th>
                  <th className="pb-2 font-medium">Phone</th>
                  <th className="pb-2 font-medium">Registered</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="py-3 font-medium text-gray-900">{r.first_name} {r.last_name}</td>
                    <td className="py-3 text-gray-600">{r.email}</td>
                    <td className="py-3 text-gray-600">{r.phone || "—"}</td>
                    <td className="py-3 text-gray-400">{r.registered_at ? format(parseISO(r.registered_at), "MMM d, yyyy") : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
