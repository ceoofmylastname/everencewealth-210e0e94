import AdvisorCard from "./AdvisorCard";
import type { SocorroAdvisor } from "@/types/socorro";
import GlassCard from "./primitives/GlassCard";

interface AdvisorGridProps {
  advisors: SocorroAdvisor[];
  isLoading: boolean;
}

export default function AdvisorGrid({ advisors, isLoading }: AdvisorGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[0, 1, 2].map((i) => (
          <GlassCard key={i} variant="light" className="overflow-hidden animate-pulse">
            <div
              className="aspect-square"
              style={{
                background: "linear-gradient(135deg, rgba(200,169,110,0.06), rgba(26,77,62,0.04))",
              }}
            />
            <div className="p-6 space-y-3">
              <div className="h-6 w-2/3 rounded-full" style={{ background: "rgba(26,77,62,0.08)" }} />
              <div className="h-4 w-full rounded-full" style={{ background: "rgba(26,77,62,0.05)" }} />
              <div className="h-10 w-32 rounded-full" style={{ background: "rgba(200,169,110,0.1)" }} />
            </div>
          </GlassCard>
        ))}
      </div>
    );
  }

  if (advisors.length === 0) {
    return (
      <div className="text-center py-20">
        <p
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "28px",
            fontWeight: 700,
            color: "#1A4D3E",
            marginBottom: "8px",
          }}
        >
          Coming Soon
        </p>
        <p
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: "16px",
            color: "#4A5565",
          }}
        >
          Our advisors are being confirmed. Check back shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {advisors.map((advisor, i) => (
        <AdvisorCard key={advisor.id} advisor={advisor} index={i} />
      ))}
    </div>
  );
}
