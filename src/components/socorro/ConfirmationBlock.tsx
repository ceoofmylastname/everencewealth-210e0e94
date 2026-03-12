import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface ConfirmationBlockProps {
  name: string;
  advisorName: string;
  date: string;
  time: string;
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

    import("canvas-confetti").then((mod) => {
      const confetti = mod.default;
      const end = Date.now() + 2000;

      const colors = ["#C8A96E", "#1A4D3E", "#F0F2F1"];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    });
  }, []);

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
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: "rgba(26,77,62,0.08)",
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
            stroke="#1A4D3E"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          />
        </motion.svg>
      </div>

      <h1
        className="mb-3"
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "clamp(28px, 4vw, 40px)",
          fontWeight: 700,
          color: "#1A4D3E",
          lineHeight: 1.2,
        }}
      >
        You're All Set, {name}!
      </h1>
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
        Your session has been confirmed. You'll receive a confirmation email shortly with all the details.
      </p>

      {/* Details card */}
      <div
        className="mx-auto p-6 text-left"
        style={{
          maxWidth: "400px",
          background: "#0D1F1A",
          borderRadius: "4px",
        }}
      >
        <div className="space-y-4">
          <div>
            <p
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(240,242,241,0.5)",
                marginBottom: "4px",
              }}
            >
              Advisor
            </p>
            <p
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: "16px",
                fontWeight: 600,
                color: "#C8A96E",
              }}
            >
              {advisorName}
            </p>
          </div>
          <div className="flex gap-8">
            <div>
              <p
                style={{
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(240,242,241,0.5)",
                  marginBottom: "4px",
                }}
              >
                Date
              </p>
              <p
                style={{
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: "16px",
                  color: "#F0F2F1",
                }}
              >
                {date}
              </p>
            </div>
            <div>
              <p
                style={{
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(240,242,241,0.5)",
                  marginBottom: "4px",
                }}
              >
                Time
              </p>
              <p
                style={{
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: "16px",
                  color: "#F0F2F1",
                }}
              >
                {time}
              </p>
            </div>
          </div>
          <div>
            <p
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(240,242,241,0.5)",
                marginBottom: "4px",
              }}
            >
              Location
            </p>
            <p
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: "16px",
                color: "#F0F2F1",
              }}
            >
              Socorro ISD Campus
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
