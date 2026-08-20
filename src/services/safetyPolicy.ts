import type { ExplanationOutput } from './anomalyDetector';
import type { AutonomousAction } from '../types/mission';

export interface SafetyValidationResult {
  approved: boolean;
  action?: AutonomousAction;
  policyRationale: string;
}

const PRE_APPROVED_SAFETY_RULES: Record<string, {
  ruleId: string;
  actionText: string;
  estimatedEffect: string;
}> = {
  temperatureC: {
    ruleId: 'RULE-TH-092',
    actionText: 'Switched to secondary cooling loop 4B and throttled payload 2 power.',
    estimatedEffect: 'Reduces cooling loop temperature by ~32°C within 180 seconds.',
  },
  busVoltageV: {
    ruleId: 'RULE-EPS-005',
    actionText: 'Tripped solid-state power controller for payload 3 and isolated bus line B.',
    estimatedEffect: 'Stabilizes main DC bus voltage to 28.0V.',
  },
  rfSignalDb: {
    ruleId: 'RULE-COM-014',
    actionText: 'Invoked star-tracker recalibration and realigned High-Gain Antenna feed lock.',
    estimatedEffect: 'Restores X-band carrier signal lock SNR to +22 dB.',
  },
  antennaAngleDeg: {
    ruleId: 'RULE-GIMBAL-021',
    actionText: 'Re-indexed antenna gimbal stepper motor to primary star lock reference.',
    estimatedEffect: 'Corrects pointing alignment drift to <0.2°.',
  },
};

export const ACTION_SEVERITY_THRESHOLD = 0.45;

export function evaluateSafetyPolicy(anomaly: ExplanationOutput): SafetyValidationResult {
  if (anomaly.riskLevel === 'LOW') {
    return {
      approved: false,
      policyRationale: 'Spacecraft health nominal. Safety intervention not required.',
    };
  }

  if (anomaly.severityScore < ACTION_SEVERITY_THRESHOLD && !anomaly.hardLimitBreached.breached) {
    return {
      approved: false,
      policyRationale: `✕ REJECTED: Anomaly severity score (${anomaly.severityScore}) is below autonomous action threshold (${ACTION_SEVERITY_THRESHOLD}). Monitoring parameter.`,
    };
  }

  const primaryFeature = anomaly.hardLimitBreached.feature || anomaly.topDeviatedFeature;
  const mappedRule = PRE_APPROVED_SAFETY_RULES[primaryFeature];

  if (!mappedRule) {
    return {
      approved: false,
      policyRationale: `✕ REJECTED: No pre-approved flight safety rule exists for subsystem ${primaryFeature}. Autonomous response deferred to Earth ground control.`,
    };
  }

  const now = Date.now();

  const action: AutonomousAction = {
    actionId: `${mappedRule.ruleId}-${now.toString().slice(-4)}`,
    triggeredBy: primaryFeature,
    rationale: `Validated against pre-approved safety policy ${mappedRule.ruleId} for ${anomaly.riskLevel} severity anomaly.`,
    safetyValidated: true,
    estimatedEffect: mappedRule.estimatedEffect,
    timestamp: new Date(now).toISOString().substring(11, 19),
    numericTimestamp: now,
  };

  return {
    approved: true,
    action,
    policyRationale: `✓ APPROVED by Onboard Deterministic Safety Engine (${mappedRule.ruleId}). ML recommendation validated against flight rules.`,
  };
}
