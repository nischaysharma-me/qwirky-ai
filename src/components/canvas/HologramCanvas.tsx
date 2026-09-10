import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { HologramOrb } from './HologramOrb';
import { useHologram } from '../../context/HologramContext';

interface CameraZoomControllerProps {
  camDistRef: React.MutableRefObject<number>;
}

const CameraZoomController: React.FC<CameraZoomControllerProps> = ({ camDistRef }) => {
  const { camera, size } = useThree();
  const { updateAmplitude } = useHologram();
  const isInitialFramed = useRef(false);

  // Responsive camera framing for mobile portrait & tablets
  useEffect(() => {
    const aspect = size.width / Math.max(size.height, 1);
    let targetDistance = 5.6;

    if (aspect < 0.6) {
      // Standard mobile phones in portrait (aspect ~0.45 - 0.58)
      targetDistance = 7.8;
    } else if (aspect < 0.85) {
      // Wide phones / compact tablets portrait
      targetDistance = 6.8;
    } else if (aspect < 1.0) {
      // Standard tablets portrait
      targetDistance = 6.2;
    } else {
      // Landscape desktop / tablet
      targetDistance = 5.6;
    }

    // Set initial distance or update baseline on orientation flip
    if (!isInitialFramed.current) {
      camDistRef.current = targetDistance;
      camera.position.z = targetDistance;
      isInitialFramed.current = true;
    }
  }, [size.width, size.height, camera, camDistRef]);

  useFrame(() => {
    // Process audio state update on WebGL frame tick
    updateAmplitude();

    // Smooth camera zoom towards target distance
    camera.position.z += (camDistRef.current - camera.position.z) * 0.08;
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

  // Pointer & touch tracking for 1-finger drag, 2-finger pinch, and clean tap detection
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStartDistRef = useRef<number>(0);
  const pinchStartCamDistRef = useRef<number>(5.6);
  const touchStartRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });
  const hasDraggedRef = useRef<boolean>(false);

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      // Ignore interactions originating from UI controls
      if ((e.target as HTMLElement).closest('#hud-ui, button, header')) return;

      activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (activePointersRef.current.size === 1) {
        hasDraggedRef.current = false;
        touchStartRef.current = { x: e.clientX, y: e.clientY, time: performance.now() };
        rotationTargetRef.current.isDragging = true;
      } else if (activePointersRef.current.size === 2) {
        // Multi-touch pinch zoom started
        rotationTargetRef.current.isDragging = false;
        hasDraggedRef.current = true;

        const pts = Array.from(activePointersRef.current.values());
        pinchStartDistRef.current = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        pinchStartCamDistRef.current = camDistRef.current;
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!activePointersRef.current.has(e.pointerId)) return;

      if (activePointersRef.current.size === 2) {
        // Handle 2-finger pinch-to-zoom
        activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        const pts = Array.from(activePointersRef.current.values());
        const currentDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);

        if (pinchStartDistRef.current > 10) {
          const pinchScale = currentDist / pinchStartDistRef.current;
          const targetDist = pinchStartCamDistRef.current / pinchScale;
          camDistRef.current = Math.max(3.2, Math.min(10.0, targetDist));
        }
      } else if (activePointersRef.current.size === 1 && rotationTargetRef.current.isDragging) {
        // Handle 1-finger / mouse rotation drag
        const last = activePointersRef.current.get(e.pointerId) || { x: e.clientX, y: e.clientY };
        const dx = e.clientX - last.x;
        const dy = e.clientY - last.y;

        const distMoved = Math.hypot(e.clientX - touchStartRef.current.x, e.clientY - touchStartRef.current.y);
        if (distMoved > 8) {
          hasDraggedRef.current = true;
        }

        rotationTargetRef.current.y += dx * 0.004;
        rotationTargetRef.current.x += dy * 0.004;

        activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (activePointersRef.current.has(e.pointerId)) {
        // If 1 pointer was active and movement was minimal (<8px within 400ms), register as a clean tap
        if (activePointersRef.current.size === 1 && !hasDraggedRef.current) {
          const duration = performance.now() - touchStartRef.current.time;
          if (duration < 400) {
            clickShockRef.current = 1.0;
          }
        }
        activePointersRef.current.delete(e.pointerId);
      }

      if (activePointersRef.current.size === 0) {
        rotationTargetRef.current.isDragging = false;
        pinchStartDistRef.current = 0;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      camDistRef.current = Math.max(3.2, Math.min(10.0, camDistRef.current + e.deltaY * 0.0035));
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-10 w-full h-full touch-none select-none">
      <Canvas
        camera={{ position: [0, 0.05, 5.6], fov: 42, near: 0.1, far: 100 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        dpr={[1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 2, 2)]}
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
