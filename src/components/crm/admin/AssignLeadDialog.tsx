import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { UserCheck, Zap, DollarSign, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminLead, EligibleAgent, getSuggestedAgent } from "@/hooks/useAdminLeads";
import { getLanguageFlag, getSegmentVariant, getPriorityConfig } from "@/lib/crm-conditional-styles";

interface AssignLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: AdminLead | null;
  agents: EligibleAgent[];
  onAssign: (leadId: string, agentId: string, reason: string) => void;
  isAssigning?: boolean;
}

export function AssignLeadDialog({
  open,
  onOpenChange,
  lead,
  agents,
  onAssign,
  isAssigning = false,
}: AssignLeadDialogProps) {
  const [selectedAgent, setSelectedAgent] = useState("");
  const [reason, setReason] = useState("");

  if (!lead) return null;

  const eligibleAgents = agents.filter(
    (a) =>
      a.languages.includes(lead.language) &&
      a.current_lead_count < a.max_active_leads
  );

  const suggestedAgent = getSuggestedAgent(agents, lead.language);
  const isReassignment = !!lead.assigned_agent_id;
  const priorityConfig = getPriorityConfig(lead.lead_priority);

  const handleAssign = () => {
    if (lead && selectedAgent) {
      onAssign(lead.id, selectedAgent, reason);
      setSelectedAgent("");
      setReason("");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedAgent("");
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isReassignment ? "Reassign Lead" : "Assign Lead"}
          </DialogTitle>
          <DialogDescription>
            {lead.first_name} {lead.last_name} •{" "}
            {getLanguageFlag(lead.language)} {lead.language.toUpperCase()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Lead Summary */}
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Segment</p>
                  <Badge variant={getSegmentVariant(lead.lead_segment) as any}>
                    {lead.lead_segment.replace("_", " ")}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Priority</p>
                  <Badge variant={priorityConfig.variant as any}>
                    {priorityConfig.label}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Budget
                  </p>
                  <p className="font-medium">
                    {lead.budget_range || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Location
                  </p>
                  <p className="font-medium truncate">
                    {lead.location_preference?.slice(0, 2).join(", ") || "Any"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agent Selection */}
          <div className="space-y-2">
            <Label>Select Agent *</Label>
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an agent..." />
              </SelectTrigger>
              <SelectContent>
                {eligibleAgents.map((agent) => {
                  const capacityPercent =
                    (agent.current_lead_count / agent.max_active_leads) * 100;
                  const isSuggested = agent.id === suggestedAgent?.id;

                  return (
                    <SelectItem key={agent.id} value={agent.id}>
                      <div className="flex items-center justify-between w-full gap-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {agent.first_name[0]}
                              {agent.last_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span>
                            {agent.first_name} {agent.last_name}
                          </span>
                          {isSuggested && (
                            <Badge
                              variant="secondary"
                              className="text-xs flex items-center gap-1"
                            >
                              <Zap className="h-3 w-3" />
                              Suggested
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {agent.current_lead_count}/{agent.max_active_leads}
                          </span>
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                capacityPercent < 50 && "bg-green-500",
                                capacityPercent >= 50 &&
                                  capacityPercent < 80 &&
                                  "bg-amber-500",
                                capacityPercent >= 80 && "bg-red-500"
                              )}
                              style={{ width: `${capacityPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {eligibleAgents.length === 0 && (
              <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                No eligible agents available. All agents are at capacity or
                don't speak {lead.language}.
              </p>
            )}
          </div>

          {/* Assignment Reason */}
          <div className="space-y-2">
            <Label>Assignment Reason (Optional)</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are you assigning this lead to this agent?"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedAgent || isAssigning}
            className="gap-2"
          >
            <UserCheck className="h-4 w-4" />
            {isAssigning ? "Assigning..." : "Assign Lead"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
