# W³ Mouseion Protocol — Alpha Go MVP Build Spec

Source compartment: `projectsfowler42-coder/wave-rider-intelligence/padded-room/W3_GO_MVP_BUILD_SPEC.md`

This spec is mirrored into Wave-II~Alpha as a walled-off build artifact. It does not modify production runtime behavior.

## Role

Build a prop-firm simulation and failure-harvesting engine called the **W³ Mouseion Protocol**.

This is **not** a prediction engine. It studies wins, losses, simulated outcomes, and rule-specific failure paths to find a repeatable prop-play mode that loses only at an acceptable, survivable, rule-aware rate.

Simulation outcome states:

```text
[Win] / [Loss] / [AcceptableLoss] / [RuleBreach] / [Quarantine]
```

W³ binary judgment:

```text
[Win] / [Loss]
```

`AcceptableLoss` is still `[Loss]`. It is survivable and expected. It is not a win.

Doctrine:

```text
W³ judges.
MSP stores.
Scythe harvests.
Algorilla hardens.
```

## Tech Stack

```text
Language:    Go 1.22+
Database:    SQLite via modernc.org/sqlite, pure Go, no CGO
CLI:         cobra, github.com/spf13/cobra
IDs:         github.com/google/uuid
JSON:        encoding/json, stdlib
Testing:     testing, stdlib, table-driven
Linting:     go vet + staticcheck
```

Constraints:

```text
No web framework for MVP.
CLI-first.
No external ML libraries.
Fuzzy logic is hand-coded band classification.
No CGO.
Pure Go only.
```

## Module Structure

```text
w3msp/
├── cmd/
│   └── msp/
│       └── main.go
├── internal/
│   ├── db/
│   │   ├── db.go
│   │   └── schema.go
│   ├── models/
│   │   └── models.go
│   ├── store/
│   │   ├── errors.go
│   │   ├── rulebook.go
│   │   ├── scenario.go
│   │   ├── guess.go
│   │   ├── simulation.go
│   │   ├── harvest.go
│   │   └── failure.go
│   ├── engine/
│   │   ├── fuzzy.go
│   │   ├── w3.go
│   │   ├── permission.go
│   │   ├── promotion.go
│   │   └── doctrine.go
│   └── hud/
│       └── hud.go
├── examples/
│   ├── firm.topstep50k.json
│   ├── scenario.chop-death.json
│   ├── guess.small-harvest.json
│   ├── sim.acceptable-loss.json
│   ├── harvest.acceptable-loss.json
│   └── failure.trailing-drawdown.json
├── .gitignore
├── go.mod
└── go.sum
```

## Core Model Families

The implementation must include:

```text
FuzzyBand
PermissionState
PlayStatus
DrawdownType
ConsistencyRuleType
ConsistencyRule
PayoutRules
RuleConfidence
PropFirmRulebook
MarketState
RulePressure
Scenario
ExpectedOutcome
GuessParameters
Guess
SimOutcome
AmountReason
FuzzyScores
SimulationResult
ConfidenceBand
W3ScytheHarvest
FailureType
FailurePattern
```

Core constants include:

```text
Permission: Forbidden, Hostile, Mixed, AllowedSmall, AllowedNormal, Quarantine
PlayStatus: RawGuess, Testing, ReducedStupidity, Stable, AlgorillaReady, Quarantined
Drawdown: static, trailing_intraday, trailing_eod, unknown
MarketState: trend, chop, fake_breakout, news_spike, low_volume, volatility_expansion, liquidity_vacuum, reversal, unknown
RulePressure: safe, mild, mixed, danger, death_zone
SimOutcome: Win, Loss, AcceptableLoss, RuleBreach, Quarantine
FailureType: daily_loss_breach, max_loss_breach, trailing_drawdown_breach, consistency_breach, overtrade, spread_failure, news_spike, chop_death, revenge_trade, late_entry, oversizing, unknown
```

`SimulationResult.WinLossOnly` is always `"Win"` or `"Loss"` and is set by the CLI layer through `engine.ClassifyW3Outcome`.

## Database Contract

`internal/db/db.go` exports:

```go
func Open(path string) (*sql.DB, error)
func RunMigrations(db *sql.DB) error
func Close(db *sql.DB) error
```

Inside `Open()`, execute:

```sql
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA busy_timeout = 5000;
```

## Required Tables

```text
prop_firm_rulebooks
scenarios
guesses
simulation_results
w3_scythe_harvests
failure_patterns
```

`simulation_results.win_loss_only` must have a DB-level check allowing only `Win` or `Loss`.

Foreign keys must be enforced.

## Engine Logic

### Fuzzy

`ClassifyBand(score float64) FuzzyBand`

Rules:

```text
score < 0         → Band0_20
score > 100       → Band90_100
score == 100      → Band90_100
[0,20)            → Band0_20
[20,40)           → Band20_40
[40,60)           → Band40_60
[60,75)           → Band60_75
[75,90)           → Band75_90
[90,100]          → Band90_100
exact boundaries  → higher band
```

### W³

`ClassifyW3Outcome(outcome SimOutcome) string`

```text
SimRuleBreach     → Loss
SimQuarantine     → Loss
SimWin            → Win
SimAcceptableLoss → Loss
SimLoss           → Loss
default           → Loss
```

Do not return `AcceptableLoss` from this function.

### Permission

`GetPermissionState(input PermissionInput) PermissionState`

Decision order:

```text
1. NearHardRuleBreach == true                       → Forbidden
2. FailureSimilarityBand in {75-90, 90-100}         → Hostile
3. RuleSafetyBand in {0-20, 20-40}                  → Hostile
4. ConsistencyBand == 75-90 AND RuleSafety == 75-90 → AllowedSmall
5. MarketCleanlinessBand == 40-60                   → Mixed
6. default                                          → Mixed
```

`AllowedSmall` is the ceiling of good. The permission engine must never default to expansion states.

### Promotion

`EvaluatePromotion(history []SimulationResult) PlayStatus`

Ordering contract: caller passes history ordered by `run_at ASC`. “Last 10” means the final 10 elements of the slice.

Loss rate:

```text
(SimLoss + SimAcceptableLoss + SimRuleBreach) / total results
```

Evaluation order:

```text
1. len(history) == 0                                        → RawGuess
2. Any SimQuarantine result                                 → Quarantined
3. RuleBreach count / total > 0.10                          → Quarantined
4. Loss rate ≤ 0.25 AND total ≥ 20 AND no RuleBreach last 10 → AlgorillaReady
5. Loss rate ≤ 0.40 AND total ≥ 10                          → Stable
6. Loss rate ≤ 0.60                                         → ReducedStupidity
7. Loss rate > 0.60                                         → Testing
```

`AlgorillaReady` is evaluated before `Stable`.

## Store Layer

`internal/store/errors.go`:

```go
package store

import "errors"

var ErrNotFound = errors.New("record not found")
```

Each entity implements:

```text
Create(ctx, db, entity) error
GetByID(ctx, db, id) (*Entity, error)
List(ctx, db) ([]*Entity, error)
```

Additional methods:

```go
UpdateStatus(ctx context.Context, db *sql.DB, id string, status models.PlayStatus) error
Quarantine(ctx context.Context, db *sql.DB, id string) error
ListGuessesByFirm(ctx context.Context, db *sql.DB, firmID string) ([]*models.Guess, error)
ListSimulationResultsByGuess(ctx context.Context, db *sql.DB, guessID string) ([]models.SimulationResult, error)
ListHarvests(ctx context.Context, db *sql.DB) ([]*models.W3ScytheHarvest, error)
```

`ListSimulationResultsByGuess` must use:

```sql
ORDER BY run_at ASC
```

## ID and Timestamp Defaults

During all `Create()` operations:

```text
empty entity ID → uuid.NewString()
empty CreatedAt → time.Now().UTC().Format(time.RFC3339)
empty RunAt → time.Now().UTC().Format(time.RFC3339)
never overwrite non-empty user-provided IDs or timestamps
```

## Dependency Boundary

```text
engine must not import store
store must not import engine
```

W³ classification happens in the CLI layer:

```text
1. Decode JSON → SimulationResult
2. Apply ID/timestamp defaults
3. result.WinLossOnly = engine.ClassifyW3Outcome(result.Outcome)
4. store.CreateSimulationResult(...)
```

## CLI Commands

Global flag:

```bash
--db <path>    default ./msp.sqlite
```

Commands:

```bash
msp firm add --file <json>
msp firm list
msp scenario add --file <json>
msp scenario list
msp guess add --file <json>
msp guess list --firm <firm_id>
msp guess quarantine --id <guess_id>
msp sim add --file <json>
msp sim list --guess <guess_id>
msp harvest add --file <json>
msp failure add --file <json>
msp hud --guess <guess_id>
```

Recommended smoke-test convenience flags:

```bash
msp sim add --file <json> --guess <guess_id>
msp harvest add --file <json> --result <result_id>
```

## Terminal HUD

Required labels:

```text
W³ MOUSEION PROTOCOL — PROP HUD
W³ STATE
RULE SAFETY BANDS
DEATH-ZONE DISTANCE
MSP INBOX — LAST HARVEST
```

## Tests

Write table-driven tests for:

```text
engine/fuzzy_test.go
engine/w3_test.go
engine/permission_test.go
engine/promotion_test.go
```

Required checks:

```text
ClassifyBand: all 6 bands, exact boundaries, -1, 101
ClassifyW3Outcome: all 5 outcomes; AcceptableLoss returns Loss
GetPermissionState: all decision paths; default is Mixed, not AllowedNormal
EvaluatePromotion: RawGuess, Quarantined, Testing, ReducedStupidity, Stable, AlgorillaReady
Critical promotion test: AlgorillaReady must not return Stable
```

## Example Fixture IDs

```text
firm_id: topstep-50k
scenario_id: chop-death-001
guess_id: empty, auto-generated
result_id: empty, auto-generated
harvest_id: empty, auto-generated
failure_id: empty, auto-generated
```

## Build Commands

```bash
go mod tidy
go build ./cmd/msp/...
go vet ./...
go test ./internal/engine/...
```

## Smoke Test

```bash
go run ./cmd/msp --db ./msp.sqlite firm add --file examples/firm.topstep50k.json
go run ./cmd/msp --db ./msp.sqlite firm list
go run ./cmd/msp --db ./msp.sqlite scenario add --file examples/scenario.chop-death.json
go run ./cmd/msp --db ./msp.sqlite guess add --file examples/guess.small-harvest.json
go run ./cmd/msp --db ./msp.sqlite guess list --firm topstep-50k
# note printed guess_id
go run ./cmd/msp --db ./msp.sqlite sim add --file examples/sim.acceptable-loss.json --guess <guess_id>
# note printed result_id
go run ./cmd/msp --db ./msp.sqlite sim list --guess <guess_id>
go run ./cmd/msp --db ./msp.sqlite harvest add --file examples/harvest.acceptable-loss.json --result <result_id>
go run ./cmd/msp --db ./msp.sqlite failure add --file examples/failure.trailing-drawdown.json
go run ./cmd/msp --db ./msp.sqlite hud --guess <guess_id>
```

## Forbidden Labels

Do not use anywhere in output or UI strings:

```text
Prediction
Guaranteed Win
Perfect Setup
Max Profit
Can't Lose
```

## Required Labels

Use exactly as written:

```text
MSP Inbox
W³ Judgment
Scythe Harvest
Stupidity Reduced
Acceptable Loss
Failure Pattern
Death-Zone Distance
Allowed Small
Quarantine
Algorilla Ready
```

## Alpha Safety Note

This document is a build spec mirror. It does not enable external actions, production writes, or runtime integration. Runtime integration must pass the Padded Room release gate first.
