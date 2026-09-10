export type HologramTheme = 'gold' | 'silver' | 'platinum' | 'bronze' | 'purple';

export type TalkMode = 'none' | 'mic' | 'sim';

export interface TalkState {
  amplitude: number;
  smoothAmp: number;
  bass: number;
  mid: number;
  treble: number;
  active: boolean;
  mode: TalkMode;
  simPhase: number;
}

export interface ThemeColors {
  main: number;
  hot: number;
  deep: number;
  bright: number;
  core: number;
  copper?: number;
  casing?: number;
}

export const GOLD_COLORS: ThemeColors = {
  main: 0xffaa00,
  hot: 0xffdd55,
  deep: 0xff7700,
  bright: 0xfff0aa,
  core: 0xffbb33,
};

export const SILVER_COLORS: ThemeColors = {
  main: 0xd0d8e2,   // Sleek polished chrome silver
  hot: 0xf2f6fa,    // High-specular silver sheen
  deep: 0x7a889b,   // Dark chrome steel undertone
  bright: 0xffffff, // Pure diamond specular highlight
  core: 0xe2e8f0,   // Radiant silver core
  casing: 0x475569, // Gunmetal casing
};

export const PLATINUM_COLORS: ThemeColors = {
  main: 0xc2e2f0,   // Luminous icy-white platinum
  hot: 0xeaf6fb,    // Bright platinum flare
  deep: 0x6a94aa,   // Deep platinum-cobalt sheen
  bright: 0xf4fcff, // Icy brilliant white luster
  core: 0xdaf0fa,   // Platinum plasma core
  casing: 0x334e5c, // Platinum alloy
};

export const BRONZE_COLORS: ThemeColors = {
  main: 0xcd7f32,   // Warm metallic burnished bronze
  hot: 0xeea55d,    // Polished copper-bronze highlight
  deep: 0x8c441b,   // Deep aged bronze patina
  bright: 0xffdfb8, // Luminous warm bronze reflection
  core: 0xdb7b2c,   // Molten bronze core
  copper: 0xad4f19, // Deep copper
};

export const PURPLE_COLORS: ThemeColors = {
  main: 0xa855f7,   // Anodized metallic royal purple
  hot: 0xe9d5ff,    // High-specular metallic lilac-silver flare
  deep: 0x581c87,   // Deep metallic titanium plum shadow
  bright: 0xfaf5ff, // Diamond-specular metallic luster
  core: 0x9333ea,   // Molten metallic violet core
  casing: 0x3b0764, // Dark anodized violet metal casing
};

export interface ThemeOption {
  id: HologramTheme;
  label: string;
  badge: string;
  hex: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  { id: 'gold', label: 'Gold', badge: 'GOLD', hex: '#ffaa00' },
  { id: 'silver', label: 'Silver', badge: 'SILVER', hex: '#d0d8e2' },
  { id: 'platinum', label: 'Platinum', badge: 'PLATINUM', hex: '#c2e2f0' },
  { id: 'bronze', label: 'Bronze', badge: 'BRONZE', hex: '#cd7f32' },
  { id: 'purple', label: 'Met. Purple', badge: 'METALLIC PURPLE', hex: '#a855f7' },
];
