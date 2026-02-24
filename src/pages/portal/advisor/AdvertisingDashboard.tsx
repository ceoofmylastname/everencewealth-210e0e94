import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
    Play, Video, FileText, Mic, Calendar, Target,
    Zap, PenTool, LayoutTemplate, Briefcase, BarChart, CheckCircle2,
    ChevronRight, Sparkles, ArrowRight, MousePointerClick, TrendingUp
} from 'lucide-react';
import {
    SiFacebook, SiInstagram, SiLinkedin, SiTiktok,
    SiYoutube, SiWhatsapp, SiSpotify, SiPinterest, SiX,
    SiSnapchat, SiGoogle
} from 'react-icons/si';
import { FaMicrosoft } from 'react-icons/fa';
import { BsEnvelopePaper } from 'react-icons/bs';
import aiCreativeStudioImg from '@/assets/advertising/ai-creative-studio.jpg';
import multiChannelImg from '@/assets/advertising/multi-channel-dashboard.jpg';
import aiOptimizationImg from '@/assets/advertising/ai-optimization.jpg';
import aiStudioVideo from '@/assets/advertising/ai-studio-showcase.mp4';

// Floating Shape Component
const FloatingShape = ({ x, y, rotate, color }: { x: string, y: string, rotate: number, color: string }) => (
    <motion.div
        className="absolute w-5 h-5 rounded-full"
        style={{
            left: x,
            top: y,
            backgroundColor: color,
        }}
        animate={{
            rotate: [rotate, rotate + 360],
            y: [y, `calc(${y} + 10px)`, y],
            x: [x, `calc(${x} + 10px)` ,x]
        }}
        transition={{
            repeat: Infinity,
            duration: 6,
            ease: "easeInOut",
        }}
    />
);

const AdvertisingDashboard = () => {
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

    const [activeVideoHover, setActiveVideoHover] = useState(false);

    return (
        <div className="min-h-screen bg-[#fafafa] font-sans text-gray-900 overflow-x-hidden selection:bg-[#C8A96E]/30 selection:text-[#1A4D3E]">

            {/* 1. Hero Section - Ultra Modern Glassmorphism */}
            <section className="relative pt-28 pb-32 overflow-hidden bg-white isolat min-h-[90vh] flex flex-col justify-center border-b border-gray-100">
                {/* Hero Background - Animated Shapes */}
                <div className="absolute inset-0">
                    <FloatingShape x="20%" y="20%" rotate={45} color="#E2D8C0" />
                    <FloatingShape x="80%" y="30%" rotate={90} color="#C8A96E" />
                    <FloatingShape x="30%" y="70%" rotate={135} color="#A38547" />
                    <FloatingShape x="60%" y="80%" rotate={180} color="#806219" />
                </div>

                <div className="container mx-auto px-6 relative z-20">
                    <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
                        {/* Badge */}
                        <motion.span
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="inline-block px-4 py-2 text-sm font-medium bg-[#E2D8C0] text-[#1A4D3E] rounded-full mb-8"
                        >
                            Unlock the Power of AI-Driven Advertising
                        </motion.span>

                        {/* Hero Title */}
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#1A4D3E] mb-6"
                        >
                            Revolutionize Your Marketing with AI
                        </motion.h1>

                        {/* Hero Description */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-lg text-gray-600 mb-12"
                        >
                            Harness the potential of artificial intelligence to create, manage, and optimize your advertising campaigns for maximum impact and ROI.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24 w-full sm:w-auto"
                        >
                            <a
                                href="https://launch.yenomai.com/?ref_id=IPxLDDZso3Z1XsmXbpGK2kkf2gn2"
                                target="_blank"
                                rel="noreferrer"
                                className="group relative w-full sm:w-auto px-10 py-5 bg-[#1A4D3E] text-white font-medium hover:bg-[#113328] transition-all rounded-sm shadow-[0_20px_40px_rgba(26,77,62,0.2)] flex items-center justify-center gap-3 overflow-hidden text-lg"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                                Launch Your Ad Account
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </a>
                            <button
                                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                                className="w-full sm:w-auto px-10 py-5 bg-white text-[#1A4D3E] border border-gray-200 font-medium hover:border-[#C8A96E] hover:bg-gray-50 transition-all rounded-sm text-lg shadow-sm cursor-pointer"
                            >
                                See How It Works
                            </button>
                        </motion.div>

                        {/* Stat Counters */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="flex flex-wrap justify-center gap-8"
                        >
                            <div className="flex flex-col items-center">
                                <span className="text-4xl font-bold text-[#1A4D3E]">150%</span>
                                <span className="text-sm text-gray-500">Avg. ROI Increase</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-4xl font-bold text-[#1A4D3E]">70%</span>
                                <span className="text-sm text-gray-500">Time Saved on Campaign Management</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-4xl font-bold text-[#1A4D3E]">3X</span>
                                <span className="text-sm text-gray-500">More Effective Ad Creatives</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 2. Ticker Strip - Infinite Rotating Carousel */}
            <div className="bg-muted/50 py-5 overflow-hidden border-y border-border relative">
                <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-muted/50 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-muted/50 to-transparent z-10 pointer-events-none" />
                <motion.div
                    className="flex items-center gap-12 whitespace-nowrap"
                    animate={{ x: ['0%', '-50%'] }}
                    transition={{ x: { duration: 25, repeat: Infinity, ease: 'linear' } }}
                >
                    {[0, 1].map((setIdx) => (
                        <React.Fragment key={setIdx}>
                            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white shadow-sm border border-border shrink-0">
                                <SiFacebook size={24} className="text-[#1877F2]" />
                                <span className="text-sm font-semibold text-foreground">Facebook</span>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white shadow-sm border border-border shrink-0">
                                <SiInstagram size={24} className="text-[#E4405F]" />
                                <span className="text-sm font-semibold text-foreground">Instagram</span>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white shadow-sm border border-border shrink-0">
                                <SiLinkedin size={24} className="text-[#0077B5]" />
                                <span className="text-sm font-semibold text-foreground">LinkedIn</span>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white shadow-sm border border-border shrink-0">
                                <SiTiktok size={24} />
                                <span className="text-sm font-semibold text-foreground">TikTok</span>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white shadow-sm border border-border shrink-0">
                                <SiYoutube size={24} className="text-[#FF0000]" />
                                <span className="text-sm font-semibold text-foreground">YouTube</span>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white shadow-sm border border-border shrink-0">
                                <SiWhatsapp size={24} className="text-[#25D366]" />
                                <span className="text-sm font-semibold text-foreground">WhatsApp</span>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white shadow-sm border border-border shrink-0">
                                <SiSpotify size={24} className="text-[#1DB954]" />
                                <span className="text-sm font-semibold text-foreground">Spotify</span>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white shadow-sm border border-border shrink-0">
                                <SiPinterest size={24} className="text-[#E60023]" />
                                <span className="text-sm font-semibold text-foreground">Pinterest</span>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white shadow-sm border border-border shrink-0">
                                <SiX size={24} />
                                <span className="text-sm font-semibold text-foreground">X / Twitter</span>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white shadow-sm border border-border shrink-0">
                                <SiSnapchat size={24} className="text-[#FFFC00]" />
                                <span className="text-sm font-semibold text-foreground">Snapchat</span>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white shadow-sm border border-border shrink-0">
                                <SiGoogle size={24} className="text-[#4285F4]" />
                                <span className="text-sm font-semibold text-foreground">Google</span>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white shadow-sm border border-border shrink-0">
                                <FaMicrosoft size={24} className="text-[#F25022]" />
                                <span className="text-sm font-semibold text-foreground">Bing</span>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white shadow-sm border border-border shrink-0">
                                <BsEnvelopePaper size={24} />
                                <span className="text-sm font-semibold text-foreground">Postcards</span>
                            </div>
                        </React.Fragment>
                    ))}
                </motion.div>
            </div>

            {/* Platform Grid */}
            <section className="py-20 bg-white border-b border-gray-100">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-[#1A4D3E] text-center mb-12">
                        Reach Your Audience on Every Platform
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
                        {/* Platform Cards - Example */}
                        <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <SiFacebook size={40} className="text-[#1877F2] mb-2" />
                            <span className="text-sm text-gray-500">Facebook</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <SiInstagram size={40} className="text-[#E4405F] mb-2" />
                            <span className="text-sm text-gray-500">Instagram</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <SiLinkedin size={40} className="text-[#0077B5] mb-2" />
                            <span className="text-sm text-gray-500">LinkedIn</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <SiTiktok size={40} className="text-[#000000] mb-2" />
                            <span className="text-sm text-gray-500">TikTok</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <SiYoutube size={40} className="text-[#FF0000] mb-2" />
                            <span className="text-sm text-gray-500">YouTube</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <SiWhatsapp size={40} className="text-[#25D366] mb-2" />
                            <span className="text-sm text-gray-500">WhatsApp</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. AI Creative Studio - Veo3 Aesthetic Design */}
            <section id="how-it-works" className="py-32 bg-white relative overflow-hidden border-t border-gray-100">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[#fafafa] opacity-50 pointer-events-none"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Left: Video Showcase */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7 }}
                            className="relative rounded-3xl overflow-hidden shadow-2xl"
                            onMouseEnter={() => setActiveVideoHover(true)}
                            onMouseLeave={() => setActiveVideoHover(false)}
                        >
                            <video
                                src={aiStudioVideo}
                                autoPlay
                                loop
                                muted
                                className="w-full h-auto object-cover transition-opacity duration-300"
                                style={{ opacity: activeVideoHover ? 0.3 : 1 }}
                            />
                            <AnimatePresence>
                                {activeVideoHover && (
                                    <motion.button
                                        className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xl font-bold backdrop-blur-sm transition-opacity duration-300"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <Play size={48} className="text-white" />
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Right: Content */}
                        <div className="space-y-6">
                            <motion.h2
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 0.2 }}
                                className="text-4xl font-bold text-[#1A4D3E]"
                            >
                                AI Creative Studio: Veo3 Aesthetic Design
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 0.3 }}
                                className="text-lg text-gray-600"
                            >
                                Generate stunning ad creatives with our AI-powered design studio.
                                Simply input your brand guidelines and watch as our AI crafts visually
                                appealing and high-converting ads in seconds.
                            </motion.p>
                            <motion.ul
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 0.4 }}
                                className="list-none space-y-3"
                            >
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 size={20} className="text-[#1A4D3E]" />
                                    AI-Powered Ad Generation
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 size={20} className="text-[#1A4D3E]" />
                                    Customizable Templates
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 size={20} className="text-[#1A4D3E]" />
                                    Real-Time Optimization
                                </li>
                            </motion.ul>
                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 0.5 }}
                                className="px-8 py-4 bg-[#1A4D3E] text-white font-medium hover:bg-[#113328] transition-all rounded-sm shadow-md"
                            >
                                Explore AI Creative Studio
                            </motion.button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Multi-Channel Ad Management - Centralized Control */}
            <section className="py-32 bg-[#fafafa] border-t border-gray-100">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Left: Content */}
                        <div className="space-y-6">
                            <motion.h2
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.7 }}
                                className="text-4xl font-bold text-[#1A4D3E]"
                            >
                                Multi-Channel Ad Management: Centralized Control
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, x: -40 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.7, delay: 0.2 }}
                                className="text-lg text-gray-600"
                            >
                                Manage all your advertising campaigns from a single, intuitive dashboard.
                                Our platform supports seamless integration with all major ad networks,
                                giving you complete control over your marketing efforts.
                            </motion.p>
                            <motion.ul
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.7, delay: 0.3 }}
                                className="list-none space-y-3"
                            >
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 size={20} className="text-[#1A4D3E]" />
                                    Unified Dashboard
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 size={20} className="text-[#1A4D3E]" />
                                    Cross-Platform Analytics
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 size={20} className="text-[#1A4D3E]" />
                                    Automated Reporting
                                </li>
                            </motion.ul>
                            <motion.button
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.7, delay: 0.4 }}
                                className="px-8 py-4 bg-[#1A4D3E] text-white font-medium hover:bg-[#113328] transition-all rounded-sm shadow-md"
                            >
                                Get Started with Centralized Control
                            </motion.button>
                        </div>

                        {/* Right: Image Showcase */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7 }}
                            className="relative rounded-3xl overflow-hidden shadow-2xl"
                        >
                            <img
                                src={multiChannelImg}
                                alt="Multi-Channel Ad Management Dashboard"
                                className="w-full h-auto object-cover"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 5. AI-Powered Optimization - Data-Driven Results */}
            <section className="py-32 bg-white border-t border-gray-100">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Left: Image Showcase */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7 }}
                            className="relative rounded-3xl overflow-hidden shadow-2xl"
                        >
                            <img
                                src={aiOptimizationImg}
                                alt="AI-Powered Campaign Optimization"
                                className="w-full h-auto object-cover"
                            />
                        </motion.div>

                        {/* Right: Content */}
                        <div className="space-y-6">
                            <motion.h2
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.7 }}
                                className="text-4xl font-bold text-[#1A4D3E]"
                            >
                                AI-Powered Optimization: Data-Driven Results
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, x: 40 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.7, delay: 0.2 }}
                                className="text-lg text-gray-600"
                            >
                                Let our AI algorithms continuously analyze and optimize your campaigns
                                for maximum performance. We use real-time data to make informed decisions,
                                ensuring you get the best possible ROI.
                            </motion.p>
                            <motion.ul
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.7, delay: 0.3 }}
                                className="list-none space-y-3"
                            >
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 size={20} className="text-[#1A4D3E]" />
                                    Real-Time Data Analysis
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 size={20} className="text-[#1A4D3E]" />
                                    Automated A/B Testing
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 size={20} className="text-[#1A4D3E]" />
                                    Predictive Analytics
                                </li>
                            </motion.ul>
                            <motion.button
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.7, delay: 0.4 }}
                                className="px-8 py-4 bg-[#1A4D3E] text-white font-medium hover:bg-[#113328] transition-all rounded-sm shadow-md"
                            >
                                Optimize Your Campaigns Today
                            </motion.button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. Testimonials Section - Social Proof */}
            <section className="py-32 bg-[#fafafa] border-t border-gray-100">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-[#1A4D3E] text-center mb-16">
                        What Our Clients Are Saying
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Testimonial Cards - Example */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7 }}
                            className="bg-white rounded-lg shadow-md p-6"
                        >
                            <p className="text-gray-600 mb-4">
                                "The AI-powered advertising platform has completely transformed our
                                marketing efforts. We've seen a significant increase in ROI and
                                a noticeable improvement in ad performance."
                            </p>
                            <div className="flex items-center gap-4">
                                <img
                                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1160&q=80"
                                    alt="Client"
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div>
                                    <p className="font-medium text-[#1A4D3E]">John Doe</p>
                                    <p className="text-sm text-gray-500">CEO, Company</p>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="bg-white rounded-lg shadow-md p-6"
                        >
                            <p className="text-gray-600 mb-4">
                                "The AI creative studio has saved us countless hours and produced
                                some of the most effective ad creatives we've ever used. Highly recommend!"
                            </p>
                            <div className="flex items-center gap-4">
                                <img
                                    src="https://images.unsplash.com/photo-1494790108377-be9c29b82a7e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
                                    alt="Client"
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div>
                                    <p className="font-medium text-[#1A4D3E]">Jane Smith</p>
                                    <p className="text-sm text-gray-500">Marketing Manager</p>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.4 }}
                            className="bg-white rounded-lg shadow-md p-6"
                        >
                            <p className="text-gray-600 mb-4">
                                "The multi-channel ad management dashboard has made it so much easier
                                to keep track of all our campaigns. The centralized control is a game-changer!"
                            </p>
                            <div className="flex items-center gap-4">
                                <img
                                    src="https://images.unsplash.com/photo-1507003211169-0a1dd8a72f9d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=627&q=80"
                                    alt="Client"
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div>
                                    <p className="font-medium text-[#1A4D3E]">Mike Johnson</p>
                                    <p className="text-sm text-gray-500">Business Owner</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 7. Call to Action Section - Convert Leads */}
            <section className="py-32 bg-white border-t border-gray-100">
                <div className="container mx-auto px-6 text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="text-4xl font-bold text-[#1A4D3E] mb-8"
                    >
                        Ready to Transform Your Advertising?
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="text-lg text-gray-600 mb-12"
                    >
                        Join the future of advertising with our AI-powered platform.
                        Start your free trial today and experience the difference!
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.4 }}
                    >
                        <a
                            href="https://launch.yenomai.com/?ref_id=IPxLDDZso3Z1XsmXbpGK2kkf2gn2"
                            target="_blank"
                            rel="noreferrer"
                            className="px-12 py-5 bg-[#1A4D3E] text-white font-medium hover:bg-[#113328] transition-all rounded-sm shadow-md inline-block"
                        >
                            Start Your Free Trial
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* 8. Footer Section - Copyright & Contact */}
            <footer className="py-12 bg-[#f0f0f0] border-t border-gray-200">
                <div className="container mx-auto px-6 text-center">
                    <p className="text-sm text-gray-500">
                        &copy; {new Date().getFullYear()} Yenomai. All rights reserved.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Contact us: support@yenomai.com
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default AdvertisingDashboard;
