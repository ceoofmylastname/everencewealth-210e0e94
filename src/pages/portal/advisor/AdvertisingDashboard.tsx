import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useSpring } from 'framer-motion';
import {
    Play, Video, Mic, Target, Sparkles,
    ArrowRight, Maximize, Share2, MousePointerClick, TrendingUp
} from 'lucide-react';
import {
    SiFacebook, SiInstagram, SiLinkedin, SiTiktok,
    SiYoutube, SiWhatsapp, SiSpotify, SiPinterest, SiX,
    SiSnapchat, SiGoogle
} from 'react-icons/si';
import { FaBing } from 'react-icons/fa';
import { BsEnvelopePaper } from 'react-icons/bs';

// Utilities
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// --- ANIMATION COMPONENTS ---

// High-end smooth scroll progress bar
const ScrollProgress = () => {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    return (
        <motion.div
            className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1A4D3E] via-[#C8A96E] to-[#1A4D3E] origin-left z-50 mix-blend-difference"
            style={{ scaleX }}
        />
    );
};

// Abstract Liquid/Gradient Orb
const LiquidOrb = ({ className, color1, color2, duration = 10, delay = 0 }: any) => {
    return (
        <motion.div
            animate={{
                scale: [1, 1.2, 0.9, 1.1, 1],
                rotate: [0, 90, 180, 270, 360],
                borderRadius: ["60% 40% 30% 70%/60% 30% 70% 40%", "30% 60% 70% 40%/50% 60% 30% 60%", "60% 40% 30% 70%/60% 30% 70% 40%"]
            }}
            transition={{ duration, repeat: Infinity, ease: "linear", delay }}
            className={cn("absolute mix-blend-multiply filter blur-3xl opacity-40", className)}
            style={{ background: `linear-gradient(to right, ${color1}, ${color2})` }}
        />
    );
};

// Revealing Text Component (Letter by letter)
const RevealText = ({ text, className, delay = 0 }: { text: string, className?: string, delay?: number }) => {
    const words = text.split(" ");

    return (
        <div className={cn("inline-flex flex-wrap overflow-hidden", className)}>
            {words.map((word, i) => (
                <motion.span
                    key={i}
                    initial={{ y: "100%", opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.8, delay: delay + (i * 0.05), ease: [0.33, 1, 0.68, 1] }}
                    className="mr-2 inline-block"
                >
                    {word}
                </motion.span>
            ))}
        </div>
    );
};

// Parallax Image wrapper
const ParallaxBlock = ({ children, offset = 50, className }: any) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const y = useTransform(scrollYProgress, [0, 1], [-offset, offset]);

    return (
        <div ref={ref} className={className}>
            <motion.div style={{ y, height: "100%" }}>{children}</motion.div>
        </div>
    );
};

// Metric Counter
const AnimatedCounter = ({ value, suffix = "", prefix = "" }: { value: number, suffix?: string, prefix?: string }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
    const display = useSpring(scrollYProgress, { stiffness: 50, damping: 20 });

    useEffect(() => {
        return display.onChange((v) => {
            setCount(Math.floor(v * value));
        });
    }, [display, value]);

    return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
};


// --- MAIN DASHBOARD ---

const AdvertisingDashboard = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Custom cursor state for interactive hover
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [cursorVariant, setCursorVariant] = useState("default");

    useEffect(() => {
        const mouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener("mousemove", mouseMove);
        return () => window.removeEventListener("mousemove", mouseMove);
    }, []);

    const variants = {
        default: { x: mousePosition.x - 16, y: mousePosition.y - 16, height: 32, width: 32, opacity: 0 },
        hover: { x: mousePosition.x - 40, y: mousePosition.y - 40, height: 80, width: 80, opacity: 0.8, mixBlendMode: 'difference' as any }
    };

    return (
        <div ref={containerRef} className="bg-[#050505] min-h-screen text-white font-sans overflow-x-hidden selection:bg-[#C8A96E]/40 selection:text-white pb-[20rem]">

            {/* Custom Cursor */}
            <motion.div
                variants={variants}
                animate={cursorVariant}
                transition={{ type: "tween", ease: "backOut", duration: 0.1 }}
                className="fixed top-0 left-0 bg-[#C8A96E] rounded-full pointer-events-none z-[100] flex items-center justify-center filter blur-[2px] hidden md:flex"
            >
                {cursorVariant === 'hover' && <span className="text-black font-brand text-[10px] uppercase font-bold tracking-widest mix-blend-normal">Play</span>}
            </motion.div>

            <ScrollProgress />

            {/* 1. ULTRA HIGH-END HERO SECTION */}
            <section className="relative min-h-[110vh] flex flex-col justify-center items-center overflow-hidden py-32 isolate">

                {/* Immersive Dark Background Setup */}
                <div className="absolute inset-0 z-0 flex items-center justify-center">
                    <div className="absolute inset-0 bg-[#050505]"></div>

                    {/* Noise overlay for cinematic texture */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay max-h-[1400px]"></div>

                    {/* Massive animated gradient orbs */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl aspect-square flex items-center justify-center opacity-40">
                        <LiquidOrb duration={25} color1="#1A4D3E" color2="#0a1a15" className="w-[120%] h-[120%]" />
                        <LiquidOrb duration={20} color1="#C8A96E" color2="#8c703b" className="w-[80%] h-[80%] ml-40 mt-20" delay={2} />
                    </div>

                    <div className="absolute bottom-0 w-full h-[40vh] bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent max-h-[1400px]"></div>
                </div>

                <div className="container px-6 z-20 relative w-full flex flex-col items-center">

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl mb-12"
                    >
                        <div className="w-2 h-2 rounded-full bg-[#C8A96E] animate-pulse"></div>
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-white/80">Everence AI Advertising Engine</span>
                    </motion.div>

                    <h1 className="text-[12vw] sm:text-[10vw] md:text-[8vw] lg:text-[7vw] font-black leading-[0.85] tracking-tighter text-center mix-blend-plus-lighter max-w-7xl mx-auto">
                        <RevealText text="DOMINATE" /> <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-[#C8A96E]/50 italic pr-8">
                            <RevealText text="EVERY" delay={0.2} /> <RevealText text="FEED." delay={0.4} />
                        </span>
                    </h1>

                    <motion.p
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1.5 }}
                        className="mt-12 text-lg md:text-2xl font-light text-white/50 max-w-2xl text-center leading-relaxed"
                    >
                        Launch cinematic, hyper-targeted campaigns across 13 networks. Unfair conversion advantages, natively built for financial professionals.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="mt-16 flex flex-col sm:flex-row items-center gap-6"
                    >
                        <a
                            href="https://launch.yenomai.com/?ref_id=IPxLDDZso3Z1XsmXbpGK2kkf2gn2"
                            target="_blank" rel="noreferrer"
                            className="relative group overflow-hidden bg-[#C8A96E] text-[#050505] px-12 py-6 rounded-full font-bold text-lg tracking-wide hover:scale-105 transition-transform duration-500 shadow-[0_0_60px_rgba(200,169,110,0.3)]"
                        >
                            <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1] z-0"></div>
                            <span className="relative z-10 flex items-center gap-3">Initialize Engine <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-500" /></span>
                        </a>
                    </motion.div>

                </div>

                {/* Scroll indicator */}
                <motion.div
                    animate={{ y: [0, 10, 0], opacity: [0.3, 1, 0.3] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-20"
                >
                    <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-white/30 rotate-90 origin-left translate-y-8 -translate-x-1">Scroll</span>
                    <div className="w-[1px] h-16 bg-gradient-to-b from-white/30 to-transparent"></div>
                </motion.div>
            </section>

            {/* 2. KINETIC BRAND TICKER */}
            <div className="w-full bg-[#C8A96E] py-6 overflow-hidden relative z-30 transform -rotate-2 scale-105 shadow-2xl">
                <motion.div
                    animate={{ x: [0, -2000] }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="flex whitespace-nowrap gap-16 items-center"
                >
                    {Array.from({ length: 4 }).map((_, i) => (
                        <React.Fragment key={i}>
                            <div className="flex items-center gap-4 text-[#050505] text-2xl font-black uppercase tracking-tighter">
                                <SiFacebook size={32} /> META ADS <span className="opacity-30 mx-4">•</span>
                            </div>
                            <div className="flex items-center gap-4 text-[#050505] text-2xl font-black uppercase tracking-tighter">
                                <SiGoogle size={32} /> GOOGLE <span className="opacity-30 mx-4">•</span>
                            </div>
                            <div className="flex items-center gap-4 text-[#050505] text-2xl font-black uppercase tracking-tighter">
                                <SiTiktok size={32} /> TIKTOK <span className="opacity-30 mx-4">•</span>
                            </div>
                            <div className="flex items-center gap-4 text-[#050505] text-2xl font-black uppercase tracking-tighter">
                                <SiLinkedin size={32} /> LINKEDIN <span className="opacity-30 mx-4">•</span>
                            </div>
                        </React.Fragment>
                    ))}
                </motion.div>
            </div>

            {/* 3. PLATFORM VISUALIZER - MASONRY/BENTO GRID AESTHETIC */}
            <section className="py-40 bg-[#050505] relative isolate">
                <div className="container mx-auto px-6">
                    <div className="mb-24 md:flex items-end justify-between">
                        <div className="max-w-2xl">
                            <h3 className="text-[#C8A96E] font-bold tracking-[0.2em] text-xs uppercase mb-6 flex items-center gap-4">
                                <div className="w-12 h-[1px] bg-[#C8A96E]" /> Omni-Channel Reach
                            </h3>
                            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none"><RevealText text="13 PLATFORMS." /><br /><span className="text-white/30"><RevealText text="1 DASHBOARD." delay={0.2} /></span></h2>
                        </div>
                        <p className="max-w-xs text-white/50 text-lg mt-8 md:mt-0 font-light hidden md:block">
                            Unified algorithmic bidding architecture natively integrated with the world's largest attention networks.
                        </p>
                    </div>

                    {/* Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[250px]">

                        {/* Meta Card - Large Variant */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
                            className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-[#1877F2]/20 to-[#0a0a0a] rounded-3xl p-8 border border-white/5 relative overflow-hidden group hover:border-[#1877F2]/50 transition-colors"
                        >
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none"></div>
                            <div className="absolute top-0 right-0 w-96 h-96 bg-[#1877F2]/40 filter blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

                            <SiFacebook size={60} className="text-[#1877F2] mb-6 drop-shadow-2xl" />
                            <h3 className="text-4xl font-black mb-4">Meta Ecosystem</h3>
                            <p className="text-white/60 text-lg max-w-sm mb-8">Deploy synchronized campaigns across Facebook, Instagram, Reels, and WhatsApp simultaneously.</p>

                            <div className="flex flex-wrap gap-2 mt-auto">
                                {['Lead Gen', 'Video Views', 'Conversion', 'Retargeting'].map(t => (
                                    <span key={t} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/70">{t}</span>
                                ))}
                            </div>
                        </motion.div>

                        {/* TikTok */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1 }}
                            className="col-span-1 row-span-2 bg-[#1a1a1a] rounded-3xl p-8 border border-white/5 flex flex-col justify-between group overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#00f2fe]/20 to-[#4facfe]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                            <SiTiktok size={40} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
                            <div>
                                <h3 className="text-2xl font-black mb-2">TikTok</h3>
                                <p className="text-white/50 text-sm">Tap into viral organic reach with AI-generated Spark Ads targeted at young professionals.</p>
                            </div>
                        </motion.div>

                        {/* LinkedIn */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}
                            className="col-span-1 row-span-1 bg-gradient-to-r from-[#0A66C2]/30 to-[#050505] rounded-3xl p-6 border border-white/5 flex items-center justify-between group"
                        >
                            <div>
                                <h3 className="text-xl font-black mb-1">LinkedIn</h3>
                                <p className="text-[#0A66C2] text-xs font-bold uppercase tracking-wider">B2B Wealth</p>
                            </div>
                            <SiLinkedin size={36} className="text-[#0A66C2]" />
                        </motion.div>

                        {/* Quick blocks */}
                        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
                            className="col-span-1 row-span-1 bg-[#0a0a0a] rounded-3xl p-6 border border-white/5 flex flex-col justify-center items-center text-center hover:bg-[#C8A96E]/10 group transition-colors cursor-pointer"
                        >
                            <div className="text-[#C8A96E] text-4xl mb-2 font-light group-hover:scale-110 transition-transform">+9</div>
                            <div className="text-white/50 text-xs font-bold tracking-widest uppercase">More Networks</div>
                        </motion.div>

                    </div>
                </div>
            </section>


            {/* 4. CREATIVE STUDIO MACRO-INTERACTIONS - "SORA/VEO" AESTHETIC */}
            <section className="py-40 bg-white text-[#050505] relative overflow-hidden">

                {/* Animated grid background */}
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none border-b border-gray-100 bg-white"
                    style={{ backgroundImage: 'linear-gradient(rgba(26, 77, 62, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(26, 77, 62, 0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }}>
                </div>

                <div className="container mx-auto px-6 relative z-10">

                    <div className="text-center mb-32">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                            className="text-6xl md:text-8xl font-black tracking-tighter text-[#1A4D3E] mb-6"
                        >
                            Create. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C8A96E] to-yellow-400">Deploy.</span> Scale.
                        </motion.h2>
                    </div>

                    {/* Cinematic Video Ad Generator UI */}
                    <div className="mb-40" onMouseEnter={() => setCursorVariant("hover")} onMouseLeave={() => setCursorVariant("default")}>
                        <div className="flex flex-col lg:flex-row gap-12 items-center">

                            <div className="lg:w-1/3">
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C8A96E] mb-4 flex items-center gap-2"><Video size={14} /> Video AI Core</div>
                                <h3 className="text-5xl font-black leading-none tracking-tighter mb-6 text-[#1A4D3E]">Motion <br />Generative AI.</h3>
                                <p className="text-gray-500 text-lg font-light leading-relaxed mb-8">
                                    Type a prompt. Output a broadcast-quality commercial. Our proprietary video synthesis engine maps lips, generates ultra-realistic avatars, and overlays kinetic typography automatically.
                                </p>

                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-2xl bg-gray-50">
                                        <span className="font-bold text-sm">Photorealistic Avatars</span>
                                        <Target className="text-[#1A4D3E]" size={20} />
                                    </div>
                                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-2xl bg-gray-50">
                                        <span className="font-bold text-sm">Zero Camera Required</span>
                                        <Target className="text-[#1A4D3E]" size={20} />
                                    </div>
                                </div>
                            </div>

                            <div className="lg:w-2/3 w-full">
                                <ParallaxBlock offset={30}>
                                    {/* The "Software" Window Mockup */}
                                    <div className="bg-[#050505] rounded-[32px] p-2 shadow-[0_40px_100px_rgba(26,77,62,0.15)] ring-1 ring-gray-200/50">
                                        <div className="bg-[#0f0f0f] rounded-[24px] overflow-hidden border border-white/5 relative aspect-video group">

                                            {/* Top Bar Navigation UI */}
                                            <div className="absolute top-0 w-full h-12 bg-gradient-to-b from-black/80 to-transparent z-20 flex items-center px-6 justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="flex gap-2">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                                                </div>
                                                <div className="flex gap-4 text-white/50">
                                                    <Share2 size={16} className="hover:text-white cursor-pointer transition-colors" />
                                                    <Maximize size={16} className="hover:text-white cursor-pointer transition-colors" />
                                                </div>
                                            </div>

                                            {/* Cinematic "Video" Visualization via CSS */}
                                            <div className="absolute inset-0 bg-[#000] overflow-hidden flex items-center justify-center">
                                                {/* Lighting leak */}
                                                <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0_340deg,#1A4D3E_360deg)] opacity-30"></motion.div>

                                                {/* Abstract Subject */}
                                                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="w-64 h-96 bg-gradient-to-t from-gray-800 to-gray-400 rounded-t-full mt-32 border-8 border-black shadow-[0_0_100px_rgba(255,255,255,0.1)] overflow-hidden relative">
                                                    <div className="absolute top-10 left-1/2 -translate-x-1/2 w-24 h-32 rounded-full bg-gradient-to-b from-gray-300 to-gray-500"></div>
                                                </motion.div>

                                                {/* Focus overlay */}
                                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none"></div>
                                            </div>

                                            {/* Bottom Editor UI */}
                                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-4 flex flex-col gap-3 shadow-2xl z-20">
                                                <div className="flex justify-between items-center px-2">
                                                    <div className="text-[10px] text-[#C8A96E] font-bold tracking-widest uppercase flex items-center gap-2"><Sparkles size={12} /> Generating Scene 04...</div>
                                                    <div className="text-[10px] font-mono text-white/50">64%</div>
                                                </div>

                                                {/* Timeline */}
                                                <div className="w-full bg-black/40 h-8 rounded-lg border border-white/10 overflow-hidden flex p-1 gap-1">
                                                    <div className="h-full bg-[#1A4D3E] rounded w-1/4 relative overflow-hidden"><div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div></div>
                                                    <div className="h-full bg-[#1A4D3E]/80 rounded w-[15%]"></div>
                                                    <div className="h-full bg-[#C8A96E] rounded w-[30%] shadow-[0_0_15px_#C8A96E] relative">
                                                        <motion.div animate={{ x: ['-100%', '300%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="w-[10%] h-full bg-white/50 skew-x-12"></motion.div>
                                                    </div>
                                                    <div className="h-full bg-white/10 rounded border border-white/20 w-1/5 border-dashed"></div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </ParallaxBlock>
                            </div>
                        </div>
                    </div>

                    {/* Audio / Copywriter Split view */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                        {/* Copywriter */}
                        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-gray-50 rounded-[40px] p-10 md:p-14 border border-gray-100 hover:shadow-2xl transition-shadow duration-500">
                            <div className="text-[#1A4D3E] mb-6"><Target strokeWidth={1} size={48} /></div>
                            <h4 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Predictive Text AI</h4>
                            <p className="text-gray-500 font-light mb-8">Generate 100+ compliant variations of ad copy in seconds. The LLM automatically restructures hooks and CTAs based on the specific network formatting.</p>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Output • LinkedIn</div>
                                <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }} className="font-medium text-lg text-[#1A4D3E]">"Stop leaving your tax strategy to chance. High-net-worth individuals require precision architecture. 🏛️ Download our 2026 Strategy Guide."</motion.p>
                            </div>
                        </motion.div>

                        {/* Audio / Spotify */}
                        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-[#1A4D3E] rounded-[40px] p-10 md:p-14 text-white hover:shadow-2xl transition-shadow duration-500 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-full h-full bg-[#1A4D3E] z-0">
                                <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#C8A96E] rounded-full filter blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
                            </div>

                            <div className="relative z-10">
                                <div className="text-[#C8A96E] mb-6"><Mic strokeWidth={1} size={48} /></div>
                                <h4 className="text-3xl font-black mb-4 tracking-tight">Studio Audio Ads</h4>
                                <p className="text-white/60 font-light mb-12">Synthesize broadcast-quality voiceovers from pure text. Directly integrate into Spotify Ads pipeline for Podcast and commute listening.</p>

                                {/* Abstract Audio Visualizer */}
                                <div className="h-24 w-full bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 p-4 flex items-center justify-between gap-1 overflow-hidden relative">
                                    <div className="absolute left-4 z-20 w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#1A4D3E] hover:scale-110 cursor-pointer transition-transform"><Play fill="currentColor" size={16} className="ml-1" /></div>

                                    <div className="flex-1 flex items-center gap-[2px] h-full ml-16 relative z-10 w-full overflow-hidden">
                                        {Array.from({ length: 45 }).map((_, i) => (
                                            <motion.div
                                                key={i}
                                                animate={{ height: ['20%', `${Math.random() * 80 + 20}%`, '20%'] }}
                                                transition={{ duration: 1 + Math.random(), repeat: Infinity, ease: "easeInOut" }}
                                                style={{ backgroundColor: i < 15 ? '#C8A96E' : 'rgba(255,255,255,0.2)' }}
                                                className="flex-1 rounded-full mix-blend-screen min-w-[3px]"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                    </div>

                </div>
            </section>

            {/* 5. GIGANTIC PERFORMANCE STATS */}
            <section className="py-40 bg-[#050505] relative border-t border-white/10">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-white mb-32"><span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/30">Quantifiable</span> ROI.</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">

                        <div className="flex flex-col items-center border-l-0 md:border-l border-white/10 p-8">
                            <div className="text-[12vw] md:text-[6vw] font-black leading-none bg-clip-text text-transparent bg-gradient-to-b from-[#C8A96E] to-[#6a5631] mix-blend-plus-lighter mb-4 drop-shadow-[0_0_15px_rgba(200,169,110,0.4)]">
                                <AnimatedCounter value={15} prefix="+" suffix="X" />
                            </div>
                            <div className="text-sm font-bold tracking-[0.3em] uppercase text-white/50 pt-4 w-full text-center">Avg CTR Increase</div>
                        </div>

                        <div className="flex flex-col items-center border-l-0 md:border-l border-white/10 p-8">
                            <div className="text-[12vw] md:text-[6vw] font-black leading-none bg-clip-text text-transparent bg-gradient-to-b from-[#1A4D3E] to-green-900 mix-blend-plus-lighter mb-4 drop-shadow-[0_0_15px_rgba(26,77,62,0.8)]">
                                <AnimatedCounter value={90} suffix="%" />
                            </div>
                            <div className="text-sm font-bold tracking-[0.3em] uppercase text-white/50 pt-4 w-full text-center">Cost Per Lead Drop</div>
                        </div>

                        <div className="flex flex-col items-center border-l-0 md:border-l border-r border-white/10 p-8">
                            <div className="text-[12vw] md:text-[6vw] font-black leading-none text-white mix-blend-overlay mb-4">
                                <AnimatedCounter value={9} prefix="$" />
                            </div>
                            <div className="text-sm font-bold tracking-[0.3em] uppercase text-white/50 pt-4 w-full text-center">Average CPL </div>
                        </div>

                    </div>

                    <div className="mt-32 max-w-2xl mx-auto flex items-center justify-center gap-4 text-white/40">
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
                        <p className="text-xs tracking-widest uppercase font-bold text-white/30">Based on aggregator data</p>
                        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
                    </div>
                </div>
            </section>

            {/* 6. IMMERSIVE CTA FOOTER */}
            <section className="py-40 relative bg-[#1A4D3E] overflow-hidden flex items-center justify-center min-h-[90vh]">
                {/* Hypnotic expanding rings */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                    {[1, 2, 3, 4].map((i) => (
                        <motion.div
                            key={i}
                            initial={{ scale: 0, opacity: 0.5 }}
                            animate={{ scale: 4, opacity: 0 }}
                            transition={{ duration: 6, repeat: Infinity, delay: i * 1.5, ease: "linear" }}
                            className="absolute w-[400px] h-[400px] rounded-full border-[10px] border-[#C8A96E]/20 mix-blend-overlay"
                        />
                    ))}
                </div>

                <div className="container mx-auto px-6 relative z-10 text-center flex flex-col items-center">

                    <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter max-w-5xl leading-none mb-10">
                        Activate the AI Engine for Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C8A96E] to-white italic font-serif">Firm.</span>
                    </h2>

                    <p className="text-xl md:text-2xl text-[#C8A96E] font-medium max-w-2xl mx-auto mb-16 font-light">
                        Join the elite tier of Everence Wealth advisors deploying algorithmic omni-channel campaigns today.
                    </p>

                    <a
                        href="https://launch.yenomai.com/?ref_id=IPxLDDZso3Z1XsmXbpGK2kkf2gn2"
                        target="_blank" rel="noreferrer"
                        className="group relative overflow-hidden bg-[#050505] text-[#C8A96E] px-16 py-8 rounded-full font-black text-2xl tracking-tighter hover:scale-105 transition-transform duration-500 shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/10"
                    >
                        <div className="absolute inset-0 bg-[#C8A96E] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1] z-0"></div>
                        <span className="relative z-10 flex items-center gap-4 group-hover:text-[#050505] transition-colors duration-500">
                            Launch Dashboard <Target size={28} className="group-hover:rotate-90 transition-transform duration-500" />
                        </span>
                    </a>

                </div>
            </section>

        </div>
    );
};

export default AdvertisingDashboard;
