import React from 'react';

interface FinalCTAProps {
    content: {
        headline: string;
        subtext: string;
        button: string;
    };
    onAction: () => void;
}

const FinalCTA: React.FC<FinalCTAProps> = ({ content, onAction }) => {
    return (
        <section className="py-24 lg:py-32 bg-landing-gold relative overflow-hidden">
            {/* Decorative background pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />

            <div className="container mx-auto px-4 text-center relative z-10">
                <h2 className="text-3xl lg:text-5xl font-serif text-white font-bold mb-6">
                    {content.headline}
                </h2>
                <p className="text-white/90 text-lg lg:text-xl mb-12 max-w-2xl mx-auto font-light">
                    {content.subtext}
                </p>

                <button
                    onClick={onAction}
                    className="bg-white text-landing-navy hover:bg-landing-navy hover:text-white px-10 py-5 rounded-lg text-lg font-bold transition-all duration-300 shadow-lg hover:shadow-2xl"
                >
                    {content.button}
                </button>
            </div>
        </section>
    );
};

export default FinalCTA;
