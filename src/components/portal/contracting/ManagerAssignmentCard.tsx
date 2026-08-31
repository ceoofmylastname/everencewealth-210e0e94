import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { UserCog, Loader2 } from "lucide-react";
import { toast } from "sonner";

const BRAND = "#1A4D3E";
const UNASSIGNED = "__unassigned__";

interface ManagerOption {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  is_manager: boolean | null;
}

interface Props {
  agentId: string;
  agentName: string;
  /** portal_users.id of the current manager, or null */
  managerId: string | null;
  /** Only admins / contracting role may reassign */
  canManage: boolean;
  onChanged: (newManagerId: string | null) => void;
}

/**
 * Lets an admin move an agent to a different manager.
 *
 * Reporting structure was previously set once, by the applicant, on the
 * intake form — with no way to change it afterwards short of running SQL.
 * Writes contracting_agents.manager_id (a portal_users.id) and records the
 * change in the activity log so there is a record of who moved whom.
 */
export default function ManagerAssignmentCard({
  agentId, agentName, managerId, canManage, onChanged,
}: Props) {
  const [managers, setManagers] = useState<ManagerOption[]>([]);
  const [selected, setSelected] = useState<string>(managerId ?? UNASSIGNED);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSelected(managerId ?? UNASSIGNED);
  }, [managerId]);

  useEffect(() => {
    let cancelled = false;
    // Eligible = active admins/managers, minus this agent and anyone who
    // reports up through them, so a reporting loop can't be selected.
    (supabase.rpc as any)("get_eligible_managers", { _agent_id: agentId })
      .then(({ data, error }: { data: ManagerOption[] | null; error: unknown }) => {
        if (cancelled) return;
        if (error) console.error("get_eligible_managers", error);
        setManagers(data || []);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [agentId]);

  const nameOf = (m: ManagerOption) =>
    `${m.first_name ?? ""} ${m.last_name ?? ""}`.trim() || "Unnamed";

  const currentManager = managers.find((m) => m.id === managerId);
  const dirty = (managerId ?? UNASSIGNED) !== selected;

  async function save() {
    if (!dirty || saving) return;
    setSaving(true);
    const newManagerId = selected === UNASSIGNED ? null : selected;
    const previousName = currentManager ? nameOf(currentManager) : "Unassigned";
    const nextName = newManagerId
      ? nameOf(managers.find((m) => m.id === newManagerId)!)
      : "Unassigned";

    try {
      const { error } = await supabase
        .from("contracting_agents")
        .update({ manager_id: newManagerId })
        .eq("id", agentId);
      if (error) throw error;

      // Best-effort audit trail; never block the reassignment on it.
      const { data: { user } } = await supabase.auth.getUser();
      const { data: performer } = await supabase
        .from("contracting_agents")
        .select("id")
        .eq("auth_user_id", user?.id ?? "")
        .maybeSingle();
      supabase.from("contracting_activity_logs").insert({
        agent_id: agentId,
        performed_by: performer?.id || agentId,
        action: "manager_changed",
        activity_type: "manager_changed",
        description: `${agentName}'s manager changed from ${previousName} to ${nextName}`,
      } as any).then(null, (err) => console.error("Activity log error:", err));

      toast.success(
        newManagerId ? `Manager updated to ${nextName}` : "Manager cleared"
      );
      onChanged(newManagerId);
    } catch (err: any) {
      console.error("Manager reassignment error:", err);
      toast.error(err.message || "Could not update manager");
      setSelected(managerId ?? UNASSIGNED);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] p-5">
      <div className="flex items-center gap-2 mb-3">
        <UserCog className="h-4 w-4" style={{ color: BRAND }} />
        <span className="text-sm font-semibold text-gray-700">Reports To</span>
      </div>

      {!canManage ? (
        <p className="text-sm text-gray-900">
          {currentManager ? nameOf(currentManager) : (
            <span className="text-gray-400">No manager assigned</span>
          )}
        </p>
      ) : loading ? (
        <p className="text-sm text-gray-400">Loading managers…</p>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <Select value={selected} onValueChange={setSelected} disabled={saving}>
            <SelectTrigger className="w-full sm:w-[280px]">
              <SelectValue placeholder="Select a manager" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UNASSIGNED}>No manager</SelectItem>
              {managers.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {nameOf(m)}{m.role === "admin" ? " (Admin)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {dirty && (
            <Button
              onClick={save}
              disabled={saving}
              className="text-white"
              style={{ background: BRAND }}
            >
              {saving ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</>
              ) : "Save"}
            </Button>
          )}
        </div>
      )}

      {canManage && (
        <p className="text-xs text-gray-400 mt-2">
          The manager and everyone above them can see this agent's contacts and CNAs.
        </p>
      )}
    </div>
  );
}
