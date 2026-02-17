import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Shield, Lock, Eye, Database, Globe, Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const LOGO_URL = 'https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png';

const sections = [
  {
    id: 'collection',
    icon: Database,
    number: '01',
    title: 'Information We Collect',
    content: `We collect information you provide directly when engaging with our wealth management services, including your name, email address, phone number, financial profile data, risk tolerance assessments, retirement planning inputs, income and asset details, and investment preferences. When you interact with our AI wealth assistant, we collect conversation data to improve advisory accuracy. We also automatically collect technical data such as your IP address, browser type, device information, and browsing patterns to enhance your experience.`
  },
  {
    id: 'usage',
    icon: Eye,
    number: '02',
    title: 'How We Use Your Data',
    content: `Your information powers personalized wealth strategies tailored to your financial goals. We use it to generate retirement projections, develop tax-efficient planning recommendations, refine our AI assistant's advisory capabilities, and deliver customized insights on indexed strategies, annuities, and cash-flow optimization. We never sell your personal or financial data to third parties. Your trust as a fiduciary client is our highest obligation.`
  },
  {
    id: 'protection',
    icon: Lock,
    number: '03',
    title: 'Data Protection',
    content: `We employ industry-standard AES-256 encryption and TLS 1.3 protocols to protect data in transit and at rest. Our infrastructure follows SOC 2 Type II compliance practices, and we align with SEC and FINRA regulatory standards for handling sensitive financial information. Access to client data is strictly limited to authorized personnel, and we conduct regular third-party security audits to ensure the integrity of our systems.`
  },
  {
    id: 'cookies',
    icon: Globe,
    number: '04',
    title: 'Cookies & Tracking',
    content: `We use essential cookies to ensure our platform functions properly, analytics cookies to understand user behavior and improve our services, and preference cookies to remember your settings and personalize your experience. You can manage cookie preferences through your browser settings at any time. We do not use cookies to track your activity across unrelated third-party websites.`
  },
  {
    id: 'rights',
    icon: Shield,
    number: '05',
    title: 'Your Rights',
    content: `Under the California Consumer Privacy Act (CCPA) and other applicable US privacy laws, you have the right to know what personal information we collect and how it is used. You may request access to, deletion of, or correction of your data. You also have the right to opt out of the sale of personal information—though we do not sell your data. To exercise any of these rights, contact us at info@everencewealth.com.`
  },
  {
    id: 'contact',
    icon: Mail,
    number: '06',
    title: 'Contact Us',
    content: `For privacy-related inquiries, reach us at info@everencewealth.com or write to: Everence Wealth, 101 Montgomery Street, Suite 2400, San Francisco, CA 94104. We are committed to responding to all privacy requests within 30 business days.`
  }
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }
  })
};

const PrivacyPolicy: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <div className="min-h-screen bg-[#0B1F18] text-white overflow-hidden relative">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] z-[100] origin-left"
        style={{ scaleX, background: 'linear-gradient(90deg, #C5A059, #E8D5A3)' }}
      />

      {/* Mesh Gradient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#1A4D3E]/40 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#1A4D3E]/30 blur-[100px]" />
        <div className="absolute top-[40%] right-[20%] w-[30vw] h-[30vw] rounded-full bg-[#C5A059]/8 blur-[80px]" />
      </div>

      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B1F18]/70 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-white/50 hover:text-[#C5A059] transition-colors group text-sm tracking-wider uppercase"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Home
          </Link>
          <Link to="/">
            <img src={LOGO_URL} alt="Everence Wealth" className="h-9 w-auto object-contain brightness-0 invert" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-[60vh] flex flex-col items-center justify-center text-center px-6 pt-28 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <p className="text-[#C5A059] text-sm tracking-[0.3em] uppercase mb-6 font-medium">
            Everence Wealth
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight uppercase mb-6">
            Your Privacy
          </h1>
          <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-[#C5A059] to-transparent mx-auto mb-6" />
          <p className="text-white/50 max-w-xl mx-auto text-lg leading-relaxed">
            Your trust is our fiduciary obligation. Transparency in how we protect your financial data.
          </p>
          <p className="text-white/30 text-sm mt-4">
            Last updated: January {new Date().getFullYear()}
          </p>
        </motion.div>
      </section>

      {/* Bento Grid */}
      <main className="relative z-10 px-6 pb-24">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={cardVariants}
                className={`group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-8 md:p-10 transition-all duration-500 hover:border-[#C5A059]/30 hover:bg-white/[0.05] hover:scale-[1.02] ${
                  index === 0 || index === 5 ? 'lg:col-span-2' : ''
                }`}
              >
                {/* Watermark Number */}
                <span className="absolute top-4 right-6 text-[7rem] md:text-[9rem] font-bold text-white/[0.03] leading-none select-none pointer-events-none group-hover:text-[#C5A059]/[0.06] transition-colors duration-500">
                  {section.number}
                </span>

                {/* Icon */}
                <div className="relative z-10 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center group-hover:bg-[#C5A059]/20 transition-colors duration-500">
                    <section.icon className="w-6 h-6 text-[#C5A059]" />
                  </div>
                </div>

                {/* Content */}
                <h2 className="relative z-10 text-xl md:text-2xl font-bold tracking-wide uppercase mb-4 text-white group-hover:text-[#C5A059] transition-colors duration-500">
                  {section.title}
                </h2>
                <p className="relative z-10 text-white/50 leading-relaxed text-[0.95rem]">
                  {section.content}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer CTA */}
      <section className="relative z-10 px-6 pb-16">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-10 md:p-14 text-center"
          >
            <h3 className="text-2xl md:text-3xl font-bold tracking-wide uppercase mb-3">
              Questions About Your Privacy?
            </h3>
            <p className="text-white/40 mb-8">We're here to help. Reach out anytime.</p>
            <a
              href="mailto:info@everencewealth.com"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#C5A059] to-[#D4B76A] text-[#0B1F18] rounded-full font-bold tracking-wider uppercase text-sm hover:shadow-[0_0_40px_rgba(197,160,89,0.3)] transition-all duration-500 hover:scale-105"
            >
              <Mail className="w-5 h-5" />
              Contact Us
            </a>
          </motion.div>
        </div>
      </section>

      {/* Bottom Bar */}
      <footer className="relative z-10 py-6 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/30">
            <p>© {new Date().getFullYear()} Everence Wealth. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-[#C5A059] transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-[#C5A059] transition-colors">Terms of Service</Link>
              <Link to="/disclosures" className="hover:text-[#C5A059] transition-colors">Disclosures</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
