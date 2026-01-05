
import React from 'react';
import { Star } from 'lucide-react';

interface TestimonialSectionProps {
    testimonials: Array<{ text: string; author: string }>;
}

const TestimonialSection: React.FC<TestimonialSectionProps> = ({ testimonials }) => {
    return (
        <section className="py-20 bg-[#F9F9F9]">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="space-y-12">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                            {/* Gold Star Icon */}
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 rounded-full bg-[#C4A053]/10 flex items-center justify-center">
                                    <Star className="w-6 h-6 text-[#C4A053] fill-[#C4A053]" />
                                </div>
                            </div>

                            {/* Text */}
                            <div className="space-y-2">
                                <p className="text-xl md:text-2xl font-serif text-[#1A2332] italic leading-relaxed">
                                    "{testimonial.text}"
                                </p>
                                <p className="text-sm font-bold text-[#C4A053] uppercase tracking-wider">
                                    {testimonial.author}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialSection;
