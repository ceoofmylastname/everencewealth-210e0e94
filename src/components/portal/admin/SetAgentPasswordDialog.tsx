import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";

interface SetAgentPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: { auth_user_id: string; first_name: string; last_name: string; email: string } | null;
}

export function SetAgentPasswordDialog({ open, onOpenChange, agent }: SetAgentPasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!agent) return;
    if (password.length < 8) {
      toast({ title: "Error", description: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("update-portal-agent-password", {
        body: { auth_user_id: agent.auth_user_id, new_password: password },
      });

      if (res.error) throw res.error;
      if (res.data?.error) throw new Error(res.data.error);

      toast({ title: "Success", description: `Password set for ${agent.first_name} ${agent.last_name}` });
      setPassword("");
      setConfirm("");
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to set password", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle style={{ color: "#1A4D3E", fontFamily: "'Playfair Display', serif" }}>
            Set Password for {agent?.first_name} {agent?.last_name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">{agent?.email}</p>
          <div className="space-y-2">
            <Label>New Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Confirm Password</Label>
            <Input
              type={showPassword ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter password"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Setting..." : "Set Password"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
