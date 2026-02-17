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
  <div className="overflow-x-auto">
    <table className="w-full border-collapse">
      <thead>
        <tr>
          <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground uppercase tracking-wider w-[25%]">Feature</th>
          <th className="text-left py-4 px-6 w-[37.5%]">
            <span className={`inline-flex items-center gap-2 text-lg font-bold ${leftColumn.color === 'red' ? 'text-destructive' : 'text-primary'}`}>
              <span className={`w-3 h-3 rounded-full ${leftColumn.color === 'red' ? 'bg-destructive' : 'bg-primary'}`} />
              {leftColumn.title}
            </span>
          </th>
          <th className="text-left py-4 px-6 w-[37.5%]">
            <span className={`inline-flex items-center gap-2 text-lg font-bold ${rightColumn.color === 'red' ? 'text-destructive' : 'text-primary'}`}>
              <span className={`w-3 h-3 rounded-full ${rightColumn.color === 'red' ? 'bg-destructive' : 'bg-primary'}`} />
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
              className={`border-t border-border ${i % 2 === 0 ? 'bg-muted/20' : 'bg-background'}`}
            >
              <td className="py-4 px-6 font-medium text-foreground text-sm">{leftFeature.label}</td>
              <td className="py-4 px-6">
                <div className="flex items-start gap-2">
                  {leftFeature.positive ? (
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                  )}
                  <span className="text-sm text-muted-foreground">{leftFeature.value}</span>
                </div>
              </td>
              <td className="py-4 px-6">
                <div className="flex items-start gap-2">
                  {rightFeature.positive ? (
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                  )}
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
