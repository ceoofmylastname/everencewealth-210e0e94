import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { FileText, Scale, Users, AlertTriangle, Gavel, HelpCircle, CheckCircle2, Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const LOGO_URL = 'https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png';

const sections = [
  {
    id: 'acceptance',
    icon: CheckCircle2,
    number: '01',
    title: 'Acceptance of Terms',
    content: `By accessing and using the Everence Wealth website and services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our services. We reserve the right to modify these terms at any time, and your continued use constitutes acceptance of such modifications.`
  },
  {
    id: 'services',
    icon: Users,
    number: '02',
    title: 'Our Services',
    content: `Everence Wealth provides financial advisory, insurance, and wealth management services across the United States. Our services include retirement planning, insurance solutions, estate planning, tax-advantaged strategies, and investment advisory. Emma, our AI assistant, provides initial guidance but does not replace professional financial advice. All financial products are subject to availability and regulatory approval.`
  },
  {
    id: 'user-conduct',
    icon: Scale,
    number: '03',
    title: 'User Conduct',
    content: `You agree to use our services only for lawful purposes and in accordance with these Terms. You may not use our services to transmit false or misleading information, infringe upon intellectual property rights, attempt unauthorized access to our systems, harass or harm other users, or engage in any fraudulent activities. We reserve the right to terminate access for users who violate these guidelines.`
  },
  {
    id: 'liability',
    icon: AlertTriangle,
    number: '04',
    title: 'Limitation of Liability',
    content: `While we strive to provide accurate financial information, Everence Wealth is not liable for inaccuracies in third-party data, decisions made based on AI assistant responses, market fluctuations affecting investment values, delays or interruptions in service, or losses arising from financial decisions. Our maximum liability is limited to the fees paid for our services. We recommend independent verification of all financial details and consultation with licensed professionals.`
  },
  {
    id: 'intellectual',
    icon: FileText,
    number: '05',
    title: 'Intellectual Property',
    content: `All content on this website, including text, graphics, logos, images, and software, is the property of Everence Wealth or its content suppliers and is protected by United States copyright laws. You may not reproduce, distribute, modify, or create derivative works without our express written permission. The "Everence Wealth" name and logo are registered trademarks.`
  },
  {
    id: 'disputes',
    icon: Gavel,
    number: '06',
    title: 'Dispute Resolution',
    content: `Any disputes arising from these Terms or your use of our services shall be governed by the laws of the State of California, United States. We encourage resolution through direct communication first. If unresolved, disputes may be submitted to mediation or arbitration before pursuing legal action. The federal and state courts located in the State of California shall have exclusive jurisdiction.`
  },
  {
    id: 'contact',
    icon: HelpCircle,
    number: '07',
    title: 'Contact Information',
    content: `For questions about these Terms of Service, please contact us at: Everence Wealth, 101 Montgomery Street, Suite 2400, San Francisco, CA 94104. Email: info@everencewealth.com. We aim to respond to all inquiries within 2 business days.`
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

const TermsOfService: React.FC = () => {
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
            Terms of Service
          </h1>
          <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-[#C5A059] to-transparent mx-auto mb-6" />
          <p className="text-white/50 max-w-xl mx-auto text-lg leading-relaxed">
            Clear, fair, and transparent terms governing your use of our wealth management services.
          </p>
          <p className="text-white/30 text-sm mt-4">
            Effective Date: January 1, {new Date().getFullYear()}
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
                  index === 0 || index === 6 ? 'lg:col-span-2' : ''
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
              Need Clarification?
            </h3>
            <p className="text-white/40 mb-8">Our team is happy to explain any aspect of these terms in plain language.</p>
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

export default TermsOfService;
