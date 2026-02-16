import { useEffect, useState } from "react";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Shield, FileText, CheckCircle, AlertCircle, Clock,
  Download, ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

const complianceData = {
  licenseStatus: "active",
  licenseExpiry: "2026-12-31",
  eoExpiry: "2026-06-30",
  contractsComplete: 12,
  contractsPending: 3,
  requiredTrainingsComplete: 4,
  requiredTrainingsTotal: 5,
};

const requiredDocuments = [
  { name: "E&O Insurance Certificate", status: "current", expiry: "2026-06-30" },
  { name: "State Insurance License", status: "current", expiry: "2026-12-31" },
  { name: "FINRA Registration", status: "not_required", expiry: null },
  { name: "W-9 Form", status: "current", expiry: null },
  { name: "Background Check", status: "current", expiry: null },
];

const contractingStatus = [
  { carrier: "Pacific Life", status: "active", contracted_date: "2024-01-15" },
  { carrier: "North American", status: "active", contracted_date: "2024-02-10" },
  { carrier: "Allianz", status: "pending", contracted_date: null },
  { carrier: "American Amicable", status: "active", contracted_date: "2024-03-05" },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "active":
    case "current":
      return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
    case "expired":
      return <Badge className="bg-red-100 text-red-800 border-red-200">Expired</Badge>;
    case "not_required":
      return <Badge className="bg-muted text-muted-foreground border-border">Not Required</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function isExpiringWithin30Days(expiryDate: string | null) {
  if (!expiryDate) return false;
  const days = Math.floor((new Date(expiryDate).getTime() - Date.now()) / 86400000);
  return days <= 30 && days >= 0;
}

function isExpired(expiryDate: string | null) {
  if (!expiryDate) return false;
  return new Date(expiryDate) < new Date();
}

export default function ComplianceCenter() {
  const { portalUser } = usePortalAuth();
  const [advisor, setAdvisor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!portalUser) return;
    supabase
      .from("advisors")
      .select("*")
      .eq("portal_user_id", portalUser.id)
      .maybeSingle()
      .then(({ data }) => {
        setAdvisor(data);
        setLoading(false);
      });
  }, [portalUser]);

  const complianceScore = Math.round(
    (complianceData.contractsComplete / (complianceData.contractsComplete + complianceData.contractsPending)) * 30 +
    (complianceData.requiredTrainingsComplete / complianceData.requiredTrainingsTotal) * 30 +
    (requiredDocuments.filter((d) => d.status === "current").length / requiredDocuments.length) * 40
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
          Compliance Center
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor your licensing, contracting, and compliance requirements
        </p>
      </div>

      {/* Compliance Score */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Compliance Score</p>
              <p className="text-xs text-muted-foreground">Your overall compliance health</p>
            </div>
            <div className="text-4xl font-bold text-primary">{complianceScore}%</div>
          </div>
          <Progress value={complianceScore} className="h-3" />
          {complianceScore < 100 && (
            <div className="flex items-center gap-2 mt-4 text-sm text-yellow-700 bg-yellow-50 rounded-lg px-3 py-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              You have pending compliance items that need attention
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">License Status</p>
                <p className="text-lg font-semibold text-foreground capitalize">{complianceData.licenseStatus}</p>
                <p className="text-xs text-muted-foreground">
                  Expires: {new Date(complianceData.licenseExpiry).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Contracts</p>
                <p className="text-lg font-semibold text-foreground">{complianceData.contractsComplete}</p>
                <p className="text-xs text-muted-foreground">{complianceData.contractsPending} pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Required Trainings</p>
                <p className="text-lg font-semibold text-foreground">
                  {complianceData.requiredTrainingsComplete}/{complianceData.requiredTrainingsTotal}
                </p>
                <p className="text-xs text-muted-foreground">Complete</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Required Documents */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Required Documents</h2>
          <div className="divide-y divide-border">
            {requiredDocuments.map((doc) => (
              <div key={doc.name} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{doc.name}</p>
                    {doc.expiry && (
                      <p className="text-xs text-muted-foreground">
                        {isExpired(doc.expiry) ? "Expired" : "Expires"}: {new Date(doc.expiry).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(doc.status)}
                  <Button variant="ghost" size="sm" onClick={() => toast.info("Download not available in demo")}>
                    <Download className="h-4 w-4 mr-1" /> Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Carrier Contracting Status */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Carrier Contracting Status</h2>
          <div className="divide-y divide-border">
            {contractingStatus.map((c) => (
              <div key={c.carrier} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      c.status === "active" ? "bg-green-500" : c.status === "pending" ? "bg-yellow-500" : "bg-red-500"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">{c.carrier}</p>
                    {c.contracted_date && (
                      <p className="text-xs text-muted-foreground">
                        Contracted: {new Date(c.contracted_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(c.status)}
                  {c.status === "pending" && (
                    <Button size="sm" variant="outline" onClick={() => toast.info("Contracting workflow coming soon")}>
                      <FileText className="h-4 w-4 mr-1" /> Complete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Resources */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Compliance Resources</h2>
          <div className="space-y-2">
            {[
              "State Licensing Requirements Guide",
              "Fiduciary Duty & Best Practices",
              "E&O Insurance Requirements",
            ].map((title) => (
              <a
                key={title}
                href="#"
                onClick={(e) => { e.preventDefault(); toast.info("Resource not available in demo"); }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground">PDF Document</p>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
