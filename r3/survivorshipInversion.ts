export type EntityType = "COMPANY" | "ETF" | "FUND" | "INDEX" | "STRATEGY" | "PROP_ATTEMPT" | "INSTRUMENT";
export type DeathType = "NONE" | "BANKRUPTCY" | "DELISTING" | "MERGER" | "LIQUIDATION" | "HALT" | "DATA_DISAPPEARANCE" | "STRATEGY_FAILURE" | "PROP_ACCOUNT_FAILURE" | "UNKNOWN";
export type SurvivorOnlyRisk = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface EntityLifeCycle {
  entityId: string;
  entityType: EntityType;
  birthDate?: string;
  firstObservedDate: string;
  lastObservedDate?: string;
  deathDate?: string;
  deathType: DeathType;
  survivedToWindowEnd: boolean;
  sourceIds: string[];
  confidence: number;
}

export interface SurvivorshipProfile {
  datasetId: string;
  windowStart: string;
  windowEnd: string;
  totalEntitiesObserved: number;
  survivors: number;
  nonSurvivors: number;
  unknownStatus: number;
  survivorOnlyRisk: SurvivorOnlyRisk;
  notes: string[];
}

export interface NegativeSpaceFeature {
  entityId: string;
  featureDate: string;
  missingExpectedObservation: boolean;
  lastKnownStateSummary?: string;
  inferredRisk: "NONE" | "DATA_GAP" | "POSSIBLE_FAILURE" | "CONFIRMED_FAILURE" | "UNKNOWN";
  sourceIds: string[];
}

export function buildSurvivorshipProfile(args: {
  datasetId: string;
  windowStart: string;
  windowEnd: string;
  entities: EntityLifeCycle[];
}): SurvivorshipProfile {
  const survivors = args.entities.filter((e) => e.survivedToWindowEnd).length;
  const nonSurvivors = args.entities.filter((e) => !e.survivedToWindowEnd && e.deathType !== "UNKNOWN").length;
  const unknownStatus = args.entities.filter((e) => e.deathType === "UNKNOWN").length;
  const totalEntitiesObserved = args.entities.length;
  const notes: string[] = [];
  let survivorOnlyRisk: SurvivorOnlyRisk = "LOW";

  if (totalEntitiesObserved === 0) {
    survivorOnlyRisk = "CRITICAL";
    notes.push("No entities observed.");
  } else if (nonSurvivors === 0 && survivors > 0) {
    survivorOnlyRisk = "CRITICAL";
    notes.push("Dataset appears survivor-only; graveyard cohort missing.");
  } else {
    const rate = nonSurvivors / totalEntitiesObserved;
    if (rate < 0.01) survivorOnlyRisk = "HIGH";
    else if (rate < 0.05) survivorOnlyRisk = "MEDIUM";
  }

  if (unknownStatus > 0) notes.push(`${unknownStatus} entities have unknown lifecycle status.`);

  return { datasetId: args.datasetId, windowStart: args.windowStart, windowEnd: args.windowEnd, totalEntitiesObserved, survivors, nonSurvivors, unknownStatus, survivorOnlyRisk, notes };
}

export function createNegativeSpaceFeature(args: {
  entityId: string;
  featureDate: string;
  expectedObservationMissing: boolean;
  lastKnownStateSummary?: string;
  sourceIds: string[];
}): NegativeSpaceFeature {
  const feature: NegativeSpaceFeature = {
    entityId: args.entityId,
    featureDate: args.featureDate,
    missingExpectedObservation: args.expectedObservationMissing,
    inferredRisk: args.expectedObservationMissing ? "POSSIBLE_FAILURE" : "NONE",
    sourceIds: args.sourceIds,
  };

  if (args.lastKnownStateSummary !== undefined) {
    feature.lastKnownStateSummary = args.lastKnownStateSummary;
  }

  return feature;
}

export function blocksEdgeConfirmation(profile: SurvivorshipProfile): boolean {
  return profile.survivorOnlyRisk === "HIGH" || profile.survivorOnlyRisk === "CRITICAL";
}
