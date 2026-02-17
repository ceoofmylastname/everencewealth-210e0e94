import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Scale, Users, AlertTriangle, Gavel, HelpCircle, ArrowLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const sections = [
  {
    id: 'acceptance',
    icon: CheckCircle2,
    title: 'Acceptance of Terms',
    summary: 'By using our services, you agree to these terms.',
    content: `By accessing and using the Everence Wealth website and services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our services. We reserve the right to modify these terms at any time, and your continued use constitutes acceptance of such modifications.`
  },
  {
    id: 'services',
    icon: Users,
    title: 'Our Services',
    summary: 'What we offer and how we operate.',
    content: `Everence Wealth provides financial advisory, insurance, and wealth management services across the United States. Our services include retirement planning, insurance solutions, estate planning, tax-advantaged strategies, and investment advisory. Emma, our AI assistant, provides initial guidance but does not replace professional financial advice. All financial products are subject to availability and regulatory approval.`
  },
  {
    id: 'user-conduct',
    icon: Scale,
    title: 'User Conduct',
    summary: 'Expected behavior when using our platform.',
    content: `You agree to use our services only for lawful purposes and in accordance with these Terms. You may not use our services to transmit false or misleading information, infringe upon intellectual property rights, attempt unauthorized access to our systems, harass or harm other users, or engage in any fraudulent activities. We reserve the right to terminate access for users who violate these guidelines.`
  },
  {
    id: 'liability',
    icon: AlertTriangle,
    title: 'Limitation of Liability',
    summary: 'Understanding the scope of our responsibility.',
    content: `While we strive to provide accurate financial information, Everence Wealth is not liable for inaccuracies in third-party data, decisions made based on AI assistant responses, market fluctuations affecting investment values, delays or interruptions in service, or losses arising from financial decisions. Our maximum liability is limited to the fees paid for our services. We recommend independent verification of all financial details and consultation with licensed professionals.`
  },
  {
    id: 'intellectual',
    icon: FileText,
    title: 'Intellectual Property',
    summary: 'Ownership and usage rights of our content.',
    content: `All content on this website, including text, graphics, logos, images, and software, is the property of Everence Wealth or its content suppliers and is protected by United States copyright laws. You may not reproduce, distribute, modify, or create derivative works without our express written permission. The "Everence Wealth" name and logo are registered trademarks.`
  },
  {
    id: 'disputes',
    icon: Gavel,
    title: 'Dispute Resolution',
    summary: 'How we handle disagreements.',
    content: `Any disputes arising from these Terms or your use of our services shall be governed by the laws of the State of California, United States. We encourage resolution through direct communication first. If unresolved, disputes may be submitted to mediation or arbitration before pursuing legal action. The federal and state courts located in the State of California shall have exclusive jurisdiction.`
  },
  {
    id: 'contact',
    icon: HelpCircle,
    title: 'Contact Information',
    summary: 'How to reach us for questions.',
    content: `For questions about these Terms of Service, please contact us at: Everence Wealth, United States. Email: info@everencewealth.com. We aim to respond to all inquiries within 2 business days.`
  }
];

const TermsOfService: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>('acceptance');

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white overflow-hidden">
      {/* Geometric background pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#C4A053]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl" />
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
            <div className="text-[#C4A053] font-serif text-xl">EVERENCE WEALTH</div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
              <Gavel className="w-4 h-4 text-[#C4A053]" />
              <span className="text-sm text-gray-400">Legal Agreement</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif mb-6">
              <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Terms of
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#C4A053] to-[#8B7355] bg-clip-text text-transparent">
                Service
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl">
              Clear, fair, and transparent terms that govern your use of our services.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Effective Date: January 1, {new Date().getFullYear()}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Accordion Sections */}
      <main className="relative z-10 pb-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-4">
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <div
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    expandedSection === section.id
                      ? 'bg-white/5 border-[#C4A053]/30'
                      : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                  }`}
                >
                  <button
                    onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                    className="w-full px-6 py-5 flex items-center gap-4 text-left"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                      expandedSection === section.id
                        ? 'bg-[#C4A053]/20'
                        : 'bg-white/5'
                    }`}>
                      <section.icon className={`w-6 h-6 transition-colors ${
                        expandedSection === section.id ? 'text-[#C4A053]' : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-white">{section.title}</h3>
                      <p className="text-sm text-gray-500">{section.summary}</p>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                      expandedSection === section.id ? 'rotate-90' : ''
                    }`} />
                  </button>

                  <AnimatePresence>
                    {expandedSection === section.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-6 pb-6 pt-2">
                          <div className="pl-16">
                            <p className="text-gray-400 leading-relaxed">
                              {section.content}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Summary Cards */}
      <section className="relative z-10 py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-serif mb-8 text-center text-white">Key Points to Remember</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Your Data', desc: 'Protected with your explicit consent' },
              { title: 'Our Commitment', desc: 'Transparent, professional, and ethical service' },
              { title: 'Your Rights', desc: 'Access, modify, or delete your information anytime' }
            ].map((point, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 text-center"
              >
                <div className="w-10 h-10 rounded-full bg-[#C4A053]/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-5 h-5 text-[#C4A053]" />
                </div>
                <h3 className="font-medium text-white mb-2">{point.title}</h3>
                <p className="text-sm text-gray-500">{point.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative z-10 py-16 px-6 bg-gradient-to-t from-[#1a2332] to-transparent">
        <div className="container mx-auto max-w-2xl text-center">
          <h3 className="text-2xl font-serif mb-4 text-white">Need Clarification?</h3>
          <p className="text-gray-400 mb-8">
            Our team is happy to explain any aspect of these terms in plain language.
          </p>
          <a
            href="mailto:info@everencewealth.com"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#C4A053] to-[#8B7355] text-white rounded-full font-medium hover:shadow-lg hover:shadow-[#C4A053]/20 transition-all hover:-translate-y-1"
          >
            <HelpCircle className="w-5 h-5" />
            Ask a Question
          </a>
        </div>
      </section>

      {/* Bottom Bar */}
      <footer className="relative z-10 py-6 border-t border-white/5 bg-[#0a0f1a]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Everence Wealth. All rights reserved.</p>
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

export default TermsOfService;
