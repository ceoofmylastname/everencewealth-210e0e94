import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, Calendar, MapPin, Clock, Loader2, CheckCircle2, ChevronRight, ChevronLeft, Check, Star } from "lucide-react";
import confetti from "canvas-confetti";
const sessionHighlights = [
    { time: "10:30 AM", title: "Registration & Check-In" },
    { time: "11:00 AM", title: "Financial Workshop Begins" },
    { title: "Welcome & Introductions" },
    { title: "Everence Product Portfolio Overview" },
    { title: "Values-Based Financial Planning Strategies" },
    { title: "Client Communication & Engagement" },
    { title: "Compliance & Regulatory Updates" },
    { title: "Case Studies & Workshop Sessions" },
    { title: "Q&A Panel with Everence Advisors" },
    { time: "4:00 PM", title: "Closing Remarks" }
];

export default function TrainingEvent() {
    const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(true);
    const [videoProgress, setVideoProgress] = useState(0);

    const toggleSound = useCallback(() => {
        if (!videoRef.current) return;
        if (isMuted) {
            videoRef.current.muted = false;
            videoRef.current.currentTime = 0;
            videoRef.current.play();
            setIsMuted(false);
        } else {
            videoRef.current.muted = true;
            setIsMuted(true);
        }
    }, [isMuted]);

    const handleTimeUpdate = useCallback(() => {
        if (videoRef.current && videoRef.current.duration) {
            setVideoProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
        }
    }, []);

    // Focus input automatically on step change
    useEffect(() => {
        if (step > 0 && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [step]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.functions.invoke("register-training-event", {
                body: formData,
            });

            if (error) throw new Error(error.message);
            if (data?.error) throw new Error(data.error);

            setSuccess(true);
            toast({
                title: "Registration Confirmed!",
                description: "Your spot has been secured. Check your email for details.",
            });
        } catch (err: any) {
            toast({
                title: "Registration Failed",
                description: err.message,
                variant: "destructive",
            });
            setStep(1); // reset to first step on error
        } finally {
            setLoading(false);
        }
    };

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        if (step === 1 && !formData.name.trim()) return;
        if (step === 2 && !formData.email.trim()) return;
        if (step === 3 && !formData.phone.trim()) return;

        if (step === 3) {
            handleSubmit();
        } else {
            setStep(s => s + 1);
        }
    };

    // Fire brand confetti on success
    useEffect(() => {
        if (!success) return;
        const brandColors = ['#C5A059', '#1A4D3E', '#F2E0B2', '#ffffff'];
        const fire = (particleRatio: number, opts: confetti.Options) => {
            confetti({
                origin: { y: 0.7 },
                colors: brandColors,
                ...opts,
                particleCount: Math.floor(250 * particleRatio),
            });
        };
        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });
        // Second burst
        setTimeout(() => {
            confetti({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0 }, colors: brandColors });
            confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1 }, colors: brandColors });
        }, 400);
    }, [success]);

    const firstName = formData.name.split(' ')[0] || 'there';
    const submittedAt = new Date();

    if (success) {
        return (
            <div className="min-h-screen bg-[#0A120F] flex items-center justify-center p-4 sm:p-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img src="/training-hero.png" alt="Training Event" className="w-full h-full object-cover opacity-20 filter blur-sm" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A120F] via-[#0A120F]/80 to-[#0A120F]/40" />
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="relative z-10 w-full max-w-xl bg-white/5 backdrop-blur-2xl border border-white/10 p-6 sm:p-10 md:p-14 rounded-[2rem] shadow-[0_0_60px_-15px_rgba(197,160,89,0.3)]"
                >
                    {/* Animated check */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
                        className="w-20 h-20 bg-[#1A4D3E] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(26,77,62,0.5)]"
                    >
                        <CheckCircle2 className="w-10 h-10 text-[#C5A059]" />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-4xl md:text-5xl font-serif text-white mb-2"
                    >
                        Congratulations, <span className="text-[#C5A059]">{firstName}</span>!
                    </motion.h1>
                    <p className="text-gray-400 text-lg mb-8">Your seat is officially reserved.</p>

                    {/* Event details card */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-8 text-left space-y-4"
                    >
                        <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                            <img src="https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png" alt="Everence" className="w-8 h-8" />
                            <div>
                                <p className="text-[#C5A059] font-serif text-lg font-semibold">Everence Wealth</p>
                                <p className="text-gray-500 text-xs uppercase tracking-widest">Broker Training · Spring '26</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-300">
                                <Calendar className="w-4 h-4 text-[#C5A059]" /> March 21, 2026
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                                <Clock className="w-4 h-4 text-[#C5A059]" /> Registration 10:30 AM | Event 11:00 AM – 4:00 PM PT
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                                <MapPin className="w-4 h-4 text-[#C5A059]" /> Andaz Napa
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                                <Star className="w-4 h-4 text-[#C5A059]" /> {submittedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {submittedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            </div>
                        </div>
                    </motion.div>

                    {/* Session highlights preview */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mb-8"
                    >
                        <p className="text-xs uppercase tracking-widest text-[#C5A059] font-bold mb-3">Session Highlights</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                            {sessionHighlights.slice(1, 7).map((h, i) => (
                                <div key={i} className="flex items-center gap-2 text-gray-400 text-sm">
                                    <Check className="w-3 h-3 text-[#C5A059] shrink-0" /> {h.title}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <Link to="/">
                        <Button className="bg-[#C5A059] hover:bg-[#b08e4f] text-black rounded-full px-8 h-12 text-lg font-medium transition-colors w-full">
                            Return Home
                        </Button>
                    </Link>
                    <p className="text-gray-600 text-xs mt-4">Confirmation sent to {formData.email}</p>
                </motion.div>
            </div>
        );
    }

    // Animation variants for Typeform-like multi-step
    const formVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" as const } }
    };

    return (
        <div className="min-h-screen bg-[#080f0b] text-white selection:bg-[#C8A96E] selection:text-black relative overflow-x-hidden" style={{ fontFamily: "'GeistSans', system-ui, -apple-system, sans-serif" }}>
            {/* CSS animations */}
            <style>{`
                @keyframes te-fadeUp {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes te-fadeUp12 {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes te-fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes te-wave-pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }
                @keyframes te-gold-gradient-shift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>

            <div className="relative z-10">
                {/* Navbar */}
                <nav className="p-4 md:p-6 md:px-12 flex items-center justify-between border-b border-white/5 backdrop-blur-md sticky top-0 bg-[#080f0b]/60 z-50">
                    <Link to="/" className="flex items-center gap-3 group">
                        <img src="https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png" alt="Logo" className="w-10 h-10 group-hover:scale-105 transition-transform" />
                        <span className="text-xl tracking-wider uppercase hidden sm:block" style={{ color: '#C8A96E', letterSpacing: '0.12em', fontWeight: 600 }}>Everence Wealth</span>
                    </Link>
                    <div className="text-sm font-medium tracking-widest uppercase flex items-center gap-2" style={{ color: 'rgba(200,169,110,0.7)', letterSpacing: '0.14em' }}>
                        Broker Training <span className="hidden sm:inline">· Spring '26</span>
                    </div>
                </nav>

                {/* ═══ HERO: FULL-VIEWPORT CINEMATIC SPLIT ═══ */}
                <section className="relative overflow-hidden flex flex-col md:flex-row" style={{ minHeight: 'calc(100vh - 73px)', background: '#080f0b' }}>

                    {/* LEFT HALF — VIDEO PANEL */}
                    <div className="relative w-full md:w-[52%] flex-shrink-0" style={{ minHeight: 'auto' }}>
                        {/* Mobile: 16:9 aspect ratio. Desktop: fill full height */}
                        <div className="relative w-full h-0 pb-[56.25%] md:pb-0 md:absolute md:inset-0 md:h-full">
                            <video
                                ref={videoRef}
                                autoPlay
                                muted
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover object-center"
                                onEnded={(e) => { e.currentTarget.pause(); setVideoProgress(100); }}
                                onTimeUpdate={handleTimeUpdate}
                            >
                                <source src="https://assets.cdn.filesafe.space/htr97zzmRc1NMujHbL9R/media/69b228577fc07c6782abd388.mov" type="video/quicktime" />
                                <source src="https://assets.cdn.filesafe.space/htr97zzmRc1NMujHbL9R/media/69b228577fc07c6782abd388.mov" type="video/mp4" />
                            </video>

                            {/* Sound toggle */}
                            <button
                                onClick={toggleSound}
                                aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                                className="absolute flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer"
                                style={{
                                    bottom: '20px', right: '20px',
                                    width: '40px', height: '40px', zIndex: 10,
                                    background: 'rgba(0,0,0,0.6)',
                                    backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(200,169,110,0.5)',
                                    borderRadius: '0px',
                                }}
                            >
                                {isMuted ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M11 5L6 9H2V15H6L11 19V5Z" fill="#C8A96E" />
                                        <line x1="23" y1="9" x2="17" y2="15" stroke="#C8A96E" strokeWidth="1.5" strokeLinecap="round" />
                                        <line x1="17" y1="9" x2="23" y2="15" stroke="#C8A96E" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M11 5L6 9H2V15H6L11 19V5Z" fill="#C8A96E" />
                                        <path d="M15.54 8.46C16.48 9.4 17.01 10.67 17.01 12C17.01 13.33 16.48 14.6 15.54 15.54" stroke="#C8A96E" strokeWidth="1.5" strokeLinecap="round" style={{ animation: 'te-wave-pulse 1s ease-in-out infinite' }} />
                                        <path d="M18.07 5.93C19.78 7.64 20.74 9.87 20.74 12.19C20.74 14.51 19.78 16.74 18.07 18.45" stroke="#C8A96E" strokeWidth="1.5" strokeLinecap="round" style={{ animation: 'te-wave-pulse 1s ease-in-out infinite 0.3s' }} />
                                    </svg>
                                )}
                            </button>

                            {/* Video progress bar */}
                            <div className="absolute bottom-0 left-0 right-0" style={{ height: '2px', background: 'rgba(200,169,110,0.2)', zIndex: 10 }}>
                                <div style={{ height: '100%', background: '#C8A96E', width: `${videoProgress}%`, transition: 'width 0.3s linear' }} />
                            </div>
                        </div>
                    </div>

                    {/* Vertical gold divider (desktop only) */}
                    <div className="hidden md:block absolute top-0 bottom-0" style={{ left: '52%', width: '1px', background: 'rgba(200,169,110,0.2)', zIndex: 5 }} />

                    {/* RIGHT HALF — CONTENT PANEL */}
                    <div className="w-full md:w-[48%] flex flex-col justify-center p-7 md:p-16" style={{ background: '#080f0b', borderRadius: '20px', border: '1px solid rgba(200,169,110,0.1)', boxShadow: 'inset 0 0 60px rgba(0,0,0,0.3)' }}>
                        <div className="w-full max-w-[520px] mx-auto md:mx-0" style={{ padding: '0' }}>
                            {/* Desktop padding override */}
                            <div className="hidden md:block" style={{ position: 'absolute' }} />

                            {/* 1. EYEBROW */}
                            <p style={{
                                fontSize: '11px', letterSpacing: '0.28em', textTransform: 'uppercase',
                                color: '#C8A96E', marginBottom: '28px',
                                animation: 'te-fadeUp 400ms ease 200ms both',
                            }}>
                                INVITATION ONLY&ensp;·&ensp;NAPA, CA&ensp;·&ensp;MARCH 21, 2026
                            </p>

                            {/* 2. HEADLINE */}
                            <h1 style={{
                                fontFamily: "'Inter', system-ui, sans-serif",
                                fontWeight: 800, fontSize: 'clamp(32px, 3.6vw, 54px)', lineHeight: 1.08,
                                letterSpacing: '-0.04em',
                                color: '#FFFFFF', marginBottom: '20px',
                                textShadow: '0 2px 24px rgba(200,169,110,0.15)',
                                animation: 'te-fadeUp12 500ms ease 350ms both',
                            }}>
                                Your Strategy Has a Ceiling.<br />
                                This Day <span style={{
                                    background: 'linear-gradient(90deg, #C8A96E, #F5E6C8, #EDDB77, #C8A96E)',
                                    backgroundSize: '300% 100%',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    animation: 'te-gold-gradient-shift 4s ease infinite',
                                }}>Removes It</span>.
                            </h1>

                            {/* 3. SUBHEADLINE */}
                            <p style={{
                                fontFamily: "'GeistSans', 'Inter', system-ui, sans-serif",
                                fontSize: '16px', fontWeight: 300, lineHeight: 1.65,
                                letterSpacing: '0.01em',
                                color: 'rgba(255,255,255,0.6)', maxWidth: '400px', marginBottom: '40px',
                                animation: 'te-fadeIn 400ms ease 500ms both',
                            }}>
                                An exclusive full-day intensive at Andaz Napa for brokers ready to stop renting their strategy from carriers — and start owning their ceiling.
                            </p>

                            {/* 4. DATE + TIME ROW */}
                            <div className="flex items-center gap-6" style={{ marginBottom: '40px', animation: 'te-fadeIn 400ms ease 650ms both' }}>
                                <div>
                                    <p style={{ fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '4px' }}>DATE</p>
                                    <p style={{ fontSize: '13px', fontWeight: 500, color: '#FFFFFF' }}>Saturday, March 21</p>
                                </div>
                                <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.12)', flexShrink: 0 }} />
                                <div>
                                    <p style={{ fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '4px' }}>EVENT TIME</p>
                                    <p style={{ fontSize: '13px', fontWeight: 500, color: '#FFFFFF' }}>11:00 AM – 4:00 PM PT</p>
                                </div>
                            </div>

                            {/* 5. CTA BUTTON */}
                            <div style={{ animation: 'te-fadeIn 400ms ease 800ms both' }}>
                                <button
                                    onClick={() => setStep(1)}
                                    className="cursor-pointer"
                                    style={{
                                        width: '100%', maxWidth: '320px',
                                        background: '#C8A96E', color: '#1A4D3E',
                                        fontSize: '12px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const,
                                        padding: '18px 32px',
                                        border: 'none', borderRadius: '14px',
                                        boxShadow: '0 8px 32px rgba(200,169,110,0.35), 0 2px 8px rgba(0,0,0,0.4)',
                                        transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = '#b8996a'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(200,169,110,0.5), 0 4px 12px rgba(0,0,0,0.5)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = '#C8A96E'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(200,169,110,0.35), 0 2px 8px rgba(0,0,0,0.4)'; }}
                                    onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(200,169,110,0.3), 0 1px 4px rgba(0,0,0,0.3)'; }}
                                    onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(200,169,110,0.5), 0 4px 12px rgba(0,0,0,0.5)'; }}
                                >
                                    SECURE YOUR SEAT
                                </button>
                                <p style={{ fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginTop: '8px' }}>
                                    Strictly limited capacity. No walk-ins.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══ REGISTRATION MODAL (triggered by CTA) ═══ */}
                <AnimatePresence>
                    {step > 0 && step <= 3 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center"
                            style={{ background: 'rgba(8,15,11,0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
                            onClick={(e) => { if (e.target === e.currentTarget) setStep(0); }}
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.97 }}
                                transition={{ duration: 0.4, ease: 'easeOut' }}
                                className="relative w-full max-w-lg mx-4"
                            >
                                <div className="relative border border-white/10 p-6 sm:p-10 md:p-14 min-h-[320px] flex flex-col justify-center" style={{ background: '#0d1a14', borderRadius: '0px' }}>

                                    <AnimatePresence mode="wait">
                                        {step === 1 && (
                                            <motion.form
                                                key="step1" onSubmit={handleNext}
                                                variants={formVariants} initial="hidden" animate="visible" exit="exit"
                                                className="space-y-6"
                                            >
                                                <div className="space-y-4">
                                                    <h3 className="text-2xl font-semibold text-white">Let's start with your name</h3>
                                                    <Input
                                                        ref={inputRef}
                                                        required
                                                        value={formData.name}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                        className="bg-transparent border-0 border-b-2 border-white/20 text-white h-14 px-0 rounded-none focus-visible:ring-0 focus-visible:border-[#C8A96E] text-2xl placeholder:text-gray-600 transition-colors"
                                                        placeholder="John Doe"
                                                    />
                                                </div>
                                                <button type="submit" className="h-14 px-8 text-sm font-bold tracking-wider uppercase transition-colors duration-200 cursor-pointer" style={{ background: '#C8A96E', color: '#1A4D3E', border: 'none', borderRadius: '0px', letterSpacing: '0.1em' }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.background = '#b8996a'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.background = '#C8A96E'; }}
                                                >
                                                    Next Step
                                                </button>
                                            </motion.form>
                                        )}

                                        {step === 2 && (
                                            <motion.form
                                                key="step2" onSubmit={handleNext}
                                                variants={formVariants} initial="hidden" animate="visible" exit="exit"
                                                className="space-y-6"
                                            >
                                                <div className="space-y-4">
                                                    <h3 className="text-2xl font-semibold text-white leading-tight">Nice to meet you, <span style={{ color: '#C8A96E' }}>{formData.name.split(' ')[0]}</span>.<br />What's your professional email?</h3>
                                                    <Input
                                                        ref={inputRef}
                                                        required type="email"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                                        className="bg-transparent border-0 border-b-2 border-white/20 text-white h-14 px-0 rounded-none focus-visible:ring-0 focus-visible:border-[#C8A96E] text-2xl placeholder:text-gray-600 transition-colors"
                                                        placeholder="john@example.com"
                                                    />
                                                </div>
                                                <div className="flex gap-3">
                                                    <button type="button" onClick={() => setStep(1)} className="h-14 w-14 flex items-center justify-center border border-white/20 text-white transition-colors duration-200 cursor-pointer" style={{ background: 'transparent', borderRadius: '0px' }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                                    >
                                                        <ChevronLeft className="w-5 h-5" />
                                                    </button>
                                                    <button type="submit" className="h-14 px-8 text-sm font-bold tracking-wider uppercase transition-colors duration-200 cursor-pointer" style={{ background: '#C8A96E', color: '#1A4D3E', border: 'none', borderRadius: '0px', letterSpacing: '0.1em' }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.background = '#b8996a'; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.background = '#C8A96E'; }}
                                                    >
                                                        Next Step
                                                    </button>
                                                </div>
                                            </motion.form>
                                        )}

                                        {step === 3 && (
                                            <motion.form
                                                key="step3" onSubmit={handleNext}
                                                variants={formVariants} initial="hidden" animate="visible" exit="exit"
                                                className="space-y-6"
                                            >
                                                <div className="space-y-4">
                                                    <h3 className="text-2xl font-semibold text-white">Finally, the best number to reach you?</h3>
                                                    <Input
                                                        ref={inputRef}
                                                        required type="tel"
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                                        className="bg-transparent border-0 border-b-2 border-white/20 text-white h-14 px-0 rounded-none focus-visible:ring-0 focus-visible:border-[#C8A96E] text-2xl placeholder:text-gray-600 transition-colors"
                                                        placeholder="(555) 123-4567"
                                                    />
                                                </div>
                                                <div className="flex gap-3">
                                                    <button type="button" onClick={() => setStep(2)} disabled={loading} className="h-14 w-14 flex items-center justify-center border border-white/20 text-white transition-colors duration-200 cursor-pointer disabled:opacity-50" style={{ background: 'transparent', borderRadius: '0px' }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                                    >
                                                        <ChevronLeft className="w-5 h-5" />
                                                    </button>
                                                    <button type="submit" disabled={loading} className="h-14 flex-1 text-sm font-bold tracking-wider uppercase transition-colors duration-200 cursor-pointer disabled:opacity-70" style={{ background: '#1A4D3E', color: '#FFFFFF', border: 'none', borderRadius: '0px', letterSpacing: '0.1em' }}
                                                        onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#143d30'; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.background = '#1A4D3E'; }}
                                                    >
                                                        {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Confirm Registration'}
                                                    </button>
                                                </div>
                                                <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.3)', marginTop: '8px' }}>
                                                    We'll send reminders via email leading up to March 21.
                                                </p>
                                            </motion.form>
                                        )}
                                    </AnimatePresence>

                                    {/* Progress Indicator */}
                                    <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="transition-all duration-500" style={{
                                                height: '2px', borderRadius: '0px',
                                                width: step >= i ? '32px' : '8px',
                                                background: step >= i ? '#C8A96E' : 'rgba(255,255,255,0.2)',
                                            }} />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Detailed Info Splat */}
                <section className="bg-black/40 backdrop-blur-md border-t border-b border-white/5 py-12 sm:py-16 lg:py-24 relative z-10">
                    <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
                        <div className="grid lg:grid-cols-2 gap-10 lg:gap-20">

                            {/* Left Side: Image and About */}
                            <div className="space-y-10">
                                <div className="relative rounded-[2rem] overflow-hidden group shadow-2xl border border-white/10">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                                    <img
                                        src="/andaz-napa.png"
                                        alt="Andaz Napa Hotel Exterior"
                                        className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute bottom-0 left-0 p-8 z-20">
                                        <p className="text-[#C5A059] uppercase tracking-widest text-xs font-bold mb-2">The Venue</p>
                                        <h3 className="text-3xl font-serif text-white">Andaz Napa</h3>
                                        <p className="text-gray-300 mt-1">1450 First St, Napa, California</p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xs uppercase tracking-widest font-bold text-[#C5A059] mb-4">About This Event</h3>
                                    <div className="space-y-4 text-gray-300 text-lg font-light leading-relaxed">
                                        <p>
                                            Join Everence Wealth Management for an exclusive Broker Training session at the distinguished Andaz Napa. This focused, full-day program is designed to deepen your expertise in values-based financial planning, strengthen client engagement strategies, and expand your knowledge of Everence's comprehensive product suite.
                                        </p>
                                        <p>
                                            Set in the heart of Napa Valley, this event combines world-class professional development with the warmth and hospitality of one of California's most celebrated destinations.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Session Highlights */}
                            <div className="lg:pl-10">
                                <div className="sticky top-32">
                                    <h3 className="text-xs uppercase tracking-widest font-bold text-[#C5A059] mb-8">Session Highlights</h3>

                                    <div className="space-y-6">
                                        {sessionHighlights.map((highlight, index) => (
                                            <div key={index} className="flex gap-6 group">
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/10 shrink-0 flex items-center justify-center bg-white/[0.02] group-hover:border-[#C5A059]/50 group-hover:bg-[#C5A059]/5 transition-colors">
                                                    <span className="text-[#C5A059] font-medium text-sm">0{index + 1}</span>
                                                </div>
                                                <div className="border-b border-white/5 pb-6 flex-1 pt-3">
                                                    <h4 className="text-white text-xl font-medium group-hover:text-[#C5A059] transition-colors">
                                                        {highlight.title}
                                                    </h4>
                                                    {highlight.time && (
                                                        <p className="text-gray-400 mt-2 text-sm flex items-center gap-2">
                                                            <Clock className="w-4 h-4 text-[#C5A059]" /> {highlight.time}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-12 bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between">
                                        <div>
                                            <p className="text-white font-medium">Ready to reserve your spot?</p>
                                            <p className="text-gray-400 text-sm">Don't miss out on this exclusive event.</p>
                                        </div>
                                        <Button
                                            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                                            className="bg-[#C5A059] hover:bg-[#b08e4f] text-black rounded-full"
                                        >
                                            Register Now
                                        </Button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* Footer Minimal */}
                <footer className="py-10 text-center border-t border-white/5 bg-[#0A120F] relative z-20">
                    <img src="https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png" alt="Logo" className="w-8 h-8 opacity-50 mx-auto mb-4" />
                    <p className="text-gray-600 text-sm">&copy; {new Date().getFullYear()} Everence Wealth Management. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
}
