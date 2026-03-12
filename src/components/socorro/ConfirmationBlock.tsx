import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import ShimmerHeadline from "./primitives/ShimmerHeadline";
import GlassCard from "./primitives/GlassCard";

interface ConfirmationBlockProps {
  name: string;
  advisorName: string;
  date: string;
  time: string;
}

function playPopSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const duration = 0.15;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate;
      data[i] = Math.sin(2 * Math.PI * 600 * t) * Math.exp(-t * 40) * 0.5
        + (Math.random() * 2 - 1) * Math.exp(-t * 30) * 0.3;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.6, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    source.onended = () => ctx.close();
  } catch {
    // Audio not supported, silently skip
  }
}

export default function ConfirmationBlock({
  name,
  advisorName,
  date,
  time,
}: ConfirmationBlockProps) {
  const confettiRef = useRef(false);

  useEffect(() => {
    if (confettiRef.current) return;
    confettiRef.current = true;

    // Play pop sound
    playPopSound();

    import("canvas-confetti").then((mod) => {
      const confetti = mod.default;
      const colors = ["#C8A96E", "#1A4D3E", "#F0F2F1", "#FFD700", "#E8D5B7"];

      // Initial big burst from both sides
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 80,
        startVelocity: 55,
        origin: { x: 0, y: 0.6 },
        colors,
        gravity: 0.8,
      });
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 80,
        startVelocity: 55,
        origin: { x: 1, y: 0.6 },
        colors,
        gravity: 0.8,
      });

      // Continuous stream for 3 seconds
      const end = Date.now() + 3000;
      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 65,
          startVelocity: 45,
          origin: { x: 0, y: 0.7 },
          colors,
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 65,
          startVelocity: 45,
          origin: { x: 1, y: 0.7 },
          colors,
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    });
  }, []);

  const labelStyle: React.CSSProperties = {
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "rgba(240,242,241,0.45)",
    marginBottom: "4px",
  };

  const valueStyle: React.CSSProperties = {
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontSize: "16px",
    color: "#F0F2F1",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="text-center"
    >
      {/* Animated checkmark */}
      <div
        className="mx-auto mb-6 flex items-center justify-center"
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "rgba(200,169,110,0.1)",
          border: "2px solid rgba(200,169,110,0.2)",
        }}
      >
        <motion.svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <motion.path
            d="M10 20 L17 27 L30 13"
            fill="none"
            stroke="#C8A96E"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          />
        </motion.svg>
      </div>

      <ShimmerHeadline as="h1" className="text-[clamp(28px,4vw,40px)] mb-3">
        You're All Set, {name}!
      </ShimmerHeadline>

      <p
        className="mb-8"
        style={{
          fontFamily: "'DM Sans', system-ui, sans-serif",
          fontSize: "16px",
          color: "#4A5565",
          maxWidth: "440px",
          margin: "0 auto 32px",
          lineHeight: 1.6,
        }}
      >
        Your session has been confirmed. You'll receive a confirmation email
        shortly with all the details.
      </p>

      {/* Details card — glass dark */}
      <GlassCard className="mx-auto p-6 text-left" style={{ maxWidth: 420, background: "rgba(13,31,26,0.95)" }}>
        <div className="space-y-4">
          <div>
            <p style={labelStyle}>Advisor</p>
            <p style={{ ...valueStyle, color: "#C8A96E", fontWeight: 600 }}>
              {advisorName}
            </p>
          </div>
          <div className="flex gap-8">
            <div>
              <p style={labelStyle}>Date</p>
              <p style={valueStyle}>{date}</p>
            </div>
            <div>
              <p style={labelStyle}>Time</p>
              <p style={valueStyle}>{time}</p>
            </div>
          </div>
          <div>
            <p style={labelStyle}>Location</p>
            <p style={valueStyle}>Socorro ISD Campus</p>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
