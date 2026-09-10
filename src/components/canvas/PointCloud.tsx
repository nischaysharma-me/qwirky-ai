import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useHologram } from '../../context/HologramContext';
import { HologramTheme } from '../../types/hologram';
import { getGlowTexture } from '../../utils/textures';

interface PointCloudProps {
  clickShockRef: React.MutableRefObject<number>;
  rotationTargetRef?: React.MutableRefObject<{ x: number; y: number; isDragging: boolean }>;
}

function getParticleRGB(themeName: HologramTheme, intensity: number): [number, number, number] {
  const int2 = intensity * intensity;
  switch (themeName) {
    case 'silver':
      return [
        0.82 + 0.18 * intensity,
        0.87 + 0.13 * intensity,
        0.96 + 0.04 * intensity,
      ];
    case 'platinum':
      return [
        0.76 + 0.24 * intensity,
        0.89 + 0.11 * intensity,
        0.98 + 0.02 * intensity,
      ];
    case 'bronze':
      return [
        0.92 + 0.08 * intensity,
        0.52 + 0.35 * intensity,
        0.18 + 0.25 * int2,
      ];
    case 'purple':
      // Metallic Purple (Anodized titanium violet with silvery-lilac specular glints)
      return [
        0.72 + 0.28 * intensity,
        0.26 + 0.68 * int2,
        0.96 + 0.04 * intensity,
      ];
    case 'gold':
    default:
      return [
        1.0,
        0.55 + 0.42 * intensity,
        0.05 + 0.35 * int2,
      ];
  }
}

export const PointCloud: React.FC<PointCloudProps> = ({ clickShockRef, rotationTargetRef }) => {
  const { theme, talkRef } = useHologram();
  const glowTex = useMemo(() => getGlowTexture(), []);

  const pointsRef = useRef<THREE.Points>(null);
  const shaderMatRef = useRef<THREE.ShaderMaterial>(null);

  const cloudRotY = useRef(0);
  const cloudRotX = useRef(0);

  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const pointIntensitiesRef = useRef<Float32Array | null>(null);
  const pointColorsRef = useRef<Float32Array | null>(null);

  // Custom Shader for uneven small particle sizes & periodic random flashes
  const shaderDef = useMemo(() => {
    return {
      uniforms: {
        uMap: { value: glowTex },
        uTime: { value: 0 },
        uBaseSize: { value: 0.024 },
        uAlpha: { value: 0.78 },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uBaseSize;
        attribute float aScale;
        attribute float aPhase;
        attribute float aFreq;
        varying vec3 vColor;
        varying float vFlash;

        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

          // Random intermittent flashing at certain intervals
          float pulse = sin(uTime * aFreq + aPhase);
          // Sharp flash spike when pulse reaches top of cycle
          float flash = pow(max(0.0, pulse), 16.0);
          vFlash = flash;

          // Small uneven sizes: all are small, with sudden flare when lighting up
          float pointSize = uBaseSize * aScale * (1.0 + flash * 1.6);
          gl_PointSize = pointSize * (260.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D uMap;
        uniform float uAlpha;
        varying vec3 vColor;
        varying float vFlash;

        void main() {
          vec4 tex = texture2D(uMap, gl_PointCoord);
          if (tex.a < 0.015) discard;

          // Light up intensely with brilliant white-gold flash
          vec3 flashCol = mix(vColor, vec3(1.0, 0.98, 0.88), vFlash * 0.85);
          float finalAlpha = tex.a * uAlpha * (0.60 + vFlash * 0.40);

          gl_FragColor = vec4(flashCol, finalAlpha);
        }
      `,
    };
  }, [glowTex]);

  // Fetch binary point cloud data
  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const res = await fetch('/assets/holo_points.bin');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const buffer = await res.arrayBuffer();
        if (!active) return;

        const f32 = new Float32Array(buffer);
        const totalPoints = Math.floor(f32.length / 5);

        // Increased particle density: stride 2 yields ~20,000+ points
        const stride = 2;
        const validPositions: number[] = [];
        const validColors: number[] = [];
        const validIntensities: number[] = [];
        const validScales: number[] = [];
        const validPhases: number[] = [];
        const validFreqs: number[] = [];

        for (let i = 0; i < totalPoints; i += stride) {
          const px = f32[i * 5];
          const py = f32[i * 5 + 1];
          const pz = f32[i * 5 + 2];

          // Keep the core aperture clean and dark
          const distSq = px * px + py * py + pz * pz;
          if (distSq < 0.40 * 0.40) continue;

          validPositions.push(px, py, pz);
          const intensity = f32[i * 5 + 3];
          validIntensities.push(intensity);

          // Uneven small sizes (all small: 0.38 - 1.25 multiplier)
          const scale = 0.38 + Math.random() * 0.85;
          validScales.push(scale);

          // Random phase and frequency for interval lighting up
          validPhases.push(Math.random() * 6.28318);
          validFreqs.push(0.8 + Math.random() * 3.2);

          const [cr, cg, cb] = getParticleRGB(theme, intensity);
          validColors.push(cr, cg, cb);
        }

        const positions = new Float32Array(validPositions);
        const colors = new Float32Array(validColors);
        const intensities = new Float32Array(validIntensities);
        const scales = new Float32Array(validScales);
        const phases = new Float32Array(validPhases);
        const freqs = new Float32Array(validFreqs);

        pointIntensitiesRef.current = intensities;
        pointColorsRef.current = colors;

        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geom.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
        geom.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
        geom.setAttribute('aFreq', new THREE.BufferAttribute(freqs, 1));
        setGeometry(geom);
      } catch (err) {
        console.warn('Failed to load holo_points.bin, falling back to procedural points:', err);
        // Rich procedural fallback with 20,000 points
        const count = 20000;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const intensities = new Float32Array(count);
        const scales = new Float32Array(count);
        const phases = new Float32Array(count);
        const freqs = new Float32Array(count);

        for (let i = 0; i < count; i++) {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(Math.random() * 2 - 1);
          const r = 0.95 + Math.random() * 0.9;
          positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
          positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
          positions[i * 3 + 2] = r * Math.cos(phi);
          const intensity = Math.random();
          intensities[i] = intensity;

          scales[i] = 0.38 + Math.random() * 0.85;
          phases[i] = Math.random() * 6.28318;
          freqs[i] = 0.8 + Math.random() * 3.2;

          const [cr, cg, cb] = getParticleRGB(theme, intensity);
          colors[i * 3] = cr;
          colors[i * 3 + 1] = cg;
          colors[i * 3 + 2] = cb;
        }

        pointIntensitiesRef.current = intensities;
        pointColorsRef.current = colors;

        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geom.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
        geom.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
        geom.setAttribute('aFreq', new THREE.BufferAttribute(freqs, 1));
        setGeometry(geom);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  // Update vertex colors when theme toggles
  useEffect(() => {
    if (!geometry || !pointIntensitiesRef.current || !pointColorsRef.current) return;

    const intensities = pointIntensitiesRef.current;
    const colors = pointColorsRef.current;
    const N = intensities.length;

    for (let i = 0; i < N; i++) {
      const int = intensities[i];
      const [cr, cg, cb] = getParticleRGB(theme, int);
      colors[i * 3] = cr;
      colors[i * 3 + 1] = cg;
      colors[i * 3 + 2] = cb;
    }

    const colorAttr = geometry.getAttribute('color') as THREE.BufferAttribute;
    if (colorAttr) {
      colorAttr.needsUpdate = true;
    }
  }, [theme, geometry]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.04);
    const t = state.clock.elapsedTime;
    const mid = talkRef.current.mid;
    const amp = talkRef.current.smoothAmp;
    const shock = clickShockRef.current;

    // Continuous orbital rotation - ONLY the particle cloud rotates!
    const rotSpeed = 0.08 + amp * 0.06;
    cloudRotY.current += dt * rotSpeed;

    if (pointsRef.current) {
      if (rotationTargetRef?.current?.isDragging) {
        cloudRotY.current += (rotationTargetRef.current.y - cloudRotY.current) * 0.12;
        cloudRotX.current += (rotationTargetRef.current.x - cloudRotX.current) * 0.12;
      }
      pointsRef.current.rotation.y = cloudRotY.current;
      pointsRef.current.rotation.x = cloudRotX.current * 0.45;
    }

    if (shaderMatRef.current) {
      // Dynamic time uniform driving interval flash sparkle
      shaderMatRef.current.uniforms.uTime.value = t * (1.0 + amp * 1.5);
      shaderMatRef.current.uniforms.uBaseSize.value = 0.024 + mid * 0.005 + shock * 0.015;
      shaderMatRef.current.uniforms.uAlpha.value = 0.78 + mid * 0.15;
    }
  });

  if (!geometry) return null;

  return (
    <points ref={pointsRef} geometry={geometry}>
      <shaderMaterial
        ref={shaderMatRef}
        args={[shaderDef]}
        transparent
        vertexColors
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};
