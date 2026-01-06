import React from 'react';
import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

interface TestimonialSectionProps {
    testimonials: Array<{ text: string; author: string }>;
}

const TestimonialSection: React.FC<TestimonialSectionProps> = ({ testimonials }) => {
    const { t } = useTranslation('landing');

    const ReviewCard: React.FC<{ review: any }> = ({ review }) => (
        <div className="bg-white rounded-2xl p-8 shadow-lg h-full flex flex-col justify-between">
            <div>
                <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-primary text-xl">★</span>
                    ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{review.text}"</p>
            </div>
            <div className="border-t pt-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Star className="w-5 h-5 text-primary fill-primary" />
                    </div>
                    <p className="font-semibold text-gray-900">{review.author}</p>
                </div>
            </div>
        </div>
    );

    return (
        <section className="py-16 md:py-24 bg-gray-50">
            <div className="container mx-auto px-4">
                {/* Section Heading */}
                <h2 className="text-3xl md:text-4xl font-serif text-center text-gray-900 mb-12">
                    {t('reviews.heading') || "A calm, pressure-free experience"}
                </h2>

                {/* Mobile: Carousel */}
                <div className="md:hidden">
                    <Carousel opts={{ loop: true }}>
                        <CarouselContent>
                            {testimonials.map((review, index) => (
                                <CarouselItem key={index}>
                                    <ReviewCard review={review} />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <div className="flex justify-center gap-2 mt-6 relative">
                            <CarouselPrevious className="static translate-y-0" />
                            <CarouselNext className="static translate-y-0" />
                        </div>
                    </Carousel>
                </div>

                {/* Desktop: Grid */}
                <div className="hidden md:grid md:grid-cols-3 gap-8">
                    {testimonials.map((review, index) => (
                        <ReviewCard key={index} review={review} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialSection;
