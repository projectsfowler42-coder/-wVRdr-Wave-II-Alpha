package quarantine

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/google/uuid"
)

type Telemetry map[string]any

type Weakness struct {
	Reason string `json:"reason"`
	Detail string `json:"detail,omitempty"`
}

const (
	LiveSource = "SCHWAB"

	ReasonNilPayload       = "NIL_PAYLOAD"
	ReasonMissingObservedAt = "MISSING_OBSERVED_AT"
	ReasonMissingTruthClass = "MISSING_TRUTH_CLASS"
	ReasonInvalidTruthClass = "INVALID_TRUTH_CLASS"
	ReasonSpoofedLiveLabel  = "SPOOFED_LIVE_LABEL"
)

var AnomalyLabPath = "wVRdr-anomaly-lab"

var validTruthClasses = map[string]bool{
	"RAW_MARKET":   true,
	"STALE":        true,
	"UNRESOLVED":   true,
	"DEGRADED":     true,
	"FAILED":       true,
	"STALE_RESCUE": true,
}

func Inspect(data Telemetry) []Weakness {
	if data == nil {
		return []Weakness{{Reason: ReasonNilPayload, Detail: "payload is nil"}}
	}

	weaknesses := make([]Weakness, 0)

	if _, ok := data["observedAt"]; !ok {
		weaknesses = append(weaknesses, Weakness{Reason: ReasonMissingObservedAt, Detail: "observedAt is required"})
	}

	truthClassRaw, ok := data["truthClass"]
	if !ok {
		weaknesses = append(weaknesses, Weakness{Reason: ReasonMissingTruthClass, Detail: "truthClass is required"})
	} else {
		truthClass, _ := truthClassRaw.(string)
		if !validTruthClasses[truthClass] {
			weaknesses = append(weaknesses, Weakness{Reason: ReasonInvalidTruthClass, Detail: fmt.Sprintf("invalid truthClass: %v", truthClassRaw)})
		}
	}

	if status, _ := data["status"].(string); status == "LIVE" {
		if source, _ := data["source"].(string); source != LiveSource {
			weaknesses = append(weaknesses, Weakness{Reason: ReasonSpoofedLiveLabel, Detail: fmt.Sprintf("LIVE status requires source %s", LiveSource)})
		}
	}

	return weaknesses
}

func IsWeakMaterial(data Telemetry) bool {
	return len(Inspect(data)) > 0
}

func Quarantine(data Telemetry) error {
	weaknesses := Inspect(data)
	if len(weaknesses) == 0 {
		return nil
	}

	if err := os.MkdirAll(AnomalyLabPath, 0o755); err != nil {
		return fmt.Errorf("could not create anomaly lab directory: %w", err)
	}

	anomalyID := uuid.New().String()
	fileName := filepath.Join(AnomalyLabPath, fmt.Sprintf("%d_%s.json", time.Now().UnixNano(), anomalyID))

	fileContent, err := json.MarshalIndent(struct {
		ObservedAt  string     `json:"observedAt"`
		Weaknesses []Weakness `json:"weaknesses"`
		Payload    Telemetry   `json:"payload"`
	}{
		ObservedAt:  time.Now().UTC().Format(time.RFC3339Nano),
		Weaknesses: weaknesses,
		Payload:    data,
	}, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal anomaly data: %w", err)
	}

	if err := os.WriteFile(fileName, fileContent, 0o644); err != nil {
		return fmt.Errorf("failed to write anomaly file: %w", err)
	}

	return nil
}
