import { useRef, useState, useCallback } from "react";
import RevealElement from "../RevealElement";
import GoldUnderline from "../animations/GoldUnderline";
import advisorMeetingImg from "@/assets/advisor-meeting.jpg";

const missionBlocks = [
  "With over 45 years of combined experience in the financial services industry, at Everence Wealth, we are driven by one purpose: to deliver the very best.",
  "At Everence Wealth, we believe that true wealth is defined not only by numbers, but by endurance, legacy, and impact.",
  "Our mission is to help individuals and families build, preserve, and pass on a level of prosperity that stands the test of time.",
];

const blockAccents = [
  "rgba(200, 169, 110, 0.15)",
  "rgba(26, 77, 62, 0.12)",
  "rgba(200, 169, 110, 0.10)",
];

function TiltCard({
  children,
  className = "",
  style = {},
  glowColor,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  glowColor: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(800px) rotateX(0deg) rotateY(0deg)");
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTransform(`perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px) scale(1.02)`);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTransform("perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)");
    setIsHovered(false);
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={(e) => { handleMouseMove(e); setIsHovered(true); }}
      onMouseLeave={handleMouseLeave}
      style={{
        ...style,
        transform,
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        boxShadow: isHovered
          ? `0 20px 50px -12px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.8)`
          : "0 4px 20px -4px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)",
      }}
    >
      {/* Light sweep */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.45) 50%, transparent 60%)",
          backgroundSize: "200% 100%",
          backgroundPosition: isHovered ? "100% 0" : "-100% 0",
          transition: "background-position 0.6s ease",
          pointerEvents: "none",
          zIndex: 5,
        }}
      />
      {children}
    </div>
  );
}

export default function Slide04_OurMission() {
  const [imgHovered, setImgHovered] = useState(false);

  return (
    <div className="antigravity-slide bg-white">
      <style>{`
        @keyframes slide04Float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes slide04GlowPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        @keyframes slide04BorderShift {
          0% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
          33% { border-radius: 40% 60% 60% 40% / 40% 30% 70% 60%; }
          66% { border-radius: 35% 65% 55% 45% / 25% 40% 60% 75%; }
          100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
        }
      `}</style>

      <div className="antigravity-editorial">
        {/* Left Side */}
        <div>
          {/* Title */}
          <RevealElement index={1} direction="slam">
            <h2
              className="text-5xl md:text-6xl mb-1"
              style={{
                color: "#4A5565",
                fontFamily: "var(--font-display)",
                fontWeight: 300,
                letterSpacing: "-0.02em",
              }}
            >
              Our
            </h2>
            <h2
              className="text-5xl md:text-6xl font-bold mb-4"
              style={{
                color: "#1A4D3E",
                fontFamily: "var(--font-display)",
                letterSpacing: "-0.02em",
              }}
            >
              <GoldUnderline>Mission</GoldUnderline>
            </h2>
            <div
              className="w-[80px] h-1 rounded-full mb-8"
              style={{
                background: "linear-gradient(90deg, #C8A96E, #E8D5A3)",
                boxShadow: "0 2px 12px rgba(200, 169, 110, 0.4)",
              }}
            />
          </RevealElement>

          {/* Mission blocks with 3D tilt */}
          {missionBlocks.map((block, i) => (
            <RevealElement key={i} index={i + 2} direction="cardRise" className="mb-5">
              <TiltCard
                glowColor={blockAccents[i]}
                className="group relative overflow-hidden rounded-2xl"
                style={{
                  padding: "20px 24px",
                  background: "rgba(255, 255, 255, 0.6)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: "1px solid rgba(255, 255, 255, 0.7)",
                  borderLeft: `3px solid rgba(200, 169, 110, ${0.5 - i * 0.1})`,
                }}
              >
                <p
                  className="text-base leading-relaxed relative"
                  style={{ color: "#4A5565", fontWeight: 400, zIndex: 2 }}
                >
                  {block}
                </p>
              </TiltCard>
            </RevealElement>
          ))}
        </div>

        {/* Right Side — Animated blob image with 3D depth */}
        <div className="flex items-center justify-center">
          <RevealElement index={5} direction="drift">
            <div
              className="relative"
              style={{
                animation: "slide04Float 5s ease-in-out infinite",
              }}
            >
              {/* Ambient glow behind image */}
              <div
                className="absolute -inset-6"
                style={{
                  borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
                  background: "radial-gradient(ellipse at 60% 40%, rgba(200, 169, 110, 0.25), rgba(26, 77, 62, 0.15), transparent 70%)",
                  animation: "slide04GlowPulse 4s ease-in-out infinite",
                  filter: "blur(20px)",
                }}
              />

              {/* Image container with morphing border */}
              <div
                className="relative overflow-hidden cursor-pointer"
                onMouseEnter={() => setImgHovered(true)}
                onMouseLeave={() => setImgHovered(false)}
                style={{
                  animation: "slide04BorderShift 8s ease-in-out infinite",
                  boxShadow: imgHovered
                    ? "0 30px 80px -20px rgba(26, 77, 62, 0.35), 0 0 0 1px rgba(200, 169, 110, 0.3)"
                    : "0 20px 60px -15px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.3)",
                  transition: "box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                  transform: imgHovered ? "scale(1.03)" : "scale(1)",
                }}
              >
                <img
                  src={advisorMeetingImg}
                  alt="Professional financial advisor in modern office"
                  className="w-full h-[420px] object-cover"
                  style={{
                    transition: "transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
                    transform: imgHovered ? "scale(1.08)" : "scale(1)",
                  }}
                />

                {/* Subtle gradient overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: imgHovered
                      ? "linear-gradient(135deg, rgba(26, 77, 62, 0.05) 0%, transparent 50%, rgba(200, 169, 110, 0.1) 100%)"
                      : "linear-gradient(135deg, rgba(26, 77, 62, 0.08) 0%, transparent 60%)",
                    transition: "background 0.5s ease",
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>
          </RevealElement>
        </div>
      </div>
    </div>
  );
}
