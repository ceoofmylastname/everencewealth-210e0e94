import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface AnimatedBucketProps {
  position: [number, number, number];
  fillLevel: number; // 0–100
  color: string;
  label: string;
}

export const AnimatedBucket: React.FC<AnimatedBucketProps> = ({
  position,
  fillLevel,
  color,
  label,
}) => {
  const liquidRef = useRef<THREE.Mesh>(null);
  const bucketHeight = 3;
  const bucketRadius = 1;
  const wallThickness = 0.05;

  const liquidColor = useMemo(() => new THREE.Color(color), [color]);

  // Clamp fill 0–100, map to liquid height
  const clampedFill = Math.max(0, Math.min(100, fillLevel));
  const liquidHeight = (clampedFill / 100) * (bucketHeight - 0.1);
  const liquidY = -bucketHeight / 2 + liquidHeight / 2 + 0.05;

  useFrame(({ clock }) => {
    if (liquidRef.current) {
      // Gentle bob
      liquidRef.current.position.y =
        liquidY + Math.sin(clock.getElapsedTime() * 1.5) * 0.03;
    }
  });

  return (
    <group position={position}>
      {/* Bucket shell – transparent glass cylinder */}
      <mesh>
        <cylinderGeometry
          args={[
            bucketRadius,
            bucketRadius * 0.85,
            bucketHeight,
            32,
            1,
            true,
          ]}
        />
        <meshPhysicalMaterial
          transparent
          opacity={0.15}
          roughness={0.1}
          metalness={0.1}
          side={THREE.DoubleSide}
          color="#ffffff"
        />
      </mesh>

      {/* Bottom cap */}
      <mesh position={[0, -bucketHeight / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[bucketRadius * 0.85, 32]} />
        <meshPhysicalMaterial
          transparent
          opacity={0.12}
          roughness={0.1}
          color="#ffffff"
        />
      </mesh>

      {/* Liquid fill */}
      {clampedFill > 0 && (
        <mesh ref={liquidRef} position={[0, liquidY, 0]}>
          <cylinderGeometry
            args={[
              bucketRadius - wallThickness,
              bucketRadius * 0.85 - wallThickness,
              liquidHeight,
              32,
            ]}
          />
          <meshStandardMaterial
            color={liquidColor}
            transparent
            opacity={0.7}
            roughness={0.3}
          />
        </mesh>
      )}

      {/* Label */}
      <Html
        position={[0, bucketHeight / 2 + 0.5, 0]}
        center
        distanceFactor={8}
        style={{ pointerEvents: 'none' }}
      >
        <div className="text-center whitespace-nowrap">
          <p
            className="text-xs font-space font-bold tracking-wider uppercase"
            style={{ color }}
          >
            {label}
          </p>
          <p className="text-lg font-space font-bold text-white">
            {clampedFill}%
          </p>
        </div>
      </Html>
    </group>
  );
};
