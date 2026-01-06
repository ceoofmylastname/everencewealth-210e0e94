import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Shield, Lock, Eye, Database, Globe, Mail, ArrowLeft, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const sections = [
  {
    id: 'collection',
    icon: Database,
    title: 'Information We Collect',
    content: `We collect information you provide directly, including your name, email address, phone number, and property preferences when you use our contact forms or chat with Emma, our AI assistant. We also automatically collect technical data such as your IP address, browser type, device information, and browsing patterns to improve our services.`
  },
  {
    id: 'usage',
    icon: Eye,
    title: 'How We Use Your Data',
    content: `Your information helps us match you with your perfect Spanish property. We use it to respond to inquiries, send property recommendations, improve our AI assistant's responses, and provide personalized experiences. We never sell your personal data to third parties.`
  },
  {
    id: 'protection',
    icon: Lock,
    title: 'Data Protection',
    content: `We employ industry-standard encryption (SSL/TLS) to protect data in transit. Your information is stored on secure servers with restricted access. We regularly audit our security practices and comply with GDPR requirements for EU residents.`
  },
  {
    id: 'cookies',
    icon: Globe,
    title: 'Cookies & Tracking',
    content: `We use essential cookies to ensure our website functions properly, analytics cookies to understand user behavior (Google Analytics), and marketing cookies for targeted advertising. You can manage cookie preferences through your browser settings.`
  },
  {
    id: 'rights',
    icon: Shield,
    title: 'Your Rights',
    content: `Under GDPR, you have the right to access, correct, or delete your personal data. You can request a copy of your data, object to processing, or withdraw consent at any time. Contact us at info@delsolprimehomes.com to exercise these rights.`
  },
  {
    id: 'contact',
    icon: Mail,
    title: 'Contact Us',
    content: `For privacy-related inquiries, reach us at info@delsolprimehomes.com or write to: Del Sol Prime Homes, ED SAN FERNAN, C. Alfonso XIII, 6, 1 OFICINA, 29640 Fuengirola, Málaga, Spain. We respond within 30 days.`
  }
];

const PrivacyPolicy: React.FC = () => {
  const [activeSection, setActiveSection] = useState('collection');
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map(s => document.getElementById(s.id));
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const el = sectionElements[i];
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white overflow-hidden">
      {/* Animated gradient background */}
      <motion.div
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, #1a365d 0%, transparent 50%), radial-gradient(ellipse at 80% 50%, #2d3748 0%, transparent 40%), radial-gradient(ellipse at 20% 80%, #1a202c 0%, transparent 50%)',
          y: backgroundY
        }}
      />

      {/* Floating particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#C4A053]/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, Math.random() * -500],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f1a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-400 hover:text-[#C4A053] transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Home</span>
            </Link>
            <div className="text-[#C4A053] font-serif text-xl">DEL SOL PRIME HOMES</div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#C4A053] to-[#8B7355] mb-8">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-7xl font-serif mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Your trust is our foundation. Learn how we protect and respect your personal information.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Last updated: January {new Date().getFullYear()}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-12"
          >
            <ChevronDown className="w-6 h-6 mx-auto text-[#C4A053] animate-bounce" />
          </motion.div>
        </div>
      </section>

      {/* Navigation Dots */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-4">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' })}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              activeSection === section.id
                ? 'bg-[#C4A053] scale-125'
                : 'bg-white/20 hover:bg-white/40'
            }`}
            aria-label={section.title}
          />
        ))}
      </div>

      {/* Content Sections */}
      <main className="relative z-10 pb-20">
        <div className="container mx-auto px-6">
          {sections.map((section, index) => (
            <motion.section
              key={section.id}
              id={section.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
              className="py-16 border-b border-white/5 last:border-b-0"
            >
              <div className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}>
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-[#C4A053]/20 rounded-3xl blur-2xl" />
                    <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-[#1a2332] to-[#0d1117] border border-white/10 flex items-center justify-center">
                      <section.icon className="w-16 h-16 text-[#C4A053]" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 text-center lg:text-left">
                  <h2 className="text-3xl md:text-4xl font-serif mb-6 text-white">
                    {section.title}
                  </h2>
                  <p className="text-lg text-gray-400 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              </div>
            </motion.section>
          ))}
        </div>
      </main>

      {/* Footer CTA */}
      <section className="relative z-10 py-20 bg-gradient-to-t from-[#1a2332] to-transparent">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-2xl font-serif mb-4 text-white">Questions about your privacy?</h3>
          <p className="text-gray-400 mb-8">We're here to help. Reach out anytime.</p>
          <a
            href="mailto:info@delsolprimehomes.com"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#C4A053] to-[#8B7355] text-white rounded-full font-medium hover:shadow-lg hover:shadow-[#C4A053]/20 transition-all hover:-translate-y-1"
          >
            <Mail className="w-5 h-5" />
            Contact Us
          </a>
        </div>
      </section>

      {/* Bottom Bar */}
      <footer className="relative z-10 py-6 border-t border-white/5 bg-[#0a0f1a]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Del Sol Prime Homes. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-[#C4A053] transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-[#C4A053] transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
