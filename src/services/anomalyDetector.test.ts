import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  normalizeReading, 
  classifyRisk, 
  calculateAttributions,
  checkHardLimits,
  isValidThresholds,
  HARD_LIMIT_PRIORITY,
  LocalExplainableAiDetector
} from './anomalyDetector';

import type { StatisticalThresholds, TelemetryReading } from './anomalyDetector';
import { getBenchmarkMetrics, runMlEvaluationOnce } from './anomalyEvaluator';
import { missionStateService } from './missionStateService';
import { demoScenarioService } from './demoScenarioService';
import { evaluateSafetyPolicy } from './safetyPolicy';
import { dtnQueueService } from './dtnQueueService';

describe('TensorFlow.js Anomaly Detection Pipeline Unit Tests', () => {

  const mockThresholds: StatisticalThresholds = {
    meanValError: 0.02,
    stdValError: 0.01,
    lowThreshold: 0.03,
    mediumThreshold: 0.04,
    highThreshold: 0.05,
  };

  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    demoScenarioService.reset();
    dtnQueueService.reset();
  });

  afterEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    demoScenarioService.reset();
    dtnQueueService.reset();
    dtnQueueService.setOptimizerForTesting(null);
  });

  // 13.8A: Definitive proof of retraining fallback starting from null
  it('13.8A: should start initializationSource as null and update to TRAINED when malformed localStorage forces retraining', async () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('spacecraft-autoencoder-v1-thresholds', '{this-is-not-valid-json');
    }

    const detector = new LocalExplainableAiDetector();
    expect(detector.initializationSource).toBeNull();

    await detector.initPromise;

    expect(detector.status).toBe('READY');
    expect(detector.initializationSource).toBe('TRAINED');
    expect(isValidThresholds(detector.thresholds)).toBe(true);
  });

  // Approved decision drives operational state; rejected decision is blocked
  it('should execute operational state change ONLY for approved SafetyDecision and reject unapproved decisions', () => {
    const voltageAnomaly = {
      explanation: 'Voltage drop', riskLevel: 'CRITICAL' as const, recommendedAction: 'Trip controller',
      topDeviatedFeature: 'busVoltageV', severityScore: 0.9, totalMse: 1.2, attributions: [],
      thresholds: mockThresholds, hardLimitBreached: { breached: true, feature: 'busVoltageV' }, detectionPath: 'BOTH' as const
    };

    const approvedDecision = evaluateSafetyPolicy(voltageAnomaly);
    expect(approvedDecision.approved).toBe(true);

    missionStateService.executeLocalAction(approvedDecision);
    let state = missionStateService.getState();
    expect(state.spacecraftOperationalState).toBe('POWER_CONSERVATION');

    const rejectedDecision = { approved: false, policyRationale: 'Rejected by policy' };
    missionStateService.executeLocalAction(rejectedDecision);
    state = missionStateService.getState();
    expect(state.spacecraftOperationalState).toBe('POWER_CONSERVATION');
  });

  // Real Demo Controller advances state starting at IDLE
  it('should reset to IDLE and transition spacecraftOperationalState to THERMAL_MITIGATION then STABILIZED using real missionStateService controller', () => {
    demoScenarioService.reset();
    expect(demoScenarioService.getCurrentStep().stepId).toBe('IDLE');

    missionStateService.setScenario('THERMAL_ANOMALY');
    const controller = missionStateService.createDemoController();

    demoScenarioService.stepNext(controller); // CONJUNCTION_START
    demoScenarioService.stepNext(controller); // COMMUNICATION_BLACKOUT
    demoScenarioService.stepNext(controller); // ANOMALY_INJECTED
    demoScenarioService.stepNext(controller); // ANOMALY_DETECTED
    demoScenarioService.stepNext(controller); // SAFETY_VALIDATION
    demoScenarioService.stepNext(controller); // LOCAL_ACTION_EXECUTED

    let state = missionStateService.getState();
    expect(state.spacecraftOperationalState).toBe('THERMAL_MITIGATION');

    demoScenarioService.stepNext(controller); // SPACECRAFT_STABILIZED
    state = missionStateService.getState();
    expect(state.spacecraftOperationalState).toBe('STABILIZED');
  });

  // Regression Test: Intervening getState() calls leave cachedAnomaly untouched
  it('should maintain strict object identity of cachedAnomaly across multiple intervening getState() calls before safety validation', () => {
    missionStateService.setScenario('THERMAL_ANOMALY');
    const controller = missionStateService.createDemoController();

    controller.runAnomalyDetection();

    const initialAnomalyFeature = missionStateService.getState().latestAction;

    const stateCall1 = missionStateService.getState();
    const stateCall2 = missionStateService.getState();
    const stateCall3 = missionStateService.getState();

    expect(stateCall1.latestAction).toBe(initialAnomalyFeature);
    expect(stateCall2.latestAction).toBe(initialAnomalyFeature);
    expect(stateCall3.latestAction).toBe(initialAnomalyFeature);

    controller.runSafetyValidation();
    const stateAfterValidation = missionStateService.getState();
    expect(stateAfterValidation.latestAction?.triggeredBy).toBe('temperatureC');
  });

  // Test 1: Optimizer input contains ONLY BUFFERED bundles (via real optimizer invocation seam)
  it('should pass ONLY BUFFERED bundles to candidate optimizer, excluding DELIVERED and TRANSMITTING bundles', () => {
    dtnQueueService.reset([
      { id: 'b-del', priority: 1, sizeMb: 100, createdAt: 1700000000000, deadlineMin: 10, criticality: 100, status: 'DELIVERED', payloadName: 'Delivered' },
      { id: 'b-tx', priority: 2, sizeMb: 100, createdAt: 1700000000000, deadlineMin: 10, criticality: 90, status: 'TRANSMITTING', payloadName: 'Transmitting' },
      { id: 'b-buf1', priority: 3, sizeMb: 100, createdAt: 1700000000000, deadlineMin: 10, criticality: 80, status: 'BUFFERED', payloadName: 'Buffered 1' },
      { id: 'b-buf2', priority: 4, sizeMb: 100, createdAt: 1700000000000, deadlineMin: 10, criticality: 70, status: 'BUFFERED', payloadName: 'Buffered 2' },
    ]);

    const mockOptimizer = vi.fn().mockReturnValue({ scheduled: [] });
    dtnQueueService.setOptimizerForTesting(mockOptimizer);

    dtnQueueService.processQueue(true, 800);

    expect(mockOptimizer).toHaveBeenCalled();
    const passedItems = mockOptimizer.mock.calls[0][0];
    const passedIds = passedItems.map((i: any) => i.id);

    expect([...passedIds].sort()).toEqual(['b-buf1', 'b-buf2'].sort());
  });

  // Test 2: Non-trivial 0/1 DP Optimum vs Greedy Selection (Exact Array Comparison)
  it('should select exact optimal combination via 0/1 DP Knapsack when greedy priority sort is suboptimal', () => {
    // Under 600MB capacity:
    // Greedy P1 picks b-item-a (500MB, Value=96) -> Total Value = 96 (b-item-b cannot fit)
    // 0/1 DP Knapsack picks b-item-b (300MB, Value=72) + b-item-c (300MB, Value=70) -> Total Value = 142
    dtnQueueService.reset([
      { id: 'b-item-a', priority: 1, sizeMb: 500, createdAt: 1700000000000, deadlineMin: 10, criticality: 100, status: 'BUFFERED', payloadName: 'Item A' },
      { id: 'b-item-b', priority: 2, sizeMb: 300, createdAt: 1700000000000, deadlineMin: 10, criticality: 90, status: 'BUFFERED', payloadName: 'Item B' },
      { id: 'b-item-c', priority: 3, sizeMb: 300, createdAt: 1700000000000, deadlineMin: 10, criticality: 85, status: 'BUFFERED', payloadName: 'Item C' },
    ]);

    const inspection = dtnQueueService.getCandidateInspection(600);

    expect([...inspection.selectedIds].sort()).toEqual(['b-item-b', 'b-item-c'].sort());
  });

});
