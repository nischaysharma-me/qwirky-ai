import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { HologramOrb } from './HologramOrb';
import { useHologram } from '../../context/HologramContext';

interface CameraZoomControllerProps {
  camDistRef: React.MutableRefObject<number>;
}

const CameraZoomController: React.FC<CameraZoomControllerProps> = ({ camDistRef }) => {
  const { camera } = useThree();
  const { updateAmplitude } = useHologram();

  useFrame(() => {
    // Process audio state update on WebGL frame tick
    updateAmplitude();

    // Smooth camera zoom towards target distance
    camera.position.z += (camDistRef.current - camera.position.z) * 0.06;
  });

  return null;
};

export const HologramCanvas: React.FC = () => {
  const clickShockRef = useRef<number>(0);
  const camDistRef = useRef<number>(5.6);
  const rotationTargetRef = useRef<{ x: number; y: number; isDragging: boolean }>({
    x: 0,
    y: 0,
    isDragging: false,
  });

  const lastPointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('#hud-ui')) return;
      rotationTargetRef.current.isDragging = true;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = () => {
      rotationTargetRef.current.isDragging = false;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!rotationTargetRef.current.isDragging) return;
      const dx = e.clientX - lastPointerRef.current.x;
      const dy = e.clientY - lastPointerRef.current.y;

      rotationTargetRef.current.y += dx * 0.0035;
      rotationTargetRef.current.x += dy * 0.0035;

      lastPointerRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleWheel = (e: WheelEvent) => {
      camDistRef.current = Math.max(3.2, Math.min(8.5, camDistRef.current + e.deltaY * 0.0035));
    };

    const handleClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('#hud-ui')) return;
      clickShockRef.current = 1.0;
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-10 w-full h-full">
      <Canvas
        camera={{ position: [0, 0.05, 5.6], fov: 42, near: 0.1, far: 100 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        dpr={[1, 2]}
      >
        <CameraZoomController camDistRef={camDistRef} />
        <HologramOrb
          clickShockRef={clickShockRef}
          rotationTargetRef={rotationTargetRef}
        />
      </Canvas>
    </div>
  );
};
