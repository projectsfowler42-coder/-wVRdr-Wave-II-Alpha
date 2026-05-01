export type PropModeId = "FTMO_DOMINATOR" | "E8_PRECISION" | "TRAILING_KILL_ZONE";
export type PlayId = "THE_ANCHOR" | "THE_SURGEON" | "THE_RATCHET";
export type SimUniverseId =
  | "SPECIALIST_ANCHOR_ONLY"
  | "HYBRID_FULL_PORTFOLIO"
  | "AGGRESSOR_SURGEON_1_5_RISK"
  | "GHOST_RATCHET_WITHOUT_TRAIL";

export interface EngineWeights {
  blue: number;
  green: number;
  yellow: number;
  purple: number;
}

export interface PropModeDoctrine {
  id: PropModeId;
  targetPct: number;
  dailyDrawdownPct: number;
  totalDrawdownPct: number;
  drawdownModel: "STATIC" | "STATIC_TIGHT" | "TRAILING";
  engineWeights: EngineWeights;
  doctrine: string[];
}

export interface PlayDoctrine {
  id: PlayId;
  bestFor: PropModeId[] | "ALL";
  riskPct: number;
  maxTotalRiskPct?: number;
  entryLogic: string[];
  exitLogic: string[];
}

export const PROP_MODES: PropModeDoctrine[] = [
  {
    id: "FTMO_DOMINATOR",
    targetPct: 10,
    dailyDrawdownPct: 5,
    totalDrawdownPct: 10,
    drawdownModel: "STATIC",
    engineWeights: { blue: 50, green: 30, yellow: 15, purple: 5 },
    doctrine: ["Static floor", "Blue heavy", "Green controlled", "Yellow selective"],
  },
  {
    id: "E8_PRECISION",
    targetPct: 8,
    dailyDrawdownPct: 5,
    totalDrawdownPct: 8,
    drawdownModel: "STATIC_TIGHT",
    engineWeights: { blue: 60, green: 20, yellow: 20, purple: 0 },
    doctrine: ["Tighter variance", "Smaller ladders", "Fast loss cuts", "Purple disabled"],
  },
  {
    id: "TRAILING_KILL_ZONE",
    targetPct: 6,
    dailyDrawdownPct: 3,
    totalDrawdownPct: 6,
    drawdownModel: "TRAILING",
    engineWeights: { blue: 80, green: 10, yellow: 10, purple: 0 },
    doctrine: ["Ratchet equity upward", "No large giveback", "Purple disabled"],
  },
];

export const PLAYS: PlayDoctrine[] = [
  {
    id: "THE_ANCHOR",
    bestFor: "ALL",
    riskPct: 0.5,
    maxTotalRiskPct: 1,
    entryLogic: ["Blue confirms 15m trend", "Blue confirms 1H trend"],
    exitLogic: ["Green Mint add at +1R", "Exit by trend failure or constraint gate"],
  },
  {
    id: "THE_SURGEON",
    bestFor: ["E8_PRECISION"],
    riskPct: 0.25,
    entryLogic: ["Yellow volatility dislocation", "Session open or key pivot mean reversion"],
    exitLogic: ["Hard TP at 20 EMA", "No runners"],
  },
  {
    id: "THE_RATCHET",
    bestFor: ["TRAILING_KILL_ZONE"],
    riskPct: 0.5,
    entryLogic: ["Blue breakout"],
    exitLogic: ["Move stop to breakeven at +0.5R", "Trail closed candle high/low"],
  },
];

export const SIM_UNIVERSES: Record<SimUniverseId, { plays: PlayId[]; riskMultiplier: number; ratchetEnabled: boolean }> = {
  SPECIALIST_ANCHOR_ONLY: { plays: ["THE_ANCHOR"], riskMultiplier: 1, ratchetEnabled: true },
  HYBRID_FULL_PORTFOLIO: { plays: ["THE_ANCHOR", "THE_SURGEON", "THE_RATCHET"], riskMultiplier: 1, ratchetEnabled: true },
  AGGRESSOR_SURGEON_1_5_RISK: { plays: ["THE_SURGEON"], riskMultiplier: 1.5, ratchetEnabled: true },
  GHOST_RATCHET_WITHOUT_TRAIL: { plays: ["THE_RATCHET"], riskMultiplier: 1, ratchetEnabled: false },
};
