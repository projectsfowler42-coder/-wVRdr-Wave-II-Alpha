package fetcher

import (
	"context"
	"fmt"
	"time"
)

const (
	BrokerSocketModeDormant = "WAVE_II_DORMANT_SOCKET"
	TruthClassUnresolved    = "UNRESOLVED"
	StatusDegraded          = "DEGRADED"
)

type BrokerQuoteSocket interface {
	FetchQuotes(ctx context.Context, symbols []string) (Telemetry, error)
}

type DormantSchwabSocket struct{}

func NewDormantSchwabSocket() DormantSchwabSocket {
	return DormantSchwabSocket{}
}

func (DormantSchwabSocket) FetchQuotes(ctx context.Context, symbols []string) (Telemetry, error) {
	requestURL, err := SchwabBatchQuoteURL(symbols)
	if err != nil {
		return nil, err
	}

	select {
	case <-time.After(50 * time.Millisecond):
		return Telemetry{
			"source":           "SCHWAB",
			"status":           StatusDegraded,
			"truthClass":       TruthClassUnresolved,
			"observedAt":       time.Now().UTC().Format(time.RFC3339Nano),
			"endpoint":         requestURL,
			"symbols":          symbols,
			"fields":           schwabQuoteFields,
			"projections":      SchwabProjections(symbols),
			"transportMode":    "BATCH_QUOTES",
			"brokerSocketMode": BrokerSocketModeDormant,
			"wave":             "Wave-II",
			"networkEnabled":   false,
			"credentialsUsed":  false,
			"reason":           "Schwab API brain not wired yet; socket is contract-only and must not be promoted to LIVE.",
		}, nil
	case <-ctx.Done():
		return nil, fmt.Errorf("dormant Schwab socket cancelled: %w", ctx.Err())
	}
}

func DefaultBrokerSocket() BrokerQuoteSocket {
	return NewDormantSchwabSocket()
}
