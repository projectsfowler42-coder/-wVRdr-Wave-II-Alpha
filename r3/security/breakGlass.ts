export type R3SecurityMode = "SAFE_MODE" | "BREAK_GLASS";

export type BiometricProvider =
  | "WEBAUTHN_PLATFORM_AUTHENTICATOR"
  | "ANDROID_BIOMETRIC_PROMPT"
  | "IOS_LOCAL_AUTHENTICATION"
  | "UNKNOWN";

export type BreakGlassScope =
  | "VIEW_PRIVATE_LOCAL_STATUS"
  | "GENERATE_LOCAL_MANIFEST"
  | "GENERATE_REPO_SAFE_PROJECTION"
  | "ACKNOWLEDGE_SECURITY_WARNING"
  | "IMPORT_REPO_SAFE_PROJECTION";

export type AbsoluteBlockReason =
  | "RAW_BROKER_ROWS_PUBLIC_EXPORT"
  | "SECRET_EXPORT"
  | "PRIVATE_KEY_EXPORT"
  | "REFRESH_TOKEN_EXPORT"
  | "FAKE_LIVE_PROMOTION"
  | "BROKER_ORDER_TRANSMISSION"
  | "UNKNOWN";

export interface BiometricAssertionProof {
  provider: BiometricProvider;
  deviceId: string;
  challengeNonce: string;
  signedChallengeHash: string;
  assertedAt: string;
  expiresAt: string;
  userVerification: "REQUIRED" | "PREFERRED" | "DISCOURAGED";
  authenticatorAttachment: "PLATFORM" | "CROSS_PLATFORM" | "UNKNOWN";
}

export interface BreakGlassRequest {
  requestId: string;
  requestedAt: string;
  requestedScope: BreakGlassScope;
  reason: string;
  biometricProof?: BiometricAssertionProof;
}

export interface BreakGlassDecision {
  requestId: string;
  mode: R3SecurityMode;
  allowed: boolean;
  scope?: BreakGlassScope;
  expiresAt?: string;
  findings: Array<{
    severity: "PASS" | "WATCH" | "BLOCK" | "BREACH";
    code: string;
    message: string;
  }>;
}

export interface AbsoluteBlockInput {
  attemptsRawBrokerRowExport?: boolean;
  attemptsSecretExport?: boolean;
  attemptsPrivateKeyExport?: boolean;
  attemptsRefreshTokenExport?: boolean;
  attemptsFakeLivePromotion?: boolean;
  attemptsBrokerOrderTransmission?: boolean;
}

const MAX_BREAK_GLASS_MINUTES = 15;

function parseTime(value: string): number {
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : Number.NaN;
}

export function detectAbsoluteBlocks(input: AbsoluteBlockInput): AbsoluteBlockReason[] {
  const reasons: AbsoluteBlockReason[] = [];
  if (input.attemptsRawBrokerRowExport) reasons.push("RAW_BROKER_ROWS_PUBLIC_EXPORT");
  if (input.attemptsSecretExport) reasons.push("SECRET_EXPORT");
  if (input.attemptsPrivateKeyExport) reasons.push("PRIVATE_KEY_EXPORT");
  if (input.attemptsRefreshTokenExport) reasons.push("REFRESH_TOKEN_EXPORT");
  if (input.attemptsFakeLivePromotion) reasons.push("FAKE_LIVE_PROMOTION");
  if (input.attemptsBrokerOrderTransmission) reasons.push("BROKER_ORDER_TRANSMISSION");
  return reasons;
}

export function evaluateBreakGlassRequest(args: {
  request: BreakGlassRequest;
  nowIso: string;
  absoluteBlockInput?: AbsoluteBlockInput;
}): BreakGlassDecision {
  const findings: BreakGlassDecision["findings"] = [];
  const absoluteBlocks = detectAbsoluteBlocks(args.absoluteBlockInput ?? {});

  for (const reason of absoluteBlocks) {
    findings.push({
      severity: "BREACH",
      code: reason,
      message: "Absolute block cannot be bypassed by biometric break-glass.",
    });
  }

  if (absoluteBlocks.length > 0) {
    return { requestId: args.request.requestId, mode: "SAFE_MODE", allowed: false, findings };
  }

  const proof = args.request.biometricProof;
  if (!proof) {
    findings.push({ severity: "BLOCK", code: "NO_BIOMETRIC_PROOF", message: "Break-glass requires biometric/platform-authenticator proof." });
    return { requestId: args.request.requestId, mode: "SAFE_MODE", allowed: false, findings };
  }

  if (proof.authenticatorAttachment !== "PLATFORM") {
    findings.push({ severity: "BLOCK", code: "NON_PLATFORM_AUTHENTICATOR", message: "Break-glass requires a platform authenticator tied to the trusted device." });
  }

  if (proof.userVerification !== "REQUIRED") {
    findings.push({ severity: "BLOCK", code: "USER_VERIFICATION_NOT_REQUIRED", message: "Break-glass requires explicit user verification." });
  }

  const now = parseTime(args.nowIso);
  const assertedAt = parseTime(proof.assertedAt);
  const expiresAt = parseTime(proof.expiresAt);

  if (!Number.isFinite(now) || !Number.isFinite(assertedAt) || !Number.isFinite(expiresAt)) {
    findings.push({ severity: "BLOCK", code: "INVALID_TIMEBOX", message: "Break-glass proof has invalid timestamps." });
  } else {
    if (expiresAt <= now) {
      findings.push({ severity: "BLOCK", code: "EXPIRED_BIOMETRIC_PROOF", message: "Break-glass biometric proof is expired." });
    }

    if (assertedAt > now) {
      findings.push({ severity: "BLOCK", code: "FUTURE_ASSERTION", message: "Break-glass biometric assertion cannot be from the future." });
    }

    const maxMs = MAX_BREAK_GLASS_MINUTES * 60 * 1000;
    if (expiresAt - assertedAt > maxMs) {
      findings.push({ severity: "BLOCK", code: "BREAK_GLASS_WINDOW_TOO_LONG", message: "Break-glass window exceeds maximum duration." });
    }
  }

  if (proof.challengeNonce.trim().length < 16) {
    findings.push({ severity: "BLOCK", code: "WEAK_CHALLENGE_NONCE", message: "Challenge nonce is too short." });
  }

  if (proof.signedChallengeHash.trim().length < 32) {
    findings.push({ severity: "BLOCK", code: "WEAK_SIGNED_CHALLENGE", message: "Signed challenge hash is too short." });
  }

  const blocked = findings.some((finding) => finding.severity === "BLOCK" || finding.severity === "BREACH");
  if (blocked) {
    return { requestId: args.request.requestId, mode: "SAFE_MODE", allowed: false, findings };
  }

  findings.push({
    severity: "WATCH",
    code: "BREAK_GLASS_ACTIVE",
    message: "Temporary biometric break-glass is active for the requested scope only.",
  });

  return {
    requestId: args.request.requestId,
    mode: "BREAK_GLASS",
    allowed: true,
    scope: args.request.requestedScope,
    expiresAt: proof.expiresAt,
    findings,
  };
}
