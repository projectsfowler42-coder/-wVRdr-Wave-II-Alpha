export type EngineName = "BLUE" | "GREEN" | "YELLOW" | "PURPLE";
export type CircuitMode = "NORMAL" | "TIGHT" | "SURVIVAL" | "RATCHET_ACTIVE";

export interface CircuitBreakerInput {
  dailyDrawdownPct: number;
  totalDrawdownPct: number;
  atr14: number;
  dailyAverageAtr: number;
  openProfitR: number;
}

export interface CircuitBreakerDecision {
  mode: CircuitMode;
  disabledEngines: EngineName[];
  riskMultiplier: number;
  stopDistanceMultiplier: number;
  takeProfitMode: "NORMAL" | "FIXED_ONLY";
  ratchetActive: boolean;
  reasons: string[];
}

export function evaluateCircuitBreakers(input: CircuitBreakerInput): CircuitBreakerDecision {
  const reasons: string[] = [];
  const disabled = new Set<EngineName>();
  let mode: CircuitMode = "NORMAL";
  let riskMultiplier = 1;
  let stopDistanceMultiplier = 1;
  let takeProfitMode: "NORMAL" | "FIXED_ONLY" = "NORMAL";
  let ratchetActive = false;

  if (input.dailyDrawdownPct > 3 || input.totalDrawdownPct > 6) {
    mode = "SURVIVAL";
    disabled.add("GREEN");
    disabled.add("YELLOW");
    riskMultiplier = 0.5;
    reasons.push("Hard Deck: drawdown exceeds survival threshold.");
  }

  if (input.dailyAverageAtr > 0 && input.atr14 > 2 * input.dailyAverageAtr) {
    if (mode !== "SURVIVAL") mode = "TIGHT";
    stopDistanceMultiplier = 0.7;
    takeProfitMode = "FIXED_ONLY";
    reasons.push("Volatility Clamp: ATR14 exceeds 2x daily average ATR.");
  }

  if (input.openProfitR > 1.5) {
    if (mode !== "SURVIVAL") mode = "RATCHET_ACTIVE";
    ratchetActive = true;
    reasons.push("Ratchet: open profit exceeds +1.5R; protect winner from account failure.");
  }

  return { mode, disabledEngines: [...disabled], riskMultiplier, stopDistanceMultiplier, takeProfitMode, ratchetActive, reasons };
}
