import React from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Mail, Phone, MapPin, Calendar, LogIn, Twitter, Youtube } from 'lucide-react';

export const Footer: React.FC = () => {
  const lang = window.location.pathname.split('/')[1] || 'en';

  return (
    <footer className="bg-prime-900 text-white pt-20 pb-10 border-t-4 border-prime-gold">
      <div className="container mx-auto px-4 md:px-6">

        {/* Logo & Tagline */}
        <div className="mb-16">
          <img
            src="https://storage.googleapis.com/msgsndr/9m2UBN29nuaCWceOgW2Z/media/6926151522d3b65c0becbaf4.png"
            alt="Everence Wealth"
            className="h-20 md:h-28 w-auto object-contain mb-4"
          />
          <p className="text-slate-400 text-sm">Independent fiduciary serving families since 1998.</p>
        </div>

        {/* Four-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Company */}
          <div>
            <h4 className="font-serif font-bold text-lg mb-6 text-white">Company</h4>
            <ul className="space-y-3 text-slate-300 text-sm">
              <li><Link to={`/${lang}/about`} className="hover:text-prime-gold transition-colors">About Us</Link></li>
              <li><Link to={`/${lang}/philosophy`} className="hover:text-prime-gold transition-colors">Our Philosophy</Link></li>
              <li><Link to={`/${lang}/team`} className="hover:text-prime-gold transition-colors">Our Team</Link></li>
              <li><Link to={`/${lang}/careers`} className="hover:text-prime-gold transition-colors">Careers</Link></li>
            </ul>
          </div>

          {/* Strategies */}
          <div>
            <h4 className="font-serif font-bold text-lg mb-6 text-white">Strategies</h4>
            <ul className="space-y-3 text-slate-300 text-sm">
              <li><Link to={`/${lang}/strategies/iul`} className="hover:text-prime-gold transition-colors">Indexed Universal Life</Link></li>
              <li><Link to={`/${lang}/strategies/whole-life`} className="hover:text-prime-gold transition-colors">Whole Life</Link></li>
              <li><Link to={`/${lang}/strategies/tax-free-retirement`} className="hover:text-prime-gold transition-colors">Tax-Free Retirement</Link></li>
              <li><Link to={`/${lang}/strategies/asset-protection`} className="hover:text-prime-gold transition-colors">Asset Protection</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-serif font-bold text-lg mb-6 text-white">Resources</h4>
            <ul className="space-y-3 text-slate-300 text-sm">
              <li><Link to={`/${lang}/blog`} className="hover:text-prime-gold transition-colors">Blog</Link></li>
              <li><Link to={`/${lang}/qa`} className="hover:text-prime-gold transition-colors">Q&A</Link></li>
              <li><Link to={`/${lang}/glossary`} className="hover:text-prime-gold transition-colors">Financial Terms</Link></li>
              <li><Link to={`/${lang}/tax-bucket-guide`} className="hover:text-prime-gold transition-colors">Tax Bucket Guide</Link></li>
              <li><Link to={`/${lang}/calculator`} className="hover:text-prime-gold transition-colors">Retirement Gap Calculator</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-serif font-bold text-lg mb-6 text-white">Connect</h4>
            <ul className="space-y-4 text-slate-300 text-sm">
              <li><Link to={`/${lang}/contact`} className="flex items-center gap-3 hover:text-prime-gold transition-colors"><Calendar size={16} className="text-prime-gold shrink-0" />Schedule Assessment</Link></li>
              <li><Link to={`/${lang}/contact`} className="flex items-center gap-3 hover:text-prime-gold transition-colors"><Mail size={16} className="text-prime-gold shrink-0" />Contact Us</Link></li>
              <li><Link to="/portal/login" className="flex items-center gap-3 hover:text-prime-gold transition-colors"><LogIn size={16} className="text-prime-gold shrink-0" />Client Portal Login</Link></li>
              <li className="flex items-center gap-3"><Phone size={16} className="text-prime-gold shrink-0" />(415) 555-0100</li>
              <li className="flex items-center gap-3"><Mail size={16} className="text-prime-gold shrink-0" />info@everencewealth.com</li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-500 text-xs">© 2025 Everence Wealth. Independent fiduciary serving families since 1998.</p>

            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-4 text-slate-400 text-xs">
                <Link to="/privacy" className="hover:text-prime-gold transition-colors">Privacy Policy</Link>
                <span>|</span>
                <Link to="/terms" className="hover:text-prime-gold transition-colors">Terms</Link>
                <span>|</span>
                <Link to="/disclosures" className="hover:text-prime-gold transition-colors">Disclosures</Link>
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <MapPin size={12} />
                <span>455 Market St Ste 1940, San Francisco, CA 94105</span>
              </div>
            </div>

            <div className="flex gap-3">
              <a href="https://linkedin.com/company/everencewealth" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-prime-gold hover:text-prime-900 transition-colors"><Linkedin size={16} /></a>
              <a href="https://twitter.com/everencewealth" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-prime-gold hover:text-prime-900 transition-colors"><Twitter size={16} /></a>
              <a href="https://youtube.com/@everencewealth" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-prime-gold hover:text-prime-900 transition-colors"><Youtube size={16} /></a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};
