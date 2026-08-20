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
