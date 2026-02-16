import React, { useState, useRef, useEffect } from 'react';
import { motion, useSpring, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { TrendingUp, Shield, Umbrella, Lock, Newspaper, MessageCircleQuestion, BookMarked, Users, Info, Heart, Scale } from 'lucide-react';
import { useTranslation } from '../../i18n';

interface NavItem {
  label: string;
  id: string;
  path?: string;
  children?: { label: string; path: string; icon: React.ReactNode }[];
}

interface NavigationPillProps {
  isLightBackground: boolean;
}

export const NavigationPill: React.FC<NavigationPillProps> = ({ isLightBackground }) => {
  const { currentLanguage, t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('philosophy');
  const [expanded, setExpanded] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nav = t.header.nav;

  const navItems: NavItem[] = [
    { label: nav.philosophy, id: 'philosophy', path: `/${currentLanguage}/philosophy` },
    {
      label: nav.strategies, id: 'strategies',
      children: [
        { label: nav.iul, path: `/${currentLanguage}/strategies/iul`, icon: <TrendingUp className="w-4 h-4" /> },
        { label: nav.wholeLife, path: `/${currentLanguage}/strategies/whole-life`, icon: <Shield className="w-4 h-4" /> },
        { label: nav.taxFreeRetirement, path: `/${currentLanguage}/strategies/tax-free-retirement`, icon: <Umbrella className="w-4 h-4" /> },
        { label: nav.assetProtection, path: `/${currentLanguage}/strategies/asset-protection`, icon: <Lock className="w-4 h-4" /> },
      ],
    },
    {
      label: nav.education, id: 'education',
      children: [
        { label: nav.blog, path: `/${currentLanguage}/blog`, icon: <Newspaper className="w-4 h-4" /> },
        { label: nav.qa, path: `/${currentLanguage}/qa`, icon: <MessageCircleQuestion className="w-4 h-4" /> },
        { label: nav.glossary, path: `/${currentLanguage}/glossary`, icon: <BookMarked className="w-4 h-4" /> },
        { label: nav.comparisons || "Comparisons", path: `/${currentLanguage}/compare`, icon: <Scale className="w-4 h-4" /> },
      ],
    },
    {
      label: nav.about, id: 'about',
      children: [
        { label: nav.team, path: `/${currentLanguage}/team`, icon: <Users className="w-4 h-4" /> },
        { label: nav.whyFiduciary, path: `/${currentLanguage}/about`, icon: <Info className="w-4 h-4" /> },
        { label: nav.clientStories, path: `/${currentLanguage}/client-stories`, icon: <Heart className="w-4 h-4" /> },
      ],
    },
  ];

  // Detect active section from URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/strategies')) setActiveSection('strategies');
    else if (path.includes('/blog') || path.includes('/qa') || path.includes('/glossary') || path.includes('/compare')) setActiveSection('education');
    else if (path.includes('/team') || path.includes('/about') || path.includes('/client-stories')) setActiveSection('about');
    else if (path.includes('/philosophy')) setActiveSection('philosophy');
  }, [location.pathname]);

  const pillWidth = useSpring(140, { stiffness: 220, damping: 25, mass: 1 });

  useEffect(() => {
    if (hovering) {
      setExpanded(true);
      pillWidth.set(520);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    } else {
      hoverTimeoutRef.current = setTimeout(() => {
        setExpanded(false);
        setOpenDropdown(null);
        pillWidth.set(140);
      }, 600);
    }
    return () => { if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current); };
  }, [hovering, pillWidth]);

  const handleItemClick = (item: NavItem) => {
    if (item.path) {
      navigate(item.path);
      setHovering(false);
      setOpenDropdown(null);
    } else if (item.children) {
      setOpenDropdown(openDropdown === item.id ? null : item.id);
    }
  };

  const handleDropdownItemClick = (path: string) => {
    navigate(path);
    setHovering(false);
    setOpenDropdown(null);
  };

  const activeItem = navItems.find(item => item.id === activeSection);

  return (
    <motion.div
      ref={containerRef}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => { setHovering(false); }}
      style={{ width: pillWidth }}
      className="relative h-[52px] rounded-full cursor-pointer overflow-visible"
    >
      {/* Pill background - dark evergreen */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'linear-gradient(180deg, #1A4D3E 0%, #134032 60%, #0f2f25 100%)',
          boxShadow: '0 8px 32px rgba(26, 77, 62, 0.4), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(197, 160, 89, 0.15)',
        }}
      />

      {/* Top edge highlight - gold tint */}
      <div
        className="absolute top-0 left-[10%] right-[10%] h-[1px] rounded-full"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(197, 160, 89, 0.4), transparent)' }}
      />

      {/* Gloss reflection */}
      <div
        className="absolute top-[2px] left-[8%] right-[8%] h-[45%] rounded-full"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)' }}
      />

      {/* Bottom shadow */}
      <div
        className="absolute bottom-0 left-[5%] right-[5%] h-[1px] rounded-full"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.3), transparent)' }}
      />

      {/* Navigation content */}
      <div className="relative z-10 h-full flex items-center justify-center px-4">
        {/* Collapsed state */}
        {!expanded && (
          <AnimatePresence mode="wait">
            <motion.div
              key="collapsed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center justify-center"
            >
              {activeItem && (
                <motion.span
                  key={activeItem.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="font-nav text-[14px] font-semibold tracking-wide text-white whitespace-nowrap"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                >
                  {activeItem.label}
                </motion.span>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Expanded state */}
        {expanded && (
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-0"
          >
            {navItems.map((item, index) => {
              const isActive = item.id === activeSection;
              const hasDropdown = !!item.children;
              const isDropdownOpen = openDropdown === item.id;

              return (
                <div key={item.id} className="relative">
                  <motion.button
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    onClick={() => handleItemClick(item)}
                    className={`relative px-4 py-2.5 font-nav text-[14px] tracking-wide whitespace-nowrap transition-all duration-200 rounded-full border-none outline-none bg-transparent ${
                      isActive
                        ? 'text-prime-gold font-bold'
                        : 'text-white/70 font-medium hover:text-white'
                    }`}
                    style={{
                      textShadow: isActive
                        ? '0 1px 3px rgba(197, 160, 89, 0.4), 0 0 8px rgba(197, 160, 89, 0.15)'
                        : '0 1px 2px rgba(0,0,0,0.3)',
                      transform: isActive ? 'translateY(-1px)' : undefined,
                    }}
                  >
                    {item.label}
                  </motion.button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {hasDropdown && isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-3 min-w-[220px] rounded-xl z-[200] overflow-hidden"
                        style={{
                          background: 'linear-gradient(180deg, #1A4D3E 0%, #134032 100%)',
                          boxShadow: '0 16px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(197, 160, 89, 0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
                          backdropFilter: 'blur(20px)',
                        }}
                        onMouseEnter={() => setHovering(true)}
                        onMouseLeave={() => setHovering(false)}
                      >
                        <div className="py-2">
                          {item.children!.map((child) => (
                            <button
                              key={child.path}
                              onClick={() => handleDropdownItemClick(child.path)}
                              className="w-full flex items-center gap-3 px-4 py-3 text-white/80 hover:text-prime-gold hover:bg-white/5 transition-colors text-left font-nav text-[13px] tracking-wide"
                            >
                              <span className="text-prime-gold/70">{child.icon}</span>
                              {child.label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
