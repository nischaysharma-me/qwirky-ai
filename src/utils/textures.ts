import * as THREE from 'three';

let cachedGlowTex: THREE.CanvasTexture | null = null;

export function getGlowTexture(): THREE.CanvasTexture {
  if (cachedGlowTex) return cachedGlowTex;

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.12, 'rgba(255, 230, 180, 0.95)');
    gradient.addColorStop(0.38, 'rgba(255, 140, 20, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 80, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
  }

  cachedGlowTex = new THREE.CanvasTexture(canvas);
  return cachedGlowTex;
}
