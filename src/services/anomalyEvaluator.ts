import { localAiDetector } from './anomalyDetector';
import type { TelemetryReading } from './anomalyDetector';
import type { BenchmarkMetrics, MissionEvent } from '../types/mission';
import { getPhysicsState } from './orbitalPhysics';

function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

let cachedMlMetrics: {
  precisionPct: number;
  recallPct: number;
  f1ScorePct: number;
  falsePositiveRatePct: number;
  detectionRatePct: number;
  evaluationSampleSize: number;
} | null = null;

let isEvaluating = false;

export async function runMlEvaluationOnce(): Promise<void> {
  if (cachedMlMetrics || isEvaluating) return;
  isEvaluating = true;
  await localAiDetector.initPromise;

  try {
    const prng = seededRandom(777);
    const evalSamples: { reading: TelemetryReading; isTrueAnomaly: boolean }[] = [];

    for (let i = 0; i < 60; i++) {
      evalSamples.push({
        reading: {
          temperatureC: 32.5 + (prng() - 0.5) * 5,
          busVoltageV: 28.0 + (prng() - 0.5) * 0.6,
          rfSignalDb: 22.0 + (prng() - 0.5) * 2,
          antennaAngleDeg: 1.0 + (prng() - 0.5) * 0.6,
        },
        isTrueAnomaly: false,
      });
    }

    for (let i = 0; i < 40; i++) {
      const type = i % 4;
      let r: TelemetryReading = { temperatureC: 32.5, busVoltageV: 28.0, rfSignalDb: 22.0, antennaAngleDeg: 1.0 };
      if (type === 0) r.temperatureC = 65.0 + prng() * 10;
      else if (type === 1) r.busVoltageV = 23.5 - prng() * 2;
      else if (type === 2) r.rfSignalDb = 5.0 - prng() * 3;
      else r.antennaAngleDeg = 3.5 + prng() * 2;

      evalSamples.push({ reading: r, isTrueAnomaly: true });
    }

    let tp = 0, fp = 0, fn = 0, tn = 0;

    for (const sample of evalSamples) {
      const res = localAiDetector.analyze(sample.reading);
      const predictedAnomaly = res.riskLevel !== 'LOW';

      if (predictedAnomaly && sample.isTrueAnomaly) tp++;
      else if (predictedAnomaly && !sample.isTrueAnomaly) fp++;
      else if (!predictedAnomaly && sample.isTrueAnomaly) fn++;
      else tn++;
    }

    const precision = tp + fp > 0 ? tp / (tp + fp) : 1.0;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 1.0;
    const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
    const fpr = fp + tn > 0 ? fp / (fp + tn) : 0;
    const detectionRate = tp + fn > 0 ? tp / (tp + fn) : 1.0;

    cachedMlMetrics = {
      precisionPct: parseFloat((precision * 100).toFixed(1)),
      recallPct: parseFloat((recall * 100).toFixed(1)),
      f1ScorePct: parseFloat((f1 * 100).toFixed(1)),
      falsePositiveRatePct: parseFloat((fpr * 100).toFixed(1)),
      detectionRatePct: parseFloat((detectionRate * 100).toFixed(1)),
      evaluationSampleSize: evalSamples.length,
    };
  } catch (e) {
  } finally {
    isEvaluating = false;
  }
}

export function getBenchmarkMetrics(synodicMonth = 7.0, events: MissionEvent[] = []): BenchmarkMetrics {
  const physics = getPhysicsState(synodicMonth);
  const earthDependentResponseMin = parseFloat(physics.roundTripLatencyMin.toFixed(1));

  const anomalyEvent = events.find(e => e.details === 'DEMO_ANOMALY_DETECTED');
  const actionEvent = events.find(e => e.details === 'DEMO_ACTION_EXECUTED');

  let keplerLocalResponseSec: number | null = null;
  let responseTimeReductionPct: number | null = null;

  if (anomalyEvent && actionEvent && actionEvent.numericTimestamp >= anomalyEvent.numericTimestamp) {
    const diffSec = (actionEvent.numericTimestamp - anomalyEvent.numericTimestamp) / 1000.0;
    if (diffSec >= 0 && diffSec < 60) {
      keplerLocalResponseSec = parseFloat(diffSec.toFixed(3));
      const earthSec = earthDependentResponseMin * 60.0;
      responseTimeReductionPct = parseFloat((((earthSec - keplerLocalResponseSec) / earthSec) * 100).toFixed(2));
    }
  }

  if (!cachedMlMetrics) {
    return {
      precisionPct: 0, recallPct: 0, f1ScorePct: 0, falsePositiveRatePct: 0, detectionRatePct: 0,
      earthDependentResponseMin, keplerLocalResponseSec, responseTimeReductionPct,
      evaluationSampleSize: 0, evaluatedAt: Date.now(), status: 'PENDING'
    };
  }

  return {
    ...cachedMlMetrics,
    earthDependentResponseMin,
    keplerLocalResponseSec,
    responseTimeReductionPct,
    evaluatedAt: Date.now(),
    status: 'READY',
  };
}
