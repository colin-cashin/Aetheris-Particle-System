
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import { Particles } from './Particles';
import { ParticleState } from '../../types';

interface SceneProps {
  state: ParticleState;
}

export const Scene: React.FC<SceneProps> = ({ state }) => {
  return (
    <div className="absolute inset-0 w-full h-full -z-10">
      <Canvas dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        
        <color attach="background" args={['#020202']} />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <Suspense fallback={null}>
          <Particles state={state} />
        </Suspense>

        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color={state.color} />
      </Canvas>
    </div>
  );
};
