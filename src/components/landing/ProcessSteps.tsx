import React from 'react';

interface ProcessStepsProps {
    content: {
        headline: string;
        steps: Array<{
            title: string;
            description: string;
        }>;
    };
}

const ProcessSteps: React.FC<ProcessStepsProps> = ({ content }) => {
    return (
        <section className="py-20 lg:py-32 bg-gray-50">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl lg:text-[40px] font-serif text-landing-navy text-center mb-16 lg:mb-24">
                    {content.headline}
                </h2>

                <div className="max-w-4xl mx-auto relative">
                    {/* Vertical Line (Desktop) */}
                    <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-landing-gold/30 -translate-x-1/2" />

                    <div className="space-y-12 md:space-y-24">
                        {content.steps.map((step, index) => (
                            <div key={index} className={`relative flex flex-col md:flex-row items-center gap-8 md:gap-16 ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>

                                {/* Step Number Badge */}
                                <div className="absolute left-1/2 top-0 -translate-x-1/2 w-10 h-10 rounded-full bg-white border-2 border-landing-gold flex items-center justify-center z-10 hidden md:flex">
                                    <span className="text-landing-gold font-bold font-serif">{index + 1}</span>
                                </div>

                                {/* Content Side */}
                                <div className="flex-1 text-center md:text-left">
                                    <div className={`bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-500 ${index % 2 !== 0 ? 'md:text-right' : ''}`}>
                                        <span className="md:hidden inline-block w-8 h-8 rounded-full bg-landing-gold text-white font-bold mb-4 pt-1">
                                            {index + 1}
                                        </span>
                                        <h3 className="text-xl font-bold text-landing-navy mb-3">
                                            {step.title}
                                        </h3>
                                        <p className="text-landing-text-secondary leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Empty Side for Layout Balance */}
                                <div className="flex-1 hidden md:block" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProcessSteps;
