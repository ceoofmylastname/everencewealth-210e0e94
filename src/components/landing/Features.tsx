import React from 'react';
import { Shield, Key, Wallet, Star, Search, Coffee, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Features data with icons and descriptions
const features = [
    {
        icon: Shield,
        title: "Independent Guidance",
        description: "We work for you, not the developer. Get unbiased advice focused purely on your needs and long-term satisfaction."
    },
    {
        icon: Search,
        title: "Curated Selection",
        description: "Don't waste time on unsuitable properties. We pre-filter the market to find only the best matches for your lifestyle."
    },
    {
        icon: Wallet,
        title: "Zero Buyer Fees",
        description: "Our professional services are completely free for you. Standard industry practice means the seller pays our fees."
    },
    {
        icon: Key,
        title: "Exclusive Access",
        description: "Gain access to off-market listings and priority reservations in the most sought-after new developments."
    },
    {
        icon: Star,
        title: "Quality Assurance",
        description: "We only recommend reputable developers with proven track records and bank guarantees for your peace of mind."
    },
    {
        icon: Coffee,
        title: "Stress-Free Process",
        description: "From initial search to key handover and beyond, we handle the details so you can enjoy the excitement."
    }
];

interface FeaturesProps {
    language?: string;
}

const Features: React.FC<FeaturesProps> = ({ language = 'en' }) => {
    return (
        <section className="py-32 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
            <div className="container mx-auto px-4">

                {/* Section Header */}
                <div className="text-center mb-20 animate-fade-in-up">
                    <p className="text-primary font-semibold mb-4 tracking-wide uppercase">Why Choose Us</p>
                    <h2 className="text-4xl lg:text-5xl font-bold mb-6 font-serif">
                        <span className="text-gradient animate-gradient-x block sm:inline">
                            Your Luxury Lifestyle
                        </span>
                        <span className="block sm:inline text-secondary ml-0 sm:ml-3">Starts Here</span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        We combine local expertise with cutting-edge technology to find your perfect Costa del Sol property suited to your unique taste.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group relative p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fade-in-up"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Gradient Border on Hover */}
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl" />

                            {/* Icon with 3D Effect */}
                            <div className="relative w-16 h-16 mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl blur-xl" />
                                <div className="relative bg-gradient-to-br from-primary to-primary-dark via-orange-400 to-primary rounded-2xl p-4 shadow-lg flex items-center justify-center">
                                    <feature.icon className="text-white w-8 h-8" />
                                </div>
                            </div>

                            {/* Content */}
                            <h3 className="text-2xl font-bold mb-4 text-secondary group-hover:text-primary transition-colors duration-300 font-serif">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                {feature.description}
                            </p>

                            {/* Learn More Link */}
                            <a href="#" className="inline-flex items-center text-primary font-semibold group/link">
                                Learn more
                                <ArrowRight className="ml-2 group-hover/link:translate-x-2 transition-transform" size={16} />
                            </a>

                            {/* Decorative Corner */}
                            <div className="absolute top-4 right-4 w-20 h-20 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
