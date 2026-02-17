import React from 'react';

const blobPaths = [
  'M44.5,-57.2C57.1,-48.3,66.5,-34.3,71.2,-18.5C75.9,-2.7,76,14.9,69.3,29.5C62.6,44.1,49.1,55.7,34.1,62.3C19.1,68.9,2.6,70.5,-13.2,67.3C-29,64.1,-44.1,56.1,-55.3,44C-66.5,31.9,-73.8,15.7,-74.3,-0.9C-74.8,-17.5,-68.5,-34.5,-57.1,-43.7C-45.7,-52.9,-29.2,-54.3,-14.1,-55.8C1,-57.3,31.9,-66.1,44.5,-57.2Z',
  'M39.9,-51.4C52.7,-43.4,64.5,-32.4,69.7,-18.4C74.9,-4.4,73.5,12.6,66.2,26.1C58.9,39.6,45.7,49.6,31.4,56.4C17.1,63.2,1.7,66.8,-14.4,65.1C-30.5,63.4,-47.3,56.4,-58.3,44.1C-69.3,31.8,-74.5,14.2,-72.6,-2.1C-70.7,-18.4,-61.7,-33.4,-49.6,-41.6C-37.5,-49.8,-22.3,-51.2,-8.2,-50.7C5.9,-50.2,27.1,-59.4,39.9,-51.4Z',
  'M47.3,-58.9C60.6,-50.7,70.1,-35.5,73.9,-19.1C77.7,-2.7,75.8,14.9,68.1,29.2C60.4,43.5,46.9,54.5,32,61.1C17.1,67.7,0.8,69.9,-15.8,67.4C-32.4,64.9,-49.3,57.7,-60.1,45.2C-70.9,32.7,-75.6,14.9,-73.5,-1.5C-71.4,-17.9,-62.5,-32.9,-50.5,-41.4C-38.5,-49.9,-23.4,-51.9,-8.7,-52.4C6,-52.9,34,-67.1,47.3,-58.9Z',
];

interface MorphingBlobProps {
  className?: string;
  colors: string[];
  morphSpeed?: number;
}

export const MorphingBlob: React.FC<MorphingBlobProps> = ({
  className = '',
  colors,
  morphSpeed = 8000,
}) => {
  const gradientId = `blob-grad-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <svg
      viewBox="-100 -100 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ willChange: 'transform' }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="100%" stopColor={colors[1] || colors[0]} />
        </linearGradient>
      </defs>
      <path fill={`url(#${gradientId})`}>
        <animate
          attributeName="d"
          values={`${blobPaths[0]};${blobPaths[1]};${blobPaths[2]};${blobPaths[0]}`}
          dur={`${morphSpeed}ms`}
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
        />
      </path>
    </svg>
  );
};
