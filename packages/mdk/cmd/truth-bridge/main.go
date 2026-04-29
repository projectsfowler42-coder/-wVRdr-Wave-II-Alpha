// Command truth-bridge runs a local-only HTTP server exposing MDK telemetry
// to the Wave-I Alpha UI at 127.0.0.1:8089.
//
// Phase 1 constraints:
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
	listenAddr = "127.0.0.1:8089"
	schema     = "wvrdr.alpha.truth.v1"
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
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Accept")
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

	data, err := fetcher.ParallelRaceFetcher()
	if err != nil {
		writeJSON(w, http.StatusOK, failureEnvelope("FETCH_ERROR", err.Error()))
		return
	}

	weaknesses := quarantine.Inspect(quarantine.Telemetry(data))

	source, _ := data["source"].(string)
	status, _ := data["status"].(string)
	truthClass, _ := data["truthClass"].(string)

	executionEligible := source == quarantine.LiveSource &&
		status == "LIVE" &&
		truthClass == "RAW_MARKET" &&
		len(weaknesses) == 0

	resp := AlphaTruthResponse{
		Schema:            schema,
		FetchedAt:         time.Now().UTC().Format(time.RFC3339Nano),
		Source:            source,
		Status:            status,
		TruthClass:        truthClass,
		ExecutionEligible: executionEligible,
		Weaknesses:        weaknesses,
		Data:              data,
	}

	writeJSON(w, http.StatusOK, resp)
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/truth", handleTruth)
	mux.HandleFunc("/health", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintln(w, `{"status":"ok","server":"truth-bridge","schema":"wvrdr.alpha.truth.v1"}`)
	})

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
