import React from 'react';
import { motion } from 'framer-motion';
import { FileKey, Users, Shield, Umbrella } from 'lucide-react';
import { GlassCard } from '@/components/philosophy/GlassCard';
import { useTranslation } from '@/i18n/useTranslation';

const layers = [
  { icon: FileKey, color: 'hsl(260,50%,50%)', title: 'Irrevocable Life Insurance Trust (ILIT)', desc: 'Removes life insurance proceeds from your taxable estate. The trust owns the policy, keeping the death benefit outside the reach of creditors, lawsuits, and estate taxes—while still benefiting your heirs.' },
  { icon: Users, color: 'hsl(43,74%,49%)', title: 'Family Limited Partnership (FLP)', desc: 'Transfers assets to family members at discounted valuations while you retain management control. Provides lawsuit protection through charging order protection and reduces estate tax exposure through valuation discounts.' },
  { icon: Shield, color: 'hsl(160,48%,30%)', title: 'IUL Cash Value', desc: 'In most states, the cash value inside an Indexed Universal Life policy is protected from creditors and judgments. Provides tax-free growth, tax-free loans, and a death benefit—all behind a legal shield.' },
  { icon: Umbrella, color: 'hsl(200,60%,50%)', title: 'Annuities', desc: 'Many states offer full or partial creditor protection for annuity assets. Fixed indexed annuities provide guaranteed income, tax-deferred growth, and an additional layer of asset protection.' },
];

export const APProtectionVehicles: React.FC = () => {
  const { t } = useTranslation();
  const s = (t as any).strategies?.assetProtection?.vehicles;

  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="container max-w-5xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#09301B] text-center mb-6"
        >
          {s?.title || 'Protection Vehicles'}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-lg text-muted-foreground text-center mb-16 max-w-3xl mx-auto"
        >
          {s?.subtitle || 'Layer multiple legal structures to create an impenetrable fortress around your wealth.'}
        </motion.p>

        <div className="space-y-6">
          {layers.map((layer, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <div className="rounded-2xl border-l-4" style={{ borderLeftColor: layer.color }}>
                <GlassCard className="p-6 md:p-8" glow>
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-center gap-4 md:w-1/3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${layer.color}20` }}>
                        <layer.icon className="w-6 h-6" style={{ color: layer.color }} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{s?.layers?.[i]?.title || layer.title}</h3>
                        <span className="text-sm font-semibold" style={{ color: layer.color }}>Layer {i + 1}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground md:w-2/3 leading-relaxed">
                      {s?.layers?.[i]?.desc || layer.desc}
                    </p>
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
