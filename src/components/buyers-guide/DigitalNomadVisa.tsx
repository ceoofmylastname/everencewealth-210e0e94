import React from 'react';
import { Laptop, Globe, Users, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const benefits = [
  {
    icon: Laptop,
    title: 'Work Remotely from Spain',
    description: 'Legally work for non-Spanish companies while living on the Costa del Sol'
  },
  {
    icon: Globe,
    title: 'Schengen Area Access',
    description: 'Travel freely across 26 European countries without additional visas'
  },
  {
    icon: Users,
    title: 'Family Inclusion',
    description: 'Bring your spouse, children under 18, and dependent parents with you'
  },
  {
    icon: TrendingUp,
    title: 'Path to Permanent Residency',
    description: 'Renewable up to 5 years, then eligible for permanent residency'
  }
];

const requirements = [
  'Minimum monthly income of €2,520 (or €30,240 annually)',
  'Remote work contract with non-Spanish company OR 80%+ income from non-Spanish clients',
  'At least 3 years of professional experience or relevant university degree',
  'Valid private health insurance covering all medical expenses in Spain',
  'Clean criminal record certificate from countries of residence (last 5 years)',
  'Proof of employment contract, freelance agreements, or business registration'
];

export const DigitalNomadVisa: React.FC = () => {
  return (
    <section id="digital-nomad-visa" className="py-20 md:py-28 bg-background relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-prime-gold/5 to-transparent pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-16 reveal-on-scroll">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-prime-gold/10 border border-prime-gold/20 rounded-full mb-6">
            <Laptop className="w-4 h-4 text-prime-gold" />
            <span className="text-prime-gold text-sm font-medium">Remote Work Residency</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-6">
            Spain's Digital Nomad Visa
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Spain's Digital Nomad Visa allows remote workers and freelancers to live legally in Spain while working for companies outside of Spain. Perfect for those seeking Mediterranean lifestyle while maintaining their international career.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Benefits */}
          <div className="reveal-on-scroll">
            <h3 className="text-2xl font-serif font-bold text-foreground mb-8">
              Key Benefits
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="group bg-card rounded-2xl p-6 border hover:border-prime-gold/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="w-12 h-12 rounded-xl bg-prime-gold/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <benefit.icon className="w-6 h-6 text-prime-gold" />
                  </div>
                  <h4 className="font-bold text-foreground mb-2">{benefit.title}</h4>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              ))}
            </div>

            {/* Income Requirement Highlight */}
            <div className="mt-8 bg-gradient-to-r from-prime-gold/10 to-prime-gold/5 rounded-2xl p-6 border border-prime-gold/20">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-prime-gold">€2,520</div>
                <div>
                  <p className="font-medium text-foreground">Minimum Monthly Income</p>
                  <p className="text-sm text-muted-foreground">From non-Spanish employment</p>
                </div>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="reveal-on-scroll stagger-2">
            <h3 className="text-2xl font-serif font-bold text-foreground mb-8">
              Requirements
            </h3>
            <div className="bg-card rounded-3xl p-8 border">
              <ul className="space-y-4">
                {requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-muted-foreground">{requirement}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="mt-8 pt-6 border-t">
                <Link
                  to="/blog?search=digital+nomad+visa"
                  className="inline-flex items-center gap-2 text-prime-gold font-medium hover:gap-3 transition-all duration-300"
                >
                  Learn more about Digital Nomad Visa
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Timeline Card */}
            <div className="mt-6 bg-prime-900 rounded-2xl p-6">
              <h4 className="font-bold text-white mb-4">Processing Timeline</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Application review</span>
                  <span className="text-prime-gold font-medium">20 working days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Initial visa validity</span>
                  <span className="text-prime-gold font-medium">3 years</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Renewal period</span>
                  <span className="text-prime-gold font-medium">Additional 2 years</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Permanent residency eligibility</span>
                  <span className="text-prime-gold font-medium">After 5 years</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
