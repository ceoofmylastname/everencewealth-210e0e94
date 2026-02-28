import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import {
    Crown, Flame, Globe, Car, Video, Eye, Clock, TrendingUp,
    ChevronRight, RefreshCw, Search, Filter, Zap, Star
} from 'lucide-react';

interface RecruitLead {
    id: string;
    name: string;
    email: string;
    phone: string;
    audit_score: number;
    video_watch_time: number;
    audit_answers: string | Record<number, string>;
    status: string;
    interview_booked: boolean;
    created_at: string;
}

// AI Velocity Report generator
const generateVelocityReport = (lead: RecruitLead) => {
    const answers: Record<number, string> = typeof lead.audit_answers === 'string'
        ? JSON.parse(lead.audit_answers || '{}')
        : (lead.audit_answers || {});

    const dreamAsset = answers[1] || 'Not specified';
    const environment = answers[2] || 'Not specified';
    const grit = answers[3] || 'Not specified';
    const camera = answers[4] || 'Not specified'; // Q4 in 4-question protocol

    const hungerScore = lead.audit_score >= 35 ? 'Extremely High' : lead.audit_score >= 25 ? 'High' : lead.audit_score >= 15 ? 'Moderate' : 'Low';
    const vibeScore = lead.audit_score >= 35 ? 'High-Match' : lead.audit_score >= 25 ? 'Growth-Potential' : 'Low-Match';

    const driveText = dreamAsset.toLowerCase().includes('porsche') || dreamAsset.toLowerCase().includes('exotic')
        ? `This candidate is motivated by high-end luxury and is looking to fund a ${dreamAsset}. They have elite-level hunger.`
        : dreamAsset.toLowerCase().includes('luxury') || dreamAsset.toLowerCase().includes('bmw')
            ? `This candidate has elevated taste — chasing a ${dreamAsset}. They're building momentum toward the top.`
            : `This candidate chose "${dreamAsset}" — they're practical but may need coaching to dream bigger.`;

    const vibeText = camera.toLowerCase().includes('born') || camera.toLowerCase().includes('spotlight')
        ? `They are 100% comfortable on camera and ready to lead the Everence lifestyle brand. Born for the spotlight.`
        : camera.toLowerCase().includes('learn')
            ? `They're open to being on camera and willing to learn. Coachable — could develop into a strong brand face.`
            : `Camera-shy at this stage. May need encouragement and training before stepping into the brand role.`;

    const verdictText = lead.audit_score >= 35
        ? `HIGH-MATCH — "A-Player." They aren't looking for a job — they are looking for the jet. Book them immediately.`
        : lead.audit_score >= 25
            ? `GROWTH-POTENTIAL — Strong candidate with real hunger. The drive is there — they just need the right environment to explode. High priority.`
            : `LOW-MATCH — Early-stage prospect. Not inner-circle ready yet. Keep in the nurture pipeline.`;

    return { driveText, vibeText, verdictText, hungerScore, vibeScore, dreamAsset, camera };
};

const getHeatColor = (score: number) => {
    if (score >= 35) return { bg: 'bg-[#D4AF37]/20', border: 'border-[#D4AF37]/40', text: 'text-[#D4AF37]', glow: 'rgba(212, 175, 55, 0.3)' };
    if (score >= 25) return { bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-400', glow: 'rgba(16, 185, 129, 0.2)' };
    if (score >= 15) return { bg: 'bg-amber-500/15', border: 'border-amber-500/30', text: 'text-amber-400', glow: 'rgba(245, 158, 11, 0.2)' };
    return { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', glow: 'rgba(239, 68, 68, 0.15)' };
};

const getVibeLabel = (score: number) => {
    if (score >= 35) return '🔥 High-Match';
    if (score >= 25) return '⚡ Growth-Potential';
    return '🌱 Low-Match';
};

const RecruitDashboard: React.FC = () => {
    const [leads, setLeads] = useState<RecruitLead[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<RecruitLead | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTier, setFilterTier] = useState<string>('all');

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const { data, error } = await (supabase as any)
                .from('recruit_leads')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLeads(data || []);
        } catch (err) {
            console.error('Error fetching leads:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const filteredLeads = useMemo(() => {
        return leads.filter(lead => {
            const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filterTier === 'all' ||
                (filterTier === 'a-player' && lead.audit_score >= 35) ||
                (filterTier === 'high' && lead.audit_score >= 25 && lead.audit_score < 35) ||
                (filterTier === 'early' && lead.audit_score < 25);
            return matchesSearch && matchesFilter;
        });
    }, [leads, searchTerm, filterTier]);

    const stats = useMemo(() => ({
        total: leads.length,
        aPlayers: leads.filter(l => l.audit_score >= 35).length,
        highPotential: leads.filter(l => l.audit_score >= 25 && l.audit_score < 35).length,
        avgScore: leads.length ? Math.round(leads.reduce((s, l) => s + l.audit_score, 0) / leads.length) : 0,
    }), [leads]);

    return (
        <div className="min-h-screen" style={{ background: '#050505' }}>
            {/* Header */}
            <div className="border-b border-[#D4AF37]/10 px-6 md:px-10 py-5">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border border-[#D4AF37]/20 flex items-center justify-center">
                            <Crown className="w-5 h-5 text-[#D4AF37]" />
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-white tracking-tight" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                                Vibe & Velocity Dashboard
                            </h1>
                            <p className="text-[10px] tracking-[0.25em] uppercase text-[#D4AF37]/50 font-semibold">
                                Everence Inner Circle — Recruit Intelligence
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={fetchLeads}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#D4AF37]/20 bg-[#D4AF37]/5 text-[#D4AF37] text-xs font-semibold tracking-wider uppercase hover:bg-[#D4AF37]/10 transition-colors"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Refresh
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-10 py-8">
                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total Recruits', value: stats.total, icon: <Eye className="w-4 h-4" />, color: '#E2E8F0' },
                        { label: 'High-Match', value: stats.aPlayers, icon: <Flame className="w-4 h-4" />, color: '#D4AF37' },
                        { label: 'Growth-Potential', value: stats.highPotential, icon: <Zap className="w-4 h-4" />, color: '#10B981' },
                        { label: 'Avg Score', value: `${stats.avgScore}/40`, icon: <TrendingUp className="w-4 h-4" />, color: '#D4AF37' },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            className="rounded-xl border border-[#E2E8F0]/8 bg-white/[0.02] p-5"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <div className="flex items-center gap-2 mb-2" style={{ color: `${stat.color}60` }}>
                                {stat.icon}
                                <span className="text-[9px] tracking-[0.2em] uppercase font-semibold">{stat.label}</span>
                            </div>
                            <p className="text-2xl font-black" style={{ color: stat.color, fontFamily: "'Inter Tight', sans-serif" }}>
                                {stat.value}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Search + Filter */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E2E8F0]/20" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-[#E2E8F0]/10 text-sm text-[#E2E8F0] placeholder-[#E2E8F0]/20 focus:outline-none focus:border-[#D4AF37]/30 transition-colors"
                            style={{ fontFamily: "'Inter Tight', sans-serif" }}
                        />
                    </div>
                    <div className="flex gap-2">
                        {[
                            { key: 'all', label: 'All' },
                            { key: 'a-player', label: '🔥 High-Match' },
                            { key: 'high', label: '⚡ Growth' },
                            { key: 'early', label: '🌱 Low' },
                        ].map(f => (
                            <button
                                key={f.key}
                                onClick={() => setFilterTier(f.key)}
                                className={`px-3 py-2 rounded-lg text-[10px] font-semibold tracking-wider uppercase border transition-all ${filterTier === f.key
                                    ? 'border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37]'
                                    : 'border-[#E2E8F0]/8 bg-white/[0.02] text-[#E2E8F0]/40 hover:border-[#D4AF37]/20'
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Leads Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
                    </div>
                ) : filteredLeads.length === 0 ? (
                    <div className="text-center py-20">
                        <Crown className="w-12 h-12 mx-auto mb-4 text-[#D4AF37]/20" />
                        <p className="text-sm text-[#E2E8F0]/40">No recruits found</p>
                        <p className="text-xs text-[#E2E8F0]/20 mt-1">Leads will appear here after completing the Lifestyle Blueprint</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredLeads.map((lead, idx) => {
                            const heat = getHeatColor(lead.audit_score);
                            const report = generateVelocityReport(lead);
                            return (
                                <motion.div
                                    key={lead.id}
                                    className={`rounded-xl border bg-white/[0.015] cursor-pointer hover:bg-white/[0.03] transition-all duration-300 ${heat.border}`}
                                    style={{ boxShadow: selectedLead?.id === lead.id ? `0 0 30px ${heat.glow}` : 'none' }}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.04 }}
                                    onClick={() => setSelectedLead(selectedLead?.id === lead.id ? null : lead)}
                                >
                                    {/* Lead row */}
                                    <div className="flex items-center justify-between px-5 py-4">
                                        <div className="flex items-center gap-4">
                                            {/* Score badge */}
                                            <div className={`w-12 h-12 rounded-xl ${heat.bg} border ${heat.border} flex flex-col items-center justify-center`}>
                                                <span className={`text-lg font-black ${heat.text}`} style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                                                    {lead.audit_score}
                                                </span>
                                                <span className="text-[7px] text-[#E2E8F0]/30 -mt-0.5">/40</span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-sm font-bold text-[#E2E8F0]" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                                                        {lead.name}
                                                    </h3>
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.03] text-[#E2E8F0]/30 border border-[#E2E8F0]/5">
                                                        {getVibeLabel(lead.audit_score)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-[#E2E8F0]/40 mt-0.5">{lead.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="hidden md:block text-right">
                                                <p className="text-[10px] text-[#E2E8F0]/30 tracking-wider uppercase">
                                                    {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </p>
                                                <p className="text-[9px] text-[#E2E8F0]/20">
                                                    {new Date(lead.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            <ChevronRight className={`w-4 h-4 text-[#E2E8F0]/20 transition-transform ${selectedLead?.id === lead.id ? 'rotate-90' : ''}`} />
                                        </div>
                                    </div>

                                    {/* Expanded Velocity Report */}
                                    <AnimatePresence>
                                        {selectedLead?.id === lead.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-5 pb-5 border-t border-[#E2E8F0]/5 pt-4">
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <Star className="w-4 h-4 text-[#D4AF37]" />
                                                        <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-[#D4AF37]/70">
                                                            Velocity Report — AI Analysis
                                                        </h4>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        {/* The Drive */}
                                                        <div className="rounded-lg border border-[#D4AF37]/10 bg-[#D4AF37]/[0.03] p-4">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Car className="w-4 h-4 text-[#D4AF37]/60" />
                                                                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#D4AF37]/60">The Drive</span>
                                                            </div>
                                                            <p className="text-xs text-[#E2E8F0]/60 leading-relaxed">{report.driveText}</p>
                                                        </div>

                                                        {/* The Vibe */}
                                                        <div className="rounded-lg border border-[#D4AF37]/10 bg-[#D4AF37]/[0.03] p-4">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Video className="w-4 h-4 text-[#D4AF37]/60" />
                                                                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#D4AF37]/60">The Vibe</span>
                                                            </div>
                                                            <p className="text-xs text-[#E2E8F0]/60 leading-relaxed">{report.vibeText}</p>
                                                        </div>

                                                        {/* The Verdict */}
                                                        <div className="rounded-lg border border-[#D4AF37]/10 bg-[#D4AF37]/[0.03] p-4">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Crown className="w-4 h-4 text-[#D4AF37]/60" />
                                                                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#D4AF37]/60">The Verdict</span>
                                                            </div>
                                                            <p className="text-xs text-[#E2E8F0]/60 leading-relaxed font-medium">{report.verdictText}</p>
                                                        </div>
                                                    </div>

                                                    {/* Quick Data Points */}
                                                    <div className="flex flex-wrap gap-3 mt-4">
                                                        <div className="flex items-center gap-1.5 text-[10px] text-[#E2E8F0]/30">
                                                            <Globe className="w-3 h-3" />
                                                            <span>Phone: {lead.phone}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[10px] text-[#E2E8F0]/30">
                                                            <Flame className="w-3 h-3" />
                                                            <span>Hunger: {report.hungerScore}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[10px] text-[#E2E8F0]/30">
                                                            <Clock className="w-3 h-3" />
                                                            <span>Video: {lead.video_watch_time || 0}%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecruitDashboard;
