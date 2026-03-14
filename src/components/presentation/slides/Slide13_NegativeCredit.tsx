import { useState } from "react";
import RevealElement from "../RevealElement";
import BlobClip from "../BlobClip";
import CountingNumber from "../animations/CountingNumber";
import coupleStressedImg from "@/assets/couple-stressed-bills.jpg";

interface StepCardProps {
  label: string;
  value: string;
  numericValue?: number;
  prefix?: string;
  suffix?: string;
  isNegative?: boolean;
  accentColor: string;
  glowColor: string;
}

function StepCard({ label, value, numericValue, prefix = "", suffix = "", isNegative, accentColor, glowColor }: StepCardProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientY - rect.top - rect.height / 2) / 12;
    const y = -(e.clientX - rect.left - rect.width / 2) / 12;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <div
      className="relative group"
      style={{ perspective: "800px" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glow behind */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 blur-xl"
        style={{ background: glowColor }}
      />
      <div
        className="relative flex items-center justify-between px-5 py-4 rounded-2xl border transition-transform duration-200 ease-out"
        style={{
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderColor: `${accentColor}33`,
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
      >
        <span className="text-sm font-medium" style={{ color: "#8B9AAF" }}>{label}</span>
        <span
          className="text-2xl font-bold antigravity-stat"
          style={{ color: isNegative ? "#EF4444" : accentColor }}
        >
          {numericValue !== undefined ? (
            <CountingNumber
              value={numericValue}
              prefix={prefix}
              suffix={suffix}
              duration={1.4}
            />
          ) : (
            value
          )}
        </span>
      </div>
    </div>
  );
}

const steps: StepCardProps[] = [
  {
    label: "Starting Value",
    value: "$100,000",
    numericValue: 100000,
    prefix: "$",
    accentColor: "#EDDB77",
    glowColor: "radial-gradient(circle, rgba(237,219,119,0.3) 0%, transparent 70%)",
  },
  {
    label: "Market Loss",
    value: "-50%",
    numericValue: 50,
    prefix: "-",
    suffix: "%",
    isNegative: true,
    accentColor: "#EF4444",
    glowColor: "radial-gradient(circle, rgba(239,68,68,0.3) 0%, transparent 70%)",
  },
  {
    label: "Remaining",
    value: "$50,000",
    numericValue: 50000,
    prefix: "$",
    accentColor: "#8B9AAF",
    glowColor: "radial-gradient(circle, rgba(139,154,175,0.2) 0%, transparent 70%)",
  },
  {
    label: "Gain Needed",
    value: "+50%",
    numericValue: 50,
    prefix: "+",
    suffix: "%",
    accentColor: "#1A4D3E",
    glowColor: "radial-gradient(circle, rgba(26,77,62,0.3) 0%, transparent 70%)",
  },
  {
    label: "Result",
    value: "$75,000",
    numericValue: 75000,
    prefix: "$",
    accentColor: "#D4A853",
    glowColor: "radial-gradient(circle, rgba(212,168,83,0.3) 0%, transparent 70%)",
  },
];

export default function Slide13_NegativeCredit() {
  return (
    <div className="antigravity-slide" style={{ background: "linear-gradient(135deg, #0F1419 0%, #1A2332 50%, #0F1419 100%)" }}>
      <div className="antigravity-editorial">
        {/* Left — glassmorphism step cards */}
        <div className="flex flex-col gap-4">
          {/* Reveal 1: Title */}
          <RevealElement index={1} direction="slam" className="mb-2">
            <h2
              className="text-3xl font-bold"
              style={{ color: "#EDDB77", fontFamily: "var(--font-display)" }}
            >
              Traditional Approach
            </h2>
            <p className="text-sm mt-2 italic" style={{ color: "#8B9AAF" }}>
              The consequence of a negative interest credit
            </p>
          </RevealElement>

          {/* Reveal 2: Step cards with counting numbers */}
          <RevealElement index={2} direction="cardRise">
            <div className="space-y-3">
              {steps.map((step, i) => (
                <StepCard key={i} {...step} />
              ))}
            </div>
          </RevealElement>

          {/* Reveal 3: Warning pill with red glow */}
          <RevealElement index={3} direction="explode" className="mt-2">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-2xl blur-lg animate-pulse"
                style={{ background: "rgba(239,68,68,0.25)" }}
              />
              <div
                className="relative px-5 py-3 rounded-2xl text-center text-sm font-bold border"
                style={{
                  background: "rgba(239,68,68,0.12)",
                  backdropFilter: "blur(16px)",
                  borderColor: "rgba(239,68,68,0.4)",
                  color: "#FCA5A5",
                }}
              >
                Still $25,000 short. Not even whole.
              </div>
            </div>
          </RevealElement>
        </div>

        {/* Right — BlobClip with stressed couple portrait */}
        <RevealElement index={4} direction="right" className="flex items-center justify-center">
          <BlobClip
            imageSrc={coupleStressedImg}
            imageAlt="Couple reviewing finances and debt"
            height="400px"
            variant={2}
            imageStyle={{ objectPosition: "center top" }}
          />
        </RevealElement>
      </div>
    </div>
  );
}
