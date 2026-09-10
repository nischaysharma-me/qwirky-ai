import React from 'react';
import { HologramProvider } from './context/HologramContext';
import { AtmosphericRoom } from './components/ui/AtmosphericRoom';
import { HologramCanvas } from './components/canvas/HologramCanvas';
import { AudioHUD } from './components/ui/AudioHUD';
import { Brain, Compass } from 'lucide-react';

export const App: React.FC = () => {
  return (
    <HologramProvider>
      <main className="relative w-screen h-screen overflow-hidden bg-[#080b15]">
        {/* Atmospheric Sci-Fi Backdrop */}
        <AtmosphericRoom />

        {/* Top Header Branding & Interaction Hint */}
        <header className="fixed top-3 left-4 right-4 sm:top-5 sm:left-6 sm:right-6 pt-[env(safe-area-inset-top)] z-20 flex items-center justify-between pointer-events-none select-none">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-amber-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center backdrop-blur-md shrink-0">
              <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-bold tracking-[0.2em] sm:tracking-[0.25em] font-mono-hud text-slate-100 uppercase">
                QWIRKY <span className="text-amber-400 font-normal">NEURAL AI</span>
              </h1>
              <p className="text-[9px] sm:text-[10px] tracking-widest text-slate-400 font-mono-hud uppercase">
                Synaptic Brain Matrix
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded bg-black/40 border border-white/10 text-[10px] font-mono-hud tracking-wider text-slate-400 backdrop-blur-md">
            <Compass className="w-3.5 h-3.5 text-slate-300" />
            <span>DRAG: ROTATE &middot; PINCH/SCROLL: ZOOM &middot; TAP: SHOCK</span>
          </div>
        </header>

        {/* 3D React-Three-Fiber Canvas */}
        <HologramCanvas />

        {/* Bottom Audio & Theme HUD Controls */}
        <AudioHUD />
      </main>
    </HologramProvider>
  );
};

export default App;
