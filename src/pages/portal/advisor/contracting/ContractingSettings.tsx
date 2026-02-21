import { useContractingAuth } from "@/hooks/useContractingAuth";
import { Link } from "react-router-dom";
import { Settings, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const PIPELINE_STAGES = [
  { key: "intake_submitted", label: "Intake Submitted" },
  { key: "agreement_pending", label: "Agreement Pending" },
  { key: "surelc_setup", label: "SureLC Setup" },
  { key: "bundle_selected", label: "Bundle Selected" },
  { key: "carrier_selection", label: "Carrier Selection" },
  { key: "contracting_submitted", label: "Contracting Submitted" },
  { key: "contracting_approved", label: "Contracting Approved" },
  { key: "completed", label: "Completed" },
];

export default function ContractingSettings() {
  const { canManage, loading } = useContractingAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Settings className="h-10 w-10 mb-3" />
        <p className="text-lg font-medium">Access Restricted</p>
        <p className="text-sm">Only admins and contracting managers can access settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-[#1A4D3E]" />
        <h1 className="text-2xl font-bold text-gray-900">Contracting Settings</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Pipeline Stages */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pipeline Stages</CardTitle>
            <CardDescription>The onboarding pipeline follows these stages in order.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {PIPELINE_STAGES.map((stage, i) => (
                <li key={stage.key} className="flex items-center gap-3 text-sm">
                  <span className="h-6 w-6 rounded-full bg-[#1A4D3E] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-gray-700">{stage.label}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Admin Panel Link */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Admin Panel</CardTitle>
            <CardDescription>
              Full agent management, bundle configuration, and administrative controls.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/portal/advisor/contracting/admin" className="gap-2">
                Open Admin Panel
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
