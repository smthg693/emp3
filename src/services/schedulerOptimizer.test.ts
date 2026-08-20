import { describe, it, expect } from 'vitest';
import { runBaselineScheduler, runKeplerOptimizer, compareSchedulers, INITIAL_PAYLOADS, calculateItemObjective } from './schedulerOptimizer';

describe('Scheduler Optimizer Unit Tests', () => {

  it('should calculate single objective value consistently', () => {
    const item = INITIAL_PAYLOADS[0];
    const val = calculateItemObjective(item);
    expect(val).toBe(item.criticalityScore * 0.4 + item.safetyRelevance * 0.4 + item.deadlineUrgency * 20.0);
  });

  it('should solve 0/1 Dynamic Programming Knapsack and beat baseline greedy on constrained case', () => {
    const comparison = compareSchedulers(INITIAL_PAYLOADS, 600);
    expect(comparison.optimizedMissionValue).toBeGreaterThanOrEqual(comparison.baselineMissionValue);
  });

});
