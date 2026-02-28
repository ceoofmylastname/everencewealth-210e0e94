import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Car, Shield, Crown, Lightbulb } from 'lucide-react';

interface AuditQuestion {
    id: number;
    icon: React.ReactNode;
    label: string;
    subtitle: string;
    mindsetGoal: string;
    options: { text: string; score: number; detail?: string; emoji?: string }[];
}

const QUESTIONS: AuditQuestion[] = [
    {
        id: 1,
        icon: <Car className="w-6 h-6" />,
        label: "What's the 'Dream Asset' driving your income goals this year?",
        subtitle: 'We value producers who want nice things and have the hunger to get them.',
        mindsetGoal: 'Measures absolute hunger & high-ticket motivation',
        options: [
            { text: 'A reliable SUV', score: 2, detail: 'Practical & dependable', emoji: '🚙' },
            { text: 'A luxury sedan — BMW, Mercedes', score: 5, detail: 'Elevated taste', emoji: '🏎️' },
            { text: 'A custom Porsche or exotic', score: 10, detail: 'You dream in horsepower', emoji: '🔥' },
        ],
    },
    {
        id: 2,
        icon: <Shield className="w-6 h-6" />,
        label: "What is your core philosophy for closing the 'Retirement Gap'?",
        subtitle: 'Our focus is on real education and protecting client futures.',
        mindsetGoal: 'Vets for alignment with our indexing & protection philosophy',
        options: [
            { text: 'The traditional 60/40 portfolio', score: 0, detail: 'Outdated corporate advice', emoji: '📉' },
            { text: 'High-risk market speculation', score: 5, detail: 'Leaving too much to chance', emoji: '🎲' },
            { text: 'Intelligent Indexing & Principal Protection', score: 10, detail: 'Real knowledge, real security', emoji: '🛡️' },
        ],
    },
    {
        id: 3,
        icon: <Crown className="w-6 h-6" />,
        label: "Are you ready to step up as a true Leader in this industry?",
        subtitle: 'We are looking for producers who want to dominate the financial and insurance space.',
        mindsetGoal: 'Tests for true leadership potential & industry ambition',
        options: [
            { text: 'I prefer to just follow a system', score: 0, detail: 'Comfortable in the background', emoji: '⚙️' },
            { text: 'I organically lead my own book of business', score: 5, detail: 'Independent but isolated', emoji: '📊' },
            { text: 'I am ready to build an empire and lead from the front', score: 10, detail: 'Absolute dominance', emoji: '👑' },
        ],
    },
    {
        id: 4,
        icon: <Lightbulb className="w-6 h-6" />,
        label: "How do you approach educating a client about their retirement?",
        subtitle: 'Real work requires real love for the financial industry.',
        mindsetGoal: 'Supports our mission of deep education over superficial selling',
        options: [
            { text: 'I just sell the product', score: 2, detail: "Transactional mindset", emoji: '💵' },
            { text: 'I give them a standard brochure', score: 5, detail: 'The minimum requirement', emoji: '📄' },
            { text: 'I fundamentally change how they understand wealth', score: 10, detail: "True fiduciary education", emoji: '💡' },
        ],
    },
];

// Spawn gold particle burst at a position
const spawnParticles = (container: HTMLElement, x: number, y: number) => {
    const count = 12;
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * 360;
        const distance = 30 + Math.random() * 50;
        const px = Math.cos((angle * Math.PI) / 180) * distance;
        const py = Math.sin((angle * Math.PI) / 180) * distance;

        const particle = document.createElement('div');
        particle.className = 'gold-burst-particle';
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.setProperty('--px', `${px}px`);
        particle.style.setProperty('--py', `${py}px`);
        particle.style.width = `${3 + Math.random() * 4}px`;
        particle.style.height = particle.style.width;
        container.appendChild(particle);
        setTimeout(() => particle.remove(), 600);
    }
};

interface ProducerAuditProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (score: number, answers: Record<number, number>, answerLabels: Record<number, string>) => void;
}

export const ProducerAudit: React.FC<ProducerAuditProps> = ({ isOpen, onClose, onComplete }) => {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [answerLabels, setAnswerLabels] = useState<Record<number, string>>({});
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [pulsingCard, setPulsingCard] = useState<number | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    const currentQuestion = QUESTIONS[step];
    const totalScore = Object.values(answers).reduce((sum, s) => sum + s, 0);
    const progress = ((step) / QUESTIONS.length) * 100;
    const maxScore = QUESTIONS.length * 10;

    const handleSelect = useCallback((score: number, index: number, label: string, e: React.MouseEvent) => {
        setSelectedOption(index);
        setPulsingCard(index);

        // Spawn gold particle burst at click position
        if (modalRef.current) {
            const rect = modalRef.current.getBoundingClientRect();
            spawnParticles(modalRef.current, e.clientX - rect.left, e.clientY - rect.top);
        }

        setTimeout(() => setPulsingCard(null), 500);

        setTimeout(() => {
            const newAnswers = { ...answers, [currentQuestion.id]: score };
            const newLabels = { ...answerLabels, [currentQuestion.id]: label };
            setAnswers(newAnswers);
            setAnswerLabels(newLabels);

            if (step < QUESTIONS.length - 1) {
                setStep(step + 1);
                setSelectedOption(null);
            } else {
                const finalScore = Object.values(newAnswers).reduce((sum, s) => sum + s, 0);
                onComplete(finalScore, newAnswers, newLabels);
            }
        }, 500);
    }, [answers, answerLabels, currentQuestion, step, onComplete]);

    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1);
            setSelectedOption(null);
        }
    };

    const handleClose = () => {
        setStep(0);
        setAnswers({});
        setAnswerLabels({});
        setSelectedOption(null);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        onClick={handleClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />

                    {/* Floating 3D Modal with Rotating Border */}
                    <motion.div
                        ref={modalRef}
                        className="relative w-full max-w-2xl neon-border floating-card"
                        style={{ position: 'relative', overflow: 'visible' }}
                        initial={{ scale: 0.85, opacity: 0, y: 50, rotateX: 8 }}
                        animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
                        exit={{ scale: 0.85, opacity: 0, y: 50, rotateX: 8 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                    >
                        {/* Inner container */}
                        <div className="relative z-10 rounded-[24px] overflow-hidden"
                            style={{
                                background: 'linear-gradient(145deg, rgba(18, 28, 22, 0.98), rgba(5, 5, 5, 0.99))',
                            }}
                        >
                            {/* Top bar */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-[#D4AF37]/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"
                                        style={{ boxShadow: '0 0 10px rgba(212, 175, 55, 0.5)' }}
                                    />
                                    <span className="text-[10px] font-semibold tracking-[0.3em] uppercase gold-shimmer-text">
                                        Lifestyle Blueprint
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-mono tracking-wider text-[#E2E8F0]/40">
                                        VIBE {step + 1} / {QUESTIONS.length}
                                    </span>
                                    <button
                                        onClick={handleClose}
                                        className="w-8 h-8 flex items-center justify-center rounded-2xl border border-[#E2E8F0]/10 hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 transition-all"
                                    >
                                        <X className="w-4 h-4 text-[#E2E8F0]/50" />
                                    </button>
                                </div>
                            </div>

                            {/* Progress bar with shimmer */}
                            <div className="h-[3px] bg-[#121C16]">
                                <motion.div
                                    className="h-full"
                                    style={{
                                        background: 'linear-gradient(90deg, #996515, #D4AF37, #FFF5AD, #D4AF37, #996515)',
                                        backgroundSize: '200% 100%',
                                        animation: 'gold-shimmer 2s linear infinite',
                                    }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                />
                            </div>

                            {/* Question content */}
                            <div className="px-6 py-8 md:px-10 md:py-10">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={step}
                                        initial={{ opacity: 0, x: 40 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -40 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {/* Question header */}
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-2xl flex items-center justify-center border border-[#D4AF37]/20 bg-[#D4AF37]/5 text-[#D4AF37]"
                                                style={{ boxShadow: '0 0 20px rgba(212, 175, 55, 0.15)' }}
                                            >
                                                {currentQuestion.icon}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-[#E2E8F0] tracking-tight"
                                                    style={{ textShadow: '0 0 20px rgba(226, 232, 240, 0.1)' }}
                                                >
                                                    {currentQuestion.label}
                                                </h3>
                                            </div>
                                        </div>
                                        <p className="text-sm text-[#E2E8F0]/50 mb-1 pl-[52px]">
                                            {currentQuestion.subtitle}
                                        </p>
                                        <p className="text-[10px] gold-shimmer-text tracking-[0.15em] uppercase mb-8 pl-[52px]"
                                            style={{ opacity: 0.5 }}
                                        >
                                            {currentQuestion.mindsetGoal}
                                        </p>

                                        {/* Options with rotating borders on select */}
                                        <div className="space-y-3">
                                            {currentQuestion.options.map((option, idx) => (
                                                <motion.button
                                                    key={idx}
                                                    onClick={(e) => handleSelect(option.score, idx, option.text, e)}
                                                    className={`w-full text-left px-5 py-4 rounded-[24px] border-2 transition-all duration-300 group relative overflow-hidden ${selectedOption === idx
                                                        ? 'border-[#D4AF37]/60 bg-[#D4AF37]/10'
                                                        : 'border-[#E2E8F0]/6 bg-white/[0.015] hover:border-[#D4AF37]/25 hover:bg-[#D4AF37]/5'
                                                        } ${pulsingCard === idx ? 'card-pulse-active' : ''}`}
                                                    style={{
                                                        boxShadow: selectedOption === idx
                                                            ? '0 0 40px rgba(212, 175, 55, 0.2), inset 0 1px 0 rgba(255,255,255,0.03)'
                                                            : '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.02)',
                                                    }}
                                                    whileHover={{ x: 6, scale: 1.01 }}
                                                    whileTap={{ scale: 0.97 }}
                                                >
                                                    {/* Subtle inner glow on hover */}
                                                    <div className="absolute inset-0 rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                                        style={{
                                                            background: 'radial-gradient(ellipse at center, rgba(212, 175, 55, 0.05) 0%, transparent 70%)',
                                                        }}
                                                    />
                                                    <div className="flex items-center justify-between relative z-10">
                                                        <div className="flex items-center gap-3">
                                                            {option.emoji && (
                                                                <span className="text-xl filter drop-shadow-[0_0_8px_rgba(212,175,55,0.3)]">
                                                                    {option.emoji}
                                                                </span>
                                                            )}
                                                            <div>
                                                                <span className={`text-sm font-semibold transition-colors ${selectedOption === idx ? 'text-[#D4AF37]' : 'text-[#E2E8F0]/80 group-hover:text-[#E2E8F0]'
                                                                    }`}
                                                                    style={selectedOption === idx ? { textShadow: '0 0 15px rgba(212, 175, 55, 0.3)' } : {}}
                                                                >
                                                                    {option.text}
                                                                </span>
                                                                {option.detail && (
                                                                    <p className="text-xs text-[#E2E8F0]/30 mt-0.5">{option.detail}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className={`flex items-center gap-2 ${selectedOption === idx ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
                                                            } transition-opacity`}>
                                                            <ChevronRight className="w-4 h-4 text-[#D4AF37]/40" />
                                                        </div>
                                                    </div>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Bottom bar */}
                            <div className="px-6 py-4 border-t border-[#D4AF37]/8 flex items-center justify-between">
                                <button
                                    onClick={handleBack}
                                    disabled={step === 0}
                                    className={`flex items-center gap-1 text-[10px] font-semibold tracking-[0.2em] uppercase transition-all rounded-2xl px-3 py-1.5 ${step === 0 ? 'text-[#E2E8F0]/15 cursor-not-allowed' : 'text-[#E2E8F0]/40 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5'
                                        }`}
                                >
                                    <ChevronLeft className="w-3 h-3" />
                                    Previous
                                </button>
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-mono text-[#E2E8F0]/30 tracking-wider">
                                        PROGRESS
                                    </span>
                                    <div className="flex gap-1.5">
                                        {QUESTIONS.map((_, i) => (
                                            <div
                                                key={i}
                                                className={`w-2 h-2 rounded-full transition-all duration-300 ${i < step ? 'bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.4)]'
                                                    : i === step ? 'bg-[#D4AF37]/50 shadow-[0_0_6px_rgba(212,175,55,0.2)]'
                                                        : 'bg-[#E2E8F0]/10'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
