import type { DtnBundle, DataPayloadItem } from '../types/mission';
import { runKeplerOptimizer } from './schedulerOptimizer';

export const INITIAL_DTN_QUEUE: DtnBundle[] = [
  { id: 'b1', priority: 1, sizeMb: 100, createdAt: 1700000000000, deadlineMin: 10, criticality: 100, status: 'BUFFERED', payloadName: 'Emergency Telemetry & Fault Flags' },
  { id: 'b2', priority: 2, sizeMb: 350, createdAt: 1700000000000, deadlineMin: 30, criticality: 80, status: 'BUFFERED', payloadName: 'Critical Spacecraft Status & Health' },
  { id: 'b3', priority: 3, sizeMb: 200, createdAt: 1700000000000, deadlineMin: 60, criticality: 75, status: 'BUFFERED', payloadName: 'Navigation & Trajectory Adjustments' },
  { id: 'b4', priority: 4, sizeMb: 150, createdAt: 1700000000000, deadlineMin: 90, criticality: 60, status: 'BUFFERED', payloadName: 'Rover Scientific Spectrometer Data' },
];

class DtnQueueService {
  private queue: DtnBundle[] = INITIAL_DTN_QUEUE.map(b => ({ ...b }));
  private optimizerFn = runKeplerOptimizer;

  public getQueue(): DtnBundle[] {
    return [...this.queue];
  }

  public reset(initialBundles?: DtnBundle[]): void {
    const bundlesToSet = initialBundles ? initialBundles.map(b => ({ ...b })) : INITIAL_DTN_QUEUE.map(b => ({ ...b }));
    const ids = new Set<string>();
    for (const b of bundlesToSet) {
      if (ids.has(b.id)) {
        throw new Error(`Duplicate DTN bundle ID detected: ${b.id}`);
      }
      ids.add(b.id);
    }
    this.queue = bundlesToSet;
  }

  public setOptimizerForTesting(fn: typeof runKeplerOptimizer | null): void {
    this.optimizerFn = fn || runKeplerOptimizer;
  }

  public addBundle(bundle: DtnBundle): void {
    if (this.queue.some(b => b.id === bundle.id)) {
      throw new Error(`Duplicate DTN bundle ID detected: ${bundle.id}`);
    }
    this.queue.push(bundle);
  }

  public getCandidateInspection(capacityMb: number): { bufferedCandidateIds: string[]; selectedIds: string[] } {
    const buffered = this.queue.filter(b => b.status === 'BUFFERED');
    const bufferedCandidateIds = buffered.map(b => b.id);
    const selectedIds = Array.from(this.selectTransmissionCandidates(capacityMb));
    return { bufferedCandidateIds, selectedIds };
  }

  private selectTransmissionCandidates(capacityMb: number): Set<string> {
    const buffered = this.queue.filter(b => b.status === 'BUFFERED');
    if (buffered.length === 0 || capacityMb <= 0) {
      return new Set();
    }

    const payloadItems: DataPayloadItem[] = buffered.map(b => ({
      id: b.id,
      name: b.payloadName,
      category: 'Telemetry',
      sizeMB: b.sizeMb,
      priorityScore: b.priority,
      urgencyLevel: b.priority === 1 ? 'CRITICAL' : 'HIGH',
      timestamp: '00:00',
      status: 'QUEUED',
      criticalityScore: b.criticality,
      deadlineUrgency: 0.8,
      safetyRelevance: b.priority === 1 ? 100 : 50,
    }));

    const result = this.optimizerFn(payloadItems, capacityMb);
    return new Set(result.scheduled.filter(i => i.status === 'SENT').map(i => i.id));
  }

  public processQueue(commAvailable: boolean, capacityMb: number): DtnBundle[] {
    if (!commAvailable || capacityMb <= 0) {
      this.queue = this.queue.map(b => (b.status === 'TRANSMITTING' ? { ...b, status: 'BUFFERED' } : b));
      return [...this.queue];
    }

    // Revert TRANSMITTING bundles to BUFFERED if total size of current TRANSMITTING bundles exceeds new capacityMb
    const currentTxBytes = this.queue.filter(b => b.status === 'TRANSMITTING').reduce((sum, b) => sum + b.sizeMb, 0);
    const isExceedingCapacity = currentTxBytes > capacityMb;

    if (isExceedingCapacity) {
      this.queue = this.queue.map(b => (b.status === 'TRANSMITTING' ? { ...b, status: 'BUFFERED' } : b));
    }

    const sentIds = this.selectTransmissionCandidates(capacityMb);

    this.queue = this.queue.map(b => {
      if (b.status === 'DELIVERED') {
        return b;
      }
      if (b.status === 'TRANSMITTING' && !isExceedingCapacity) {
        return b;
      }
      if (sentIds.has(b.id)) {
        return { ...b, status: 'TRANSMITTING' };
      }
      return { ...b, status: 'BUFFERED' };
    });

    return [...this.queue];
  }

  public startTransmission(capacityMb: number): void {
    const sentIds = this.selectTransmissionCandidates(capacityMb);

    this.queue = this.queue.map(b => {
      if (b.status === 'DELIVERED') return b;
      if (sentIds.has(b.id)) {
        return { ...b, status: 'TRANSMITTING' };
      }
      return b;
    });
  }

  public confirmDelivery(): void {
    this.queue = this.queue.map(b => {
      if (b.status === 'TRANSMITTING') {
        return { ...b, status: 'DELIVERED' };
      }
      return b;
    });
  }
}

export const dtnQueueService = new DtnQueueService();
