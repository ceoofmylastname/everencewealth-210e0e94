import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

interface RecruitHeroProps {
    onBeginAudit: () => void;
}

// Letter-Pop component for animated headline characters
const LetterPop: React.FC<{ char: string; delay: number; className?: string; style?: React.CSSProperties }> = ({ char, delay, className, style }) => (
    <span
        className={`letter-pop ${className || ''}`}
        style={{ animationDelay: `${delay}s`, ...style }}
    >
        {char === ' ' ? '\u00A0' : char}
    </span>
);

export const RecruitHero: React.FC<RecruitHeroProps> = ({ onBeginAudit }) => {
    const [stage, setStage] = useState(0);

    useEffect(() => {
        const timers = [
            setTimeout(() => setStage(1), 300),
            setTimeout(() => setStage(2), 800),
            setTimeout(() => setStage(3), 1600),
            setTimeout(() => setStage(4), 2400),
            setTimeout(() => setStage(5), 3200),
        ];
        return () => timers.forEach(clearTimeout);
    }, []);

    // Generate letter-pop delays for "FORGE"
    const forgeLetters = useMemo(() =>
        'FORGE'.split('').map((ch, i) => ({ char: ch, delay: 0.3 + i * 0.08 })),
        []
    );

    return (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">

            {/* ===== VIDEO BACKGROUND ===== */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <video
                    autoPlay loop muted playsInline
                    className="w-full h-full object-cover"
                    poster=""
                // src="/videos/everence-lifestyle-reel.mp4"
                />
                <div className="absolute inset-0" style={{
                    background: 'radial-gradient(ellipse at center, rgba(5,5,5,0.3) 0%, rgba(5,5,5,0.85) 70%, rgba(5,5,5,1) 100%)',
                }} />
            </div>

            {/* Decorative side text — WEALTH ARCHITECTURE (high-contrast + gold glow) */}
            <motion.div
                className="hidden xl:block absolute left-8 top-1/2 -translate-y-1/2 z-10"
                initial={{ opacity: 0, x: -40 }}
                animate={stage >= 2 ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
                <p
                    className="text-[10px] font-bold tracking-[0.6em] uppercase side-text-glow"
                    style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
                >
                    Wealth Architecture
                </p>
            </motion.div>

            {/* Decorative side text — STRATEGIC PARTNERSHIP */}
            <motion.div
                className="hidden xl:block absolute right-8 top-1/2 -translate-y-1/2 z-10"
                initial={{ opacity: 0, x: 40 }}
                animate={stage >= 2 ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
                <p
                    className="text-[10px] font-bold tracking-[0.6em] uppercase side-text-glow"
                    style={{ writingMode: 'vertical-lr' }}
                >
                    Strategic Partnership
                </p>
            </motion.div>

            {/* Center dot (stage 0) */}
            <motion.div
                className="absolute z-20"
                initial={{ scale: 0, opacity: 0 }}
                animate={
                    stage === 0 ? { scale: 1, opacity: 1 }
                        : { scale: 80, opacity: 0 }
                }
                transition={
                    stage === 0 ? { duration: 0.3, ease: 'easeOut' }
                        : { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
                }
            >
                <div className="w-3 h-3 rounded-full bg-[#D4AF37] animate-pulse" />
            </motion.div>

            {/* ============================== */}
            {/* HEADLINE: FORGE Your LEGACY    */}
            {/* ============================== */}
            <div className="text-center mb-6 md:mb-8 leading-none -space-y-1 md:-space-y-2 relative z-10">

                {/* FORGE — Letter-Pop with gold glow */}
                {stage >= 1 && (
                    <div className="relative">
                        <div
                            className="text-[16vw] md:text-[10vw] lg:text-[8vw] font-black uppercase leading-[0.85]"
                            style={{
                                fontFamily: "'Montserrat', 'Outfit', 'Inter Tight', sans-serif",
                                letterSpacing: '-0.01em',
                                transform: 'scaleX(1.02)'
                            }}
                        >
                            {forgeLetters.map((l, i) => (
                                <LetterPop
                                    key={i}
                                    char={l.char}
                                    delay={l.delay}
                                    className="text-white"
                                    style={{
                                        textShadow: '0 0 30px rgba(212, 175, 55, 0.4), 0 0 60px rgba(212, 175, 55, 0.15)',
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* YOUR — Cutout Highlight */}
                <motion.div
                    className="relative flex justify-center -my-1 md:-my-4 z-20"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={stage >= 2 ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
                >
                    <div className="highlight-cutout-box inline-block px-8 py-2 md:py-3 lg:px-12 lg:py-4 transform -rotate-3 z-10 hover:rotate-0 hover:scale-105 transition-all duration-300">
                        <span
                            className="block text-[9vw] md:text-[6vw] lg:text-[4vw] leading-none"
                            style={{
                                fontFamily: "'Outfit', 'Nunito', 'Varela Round', sans-serif",
                                fontWeight: 900,
                                color: '#050505',
                                letterSpacing: '0.05em'
                            }}
                        >
                            YOUR
                        </span>
                    </div>
                </motion.div>

                {/* LEGACY — Neon Gradient Outline */}
                <motion.div
                    initial={{ opacity: 0, scale: 2.5, y: 60 }}
                    animate={stage >= 3 ? { opacity: 1, scale: 1, y: 0 } : {}}
                    transition={{ type: 'spring', stiffness: 200, damping: 20, mass: 1.2 }}
                >
                    <span
                        className="block text-[18vw] md:text-[12vw] lg:text-[10vw] uppercase leading-[0.8] neon-outline"
                        style={{
                            fontFamily: "'Montserrat', 'Outfit', 'Inter Tight', sans-serif",
                            fontWeight: 900,
                            letterSpacing: '-0.04em',
                            transform: 'scaleX(1.02)'
                        }}
                    >
                        LEGACY
                    </span>
                </motion.div>
            </div>

            {/* Sub-headline — The Positioning */}
            <motion.div
                className="text-center max-w-xl mx-auto mb-10 md:mb-14 relative z-10"
                initial={{ opacity: 0, y: 30 }}
                animate={stage >= 4 ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6 }}
            >
                <p className="text-sm md:text-base text-[#E2E8F0]/70 leading-relaxed mb-2"
                    style={{ fontFamily: "'Inter Tight', sans-serif" }}
                >
                    Stop funding their jet.{' '}
                    <em className="text-[#D4AF37] font-medium not-italic"
                        style={{ textShadow: '0 0 15px rgba(212, 175, 55, 0.4)' }}
                    >
                        Start fueling yours.
                    </em>
                </p>
                <p className="text-[10px] md:text-xs tracking-[0.2em] uppercase text-[#E2E8F0]/35 max-w-md mx-auto leading-relaxed"
                    style={{ fontFamily: "'Inter Tight', sans-serif" }}
                >
                    {"You've been sold a corporate myth. We reclaim control."}
                </p>
            </motion.div>

            {/* ================================ */}
            {/* Status Bar (Bottom HUD) — Neon-Prestige Treatment */}
            {/* ================================ */}
            <motion.div
                className="fixed bottom-4 md:bottom-8 inset-x-0 z-20 flex justify-center px-4"
                initial={{ opacity: 0, y: 80 }}
                animate={stage >= 5 ? { opacity: 1, y: 0 } : {}}
                transition={{ type: 'spring', stiffness: 120, damping: 18, mass: 1 }}
            >
                <div className="neon-border neon-border-subtle w-full max-w-4xl">
                    <div
                        className="rounded-[24px] px-4 py-3 md:px-6 md:py-4 flex flex-col md:flex-row items-center gap-3 md:gap-0 backdrop-blur-xl"
                        style={{
                            background: 'linear-gradient(135deg, rgba(18, 28, 22, 0.85), rgba(5, 5, 5, 0.9))',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 30px rgba(212, 175, 55, 0.05)',
                        }}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 md:gap-6 w-full">
                            {/* Portal Status */}
                            <div className="flex flex-col items-center justify-center text-center">
                                <span className="block text-[9px] font-semibold tracking-[0.25em] uppercase text-[#D4AF37]/50 mb-1"
                                    style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                                    Portal Status
                                </span>
                                <span className="flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase text-[#D4AF37]/80"
                                    style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
                                    Restricted Access
                                </span>
                            </div>

                            {/* Scarcity Ticker */}
                            <div className="flex flex-col items-center justify-center border-y md:border-y-0 md:border-x border-[#D4AF37]/8 py-3 md:py-0 md:px-4">
                                <span className="block text-[9px] font-semibold tracking-[0.25em] uppercase text-[#D4AF37]/50 mb-1"
                                    style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                                    Current Capacity
                                </span>
                                <span className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#E2E8F0]/70"
                                    style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                                    <span className="gold-shimmer-text font-black text-sm">2</span> Partnerships Remaining
                                </span>
                            </div>

                            {/* CTA — Glass-Press Button */}
                            <div className="flex items-center justify-center">
                                <button
                                    onClick={onBeginAudit}
                                    className="glass-press-btn relative inline-block px-7 py-3 text-[#D4AF37] font-bold text-[11px] tracking-[0.15em] uppercase cursor-pointer"
                                    style={{ fontFamily: "'Inter Tight', sans-serif" }}
                                >
                                    <span className="relative z-10">Begin The Audit</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
