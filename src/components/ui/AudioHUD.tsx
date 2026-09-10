import React from 'react';
import { useHologram } from '../../context/HologramContext';
import { THEME_OPTIONS, HologramTheme } from '../../types/hologram';
import { Mic, Radio, Palette, Brain, Ear, Activity } from 'lucide-react';

export const AudioHUD: React.FC = () => {
  const { theme, setTheme, toggleTheme, talkMode, hudBands, toggleMic, toggleSim } = useHologram();

  const getThemeStyle = (th: HologramTheme) => {
    switch (th) {
      case 'silver':
        return {
          name: 'SILVER',
          btnClass: 'bg-slate-300/20 border-slate-300/70 text-slate-100 shadow-[0_0_12px_rgba(208,216,226,0.35)] hover:bg-slate-300/30',
          dotClass: 'bg-[#d0d8e2] shadow-[0_0_6px_#ffffff]',
          pulseColor: 'bg-slate-300 shadow-[0_0_8px_#d0d8e2]',
          eqGradient: 'from-slate-600 via-slate-300 to-white',
        };
      case 'platinum':
        return {
          name: 'PLATINUM',
          btnClass: 'bg-cyan-200/20 border-cyan-200/70 text-cyan-100 shadow-[0_0_12px_rgba(194,226,240,0.4)] hover:bg-cyan-200/30',
          dotClass: 'bg-[#c2e2f0] shadow-[0_0_6px_#f4fcff]',
          pulseColor: 'bg-cyan-200 shadow-[0_0_8px_#c2e2f0]',
          eqGradient: 'from-cyan-700 via-cyan-300 to-white',
        };
      case 'bronze':
        return {
          name: 'BRONZE',
          btnClass: 'bg-amber-700/25 border-amber-600/70 text-amber-200 shadow-[0_0_12px_rgba(205,127,50,0.35)] hover:bg-amber-700/35',
          dotClass: 'bg-[#cd7f32] shadow-[0_0_6px_#eea55d]',
          pulseColor: 'bg-amber-600 shadow-[0_0_8px_#cd7f32]',
          eqGradient: 'from-amber-800 via-amber-500 to-orange-200',
        };
      case 'purple':
        return {
          name: 'MET. PURPLE',
          btnClass: 'bg-purple-900/35 border-purple-400/80 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.35)] hover:bg-purple-900/50',
          dotClass: 'bg-[#a855f7] shadow-[0_0_6px_#e9d5ff]',
          pulseColor: 'bg-[#a855f7] shadow-[0_0_8px_#e9d5ff]',
          eqGradient: 'from-purple-900 via-purple-500 to-purple-200',
        };
      case 'gold':
      default:
        return {
          name: 'GOLD',
          btnClass: 'bg-amber-500/20 border-amber-400/80 text-amber-200 shadow-[0_0_12px_rgba(255,170,0,0.35)] hover:bg-amber-500/30',
          dotClass: 'bg-[#ffaa00] shadow-[0_0_6px_#ffdd55]',
          pulseColor: 'bg-[#ffaa00] shadow-[0_0_8px_#ffaa00]',
          eqGradient: 'from-amber-600 via-yellow-400 to-amber-200',
        };
    }
  };

  const themeStyle = getThemeStyle(theme);

  const getStatusText = () => {
    if (talkMode === 'mic') return 'AI LISTENING // NEURAL SYNAPSES ENGAGED';
    if (talkMode === 'sim') return 'AI THINKING // RAPID SYNAPTIC FIRING ACTIVE';
    return 'QWIRKY BRAIN // 96 SYNAPTIC NODES ONLINE';
  };

  return (
    <div
      id="hud-ui"
      className="fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 sm:gap-3 select-none pointer-events-auto w-[96vw] max-w-fit pb-[env(safe-area-inset-bottom)]"
    >
      {/* Top Status Capsule */}
      <div className="flex items-center gap-2 px-3 py-0.5 sm:px-3.5 sm:py-1 rounded-full bg-[#0b0f19]/85 border border-white/10 backdrop-blur-md text-[9px] sm:text-[10px] tracking-wider sm:tracking-widest font-mono-hud text-slate-300 uppercase shadow-lg max-w-[92vw] overflow-hidden">
        <span
          className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 transition-all duration-300 ${
            talkMode === 'mic'
              ? 'bg-emerald-400 shadow-[0_0_8px_#34d399] animate-ping'
              : talkMode === 'sim'
              ? `${themeStyle.pulseColor} animate-pulse`
              : 'bg-slate-500'
          }`}
        />
        <div className="flex items-center gap-1.5 truncate">
          {talkMode === 'mic' ? (
            <Ear className="w-3 h-3 text-emerald-400 shrink-0" />
          ) : talkMode === 'sim' ? (
            <Brain className="w-3 h-3 text-amber-400 animate-pulse shrink-0" />
          ) : (
            <Activity className="w-3 h-3 text-slate-400 shrink-0" />
          )}
          <span className="truncate">{getStatusText()}</span>
        </div>
      </div>

      {/* Main Futuristic Glass Control Bar */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-2 sm:gap-3.5 bg-[#080c18]/90 border border-white/15 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-xl shadow-2xl backdrop-blur-xl">
        {/* Metallic Theme Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <span className="text-[9px] tracking-widest text-slate-400 font-mono-hud uppercase hidden md:inline">
            THEME
          </span>
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 text-[10px] sm:text-[11px] font-mono-hud uppercase tracking-wider rounded border transition-all duration-200 min-h-[34px] sm:min-h-[36px] touch-manipulation active:scale-95 ${themeStyle.btnClass}`}
            title="Press 'C' to cycle metallic themes"
          >
            <Palette className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="font-semibold text-[10px] sm:text-[11px]">{themeStyle.name}</span>
          </button>

          {/* Quick Metallic Preset Dots */}
          <div className="flex items-center gap-1.5 px-2 py-1.5 bg-black/40 rounded border border-white/10">
            {THEME_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setTheme(opt.id)}
                title={`Switch to ${opt.label}`}
                className={`w-3.5 h-3.5 sm:w-3 sm:h-3 rounded-full transition-all duration-200 border touch-manipulation ${
                  theme === opt.id
                    ? 'scale-125 border-white ring-1 ring-white/70'
                    : 'border-white/30 opacity-60 hover:opacity-100 hover:scale-110 active:scale-95'
                }`}
                style={{ backgroundColor: opt.hex }}
              />
            ))}
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="hidden sm:block w-[1px] h-5 bg-white/15" />

        {/* Voice Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-[9px] tracking-widest text-slate-400 font-mono-hud uppercase hidden md:inline">
            VOICE
          </span>

          {/* Mic Button */}
          <button
            onClick={toggleMic}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-[10px] sm:text-[11px] font-mono-hud uppercase tracking-wider rounded border transition-all duration-200 min-h-[34px] sm:min-h-[36px] touch-manipulation active:scale-95 ${
              talkMode === 'mic'
                ? 'bg-emerald-500/35 border-emerald-400 text-emerald-100 shadow-[0_0_14px_rgba(52,211,153,0.5)] ring-1 ring-emerald-400/50'
                : 'bg-white/5 border-white/15 text-slate-300 hover:bg-white/10 hover:border-white/30 active:bg-white/20'
            }`}
            title="Toggle Microphone Listening"
          >
            <Mic className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span>MIC<span className="hidden sm:inline"> · M</span></span>
          </button>

          {/* Sim Button */}
          <button
            onClick={toggleSim}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-[10px] sm:text-[11px] font-mono-hud uppercase tracking-wider rounded border transition-all duration-200 min-h-[34px] sm:min-h-[36px] touch-manipulation active:scale-95 ${
              talkMode === 'sim'
                ? 'bg-amber-500/35 border-amber-300 text-white shadow-[0_0_14px_rgba(255,170,0,0.6)] ring-1 ring-amber-400/50'
                : 'bg-white/5 border-white/15 text-slate-300 hover:bg-white/10 hover:border-white/30 active:bg-white/20'
            }`}
            title="Simulate Speech Output"
          >
            <Radio className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span>SIM<span className="hidden sm:inline"> · T</span></span>
          </button>
        </div>

        {/* Multi-Band Frequency Spectrum Visualizer */}
        <div className="flex items-center gap-1 sm:gap-1.5 pl-1 sm:pl-2">
          <div className="flex items-end gap-[2px] sm:gap-[3px] h-5 w-14 sm:w-20 px-1 py-0.5 bg-black/40 rounded border border-white/10">
            {hudBands.map((band, idx) => {
              const heightPct = Math.max(12, Math.min(100, Math.round(band * 100)));
              return (
                <div
                  key={`eq-bar-${idx}`}
                  className={`w-[4px] sm:w-[5px] rounded-t-sm transition-all duration-75 bg-gradient-to-t ${themeStyle.eqGradient}`}
                  style={{
                    height: `${heightPct}%`,
                    opacity: 0.35 + (band > 0.05 ? 0.65 : 0),
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
