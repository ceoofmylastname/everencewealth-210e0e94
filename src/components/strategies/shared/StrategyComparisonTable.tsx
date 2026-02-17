import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';

interface Feature {
  label: string;
  value: string;
  positive: boolean;
}

interface ColumnData {
  title: string;
  color: 'red' | 'green';
  features: Feature[];
}

interface StrategyComparisonTableProps {
  leftColumn: ColumnData;
  rightColumn: ColumnData;
}

export const StrategyComparisonTable: React.FC<StrategyComparisonTableProps> = ({ leftColumn, rightColumn }) => (
  <div className="overflow-x-auto rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)]">
    <table className="w-full border-collapse">
      <thead>
        <tr style={{ background: 'linear-gradient(135deg, hsl(160,48%,14%) 0%, hsl(160,48%,10%) 100%)' }}>
          <th className="text-left py-5 px-6 text-sm font-semibold text-white/60 uppercase tracking-wider w-[25%]">Feature</th>
          <th className="text-left py-5 px-6 w-[37.5%]">
            <span className={`inline-flex items-center gap-2 text-lg font-bold ${leftColumn.color === 'red' ? 'text-red-400' : 'text-emerald-400'}`}>
              <span className={`w-3 h-3 rounded-full ${leftColumn.color === 'red' ? 'bg-red-400' : 'bg-emerald-400'}`} />
              {leftColumn.title}
            </span>
          </th>
          <th className="text-left py-5 px-6 w-[37.5%]">
            <span className={`inline-flex items-center gap-2 text-lg font-bold ${rightColumn.color === 'red' ? 'text-red-400' : 'text-emerald-400'}`}>
              <span className={`w-3 h-3 rounded-full ${rightColumn.color === 'red' ? 'bg-red-400' : 'bg-emerald-400'}`} />
              {rightColumn.title}
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        {leftColumn.features.map((leftFeature, i) => {
          const rightFeature = rightColumn.features[i];
          return (
            <motion.tr
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className={`border-t border-border ${i % 2 === 0 ? 'bg-muted/20' : 'bg-background'} hover:bg-primary/[0.03] hover:translate-y-[-1px] hover:shadow-sm transition-all duration-200`}
            >
              <td className="py-4 px-6 font-medium text-foreground text-sm">{leftFeature.label}</td>
              <td className="py-4 px-6">
                <div className="flex items-start gap-2">
                  <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring', delay: i * 0.06 + 0.2 }}>
                    {leftFeature.positive ? (
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                    )}
                  </motion.div>
                  <span className="text-sm text-muted-foreground">{leftFeature.value}</span>
                </div>
              </td>
              <td className="py-4 px-6">
                <div className="flex items-start gap-2">
                  <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring', delay: i * 0.06 + 0.3 }}>
                    {rightFeature.positive ? (
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                    )}
                  </motion.div>
                  <span className="text-sm text-muted-foreground">{rightFeature.value}</span>
                </div>
              </td>
            </motion.tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
