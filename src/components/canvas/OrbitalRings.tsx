import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useHologram } from '../../context/HologramContext';

interface OrbitalRingsProps {
  clickShockRef: React.MutableRefObject<number>;
}

export const OrbitalRings: React.FC<OrbitalRingsProps> = ({ clickShockRef }) => {
  const { colors, talkRef } = useHologram();

  const ringRefs = useRef<THREE.Mesh[]>([]);
  const gyroRefs = useRef<THREE.Mesh[]>([]);

  const RING_COUNT = 12;
  const RING_RADIUS = 1.40;
  const RING_TUBE = 0.0020; // Ultra-fine, delicate hairline wire

  // 12 Thin Precision Surrounding Rings of Identical Size & Color (Light & Ethereal)
  const ringsConfig = useMemo(() => {
    return Array.from({ length: RING_COUNT }).map((_, i) => {
      // Golden spiral distribution of normal axes to create a balanced spherical armillary cage
      const phi = Math.acos(-1 + (2 * (i + 0.5)) / RING_COUNT);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      const normal = new THREE.Vector3(
        Math.cos(theta) * Math.sin(phi),
        Math.sin(theta) * Math.sin(phi),
        Math.cos(phi)
      ).normalize();

      // Derive orientation from normal vector
      const quat = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        normal
      );
      const euler = new THREE.Euler().setFromQuaternion(quat);

      // Alternating gentle rotation speeds for hypnotic counter-rotating orbital elegance
      const direction = i % 2 === 0 ? 1 : -1;
      const baseSpd = (0.045 + (i % 5) * 0.012) * direction;

      return {
        id: i,
        rot: [euler.x, euler.y, euler.z] as [number, number, number],
        axis: normal,
        spd: baseSpd,
      };
    });
  }, []);

  // Five Clean Core Gyroscope Rings (Inside the central aperture nucleus, thin, hidden in idle)
  const gyroConfigs = useMemo(() => {
    return Array.from({ length: 5 }).map((_, i) => ({
      r: 0.14 + i * 0.05,
      tube: 0.0016,
      rot: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [number, number, number],
      axis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
      spd: (Math.random() - 0.5) * 1.1,
      isBright: i < 2,
    }));
  }, []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.04);
    const amp = talkRef.current.smoothAmp;
    const mid = talkRef.current.mid;
    const shock = clickShockRef.current;
    const active = talkRef.current.active;

    const speedMult = 1.0 + mid * 1.6 + amp * 0.8 + shock * 2.5;

    // Surrounding rings rotate smoothly, all identical in size and color, very light so as not to disturb the core
    ringsConfig.forEach((cfg, idx) => {
      const mesh = ringRefs.current[idx];
      if (mesh) {
        mesh.rotateOnAxis(cfg.axis, cfg.spd * dt * speedMult);
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.color.setHex(colors.hot);
        mat.opacity = 0.22 + (active ? amp * 0.14 : 0);
      }
    });

    // Inner core gyroscope rings (Visible everytime, gentle spin in idle, flaring on speech)
    const spinMult = active ? (1.0 + mid * 1.6 + amp * 0.8 + shock * 2.5) * 1.4 : 0.45;
    gyroConfigs.forEach((cfg, idx) => {
      const mesh = gyroRefs.current[idx];
      if (mesh) {
        mesh.rotateOnAxis(cfg.axis, cfg.spd * dt * spinMult);
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.color.setHex(cfg.isBright ? colors.bright : colors.hot);
        mat.opacity = active ? 0.70 + amp * 0.30 : 0.42;
        mesh.visible = true;
      }
    });
  });

  return (
    <group>
      {/* 12 Surrounding Precision Thin Rings of Identical Size and Color (Very light & subtle) */}
      {ringsConfig.map((cfg, idx) => (
        <mesh
          key={`orbital-ring-${idx}`}
          ref={(el) => {
            if (el) ringRefs.current[idx] = el;
          }}
          rotation={cfg.rot}
        >
          <torusGeometry args={[RING_RADIUS, RING_TUBE, 8, 240]} />
          <meshBasicMaterial
            color={colors.hot}
            transparent
            opacity={0.22}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* Clean Core Gyroscope Rings (Visible everytime, thin) */}
      {gyroConfigs.map((cfg, idx) => (
        <mesh
          key={`gyro-ring-${idx}`}
          ref={(el) => {
            if (el) gyroRefs.current[idx] = el;
          }}
          rotation={cfg.rot}
          visible={true}
        >
          <torusGeometry args={[cfg.r, cfg.tube, 6, 96]} />
          <meshBasicMaterial
            color={cfg.isBright ? colors.bright : colors.hot}
            transparent
            opacity={0.42}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
};
