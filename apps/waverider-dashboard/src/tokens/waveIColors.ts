export const waveIColors = {
  khorneRed: "#7A0C14",
  mephistonRed: "#B11C2B",
  emberRed: "#C62828",
  signalVermilion: "#D9472B",
  hotAlert: "#E45A2B",
  lavaOrange: "#F06A1F",
  fantaOrange: "#F58220",
  warningOrange: "#F79A1E",
  gold: "#F7C600",
  beaconYellow: "#F3E36E",
  lemongrass: "#F6EE9A",
  chelseaBlue: "#034694",
  fordBlue: "#2A5DA8",
  manCityBlue: "#6CABDD",
  aquaBlue: "#7DE7F7",
  aquaGreen: "#67D7B0",
  green: "#39B96B",
  deepGreen: "#008348",
  darkGreen: "#004225",
  purple: "#552583",
} as const;

export const semanticStateColors = {
  live: waveIColors.aquaGreen,
  degraded: waveIColors.gold,
  stale: waveIColors.fantaOrange,
  failed: waveIColors.emberRed,
  breach: waveIColors.khorneRed,
  quarantine: waveIColors.purple,
  mock: waveIColors.manCityBlue,
} as const;

export type WaveIColorName = keyof typeof waveIColors;
export type TruthStateColorName = keyof typeof semanticStateColors;
