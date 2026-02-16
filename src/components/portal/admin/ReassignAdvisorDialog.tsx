import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName: string;
  currentAdvisorId: string | null;
  onReassigned: () => void;
}

interface AdvisorOption {
  id: string;
  portal_user_id: string;
  first_name: string;
  last_name: string;
}

export function ReassignAdvisorDialog({ open, onOpenChange, clientId, clientName, currentAdvisorId, onReassigned }: Props) {
  const [advisors, setAdvisors] = useState<AdvisorOption[]>([]);
  const [selectedAdvisorPortalId, setSelectedAdvisorPortalId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      fetchAdvisors();
      setSelectedAdvisorPortalId("");
    }
  }, [open]);

  async function fetchAdvisors() {
    const { data } = await supabase
      .from("advisors")
      .select("id, portal_user_id, first_name, last_name")
      .eq("is_active", true)
      .order("first_name");
    setAdvisors((data as AdvisorOption[]) ?? []);
  }

  async function handleReassign() {
    if (!selectedAdvisorPortalId) return;
    setSaving(true);
    const { error } = await supabase
      .from("portal_users")
      .update({ advisor_id: selectedAdvisorPortalId })
      .eq("id", clientId);
    setSaving(false);
    if (error) {
      toast.error("Failed to reassign client");
    } else {
      toast.success(`${clientName} reassigned successfully`);
      onReassigned();
      onOpenChange(false);
    }
  }

  const currentAdvisor = advisors.find((a) => a.portal_user_id === currentAdvisorId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reassign {clientName}</DialogTitle>
        </DialogHeader>
        {currentAdvisor && (
          <p className="text-sm text-muted-foreground">
            Currently assigned to: <span className="font-medium text-foreground">{currentAdvisor.first_name} {currentAdvisor.last_name}</span>
          </p>
        )}
        <Select value={selectedAdvisorPortalId} onValueChange={setSelectedAdvisorPortalId}>
          <SelectTrigger>
            <SelectValue placeholder="Select new advisor" />
          </SelectTrigger>
          <SelectContent>
            {advisors.map((a) => (
              <SelectItem key={a.portal_user_id} value={a.portal_user_id}>
                {a.first_name} {a.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleReassign} disabled={!selectedAdvisorPortalId || saving}>
            {saving ? "Reassigning..." : "Reassign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
