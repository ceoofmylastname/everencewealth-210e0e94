import React from 'react';
import { Star } from 'lucide-react';

interface Testimonial {
    text: string;
    author: string;
}

interface TestimonialSectionProps {
    testimonials: Testimonial[];
}

const TestimonialSection: React.FC<TestimonialSectionProps> = ({ testimonials }) => {
    return (
        <section className="py-16 bg-white border-b border-gray-100">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center text-center p-6 space-y-4 hover:transform hover:-translate-y-1 transition-transform duration-300"
                        >
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 fill-[#C4A053] text-[#C4A053]" />
                                ))}
                            </div>
                            <blockquote className="text-lg text-[#2C3E50] font-light italic leading-relaxed">
                                "{testimonial.text}"
                            </blockquote>
                            <cite className="text-sm font-semibold text-[#1A2332] not-italic uppercase tracking-wider">
                                {testimonial.author}
                            </cite>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialSection;
