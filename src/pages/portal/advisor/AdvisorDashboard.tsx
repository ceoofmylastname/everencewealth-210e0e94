import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, FolderOpen, Send, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardStats {
  totalClients: number;
  activePolicies: number;
  totalDocuments: number;
  pendingInvitations: number;
}

export default function AdvisorDashboard() {
  const { portalUser } = usePortalAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0, activePolicies: 0, totalDocuments: 0, pendingInvitations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!portalUser) return;
    loadStats();
  }, [portalUser]);

  async function loadStats() {
    try {
      // Get advisor record
      const { data: advisor } = await supabase
        .from("advisors")
        .select("id")
        .eq("portal_user_id", portalUser!.id)
        .maybeSingle();

      if (!advisor) { setLoading(false); return; }

      const [clients, policies, docs, invitations] = await Promise.all([
        supabase.from("portal_users").select("id", { count: "exact", head: true }).eq("advisor_id", portalUser!.id).eq("role", "client"),
        supabase.from("policies").select("id", { count: "exact", head: true }).eq("advisor_id", advisor.id).eq("policy_status", "active"),
        supabase.from("portal_documents").select("id", { count: "exact", head: true }).eq("uploaded_by", portalUser!.id),
        supabase.from("client_invitations").select("id", { count: "exact", head: true }).eq("advisor_id", advisor.id).eq("status", "pending"),
      ]);

      setStats({
        totalClients: clients.count ?? 0,
        activePolicies: policies.count ?? 0,
        totalDocuments: docs.count ?? 0,
        pendingInvitations: invitations.count ?? 0,
      });
    } catch (err) {
      console.error("Error loading stats:", err);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    { label: "Clients", value: stats.totalClients, icon: Users, href: "/portal/advisor/clients", color: "text-primary" },
    { label: "Active Policies", value: stats.activePolicies, icon: FileText, href: "/portal/advisor/policies", color: "text-blue-600" },
    { label: "Documents", value: stats.totalDocuments, icon: FolderOpen, href: "/portal/advisor/documents", color: "text-amber-600" },
    { label: "Pending Invites", value: stats.pendingInvitations, icon: Send, href: "/portal/advisor/invite", color: "text-violet-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
          Welcome back, {portalUser?.first_name}
        </h1>
        <p className="text-muted-foreground mt-1">Here's an overview of your portal activity.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link key={card.label} to={card.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <card.icon className={cn("h-5 w-5", card.color)} />
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {loading ? "—" : card.value}
                </p>
                <p className="text-sm text-muted-foreground">{card.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/portal/advisor/invite"><Send className="h-4 w-4 mr-2" />Invite a New Client</Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/portal/advisor/policies/new"><FileText className="h-4 w-4 mr-2" />Create New Policy</Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/portal/advisor/documents"><FolderOpen className="h-4 w-4 mr-2" />Upload Document</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}
