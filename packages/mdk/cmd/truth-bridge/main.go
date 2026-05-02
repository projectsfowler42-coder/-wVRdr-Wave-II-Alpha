// Command truth-bridge runs a local-only HTTP server exposing MDK telemetry
// to the Wave-I Alpha UI at 127.0.0.1:8089.
//
// Phase constraints:
//   - Loopback only. Never exposed to external network.
//   - No Schwab OAuth. No credentials. No live orders.
//   - executionEligible is false unless MDK returns verified SCHWAB/LIVE/RAW_MARKET.
//   - All fetch failures return a structured envelope, not a raw 500.
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"strings"
	"time"

	"github.com/projectsfowler42-coder/MDK-9000_wVRdr/fetcher"
	"github.com/projectsfowler42-coder/MDK-9000_wVRdr/quarantine"
)

const (
	listenAddr        = "127.0.0.1:8089"
	schema            = "wvrdr.alpha.truth.v1"
	cockpitSchema    = "wvrdr.alpha.cockpit.snapshot.v1"
	fiveThingsSchema = "wvrdr.alpha.telemetry.five_things.v1"
)

// AlphaTruthResponse is the canonical JSON envelope returned by /api/truth.
type AlphaTruthResponse struct {
	Schema            string                `json:"schema"`
	FetchedAt         string                `json:"fetchedAt"`
	Source            string                `json:"source"`
	Status            string                `json:"status"`
	TruthClass        string                `json:"truthClass"`
	ExecutionEligible bool                  `json:"executionEligible"`
	Weaknesses        []quarantine.Weakness `json:"weaknesses"`
	Data              fetcher.Telemetry     `json:"data"`
}

type HealthResponse struct {
	Status            string `json:"status"`
	Server            string `json:"server"`
	Schema            string `json:"schema"`
	CockpitSchema     string `json:"cockpitSchema"`
	Mode              string `json:"mode"`
	ExecutionEligible bool   `json:"executionEligible"`
}

type CockpitSnapshot struct {
	Schema     string             `json:"schema"`
	System     map[string]any     `json:"system"`
	Regime     map[string]any     `json:"regime"`
	Buckets    map[string]any     `json:"buckets"`
	Portfolio  map[string]any     `json:"portfolio"`
	Actions    map[string]any     `json:"actions"`
	Audit      map[string]any     `json:"audit"`
	Quarantine map[string]any     `json:"quarantine"`
	Truth      AlphaTruthResponse `json:"truth"`
}

type OperatorIntentResponse struct {
	OK                bool     `json:"ok"`
	Status            string   `json:"status"`
	ExecutionEligible bool     `json:"executionEligible"`
	AcceptedAt        string   `json:"acceptedAt"`
	Warnings          []string `json:"warnings"`
}

type FiveThingsResponse struct {
	Schema            string            `json:"schema"`
	ObservedAt        string            `json:"observedAt"`
	Status            string            `json:"status"`
	ExecutionEligible bool              `json:"executionEligible"`
	Signals           []TelemetrySignal `json:"signals"`
}

type TelemetrySignal struct {
	Label      string `json:"label"`
	Value      string `json:"value"`
	TruthClass string `json:"truthClass"`
	Trend      string `json:"trend"`
	Source     string `json:"source"`
}

func isLocalOrigin(origin string) bool {
	if origin == "" {
		return false
	}

	host := origin
	if idx := strings.Index(host, "://"); idx != -1 {
		host = host[idx+3:]
	}
	if h, _, err := net.SplitHostPort(host); err == nil {
		host = h
	}

	return host == "localhost" || host == "127.0.0.1"
}

func setCORSHeaders(w http.ResponseWriter, r *http.Request) {
	origin := r.Header.Get("Origin")
	if !isLocalOrigin(origin) {
		return
	}

	w.Header().Set("Access-Control-Allow-Origin", origin)
	w.Header().Set("Vary", "Origin")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization")
}

func writeJSON(w http.ResponseWriter, code int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)

	enc := json.NewEncoder(w)
	enc.SetIndent("", "  ")
	if err := enc.Encode(v); err != nil {
		log.Printf("truth-bridge: json encode error: %v", err)
	}
}

func failureEnvelope(reason, detail string) AlphaTruthResponse {
	return AlphaTruthResponse{
		Schema:            schema,
		FetchedAt:         time.Now().UTC().Format(time.RFC3339Nano),
		Source:            "MDK",
		Status:            "FAILED",
		TruthClass:        "FAILED",
		ExecutionEligible: false,
		Weaknesses: []quarantine.Weakness{
			{Reason: reason, Detail: detail},
		},
		Data: fetcher.Telemetry{},
	}
}

func buildTruthEnvelope() AlphaTruthResponse {
	data, err := fetcher.ParallelRaceFetcher()
	if err != nil {
		return failureEnvelope("FETCH_ERROR", err.Error())
	}

	weaknesses := quarantine.Inspect(quarantine.Telemetry(data))

	source, _ := data["source"].(string)
	status, _ := data["status"].(string)
	truthClass, _ := data["truthClass"].(string)

	executionEligible := source == quarantine.LiveSource &&
		status == "LIVE" &&
		truthClass == "RAW_MARKET" &&
		len(weaknesses) == 0

	return AlphaTruthResponse{
		Schema:            schema,
		FetchedAt:         time.Now().UTC().Format(time.RFC3339Nano),
		Source:            source,
		Status:            status,
		TruthClass:        truthClass,
		ExecutionEligible: executionEligible,
		Weaknesses:        weaknesses,
		Data:              data,
	}
}

func healthResponse() HealthResponse {
	return HealthResponse{
		Status:            "ok",
		Server:            "truth-bridge",
		Schema:            schema,
		CockpitSchema:     cockpitSchema,
		Mode:              "READ_ONLY_DORMANT",
		ExecutionEligible: false,
	}
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w, r)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, failureEnvelope("METHOD_NOT_ALLOWED", "GET required"))
		return
	}
	writeJSON(w, http.StatusOK, healthResponse())
}

func handleTruth(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w, r)

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, failureEnvelope("METHOD_NOT_ALLOWED", "GET required"))
		return
	}

	writeJSON(w, http.StatusOK, buildTruthEnvelope())
}

func buildFiveThings(truth AlphaTruthResponse) FiveThingsResponse {
	networkEnabled, _ := truth.Data["networkEnabled"].(bool)
	credentialsUsed, _ := truth.Data["credentialsUsed"].(bool)
	brokerSocketMode, _ := truth.Data["brokerSocketMode"].(string)
	if brokerSocketMode == "" {
		brokerSocketMode = "UNKNOWN"
	}

	return FiveThingsResponse{
		Schema:            fiveThingsSchema,
		ObservedAt:        truth.FetchedAt,
		Status:            "OPERATOR_REVIEW",
		ExecutionEligible: truth.ExecutionEligible,
		Signals: []TelemetrySignal{
			{Label: "Truth Bridge", Value: "ONLINE_LOCAL", TruthClass: truth.TruthClass, Trend: "FLAT", Source: "truth-bridge"},
			{Label: "Schwab Socket", Value: brokerSocketMode, TruthClass: truth.TruthClass, Trend: "FLAT", Source: "MDK dormant socket"},
			{Label: "Network Transport", Value: fmt.Sprintf("%t", networkEnabled), TruthClass: truth.TruthClass, Trend: "FLAT", Source: "MDK telemetry"},
			{Label: "Credentials", Value: fmt.Sprintf("%t", credentialsUsed), TruthClass: truth.TruthClass, Trend: "FLAT", Source: "MDK telemetry"},
			{Label: "Execution Gate", Value: fmt.Sprintf("%t", truth.ExecutionEligible), TruthClass: truth.TruthClass, Trend: "FLAT", Source: "truth bridge"},
		},
	}
}

func buildCockpitSnapshot(truth AlphaTruthResponse) CockpitSnapshot {
	warnings := []string{
		"Phase 2 local bridge only; broker execution locked.",
		"No credentials, OAuth, live transport, or live orders are enabled.",
	}

	drivers := []string{
		fmt.Sprintf("source=%s", truth.Source),
		fmt.Sprintf("status=%s", truth.Status),
		fmt.Sprintf("truthClass=%s", truth.TruthClass),
		fmt.Sprintf("executionEligible=%t", truth.ExecutionEligible),
		"networkEnabled=false and credentialsUsed=false are required in dormant mode",
	}

	if len(truth.Weaknesses) > 0 {
		warnings = append(warnings, "Truth weaknesses are present; cockpit remains degraded.")
	}

	return CockpitSnapshot{
		Schema: cockpitSchema,
		System: map[string]any{
			"name":         "~wVRdr~ Wave-II~Alpha",
			"mode":         "DEGRADED",
			"health":       truth.Status,
			"last_updated": truth.FetchedAt,
			"truth_spine":  truth.Schema,
			"stale":        truth.Status == "STALE" || truth.TruthClass == "STALE_RESCUE",
			"warnings":     warnings,
		},
		Regime: map[string]any{
			"label":    fmt.Sprintf("%s / %s", truth.Status, truth.TruthClass),
			"drivers":  drivers,
			"stale":    truth.Status == "STALE" || truth.TruthClass == "STALE_RESCUE",
			"verified": truth.ExecutionEligible,
		},
		Buckets: map[string]any{},
		Portfolio: map[string]any{
			"positions": []any{},
			"warnings":  []string{"No broker holdings are connected in Phase 2."},
		},
		Actions: map[string]any{
			"urgent":    []any{},
			"active":    []any{},
			"completed": []any{},
			"blocked": []map[string]any{
				{
					"id":      "broker-execution-locked",
					"label":   "Broker execution locked",
					"type":    "capability_lock",
					"allowed": false,
				},
			},
		},
		Audit: map[string]any{
			"status": "LOCAL_INTENT_ONLY",
			"recent": []any{},
		},
		Quarantine: map[string]any{
			"count": len(truth.Weaknesses),
			"items": truth.Weaknesses,
		},
		Truth: truth,
	}
}

func handleSnapshot(w http.ResponseWriter, r *http.Request) {
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
	writeJSON(w, http.StatusOK, buildCockpitSnapshot(truth))
}

func handleFiveThings(w http.ResponseWriter, r *http.Request) {
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
	writeJSON(w, http.StatusOK, buildFiveThings(truth))
}

func handleOperatorIntent(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w, r)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, failureEnvelope("METHOD_NOT_ALLOWED", "POST required"))
		return
	}

	defer r.Body.Close()
	var intent map[string]any
	if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 32*1024)).Decode(&intent); err != nil {
		writeJSON(w, http.StatusBadRequest, failureEnvelope("INVALID_INTENT", err.Error()))
		return
	}

	log.Printf("operator intent captured locally with execution disabled: keys=%d", len(intent))
	writeJSON(w, http.StatusOK, OperatorIntentResponse{
		OK:                true,
		Status:            "recorded_no_execution",
		ExecutionEligible: false,
		AcceptedAt:        time.Now().UTC().Format(time.RFC3339Nano),
		Warnings: []string{
			"Intent was captured for audit posture only.",
			"No broker transport, order route, credential, or OAuth path exists in Phase 2.",
		},
	})
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/truth", handleTruth)
	mux.HandleFunc("/api/snapshot", handleSnapshot)
	mux.HandleFunc("/api/cockpit/hero-gauges", handleHeroGauges)
	mux.HandleFunc("/api/telemetry/five-things", handleFiveThings)
	mux.HandleFunc("/api/health", handleHealth)
	mux.HandleFunc("/api/operator/intent", handleOperatorIntent)
	mux.HandleFunc("/health", handleHealth)

	server := &http.Server{
		Addr:         listenAddr,
		Handler:      mux,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  30 * time.Second,
	}

	log.Printf("~wVRdr~ Wave-II~Alpha Truth Bridge -> http://%s", listenAddr)
	log.Printf("Schwab socket is dormant until Wave-II transport is explicitly wired and verified")

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("truth-bridge: fatal: %v", err)
	}
}
