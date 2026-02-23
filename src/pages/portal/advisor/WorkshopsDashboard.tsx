import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, parseISO, isBefore, startOfToday } from "date-fns";
import {
  Plus,
  Users,
  CalendarDays,
  LayoutDashboard,
  Trash2,
  Pencil,
  Eye,
  Loader2,
  RefreshCw,
  Megaphone,
} from "lucide-react";
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
  attendance_count: number | null;
  status: string | null;
  zoom_join_url: string | null;
}

export default function WorkshopsDashboard() {
  const { portalUser, loading: authLoading } = usePortalAuth();
  const [advisorId, setAdvisorId] = useState<string | null>(null);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!portalUser) return;
    setLoading(true);
    setError(null);
    try {
      const { data: advisor, error: advErr } = await supabase
        .from("advisors")
        .select("id")
        .eq("auth_user_id", portalUser.auth_user_id)
        .limit(1)
        .maybeSingle();
      if (advErr) throw advErr;
      if (!advisor) throw new Error("Advisor profile not found");
      setAdvisorId(advisor.id);

      const { data, error: wsErr } = await supabase
        .from("workshops")
        .select("id, title, description, workshop_date, workshop_time, timezone, duration_minutes, max_attendees, registration_count, attendance_count, status, zoom_join_url")
        .eq("advisor_id", advisor.id)
        .order("workshop_date", { ascending: false });
      if (wsErr) throw wsErr;
      setWorkshops(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load workshops");
    } finally {
      setLoading(false);
    }
  }, [portalUser]);

  useEffect(() => {
    if (!authLoading && portalUser) fetchData();
    else if (!authLoading) setLoading(false);
  }, [authLoading, portalUser, fetchData]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this workshop?")) return;
    setDeleting(id);
    try {
      const { error } = await supabase.from("workshops").delete().eq("id", id);
      if (error) throw error;
      setWorkshops((prev) => prev.filter((w) => w.id !== id));
      toast.success("Workshop deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  // Stats
  const totalRegistrations = workshops.reduce((sum, w) => sum + (w.registration_count || 0), 0);
  const upcomingCount = workshops.filter(
    (w) => !isBefore(parseISO(w.workshop_date), startOfToday()) && w.status !== "cancelled"
  ).length;

  const statusColor = (status: string | null) => {
    switch (status) {
      case "published": return "bg-green-100 text-green-800";
      case "draft": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "completed": return "bg-gray-100 text-gray-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-5xl mx-auto text-center space-y-4">
        <p className="text-red-600 text-lg">{error}</p>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-6 py-3 text-white font-medium"
          style={{ backgroundColor: BRAND, borderRadius: 0 }}
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto" style={{ fontFamily: "'GeistSans', system-ui, sans-serif" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: BRAND }}>Workshops</h1>
          <p className="text-muted-foreground mt-1">Manage your workshops and registrations</p>
        </div>
        <Link
          to="/portal/advisor/workshops/create"
          className="inline-flex items-center gap-2 px-6 py-3 text-white font-medium self-start"
          style={{ backgroundColor: BRAND, borderRadius: 0 }}
        >
          <Plus className="w-4 h-4" /> Create Workshop
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="border p-5" style={{ borderRadius: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2" style={{ backgroundColor: `${BRAND}15` }}>
              <LayoutDashboard className="w-5 h-5" style={{ color: BRAND }} />
            </div>
            <span className="text-sm text-muted-foreground font-medium">Total Workshops</span>
          </div>
          <p className="text-3xl font-bold" style={{ color: BRAND }}>{workshops.length}</p>
        </div>
        <div className="border p-5" style={{ borderRadius: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2" style={{ backgroundColor: `${BRAND}15` }}>
              <Users className="w-5 h-5" style={{ color: BRAND }} />
            </div>
            <span className="text-sm text-muted-foreground font-medium">Total Registrations</span>
          </div>
          <p className="text-3xl font-bold" style={{ color: BRAND }}>{totalRegistrations}</p>
        </div>
        <div className="border p-5" style={{ borderRadius: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2" style={{ backgroundColor: `${BRAND}15` }}>
              <CalendarDays className="w-5 h-5" style={{ color: BRAND }} />
            </div>
            <span className="text-sm text-muted-foreground font-medium">Upcoming</span>
          </div>
          <p className="text-3xl font-bold" style={{ color: BRAND }}>{upcomingCount}</p>
        </div>
      </div>

      {/* Workshop List */}
      {workshops.length === 0 ? (
        <div className="border-2 border-dashed p-12 text-center" style={{ borderRadius: 0 }}>
          <Megaphone className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2" style={{ color: BRAND }}>No workshops yet</h2>
          <p className="text-muted-foreground mb-6">Create your first workshop to start collecting registrations.</p>
          <Link
            to="/portal/advisor/workshops/create"
            className="inline-flex items-center gap-2 px-6 py-3 text-white font-medium"
            style={{ backgroundColor: BRAND, borderRadius: 0 }}
          >
            <Plus className="w-4 h-4" /> Create Your First Workshop
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {workshops.map((w) => {
            const isPast = isBefore(parseISO(w.workshop_date), startOfToday());
            return (
              <div key={w.id} className="border p-5" style={{ borderRadius: 0 }}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-lg font-bold truncate" style={{ color: BRAND }}>{w.title}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 ${statusColor(w.status)}`} style={{ borderRadius: 0 }}>
                        {w.status || "draft"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(w.workshop_date), "MMMM d, yyyy")} · {w.workshop_time} · {w.duration_minutes || 60} min
                    </p>
                    {w.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{w.description}</p>
                    )}
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="text-muted-foreground">
                        <Users className="w-3.5 h-3.5 inline mr-1" />
                        {w.registration_count || 0} / {w.max_attendees || "∞"} registered
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    <Link
                      to={`/portal/advisor/workshops/${w.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border font-medium"
                      style={{ borderColor: BRAND, color: BRAND, borderRadius: 0 }}
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </Link>
                    <button
                      onClick={() => handleDelete(w.id)}
                      disabled={deleting === w.id}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border font-medium text-red-600 border-red-300 hover:bg-red-50 disabled:opacity-50"
                      style={{ borderRadius: 0 }}
                    >
                      {deleting === w.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
