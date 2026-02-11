import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Building2 } from "lucide-react";
import logo from "@/assets/logo.png";

const ApartmentsAuth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if already logged in with correct role
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const hasAccess = await checkApartmentsAccess(session.user.id);
        if (hasAccess) {
          navigate("/apartments/dashboard/content", { replace: true });
          return;
        }
      }
      setChecking(false);
    };
    checkSession();
  }, [navigate]);

  const checkApartmentsAccess = async (userId: string): Promise<boolean> => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .in("role", ["admin", "apartments_editor"]);
    return (data && data.length > 0) || false;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    if (data.user) {
      const hasAccess = await checkApartmentsAccess(data.user.id);
      if (!hasAccess) {
        await supabase.auth.signOut();
        toast({
          title: "Access denied",
          description: "You don't have access to the apartments editor. Contact an admin.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      navigate("/apartments/dashboard/content", { replace: true });
    }
    setLoading(false);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={logo} alt="Del Sol Prime Homes" className="h-16 drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]" />
          </div>
          <div>
            <CardTitle className="flex items-center justify-center gap-2">
              <Building2 className="h-5 w-5" />
              Apartments Editor
            </CardTitle>
            <CardDescription>Sign in to manage apartment listings</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApartmentsAuth;
