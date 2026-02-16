import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { Menu as MenuIcon, X, ChevronDown, Users, Shield, TrendingUp, Umbrella, Lock, Newspaper, MessageCircleQuestion, BookMarked, Info, Heart, LogIn } from 'lucide-react';
import { Button } from './ui/Button';
import { useTranslation } from '../../i18n';
import { NavigationPill } from '../ui/3d-adaptive-navigation-bar';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { ContentLanguageSwitcher } from '../ContentLanguageSwitcher';

interface ContentContext {
  type: 'blog' | 'qa' | 'location' | 'comparison';
  hreflangGroupId: string | null;
  currentSlug: string;
  currentLanguage: string;
}

interface HeaderProps {
  variant?: 'transparent' | 'solid';
  contentContext?: ContentContext;
}

export const Header: React.FC<HeaderProps> = ({ variant = 'transparent', contentContext }) => {
  const { t, currentLanguage } = useTranslation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  
  const isLightBackground = variant === 'solid' || isScrolled;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null);
  const nav = t.header.nav;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const closeMobile = () => setIsMobileMenuOpen(false);

  const mobileMenuContent = (
    <div 
      className={`fixed inset-0 bg-background z-[90] flex flex-col pt-24 px-6 gap-2 lg:hidden overflow-y-auto transition-all duration-300 ${
        isMobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'
      }`}
    >
      {/* Philosophy - direct link */}
      <Link to={`/${currentLanguage}/philosophy`} onClick={closeMobile} className="flex items-center py-4 text-lg font-semibold text-foreground border-b border-border">
        {nav.philosophy}
      </Link>

      {/* Strategies */}
      <MobileMenuSection title={nav.strategies} isOpen={mobileSubmenu === 'strategies'} onToggle={() => setMobileSubmenu(mobileSubmenu === 'strategies' ? null : 'strategies')}>
        <MobileLink to={`/${currentLanguage}/strategies/iul`} onClick={closeMobile} icon={<TrendingUp className="w-5 h-5" />}>{nav.iul}</MobileLink>
        <MobileLink to={`/${currentLanguage}/strategies/whole-life`} onClick={closeMobile} icon={<Shield className="w-5 h-5" />}>{nav.wholeLife}</MobileLink>
        <MobileLink to={`/${currentLanguage}/strategies/tax-free-retirement`} onClick={closeMobile} icon={<Umbrella className="w-5 h-5" />}>{nav.taxFreeRetirement}</MobileLink>
        <MobileLink to={`/${currentLanguage}/strategies/asset-protection`} onClick={closeMobile} icon={<Lock className="w-5 h-5" />}>{nav.assetProtection}</MobileLink>
      </MobileMenuSection>

      {/* Education */}
      <MobileMenuSection title={nav.education} isOpen={mobileSubmenu === 'education'} onToggle={() => setMobileSubmenu(mobileSubmenu === 'education' ? null : 'education')}>
        <MobileLink to={`/${currentLanguage}/blog`} onClick={closeMobile} icon={<Newspaper className="w-5 h-5" />}>{nav.blog}</MobileLink>
        <MobileLink to={`/${currentLanguage}/qa`} onClick={closeMobile} icon={<MessageCircleQuestion className="w-5 h-5" />}>{nav.qa}</MobileLink>
        <MobileLink to={`/${currentLanguage}/glossary`} onClick={closeMobile} icon={<BookMarked className="w-5 h-5" />}>{nav.glossary}</MobileLink>
      </MobileMenuSection>

      {/* About */}
      <MobileMenuSection title={nav.about} isOpen={mobileSubmenu === 'about'} onToggle={() => setMobileSubmenu(mobileSubmenu === 'about' ? null : 'about')}>
        <MobileLink to={`/${currentLanguage}/team`} onClick={closeMobile} icon={<Users className="w-5 h-5" />}>{nav.team}</MobileLink>
        <MobileLink to={`/${currentLanguage}/about`} onClick={closeMobile} icon={<Info className="w-5 h-5" />}>{nav.whyFiduciary}</MobileLink>
        <MobileLink to={`/${currentLanguage}/client-stories`} onClick={closeMobile} icon={<Heart className="w-5 h-5" />}>{nav.clientStories}</MobileLink>
      </MobileMenuSection>
      
      {/* Language Selector */}
      <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-border">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t.header?.language || "Language"}</span>
        {contentContext ? (
          <ContentLanguageSwitcher currentLanguage={contentContext.currentLanguage} hreflangGroupId={contentContext.hreflangGroupId} contentType={contentContext.type} currentSlug={contentContext.currentSlug} variant="default" />
        ) : (
          <LanguageSwitcher variant="default" className="w-full" />
        )}
      </div>

      <div className="flex flex-col gap-3 mt-auto mb-8">
        <Link to="/portal/login" onClick={closeMobile} className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <LogIn className="w-4 h-4" /> {nav.portalLogin}
        </Link>
      </div>
    </div>
  );

  return (
    <>
    <header 
      className={`fixed top-0 w-full z-[100] transition-all duration-500 ${
        isLightBackground 
          ? 'glass-nav py-3 border-b border-border/50 shadow-sm' 
          : 'bg-transparent py-4 border-transparent'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 grid grid-cols-2 lg:grid-cols-3 items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 z-50 justify-self-start">
          <img 
            src="https://storage.googleapis.com/msgsndr/9m2UBN29nuaCWceOgW2Z/media/6926151522d3b65c0becbaf4.png" 
            alt="Everence Wealth" 
            width={160} height={64} loading="eager" decoding="async"
            className={`h-14 md:h-16 w-auto min-w-[120px] object-contain transition-all duration-500 ${
              isLightBackground ? 'brightness-0 sepia saturate-[10] hue-rotate-[15deg]' : ''
            }`}
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center justify-center">
          <NavigationPill isLightBackground={isLightBackground} />
        </div>

        {/* Right side actions */}
        <div className="hidden lg:flex items-center gap-4 justify-self-end">
          {contentContext ? (
            <ContentLanguageSwitcher currentLanguage={contentContext.currentLanguage} hreflangGroupId={contentContext.hreflangGroupId} contentType={contentContext.type} currentSlug={contentContext.currentSlug} variant="default" />
          ) : (
            <LanguageSwitcher variant="compact" className={isLightBackground ? '' : 'border-white/30 text-white [&_button]:text-white'} />
          )}

          <Link
            to="/portal/login"
            className={`text-sm font-medium hover:opacity-80 transition-opacity flex items-center gap-1.5 ${isLightBackground ? 'text-foreground' : 'text-white'}`}
          >
            <LogIn className="w-4 h-4" /> {nav.portalLogin}
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`lg:hidden z-[110] justify-self-end transition-colors duration-300 ${isLightBackground || isMobileMenuOpen ? 'text-foreground' : 'text-white'}`}
        >
          {isMobileMenuOpen ? <X size={28} /> : <MenuIcon size={28} />}
        </button>
      </div>
    </header>
    
    {typeof document !== 'undefined' && createPortal(mobileMenuContent, document.body)}
    </>
  );
};

// Mobile Menu Section Component
const MobileMenuSection = ({ title, children, isOpen, onToggle }: { title: string; children: React.ReactNode; isOpen: boolean; onToggle: () => void; }) => (
  <div className="border-b border-border">
    <button onClick={onToggle} className="flex items-center justify-between w-full py-4 text-lg font-semibold text-foreground">
      {title}
      <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
      <div className="flex flex-col gap-1 pb-4 pl-2">{children}</div>
    </div>
  </div>
);

// Mobile Link Component
const MobileLink = ({ children, to, onClick, icon }: { children: React.ReactNode; to: string; onClick: () => void; icon: React.ReactNode; }) => (
  <Link to={to} onClick={onClick} className="flex items-center gap-3 py-3 px-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors">
    {icon}
    {children}
  </Link>
);
