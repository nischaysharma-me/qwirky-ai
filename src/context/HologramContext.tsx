import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  HologramTheme,
  TalkMode,
  TalkState,
  ThemeColors,
  GOLD_COLORS,
  SILVER_COLORS,
  PLATINUM_COLORS,
  BRONZE_COLORS,
  PURPLE_COLORS,
} from '../types/hologram';
import { useAudioAnalyzer } from '../hooks/useAudioAnalyzer';

interface HologramContextType {
  theme: HologramTheme;
  setTheme: (theme: HologramTheme) => void;
  toggleTheme: () => void;
  colors: ThemeColors;
  talkMode: TalkMode;
  hudAmp: number;
  hudBands: number[];
  talkRef: React.MutableRefObject<TalkState>;
  toggleMic: () => void;
  toggleSim: () => void;
  updateAmplitude: () => number;
}

const THEME_PALETTES: Record<HologramTheme, ThemeColors> = {
  gold: GOLD_COLORS,
  silver: SILVER_COLORS,
  platinum: PLATINUM_COLORS,
  bronze: BRONZE_COLORS,
  purple: PURPLE_COLORS,
};

const THEME_CYCLE: HologramTheme[] = ['gold', 'silver', 'platinum', 'bronze', 'purple'];

const HologramContext = createContext<HologramContextType | null>(null);

export const HologramProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<HologramTheme>('gold');
  const { talkMode, hudAmp, hudBands, talkRef, toggleMic, toggleSim, updateAmplitude } =
    useAudioAnalyzer();

  const colors = THEME_PALETTES[theme] || GOLD_COLORS;

  const toggleTheme = () => {
    setTheme((prev) => {
      const idx = THEME_CYCLE.indexOf(prev);
      return THEME_CYCLE[(idx + 1) % THEME_CYCLE.length];
    });
  };

  // Shortcut 'c' to cycle theme
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.repeat ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key === 'c' || e.key === 'C') {
        toggleTheme();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <HologramContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        colors,
        talkMode,
        hudAmp,
        hudBands,
        talkRef,
        toggleMic,
        toggleSim,
        updateAmplitude,
      }}
    >
      {children}
    </HologramContext.Provider>
  );
};

export const useHologram = (): HologramContextType => {
  const context = useContext(HologramContext);
  if (!context) {
    throw new Error('useHologram must be used within a HologramProvider');
  }
  return context;
};
