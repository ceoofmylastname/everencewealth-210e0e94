import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RecruitHeader } from '../components/recruit/RecruitHeader';
import { RecruitHero } from '../components/recruit/RecruitHero';
import { StarField } from '../components/recruit/StarField';
import { ProducerAudit } from '../components/recruit/ProducerAudit';
import { GoldConfetti } from '../components/recruit/GoldConfetti';
import { supabase } from '@/integrations/supabase/client';
import { Shield, XOctagon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type AuditResult = 'none' | 'passed' | 'failed';

const PASS_THRESHOLD = 35; // Out of 40 max
const MAX_SCORE = 40;

const Recruit: React.FC = () => {
    const navigate = useNavigate();
    const [isAuditOpen, setIsAuditOpen] = useState(false);
    const [auditResult, setAuditResult] = useState<AuditResult>('none');
    const [finalScore, setFinalScore] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);
    const [leadForm, setLeadForm] = useState({ firstName: '', lastName: '', email: '', phone: '', comments: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [savedLabels, setSavedLabels] = useState<Record<number, string>>({});

    const handleBeginAudit = () => {
        setIsAuditOpen(true);
    };

    const handleAuditComplete = useCallback((score: number, answers: Record<number, number>, answerLabels: Record<number, string>) => {
        setIsAuditOpen(false);
        setFinalScore(score);
        setSavedLabels(answerLabels);

        // Score is stored internally but everyone sees the submission form
        setAuditResult('passed');
        setShowConfetti(true);
        setShowResultModal(true);
    }, []);

    const handleSubmitLead = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const fullName = `${leadForm.firstName} ${leadForm.lastName}`.trim();

        try {
            // Store lead in Supabase
            const { error } = await (supabase as any).from('recruit_leads').insert({
                name: fullName,
                email: leadForm.email,
                phone: leadForm.phone,
                audit_score: finalScore,
                video_watch_time: 0,
                // Supabase expects a javascript object for jsonb columns
                audit_answers: { ...savedLabels, comments: leadForm.comments },
            });

            if (error) {
                console.error('Supabase error:', error);

                // If it's the missing table error, log it specifically
                if (error.code === 'PGRST205') {
                    toast({
                        title: "Database Sync Error",
                        description: "The recruit_leads table was not found. Please verify database migrations.",
                        variant: "destructive"
                    });
                } else {
                    toast({
                        title: "System Error",
                        description: "There was a problem saving your audit. You are being redirected.",
                        variant: "destructive"
                    });
                }
            }

            // Navigate to private masterclass briefing
            navigate('/briefing', { state: { authorized: true, score: finalScore, name: fullName, answers: savedLabels } });
        } catch (err) {
            console.error('Error submitting lead:', err);
            toast({
                title: "System Connection Error",
                description: "Failed to connect to the secure server.",
                variant: "destructive"
            });
            navigate('/briefing', { state: { authorized: true, score: finalScore, name: fullName, answers: savedLabels } });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen overflow-hidden" style={{ background: '#050505' }}>
            {/* Star field background */}
            <StarField />

            {/* Mesh gradient overlays */}
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
                <div
                    className="absolute w-[60vw] h-[60vw] rounded-full"
                    style={{
                        top: '10%',
                        left: '-15%',
                        background: 'radial-gradient(circle, rgba(18, 28, 22, 0.3) 0%, transparent 70%)',
                        filter: 'blur(100px)',
                    }}
                />
                <div
                    className="absolute w-[50vw] h-[50vw] rounded-full"
                    style={{
                        bottom: '5%',
                        right: '-10%',
                        background: 'radial-gradient(circle, rgba(212, 175, 55, 0.04) 0%, transparent 70%)',
                        filter: 'blur(120px)',
                    }}
                />
            </div>

            {/* Film grain overlay */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
                style={{
                    zIndex: 3,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    backgroundSize: '128px 128px',
                }}
            />

            {/* Scan line */}
            <div className="scan-line" style={{ zIndex: 4 }} />

            {/* Header */}
            <RecruitHeader />

            {/* Hero */}
            <RecruitHero onBeginAudit={handleBeginAudit} />

            {/* Lifestyle Blueprint Audit Modal */}
            <ProducerAudit
                isOpen={isAuditOpen}
                onClose={() => setIsAuditOpen(false)}
                onComplete={handleAuditComplete}
            />

            {/* Gold Dust Confetti Explosion */}
            <GoldConfetti trigger={showConfetti} />

            {/* Result Modal */}
            <AnimatePresence>
                {showResultModal && (
                    <motion.div
                        className="fixed inset-0 z-[300] flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="absolute inset-0 bg-black/85 backdrop-blur-lg" />

                        <motion.div
                            className={`relative w-full max-w-lg rounded-[24px] p-8 md:p-10 ${auditResult === 'passed' ? 'neon-border floating-card' : ''}`}
                            style={{
                                background: 'linear-gradient(145deg, rgba(18, 28, 22, 0.98), rgba(5, 5, 5, 0.99))',
                                border: auditResult === 'passed' ? 'none' : '1px solid rgba(220, 38, 38, 0.2)',
                                boxShadow: auditResult === 'passed'
                                    ? '0 30px 80px rgba(0,0,0,0.6), 0 0 60px rgba(212, 175, 55, 0.15)'
                                    : '0 0 100px rgba(220, 38, 38, 0.05), 0 0 200px rgba(0,0,0,0.5)',
                            }}
                            initial={{ scale: 0.8, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0, y: 40 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                        >
                            {/* ===================================== */}
                            {/* LEAD CAPTURE FORM (NO SCORE SHOWN)    */}
                            {/* ===================================== */}
                            <div className="text-center">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
                                    className="w-20 h-20 mx-auto mb-6 rounded-full border-2 border-[#D4AF37]/40 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 flex items-center justify-center"
                                    style={{ boxShadow: '0 0 40px rgba(212, 175, 55, 0.25)' }}
                                >
                                    <Shield className="w-10 h-10 text-[#D4AF37]" />
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <p className="text-[10px] tracking-[0.4em] uppercase gold-shimmer-text font-bold mb-2">
                                        Blueprint Complete
                                    </p>
                                    <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2 neon-glow"
                                        style={{
                                            fontFamily: "'Inter Tight', sans-serif",
                                            background: 'linear-gradient(135deg, #D4AF37, #FFF5AD, #D4AF37)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            filter: 'drop-shadow(0 0 20px rgba(212, 175, 55, 0.4))',
                                        }}
                                    >
                                        CONFIRMED
                                    </h2>
                                    <p className="text-sm text-[#E2E8F0]/60 mb-6 font-medium">
                                        Complete your profile to unlock access.
                                    </p>
                                </motion.div>

                                {/* Lead capture form */}
                                <motion.form
                                    onSubmit={handleSubmitLead}
                                    className="space-y-4"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <div className="flex gap-4">
                                        <input
                                            type="text"
                                            required
                                            placeholder="First Name"
                                            value={leadForm.firstName}
                                            onChange={e => setLeadForm(prev => ({ ...prev, firstName: e.target.value }))}
                                            className="w-1/2 px-5 py-3.5 rounded-[24px] carved-input text-[#E2E8F0] text-sm placeholder-[#E2E8F0]/20 focus:outline-none transition-all"
                                            style={{ fontFamily: "'Inter Tight', sans-serif" }}
                                        />
                                        <input
                                            type="text"
                                            required
                                            placeholder="Last Name"
                                            value={leadForm.lastName}
                                            onChange={e => setLeadForm(prev => ({ ...prev, lastName: e.target.value }))}
                                            className="w-1/2 px-5 py-3.5 rounded-[24px] carved-input text-[#E2E8F0] text-sm placeholder-[#E2E8F0]/20 focus:outline-none transition-all"
                                            style={{ fontFamily: "'Inter Tight', sans-serif" }}
                                        />
                                    </div>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="Phone Number"
                                        value={leadForm.phone}
                                        onChange={e => setLeadForm(prev => ({ ...prev, phone: e.target.value }))}
                                        className="w-full px-5 py-3.5 rounded-[24px] carved-input text-[#E2E8F0] text-sm placeholder-[#E2E8F0]/20 focus:outline-none transition-all"
                                        style={{ fontFamily: "'Inter Tight', sans-serif" }}
                                    />
                                    <input
                                        type="email"
                                        required
                                        placeholder="Email Address"
                                        value={leadForm.email}
                                        onChange={e => setLeadForm(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full px-5 py-3.5 rounded-[24px] carved-input text-[#E2E8F0] text-sm placeholder-[#E2E8F0]/20 focus:outline-none transition-all"
                                        style={{ fontFamily: "'Inter Tight', sans-serif" }}
                                    />
                                    <textarea
                                        placeholder="Comments or Message (Optional)"
                                        value={leadForm.comments}
                                        onChange={e => setLeadForm(prev => ({ ...prev, comments: e.target.value }))}
                                        rows={2}
                                        className="w-full px-5 py-3.5 rounded-[24px] carved-input text-[#E2E8F0] text-sm placeholder-[#E2E8F0]/20 focus:outline-none transition-all resize-none"
                                        style={{ fontFamily: "'Inter Tight', sans-serif" }}
                                    />
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="glass-press-btn w-full py-4 text-[#D4AF37] font-bold text-sm tracking-[0.15em] uppercase disabled:opacity-50 mt-2"
                                        style={{ fontFamily: "'Inter Tight', sans-serif" }}
                                    >
                                        <span className="relative z-10">
                                            {isSubmitting ? 'Processing...' : 'Access Private Masterclass →'}
                                        </span>
                                    </button>
                                </motion.form>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default Recruit;
