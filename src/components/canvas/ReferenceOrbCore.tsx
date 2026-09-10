import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useHologram } from '../../context/HologramContext';

export const ReferenceOrbCore: React.FC = () => {
  const { theme, talkRef } = useHologram();

  const texLoader = useMemo(() => new THREE.TextureLoader(), []);

  // High-resolution pure extractions of the HD reference image with clean dark core for all metallic themes
  const textures = useMemo(() => ({
    gold: {
      pure: texLoader.load('/assets/holo_gold_darkcore.png'),
      full: texLoader.load('/assets/holo_gold_darkcore.png'),
      core: texLoader.load('/assets/holo_gold_isolated_core.png'),
    },
    silver: {
      pure: texLoader.load('/assets/holo_silver_darkcore.png'),
      full: texLoader.load('/assets/holo_silver_darkcore.png'),
      core: texLoader.load('/assets/holo_silver_isolated_core.png'),
    },
    platinum: {
      pure: texLoader.load('/assets/holo_platinum_darkcore.png'),
      full: texLoader.load('/assets/holo_platinum_darkcore.png'),
      core: texLoader.load('/assets/holo_platinum_isolated_core.png'),
    },
    bronze: {
      pure: texLoader.load('/assets/holo_bronze_darkcore.png'),
      full: texLoader.load('/assets/holo_bronze_darkcore.png'),
      core: texLoader.load('/assets/holo_bronze_isolated_core.png'),
    },
    purple: {
      pure: texLoader.load('/assets/holo_purp_darkcore.png'),
      full: texLoader.load('/assets/holo_purp_darkcore.png'),
      core: texLoader.load('/assets/holo_purp_isolated_core.png'),
    },
  }), [texLoader]);

  // Spherical curved dish geometry (no flat paper knife-edges or spears)
  const { frontGeometry, backGeometry } = useMemo(() => {
    function createCurvedDish(isBack = false) {
      const geom = new THREE.PlaneGeometry(4.2, 4.2, 40, 40);
      const pos = geom.attributes.position;
      const R = 2.4;

      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const r2 = x * x + y * y;
        const depthFactor = isBack ? 0.45 : -0.45;
        const z = r2 < R * R ? (R - Math.sqrt(R * R - r2)) * depthFactor : -0.5 * (isBack ? -1 : 1);
        pos.setZ(i, z);
      }
      geom.computeVertexNormals();
      return geom;
    }

    return {
      frontGeometry: createCurvedDish(false),
      backGeometry: createCurvedDish(true),
    };
  }, []);

  const frontMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const backMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const coreMatRef = useRef<THREE.MeshBasicMaterial>(null);

  // Update textures when theme toggles
  useEffect(() => {
    const currentTex = textures[theme];
    if (frontMatRef.current) {
      frontMatRef.current.map = currentTex.pure;
      frontMatRef.current.needsUpdate = true;
    }
    if (backMatRef.current) {
      backMatRef.current.map = currentTex.full;
      backMatRef.current.needsUpdate = true;
    }
    if (coreMatRef.current) {
      coreMatRef.current.map = currentTex.core;
      coreMatRef.current.needsUpdate = true;
    }
  }, [theme, textures]);

  const coreOpacityLevel = useRef<number>(0.0);

  useFrame(() => {
    const amp = talkRef.current.smoothAmp;
    const mid = talkRef.current.mid;
    const active = talkRef.current.active;

    if (frontMatRef.current) {
      frontMatRef.current.opacity = (active ? 0.95 : 0.82) + amp * 0.08;
    }
    if (backMatRef.current) {
      backMatRef.current.opacity = (active ? 0.6 : 0.35) + mid * 0.15;
    }

    // Core is strictly dark (0.0) by default in idle, ignites when active (up to 0.98)
    const targetCoreOpacity = active ? 0.40 + amp * 0.60 + mid * 0.25 : 0.0;
    coreOpacityLevel.current += (targetCoreOpacity - coreOpacityLevel.current) * 0.15;

    if (coreMatRef.current) {
      const isLit = coreOpacityLevel.current > 0.005;
      coreMatRef.current.visible = isLit;
      coreMatRef.current.opacity = isLit ? coreOpacityLevel.current : 0.0;
    }
  });

  return (
    <group>
      {/* Front Spherical Curved Hologram Shell (Clean dark core center in idle) */}
      <mesh geometry={frontGeometry} position={[0, 0, 0.08]}>
        <meshBasicMaterial
          ref={frontMatRef}
          map={textures[theme].pure}
          transparent
          opacity={0.92}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Back Spherical Curved Hologram Shell (Provides 360° Spherical Depth) */}
      <mesh geometry={backGeometry} position={[0, 0, -0.08]}>
        <meshBasicMaterial
          ref={backMatRef}
          map={textures[theme].full}
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* High-Resolution Center Core Aperture Layer (Strictly 0 opacity when idle, ignites when active) */}
      <mesh position={[0, 0, 0.02]} visible={false}>
        <planeGeometry args={[3.8, 3.8]} />
        <meshBasicMaterial
          ref={coreMatRef}
          map={textures[theme].core}
          transparent
          opacity={0.0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};
