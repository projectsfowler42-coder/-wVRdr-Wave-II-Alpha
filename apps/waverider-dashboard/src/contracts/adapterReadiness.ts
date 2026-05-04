export type AdapterReadiness = "MOCK_ONLY" | "LOCAL_ONLY" | "DEGRADED" | "CERTIFIED";

export type AdapterBoundary = {
  adapterName: string;
  readiness: AdapterReadiness;
  canUsePrivateData: false;
  canUseBrokerConnection: false;
  canUseExecutionAuthority: false;
  notes: string[];
};

export const mockAdapterBoundary: AdapterBoundary = {
  adapterName: "mock-dashboard-snapshot-adapter",
  readiness: "MOCK_ONLY",
  canUsePrivateData: false,
  canUseBrokerConnection: false,
  canUseExecutionAuthority: false,
  notes: [
    "Visual prototype only.",
    "No private account data.",
    "No broker connection.",
    "No execution authority.",
  ],
};
