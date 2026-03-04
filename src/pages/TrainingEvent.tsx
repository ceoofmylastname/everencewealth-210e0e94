import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, Calendar, MapPin, Clock, Loader2, CheckCircle2 } from "lucide-react";

export default function TrainingEvent() {
    const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 1000], [0, 300]);
    const y2 = useTransform(scrollY, [0, 1000], [0, -200]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#0F1C18] flex items-center justify-center p-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/training-hero.png"
                        alt="Training Event"
                        className="w-full h-full object-cover opacity-20 filter blur-sm"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F1C18] via-[#0F1C18]/80 to-transparent" />
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
                        Your registration for the Everence Wealth Training Event is confirmed. We will send you reminders as the event approaches.
                    </p>
                    <Link to="/">
                        <Button className="bg-[#C5A059] hover:bg-[#b08e4f] text-black rounded-full px-8 h-12 text-lg font-medium">
                            Return Home
                        </Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0F1C18] text-white selection:bg-[#C5A059] selection:text-black font-sans relative">
            {/* Background Hero with Parallax */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <motion.div style={{ y: y1 }} className="absolute inset-0 w-full h-[120vh] -top-[10vh]">
                    <img
                        src="/training-hero.png"
                        alt="Corporate Training Event"
                        className="w-full h-full object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0F1C18]/70 to-[#0F1C18] pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0F1C18] via-transparent to-[#0F1C18] pointer-events-none" />
                </motion.div>
            </div>

            <div className="relative z-10">
                {/* Navbar (Minimal) */}
                <nav className="p-6 md:px-12 flex items-center justify-between border-b border-white/5 backdrop-blur-md sticky top-0 bg-[#0F1C18]/50">
                    <Link to="/" className="flex items-center gap-3">
                        <img src="https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png" alt="Logo" className="w-10 h-10" />
                        <span className="font-serif text-xl tracking-wider uppercase text-[#C5A059] hidden sm:block">Everence Wealth</span>
                    </Link>
                    <div className="text-sm font-medium tracking-widest text-gray-400 uppercase">Broker Training • Spring '26</div>
                </nav>

                {/* Hero Section */}
                <section className="container mx-auto px-6 pt-24 pb-12 lg:pt-32 lg:pb-24 grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
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
                            Exclusive Invitation
                        </div>

                        <h1 className="text-5xl md:text-7xl font-serif leading-tight">
                            Elevate Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C5A059] to-[#E2C792]">Broker Status</span>
                        </h1>

                        <p className="text-xl text-gray-400 leading-relaxed max-w-lg font-light">
                            Join Everence Wealth Management for a focused, full-day program designed to deepen your expertise in values-based financial planning and expand your knowledge.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-6 pt-4">
                            <div className="flex gap-4 items-start">
                                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 backdrop-blur-sm">
                                    <Calendar className="w-5 h-5 text-[#C5A059]" />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium">March 21, 2026</h4>
                                    <p className="text-gray-400 text-sm">Saturday</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 backdrop-blur-sm">
                                    <Clock className="w-5 h-5 text-[#C5A059]" />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium">11:00 AM - 4:00 PM</h4>
                                    <p className="text-gray-400 text-sm">Pacific Time</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start sm:col-span-2">
                                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 backdrop-blur-sm">
                                    <MapPin className="w-5 h-5 text-[#C5A059]" />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium">Andaz Napa</h4>
                                    <p className="text-gray-400 text-sm">Napa Valley, California</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Form Section */}
                    <motion.div
                        style={{ y: y2 }}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-[#C5A059] blur-[100px] opacity-20 rounded-full" />
                        <div className="relative bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-8 md:p-12 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
                            <div className="mb-8">
                                <h3 className="text-2xl font-serif text-white mb-2">Secure Your Seat</h3>
                                <p className="text-gray-400 text-sm">Spaces are highly limited. Register now to attend.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Full Name</label>
                                    <Input
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="bg-black/20 border-white/10 text-white h-12 px-4 rounded-xl focus-visible:ring-[#C5A059] focus-visible:border-transparent placeholder:text-gray-600 backdrop-blur-sm"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Professional Email</label>
                                    <Input
                                        required
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        className="bg-black/20 border-white/10 text-white h-12 px-4 rounded-xl focus-visible:ring-[#C5A059] focus-visible:border-transparent placeholder:text-gray-600 backdrop-blur-sm"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Phone Number</label>
                                    <Input
                                        required
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                        className="bg-black/20 border-white/10 text-white h-12 px-4 rounded-xl focus-visible:ring-[#C5A059] focus-visible:border-transparent placeholder:text-gray-600 backdrop-blur-sm"
                                        placeholder="(555) 123-4567"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-14 bg-gradient-to-r from-[#C5A059] to-[#E2C792] hover:from-[#b08e4f] hover:to-[#C5A059] text-black font-semibold text-lg rounded-xl shadow-[0_0_20px_rgba(197,160,89,0.3)] transition-all hover:shadow-[0_0_30px_rgba(197,160,89,0.5)] group"
                                >
                                    {loading ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <>
                                            Confirm Attendance
                                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </Button>
                                <p className="text-center text-xs text-gray-500 mt-4">
                                    By registering, you agree to receive training updates and reminders via email.
                                </p>
                            </form>
                        </div>
                    </motion.div>
                </section>
            </div>
        </div>
    );
}
