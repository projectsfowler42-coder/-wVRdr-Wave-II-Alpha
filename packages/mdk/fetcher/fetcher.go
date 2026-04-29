package fetcher

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/projectsfowler42-coder/MDK-9000_wVRdr/quarantine"
)

const (
	RaceTimeout             = 3500 * time.Millisecond
	WALBufferPath           = "buffer.jsonl"
	SchwabMarketDataBaseURL = "https://api.schwabapi.com/marketdata/v1"
)

var walMu sync.Mutex

type Telemetry map[string]interface{}

type SchwabProjection struct {
	Symbol             string   `json:"symbol"`
	Fields             []string `json:"fields"`
	RequiredPaths      []string `json:"requiredPaths"`
	DegradedIfMissing  []string `json:"degradedIfMissing"`
	ProjectionCategory string   `json:"projectionCategory"`
}

var schwabBatchSymbols = []string{
	"XFLT",
	"JAAA",
	"BKLN",
	"SRLN",
	"SGOV",
	"BIL",
	"SHV",
	"TFLO",
	"USFR",
	"JBBB",
	"MINT",
}

var schwabQuoteFields = []string{
	"quote",
	"fundamental",
	"extended",
	"reference",
}

func GetSchwabBatchSymbols() []string {
	out := make([]string, len(schwabBatchSymbols))
	copy(out, schwabBatchSymbols)
	return out
}

func GetSchwabQuoteFields() []string {
	out := make([]string, len(schwabQuoteFields))
	copy(out, schwabQuoteFields)
	return out
}

func SchwabBatchQuoteURL(symbols []string) (string, error) {
	if len(symbols) == 0 {
		return "", fmt.Errorf("at least one Schwab symbol is required")
	}

	cleanSymbols := make([]string, 0, len(symbols))
	for _, rawSymbol := range symbols {
		symbol := strings.ToUpper(strings.TrimSpace(rawSymbol))
		if symbol == "" || !isSafeTickerSymbol(symbol) {
			return "", fmt.Errorf("invalid Schwab symbol: %q", rawSymbol)
		}
		cleanSymbols = append(cleanSymbols, symbol)
	}

	return SchwabMarketDataBaseURL + "/quotes" +
		"?symbols=" + strings.Join(cleanSymbols, ",") +
		"&fields=" + strings.Join(schwabQuoteFields, ",") +
		"&indicative=true", nil
}

func isSafeTickerSymbol(symbol string) bool {
	for _, r := range symbol {
		if r >= 'A' && r <= 'Z' {
			continue
		}
		if r >= '0' && r <= '9' {
			continue
		}
		switch r {
		case '.', '-':
			continue
		default:
			return false
		}
	}
	return true
}

func SchwabProjections(symbols []string) []SchwabProjection {
	projections := make([]SchwabProjection, 0, len(symbols))
	for _, rawSymbol := range symbols {
		symbol := strings.ToUpper(strings.TrimSpace(rawSymbol))
		projection := SchwabProjection{
			Symbol:             symbol,
			Fields:             schwabQuoteFields,
			RequiredPaths:      []string{"quote", "fundamental", "reference"},
			DegradedIfMissing:  []string{"quote.lastPrice", "quote.closePrice"},
			ProjectionCategory: "STANDARD_QUOTE",
		}

		switch symbol {
		case "XFLT":
			projection.ProjectionCategory = "CEF_NAV"
			projection.DegradedIfMissing = []string{
				"quote.nAV",
				"quote.nav",
				"fundamental.nAV",
				"fundamental.nav",
			}
		case "JAAA":
			projection.ProjectionCategory = "ETF_DISTRIBUTION"
			projection.DegradedIfMissing = []string{
				"fundamental.divAmount",
				"fundamental.divYield",
				"fundamental.divPayAmount",
				"fundamental.divPayDate",
			}
		case "BKLN", "SRLN":
			projection.ProjectionCategory = "LOAN_ETF_DISTRIBUTION_DATE"
			projection.DegradedIfMissing = []string{
				"fundamental.divDate",
				"fundamental.divExDate",
				"fundamental.nextDivExDate",
				"fundamental.divPayDate",
				"fundamental.nextDivPayDate",
			}
		}

		projections = append(projections, projection)
	}
	return projections
}

func PrimaryDataSource(ctx context.Context) (Telemetry, error) {
	return DefaultBrokerSocket().FetchQuotes(ctx, schwabBatchSymbols)
}

func StaleRescueCache() (Telemetry, error) {
	return Telemetry{
		"source":     "STALE_RESCUE",
		"status":     "STALE",
		"truthClass": "STALE_RESCUE",
		"observedAt": time.Now().UTC().Format(time.RFC3339Nano),
		"reason":     "Primary source timed out or failed; serving stale rescue cache",
	}, nil
}

func WriteAheadLog(data Telemetry) error {
	walMu.Lock()
	defer walMu.Unlock()

	entry, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("wal marshal: %w", err)
	}

	f, err := os.OpenFile(WALBufferPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0o644)
	if err != nil {
		return fmt.Errorf("wal open: %w", err)
	}
	defer f.Close()

	if _, err := f.WriteString(string(entry) + "\n"); err != nil {
		return fmt.Errorf("wal write: %w", err)
	}
	return nil
}

func ParallelRaceFetcher() (Telemetry, error) {
	ctx, cancel := context.WithTimeout(context.Background(), RaceTimeout)
	defer cancel()

	resultChan := make(chan Telemetry, 1)
	errChan := make(chan error, 1)

	go func() {
		data, err := PrimaryDataSource(ctx)
		if err != nil {
			errChan <- err
			return
		}
		resultChan <- data
	}()

	var data Telemetry
	var fetchErr error

	select {
	case data = <-resultChan:
	case fetchErr = <-errChan:
		data, fetchErr = StaleRescueCache()
	case <-ctx.Done():
		data, fetchErr = StaleRescueCache()
	}

	if fetchErr != nil {
		return nil, fmt.Errorf("parallel race fetcher: both primary and stale rescue failed: %w", fetchErr)
	}

	if walErr := WriteAheadLog(data); walErr != nil {
		data["walError"] = walErr.Error()
	}

	if qErr := quarantine.Quarantine(quarantine.Telemetry(data)); qErr != nil {
		data["quarantineError"] = qErr.Error()
	}

	weaknesses := quarantine.Inspect(quarantine.Telemetry(data))
	if len(weaknesses) > 0 {
		weaknessStrings := make([]string, len(weaknesses))
		for i, weakness := range weaknesses {
			weaknessStrings[i] = weakness.Reason
		}
		data["quarantineWeaknesses"] = weaknessStrings
	}

	return data, nil
}
