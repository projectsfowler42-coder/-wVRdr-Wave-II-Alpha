import type { TruthClass } from "./truth.js";

export type SourceKind =
  | "PRICE_SPINE"
  | "MACRO_SPINE"
  | "EVENT_SPINE"
  | "BROKER_EXPORT"
  | "PROP_ATTEMPT"
  | "MANUAL_OPERATOR_NOTE"
  | "UNKNOWN";

export type SourceStatus = "MISSING" | "CANDIDATE" | "LOADED" | "VALIDATED" | "REJECTED";

export interface R3SourceManifestRecord {
  sourceId: string;
  kind: SourceKind;
  status: SourceStatus;
  title: string;
  pathOrUrl?: string;
  coverageStart?: string;
  coverageEnd?: string;
  licenseStatus: "UNKNOWN" | "FREE" | "PAID" | "INTERNAL" | "RESTRICTED";
  confidence: number;
  notes: string[];
}

export type EventCategory =
  | "WAR"
  | "POLICY"
  | "TRADE"
  | "CURRENCY"
  | "TECHNOLOGY"
  | "NATURAL"
  | "POLITICAL"
  | "CREDIT"
  | "BANKING"
  | "OTHER";

export interface R3EventNode {
  eventId: string;
  dateStart: string;
  dateEnd?: string;
  dateResolution: "DAY" | "MONTH" | "YEAR" | "UNCERTAIN";
  category: EventCategory;
  entities: string[];
  geography: string[];
  magnitudeProxy: {
    articleLength?: number;
    citationCount?: number;
    inboundLinks?: number;
    sourceCount?: number;
  };
  confidence: number;
  sourceIds: string[];
}

export interface R3FeatureVector {
  vectorId: string;
  entityId: string;
  asOf: string;
  pointInTimeAvailableAt: string;
  sourceIds: string[];
  features: Record<string, number | string | boolean | null>;
}

export interface R3PredictionRecord {
  predictionId: string;
  candidateId: string;
  asOf: string;
  horizonDays: number;
  expectedDirection: "UP" | "DOWN" | "FLAT" | "VOLATILE" | "UNKNOWN";
  expectedMagnitudePct?: number;
  expectedMechanism?: string;
  truthClass: TruthClass;
  trainingWindow: { start: string; end: string };
  validationWindow?: { start: string; end: string };
  featureVectorIds: string[];
  sourceIds: string[];
}

export type WiffWinGrade = "F" | "D" | "C" | "B" | "A" | "S";
export type R3MissType =
  | "CATASTROPHIC_INVERSE"
  | "WRONG_DIRECTION"
  | "WRONG_MAGNITUDE"
  | "WRONG_TIMING"
  | "SURVIVORSHIP_BLINDNESS"
  | "CONSTRAINT_DEATH_IGNORED"
  | "DATA_QUALITY_FAILURE"
  | "UNKNOWN";

export interface R3SarlaacRecord {
  sarlaacId: string;
  predictionId: string;
  grade: WiffWinGrade;
  missType?: R3MissType;
  expectedSummary: string;
  actualSummary: string;
  failedBecause?: string;
  missingFeatureNeeded: string[];
  misleadingFeatureIds: string[];
  revisedQuestion: string;
  sourceIds: string[];
  createdAt: string;
}

export function sourceIsUsable(source: R3SourceManifestRecord): boolean {
  return source.status === "VALIDATED" && source.confidence >= 0.7;
}

export function predictionCanBeScored(prediction: R3PredictionRecord): boolean {
  return Boolean(prediction.validationWindow && prediction.featureVectorIds.length > 0);
}

export function sarlaacRecordIsActionable(record: R3SarlaacRecord): boolean {
  return record.revisedQuestion.trim().length > 0 && record.missingFeatureNeeded.length > 0;
}
