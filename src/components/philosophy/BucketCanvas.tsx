import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { AnimatedBucket } from './AnimatedBucket';

const BUCKET_COLORS = ['#EF4444', '#F59E0B', '#10B981'];
const BUCKET_LABELS = ['Taxable', 'Tax-Deferred', 'Tax-Exempt'];

interface BucketCanvasProps {
  levels: number[];
}

const BucketCanvas: React.FC<BucketCanvasProps> = ({ levels }) => (
  <Canvas
    camera={{ position: [0, 1, 9], fov: 45 }}
    dpr={[1, 2]}
    style={{ width: '100%', height: '100%' }}
  >
    <ambientLight intensity={0.6} />
    <pointLight position={[8, 8, 8]} intensity={0.8} />
    <pointLight position={[-6, 4, -4]} intensity={0.3} color="#F59E0B" />

    {levels.map((fill, i) => (
      <AnimatedBucket
        key={i}
        position={[(i - 1) * 3, 0, 0] as [number, number, number]}
        fillLevel={fill}
        color={BUCKET_COLORS[i]}
        label={BUCKET_LABELS[i]}
      />
    ))}

    <OrbitControls
      enableZoom={false}
      enablePan={false}
      autoRotate
      autoRotateSpeed={0.4}
      minPolarAngle={Math.PI / 3}
      maxPolarAngle={Math.PI / 2.2}
    />
  </Canvas>
);

export default BucketCanvas;
