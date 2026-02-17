import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface EmailGateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brochureId: string;
  brochureTitle: string;
  pdfUrl?: string | null;
}

export function EmailGateModal({ open, onOpenChange, brochureId, brochureTitle, pdfUrl }: EmailGateModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subscribe, setSubscribe] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    try {
      // Record download
      await supabase.from("brochure_downloads").insert({
        brochure_id: brochureId,
        user_email: email,
        user_name: name || null,
        source_page: window.location.pathname,
      });

      // Atomic increment
      await supabase.rpc("increment_brochure_download_count", { p_brochure_id: brochureId });

      // Trigger download
      if (pdfUrl) {
        window.open(pdfUrl, "_blank");
      }

      toast({ title: "Download started!", description: "Check your downloads folder." });
      onOpenChange(false);
      setName("");
      setEmail("");
    } catch (err) {
      toast({ title: "Error", description: "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Download Your Free Guide</DialogTitle>
          <DialogDescription>
            Enter your details to download "{brochureTitle}"
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gate-name">Name</Label>
            <Input id="gate-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gate-email">Email *</Label>
            <Input id="gate-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
          </div>
          <div className="flex items-start gap-2">
            <Checkbox id="gate-subscribe" checked={subscribe} onCheckedChange={(v) => setSubscribe(v === true)} className="mt-0.5" />
            <Label htmlFor="gate-subscribe" className="text-xs text-muted-foreground leading-tight cursor-pointer">
              Send me Everence Wealth's weekly retirement planning insights
            </Label>
          </div>
          <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white" disabled={submitting}>
            <Download className="h-4 w-4 mr-2" />
            {submitting ? "Processing..." : "Download Free Guide"}
          </Button>
          <p className="text-[10px] text-muted-foreground text-center">
            We respect your privacy. Unsubscribe anytime.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
