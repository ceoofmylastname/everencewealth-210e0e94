import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { SocorroAdvisor } from "@/types/socorro";

interface AdvisorCardProps {
  advisor: SocorroAdvisor;
  index: number;
}

export default function AdvisorCard({ advisor, index }: AdvisorCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
        to={`/socorro-isd/advisors/${advisor.id}`}
        className="block group"
        style={{ textDecoration: "none" }}
      >
        <div
          className="overflow-hidden"
          style={{ background: "#ffffff", borderRadius: "4px", border: "1px solid #E5E7EB" }}
        >
          {/* Headshot */}
          <div className="aspect-square overflow-hidden" style={{ background: "#E8ECE9" }}>
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
                    opacity: 0.3,
                  }}
                >
                  {advisor.first_name[0]}
                  {advisor.last_name[0]}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-5">
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
                className="line-clamp-2 mb-4"
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
            <span
              className="inline-block transition-colors duration-200 group-hover:opacity-90"
              style={{
                background: "#C8A96E",
                color: "#1A4D3E",
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: "13px",
                fontWeight: 700,
                padding: "10px 24px",
                borderRadius: "4px",
              }}
            >
              See Availability →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
