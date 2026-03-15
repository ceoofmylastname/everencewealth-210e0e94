import { useState } from "react";
import RevealElement from "../RevealElement";
import slide10Thumb from "@/assets/slide10-thumbnail.jpg";


const quotes = [
  "The typical 401k investor is a financial novice.",
  "Mediocre. With half the funds... dogs.",
  "A raid on these funds by the people of Wall Street.",
];

export default function Slide10_SixtyMinutes() {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="antigravity-slide" style={{ background: "#FAFAF8" }}>
      <style>{`
        @keyframes slide10BorderRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes slide10Shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes slide10PillSweep {
          0% { background-position: -100% 0; }
          100% { background-position: 200% 0; }
        }
        .slide10-card-wrap {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          padding: 2px;
        }
        .slide10-card-wrap::before {
          content: '';
          position: absolute;
          inset: -50%;
          background: conic-gradient(
            from 0deg,
            rgba(200, 169, 110, 0.6) 0%,
            transparent 12%,
            transparent 50%,
            rgba(200, 169, 110, 0.4) 62%,
            transparent 100%
          );
          animation: slide10BorderRotate 6s linear infinite;
          z-index: 0;
        }
        .slide10-card-inner {
          position: relative;
          z-index: 1;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          padding: 20px 16px;
          height: 100%;
        }
        .slide10-shimmer {
          background: linear-gradient(90deg, #e8e8e8 25%, #f5f5f5 50%, #e8e8e8 75%);
          background-size: 200% 100%;
          animation: slide10Shimmer 1.5s ease-in-out infinite;
        }
        .slide10-play-btn {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s, background 0.2s;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }
        .slide10-play-btn:hover {
          transform: scale(1.1);
          background: rgba(0, 0, 0, 0.75);
        }
      `}</style>

      <div className="antigravity-slide-inner flex flex-col items-center justify-center">
        {/* Reveal 1: Video Player */}
        <RevealElement index={1} direction="whomp" className="w-full max-w-2xl mb-8">
          <div
            style={{
              borderRadius: 24,
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)",
              aspectRatio: "16/9",
              position: "relative",
              background: "#111",
            }}
          >
            {playing ? (
              <iframe
                src="https://www.youtube.com/embed/eNo9HLgbax0?autoplay=1&rel=0"
                title="60 Minutes - 401k Recession"
                allow="autoplay; encrypted-media"
                allowFullScreen
                style={{
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  inset: 0,
                  border: "none",
                  borderRadius: 24,
                }}
              />
            ) : (
              <div
                onClick={() => setPlaying(true)}
                style={{
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  inset: 0,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                    src={slide10Thumb}
                    alt="60 Minutes broadcast studio thumbnail"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      position: "absolute",
                      inset: 0,
                      borderRadius: 24,
                    }}
                  />
                {/* Dark overlay for play button contrast */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.25)",
                    borderRadius: 24,
                  }}
                />
                {/* Play button */}
                <div className="slide10-play-btn" style={{ position: "relative", zIndex: 2 }}>
                  <svg width="28" height="32" viewBox="0 0 28 32" fill="none">
                    <path d="M4 2L26 16L4 30V2Z" fill="white" />
                  </svg>
                </div>
                {/* Title overlay */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 20,
                    left: 24,
                    zIndex: 2,
                    color: "white",
                  }}
                >
                  <div style={{ fontSize: 14, opacity: 0.7, fontWeight: 500, letterSpacing: 2, textTransform: "uppercase" }}>
                    CBS News
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>
                    60 Minutes — The 401k Recession
                  </div>
                </div>
              </div>
            )}
          </div>
        </RevealElement>

        {/* Reveal 2: Quote cards with animated borders */}
        <RevealElement index={2} direction="cardRise">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto mb-6">
            {quotes.map((quote, i) => (
              <div key={i} className="slide10-card-wrap">
                <div className="slide10-card-inner text-center flex items-center justify-center">
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#3a3a3a",
                      lineHeight: 1.6,
                      fontStyle: "italic",
                    }}
                  >
                    "{quote}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </RevealElement>

        {/* Reveal 3: Divider */}
        <RevealElement index={3} direction="wipe" className="flex justify-center mb-4">
          <div
            style={{
              width: 60,
              height: 2,
              borderRadius: 9999,
              background: "linear-gradient(90deg, #C8A96E, #E8D5A8)",
            }}
          />
        </RevealElement>

        {/* Reveal 4: Bottom pill */}
        <RevealElement index={4} direction="drop" className="flex justify-center">
          <div
            className="antigravity-pill"
            style={{
              borderRadius: 9999,
              background: "linear-gradient(135deg, #C8A96E 0%, #E8D5A8 50%, #C8A96E 100%)",
              backgroundSize: "200% 100%",
              animation: "slide10PillSweep 4s ease-in-out infinite",
              color: "#1a1a1a",
              fontSize: 14,
              fontWeight: 700,
              padding: "10px 28px",
              boxShadow: "0 4px 16px rgba(200, 169, 110, 0.25)",
            }}
          >
            These facts are real. These fees are yours.
          </div>
        </RevealElement>
      </div>
    </div>
  );
}
