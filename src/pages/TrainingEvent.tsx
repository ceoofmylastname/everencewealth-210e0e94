import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, Calendar, MapPin, Clock, Loader2, CheckCircle2, ChevronRight, Check } from "lucide-react";

const sessionHighlights = [
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

    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 1000], [0, 250]);
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

    if (success) {
        return (
            <div className="min-h-screen bg-[#0A120F] flex items-center justify-center p-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/training-hero.png"
                        alt="Training Event"
                        className="w-full h-full object-cover opacity-20 filter blur-sm"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A120F] via-[#0A120F]/80 to-[#0A120F]/40" />
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 max-w-xl bg-white/5 backdrop-blur-2xl border border-white/10 p-12 rounded-[2rem] shadow-[0_0_60px_-15px_rgba(197,160,89,0.3)]"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                        className="w-20 h-20 bg-[#1A4D3E] rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                        <CheckCircle2 className="w-10 h-10 text-[#C5A059]" />
                    </motion.div>
                    <h1 className="text-4xl font-serif text-white mb-4">You're on the list.</h1>
                    <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                        Your registration for the Everence Wealth Broker Training at Andaz Napa is confirmed. We will send you reminders as the event approaches.
                    </p>
                    <Link to="/">
                        <Button className="bg-[#C5A059] hover:bg-[#b08e4f] text-black rounded-full px-8 h-12 text-lg font-medium transition-colors">
                            Return Home
                        </Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    // Animation variants for Typeform-like multi-step
    const formVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } }
    };

    return (
        <div className="min-h-screen bg-[#0A120F] text-white selection:bg-[#C5A059] selection:text-black font-sans relative overflow-x-hidden">
            {/* Background Parallax */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <motion.div style={{ y: y1 }} className="absolute inset-0 w-full h-[120vh] -top-[10vh]">
                    <img
                        src="/training-hero.png"
                        alt="Corporate Training Event"
                        className="w-full h-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A120F]/80 to-[#0A120F] pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0A120F] via-transparent to-[#0A120F] pointer-events-none" />
                </motion.div>
            </div>

            <div className="relative z-10">
                {/* Navbar */}
                <nav className="p-6 md:px-12 flex items-center justify-between border-b border-white/5 backdrop-blur-md sticky top-0 bg-[#0A120F]/60 z-50">
                    <Link to="/" className="flex items-center gap-3 group">
                        <img src="https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png" alt="Logo" className="w-10 h-10 group-hover:scale-105 transition-transform" />
                        <span className="font-serif text-xl tracking-wider uppercase text-[#C5A059] hidden sm:block">Everence Wealth</span>
                    </Link>
                    <div className="text-sm font-medium tracking-widest text-[#C5A059]/70 uppercase flex items-center gap-2">
                        Broker Training <span className="hidden sm:inline">• Spring '26</span>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="container mx-auto px-6 pt-20 pb-12 lg:pt-32 lg:pb-24 grid lg:grid-cols-2 gap-16 lg:gap-24 items-center min-h-[85vh]">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="space-y-8"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#C5A059]/30 bg-[#C5A059]/10 text-[#C5A059] text-sm uppercase tracking-widest font-semibold backdrop-blur-md">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C5A059] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C5A059]"></span>
                            </span>
                            Cordially Invites You
                        </div>

                        {/* Scroll-stopping animated gradient headline */}
                        <h1 className="text-6xl md:text-8xl font-serif leading-[1.1] font-bold tracking-tight">
                            Master the<br />
                            <span className="text-transparent bg-clip-text animate-gradient bg-[length:200%_auto] bg-gradient-to-r from-[#C5A059] via-[#F2E0B2] to-[#C5A059]">
                                Index Strategy
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-gray-300 leading-relaxed font-light">
                            Deepen your expertise in values-based financial planning and elevate your broker status at our exclusive, full-day training.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-6 pt-4">
                            <div className="flex gap-4 items-start">
                                <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0 backdrop-blur-md shadow-lg shadow-black/20">
                                    <Calendar className="w-5 h-5 text-[#C5A059]" />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium text-lg">March 21, 2026</h4>
                                    <p className="text-[#C5A059] text-sm font-medium uppercase tracking-wider">Saturday</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0 backdrop-blur-md shadow-lg shadow-black/20">
                                    <Clock className="w-5 h-5 text-[#C5A059]" />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium text-lg">11:00 AM - 4:00 PM</h4>
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

                        <div className="relative bg-[#111A16]/80 backdrop-blur-3xl border border-white/10 p-8 md:p-12 rounded-[2rem] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] min-h-[400px] flex flex-col justify-center">

                            <AnimatePresence mode="wait">
                                {step === 0 && (
                                    <motion.div
                                        key="step0"
                                        variants={formVariants}
                                        initial="hidden" animate="visible" exit="exit"
                                        className="text-center space-y-8"
                                    >
                                        <div className="w-20 h-20 bg-gradient-to-br from-[#1A4D3E] to-[#0A120F] rounded-2xl flex items-center justify-center mx-auto border border-white/10 shadow-2xl">
                                            <MapPin className="w-8 h-8 text-[#C5A059]" />
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-serif text-white mb-3">Andaz Napa</h3>
                                            <p className="text-gray-400 text-lg">Napa Valley, California</p>
                                        </div>
                                        <Button
                                            onClick={() => setStep(1)}
                                            className="w-full h-16 bg-[#C5A059] hover:bg-[#b08e4f] text-black font-semibold text-xl rounded-2xl shadow-[0_0_30px_rgba(197,160,89,0.2)] transition-all hover:shadow-[0_0_40px_rgba(197,160,89,0.4)] group"
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
                <section className="bg-black/40 backdrop-blur-md border-t border-b border-white/5 py-24 relative z-10">
                    <div className="container mx-auto px-6 max-w-7xl">
                        <div className="grid lg:grid-cols-2 gap-20">

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
                                                <div className="w-12 h-12 rounded-full border border-white/10 shrink-0 flex items-center justify-center bg-white/[0.02] group-hover:border-[#C5A059]/50 group-hover:bg-[#C5A059]/5 transition-colors">
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
