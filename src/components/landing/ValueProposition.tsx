import React from 'react';
import { Shield, Star, Award } from 'lucide-react';

interface ValuePropositionProps {
    content: {
        headline: string;
        pillars: Array<{
            title: string;
            description: string;
        }>;
    };
}

const ValueProposition: React.FC<ValuePropositionProps> = ({ content }) => {
    const icons = [Award, Star, Shield];

    return (
        <section className="py-20 lg:py-32 bg-white">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl lg:text-[40px] font-serif text-landing-navy text-center mb-16 lg:mb-24">
                    {content.headline}
                </h2>

                <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
                    {content.pillars.map((pillar, index) => {
                        const Icon = icons[index] || Star;
                        return (
                            <div key={index} className="flex flex-col items-center text-center group">
                                <div className="mb-6 p-4 rounded-full bg-landing-gold/10 text-landing-gold group-hover:bg-landing-gold group-hover:text-white transition-colors duration-500">
                                    <Icon size={32} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-xl font-bold text-landing-navy mb-4">
                                    {pillar.title}
                                </h3>
                                <p className="text-landing-text-secondary leading-relaxed max-w-xs">
                                    {pillar.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default ValueProposition;
