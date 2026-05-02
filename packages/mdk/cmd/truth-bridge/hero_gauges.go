package main

import (
	"net/http"
	"time"
)

// HeroGaugeValue represents one read-only hero gauge shown in the cockpit.
// Value is always UI-safe 0-100 telemetry and never execution permission.
type HeroGaugeValue struct {
	Value int    `json:"value"`
	Label string `json:"label"`
}

// HeroGaugeState is the small, stable contract consumed by the Hero Gauges UI.
// It is deliberately derived from the existing Truth Bridge envelope so the UI
// does not invent client-side truth or prediction state.
type HeroGaugeState struct {
	Schema            string         `json:"schema"`
	Regime            HeroGaugeValue `json:"regime"`
	Vectors           HeroGaugeValue `json:"vectors"`
	Threats           HeroGaugeValue `json:"threats"`
	Portfolio         HeroGaugeValue `json:"portfolio"`
	Timestamp         string         `json:"timestamp"`
	TruthClass        string         `json:"truthClass"`
	ExecutionEligible bool           `json:"executionEligible"`
	Source            string         `json:"source"`
}

func clampGaugeValue(value int) int {
	if value < 0 {
		return 0
	}
	if value > 100 {
		return 100
	}
	return value
}

func heroRiskLabel(value int) string {
	switch {
	case value >= 80:
		return "HIGH RISK"
	case value >= 60:
		return "ELEVATED"
	case value >= 40:
		return "MODERATE"
	default:
		return "LOW"
	}
}

func heroRegimeValue(truth AlphaTruthResponse) HeroGaugeValue {
	if truth.ExecutionEligible {
		return HeroGaugeValue{Value: 82, Label: "VERIFIED"}
	}
	if truth.Status == "FAILED" || truth.TruthClass == "FAILED" {
		return HeroGaugeValue{Value: 22, Label: "FAILED"}
	}
	if truth.Status == "STALE" || truth.TruthClass == "STALE_RESCUE" {
		return HeroGaugeValue{Value: 38, Label: "STALE"}
	}
	if len(truth.Weaknesses) > 0 {
		return HeroGaugeValue{Value: 45, Label: "DEGRADED"}
	}
	return HeroGaugeValue{Value: 52, Label: "READ ONLY"}
}

func buildHeroGaugeState(truth AlphaTruthResponse) HeroGaugeState {
	weaknessLoad := clampGaugeValue(30 + len(truth.Weaknesses)*15)
	threatValue := weaknessLoad
	if truth.Status == "FAILED" || truth.TruthClass == "FAILED" {
		threatValue = 88
	}
	if truth.ExecutionEligible {
		threatValue = 18
	}

	portfolioValue := 35
	portfolioLabel := "LOCKED"
	if truth.ExecutionEligible {
		portfolioValue = 72
		portfolioLabel = "VERIFIED"
	}

	return HeroGaugeState{
		Schema:            "wvrdr.alpha.hero_gauges.v1",
		Regime:            heroRegimeValue(truth),
		Vectors:           HeroGaugeValue{Value: 50, Label: "DORMANT"},
		Threats:           HeroGaugeValue{Value: threatValue, Label: heroRiskLabel(threatValue)},
		Portfolio:         HeroGaugeValue{Value: portfolioValue, Label: portfolioLabel},
		Timestamp:         time.Now().UTC().Format(time.RFC3339Nano),
		TruthClass:        truth.TruthClass,
		ExecutionEligible: truth.ExecutionEligible,
		Source:            truth.Source,
	}
}

func handleHeroGauges(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w, r)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, failureEnvelope("METHOD_NOT_ALLOWED", "GET required"))
		return
	}

	truth := buildTruthEnvelope()
	writeJSON(w, http.StatusOK, buildHeroGaugeState(truth))
}
