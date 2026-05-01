package nonzero

import "testing"

func TestNewEventDefaultsToNonExecutableUnverified(t *testing.T) {
	event := NewEvent(" nz-1 ", SourceScuttlebutt, " rumor ", " summary ")

	if event.ID != "nz-1" {
		t.Fatalf("ID = %q", event.ID)
	}
	if event.TruthClass != TruthScuttlebuttUnverified {
		t.Fatalf("truthClass = %s", event.TruthClass)
	}
	if event.Status != StatusCollected {
		t.Fatalf("status = %s", event.Status)
	}
	if event.ExecutionAllowed {
		t.Fatal("new Non-Zero event must not allow execution")
	}
}

func TestChallengeKeepsExecutionLocked(t *testing.T) {
	event := NewEvent("nz-2", SourceDevilsAdvocate, "topic", "summary")
	event.ExecutionAllowed = true

	challenged := Challenge(event, "review note")
	if challenged.Status != StatusChallenged {
		t.Fatalf("status = %s", challenged.Status)
	}
	if challenged.ExecutionAllowed {
		t.Fatal("challenged Non-Zero event must not allow execution")
	}
	if len(challenged.ReviewNotes) == 0 {
		t.Fatal("expected challenge review notes")
	}
}

func TestPromotionStillNonExecutable(t *testing.T) {
	event := NewEvent("nz-3", SourceCommunity, "topic", "summary")
	event.ExecutionAllowed = true

	promoted := PromoteToPatternCandidate(event, "repeated pattern")
	if promoted.TruthClass != TruthPatternCandidate {
		t.Fatalf("truthClass = %s", promoted.TruthClass)
	}
	if promoted.ExecutionAllowed {
		t.Fatal("pattern candidate must still be non-executable")
	}
}

func TestQuarantineStillNonExecutable(t *testing.T) {
	event := NewEvent("nz-4", SourceCommunity, "topic", "summary")
	event.ExecutionAllowed = true

	quarantined := Quarantine(event, "bad source")
	if quarantined.TruthClass != TruthQuarantined {
		t.Fatalf("truthClass = %s", quarantined.TruthClass)
	}
	if quarantined.ExecutionAllowed {
		t.Fatal("quarantined event must not allow execution")
	}
}
