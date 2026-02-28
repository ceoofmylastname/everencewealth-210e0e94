import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import '../styles/thank-you-animations.css';

const ThankYouPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-white font-sans">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-600 to-purple-600 animate-gradient-shift" />
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[url('/patterns/dots.svg')] animate-pulse-slow" />
                </div>

                <div className="relative z-10 text-center px-4 space-y-8 animate-fade-in-up">
                    {/* Success Icon */}
                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl animate-pulse" />
                            <div className="relative w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl animate-scale-in">
                                <Check className="w-16 h-16 text-primary animate-check-draw" strokeWidth={3} />
                            </div>
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-serif text-white font-light tracking-tight animate-fade-in-up delay-100">
                        Thank You!
                    </h1>

                    <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto font-light animate-fade-in-up delay-200">
                        Your journey to financial freedom starts here
                    </p>

                    {/* Next Steps Card */}
                    <div className="mt-12 max-w-2xl mx-auto animate-fade-in-up delay-300">
                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                            <h2 className="text-2xl font-serif text-white mb-6">
                                What Happens Next?
                            </h2>
                            <div className="space-y-4 text-left">
                                {[
                                    { icon: "📧", text: "Check your email for your personalized wealth strategy guide" },
                                    { icon: "📞", text: "A wealth strategist will reach out within 24 hours" },
                                    { icon: "📊", text: "Explore our retirement planning resources below" }
                                ].map((step, i) => (
                                    <div
                                        key={i}
                                        className="flex items-start gap-4 text-white/90 animate-slide-in-left"
                                        style={{ animationDelay: `${400 + i * 100}ms` }}
                                    >
                                        <span className="text-3xl">{step.icon}</span>
                                        <p className="text-lg pt-1">{step.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Proof */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl font-serif text-gray-900 mb-16">
                            Trusted by Families Nationwide
                        </h2>

                        <div className="grid md:grid-cols-3 gap-8 mb-16">
                            {[
                                { number: "500+", label: "Families Served" },
                                { number: "75+", label: "Carrier Partners" },
                                { number: "50", label: "States Licensed" }
                            ].map((stat, i) => (
                                <div
                                    key={i}
                                    className="p-8 rounded-3xl bg-gradient-to-br from-primary/10 to-blue-50 animate-fade-in-up"
                                    style={{ animationDelay: `${i * 100}ms` }}
                                >
                                    <div className="text-5xl font-serif text-primary mb-2">
                                        {stat.number}
                                    </div>
                                    <div className="text-gray-600">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 bg-gradient-to-br from-primary via-primary/90 to-blue-600 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[url('/patterns/waves.svg')] animate-wave" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center text-white">
                        <h2 className="text-4xl md:text-5xl font-serif mb-6 animate-fade-in">
                            Ready to Secure Your Financial Future?
                        </h2>
                        <p className="text-xl mb-12 opacity-90 animate-fade-in delay-100">
                            Connect with a wealth strategist and discover your path to tax-free retirement income
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in delay-200">
                            <Button
                                size="lg"
                                className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                                onClick={() => window.location.href = '/blog'}
                            >
                                Explore Resources
                                <ArrowRight className="ml-2" />
                            </Button>

                            <Button
                                size="lg"
                                variant="outline"
                                className="border-2 border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-6 rounded-full transition-all transform hover:scale-105"
                                onClick={() => window.location.href = '/contact'}
                            >
                                Schedule a Consultation
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ThankYouPage;
