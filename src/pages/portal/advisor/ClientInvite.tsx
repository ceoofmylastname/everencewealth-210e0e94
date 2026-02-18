import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Clock, CheckCircle, XCircle, KeyRound, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { SetClientPasswordDialog } from "@/components/portal/advisor/SetClientPasswordDialog";

interface Invitation {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  status: string;
  created_at: string;
  expires_at: string;
  invitation_token: string;
}

interface AdvisorOption {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export default function ClientInvite() {
  const { portalUser } = usePortalAuth();
  const [advisorId, setAdvisorId] = useState<string | null>(null);
  const [advisorList, setAdvisorList] = useState<AdvisorOption[]>([]);
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<string>("");
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "" });
  const [passwordClient, setPasswordClient] = useState<{ email: string; first_name: string; last_name: string; auth_user_id: string } | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);

  useEffect(() => {
    if (!portalUser) return;
    init();
  }, [portalUser]);

  async function init() {
    if (portalUser!.role === "admin") {
      // Admin: load all advisors for dropdown
      const { data: advisors } = await supabase
        .from("advisors")
        .select("id, first_name, last_name, email")
        .eq("is_active", true)
        .order("first_name");
      setAdvisorList((advisors as AdvisorOption[]) ?? []);

      // Load all invitations across all advisors
      const { data } = await supabase
        .from("client_invitations")
        .select("*")
        .order("created_at", { ascending: false });
      setInvitations((data as Invitation[]) ?? []);
    } else {
      // Advisor: use their own advisors row
      const { data: advisor } = await supabase
        .from("advisors")
        .select("id")
        .eq("portal_user_id", portalUser!.id)
        .maybeSingle();

      if (advisor) {
        setAdvisorId(advisor.id);
        const { data } = await supabase
          .from("client_invitations")
          .select("*")
          .eq("advisor_id", advisor.id)
          .order("created_at", { ascending: false });
        setInvitations((data as Invitation[]) ?? []);
      }
    }
    setLoading(false);
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();

    const effectiveAdvisorId = portalUser?.role === "admin" ? selectedAdvisorId : advisorId;

    if (portalUser?.role === "admin" && !selectedAdvisorId) {
      toast.error("Please select an advisor");
      return;
    }
    if (!effectiveAdvisorId) {
      toast.error("Advisor record not found. Contact your administrator.");
      return;
    }

    setSending(true);
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: inserted, error } = await supabase.from("client_invitations").insert({
      advisor_id: effectiveAdvisorId,
      email: form.email,
      first_name: form.first_name,
      last_name: form.last_name,
      phone: form.phone || null,
      invitation_token: token,
      expires_at: expiresAt,
      status: "pending",
    }).select().single();

    if (error) {
      toast.error(error.message);
    } else {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && inserted) {
          await supabase.functions.invoke("send-portal-invitation", {
            body: { invitation_id: inserted.id },
          });
        }
      } catch (emailErr) {
        console.error("Email send failed:", emailErr);
      }

      toast.success(`Invitation sent to ${form.first_name} ${form.last_name}`);
      setForm({ first_name: "", last_name: "", email: "", phone: "" });
      init();
    }
    setSending(false);
  }

  async function handleResend(inv: Invitation) {
    setResendingId(inv.id);
    try {
      await supabase.functions.invoke("send-portal-invitation", {
        body: { invitation_id: inv.id },
      });
      toast.success(`Invitation resent to ${inv.email}`);
    } catch (err: any) {
      toast.error("Failed to resend invitation");
    } finally {
      setResendingId(null);
    }
  }

  async function handleSetPassword(inv: Invitation) {
    // Look up the client's auth_user_id from portal_users
    const { data: clientUser } = await supabase
      .from("portal_users")
      .select("auth_user_id")
      .eq("email", inv.email)
      .eq("role", "client")
      .maybeSingle();

    if (!clientUser?.auth_user_id) {
      toast.error("Client account not found. They may not have signed up yet.");
      return;
    }

    setPasswordClient({
      email: inv.email,
      first_name: inv.first_name,
      last_name: inv.last_name,
      auth_user_id: clientUser.auth_user_id,
    });
    setPasswordDialogOpen(true);
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-3.5 w-3.5" />;
      case "accepted": return <CheckCircle className="h-3.5 w-3.5" />;
      case "expired": case "revoked": return <XCircle className="h-3.5 w-3.5" />;
      default: return null;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "accepted": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
        Invite Client
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">New Invitation</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="space-y-4">
            {portalUser?.role === "admin" && (
              <div className="space-y-2">
                <Label>Invite on Behalf of Advisor *</Label>
                <Select value={selectedAdvisorId} onValueChange={setSelectedAdvisorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select advisor..." />
                  </SelectTrigger>
                  <SelectContent>
                    {advisorList.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.first_name} {a.last_name} — {a.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name *</Label>
                <Input required value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Last Name *</Label>
                <Input required value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>
            <Button type="submit" disabled={sending}>
              <Send className="h-4 w-4 mr-2" />{sending ? "Sending..." : "Create Invitation"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Invitation History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : invitations.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No invitations sent yet.</p>
          ) : (
            <div className="space-y-3">
              {invitations.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium text-foreground">{inv.first_name} {inv.last_name}</p>
                    <p className="text-sm text-muted-foreground">{inv.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Sent {new Date(inv.created_at).toLocaleDateString()}
                      {inv.status === "pending" && ` • Expires ${new Date(inv.expires_at).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {inv.status === "accepted" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetPassword(inv)}
                      >
                        <KeyRound className="h-3.5 w-3.5 mr-1" /> Set Password
                      </Button>
                    )}
                    {inv.status === "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={resendingId === inv.id}
                        onClick={() => handleResend(inv)}
                      >
                        <RotateCcw className="h-3.5 w-3.5 mr-1" />
                        {resendingId === inv.id ? "Sending..." : "Resend"}
                      </Button>
                    )}
                    <Badge className={statusColor(inv.status)}>
                      <span className="flex items-center gap-1">{statusIcon(inv.status)} {inv.status}</span>
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <SetClientPasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
        client={passwordClient}
      />
    </div>
  );
}
