package nonzero

import (
	"strings"
	"time"
)

type TruthClass string
type Status string
type SourceType string

const (
	TruthScuttlebuttUnverified TruthClass = "SCUTTLEBUTT_UNVERIFIED"
	TruthNarrativeConfirmed    TruthClass = "NARRATIVE_CONFIRMED"
	TruthNarrativeContradicted TruthClass = "NARRATIVE_CONTRADICTED"
	TruthPostEventExplanation  TruthClass = "POST_EVENT_EXPLANATION"
	TruthPatternCandidate      TruthClass = "PATTERN_CANDIDATE"
	TruthQuarantined           TruthClass = "QUARANTINED"

	StatusCollected   Status = "COLLECTED"
	StatusUnderReview Status = "UNDER_REVIEW"
	StatusChallenged  Status = "CHALLENGED"
	StatusDisproven   Status = "DISPROVEN"
	StatusArchived    Status = "ARCHIVED"
	StatusPromoted    Status = "PROMOTED_TO_PATTERN_CANDIDATE"

	SourceScuttlebutt       SourceType = "SCUTTLEBUTT"
	SourceDevilsAdvocate    SourceType = "DEVILS_ADVOCATE_REVIEW"
	SourceOfficialNarrative SourceType = "OFFICIAL_NARRATIVE"
	SourceCommunity         SourceType = "COMMUNITY_CHATTER"
	SourceMarketReaction    SourceType = "MARKET_REACTION"
)

type Event struct {
	ID               string     `json:"id"`
	ObservedAt       string     `json:"observedAt"`
	SourceType       SourceType `json:"sourceType"`
	SourceLabel      string     `json:"sourceLabel"`
	Region           string     `json:"region"`
	Topic            string     `json:"topic"`
	Summary          string     `json:"summary"`
	ClaimedDirection string     `json:"claimedDirection"`
	Confidence       float64    `json:"confidence"`
	Contradictions   []string   `json:"contradictions"`
	MarketWindow     string     `json:"marketWindow"`
	RelatedTickers   []string   `json:"relatedTickers"`
	TruthClass       TruthClass `json:"truthClass"`
	Status           Status     `json:"status"`
	ReviewNotes      []string   `json:"reviewNotes"`
	ExecutionAllowed bool       `json:"executionAllowed"`
}

func NewEvent(id string, sourceType SourceType, topic string, summary string) Event {
	return Event{
		ID:               strings.TrimSpace(id),
		ObservedAt:       time.Now().UTC().Format(time.RFC3339Nano),
		SourceType:       sourceType,
		Topic:            strings.TrimSpace(topic),
		Summary:          strings.TrimSpace(summary),
		Confidence:       0,
		Contradictions:   []string{},
		RelatedTickers:   []string{},
		TruthClass:       TruthScuttlebuttUnverified,
		Status:           StatusCollected,
		ReviewNotes:      []string{},
		ExecutionAllowed: false,
	}
}

func ChallengeQuestions() []string {
	return []string{
		"What if this is wrong?",
		"What if the opposite is true?",
		"Who benefits if this story spreads?",
		"Is this leading market behavior or explaining it after the fact?",
		"What market instruments should have reacted if this mattered?",
		"Did they react?",
		"Did they react before, during, or after the story became visible?",
		"Is this causal, coincident, or decorative narrative?",
	}
}

func Challenge(event Event, notes ...string) Event {
	event.Status = StatusChallenged
	event.ReviewNotes = append(event.ReviewNotes, ChallengeQuestions()...)
	for _, note := range notes {
		note = strings.TrimSpace(note)
		if note != "" {
			event.ReviewNotes = append(event.ReviewNotes, note)
		}
	}
	event.ExecutionAllowed = false
	return event
}

func PromoteToPatternCandidate(event Event, reason string) Event {
	event.Status = StatusPromoted
	event.TruthClass = TruthPatternCandidate
	event.ExecutionAllowed = false
	reason = strings.TrimSpace(reason)
	if reason != "" {
		event.ReviewNotes = append(event.ReviewNotes, reason)
	}
	return event
}

func Quarantine(event Event, reason string) Event {
	event.Status = StatusArchived
	event.TruthClass = TruthQuarantined
	event.ExecutionAllowed = false
	reason = strings.TrimSpace(reason)
	if reason != "" {
		event.ReviewNotes = append(event.ReviewNotes, reason)
	}
	return event
}
