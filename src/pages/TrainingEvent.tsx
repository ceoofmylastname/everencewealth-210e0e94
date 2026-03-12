import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
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

    const toggleSound = useCallback(() => {
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(videoRef.current.muted);
        }
    }, []);

    const { scrollY } = useScroll();
    const y2 = useTransform(scrollY, [0, 1000], [0, -100]);

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
        <div className="min-h-screen bg-[#0a140e] text-white selection:bg-[#C5A059] selection:text-black font-sans relative overflow-x-hidden">
            {/* Noise texture overlay */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.035]" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat',
                backgroundSize: '128px 128px'
            }} />

            {/* Sound toggle pulse animation */}
            <style>{`
                @keyframes te-sound-pulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(200,169,110,0.4); }
                    50% { box-shadow: 0 0 0 8px rgba(200,169,110,0); }
                }
            `}</style>

            <div className="relative z-10">
                {/* Navbar */}
                <nav className="p-4 md:p-6 md:px-12 flex items-center justify-between border-b border-white/5 backdrop-blur-md sticky top-0 bg-[#0A120F]/60 z-50">
                    <Link to="/" className="flex items-center gap-3 group">
                        <img src="https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png" alt="Logo" className="w-10 h-10 group-hover:scale-105 transition-transform" />
                        <span className="font-serif text-xl tracking-wider uppercase text-[#C5A059] hidden sm:block">Everence Wealth</span>
                    </Link>
                    <div className="text-sm font-medium tracking-widest text-[#C5A059]/70 uppercase flex items-center gap-2">
                        Broker Training <span className="hidden sm:inline">• Spring '26</span>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="container mx-auto px-4 sm:px-6 pt-6 pb-6 lg:pt-20 lg:pb-24 grid lg:grid-cols-[11fr_9fr] gap-8 lg:gap-12 items-start min-h-[auto] lg:min-h-[85vh]">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="space-y-5 sm:space-y-8"
                    >
                        {/* Video Container — the star of the page */}
                        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9', borderRadius: '2px', border: '1px solid rgba(200,169,110,0.2)' }}>
                            <video
                                ref={videoRef}
                                autoPlay
                                muted
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover"
                                onEnded={(e) => { e.currentTarget.pause(); }}
                            >
                                <source src="https://assets.cdn.filesafe.space/htr97zzmRc1NMujHbL9R/media/69b228577fc07c6782abd388.mov" type="video/quicktime" />
                                <source src="https://assets.cdn.filesafe.space/htr97zzmRc1NMujHbL9R/media/69b228577fc07c6782abd388.mov" type="video/mp4" />
                            </video>
                            {/* Vignette overlay */}
                            <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 60px rgba(0,0,0,0.5)' }} />
                            {/* Sound toggle — bottom-right of video */}
                            <button
                                onClick={toggleSound}
                                aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                                className="absolute flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer"
                                style={{
                                    bottom: '12px',
                                    right: '12px',
                                    width: '38px',
                                    height: '38px',
                                    zIndex: 10,
                                    background: 'rgba(0,0,0,0.55)',
                                    backdropFilter: 'blur(8px)',
                                    WebkitBackdropFilter: 'blur(8px)',
                                    border: '1px solid rgba(200,169,110,0.4)',
                                    borderRadius: '0px',
                                    animation: !isMuted ? 'te-sound-pulse 2s ease-in-out infinite' : 'none',
                                }}
                            >
                                {isMuted ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M11 5L6 9H2V15H6L11 19V5Z" fill="#C8A96E" />
                                        <line x1="23" y1="9" x2="17" y2="15" stroke="#C8A96E" strokeWidth="2" strokeLinecap="round" />
                                        <line x1="17" y1="9" x2="23" y2="15" stroke="#C8A96E" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M11 5L6 9H2V15H6L11 19V5Z" fill="#C8A96E" />
                                        <path d="M15.54 8.46C16.48 9.4 17.01 10.67 17.01 12C17.01 13.33 16.48 14.6 15.54 15.54" stroke="#C8A96E" strokeWidth="2" strokeLinecap="round" />
                                        <path d="M18.07 5.93C19.78 7.64 20.74 9.87 20.74 12.19C20.74 14.51 19.78 16.74 18.07 18.45" stroke="#C8A96E" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        <div className="inline-flex items-center gap-2 px-2.5 py-1 sm:px-4 sm:py-2 rounded-full border border-[#C5A059]/30 bg-[#C5A059]/10 text-[#C5A059] text-[0.65rem] sm:text-sm uppercase tracking-widest font-semibold backdrop-blur-md">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C5A059] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C5A059]"></span>
                            </span>
                            Cordially Invites You
                        </div>

                        {/* Scroll-stopping animated gradient headline */}
                        <h1 className="text-[1.85rem] leading-[1.15] sm:text-4xl md:text-6xl lg:text-7xl font-serif font-bold tracking-[-0.02em] sm:tracking-tight">
                            Does Your Strategy<br className="sm:hidden" /> Have a{' '}
                            <span className="relative inline-block">
                                <span className="text-transparent bg-clip-text animate-gradient bg-[length:200%_auto] bg-gradient-to-r from-[#C5A059] via-[#F2E0B2] to-[#C5A059]">
                                    Ceiling
                                </span>
                                {/* Modern slash underline */}
                                <svg className="absolute -bottom-1 sm:-bottom-2 left-0 w-full" viewBox="0 0 120 8" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                                    <path d="M2 6C20 2 40 1.5 60 3C80 4.5 100 3 118 1" stroke="#C5A059" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
                                </svg>
                            </span>?<br className="sm:hidden" /> This Day{' '}<br />
                            <span className="bg-[#C5A059]/20 px-2 sm:px-3 py-px rounded-md" style={{ boxDecorationBreak: 'clone' }}>Removes It</span>.
                        </h1>

                        <p className="text-[0.9rem] leading-relaxed sm:text-lg md:text-xl lg:text-2xl text-gray-300 font-light">
                            Join Everence Wealth at Andaz Napa for a full-day intensive designed to sharpen your strategy, expand your carrier access, and position you ahead of brokers still playing the old game.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 pt-2 sm:pt-4">
                            <div className="flex gap-3 sm:gap-4 items-start">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0 backdrop-blur-md shadow-lg shadow-black/20">
                                    <Calendar className="w-5 h-5 text-[#C5A059]" />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium text-base sm:text-lg">March 21, 2026</h4>
                                    <p className="text-[#C5A059] text-sm font-medium uppercase tracking-wider">Saturday</p>
                                </div>
                            </div>
                            <div className="flex gap-3 sm:gap-4 items-start">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0 backdrop-blur-md shadow-lg shadow-black/20">
                                    <Clock className="w-5 h-5 text-[#C5A059]" />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium text-base sm:text-lg">Registration: 10:30 AM</h4>
                                    <h4 className="text-white font-medium text-base sm:text-lg">Event: 11:00 AM – 4:00 PM</h4>
                                    <p className="text-[#C5A059] text-sm font-medium uppercase tracking-wider">Pacific Time</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Interactive Typeform Registration Block */}
                    <motion.div
                        style={{ y: y2 }}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative w-full max-w-lg mx-auto lg:ml-auto"
                    >
                        {/* Glowing effect behind form */}
                        <div className="absolute inset-0 bg-[#C5A059] blur-[120px] opacity-[0.15] rounded-full pointer-events-none" />

                        <div className="relative bg-[#111A16]/80 backdrop-blur-3xl border border-white/10 p-5 sm:p-8 md:p-12 rounded-[2rem] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] min-h-[280px] sm:min-h-[400px] flex flex-col justify-center">

                            <AnimatePresence mode="wait">
                                {step === 0 && (
                                    <motion.div
                                        key="step0"
                                        variants={formVariants}
                                        initial="hidden" animate="visible" exit="exit"
                                        className="text-center space-y-8"
                                    >
                                        <div className="neon-border w-24 h-24 sm:w-28 sm:h-28 mx-auto shadow-[0_12px_40px_-8px_rgba(197,160,89,0.3)] rounded-2xl">
                                            <img
                                                src="/andaz-napa.png"
                                                alt="Andaz Napa"
                                                className="w-full h-full object-cover rounded-[21px] relative z-0"
                                            />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl sm:text-3xl font-serif text-white mb-3">Andaz Napa</h3>
                                            <p className="text-gray-400 text-lg">Napa Valley, California</p>
                                        </div>
                                        <Button
                                            onClick={() => setStep(1)}
                                            className="w-full h-14 sm:h-16 bg-[#C5A059] hover:bg-[#b08e4f] text-black font-semibold text-lg sm:text-xl rounded-2xl shadow-[0_0_30px_rgba(197,160,89,0.2)] transition-all hover:shadow-[0_0_40px_rgba(197,160,89,0.4)] group"
                                        >
                                            Secure Your Seat
                                            <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                        <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Strictly Limited Capacity</p>
                                    </motion.div>
                                )}

                                {step === 1 && (
                                    <motion.form
                                        key="step1" onSubmit={handleNext}
                                        variants={formVariants} initial="hidden" animate="visible" exit="exit"
                                        className="space-y-6"
                                    >
                                        <div className="space-y-4">
                                            <h3 className="text-2xl font-serif text-white">Let's start with your name</h3>
                                            <Input
                                                ref={inputRef}
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                className="bg-transparent border-0 border-b-2 border-white/20 text-white h-14 px-0 rounded-none focus-visible:ring-0 focus-visible:border-[#C5A059] text-2xl placeholder:text-gray-600 transition-colors"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <Button type="submit" className="h-14 px-8 bg-white text-black hover:bg-gray-200 rounded-full font-semibold group rounded-r-full">
                                            Next Step <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </motion.form>
                                )}

                                {step === 2 && (
                                    <motion.form
                                        key="step2" onSubmit={handleNext}
                                        variants={formVariants} initial="hidden" animate="visible" exit="exit"
                                        className="space-y-6"
                                    >
                                        <div className="space-y-4">
                                            <h3 className="text-2xl font-serif text-white leading-tight">Nice to meet you, <span className="text-[#C5A059]">{formData.name.split(' ')[0]}</span>. <br />What's your professional email?</h3>
                                            <Input
                                                ref={inputRef}
                                                required type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                                className="bg-transparent border-0 border-b-2 border-white/20 text-white h-14 px-0 rounded-none focus-visible:ring-0 focus-visible:border-[#C5A059] text-2xl placeholder:text-gray-600 transition-colors"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            <Button type="button" variant="outline" onClick={() => setStep(1)} className="h-14 w-14 rounded-full p-0 flex items-center justify-center border-white/20 text-white hover:bg-white/10 bg-transparent">
                                                <ChevronLeft className="w-5 h-5" />
                                            </Button>
                                            <Button type="submit" className="h-14 px-8 bg-white text-black hover:bg-gray-200 rounded-full font-semibold group">
                                                Next Step <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                                            </Button>
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
                                            <h3 className="text-2xl font-serif text-white">Finally, the best number to reach you?</h3>
                                            <Input
                                                ref={inputRef}
                                                required type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                                className="bg-transparent border-0 border-b-2 border-white/20 text-white h-14 px-0 rounded-none focus-visible:ring-0 focus-visible:border-[#C5A059] text-2xl placeholder:text-gray-600 transition-colors"
                                                placeholder="(555) 123-4567"
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            <Button type="button" variant="outline" onClick={() => setStep(2)} disabled={loading} className="h-14 w-14 rounded-full p-0 flex items-center justify-center border-white/20 text-white hover:bg-white/10 bg-transparent">
                                                <ChevronLeft className="w-5 h-5" />
                                            </Button>
                                            <Button type="submit" disabled={loading} className="h-14 flex-1 bg-[#1A4D3E] hover:bg-[#143d30] text-white rounded-full font-bold text-lg shadow-[0_0_20px_rgba(26,77,62,0.5)] transition-shadow hover:shadow-[0_0_30px_rgba(26,77,62,0.7)] group">
                                                {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> :
                                                    <div className="flex items-center justify-center">
                                                        Confirm Registration <Check className="w-5 h-5 ml-2" />
                                                    </div>}
                                            </Button>
                                        </div>
                                        <p className="text-center text-xs text-gray-500 mt-2">
                                            We'll send reminders via email leading up to March 21.
                                        </p>
                                    </motion.form>
                                )}
                            </AnimatePresence>

                            {/* Progress Indicator */}
                            {step > 0 && (
                                <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'w-8 bg-[#C5A059]' : 'w-2 bg-white/20'}`} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </section>

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
