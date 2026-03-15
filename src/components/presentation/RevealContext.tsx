import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react";

interface SlideConfig {
  totalReveals: number;
}

interface RevealState {
  currentSlide: number;
  revealIndex: number;
  totalReveals: number;
  totalSlides: number;
  soundEnabled: boolean;
  advance: () => void;
  back: () => void;
  goToSlide: (index: number) => void;
  toggleSound: () => void;
  isRevealed: (index: number) => boolean;
}

const RevealContext = createContext<RevealState | null>(null);

export function useRevealQueue(): RevealState {
  const ctx = useContext(RevealContext);
  if (!ctx) throw new Error("useRevealQueue must be used within RevealProvider");
  return ctx;
}

interface RevealProviderProps {
  children: ReactNode;
  slideConfigs: SlideConfig[];
  onExit?: () => void;
}

export function RevealProvider({ children, slideConfigs, onExit }: RevealProviderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [revealIndex, setRevealIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const currentSlideRef = useRef(currentSlide);
  const revealIndexRef = useRef(revealIndex);

  useEffect(() => { currentSlideRef.current = currentSlide; }, [currentSlide]);
  useEffect(() => { revealIndexRef.current = revealIndex; }, [revealIndex]);

  const totalSlides = slideConfigs.length;
  const totalReveals = slideConfigs[currentSlide]?.totalReveals ?? 0;

  const advance = useCallback(() => {
    const s = currentSlideRef.current;
    const r = revealIndexRef.current;
    const max = slideConfigs[s]?.totalReveals ?? 0;

    if (r < max) {
      setRevealIndex(r + 1);
    } else if (s < slideConfigs.length - 1) {
      setCurrentSlide(s + 1);
      setRevealIndex(0);
    }
  }, [slideConfigs]);

  const back = useCallback(() => {
    const s = currentSlideRef.current;
    const r = revealIndexRef.current;

    if (r > 0) {
      setRevealIndex(r - 1);
    } else if (s > 0) {
      const prevReveals = slideConfigs[s - 1]?.totalReveals ?? 0;
      setCurrentSlide(s - 1);
      setRevealIndex(prevReveals);
    } else if (onExit) {
      onExit();
    }
  }, [slideConfigs, onExit]);

  const goToSlide = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalSlides) {
        setCurrentSlide(index);
        setRevealIndex(0);
      }
    },
    [totalSlides]
  );

  const toggleSound = useCallback(() => setSoundEnabled((s) => !s), []);

  const isRevealed = useCallback(
    (index: number) => revealIndex >= index,
    [revealIndex]
  );

  return (
    <RevealContext.Provider
      value={{
        currentSlide,
        revealIndex,
        totalReveals,
        totalSlides,
        soundEnabled,
        advance,
        back,
        goToSlide,
        toggleSound,
        isRevealed,
      }}
    >
      {children}
    </RevealContext.Provider>
  );
}
