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
import { BsEnvelopePaper } from 'react-icons/bs'; // For Postcard Ads

const FloatingShape = ({ className, delay = 0, duration = 15, x = [0, 50, 0], y = [0, 30, 0], ...props }: any) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, x, y }}
        transition={{
            opacity: { duration: 1 },
            x: { duration, repeat: Infinity, ease: "easeInOut", delay },
            y: { duration: duration * 1.2, repeat: Infinity, ease: "easeInOut", delay }
        }}
        className={`absolute rounded-full mix-blend-multiply filter blur-3xl opacity-30 ${className}`}
        {...props}
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
                {/* Dynamic Abstract Background */}
                <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                    <FloatingShape className="w-[800px] h-[800px] bg-[#1A4D3E]/5 top-[-20%] left-[-10%]" duration={20} />
                    <FloatingShape className="w-[600px] h-[600px] bg-[#C8A96E]/10 bottom-[-10%] right-[-5%]" duration={25} delay={2} x={[-30, 20, -30]} y={[20, -40, 20]} />

                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015] mix-blend-overlay"></div>

                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#fafafa] to-transparent z-10" />
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-white to-transparent z-10" />
                </div>

                <div className="container mx-auto px-6 relative z-20">
                    <div className="max-w-5xl mx-auto flex flex-col items-center text-center">

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-sm font-semibold text-[#1A4D3E] mb-8"
                        >
                            <Sparkles className="w-4 h-4 text-[#C8A96E]" />
                            AI-Powered Advertising Infrastructure
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                            className="text-6xl md:text-8xl font-black text-[#1A4D3E] tracking-tighter leading-[1.05] mb-8"
                        >
                            Run Smarter Ads.<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1A4D3E] to-[#C8A96E]">Reach More Clients.</span><br />
                            Grow Your Practice.
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-xl md:text-2xl text-gray-500 mb-12 max-w-3xl mx-auto leading-relaxed font-light"
                        >
                            Launch hyper-targeted, high-converting ad campaigns across 13+ platforms—all driven by specialized financial AI, from one secure dashboard.
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
                            <button className="w-full sm:w-auto px-10 py-5 bg-white text-[#1A4D3E] border border-gray-200 font-medium hover:border-[#C8A96E] hover:bg-gray-50 transition-all rounded-sm text-lg shadow-sm">
                                See How It Works
                            </button>
                        </motion.div>

                        {/* Stat Counters with Glassmorphism */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mx-auto">
                            {[
                                { label: 'Campaigns Launched', value: '100,000+' },
                                { label: 'Reduction in Ad Costs', value: '90%' },
                                { label: 'Average CTR Increase', value: '15x' }
                            ].map((stat, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.5 + (idx * 0.1) }}
                                    className="bg-white/60 backdrop-blur-xl border border-white p-6 md:p-8 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#C8A96E]/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="text-4xl md:text-5xl font-black text-[#1A4D3E] mb-2 font-serif">{stat.value}</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-widest font-semibold">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Modern High-End Ticker Strip */}
            <div className="w-full bg-[#111] py-5 overflow-hidden border-y border-gray-800 relative shadow-2xl z-20">
                <div className="absolute inset-0 bg-gradient-to-r from-[#111] via-transparent to-[#111] z-10 w-full pointer-events-none"></div>
                <motion.div
                    animate={{ x: [0, -1500] }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="flex whitespace-nowrap gap-16 font-semibold text-white/50 uppercase tracking-[0.25em] text-xs items-center"
                >
                    {Array.from({ length: 4 }).map((_, i) => (
                        <React.Fragment key={i}>
                            <span className="flex items-center gap-3 hover:text-white transition-colors cursor-default"><SiFacebook size={20} className="text-[#C8A96E]" /> Meta Ads</span>
                            <span className="flex items-center gap-3 hover:text-white transition-colors cursor-default"><SiGoogle size={20} className="text-[#C8A96E]" /> Google Ads</span>
                            <span className="flex items-center gap-3 hover:text-white transition-colors cursor-default"><SiLinkedin size={20} className="text-[#C8A96E]" /> LinkedIn Ads</span>
                            <span className="flex items-center gap-3 hover:text-white transition-colors cursor-default"><SiTiktok size={20} className="text-[#C8A96E]" /> TikTok Ads</span>
                            <span className="flex items-center gap-3 hover:text-white transition-colors cursor-default"><SiYoutube size={20} className="text-[#C8A96E]" /> YouTube Ads</span>
                            <span className="flex items-center gap-3 hover:text-white transition-colors cursor-default"><SiSpotify size={20} className="text-[#C8A96E]" /> Spotify Ads</span>
                            <span className="flex items-center gap-3 hover:text-white transition-colors cursor-default"><BsEnvelopePaper size={20} className="text-[#C8A96E]" /> Postcard Ads</span>
                        </React.Fragment>
                    ))}
                </motion.div>
            </div>

            {/* 2. Platform Grid - Nano Banana Pro Inspired Sleek UI */}
            <section className="py-32 bg-[#fafafa] relative">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-[2px] w-12 bg-[#C8A96E]"></div>
                                <h3 className="text-[#C8A96E] font-bold tracking-[0.2em] text-xs">13 PLATFORMS. ONE DASHBOARD.</h3>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-[#1A4D3E] tracking-tight">Advertise Everywhere That Matters.</h2>
                        </div>
                        <p className="text-gray-500 font-medium md:text-right max-w-sm">
                            Connect accounts with one click and let AI optimize your budget across every channel natively.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { name: 'Meta Ads', icon: SiFacebook, color: '#1877F2', features: ['Facebook & Instagram', 'Feed, Stories & Reels', 'Messenger & WhatsApp', 'Lead Gen & Conversion'] },
                            { name: 'Google Ads', icon: SiGoogle, color: '#4285F4', features: ['Search & Display', 'Performance Max', 'Shopping & YouTube', 'Local Service Ads'] },
                            { name: 'LinkedIn Ads', icon: SiLinkedin, color: '#0A66C2', features: ['B2B Lead Generation', 'Message & Conversion Ads', 'AI-Refined Targeting', 'Faster Optimization'] },
                            { name: 'TikTok Ads', icon: SiTiktok, color: '#000000', features: ['Viral-Ready Campaigns', 'Spark Ads & Lead Forms', 'Website Conversions', 'AI Creative Insights'] },
                            { name: 'YouTube Ads', icon: SiYoutube, color: '#FF0000', features: ['In-Stream & Shorts', 'Contextual Placements', 'AI-Assisted Creative', 'Targeting Suggestions'] },
                            { name: 'WhatsApp Ads', icon: SiWhatsapp, color: '#25D366', features: ['Click-to-Chat Campaigns', 'Start Real Conversations', 'Conversion-Ready Leads', 'Direct Engagement'] },
                            { name: 'Bing Ads', icon: FaMicrosoft, color: '#0089D6', features: ['AI-Generated Headlines', 'Descriptions & Keywords', 'Targeting Suggestions', 'Launch Search Campaigns'] },
                            { name: 'Snapchat Ads', icon: SiSnapchat, color: '#FFFC00', features: ['Vertical Video Ads', 'Traffic & Awareness', 'Conversion Campaigns', 'AI-Generated Creative'] },
                            { name: 'Spotify Ads', icon: SiSpotify, color: '#1DB954', features: ['AI Audio Scripts', 'AI Voiceovers', 'Background Music', 'Target Podcast Listeners'] },
                            { name: 'Postcard Ads', icon: BsEnvelopePaper, color: '#1A4D3E', features: ['Physical Postcards', 'Digital-Like Targeting', 'AI Handles Layout', 'Unique Marketing Channel'] },
                            { name: 'Amazon Ads', upcoming: true, icon: Target, color: '#FF9900', features: ['For Amazon Sellers', 'AI-Powered Campaigns', 'Optimize Product Listings', 'Increase Sales Velocity'] },
                            { name: 'X / Twitter Ads', upcoming: true, icon: SiX, color: '#000000', features: ['Text, Image & Video', 'AI Optimization', 'Reach a Vocal Audience', 'Drive Conversation'] },
                            { name: 'Pinterest Ads', upcoming: true, icon: SiPinterest, color: '#E60023', features: ['Visual Discovery Ads', 'Product Catalogues', 'Lifestyle Targeting', 'AI Creative'] },
                        ].map((platform, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-50px' }}
                                transition={{ duration: 0.6, delay: (idx % 4) * 0.1, ease: "easeOut" }}
                                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(26,77,62,0.08)] transition-all duration-500 transform group hover:-translate-y-2 relative overflow-hidden flex flex-col h-full"
                            >
                                {/* Accent Line */}
                                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-gray-200 to-gray-100 group-hover:from-[#1A4D3E] group-hover:to-[#C8A96E] transition-all duration-500"></div>

                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:border-[#C8A96E]/20 transition-colors shadow-inner">
                                            <platform.icon size={22} className="text-gray-400 group-hover:text-[#1A4D3E] transition-colors duration-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-900 leading-tight">{platform.name}</h4>
                                            {platform.upcoming ? (
                                                <span className="text-[9px] font-black uppercase tracking-wider text-[#C8A96E]">Coming Soon</span>
                                            ) : (
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 block"></span> Active Base
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <ul className="space-y-3 mt-auto relative z-10">
                                    {platform.features.map((feature, fIdx) => (
                                        <li key={fIdx} className="flex items-start gap-2.5 text-sm text-gray-500 font-medium group-hover:text-gray-700 transition-colors">
                                            <div className="mt-[2px] bg-gray-100 p-0.5 rounded-full group-hover:bg-[#1A4D3E] transition-colors">
                                                <CheckCircle2 size={12} className="text-gray-400 group-hover:text-white transition-colors" strokeWidth={3} />
                                            </div>
                                            <span className="leading-snug">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* Background glow on hover */}
                                <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-[#C8A96E]/10 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. AI Creative Studio - Veo3 Aesthetic Design */}
            <section className="py-32 bg-white relative overflow-hidden border-t border-gray-100">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-28 max-w-3xl mx-auto">
                        <h2 className="text-5xl font-black text-[#1A4D3E] tracking-tight mb-6">Create. Publish. Convert.</h2>
                        <p className="text-xl text-gray-500 font-light leading-relaxed">
                            Harness state-of-the-art AI generation tools built directly into the interface. High-converting creative assets, zero external software required.
                        </p>
                    </div>

                    <div className="space-y-40">
                        {/* Block A: Copy Generation */}
                        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                            <div className="lg:w-5/12">
                                <div className="w-14 h-14 bg-gradient-to-br from-[#1A4D3E] to-[#113328] rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-[#1A4D3E]/20">
                                    <PenTool className="text-[#C8A96E]" size={24} />
                                </div>
                                <h3 className="text-4xl font-black text-gray-900 mb-6 tracking-tight">AI Writes Your Ad Copy Instantly.</h3>
                                <p className="text-gray-500 text-lg leading-relaxed mb-8">
                                    Generate high-converting headlines, compelling body text, and powerful CTAs tailored specifically for high-net-worth financial audiences.
                                    Our LLM understands compliance regulations natively.
                                </p>
                                <div className="flex gap-4">
                                    <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm font-semibold flex items-center gap-2"><CheckCircle2 className="text-green-500" size={16} /> Compliant Setup</div>
                                    <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm font-semibold flex items-center gap-2"><CheckCircle2 className="text-green-500" size={16} /> Multilingual</div>
                                </div>
                            </div>

                            <div className="lg:w-7/12 w-full perspective-[2000px]">
                                <motion.div
                                    initial={{ rotateY: 15, rotateX: 5, opacity: 0, x: 50 }}
                                    whileInView={{ rotateY: -5, rotateX: 5, opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 1, type: "spring", stiffness: 50 }}
                                    className="bg-white p-2 rounded-3xl shadow-[0_30px_100px_rgba(26,77,62,0.15)] border border-gray-100 transform-gpu relative z-10"
                                >
                                    <div className="bg-[#f8f9fa] rounded-2xl border border-gray-200 overflow-hidden">
                                        <div className="h-12 border-b border-gray-200 bg-white flex items-center px-4 justify-between">
                                            <div className="flex gap-2">
                                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                            </div>
                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Everence AI Copywriter</div>
                                        </div>
                                        <div className="p-6 md:p-8 space-y-6 relative">
                                            {/* Floating glowing orb */}
                                            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 4, repeat: Infinity }} className="absolute -top-10 -right-10 w-40 h-40 bg-[#C8A96E]/20 blur-3xl rounded-full" />

                                            <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm flex gap-3 relative z-10">
                                                <Zap className="text-[#1A4D3E] shrink-0 mt-0.5" size={20} fill="#1A4D3E" />
                                                <div className="text-gray-600 font-medium">Create a LinkedIn Ad targeting professionals aged 45-60 for Tax-Free Retirement strategies.</div>
                                            </div>

                                            <div className="pt-4 pl-4 border-l-2 border-[#1A4D3E] relative z-10">
                                                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                                                    <div className="bg-[#1A4D3E] text-white p-6 rounded-xl rounded-tl-none shadow-lg">
                                                        <h4 className="text-[#C8A96E] font-bold text-[10px] tracking-[0.2em] mb-2 uppercase">Variation A • Optimized for Engagement</h4>
                                                        <p className="font-bold text-lg mb-4">Don't Overpay the IRS in Retirement.</p>
                                                        <p className="text-sm text-gray-300 font-light leading-relaxed mb-6">
                                                            You've worked hard to build your wealth. But if you haven't prepared a tax-free withdrawal strategy, a major portion of your 401(k) and IRA could be taxed heavily. Discover the exact frameworks our advisors use to shield high-net-worth portfolios.
                                                        </p>
                                                        <div className="flex gap-2">
                                                            {['Tax Strategy', 'Retirement', 'Wealth Management'].map(tag => (
                                                                <span key={tag} className="text-[10px] px-2 py-1 bg-white/10 rounded-md font-semibold text-gray-300">{tag}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        {/* Block B: Video Creation - Veo3 Style UI */}
                        <div className="flex flex-col lg:flex-row-reverse items-center gap-16 lg:gap-24">
                            <div className="lg:w-5/12">
                                <div className="w-14 h-14 bg-gradient-to-br from-[#C8A96E] to-[#a38650] rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-[#C8A96E]/30">
                                    <Video className="text-white" size={24} />
                                </div>
                                <h3 className="text-4xl font-black text-gray-900 mb-6 tracking-tight">Turn Your Message Into a Video Ad.</h3>
                                <p className="text-gray-500 text-lg leading-relaxed mb-8">
                                    Generate stunning, ultra-realistic spokesperson videos using AI avatars representing professional advisors. No cameras, no studio time—just pure, converting video assets.
                                </p>
                                <div className="space-y-3">
                                    {['Photorealistic 4K Output', 'Lip-sync accuracy in 40+ languages', 'Custom branded office backgrounds'].map(item => (
                                        <div className="flex items-center gap-3" key={item}>
                                            <div className="w-6 h-6 rounded-full bg-[#1A4D3E] flex items-center justify-center">
                                                <CheckCircle2 className="text-[#C8A96E]" size={14} />
                                            </div>
                                            <span className="font-medium text-gray-700">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="lg:w-7/12 w-full perspective-[2000px]">
                                <motion.div
                                    initial={{ rotateY: -15, rotateX: 5, opacity: 0, x: -50 }}
                                    whileInView={{ rotateY: 5, rotateX: 5, opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 1, type: "spring", stiffness: 50 }}
                                    className="bg-gray-900 p-3 rounded-[2rem] shadow-[0_40px_100px_rgba(0,0,0,0.4)] border border-gray-800 relative group overflow-hidden"
                                    onMouseEnter={() => setActiveVideoHover(true)}
                                    onMouseLeave={() => setActiveVideoHover(false)}
                                >
                                    {/* Glowing edges on hover mimicking pro video editing software */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-[#1A4D3E]/40 via-transparent to-[#C8A96E]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                                    {/* Video Player Mockup UI */}
                                    <div className="relative aspect-video bg-[#0a0a0a] rounded-2xl overflow-hidden border border-gray-800">

                                        {/* Simulated realistic video background via CSS gradient/blur mesh */}
                                        <div className="absolute inset-0 opacity-80 mix-blend-screen overflow-hidden">
                                            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#1A4D3E]/80 rounded-full blur-[80px]"></div>
                                            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#C8A96E]/60 rounded-full blur-[80px]"></div>
                                        </div>

                                        {/* Grid Pattern overlay */}
                                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>

                                        {/* Fake Advisor Avatar Silhouette (CSS drawn for modern look) */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-end overflow-hidden pb-0">
                                            <motion.div
                                                animate={activeVideoHover ? { scale: 1.02, y: 5 } : { scale: 1, y: 10 }}
                                                transition={{ duration: 0.5 }}
                                                className="w-1/2 aspect-[3/4] rounded-t-full bg-gradient-to-b from-gray-200 to-gray-400 relative border-b-0 border-4 border-gray-800 shadow-[inset_0_20px_50px_rgba(0,0,0,0.5)]"
                                            >
                                                {/* Head */}
                                                <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-1/3 aspect-[3/4] rounded-[40%] bg-gradient-to-b from-gray-100 to-gray-300 shadow-2xl"></div>
                                            </motion.div>
                                        </div>

                                        {/* Pro UI Overlays */}
                                        <div className="absolute top-4 left-4 flex gap-2">
                                            <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-md border border-white/10 text-[10px] font-bold text-white tracking-widest flex items-center gap-1.5 uppercase">
                                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> Generating 4K
                                            </div>
                                        </div>
                                        <div className="absolute top-4 right-4">
                                            <div className="px-3 py-1 bg-[#1A4D3E]/80 backdrop-blur-md rounded-md border border-[#1A4D3E] text-[10px] font-bold text-[#C8A96E] tracking-widest uppercase">
                                                Avatar: "James (Trust)"
                                            </div>
                                        </div>

                                        {/* Timeline and Play Controls */}
                                        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/90 to-transparent">
                                            <div className="flex items-center gap-4 text-white">
                                                <button className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-white/20">
                                                    <Play size={18} fill="currentColor" className="ml-1" />
                                                </button>
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex justify-between text-[10px] font-bold text-gray-400 font-mono">
                                                        <span>00:03:14</span>
                                                        <span>00:15:00</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden flex">
                                                        <div className="w-1/4 h-full bg-[#C8A96E] relative">
                                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full scale-150"></div>
                                                        </div>
                                                        <div className="w-1/2 h-full bg-gray-600/50"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        {/* Block C: AI Audio & Spotify */}
                        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                            <div className="lg:w-5/12">
                                <div className="w-14 h-14 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-black/20">
                                    <Mic className="text-[#1DB954]" size={24} />
                                </div>
                                <h3 className="text-4xl font-black text-gray-900 mb-6 tracking-tight">Your Voice on Every Platform.</h3>
                                <p className="text-gray-500 text-lg leading-relaxed mb-8">
                                    AI instantly generates audio scripts and professional voiceovers optimized for Spotify and podcast listeners.
                                    Reach a massive, engaged commute audience with high-end audio ads.
                                </p>
                                <div className="inline-flex items-center gap-2 font-bold text-[#1A4D3E] border-b-2 border-[#C8A96E] pb-1 cursor-pointer hover:text-gray-900 transition-colors">
                                    Preview Voice Library <ArrowRight size={16} />
                                </div>
                            </div>
                            <div className="lg:w-7/12 w-full">
                                <motion.div
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8 }}
                                    className="bg-[#121212] p-8 md:p-12 rounded-[2rem] shadow-2xl border border-gray-800 flex items-center gap-6 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#1DB954]/10 rounded-full blur-[80px]"></div>

                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1DB954] to-[#1ed760] flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(29,185,84,0.4)] cursor-pointer hover:scale-105 transition-transform z-10">
                                        <Play className="text-black ml-1" size={32} fill="currentColor" />
                                    </div>
                                    <div className="flex-1 relative z-10">
                                        <div className="flex justify-between items-end mb-4">
                                            <div className="text-white font-bold text-xl tracking-tight leading-none">Tax Strategy Audio Ad</div>
                                            <div className="text-[#1DB954] font-mono text-sm font-bold">HQ • AI Generated</div>
                                        </div>
                                        <div className="flex items-center gap-[3px] h-16 w-full">
                                            {Array.from({ length: 60 }).map((_, i) => {
                                                const height = Math.random() * 80 + 20;
                                                return (
                                                    <motion.div
                                                        key={i}
                                                        animate={{
                                                            height: [`${height}%`, `${Math.random() * 100}%`, `${height}%`],
                                                            backgroundColor: i < 20 ? '#1DB954' : '#333333'
                                                        }}
                                                        transition={{ duration: 1.5 + (Math.random() * 0.5), repeat: Infinity, ease: "easeInOut" }}
                                                        className="flex-1 rounded-full min-w-[3px]"
                                                    />
                                                )
                                            })}
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. How It Works - Premium Infographic */}
            <section className="py-32 bg-[#1A4D3E] text-white relative overflow-hidden">
                {/* Background mesh glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl aspect-square bg-[#C8A96E]/5 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-5xl font-black mb-6">From Zero to Live Campaign in Minutes</h2>
                        <p className="text-[#C8A96E] text-lg font-medium tracking-wide">THE EVERENCE ADVERTISING WORKFLOW</p>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative max-w-6xl mx-auto">
                        {/* Animated Solid Line on desktop connecting steps */}
                        <div className="hidden md:block absolute top-[40px] left-[10%] right-[10%] h-[1px] bg-white/10 z-0">
                            <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: '100%' }}
                                viewport={{ once: true }}
                                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
                                className="h-full bg-gradient-to-r from-transparent via-[#C8A96E] to-transparent w-full shadow-[0_0_10px_#C8A96E]"
                            />
                        </div>

                        {[
                            { id: 1, title: 'Connect Data', desc: 'Securely link your firm accounts via OAuth.', icon: MousePointerClick },
                            { id: 2, title: 'Set Constraints', desc: 'Select budget, audience, and compliance rules.', icon: Target },
                            { id: 3, title: 'AI Production', desc: 'System generates all copy and creative instantly.', icon: Sparkles },
                            { id: 4, title: 'Deploy & Optimize', desc: 'Algorithms bid and manage spend automatically.', icon: TrendingUp },
                        ].map((step, idx) => (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: idx * 0.15 }}
                                className="flex flex-col items-center text-center relative z-10 w-full md:w-1/4 group"
                            >
                                <div className="w-20 h-20 rounded-2xl bg-[#0f2d24] border border-[#1A4D3E] group-hover:border-[#C8A96E] text-[#C8A96E] flex items-center justify-center mb-8 shadow-xl transition-all duration-300 transform group-hover:-translate-y-2 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#C8A96E]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <step.icon size={28} className="relative z-10" />
                                </div>
                                <div className="text-[10px] uppercase font-black tracking-[0.2em] text-[#C8A96E] mb-3">Step 0{step.id}</div>
                                <h4 className="text-xl font-bold mb-3 text-white tracking-tight">{step.title}</h4>
                                <p className="text-white/60 text-sm font-medium leading-relaxed max-w-[220px]">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. Real Data Infographics - Highly Styled Components */}
            <section className="py-32 bg-gray-50 border-t border-gray-200">
                <div className="container mx-auto px-6">
                    <div className="mb-20">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-[2px] w-12 bg-[#1A4D3E]"></div>
                            <h3 className="text-[#1A4D3E] font-bold tracking-[0.2em] text-xs uppercase">Platform Analytics</h3>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">The Numbers Speak.</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Stat 1: Elegant Bar Chart UI */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white p-10 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col justify-between"
                        >
                            <div>
                                <h3 className="text-xs font-black text-[#1A4D3E] uppercase tracking-widest mb-2">Cost Per Lead</h3>
                                <div className="text-6xl font-black text-gray-900 mb-2 font-serif">
                                    90% <span className="text-xl text-[#C8A96E] font-bold tracking-normal align-top">Decrease</span>
                                </div>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed mb-12">Dramatic reduction in acquisition costs through hyper-targeted AI optimization algorithms.</p>
                            </div>

                            <div className="h-40 flex items-end gap-6 relative">
                                {/* Y Axis lines */}
                                <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col justify-between">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="w-full border-t border-dashed border-gray-200 h-0"></div>
                                    ))}
                                </div>

                                <div className="w-1/2 flex flex-col items-center justify-end h-full z-10 group cursor-default">
                                    <motion.div initial={{ height: 0 }} whileInView={{ height: '90%' }} transition={{ duration: 1, ease: "easeOut" }} className="w-full bg-gray-200 rounded-t-lg group-hover:bg-gray-300 transition-colors relative">
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-3 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold">$120/Lead</div>
                                    </motion.div>
                                    <span className="text-xs font-bold text-gray-400 mt-4 tracking-wider uppercase">Before TV/Radio</span>
                                </div>

                                <div className="w-1/2 flex flex-col items-center justify-end h-full z-10 group cursor-default">
                                    <motion.div initial={{ height: 0 }} whileInView={{ height: '10%' }} transition={{ duration: 1, ease: "easeOut", delay: 0.2 }} className="w-full bg-gradient-to-t from-[#113328] to-[#1A4D3E] rounded-t-lg shadow-lg relative">
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#C8A96E] text-white text-xs py-1 px-3 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold">~$12/Lead</div>
                                    </motion.div>
                                    <span className="text-xs font-black text-[#1A4D3E] mt-4 tracking-wider uppercase">Everence AI</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Stat 2: Premium Dark Theme Line Chart */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="bg-gray-900 p-10 rounded-3xl shadow-2xl border border-gray-800 flex flex-col justify-between relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#C8A96E]/10 rounded-full blur-[80px] pointer-events-none"></div>

                            <div className="relative z-10">
                                <h3 className="text-xs font-black text-[#C8A96E] uppercase tracking-widest mb-2">Click-Through Rate</h3>
                                <div className="text-6xl font-black text-white mb-2 font-serif">
                                    15x <span className="text-xl text-[#C8A96E] font-bold tracking-normal align-top">Higher</span>
                                </div>
                                <p className="text-sm text-gray-400 font-medium leading-relaxed mb-12">Dynamic creative generation tests thousands of micro-variations to dominate feed visibility.</p>
                            </div>

                            <div className="h-40 w-full relative z-10">
                                <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#1A4D3E" />
                                            <stop offset="100%" stopColor="#C8A96E" />
                                        </linearGradient>
                                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#C8A96E" stopOpacity="0.4" />
                                            <stop offset="100%" stopColor="#1A4D3E" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>

                                    <motion.path
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.5, duration: 1 }}
                                        d="M 0 50 L 20 45 L 40 46 L 60 25 L 80 20 L 100 0 L 100 50 Z"
                                        fill="url(#areaGrad)"
                                    />
                                    <motion.path
                                        initial={{ pathLength: 0 }}
                                        whileInView={{ pathLength: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                                        d="M 0 50 L 20 45 L 40 46 L 60 25 L 80 20 L 100 0"
                                        fill="none"
                                        stroke="url(#lineGrad)"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    {/* Point indicator */}
                                    <motion.circle
                                        initial={{ opacity: 0, scale: 0 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 1.5 }}
                                        cx="100" cy="0" r="4" fill="#C8A96E"
                                        className="filter drop-shadow-[0_0_5px_#C8A96E]"
                                    />
                                </svg>
                            </div>
                        </motion.div>

                        {/* Stat 3: Circular Gauge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="bg-white p-10 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col items-center justify-center text-center"
                        >
                            <div className="relative w-48 h-48 mb-10 flex items-center justify-center pt-4">
                                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 origin-center drop-shadow-xl">
                                    {/* Track */}
                                    <circle cx="50" cy="50" r="40" stroke="#f3f4f6" strokeWidth="8" fill="none" />
                                    {/* Progress Line */}
                                    <motion.circle
                                        initial={{ strokeDashoffset: 251 }}
                                        whileInView={{ strokeDashoffset: 40 }} // ~85% complete
                                        viewport={{ once: true }}
                                        transition={{ duration: 2, ease: "easeOut" }}
                                        cx="50" cy="50" r="40"
                                        stroke="url(#gaugeGrad)"
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray="251"
                                        strokeLinecap="round"
                                    />
                                    <defs>
                                        <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
                                            <stop offset="0%" stopColor="#C8A96E" />
                                            <stop offset="100%" stopColor="#1A4D3E" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
                                    <div className="text-5xl font-black text-gray-900 font-serif tracking-tight">$9</div>
                                    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mt-1">Avg Lead</div>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Highly Qualified Pipeline</h3>
                            <p className="text-gray-500 text-sm font-medium leading-relaxed">System focuses spend entirely on high-net-worth intent signals.</p>
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* 6. Feature List - Minimal Elegance */}
            <section className="py-24 bg-white border-t border-gray-100">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-12">
                        {[
                            { icon: Target, name: 'AI Targeting', desc: 'Predictive audience models' },
                            { icon: Zap, name: 'Automated Optimization', desc: 'Real-time ROI focusing' },
                            { icon: Briefcase, name: 'White-Label Branding', desc: 'Your firm\'s identity' },
                            { icon: LayoutTemplate, name: 'Template Library', desc: 'Compliant frameworks' },
                            { icon: MousePointerClick, name: 'Cross-Platform', desc: 'Manage all networks' },
                            { icon: BarChart, name: 'Performance Reports', desc: 'Client-ready exports' },
                        ].map((feature, idx) => (
                            <div key={idx} className="flex flex-col items-center text-center group cursor-default">
                                <div className="w-14 h-14 bg-gray-50 flex items-center justify-center rounded-2xl mb-5 text-[#1A4D3E] group-hover:bg-[#1A4D3E] group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-[0_10px_20px_rgba(26,77,62,0.2)] transform group-hover:-translate-y-1">
                                    <feature.icon size={24} />
                                </div>
                                <h4 className="font-bold text-gray-900 tracking-tight mb-2">{feature.name}</h4>
                                <p className="text-xs text-gray-500 font-medium leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 7. CTA Section - Ultra Premium Finish */}
            <section className="py-32 bg-[#1A4D3E] relative overflow-hidden">
                {/* Intricate background pattern */}
                <div className="absolute inset-0 opacity-10 mix-blend-color-burn">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="gridLarge" width="80" height="80" patternUnits="userSpaceOnUse">
                                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#C8A96E" strokeWidth="1" />
                            </pattern>
                            <pattern id="gridSmall" width="20" height="20" patternUnits="userSpaceOnUse">
                                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#C8A96E" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#gridSmall)" />
                        <rect width="100%" height="100%" fill="url(#gridLarge)" />
                    </svg>
                </div>

                {/* Glow effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#C8A96E]/20 blur-[120px] rounded-full pointer-events-none"></div>

                <div className="container mx-auto px-6 text-center relative z-20">
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-10 border border-white/20 shadow-2xl">
                        <Target size={32} className="text-[#C8A96E]" />
                    </div>

                    <h2 className="text-5xl md:text-6xl font-black text-white mb-8 tracking-tighter leading-tight max-w-4xl mx-auto">
                        Ready to Put Your Practice in Front of the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C8A96E] to-amber-200">Right Clients?</span>
                    </h2>

                    <p className="text-xl text-white/70 mb-14 max-w-2xl mx-auto font-light leading-relaxed">
                        Your Everence Wealth advertising infrastructure is provisioned and ready to activate. Launch your first campaign in under 10 minutes.
                    </p>

                    <a
                        href="https://launch.yenomai.com/?ref_id=IPxLDDZso3Z1XsmXbpGK2kkf2gn2"
                        target="_blank"
                        rel="noreferrer"
                        className="group inline-flex items-center gap-4 px-12 py-6 bg-gradient-to-r from-[#C8A96E] to-[#eaddac] text-[#1A4D3E] font-black text-lg hover:from-white hover:to-white transition-all rounded-sm shadow-[0_20px_50px_rgba(200,169,110,0.3)] hover:shadow-[0_20px_60px_rgba(255,255,255,0.4)] hover:-translate-y-1 transform duration-300"
                    >
                        Open My Advertising Account
                        <div className="w-8 h-8 rounded-full bg-[#1A4D3E]/10 flex items-center justify-center group-hover:bg-[#1A4D3E]/5 transition-colors">
                            <ArrowRight size={18} />
                        </div>
                    </a>

                    <div className="mt-16 flex items-center justify-center gap-3 text-white/40 font-bold tracking-[0.2em] text-[10px] uppercase">
                        <div className="w-8 h-[1px] bg-white/20"></div>
                        Powered by Everence Wealth Advisor OS
                        <div className="w-8 h-[1px] bg-white/20"></div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default AdvertisingDashboard;
