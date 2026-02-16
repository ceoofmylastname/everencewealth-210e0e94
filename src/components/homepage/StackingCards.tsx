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
      {cards.map(({ Component, z }, idx) => (
        <div key={idx} className="min-h-screen" style={{ zIndex: z, position: 'relative' }}>
          <div className="sticky top-0">
            <div className="rounded-3xl overflow-hidden border border-white/10 shadow-[0_-8px_30px_rgba(0,0,0,0.3)]">
              <Component />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
