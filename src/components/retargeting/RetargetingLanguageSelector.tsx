import { useNavigate, useLocation } from "react-router-dom";
import { Globe, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { getRetargetingUrl, retargetingRoutes } from "@/lib/retargetingRoutes";

interface RetargetingLanguageSelectorProps {
  currentLang: string;
  scrolled?: boolean;
}

const languageFlags: Record<string, string> = {
  en: "🇺🇸",
  es: "🇪🇸",
};

const languageNames: Record<string, string> = {
  en: "English",
  es: "Español",
};

export const RetargetingLanguageSelector = ({
  currentLang,
  scrolled = false,
}: RetargetingLanguageSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageChange = (newLang: string) => {
    setIsOpen(false);
    const newUrl = getRetargetingUrl(newLang);
    navigate(newUrl);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
          scrolled
            ? "text-foreground/70 hover:text-foreground hover:bg-gray-100"
            : "text-white/80 hover:text-white hover:bg-white/10"
        }`}
        aria-label="Select language"
      >
        <span className="text-base">{languageFlags[currentLang]}</span>
        <span className="uppercase">{currentLang}</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-44 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
          >
            <div className="py-1.5 max-h-[320px] overflow-y-auto">
              {retargetingRoutes.map((route) => (
                <button
                  key={route.lang}
                  onClick={() => handleLanguageChange(route.lang)}
                  className={`flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    currentLang === route.lang
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground hover:bg-gray-50"
                  }`}
                >
                  <span>{languageFlags[route.lang]}</span>
                  {languageNames[route.lang] || route.lang.toUpperCase()}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
