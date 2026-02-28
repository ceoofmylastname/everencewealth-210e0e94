import React, { useState, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RecruitHeader } from '../components/recruit/RecruitHeader';
import { StarField } from '../components/recruit/StarField';
import { BriefingPlayer } from '../components/recruit/BriefingPlayer';
import { Shield, Lock, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LocationState {
    authorized?: boolean;
    score?: number;
    name?: string;
}

const Briefing: React.FC = () => {
    const location = useLocation();
    const state = location.state as LocationState | null;
    const [videoUrl, setVideoUrl] = useState<string>("https://www.youtube.com/watch?v=dQw4w9WgXcQ");

    useEffect(() => {
        const fetchVideoUrl = async () => {
            try {
                const { data, error } = await supabase
                    .from("recruit_settings")
                    .select("value")
                    .eq("key", "briefing_video_url")
                    .maybeSingle();

                if (data?.value && !error) {
                    setVideoUrl(data.value);
                }
            } catch (err) {
                console.error("Error loading video URL:", err);
            }
        };

        fetchVideoUrl();
    }, []);

    // If not authorized, redirect back
    if (!state?.authorized) {
        return <Navigate to="/recruit" replace />;
    }


    return (
        <div className="min-h-screen overflow-hidden" style={{ background: '#050505' }}>
            {/* Star field */}
            <StarField />

            {/* Mesh gradients */}
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
                <div
                    className="absolute w-[60vw] h-[60vw] rounded-full"
                    style={{
                        top: '20%',
                        left: '-10%',
                        background: 'radial-gradient(circle, rgba(18, 28, 22, 0.2) 0%, transparent 70%)',
                        filter: 'blur(100px)',
                    }}
                />
                <div
                    className="absolute w-[40vw] h-[40vw] rounded-full"
                    style={{
                        bottom: '10%',
                        right: '-5%',
                        background: 'radial-gradient(circle, rgba(212, 175, 55, 0.03) 0%, transparent 70%)',
                        filter: 'blur(120px)',
                    }}
                />
            </div>

            {/* Film grain */}
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

            {/* Main content */}
            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pt-28 pb-20">
                {/* Status header */}
                <motion.div
                    className="text-center mb-10"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-[#D4AF37]" />
                        </div>
                        <div className="text-left">
                            <p className="text-[9px] tracking-[0.3em] uppercase text-[#D4AF37]/50 font-bold">
                                Clearance Level: Approved
                            </p>
                            <p className="text-[11px] tracking-[0.15em] uppercase text-[#E2E8F0]/60 font-semibold">
                                Private Briefing — {state.name || 'Candidate'}
                            </p>
                        </div>
                    </div>

                    <h1
                        className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mb-3"
                        style={{ fontFamily: "'Inter Tight', sans-serif" }}
                    >
                        The <span className="text-[#D4AF37]">Everence</span> Doctrine
                    </h1>
                    <p className="text-xs md:text-sm text-[#E2E8F0]/40 max-w-md mx-auto">
                        Watch the classified briefing below to finalize your assessment.
                    </p>
                </motion.div>

                {/* Video Player */}
                <motion.div
                    className="w-full"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                >
                    <BriefingPlayer
                        videoUrl={videoUrl}
                    />
                </motion.div>

                {/* Security footer */}
                <motion.div
                    className="mt-12 flex items-center gap-6 text-[#E2E8F0]/20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    <div className="flex items-center gap-2">
                        <Lock className="w-3 h-3" />
                        <span className="text-[9px] tracking-[0.2em] uppercase font-semibold">
                            Encrypted Session
                        </span>
                    </div>
                </motion.div>
            </div>

            {/* Vertical side text */}
            <motion.div
                className="hidden xl:block fixed left-8 top-1/2 -translate-y-1/2 z-10"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
            >
                <p
                    className="text-[10px] font-bold tracking-[0.6em] uppercase text-[#D4AF37]/20"
                    style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
                >
                    Classified Briefing
                </p>
            </motion.div>
            <motion.div
                className="hidden xl:block fixed right-8 top-1/2 -translate-y-1/2 z-10"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
            >
                <p
                    className="text-[10px] font-bold tracking-[0.6em] uppercase text-[#D4AF37]/20"
                    style={{ writingMode: 'vertical-lr' }}
                >
                    Selection Protocol
                </p>
            </motion.div>
        </div>
    );
};

export default Briefing;
