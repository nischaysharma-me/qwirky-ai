import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useHologram } from '../../context/HologramContext';
import { getGlowTexture } from '../../utils/textures';

interface NeuralSynapsesProps {
  clickShockRef: React.MutableRefObject<number>;
}

interface Impulse {
  fromIdx: number;
  toIdx: number;
  progress: number;
  speed: number;
  colorType: 'bright' | 'hot';
}

export const NeuralSynapses: React.FC<NeuralSynapsesProps> = ({ clickShockRef }) => {
  const { colors, talkRef } = useHologram();
  const glowTex = useMemo(() => getGlowTexture(), []);

  // 1. Generate 90 Neuron Nodes distributed across the spherical cortex
  const { nodes, connections, axonGeometry } = useMemo(() => {
    const nodeCount = 96;
    const nodeList: THREE.Vector3[] = [];
    const radius = 1.62;

    // Fibonacci sphere distribution with organic perturbations
    const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle
    for (let i = 0; i < nodeCount; i++) {
      const y = 1 - (i / (nodeCount - 1)) * 2; // from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      // Subtle organic brain lobing (slight groove along sagittal line)
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      // Slight hemisphere dent on Z for brain contour
      const r = radius * (1.0 + (Math.sin(i * 12.3) * 0.5 + 0.5) * 0.12);
      nodeList.push(new THREE.Vector3(x * r, y * r, z * r));
    }

    // Connect nearby neurons with axons (k-nearest neighbors)
    const connMap: { [key: number]: number[] } = {};
    const linePositions: number[] = [];

    for (let i = 0; i < nodeCount; i++) {
      connMap[i] = [];
      const dists: { idx: number; d: number }[] = [];

      for (let j = 0; j < nodeCount; j++) {
        if (i === j) continue;
        const d = nodeList[i].distanceTo(nodeList[j]);
        if (d < 0.95) {
          dists.push({ idx: j, d });
        }
      }

      dists.sort((a, b) => a.d - b.d);
      // Connect to the 3-4 closest neighbors
      const neighbors = dists.slice(0, 3);
      for (const n of neighbors) {
        connMap[i].push(n.idx);
        linePositions.push(
          nodeList[i].x, nodeList[i].y, nodeList[i].z,
          nodeList[n.idx].x, nodeList[n.idx].y, nodeList[n.idx].z
        );
      }
    }

    const axonGeom = new THREE.BufferGeometry();
    axonGeom.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));

    return {
      nodes: nodeList,
      connections: connMap,
      axonGeometry: axonGeom,
    };
  }, []);

  // 2. Fast Racing Synaptic Action Potentials ("Horses running rapidly")
  const impulseCount = 64;
  const impulses = useRef<Impulse[]>([]);
  const impulseGeometryRef = useRef<THREE.BufferGeometry>(null);
  const impulsePositions = useMemo(() => new Float32Array(impulseCount * 3), [impulseCount]);

  // Initialize racing impulses
  useMemo(() => {
    const list: Impulse[] = [];
    for (let i = 0; i < impulseCount; i++) {
      const from = Math.floor(Math.random() * nodes.length);
      const neighbors = connections[from] || [0];
      const to = neighbors[Math.floor(Math.random() * neighbors.length)] ?? 0;
      list.push({
        fromIdx: from,
        toIdx: to,
        progress: Math.random(),
        // Fast speeds: impulses dart across in 0.15 - 0.35 seconds!
        speed: 3.8 + Math.random() * 4.8,
        colorType: i % 3 === 0 ? 'bright' : 'hot',
      });
    }
    impulses.current = list;
  }, [nodes, connections, impulseCount]);

  // Node glowing mesh & point refs
  const axonMatRef = useRef<THREE.LineBasicMaterial>(null);
  const impulsePointsRef = useRef<THREE.Points>(null);
  const impulseMatRef = useRef<THREE.PointsMaterial>(null);
  const nodePointsRef = useRef<THREE.Points>(null);
  const nodeMatRef = useRef<THREE.PointsMaterial>(null);

  // BufferGeometry for node soma points
  const nodeGeometry = useMemo(() => {
    const pos = new Float32Array(nodes.length * 3);
    for (let i = 0; i < nodes.length; i++) {
      pos[i * 3] = nodes[i].x;
      pos[i * 3 + 1] = nodes[i].y;
      pos[i * 3 + 2] = nodes[i].z;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, [nodes]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.04);
    const amp = talkRef.current.smoothAmp;
    const mid = talkRef.current.mid;
    const active = talkRef.current.active;
    const shock = clickShockRef.current;

    // In idle: calm resting brain. In talk/active: hyper-speed neural firing ("horses running rapidly")
    const thoughtSpeedMult = active
      ? 4.5 + mid * 6.5 + amp * 8.0 + shock * 10.0
      : 0.8 + shock * 6.0;

    // Update racing impulses
    const list = impulses.current;
    for (let i = 0; i < list.length; i++) {
      const imp = list[i];
      imp.progress += imp.speed * dt * thoughtSpeedMult * 0.28;

      if (imp.progress >= 1.0) {
        imp.progress = 0;
        imp.fromIdx = imp.toIdx;
        const nextNeighbors = connections[imp.fromIdx] || [0];
        imp.toIdx = nextNeighbors[Math.floor(Math.random() * nextNeighbors.length)] ?? 0;
        imp.speed = 3.8 + Math.random() * 4.8;
      }

      const p1 = nodes[imp.fromIdx];
      const p2 = nodes[imp.toIdx];
      if (p1 && p2) {
        const t = imp.progress;
        // Direct linear interpolation with slight outward curve
        const px = p1.x + (p2.x - p1.x) * t;
        const py = p1.y + (p2.y - p1.y) * t;
        const pz = p1.z + (p2.z - p1.z) * t;

        // Micro outward arc
        const arc = Math.sin(t * Math.PI) * 0.04;
        const len = Math.sqrt(px * px + py * py + pz * pz) || 1;

        impulsePositions[i * 3] = px + (px / len) * arc;
        impulsePositions[i * 3 + 1] = py + (py / len) * arc;
        impulsePositions[i * 3 + 2] = pz + (pz / len) * arc;
      }
    }

    if (impulseGeometryRef.current) {
      const posAttr = impulseGeometryRef.current.getAttribute('position') as THREE.BufferAttribute;
      if (posAttr) {
        posAttr.copyArray(impulsePositions);
        posAttr.needsUpdate = true;
      }
    }

    // Material dynamic glows
    if (axonMatRef.current) {
      axonMatRef.current.color.setHex(colors.main);
      // Axon lines are whisper-faint / nearly invisible, so only the moving particles stand out
      axonMatRef.current.opacity = active ? 0.03 : 0.012;
    }

    if (nodeMatRef.current) {
      nodeMatRef.current.color.setHex(colors.hot);
      nodeMatRef.current.size = 0.024;
      nodeMatRef.current.opacity = active ? 0.18 : 0.06;
    }

    if (impulseMatRef.current) {
      impulseMatRef.current.color.setHex(colors.bright);
      // Vivid, luminous moving particles
      impulseMatRef.current.size = active ? 0.085 + mid * 0.06 + shock * 0.07 : 0.045;
      impulseMatRef.current.opacity = active ? 1.0 : 0.45;
    }
  });

  return (
    <group>
      {/* 1. Neural Axon Pathways (Nearly invisible so lines do not distract) */}
      <lineSegments geometry={axonGeometry}>
        <lineBasicMaterial
          ref={axonMatRef}
          color={colors.main}
          transparent
          opacity={0.02}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* 2. Neuron Soma Nodes (Faint resting synapses) */}
      <points ref={nodePointsRef} geometry={nodeGeometry}>
        <pointsMaterial
          ref={nodeMatRef}
          map={glowTex}
          size={0.024}
          color={colors.hot}
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* 3. Fast Racing Moving Particles ("Horses Running Rapidly") - Primary Visual */}
      <points ref={impulsePointsRef}>
        <bufferGeometry ref={impulseGeometryRef}>
          <bufferAttribute
            attach="attributes-position"
            args={[impulsePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={impulseMatRef}
          map={glowTex}
          size={0.085}
          color={colors.bright}
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
};
