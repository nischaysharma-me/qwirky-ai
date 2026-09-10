import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useHologram } from '../../context/HologramContext';

export const VolumetricGlowSpheres: React.FC = () => {
  const { colors, talkRef } = useHologram();

  const sphereConfigs = [
    { r: 0.28, baseOpacity: 0.35, isCore: true },
    { r: 0.75, baseOpacity: 0.14, isCore: true },
    { r: 1.45, baseOpacity: 0.025, isCore: false },
  ];

  const matRefs = useRef<THREE.MeshBasicMaterial[]>([]);

  useFrame(() => {
    const mid = talkRef.current.mid;
    const active = talkRef.current.active;

    matRefs.current.forEach((mat, idx) => {
      if (mat) {
        mat.color.setHex(idx === 0 ? colors.bright : colors.main);
        if (sphereConfigs[idx].isCore) {
          // Literally 0 opacity when idle; illuminates only during speech/listening
          mat.opacity = active ? sphereConfigs[idx].baseOpacity * (1.0 + mid * 0.8) : 0.0;
        } else {
          mat.opacity = active ? sphereConfigs[idx].baseOpacity * 1.5 : sphereConfigs[idx].baseOpacity;
        }
      }
    });
  });

  return (
    <group>
      {sphereConfigs.map((cfg, idx) => (
        <mesh key={`glow-sphere-${idx}`}>
          <sphereGeometry args={[cfg.r, 32, 32]} />
          <meshBasicMaterial
            ref={(el) => {
              if (el) matRefs.current[idx] = el;
            }}
            color={idx === 0 ? colors.bright : colors.main}
            transparent
            opacity={cfg.isCore ? 0.0 : cfg.baseOpacity}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.BackSide}
          />
        </mesh>
      ))}
    </group>
  );
};
