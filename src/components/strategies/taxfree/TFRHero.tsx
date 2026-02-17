import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Ban, Layers, ShieldOff } from 'lucide-react';
import { MorphingBlob } from '@/components/philosophy/MorphingBlob';
import { StatBadge } from '../shared/StatBadge';
import { useTranslation } from '@/i18n/useTranslation';
import { Canvas } from '@react-three/fiber';
import { Float } from '@react-three/drei';

const StackedRings = () => (
  <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
    <group>
      {[0, 0.8, 1.6].map((y, i) => (
        <mesh key={i} position={[0, y - 0.8, 0]} rotation={[Math.PI / 2, 0, i * 0.3]}>
          <torusGeometry args={[1 - i * 0.15, 0.08, 16, 100]} />
          <meshStandardMaterial color="hsl(43,74%,49%)" metalness={0.9} roughness={0.15} />
        </mesh>
      ))}
    </group>
  </Float>
);

export const TFRHero: React.FC = () => {
  const { t } = useTranslation();
  const s = (t as any).strategies?.taxFreeRetirement?.hero;

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]" style={{ background: 'linear-gradient(135deg, hsl(160,48%,14%) 0%, hsl(160,48%,8%) 60%, hsl(160,48%,5%) 100%)' }}>
      <MorphingBlob className="absolute top-[-150px] right-[-100px] w-[600px] h-[600px] opacity-20" colors={['hsl(160,48%,30%)', 'hsl(43,74%,49%)']} morphSpeed={10000} />
      <MorphingBlob className="absolute bottom-[-200px] left-[-150px] w-[500px] h-[500px] opacity-10" colors={['hsl(160,48%,25%)', 'hsl(160,48%,35%)']} morphSpeed={12000} />

      <div className="absolute right-[5%] top-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[400px] md:h-[400px] opacity-50 pointer-events-none hidden lg:block">
        <Suspense fallback={null}>
          <Canvas camera={{ position: [0, 0, 4] as [number, number, number] }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} color="hsl(43,74%,49%)" />
            <StackedRings />
          </Canvas>
        </Suspense>
      </div>

      <div className="container max-w-6xl mx-auto px-6 py-24 text-center relative z-10">
        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8 }} className="w-16 h-0.5 mx-auto mb-6" style={{ background: 'hsl(43,74%,49%)' }} />
        <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-6 border" style={{ borderColor: 'hsl(43,74%,49%,0.4)', color: 'hsl(43,74%,49%)' }}>
          {s?.badge || 'Strategy'}
        </motion.span>

        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7 }} className="text-5xl md:text-7xl lg:text-8xl font-bold mb-5 tracking-tight bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #ffffff 0%, hsl(43,74%,70%) 50%, #ffffff 100%)', backgroundSize: '200% 100%', animation: 'shimmer 3s linear infinite' }}>
          {s?.title || 'Tax-Free Retirement'}
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="text-xl md:text-2xl text-white/80 mb-4 max-w-3xl mx-auto">
          {s?.subtitle || 'How to Retire with $0 in Income Taxes'}
        </motion.p>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }} className="text-base md:text-lg text-white/60 mb-10 max-w-4xl mx-auto">
          {s?.description || 'Combine Roth IRAs, Indexed Universal Life, municipal bonds, and HSAs into a cohesive strategy that delivers tax-free income for life—with no Required Minimum Distributions.'}
        </motion.p>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="flex flex-wrap justify-center gap-4 mb-10">
          <StatBadge icon={Ban} value={s?.stats?.[0]?.value || '$0 Tax Bill'} label={s?.stats?.[0]?.label || 'In Retirement'} delay={0.9} />
          <StatBadge icon={Layers} value={s?.stats?.[1]?.value || 'Multiple Vehicles'} label={s?.stats?.[1]?.label || 'Income Stacking'} delay={1.0} />
          <StatBadge icon={ShieldOff} value={s?.stats?.[2]?.value || 'No RMDs'} label={s?.stats?.[2]?.label || 'Total Control'} delay={1.1} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }} className="flex flex-wrap gap-4 justify-center">
          <motion.a href="#tfr-cta" whileHover={{ scale: 1.05, boxShadow: '0 0 30px hsla(43,74%,49%,0.4)' }} whileTap={{ scale: 0.98 }} className="px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300" style={{ background: 'linear-gradient(135deg, hsl(43,74%,49%) 0%, hsl(43,74%,55%) 100%)', color: 'hsl(160,48%,12%)' }}>
            {s?.ctaPrimary || 'Build Your Tax-Free Plan'}
          </motion.a>
          <motion.a href="#tfr-tax-bomb" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="px-8 py-4 rounded-xl font-bold text-lg border border-white/30 text-white hover:bg-white/10 transition-all duration-300">
            {s?.ctaSecondary || 'See the Math'}
          </motion.a>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-5 h-8 rounded-full border-2 border-white/30 flex justify-center pt-1.5">
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1 h-1 rounded-full bg-white/60" />
          </div>
        </motion.div>
      </div>

      <style>{`@keyframes shimmer { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }`}</style>
    </section>
  );
};
