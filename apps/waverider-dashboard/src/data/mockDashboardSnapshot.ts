import type { DashboardSnapshot } from "../contracts/dashboardSnapshot";
import { waveIColors } from "../tokens/waveIColors";

const mockEvidence = {
  truthClass: "MOCK" as const,
  sourceId: "mock:waverider-dashboard:visual-prototype",
  capturedAt: "2026-05-04T00:00:00.000Z",
  confidence: 0,
};

export const mockDashboardSnapshot: DashboardSnapshot = {
  surface: "waverider-dashboard",
  releaseState: "VISUAL_PROTOTYPE",
  executionEligible: false,
  privateData: false,
  brokerConnected: false,
  ...mockEvidence,
  heroMetrics: [
    { ...mockEvidence, id: "regime", title: "REGIME", mainValue: 78, mainKicker: "REALITY", mainLabel: "STABLE\nEXPANSION", secondaryValue: 65, secondaryLabel: "RISK-ON\n(CAUTIOUS)", outer: waveIColors.aquaBlue, inner: waveIColors.manCityBlue, caution: true },
    { ...mockEvidence, id: "vectors", title: "VECTORS", mainValue: 82, mainKicker: "REALITY", mainLabel: "CONVERGING\nPOSITIVE", secondaryValue: 70, secondaryLabel: "DEPLOY\n(SELECTIVE)", outer: waveIColors.aquaGreen, inner: waveIColors.manCityBlue },
    { ...mockEvidence, id: "threats", title: "THREATS", mainValue: 45, mainKicker: "REALITY", mainLabel: "MODERATE\nELEVATED", secondaryValue: 30, secondaryLabel: "DEFENSIVE\nPOSTURE", outer: waveIColors.fantaOrange, inner: waveIColors.mephistonRed },
    { ...mockEvidence, id: "portfolio", title: "PORTFOLIO", mainValue: 88, mainKicker: "HEALTHY", mainLabel: "YTD: +14.5%", secondaryValue: 75, secondaryLabel: "SHARPE: 2.1\nDRAWDOWN: -3.2%", outer: waveIColors.deepGreen, inner: waveIColors.aquaGreen },
  ],
  miniMetrics: [
    { ...mockEvidence, id: "volatility", label: "VOLATILITY", value: "22.4%", icon: "activity", color: waveIColors.manCityBlue },
    { ...mockEvidence, id: "momentum", label: "MOMENTUM", value: "+5.8%", icon: "trend", color: waveIColors.green },
    { ...mockEvidence, id: "vix", label: "VIX LEVEL", value: "18.2", icon: "alert", color: waveIColors.fantaOrange },
    { ...mockEvidence, id: "btc", label: "BTC STRENGTH", value: "+3.1%", icon: "bitcoin", color: waveIColors.aquaGreen },
    { ...mockEvidence, id: "fracture", label: "FRACTURE", value: "1.2%", icon: "hexagon", color: waveIColors.purple },
    { ...mockEvidence, id: "wrongness", label: "WRONGNESS", value: "8.5%", icon: "gauge", color: waveIColors.emberRed },
  ],
  deltaRows: [
    { rank: 1, label: "Panic / Liquidity", color: waveIColors.emberRed },
    { rank: 2, label: "Dip / Mean Reversion", color: waveIColors.fantaOrange },
    { rank: 1, label: "Momentum / BMOS", color: waveIColors.green },
    { rank: 1, label: "Macro Pressure", color: waveIColors.fordBlue },
    { rank: 2, label: "Regime / Risk", color: waveIColors.gold },
  ],
  gateSteps: [
    { title: "Scan", desc: "Market data sweep", color: waveIColors.fordBlue, icon: "scan" },
    { title: "Filter", desc: "Signal refinement", color: waveIColors.fantaOrange, icon: "filter" },
    { title: "Validate", desc: "Risk & quality check", color: waveIColors.green, icon: "validate" },
    { title: "Execute", desc: "Action with discipline", color: waveIColors.purple, icon: "execute" },
  ],
};
