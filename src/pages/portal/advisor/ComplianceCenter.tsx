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

interface ComplianceDocument {
  id: string;
  name: string;
  status: string;
  expiry_date: string | null;
  file_url: string | null;
}

interface CarrierContract {
  id: string;
  carrier_name: string;
  status: string;
  contracted_date: string | null;
}

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

function isExpired(expiryDate: string | null) {
  if (!expiryDate) return false;
  return new Date(expiryDate) < new Date();
}

export default function ComplianceCenter() {
  const { portalUser } = usePortalAuth();
  const [advisor, setAdvisor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<ComplianceDocument[]>([]);
  const [contracts, setContracts] = useState<CarrierContract[]>([]);
  const [trainingStats, setTrainingStats] = useState({ complete: 0, total: 0 });

  useEffect(() => {
    if (!portalUser) return;

    const fetchAll = async () => {
      // Get advisor
      const { data: advisorData } = await supabase
        .from("advisors")
        .select("*")
        .eq("portal_user_id", portalUser.id)
        .maybeSingle();

      setAdvisor(advisorData);

      if (!advisorData) {
        setLoading(false);
        return;
      }

      // Fetch compliance documents, carrier contracts, and training progress in parallel
      const [docsRes, contractsRes, trainingsRes, progressRes] = await Promise.all([
        supabase
          .from("compliance_documents")
          .select("id, name, status, expiry_date, file_url")
          .eq("advisor_id", advisorData.id),
        supabase
          .from("carrier_contracts")
          .select("id, carrier_name, status, contracted_date")
          .eq("advisor_id", advisorData.id),
        supabase
          .from("trainings")
          .select("id")
          .eq("status", "published"),
        supabase
          .from("training_progress")
          .select("id, completed")
          .eq("advisor_id", advisorData.id),
      ]);

      setDocuments(docsRes.data || []);
      setContracts(contractsRes.data || []);

      const totalTrainings = trainingsRes.data?.length || 0;
      const completedTrainings = progressRes.data?.filter((p) => p.completed).length || 0;
      setTrainingStats({ complete: completedTrainings, total: totalTrainings });

      setLoading(false);
    };

    fetchAll();
  }, [portalUser]);

  // Compute dynamic stats
  const activeContracts = contracts.filter((c) => c.status === "active").length;
  const pendingContracts = contracts.filter((c) => c.status === "pending").length;
  const currentDocs = documents.filter((d) => d.status === "current").length;

  // Find license and E&O docs for the stats cards
  const licenseDocs = documents.filter((d) => d.name.toLowerCase().includes("license"));
  const licenseDoc = licenseDocs.length > 0 ? licenseDocs[0] : null;
  const eoDocs = documents.filter((d) => d.name.toLowerCase().includes("e&o") || d.name.toLowerCase().includes("insurance"));
  const eoDoc = eoDocs.length > 0 ? eoDocs[0] : null;

  // Compliance score
  const totalDocs = documents.length || 1;
  const totalContracts = contracts.length || 1;
  const totalTrainings = trainingStats.total || 1;

  const complianceScore = Math.round(
    (activeContracts / totalContracts) * 30 +
    (trainingStats.complete / totalTrainings) * 30 +
    (currentDocs / totalDocs) * 40
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
                <p className="text-lg font-semibold text-foreground capitalize">
                  {licenseDoc ? licenseDoc.status : "N/A"}
                </p>
                {licenseDoc?.expiry_date && (
                  <p className="text-xs text-muted-foreground">
                    Expires: {new Date(licenseDoc.expiry_date).toLocaleDateString()}
                  </p>
                )}
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
                <p className="text-lg font-semibold text-foreground">{activeContracts}</p>
                <p className="text-xs text-muted-foreground">{pendingContracts} pending</p>
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
                  {trainingStats.complete}/{trainingStats.total}
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
          {documents.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No compliance documents on file yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{doc.name}</p>
                      {doc.expiry_date && (
                        <p className="text-xs text-muted-foreground">
                          {isExpired(doc.expiry_date) ? "Expired" : "Expires"}: {new Date(doc.expiry_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(doc.status)}
                    {doc.file_url && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-1" /> Download
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Carrier Contracting Status */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Carrier Contracting Status</h2>
          {contracts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No carrier contracts on file yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {contracts.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        c.status === "active" ? "bg-green-500" : c.status === "pending" ? "bg-yellow-500" : "bg-red-500"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.carrier_name}</p>
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
          )}
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
