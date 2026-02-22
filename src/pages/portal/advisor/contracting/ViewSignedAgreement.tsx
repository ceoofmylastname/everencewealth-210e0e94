import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

const BRAND = "#1A4D3E";

interface AgreementData {
  id: string;
  consultant_name: string | null;
  effective_date: string | null;
  agent_signature: string | null;
  agent_initials: string | null;
  agent_signed_at: string | null;
  status: string | null;
}

interface ViewSignedAgreementProps {
  agentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ViewSignedAgreement({ agentId, open, onOpenChange }: ViewSignedAgreementProps) {
  const [agreement, setAgreement] = useState<AgreementData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    supabase
      .from("contracting_agreements")
      .select("id, consultant_name, effective_date, agent_signature, agent_initials, agent_signed_at, status")
      .eq("agent_id", agentId)
      .order("created_at", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        setAgreement(data?.[0] as AgreementData ?? null);
        setLoading(false);
      });
  }, [agentId, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ color: BRAND }}>
            <FileText className="h-5 w-5" />
            Signed Agent Agreement
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : !agreement ? (
          <p className="text-sm text-gray-500 py-8 text-center">No signed agreement found.</p>
        ) : (
          <ScrollArea className="max-h-[65vh]">
            <div className="space-y-6 pr-4">
              {/* Agreement Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Consultant Name</p>
                  <p className="text-sm font-semibold text-gray-800">{agreement.consultant_name || "—"}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Effective Date</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {agreement.effective_date
                      ? format(new Date(agreement.effective_date), "MMMM d, yyyy")
                      : "—"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Signed At</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {agreement.agent_signed_at
                      ? format(new Date(agreement.agent_signed_at), "MMMM d, yyyy 'at' h:mm a")
                      : "—"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    agreement.status === "fully_executed"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {agreement.status === "fully_executed" ? "Fully Executed" : "Pending Company Signature"}
                  </span>
                </div>
              </div>

              {/* Signature */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">Your Signature</h3>
                {agreement.agent_signature ? (
                  <div className="border border-gray-200 rounded-xl p-4 bg-white">
                    <img
                      src={agreement.agent_signature}
                      alt="Agent signature"
                      className="max-h-24 mx-auto"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No signature on file.</p>
                )}
              </div>

              {/* Initials */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">Your Initials</h3>
                {agreement.agent_initials ? (
                  <div className="border border-gray-200 rounded-xl p-4 bg-white">
                    <img
                      src={agreement.agent_initials}
                      alt="Agent initials"
                      className="max-h-16 mx-auto"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No initials on file.</p>
                )}
              </div>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
