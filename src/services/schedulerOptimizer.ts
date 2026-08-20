import type { DataPayloadItem, SchedulerComparison } from '../types/mission';

export const CRITICALITY_WEIGHT = 0.4;
export const SAFETY_WEIGHT = 0.4;
export const URGENCY_WEIGHT = 20.0;

/**
 * DISCRETIZATION APPROXIMATION NOTICE:
 * GRID_SCALE = 50 discretization converts payload sizeMB into integer weight units (W = capacityMB / 50).
 * This enables exact pseudo-polynomial 0/1 Dynamic Programming Knapsack optimization O(N*W)
 * for bounded queue items sized in multiples of 50 MB.
 */
export const GRID_SCALE = 50;

export const INITIAL_PAYLOADS: DataPayloadItem[] = [
  { id: 'p1', name: 'Emergency Telemetry & Fault Flags', category: 'Emergency', sizeMB: 100, priorityScore: 1, urgencyLevel: 'CRITICAL', timestamp: '00:00', status: 'QUEUED', criticalityScore: 100, deadlineUrgency: 0.99, safetyRelevance: 100 },
  { id: 'p2', name: 'Critical Spacecraft Status & Health', category: 'Telemetry', sizeMB: 500, priorityScore: 2, urgencyLevel: 'HIGH', timestamp: '02:00', status: 'QUEUED', criticalityScore: 80, deadlineUrgency: 0.85, safetyRelevance: 85 },
  { id: 'p3', name: 'Navigation & Trajectory Adjustments', category: 'Navigation', sizeMB: 400, priorityScore: 3, urgencyLevel: 'HIGH', timestamp: '04:00', status: 'QUEUED', criticalityScore: 75, deadlineUrgency: 0.70, safetyRelevance: 70 },
  { id: 'p4', name: 'Rover Scientific Spectrometer Data', category: 'Scientific', sizeMB: 2048, priorityScore: 4, urgencyLevel: 'MEDIUM', timestamp: '07:00', status: 'QUEUED', criticalityScore: 40, deadlineUrgency: 0.40, safetyRelevance: 10 },
  { id: 'p5', name: 'High-Res Terrain & Orbital Images', category: 'Images', sizeMB: 5120, priorityScore: 5, urgencyLevel: 'LOW', timestamp: '09:00', status: 'QUEUED', criticalityScore: 20, deadlineUrgency: 0.20, safetyRelevance: 5 },
];

export function calculateItemObjective(item: DataPayloadItem): number {
  return (
    item.criticalityScore * CRITICALITY_WEIGHT +
    item.safetyRelevance * SAFETY_WEIGHT +
    item.deadlineUrgency * URGENCY_WEIGHT
  );
}

export function runBaselineScheduler(items: DataPayloadItem[], capacityMb: number): { scheduled: DataPayloadItem[]; value: number; bytes: number; criticalDelivered: number } {
  const sorted = [...items].sort((a, b) => a.priorityScore - b.priorityScore);
  let cap = capacityMb;
  let value = 0;
  let bytes = 0;
  let criticalDelivered = 0;
  const scheduled: DataPayloadItem[] = [];

  for (const item of sorted) {
    if (cap >= item.sizeMB) {
      cap -= item.sizeMB;
      scheduled.push({ ...item, status: 'SENT' });
      value += calculateItemObjective(item);
      bytes += item.sizeMB;
      if (item.urgencyLevel === 'CRITICAL' || item.urgencyLevel === 'HIGH') criticalDelivered++;
    } else {
      scheduled.push({ ...item, status: 'STORED_IN_DTN' });
    }
  }

  return { scheduled, value, bytes, criticalDelivered };
}

// True 0/1 Dynamic Programming Knapsack Optimizer
export function runKeplerOptimizer(items: DataPayloadItem[], capacityMb: number): { scheduled: DataPayloadItem[]; value: number; bytes: number; criticalDelivered: number } {
  const n = items.length;
  const W = Math.floor(capacityMb / GRID_SCALE);

  if (W <= 0 || n === 0) {
    return {
      scheduled: items.map(i => ({ ...i, status: 'STORED_IN_DTN' })),
      value: 0,
      bytes: 0,
      criticalDelivered: 0,
    };
  }

  const weights = items.map(i => Math.max(1, Math.ceil(i.sizeMB / GRID_SCALE)));
  const values = items.map(i => calculateItemObjective(i));

  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const w_i = weights[i - 1];
    const v_i = values[i - 1];
    for (let w = 0; w <= W; w++) {
      if (w_i <= w) {
        dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - w_i] + v_i);
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }

  const selectedIndices = new Set<number>();
  let w = W;
  for (let i = n; i > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      selectedIndices.add(i - 1);
      w -= weights[i - 1];
    }
  }

  let value = 0;
  let bytes = 0;
  let criticalDelivered = 0;
  const scheduled: DataPayloadItem[] = [];

  items.forEach((item, idx) => {
    if (selectedIndices.has(idx)) {
      scheduled.push({ ...item, status: 'SENT' });
      value += calculateItemObjective(item);
      bytes += item.sizeMB;
      if (item.urgencyLevel === 'CRITICAL' || item.urgencyLevel === 'HIGH') criticalDelivered++;
    } else {
      scheduled.push({ ...item, status: 'STORED_IN_DTN' });
    }
  });

  return { scheduled, value, bytes, criticalDelivered };
}

export function compareSchedulers(items: DataPayloadItem[], capacityMb: number): SchedulerComparison {
  const base = runBaselineScheduler(items, capacityMb);
  const opt = runKeplerOptimizer(items, capacityMb);

  const gain = opt.value - base.value;
  const improvementPct = base.value > 0 ? parseFloat(((gain / base.value) * 100).toFixed(1)) : 0;

  return {
    baselineMissionValue: parseFloat(base.value.toFixed(1)),
    optimizedMissionValue: parseFloat(opt.value.toFixed(1)),
    baselineCriticalDelivered: base.criticalDelivered,
    optimizedCriticalDelivered: opt.criticalDelivered,
    baselineBytesDeliveredMb: base.bytes,
    optimizedBytesDeliveredMb: opt.bytes,
    measuredImprovementPct: improvementPct,
  };
}
