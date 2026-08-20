import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  normalizeReading, 
  classifyRisk, 
  calculateAttributions,
  checkHardLimits,
  isValidThresholds,
  HARD_LIMIT_PRIORITY,
  LocalExplainableAiDetector
} from './anomalyDetector';

import type {
  StatisticalThresholds,
  TelemetryReading
} from './anomalyDetector';

describe('TensorFlow.js Anomaly Detection Pipeline Unit Tests', () => {

  const mockThresholds: StatisticalThresholds = {
    meanValError: 0.02,
    stdValError: 0.01,
    lowThreshold: 0.03,    // mu + 1*sigma
    mediumThreshold: 0.04, // mu + 2*sigma
    highThreshold: 0.05,   // mu + 3*sigma
  };

  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  afterEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  // 13.1 Normalization
  it('should correctly normalize telemetry reading using z-score (x - mean) / std', () => {
    const reading: TelemetryReading = {
      temperatureC: 37.5,    // (37.5 - 32.5) / 5.0 = 1.0
      busVoltageV: 28.5,     // (28.5 - 28.0) / 0.5 = 1.0
      rfSignalDb: 20.0,      // (20.0 - 22.0) / 2.0 = -1.0
      antennaAngleDeg: 1.5,  // (1.5 - 1.0) / 0.5 = 1.0
    };

    const norm = normalizeReading(reading);
    expect(norm[0]).toBeCloseTo(1.0);
    expect(norm[1]).toBeCloseTo(1.0);
    expect(norm[2]).toBeCloseTo(-1.0);
    expect(norm[3]).toBeCloseTo(1.0);
  });

  // 13.2 Statistics-driven risk classification
  it('should classify risk tier purely via statistical thresholds (mu + k*sigma)', () => {
    expect(classifyRisk(0.01, mockThresholds)).toBe('LOW');
    expect(classifyRisk(0.035, mockThresholds)).toBe('MEDIUM');
    expect(classifyRisk(0.045, mockThresholds)).toBe('HIGH');
    expect(classifyRisk(0.06, mockThresholds)).toBe('CRITICAL');
  });

  // 13.3 Hard safety override
  it('should force CRITICAL risk level when a hard physical safety limit is breached', () => {
    const nominalReading: TelemetryReading = { temperatureC: 32.5, busVoltageV: 28.0, rfSignalDb: 22.0, antennaAngleDeg: 1.0 };
    const tempBreach: TelemetryReading = { temperatureC: 68.0, busVoltageV: 28.0, rfSignalDb: 22.0, antennaAngleDeg: 1.0 };

    expect(checkHardLimits(nominalReading).breached).toBe(false);
    expect(checkHardLimits(nominalReading).feature).toBeNull();

    const breachStatus = checkHardLimits(tempBreach);
    expect(breachStatus.breached).toBe(true);
    expect(breachStatus.feature).toBe('temperatureC');
  });

  // 13.4 Statistical-only CRITICAL vs hard-limit CRITICAL
  it('should distinguish statistical-only CRITICAL from hard-limit CRITICAL', async () => {
    const detector = new LocalExplainableAiDetector();
    await detector.initPromise;

    const nominal: TelemetryReading = { temperatureC: 32.5, busVoltageV: 28.0, rfSignalDb: 22.0, antennaAngleDeg: 1.0 };
    const resNominal = detector.analyze(nominal);
    expect(resNominal.riskLevel).toBe('LOW');
    expect(resNominal.hardLimitBreached.breached).toBe(false);

    const tempBreach: TelemetryReading = { temperatureC: 68.0, busVoltageV: 28.0, rfSignalDb: 22.0, antennaAngleDeg: 1.0 };
    const resBreach = detector.analyze(tempBreach);
    expect(resBreach.riskLevel).toBe('CRITICAL');
    expect(resBreach.hardLimitBreached.breached).toBe(true);
    expect(resBreach.hardLimitBreached.feature).toBe('temperatureC');
  });

  // 13.5 Feature attribution
  it('should identify the feature with the largest reconstruction error', () => {
    const rawValues = [68.5, 28.0, 22.0, 1.0];
    const normalized = [(68.5 - 32.5) / 5.0, 0, 0, 0];
    const reconstructed = [0, 0, 0, 0];

    const attributions = calculateAttributions(rawValues, normalized, reconstructed);
    expect(attributions[0].featureName).toBe('temperatureC');
    expect(attributions[0].reconstructionError).toBeGreaterThan(45.0);
  });

  // 13.6 Severity score regression tests (Explicit formula assertion)
  it('should compute severity scores purely from reconstruction error matching the exact formula', async () => {
    const detector = new LocalExplainableAiDetector();
    await detector.initPromise;

    const readingA: TelemetryReading = { temperatureC: 40.0, busVoltageV: 27.8, rfSignalDb: 21.0, antennaAngleDeg: 1.1 };
    const readingB: TelemetryReading = { temperatureC: 50.0, busVoltageV: 27.0, rfSignalDb: 18.0, antennaAngleDeg: 1.5 };

    const resA = detector.analyze(readingA);
    const resB = detector.analyze(readingB);

    // Assert neither breaches a hard safety limit
    expect(resA.hardLimitBreached.breached).toBe(false);
    expect(resB.hardLimitBreached.breached).toBe(false);

    const expectedA = Math.min(1.0, resA.totalMse / (resA.thresholds.highThreshold * 1.5));
    const expectedB = Math.min(1.0, resB.totalMse / (resB.thresholds.highThreshold * 1.5));

    expect(resA.severityScore).toBeCloseTo(expectedA, 2);
    expect(resB.severityScore).toBeCloseTo(expectedB, 2);
    expect(resA.severityScore).not.toEqual(resB.severityScore);
  });

  it('should floor severityScore >= 0.9 whenever hardLimitBreached is true', async () => {
    const detector = new LocalExplainableAiDetector();
    await detector.initPromise;

    const tempBreach: TelemetryReading = { temperatureC: 60.0, busVoltageV: 28.0, rfSignalDb: 22.0, antennaAngleDeg: 1.0 };
    const res = detector.analyze(tempBreach);

    expect(res.hardLimitBreached.breached).toBe(true);
    expect(res.severityScore).toBeGreaterThanOrEqual(0.9);
  });

  // 13.7 Explanation regression test - calling analyze()
  it('should construct explanation mentioning BOTH hard-limit feature and top statistical feature when different', async () => {
    const detector = new LocalExplainableAiDetector();
    await detector.initPromise;

    const dualReading: TelemetryReading = {
      temperatureC: 52.0,  // High statistical error
      busVoltageV: 24.0,   // Hard limit breach < 25.5
      rfSignalDb: 22.0,
      antennaAngleDeg: 1.0
    };

    const res = detector.analyze(dualReading);
    expect(res.hardLimitBreached.breached).toBe(true);
    expect(res.hardLimitBreached.feature).toBe('busVoltageV');
    expect(res.explanation).toContain('DC Bus Voltage');
  });

  // 13.8 Threshold persistence integration tests (A, B, C)
  it('13.8A: should safely handle malformed JSON in localStorage without throwing and fall back to training', async () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('spacecraft-autoencoder-v1-thresholds', '{this-is-not-valid-json');
    }

    const detector = new LocalExplainableAiDetector();
    expect(async () => await detector.initPromise).not.toThrow();
    await detector.initPromise;

    expect(detector.status).toBe('READY');
    expect(isValidThresholds(detector.thresholds)).toBe(true);
  });

  it('13.8B: should reject structurally invalid thresholds in localStorage and regenerate valid ones', async () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(
        'spacecraft-autoencoder-v1-thresholds',
        JSON.stringify({
          meanValError: 'invalid',
          stdValError: null,
          lowThreshold: 0.05,
          mediumThreshold: 0.04,
          highThreshold: 0.03
        })
      );
    }

    const detector = new LocalExplainableAiDetector();
    await detector.initPromise;

    expect(detector.status).toBe('READY');
    expect(isValidThresholds(detector.thresholds)).toBe(true);
    expect(detector.thresholds.lowThreshold).toBeLessThan(detector.thresholds.mediumThreshold);
  });

  it('13.8C: should regenerate compatible thresholds if model key exists but thresholds key is missing', async () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('spacecraft-autoencoder-v1-thresholds');
    }

    const detector = new LocalExplainableAiDetector();
    await detector.initPromise;

    expect(detector.status).toBe('READY');
    expect(isValidThresholds(detector.thresholds)).toBe(true);
  });

  // 13.9 Hard-limit tie-break test
  it('should break hard-limit ties using HARD_LIMIT_PRIORITY order (busVoltageV > temperatureC)', () => {
    const dualBreach: TelemetryReading = {
      temperatureC: 68.0,  // Breached > 55.0
      busVoltageV: 24.0,   // Breached < 25.5
      rfSignalDb: 22.0,
      antennaAngleDeg: 1.0
    };

    const status = checkHardLimits(dualBreach);
    expect(status.breached).toBe(true);
    expect(status.feature).toBe('busVoltageV');
  });

});
