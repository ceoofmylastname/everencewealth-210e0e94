import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Zap } from "lucide-react";
import { toast } from "sonner";

/**
 * Per-advisor switch for the Profile Key automations (auto follow-up reminders
 * and status-change audit notes).
 */
export default function ProfileKeyAutomationToggle({ advisorId }: { advisorId: string }) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!advisorId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("advisors")
        .select("profile_key_automation_enabled")
        .eq("id", advisorId)
        .maybeSingle();
      if (cancelled) return;
      setEnabled((data as any)?.profile_key_automation_enabled ?? true);
    })();
    return () => {
      cancelled = true;
    };
  }, [advisorId]);

  async function toggle() {
    if (enabled === null || saving) return;
    const next = !enabled;
    setEnabled(next);
    setSaving(true);
    const { error } = await supabase
      .from("advisors")
      .update({ profile_key_automation_enabled: next } as any)
      .eq("id", advisorId);
    setSaving(false);
    if (error) {
      setEnabled(!next);
      toast.error(error.message);
      return;
    }
    toast.success(next ? "Auto follow-ups on" : "Auto follow-ups off");
  }

  if (enabled === null) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={saving}
      title="When on, hitting a Profile Key score of 7+ auto-creates a follow-up reminder and status changes are logged as notes."
      className={`inline-flex items-center gap-2 h-8 px-3 rounded-full text-xs font-bold border transition disabled:opacity-60 ${
        enabled
          ? "bg-[#1A4D3E] text-white border-[#1A4D3E]"
          : "bg-white text-gray-600 hover:bg-gray-50"
      }`}
    >
      <Zap className="w-3.5 h-3.5" />
      Auto follow-ups {enabled ? "on" : "off"}
    </button>
  );
}
