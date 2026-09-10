import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useHologram } from '../../context/HologramContext';
import { getGlowTexture } from '../../utils/textures';

interface GlowSpritesProps {
  clickShockRef: React.MutableRefObject<number>;
}

export const GlowSprites: React.FC<GlowSpritesProps> = ({ clickShockRef }) => {
  const { colors, talkRef } = useHologram();
  const glowTex = useMemo(() => getGlowTexture(), []);

  const coreSpriteRef = useRef<THREE.Sprite>(null);
  const outerHaloRef = useRef<THREE.Sprite>(null);

  // Smooth core activation illumination level (0 = dark, 1 = blazing core)
  const coreLightLevel = useRef<number>(0);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const amp = talkRef.current.smoothAmp;
    const mid = talkRef.current.mid;
    const active = talkRef.current.active;
    const shock = clickShockRef.current;

    // Target light level: strictly 0 when idle, blazing when active/talking (0.35 to 1.0)
    const targetLight = active ? 0.40 + amp * 0.60 + mid * 0.35 + shock * 0.4 : shock * 0.4;
    coreLightLevel.current += (targetLight - coreLightLevel.current) * 0.14;
    const light = coreLightLevel.current;
    const isLit = light > 0.005;

    if (coreSpriteRef.current) {
      // Core is literally dark when idle, and flares to life when speaking/listening
      coreSpriteRef.current.visible = isLit;
      if (isLit) {
        const coreScale = 0.5 + light * 1.9;
        coreSpriteRef.current.scale.set(coreScale, coreScale, 1);
        (coreSpriteRef.current.material as THREE.SpriteMaterial).opacity = light * 0.95;
        (coreSpriteRef.current.material as THREE.SpriteMaterial).color.setHex(colors.bright);
      }
    }

    if (outerHaloRef.current) {
      // Ambient halo is literally dark when idle, blooms during speech
      outerHaloRef.current.visible = isLit;
      if (isLit) {
        const haloBreath = Math.sin(t * 1.2) * 0.08;
        const haloScale = 3.6 + haloBreath + light * 2.2;
        outerHaloRef.current.scale.set(haloScale, haloScale, 1);
        (outerHaloRef.current.material as THREE.SpriteMaterial).opacity = light * 0.35;
        (outerHaloRef.current.material as THREE.SpriteMaterial).color.setHex(colors.deep);
      }
    }
  });

  return (
    <group>
      {/* Central Core Flare (Literally 0 when idle, ignites into light when talking) */}
      <sprite ref={coreSpriteRef} scale={[0.6, 0.6, 1]} visible={false}>
        <spriteMaterial
          map={glowTex}
          color={colors.bright}
          transparent
          opacity={0.0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>

      {/* Outer Ambient Halo (Literally 0 in idle, radiates during speech) */}
      <sprite ref={outerHaloRef} scale={[3.6, 3.6, 1]} visible={false}>
        <spriteMaterial
          map={glowTex}
          color={colors.deep}
          transparent
          opacity={0.0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
    </group>
  );
};
