import React from 'react';
import { Quote } from 'lucide-react';

interface TestimonialsGridProps {
    content: {
        headline: string;
        reviews: Array<{
            quote: string;
            author: string;
            country: string;
        }>;
    };
}

const TestimonialsGrid: React.FC<TestimonialsGridProps> = ({ content }) => {
    return (
        <section className="py-20 lg:py-32 bg-white">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl lg:text-[40px] font-serif text-landing-navy text-center mb-16 lg:mb-24">
                    {content.headline}
                </h2>

                <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                    {content.reviews.map((review, index) => (
                        <div key={index} className="bg-gray-50 p-8 lg:p-10 rounded-xl relative group hover:bg-white hover:shadow-xl transition-all duration-500">
                            <Quote className="text-landing-gold/20 mb-6 group-hover:text-landing-gold transition-colors" size={40} />

                            <p className="text-lg text-landing-text-primary font-serif italic mb-8 leading-relaxed">
                                "{review.quote}"
                            </p>

                            <div className="border-t border-landing-divider pt-6">
                                <p className="font-bold text-landing-navy tracking-wide text-sm uppercase">
                                    {review.author}
                                </p>
                                <p className="text-landing-text-secondary text-sm">
                                    {review.country}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsGrid;
