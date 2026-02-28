import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const RecruitHeader: React.FC = () => {
    return (
        <motion.header
            className="fixed top-0 left-0 right-0 z-50 px-6 md:px-10 py-5"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
        >
            <div className="flex items-center justify-between max-w-7xl mx-auto">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <img
                        src="https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png"
                        alt="Everence Wealth"
                        className="h-10 md:h-12 w-auto"
                        loading="eager"
                    />
                </Link>

                {/* Center nav — Philosophy pill */}
                <div className="hidden md:flex items-center">
                    <Link
                        to="/en/philosophy"
                        className="px-6 py-2 rounded-full border border-[#D4AF37]/20 bg-white/[0.03] backdrop-blur-md text-[11px] font-semibold tracking-[0.25em] uppercase text-[#E2E8F0]/80 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/40 hover:text-[#D4AF37] transition-all duration-300"
                    >
                        Philosophy
                    </Link>
                </div>

                {/* Right — Portal link */}
                <Link
                    to="/portal/login"
                    className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#E2E8F0]/60 hover:text-[#D4AF37] transition-colors duration-300"
                >
                    Portal →
                </Link>
            </div>
        </motion.header>
    );
};
