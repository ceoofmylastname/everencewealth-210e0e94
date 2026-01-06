import React, { useEffect, useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { generateCostaDelSolImages } from '@/lib/generateCostaDelSolImages';
import '../styles/thank-you-animations.css';

interface CostaDelSolImage {
    url: string;
    title: string;
    description: string;
    alt: string;
}

const ThankYouPage: React.FC = () => {
    const [images, setImages] = useState<CostaDelSolImage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Generate AI images on component mount
        async function loadImages() {
            try {
                const generatedImages = await generateCostaDelSolImages();
                setImages(generatedImages);
            } catch (error) {
                console.error('Failed to load images:', error);
            } finally {
                setLoading(false);
            }
        }

        loadImages();

        // Track page view
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'thank_you_page_view', {
                event_category: 'engagement',
                event_label: 'Landing Page Conversion'
            });
        }
    }, []);

    return (
        <div className="min-h-screen bg-white font-sans">
            {/* Hero Section - Animated Gradient */}
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
                        Your journey to Costa del Sol luxury living starts here
                    </p>

                    {/* Next Steps Card */}
                    <div className="mt-12 max-w-2xl mx-auto animate-fade-in-up delay-300">
                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                            <h2 className="text-2xl font-serif text-white mb-6">
                                What Happens Next?
                            </h2>
                            <div className="space-y-4 text-left">
                                {[
                                    { icon: "📧", text: "Check your email for our exclusive Costa del Sol Property Guide" },
                                    { icon: "📞", text: "Hans will personally reach out within 24 hours" },
                                    { icon: "🏡", text: "Browse our curated selection of premium properties below" }
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

            {/* Costa del Sol Image Carousel */}
            <section className="py-24 bg-gradient-to-b from-transparent to-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16 animate-fade-in">
                        <h2 className="text-4xl md:text-6xl font-serif text-gray-900 mb-4">
                            Your Future Home Awaits
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Experience the breathtaking beauty of Costa del Sol
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-24">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary" />
                        </div>
                    ) : (
                        <div className="relative">
                            <Carousel
                                opts={{ loop: true, align: "center" }}
                                className="w-full max-w-6xl mx-auto"
                            >
                                <CarouselContent>
                                    {images.map((image, index) => (
                                        <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 pl-4">
                                            <div className="group relative overflow-hidden rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                                                <img
                                                    src={image.url}
                                                    alt={image.alt}
                                                    className="w-full h-[400px] object-cover transform group-hover:scale-110 transition-transform duration-700"
                                                />

                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                                <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                                                    <h3 className="text-2xl font-serif mb-2">{image.title}</h3>
                                                    <p className="text-white/80">{image.description}</p>
                                                </div>
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>

                                <CarouselPrevious className="hidden md:flex -left-12 w-12 h-12 rounded-full bg-white shadow-xl hover:bg-primary hover:text-white transition-all" />
                                <CarouselNext className="hidden md:flex -right-12 w-12 h-12 rounded-full bg-white shadow-xl hover:bg-primary hover:text-white transition-all" />
                            </Carousel>
                        </div>
                    )}
                </div>
            </section>

            {/* Social Proof */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl font-serif text-gray-900 mb-16">
                            Join 500+ Happy Homeowners
                        </h2>

                        <div className="grid md:grid-cols-3 gap-8 mb-16">
                            {[
                                { number: "500+", label: "Families Relocated" },
                                { number: "€2.5B+", label: "Properties Sold" },
                                { number: "15+", label: "Years Experience" }
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
                            Ready to Start Your Journey?
                        </h2>
                        <p className="text-xl mb-12 opacity-90 animate-fade-in delay-100">
                            Connect with Hans and discover your perfect Costa del Sol property
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in delay-200">
                            <Button
                                size="lg"
                                className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                                onClick={() => window.location.href = '/properties'} // Ideally use navigate() from react-router-dom
                            >
                                Browse Properties
                                <ArrowRight className="ml-2" />
                            </Button>

                            <Button
                                size="lg"
                                variant="outline"
                                className="border-2 border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-6 rounded-full transition-all transform hover:scale-105"
                                onClick={() => window.location.href = '/contact'} // Ideally use navigate() from react-router-dom
                            >
                                Contact Hans
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ThankYouPage;
