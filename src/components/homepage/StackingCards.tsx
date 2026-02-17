import React from 'react';
import { SilentKillers } from './SilentKillers';
import { TaxBuckets } from './TaxBuckets';
import { IndexedAdvantage } from './IndexedAdvantage';

const cards = [
  { Component: SilentKillers, z: 10 },
  { Component: TaxBuckets, z: 20 },
  { Component: IndexedAdvantage, z: 30 },
];

export const StackingCards: React.FC = () => {
  return (
    <div className="relative">
      {cards.map(({ Component, z }, idx) => {
        const isLast = idx === cards.length - 1;
        return (
          <div
            key={idx}
            className={isLast ? 'min-h-screen' : 'min-h-[110vh]'}
            style={{ zIndex: z, position: 'relative' }}
          >
            <div className="sticky top-0">
              <div className="overflow-hidden border border-white/10 shadow-[0_-8px_30px_rgba(0,0,0,0.4),0_-4px_20px_rgba(26,77,62,0.3)]">
                <Component />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
