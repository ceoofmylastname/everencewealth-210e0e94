import { Link } from "react-router-dom";
import type { SocorroAdvisor } from "@/types/socorro";
import ScrollReveal from "./primitives/ScrollReveal";
import GlassCard from "./primitives/GlassCard";
import GoldCTA from "./primitives/GoldCTA";

interface AdvisorCardProps {
  advisor: SocorroAdvisor;
  index: number;
}

export default function AdvisorCard({ advisor, index }: AdvisorCardProps) {
  return (
    <ScrollReveal delay={index * 0.1}>
      <Link
        to={`/socorro-isd/advisors/${advisor.id}`}
        className="block group"
        style={{ textDecoration: "none" }}
      >
        <GlassCard variant="light" hover3d className="overflow-hidden">
          {/* Headshot */}
          <div
            className="aspect-square overflow-hidden"
            style={{
              borderRadius: "var(--socorro-radius-card) var(--socorro-radius-card) 0 0",
              background: "rgba(26,77,62,0.06)",
            }}
          >
            {advisor.headshot_url ? (
              <img
                src={advisor.headshot_url}
                alt={`${advisor.first_name} ${advisor.last_name}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: "48px",
                    fontWeight: 700,
                    color: "#1A4D3E",
                    opacity: 0.25,
                  }}
                >
                  {advisor.first_name[0]}
                  {advisor.last_name[0]}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-6">
            <h3
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "22px",
                fontWeight: 700,
                color: "#1A4D3E",
                marginBottom: "4px",
              }}
            >
              {advisor.first_name} {advisor.last_name}
            </h3>
            {advisor.bio && (
              <p
                className="line-clamp-2 mb-5"
                style={{
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: "14px",
                  color: "#4A5565",
                  lineHeight: 1.5,
                }}
              >
                {advisor.bio}
              </p>
            )}
            <GoldCTA size="sm">See Availability &rarr;</GoldCTA>
          </div>
        </GlassCard>
      </Link>
    </ScrollReveal>
  );
}
