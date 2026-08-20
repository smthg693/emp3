import { describe, it, expect } from 'vitest';
import { evaluateSafetyPolicy } from './safetyPolicy';
import type { ExplanationOutput } from './anomalyDetector';

describe('Safety Policy Engine Unit Tests', () => {

  it('should approve pre-approved safety rule for critical thermal anomaly', () => {
    const mockAnomaly: ExplanationOutput = {
      explanation: 'Thermal anomaly',
      riskLevel: 'CRITICAL',
      recommendedAction: 'Switch cooling loop',
      topDeviatedFeature: 'Thermal Loop Temperature',
      severityScore: 0.9,
      totalMse: 1.2,
      attributions: [],
      thresholds: { meanValError: 0.02, stdValError: 0.01, lowThreshold: 0.03, mediumThreshold: 0.04, highThreshold: 0.05 },
      hardLimitBreached: { breached: true, feature: 'temperatureC' },
      detectionPath: 'HARD_LIMIT_ONLY'
    };

    const val = evaluateSafetyPolicy(mockAnomaly);
    expect(val.approved).toBe(true);
    expect(val.action).toBeDefined();
    expect(val.action?.triggeredBy).toBe('temperatureC');
  });

});
