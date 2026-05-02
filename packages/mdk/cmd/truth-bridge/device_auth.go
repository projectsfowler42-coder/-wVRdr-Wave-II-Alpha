package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"
)

const (
	deviceHMACSecretEnv = "WVRDR_DEVICE_HMAC_SECRET"
	deviceProofWindow   = 2 * time.Minute
)

type deviceProofStatus struct {
	Mode              string `json:"mode"`
	Configured        bool   `json:"configured"`
	RequiredWhenSet   bool   `json:"requiredWhenSet"`
	TimestampSkewSecs int    `json:"timestampSkewSecs"`
}

func getDeviceHMACSecret() string {
	return strings.TrimSpace(os.Getenv(deviceHMACSecretEnv))
}

func currentDeviceProofStatus() deviceProofStatus {
	configured := getDeviceHMACSecret() != ""
	mode := "MONITOR_ONLY"
	if configured {
		mode = "HMAC_REQUIRED"
	}
	return deviceProofStatus{
		Mode:              mode,
		Configured:        configured,
		RequiredWhenSet:   true,
		TimestampSkewSecs: int(deviceProofWindow.Seconds()),
	}
}

func canonicalDeviceProofMessage(method string, path string, timestamp string, nonce string, deviceID string) string {
	return method + "\n" + path + "\n" + timestamp + "\n" + nonce + "\n" + deviceID
}

func signDeviceProof(secret string, method string, path string, timestamp string, nonce string, deviceID string) string {
	mac := hmac.New(sha256.New, []byte(secret))
	_, _ = mac.Write([]byte(canonicalDeviceProofMessage(method, path, timestamp, nonce, deviceID)))
	return hex.EncodeToString(mac.Sum(nil))
}

func validateDeviceProof(r *http.Request) error {
	secret := getDeviceHMACSecret()
	if secret == "" {
		return nil
	}

	deviceID := strings.TrimSpace(r.Header.Get("X-wVRdr-Device-Id"))
	nonce := strings.TrimSpace(r.Header.Get("X-wVRdr-Nonce"))
	timestamp := strings.TrimSpace(r.Header.Get("X-wVRdr-Timestamp"))
	signature := strings.TrimSpace(r.Header.Get("X-wVRdr-Fingerprint"))

	if deviceID == "" || nonce == "" || timestamp == "" || signature == "" {
		return fmt.Errorf("missing device proof headers")
	}
	if len(nonce) < 16 {
		return fmt.Errorf("nonce too short")
	}

	parsed, err := time.Parse(time.RFC3339, timestamp)
	if err != nil {
		return fmt.Errorf("invalid device proof timestamp")
	}
	if delta := time.Since(parsed); delta > deviceProofWindow || delta < -deviceProofWindow {
		return fmt.Errorf("device proof timestamp outside freshness window")
	}

	expected := signDeviceProof(secret, r.Method, r.URL.Path, timestamp, nonce, deviceID)
	expectedBytes, err := hex.DecodeString(expected)
	if err != nil {
		return fmt.Errorf("invalid expected proof")
	}
	actualBytes, err := hex.DecodeString(signature)
	if err != nil {
		return fmt.Errorf("invalid proof encoding")
	}
	if !hmac.Equal(actualBytes, expectedBytes) {
		return fmt.Errorf("invalid device proof signature")
	}

	return nil
}

func requireDeviceProof(w http.ResponseWriter, r *http.Request) bool {
	if r.Method == http.MethodOptions {
		return true
	}
	if err := validateDeviceProof(r); err != nil {
		writeJSON(w, http.StatusUnauthorized, failureEnvelope("DEVICE_PROOF_REQUIRED", err.Error()))
		return false
	}
	return true
}
