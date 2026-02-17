import React from 'react';
import { AnimatedBucket } from './AnimatedBucket';

const BUCKET_COLORS = ['#EF4444', '#F59E0B', '#10B981'];
const BUCKET_LABELS = ['Taxable', 'Tax-Deferred', 'Tax-Exempt'];

interface BucketCanvasProps {
  levels: number[];
}

const BucketCanvas: React.FC<BucketCanvasProps> = ({ levels }) => (
  <div className="flex items-end justify-center gap-8 w-full h-full py-8">
    {levels.map((fill, i) => (
      <AnimatedBucket
        key={i}
        fillLevel={fill}
        color={BUCKET_COLORS[i]}
        label={BUCKET_LABELS[i]}
      />
    ))}
  </div>
);

export default BucketCanvas;
