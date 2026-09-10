import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useHologram } from '../../context/HologramContext';
import { PointCloud } from './PointCloud';
import { ReferenceOrbCore } from './ReferenceOrbCore';
import { OrbitalRings } from './OrbitalRings';
import { VolumetricGlowSpheres } from './VolumetricGlowSpheres';
import { GlowSprites } from './GlowSprites';
import { NeuralSynapses } from './NeuralSynapses';

interface HologramOrbProps {
  clickShockRef: React.MutableRefObject<number>;
  rotationTargetRef: React.MutableRefObject<{ x: number; y: number; isDragging: boolean }>;
}

export const HologramOrb: React.FC<HologramOrbProps> = ({ clickShockRef, rotationTargetRef }) => {
  const { talkRef } = useHologram();
  const orbRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const bass = talkRef.current.bass;
    const shock = clickShockRef.current;

    // Decay shockwave
    clickShockRef.current *= 0.93;

    if (orbRef.current) {
      // Center remains stationary / face-on (no rotation)
      orbRef.current.rotation.set(0, 0, 0);

      // Gentle organic breath and acoustic pulse in scale only
      const breath = Math.sin(t * 1.4) * 0.008;
      const bassResonance = bass * 0.012;
      const clickPulse = shock * 0.04;

      const scale = 1.0 + breath + bassResonance + clickPulse;
      orbRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group ref={orbRef} position={[-0.04, 0.02, 0]}>
      {/* 1. Atmospheric Volumetric Glow Spheres */}
      <VolumetricGlowSpheres />

      {/* 2. Direct HD Reference Holographic Core (Spherical Curved Shells) */}
      <ReferenceOrbCore />

      {/* 3. Hero Sweeping Torus, Secondary Rings & Clean Gyroscope Core (Thin & Static) */}
      <OrbitalRings clickShockRef={clickShockRef} />

      {/* 4. Neural Synaptic Network & Racing Action Potentials (Brain Thinking) */}
      <NeuralSynapses clickShockRef={clickShockRef} />

      {/* 5. Ambient Spark Particles (ONLY element that rotates!) */}
      <PointCloud clickShockRef={clickShockRef} rotationTargetRef={rotationTargetRef} />

      {/* 6. Dynamic Core Flare & Ambient Halo (Lights up on Voice) */}
      <GlowSprites clickShockRef={clickShockRef} />
    </group>
  );
};
