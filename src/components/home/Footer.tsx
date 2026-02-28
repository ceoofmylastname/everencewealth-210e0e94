import React from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Mail, Phone, MapPin, Twitter, Youtube } from 'lucide-react';
import { FooterBackgroundGradient, TextHoverEffect } from '@/components/ui/hover-footer';

export const Footer: React.FC = () => {
  const lang = window.location.pathname.split('/')[1] || 'en';

  const footerLinks = [
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: `/${lang}/about` },
        { label: 'Our Philosophy', href: `/${lang}/philosophy` },
        { label: 'Our Team', href: `/${lang}/team` },
        { label: 'Careers', href: `/${lang}/careers` },
        { label: 'Become an Agent', href: '/apply' },
      ],
    },
    {
      title: 'Strategies',
      links: [
        { label: 'Indexed Universal Life', href: `/${lang}/strategies/iul` },
        { label: 'Whole Life', href: `/${lang}/strategies/whole-life` },
        { label: 'Tax-Free Retirement', href: `/${lang}/strategies/tax-free-retirement` },
        { label: 'Asset Protection', href: `/${lang}/strategies/asset-protection` },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Blog', href: `/${lang}/blog` },
        { label: 'Q&A', href: `/${lang}/qa` },
        { label: 'Financial Terms', href: `/${lang}/glossary` },
        { label: 'Tax Bucket Guide', href: `/${lang}/tax-bucket-guide` },
        { label: 'Retirement Gap Calculator', href: `/${lang}/calculator`, pulse: true },
      ],
    },
  ];

  const contactInfo = [
    { icon: <Mail size={18} className="text-prime-gold" />, text: 'info@everencewealth.com', href: 'mailto:info@everencewealth.com' },
    { icon: <Phone size={18} className="text-prime-gold" />, text: '(415) 555-0100', href: 'tel:+14155550100' },
    { icon: <MapPin size={18} className="text-prime-gold" />, text: 'San Francisco, CA' },
  ];

  const socialLinks = [
    { icon: <Linkedin size={18} />, label: 'LinkedIn', href: 'https://linkedin.com/company/everencewealth' },
    { icon: <Twitter size={18} />, label: 'Twitter', href: 'https://twitter.com/everencewealth' },
    { icon: <Youtube size={18} />, label: 'YouTube', href: 'https://youtube.com/@everencewealth' },
  ];

  return (
    <footer className="relative bg-neutral-950 text-white overflow-hidden">
      <FooterBackgroundGradient />

      <div className="relative z-10 container mx-auto px-4 md:px-6 pt-20 pb-10">
        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <img
                src="https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png"
                alt="Everence Wealth"
                className="h-14 md:h-16 w-auto object-contain brightness-0 invert drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
              />
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Everence Wealth was built on the belief that families deserve independent, client-first guidance — not sales pitches disguised as advice.
            </p>
            <div className="flex items-start gap-2 text-gray-500 text-xs">
              <MapPin size={14} className="text-prime-gold shrink-0 mt-0.5" />
              <span>
                455 Market St Ste 1940 PMB 350011<br />
                San Francisco, CA 94105
              </span>
            </div>
          </div>

          {/* Link Sections */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="font-serif font-bold text-lg mb-6 text-white">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label} className="flex items-center gap-2">
                    <Link
                      to={link.href}
                      className="text-gray-300 hover:text-prime-gold transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                    {'pulse' in link && link.pulse && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-prime-gold opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-prime-gold" />
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Get Started */}
          <div>
            <h4 className="font-serif font-bold text-lg mb-6 text-white">Get Started</h4>
            <ul className="space-y-4 mb-6">
              {contactInfo.map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  {item.icon}
                  {item.href ? (
                    <a href={item.href} className="text-gray-300 hover:text-prime-gold transition-colors text-sm">
                      {item.text}
                    </a>
                  ) : (
                    <span className="text-gray-300 text-sm">{item.text}</span>
                  )}
                </li>
              ))}
            </ul>
            <Link
              to={`/${lang}/contact`}
              className="inline-block bg-evergreen text-white px-6 py-3 hover:bg-prime-gold hover:text-prime-900 transition-all duration-300 text-sm font-semibold rounded-xl"
              style={{
                boxShadow: '0 0 18px hsla(51, 78%, 65%, 0.35), 0 0 40px hsla(51, 78%, 65%, 0.15)',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.boxShadow = '0 0 28px hsla(51, 78%, 65%, 0.6), 0 0 60px hsla(51, 78%, 65%, 0.25)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = '0 0 18px hsla(51, 78%, 65%, 0.35), 0 0 40px hsla(51, 78%, 65%, 0.15)')}
            >
              Schedule Assessment
            </Link>
          </div>
        </div>

        <div className="border-t border-white/10 my-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Social */}
          <div className="flex gap-3">
            {socialLinks.map(({ icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-prime-gold hover:bg-white/20 transition-colors"
              >
                {icon}
              </a>
            ))}
          </div>

          {/* Copyright & Legal */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-gray-500 text-xs">
              © {new Date().getFullYear()} Everence Wealth. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-gray-400 text-xs">
              <Link to="/privacy" className="hover:text-prime-gold transition-colors">Privacy Policy</Link>
              <span>|</span>
              <Link to="/terms" className="hover:text-prime-gold transition-colors">Terms</Link>
              <span>|</span>
              <Link to="/disclosures" className="hover:text-prime-gold transition-colors">Disclosures</Link>
              <span>|</span>
              <Link to="/portal/login" className="hover:text-prime-gold transition-colors">Advisor Login</Link>
            </div>
          </div>

          <div className="w-9 h-9 hidden md:block" /> {/* Spacer for alignment */}
        </div>
      </div>

      {/* Text Hover Effect */}
      <div className="relative z-10 flex items-center justify-center w-full h-32 md:h-40 -mt-4">
        <TextHoverEffect text="EVERENCE" />
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-prime-gold/30 to-transparent" />
    </footer>
  );
};
