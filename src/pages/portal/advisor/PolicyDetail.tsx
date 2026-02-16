import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Pencil } from "lucide-react";

interface PolicyRow {
  id: string;
  client_id: string;
  advisor_id: string;
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
  notes: string | null;
  created_at: string;
  updated_at: string;
  client?: { first_name: string; last_name: string; email: string };
}

export default function PolicyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [policy, setPolicy] = useState<PolicyRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPolicy();
  }, [id]);

  async function loadPolicy() {
    const { data, error } = await supabase
      .from("policies")
      .select("*, client:portal_users!policies_client_id_fkey(first_name, last_name, email)")
      .eq("id", id!)
      .single();

    if (error) {
      console.error(error);
      navigate("/portal/advisor/policies");
      return;
    }
    setPolicy(data as PolicyRow);
    setLoading(false);
  }

  if (loading || !policy) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const fmt = (n: number | null) => n != null ? `$${n.toLocaleString()}` : "—";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/portal/advisor/policies")}>
          <ArrowLeft className="h-4 w-4 mr-2" />Back
        </Button>
        <Button asChild>
          <Link to={`/portal/advisor/policies/${policy.id}/edit`}>
            <Pencil className="h-4 w-4 mr-2" />Edit
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle style={{ fontFamily: "'Playfair Display', serif" }}>
              {policy.carrier_name}
            </CardTitle>
            <Badge>{policy.policy_status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Detail label="Policy Number" value={policy.policy_number} />
            <Detail label="Product Type" value={policy.product_type.replace(/_/g, " ")} />
            <Detail label="Client" value={policy.client ? `${policy.client.first_name} ${policy.client.last_name}` : "—"} />
            <Detail label="Client Email" value={policy.client?.email ?? "—"} />
            <Detail label="Death Benefit" value={fmt(policy.death_benefit)} />
            <Detail label="Cash Value" value={fmt(policy.cash_value)} />
            <Detail label="Monthly Premium" value={fmt(policy.monthly_premium)} />
            <Detail label="Premium Frequency" value={policy.premium_frequency?.replace(/_/g, " ") ?? "—"} />
            <Detail label="Issue Date" value={policy.issue_date ?? "—"} />
            <Detail label="Maturity Date" value={policy.maturity_date ?? "—"} />
          </div>
          {policy.notes && (
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Notes</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{policy.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium text-foreground capitalize">{value}</p>
    </div>
  );
}
