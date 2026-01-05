
import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ParticleState, ShapeType } from '../../types';
import { PARTICLE_COUNT } from '../../constants';

interface ParticlesProps {
  state: ParticleState;
}

export const Particles: React.FC<ParticlesProps> = ({ state }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const { shape, scale, expansion, speed, color } = state;

  // Generate target positions for each shape
  const targetPositions = useMemo(() => {
    const shapes: Record<ShapeType, Float32Array> = {
      [ShapeType.SPHERE]: new Float32Array(PARTICLE_COUNT * 3),
      [ShapeType.TORUS_KNOT]: new Float32Array(PARTICLE_COUNT * 3),
      [ShapeType.HEART]: new Float32Array(PARTICLE_COUNT * 3),
      [ShapeType.MANDALA]: new Float32Array(PARTICLE_COUNT * 3),
    };

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      // Sphere
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      shapes[ShapeType.SPHERE][i3] = Math.sin(phi) * Math.cos(theta) * 2;
      shapes[ShapeType.SPHERE][i3 + 1] = Math.sin(phi) * Math.sin(theta) * 2;
      shapes[ShapeType.SPHERE][i3 + 2] = Math.cos(phi) * 2;

      // Torus Knot
      const p = 2, q = 3;
      const t = (i / PARTICLE_COUNT) * Math.PI * 2 * 10;
      const r = 0.5 * (2 + Math.sin(q * t));
      shapes[ShapeType.TORUS_KNOT][i3] = r * Math.cos(p * t) * 1.5;
      shapes[ShapeType.TORUS_KNOT][i3 + 1] = r * Math.sin(p * t) * 1.5;
      shapes[ShapeType.TORUS_KNOT][i3 + 2] = r * Math.cos(q * t) * 1.5;

      // Heart
      const ht = (i / PARTICLE_COUNT) * Math.PI * 2;
      const hx = 1.6 * Math.pow(Math.sin(ht), 3);
      const hy = 1.3 * Math.cos(ht) - 0.5 * Math.cos(2 * ht) - 0.2 * Math.cos(3 * ht) - 0.1 * Math.cos(4 * ht);
      const randZ = (Math.random() - 0.5) * 0.5;
      shapes[ShapeType.HEART][i3] = hx;
      shapes[ShapeType.HEART][i3 + 1] = hy;
      shapes[ShapeType.HEART][i3 + 2] = randZ;

      // Mandala
      const petalCount = 8;
      const layer = Math.floor(i / (PARTICLE_COUNT / 5));
      const angle = (i / PARTICLE_COUNT) * Math.PI * 2 * petalCount;
      const radius = 0.5 + (layer * 0.4) + Math.sin(angle * petalCount) * 0.2;
      shapes[ShapeType.MANDALA][i3] = Math.cos(angle) * radius * 1.5;
      shapes[ShapeType.MANDALA][i3 + 1] = Math.sin(angle) * radius * 1.5;
      shapes[ShapeType.MANDALA][i3 + 2] = Math.sin(angle * 3) * 0.3 * (layer + 1);
    }

    return shapes;
  }, []);

  const initialPositions = useMemo(() => {
    return new Float32Array(PARTICLE_COUNT * 3);
  }, []);

  useFrame((stateFrame) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
    const target = targetPositions[shape];
    const time = stateFrame.clock.getElapsedTime();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      
      // Morphing lerp logic
      const lerpFactor = 0.05;
      posAttr.array[i3] += (target[i3] * scale * expansion - posAttr.array[i3]) * lerpFactor;
      posAttr.array[i3 + 1] += (target[i3 + 1] * scale * expansion - posAttr.array[i3 + 1]) * lerpFactor;
      posAttr.array[i3 + 2] += (target[i3 + 2] * scale * expansion - posAttr.array[i3 + 2]) * lerpFactor;

      // Add small organic noise/drift
      posAttr.array[i3] += Math.sin(time * speed + i) * 0.002;
      posAttr.array[i3 + 1] += Math.cos(time * speed + i) * 0.002;
    }

    posAttr.needsUpdate = true;
    pointsRef.current.rotation.y += speed * 0.2;
    pointsRef.current.rotation.x += speed * 0.1;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={initialPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.015}
        color={color}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
};
