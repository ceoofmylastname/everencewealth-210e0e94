import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Zap, Clock, User, MapPin, DollarSign, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ClaimableLead, useClaimLead } from "@/hooks/useClaimableLeads";
import { LANGUAGE_FLAGS, SEGMENT_COLORS, getLanguageFlag } from "@/lib/crm-conditional-styles";

interface ClaimNotificationBannerProps {
  leads: ClaimableLead[];
  agentId: string;
  onDismiss: (leadId: string) => void;
}

function CountdownTimer({ expiresAt }: { expiresAt: string | null }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    if (!expiresAt) {
      setTimeLeft("15m 0s");
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const expires = new Date(expiresAt);
      const diff = expires.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("EXPIRED");
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      setTimeLeft(`${minutes}m ${seconds}s`);
      setIsUrgent(minutes < 5);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <div className={cn(
      "flex items-center gap-1 font-mono text-sm font-semibold",
      isUrgent ? "text-red-200 animate-pulse" : "text-white/90"
    )}>
      <Clock className="w-4 h-4" />
      {timeLeft}
      <span className="text-xs font-normal">to claim</span>
    </div>
  );
}

export function ClaimNotificationBanner({
  leads,
  agentId,
  onDismiss,
}: ClaimNotificationBannerProps) {
  const navigate = useNavigate();
  const claimMutation = useClaimLead();
  const [celebrating, setCelebrating] = useState(false);

  const handleClaim = (leadId: string) => {
    navigate(`/crm/agent/leads/${leadId}/claim`);
  };

  if (leads.length === 0) return null;

  return (
    <>
      <AnimatePresence>
        {leads.map((lead) => (
          <motion.div
            key={lead.id}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full"
          >
            <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 border-b border-primary/20 shadow-lg">
              <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  {/* Left: Urgency indicator */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping" />
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full" />
                    </div>

                    <div>
                      <p className="text-white font-semibold text-lg">
                        New Lead Available to Claim!
                      </p>
                      <CountdownTimer expiresAt={lead.claim_window_expires_at} />
                    </div>
                  </div>

                  {/* Middle: Lead details */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-white/70" />
                      <span className="text-white font-medium">
                        {lead.first_name} {lead.last_name}
                      </span>
                      <span className="text-xl">{getLanguageFlag(lead.language)}</span>
                    </div>

                    <Badge
                      className={cn(
                        "text-white border-white/20",
                        SEGMENT_COLORS[lead.lead_segment?.toLowerCase() as keyof typeof SEGMENT_COLORS] ||
                          SEGMENT_COLORS.cold
                      )}
                    >
                      {lead.lead_segment}
                    </Badge>

                    {lead.budget_range && (
                      <div className="flex items-center gap-1 text-white/80 text-sm">
                        <DollarSign className="w-3 h-3" />
                        {lead.budget_range}
                      </div>
                    )}

                    {lead.location_preference?.[0] && (
                      <div className="flex items-center gap-1 text-white/80 text-sm">
                        <MapPin className="w-3 h-3" />
                        {lead.location_preference[0]}
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleClaim(lead.id)}
                      className="bg-white text-primary hover:bg-white/90 font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Claim Lead Now
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDismiss(lead.id)}
                      className="text-white hover:bg-white/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </>
  );
}
