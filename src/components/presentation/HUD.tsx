import { useRevealQueue } from "./RevealContext";
import { Volume2, VolumeX, Grid3X3, X } from "lucide-react";

interface HUDProps {
  onGridToggle?: () => void;
  onExit?: () => void;
}

export default function HUD({ onGridToggle, onExit }: HUDProps) {
  const { currentSlide, revealIndex, totalReveals, totalSlides, soundEnabled, toggleSound } =
    useRevealQueue();

  return (
    <div className="antigravity-hud">
      {/* Left: Slide counter */}
      <div className="flex items-center gap-3">
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            fontWeight: 400,
            letterSpacing: "0.05em",
            color: "rgba(0,0,0,0.4)",
          }}
        >
          {String(currentSlide + 1).padStart(2, "0")} / {totalSlides}
        </span>
      </div>

      {/* Center: Reveal dot indicators */}
      <div className="flex items-center gap-2">
        {totalReveals > 0 && (
          <>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalReveals }, (_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 transition-all duration-300"
                  style={{
                    borderRadius: "var(--radius-full)",
                    background: i < revealIndex ? "var(--ev-green)" : i === revealIndex ? "var(--ev-gold)" : "rgba(0,0,0,0.12)",
                    transform: i === revealIndex ? "scale(1.25)" : "scale(1)",
                  }}
                />
              ))}
            </div>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                fontWeight: 400,
                letterSpacing: "0.04em",
                color: "rgba(0,0,0,0.3)",
              }}
              className="ml-2"
            >
              Reveal {revealIndex} of {totalReveals}
            </span>
          </>
        )}
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-1">
        {onGridToggle && (
          <button
            onClick={onGridToggle}
            className="antigravity-hud-btn"
            title="Grid view"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={toggleSound}
          className="antigravity-hud-btn"
          title={soundEnabled ? "Mute" : "Unmute"}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
        {onExit && (
          <button
            onClick={onExit}
            className="antigravity-hud-btn"
            title="Exit presentation"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
