export interface TelemetryData {
  distanceKm: number;          // Millions of km (54.6 to 401)
  oneWayLatencySec: number;    // One-way signal delay in seconds
  oneWayLatencyMin: number;    // One-way signal delay in minutes
  roundTripLatencyMin: number; // RTT in minutes
  bandwidthMbps: number;       // Current data link bandwidth
  sunAngleDeg: number;         // Sun-Earth-Mars angle (conjunction check)
  isConjunction: boolean;      // True if solar blackout (<3 degrees)
  synodicMonth: number;        // Month 0 to 26
}

export interface DataPayloadItem {
  id: string;
  name: string;
  category: 'Emergency' | 'Telemetry' | 'Navigation' | 'Scientific' | 'Images' | 'System';
  sizeMB: number;
  priorityScore: number; // 1 (highest) to 5 (lowest)
  urgencyLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: string;
  status: 'QUEUED' | 'TRANSMITTING' | 'SENT' | 'STORED_IN_DTN';
  criticalityScore: number;
  deadlineUrgency: number;
  safetyRelevance: number;
}

export interface AnomalyReport {
  id: string;
  title: string;
  subsystem: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  timestamp: string;
  earthNoticeDelayMin: number;
  autonomousActionTaken: string;
  aiRecommendation: string;
  ruleApproved: boolean;
  status: 'RESOLVED_AUTONOMOUSLY' | 'PENDING_EARTH_CONFIRMATION' | 'MONITORING';
}

export interface DTNBundle {
  bundleId: string;
  source: string;
  destination: string;
  hops: string[];
  payloadSize: string;
  successRate: string;
  status: 'DELIVERED' | 'STORED_AT_ORBITER' | 'IN_TRANSIT';
}

export interface DtnBundle {
  id: string;
  priority: number;
  sizeMb: number;
  createdAt: number;
  deadlineMin: number;
  criticality: number;
  status: 'BUFFERED' | 'TRANSMITTING' | 'DELIVERED' | 'EXPIRED';
  payloadName: string;
}

export interface AutonomousAction {
  actionId: string;
  triggeredBy: string;
  rationale: string;
  safetyValidated: boolean;
  estimatedEffect: string;
  timestamp: string;
  numericTimestamp: number;
}

export interface SchedulerComparison {
  baselineMissionValue: number;
  optimizedMissionValue: number;
  baselineCriticalDelivered: number;
  optimizedCriticalDelivered: number;
  baselineBytesDeliveredMb: number;
  optimizedBytesDeliveredMb: number;
  measuredImprovementPct: number;
}

export interface BenchmarkMetrics {
  precisionPct: number;
  recallPct: number;
  f1ScorePct: number;
  falsePositiveRatePct: number;
  detectionRatePct: number;
  earthDependentResponseMin: number;
  keplerLocalResponseSec: number | null;
  responseTimeReductionPct: number | null;
  evaluationSampleSize: number;
  evaluatedAt: number;
  status: 'PENDING' | 'READY' | 'ERROR';
}

export interface MissionEvent {
  id: string;
  numericTimestamp: number;
  timestamp: string;
  category: 'PHYSICS' | 'ANOMALY' | 'SAFETY' | 'DTN' | 'SCHEDULER' | 'SYSTEM' | 'DEMO';
  message: string;
  details?: string;
}

export type DemoStepId = 'IDLE' | 'CONJUNCTION_START' | 'COMMUNICATION_BLACKOUT' | 'ANOMALY_INJECTED' | 'ANOMALY_DETECTED' | 'SAFETY_VALIDATION' | 'LOCAL_ACTION_EXECUTED' | 'SPACECRAFT_STABILIZED' | 'CONTACT_RESTORED' | 'DTN_SCHEDULING' | 'CRITICAL_DATA_TRANSMITTING' | 'EARTH_DATA_RECEIVED' | 'DEMO_COMPLETE';

export interface UnifiedMissionState {
  missionTimeSec: number;
  synodicMonth: number;
  isDemoActive: boolean;
  demoStep: DemoStepId;
  demoProgressPct: number;
  orbital: {
    earthRadiusAu: number;
    marsRadiusAu: number;
    distanceKm: number;
    distanceAu: number;
    oneWayLatencyMin: number;
    roundTripLatencyMin: number;
    sunAngleDeg: number;
    communicationState: 'NORMAL' | 'DEGRADED' | 'SOLAR_BLACKOUT';
    communicationAvailable: boolean;
    blackoutReason?: string;
  };
  spacecraftHealth: 'NOMINAL' | 'DEGRADED' | 'CRITICAL';
  spacecraftOperationalState: 'NOMINAL' | 'THERMAL_MITIGATION' | 'POWER_CONSERVATION' | 'ANTENNA_RECOVERY' | 'STABILIZING' | 'STABILIZED';
  dtnQueue: DtnBundle[];
  latestAction?: AutonomousAction;
  schedulerComparison?: SchedulerComparison;
  benchmarkMetrics?: BenchmarkMetrics;
  events: MissionEvent[];
}
