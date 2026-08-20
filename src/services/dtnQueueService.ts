import type { DtnBundle, DataPayloadItem } from '../types/mission';
import { runKeplerOptimizer } from './schedulerOptimizer';

class DtnQueueService {
  private queue: DtnBundle[] = [
    { id: 'b1', priority: 1, sizeMb: 100, createdAt: Date.now() - 60000, deadlineMin: 10, criticality: 100, status: 'BUFFERED', payloadName: 'Emergency Telemetry & Fault Flags' },
    { id: 'b2', priority: 2, sizeMb: 500, createdAt: Date.now() - 40000, deadlineMin: 30, criticality: 80, status: 'BUFFERED', payloadName: 'Critical Spacecraft Status & Health' },
    { id: 'b3', priority: 3, sizeMb: 400, createdAt: Date.now() - 20000, deadlineMin: 60, criticality: 75, status: 'BUFFERED', payloadName: 'Navigation & Trajectory Adjustments' },
  ];

  public getQueue(): DtnBundle[] {
    return [...this.queue];
  }

  public addBundle(bundle: DtnBundle): void {
    this.queue.push(bundle);
  }

  public processQueue(commAvailable: boolean, capacityMb: number): DtnBundle[] {
    if (!commAvailable || capacityMb <= 0) {
      this.queue = this.queue.map(b => (b.status === 'TRANSMITTING' ? { ...b, status: 'BUFFERED' } : b));
      return [...this.queue];
    }

    const payloadItems: DataPayloadItem[] = this.queue.map(b => ({
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

    const result = runKeplerOptimizer(payloadItems, capacityMb);
    const sentIds = new Set(result.scheduled.filter(i => i.status === 'SENT').map(i => i.id));

    this.queue = this.queue.map(b => {
      if (sentIds.has(b.id)) {
        return { ...b, status: 'DELIVERED' };
      }
      return { ...b, status: 'BUFFERED' };
    });

    return [...this.queue];
  }
}

export const dtnQueueService = new DtnQueueService();
