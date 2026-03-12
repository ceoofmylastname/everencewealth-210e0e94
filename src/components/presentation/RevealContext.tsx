import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface SlideConfig {
  totalReveals: number;
}

interface RevealState {
  currentSlide: number;
  revealIndex: number;
  totalReveals: number;
  totalSlides: number;
  soundEnabled: boolean;
  /** Advance one reveal; if all revealed, go to next slide */
  advance: () => void;
  /** Go back one reveal; if at 0, go to previous slide's last reveal */
  back: () => void;
  /** Jump to a specific slide (resets reveal to 0) */
  goToSlide: (index: number) => void;
  /** Toggle sound */
  toggleSound: () => void;
  /** Whether a given reveal index has been reached */
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

  const totalSlides = slideConfigs.length;
  const totalReveals = slideConfigs[currentSlide]?.totalReveals ?? 0;

  const advance = useCallback(() => {
    setRevealIndex((prev) => {
      const max = slideConfigs[currentSlide]?.totalReveals ?? 0;
      if (prev < max) {
        return prev + 1;
      }
      // All revealed — advance slide
      setCurrentSlide((s) => {
        if (s < slideConfigs.length - 1) {
          setRevealIndex(0);
          return s + 1;
        }
        return s;
      });
      return prev;
    });
  }, [currentSlide, slideConfigs]);

  const back = useCallback(() => {
    setRevealIndex((prev) => {
      if (prev > 0) {
        return prev - 1;
      }
      // At first reveal — go to previous slide's last reveal
      setCurrentSlide((s) => {
        if (s > 0) {
          const prevSlideReveals = slideConfigs[s - 1]?.totalReveals ?? 0;
          setRevealIndex(prevSlideReveals);
          return s - 1;
        } else if (onExit) {
          onExit();
        }
        return s;
      });
      return prev;
    });
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
