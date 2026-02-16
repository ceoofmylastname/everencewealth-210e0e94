import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Users, Shield, Mail, Phone, MessageSquare, Calendar } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { format } from "date-fns";

interface Policy {
  id: string;
  carrier_name: string;
  policy_number: string;
  product_type: string;
  policy_status: string;
  death_benefit: number | null;
  cash_value: number | null;
  monthly_premium: number | null;
  premium_frequency: string | null;
  issue_date: string | null;
  maturity_date: string | null;
  beneficiaries: any;
  riders: any;
  notes: string | null;
  advisor_id: string;
}

interface Document {
  id: string;
  file_name: string;
  document_type: string;
  file_size: number | null;
  file_url: string;
  created_at: string;
}

interface Advisor {
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
}

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  lapsed: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
  paid_up: "bg-blue-100 text-blue-800",
};

const fmt = (n: number | null) => (n != null ? `$${n.toLocaleString()}` : "—");

const formatFileSize = (bytes: number | null) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

const evergreen = "#1A4D3E";
const slate = "#4A5565";

export default function ClientPolicyDetail() {
  const { id } = useParams<{ id: string }>();
  const { portalUser } = usePortalAuth();
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [advisor, setAdvisor] = useState<Advisor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!portalUser || !id) return;
    loadData();
  }, [portalUser, id]);

  async function loadData() {
    setLoading(true);

    const [policyRes, docsRes] = await Promise.all([
      supabase
        .from("policies")
        .select("*")
        .eq("id", id!)
        .eq("client_id", portalUser!.id)
        .maybeSingle(),
      supabase
        .from("portal_documents")
        .select("*")
        .eq("policy_id", id!)
        .eq("is_client_visible", true)
        .order("created_at", { ascending: false }),
    ]);

    if (policyRes.error) console.error(policyRes.error);
    if (docsRes.error) console.error(docsRes.error);

    setPolicy(policyRes.data as Policy | null);
    setDocuments((docsRes.data as Document[]) ?? []);

    if (portalUser?.advisor_id) {
      const { data: adv } = await supabase
        .from("portal_users")
        .select("first_name, last_name, email, phone, avatar_url")
        .eq("id", portalUser.advisor_id)
        .maybeSingle();
      setAdvisor(adv as Advisor | null);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="space-y-4" style={{ color: slate }}>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink asChild><Link to="/portal/client/dashboard">Home</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink asChild><Link to="/portal/client/policies">My Policies</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>Not Found</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Card className="bg-white shadow-sm">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Policy not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const beneficiaries = Array.isArray(policy.beneficiaries) ? policy.beneficiaries : [];
  const riders = Array.isArray(policy.riders) ? policy.riders : [];
  const productLabel = policy.product_type.replace(/_/g, " ");

  return (
    <div className="space-y-6" style={{ color: slate }}>
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link to="/portal/client/dashboard">Home</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink asChild><Link to="/portal/client/policies">My Policies</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage className="capitalize">{productLabel}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: evergreen, fontFamily: "'Playfair Display', serif" }}>
            {policy.carrier_name}
          </h1>
          <p className="text-sm" style={{ color: slate }}>
            #{policy.policy_number}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize">{productLabel}</Badge>
          <Badge className={statusColors[policy.policy_status] || ""}>{policy.policy_status}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Policy Overview Card */}
          <Card className="bg-white shadow-sm">
            <CardContent className="p-5">
              <h2 className="font-semibold mb-4" style={{ color: evergreen }}>Policy Overview</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Carrier</p>
                  <p className="font-medium" style={{ color: slate }}>{policy.carrier_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Policy Number</p>
                  <p className="font-medium" style={{ color: slate }}>#{policy.policy_number}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Product Type</p>
                  <p className="font-medium capitalize" style={{ color: slate }}>{productLabel}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Issue Date</p>
                  <p className="font-medium" style={{ color: slate }}>{policy.issue_date || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Maturity Date</p>
                  <p className="font-medium" style={{ color: slate }}>{policy.maturity_date || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge className={statusColors[policy.policy_status] || ""}>{policy.policy_status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coverage Details Card */}
          <Card className="bg-white shadow-sm">
            <CardContent className="p-5">
              <h2 className="font-semibold mb-4" style={{ color: evergreen }}>Coverage Details</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Death Benefit</p>
                  <p className="font-medium" style={{ color: slate }}>{fmt(policy.death_benefit)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cash Value</p>
                  <p className="font-medium" style={{ color: slate }}>{fmt(policy.cash_value)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Premium</p>
                  <p className="font-medium" style={{ color: slate }}>
                    {fmt(policy.monthly_premium)}/{policy.premium_frequency?.replace(/_/g, " ") || "mo"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Beneficiaries */}
          <Card className="bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-4 w-4" style={{ color: evergreen }} />
                <h2 className="font-semibold" style={{ color: evergreen }}>Beneficiaries</h2>
              </div>
              {beneficiaries.length === 0 ? (
                <p className="text-sm text-muted-foreground">No beneficiaries listed.</p>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 text-xs font-medium text-muted-foreground pb-1 border-b border-border">
                    <span>Name</span><span>Relationship</span><span className="text-right">Percentage</span>
                  </div>
                  {beneficiaries.map((b: any, i: number) => (
                    <div key={i} className="grid grid-cols-3 text-sm border-b border-border pb-2 last:border-0 last:pb-0">
                      <span className="font-medium" style={{ color: slate }}>{b.name || b.Name || `Beneficiary ${i + 1}`}</span>
                      <span className="text-muted-foreground">{b.relationship || b.Relationship || b.type || ""}</span>
                      <span className="text-right font-medium" style={{ color: slate }}>{b.percentage || b.Percentage || "—"}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Riders */}
          <Card className="bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-4 w-4" style={{ color: evergreen }} />
                <h2 className="font-semibold" style={{ color: evergreen }}>Riders & Additional Coverage</h2>
              </div>
              {riders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No riders on this policy.</p>
              ) : (
                <div className="space-y-2">
                  {riders.map((r: any, i: number) => (
                    <div key={i} className="text-sm border-b border-border pb-2 last:border-0 last:pb-0">
                      <p className="font-medium" style={{ color: slate }}>{r.name || r.Name || r.rider_name || `Rider ${i + 1}`}</p>
                      {(r.description || r.Description) && (
                        <p className="text-muted-foreground text-xs mt-0.5">{r.description || r.Description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents */}
          <Card className="bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-4 w-4" style={{ color: evergreen }} />
                <h2 className="font-semibold" style={{ color: evergreen }}>Policy Documents</h2>
              </div>
              {documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No documents available.</p>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between text-sm border-b border-border pb-2 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium" style={{ color: slate }}>{doc.file_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.document_type.replace(/_/g, " ")}
                          {doc.file_size ? ` • ${formatFileSize(doc.file_size)}` : ""}
                          {doc.created_at ? ` • ${format(new Date(doc.created_at), "MMM d, yyyy")}` : ""}
                        </p>
                      </div>
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {advisor && (
            <Card className="bg-white shadow-sm">
              <CardContent className="p-5">
                <h2 className="font-semibold mb-4" style={{ color: evergreen }}>Your Advisor</h2>
                <div className="flex items-center gap-3 mb-4">
                  {advisor.avatar_url ? (
                    <img src={advisor.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold" style={{ backgroundColor: evergreen }}>
                      {advisor.first_name?.[0]}{advisor.last_name?.[0]}
                    </div>
                  )}
                  <div>
                    <p className="font-medium" style={{ color: slate }}>{advisor.first_name} {advisor.last_name}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <a href={`mailto:${advisor.email}`} className="hover:text-foreground">{advisor.email}</a>
                  </div>
                  {advisor.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      <a href={`tel:${advisor.phone}`} className="hover:text-foreground">{advisor.phone}</a>
                    </div>
                  )}
                </div>
                <Link to="/portal/client/messages" className="block mt-4">
                  <Button className="w-full text-white" size="sm" style={{ backgroundColor: evergreen }}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message My Advisor
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
