import { describe, it, expect } from 'vitest';
import { evaluateSafetyPolicy } from './safetyPolicy';
import type { ExplanationOutput } from './anomalyDetector';

describe('Safety Policy Engine Unit Tests', () => {

  it('should approve pre-approved safety rule for critical thermal anomaly', () => {
    const mockAnomaly: ExplanationOutput = {
      explanation: 'Thermal anomaly',
      riskLevel: 'CRITICAL',
      recommendedAction: 'Switch cooling loop',
      topDeviatedFeature: 'temperatureC',
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

  it('should REJECT autonomous action when feature has no pre-approved safety rule (Option A)', () => {
    const unmappedAnomaly: ExplanationOutput = {
      explanation: 'Unknown subsystem anomaly',
      riskLevel: 'HIGH',
      recommendedAction: 'Inspect unknown component',
      topDeviatedFeature: 'unknownSubsystemX',
      severityScore: 0.8,
      totalMse: 0.9,
      attributions: [],
      thresholds: { meanValError: 0.02, stdValError: 0.01, lowThreshold: 0.03, mediumThreshold: 0.04, highThreshold: 0.05 },
      hardLimitBreached: { breached: false, feature: null },
      detectionPath: 'STATISTICAL_ONLY'
    };

    const val = evaluateSafetyPolicy(unmappedAnomaly);
    expect(val.approved).toBe(false);
    expect(val.policyRationale).toContain('REJECTED');
  });

  it('should REJECT autonomous action when severity score is below action threshold (Option B)', () => {
    const lowSeverityAnomaly: ExplanationOutput = {
      explanation: 'Minor drift',
      riskLevel: 'MEDIUM',
      recommendedAction: 'Monitor',
      topDeviatedFeature: 'temperatureC',
      severityScore: 0.35,
      totalMse: 0.038,
      attributions: [],
      thresholds: { meanValError: 0.02, stdValError: 0.01, lowThreshold: 0.03, mediumThreshold: 0.04, highThreshold: 0.05 },
      hardLimitBreached: { breached: false, feature: null },
      detectionPath: 'STATISTICAL_ONLY'
    };

    const val = evaluateSafetyPolicy(lowSeverityAnomaly);
    expect(val.approved).toBe(false);
    expect(val.policyRationale).toContain('below autonomous action threshold');
  });

});
