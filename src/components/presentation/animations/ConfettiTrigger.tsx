import { useEffect } from "react";
import confetti from "canvas-confetti";
import { playConfettiSound } from "../sounds/sounds";

interface ConfettiTriggerProps {
  trigger: boolean;
  soundEnabled?: boolean;
}

export default function ConfettiTrigger({ trigger, soundEnabled = false }: ConfettiTriggerProps) {
  useEffect(() => {
    if (!trigger) return;

    confetti({
      particleCount: 120,
      spread: 80,
      colors: ["#1A4D3E", "#C8A96E", "#FFFFFF", "#F5E6C8"],
      origin: { y: 0.6 },
      shapes: ["circle", "square"],
    });

    if (soundEnabled) {
      playConfettiSound();
    }
  }, [trigger, soundEnabled]);

  return null;
}
