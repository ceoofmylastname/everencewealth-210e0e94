import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Users, CheckCircle, XCircle } from "lucide-react";
import { useCrmAgents } from "@/hooks/useCrmAgents";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface AgentCapacityOverviewProps {
  className?: string;
}

export function AgentCapacityOverview({ className }: AgentCapacityOverviewProps) {
  const { data: agents, isLoading } = useCrmAgents();

  const activeAgents = agents?.filter((a) => a.is_active) || [];
  const totalCapacity = activeAgents.reduce(
    (sum, a) => sum + a.max_active_leads,
    0
  );
  const usedCapacity = activeAgents.reduce(
    (sum, a) => sum + a.current_lead_count,
    0
  );
  const overallPercent = totalCapacity > 0 ? (usedCapacity / totalCapacity) * 100 : 0;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Agent Capacity
          </span>
          <Badge variant="outline" className="font-normal">
            {usedCapacity}/{totalCapacity} leads
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Overall capacity bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Team Capacity</span>
            <span>{Math.round(overallPercent)}%</span>
          </div>
          <Progress
            value={overallPercent}
            className={cn(
              "h-2",
              overallPercent >= 80 && "[&>div]:bg-red-500",
              overallPercent >= 50 && overallPercent < 80 && "[&>div]:bg-amber-500"
            )}
          />
        </div>

        {/* Agent list */}
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-2 w-full" />
                </div>
              </div>
            ))
          ) : (
            activeAgents.map((agent) => {
              const percent =
                agent.max_active_leads > 0
                  ? (agent.current_lead_count / agent.max_active_leads) * 100
                  : 0;
              const isAtCapacity =
                agent.current_lead_count >= agent.max_active_leads;

              return (
                <div key={agent.id} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="text-xs">
                      {agent.first_name[0]}
                      {agent.last_name[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">
                        {agent.first_name} {agent.last_name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {agent.current_lead_count}/{agent.max_active_leads}
                        </span>
                        {agent.accepts_new_leads ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                    </div>
                    <Progress
                      value={percent}
                      className={cn(
                        "h-1.5",
                        percent >= 80 && "[&>div]:bg-red-500",
                        percent >= 50 && percent < 80 && "[&>div]:bg-amber-500",
                        isAtCapacity && "[&>div]:bg-red-500"
                      )}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {activeAgents.length === 0 && !isLoading && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No active agents
          </p>
        )}
      </CardContent>
    </Card>
  );
}
