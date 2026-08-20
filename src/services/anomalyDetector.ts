import * as tf from '@tensorflow/tfjs';

export interface TelemetryReading {
  temperatureC: number;    // Normal: 20-45°C
  busVoltageV: number;     // Normal: 27-29V
  rfSignalDb: number;      // Normal: 18-26dB
  antennaAngleDeg: number; // Normal: 0-2° drift
}

export interface FeatureAttribution {
  featureName: string;
  observedValue: number;
  expectedValue: number;
  reconstructionError: number;
  deviationPct: number;
}

export interface StatisticalThresholds {
  meanValError: number;
  stdValError: number;
  lowThreshold: number;      // mu + 1*sigma
  mediumThreshold: number;   // mu + 2*sigma
  highThreshold: number;     // mu + 3*sigma
}

export interface HardLimitStatus {
  breached: boolean;
  feature: string | null;
}

export interface ExplanationOutput {
  explanation: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedAction: string;
  topDeviatedFeature: string;
  severityScore: number;
  totalMse: number;
  attributions: FeatureAttribution[];
  thresholds: StatisticalThresholds;
  hardLimitBreached: HardLimitStatus;
  detectionPath: 'NOMINAL' | 'STATISTICAL_ONLY' | 'HARD_LIMIT_ONLY' | 'BOTH';
}

export type DetectorStatus = 'INITIALIZING' | 'LOADING_STORAGE' | 'TRAINING' | 'READY' | 'ERROR';

export const BASELINE_MEANS = [32.5, 28.0, 22.0, 1.0];
export const BASELINE_STDS = [5.0, 0.5, 2.0, 0.5];
export const FEATURE_KEYS: (keyof TelemetryReading)[] = ['temperatureC', 'busVoltageV', 'rfSignalDb', 'antennaAngleDeg'];
export const FRIENDLY_NAMES: Record<string, string> = {
  temperatureC: 'Thermal Loop Temperature',
  busVoltageV: 'DC Bus Voltage',
  rfSignalDb: 'RF Signal Link',
  antennaAngleDeg: 'Antenna Gimbal Angle',
};

export const HARD_LIMIT_PRIORITY: (keyof TelemetryReading)[] = ['busVoltageV', 'temperatureC', 'rfSignalDb', 'antennaAngleDeg'];

const CAUSE_MAPPING: Record<string, {
  causes: string[];
  actions: string[];
}> = {
  temperatureC: {
    causes: [
      'Thermal Control Loop 4 radiator line pressure drop leading to subsystem overheat.',
      'Primary cooling fluid pump valve cavitation causing thermal accumulation in power electronics.',
      'Solar radiation absorption spike exceeding passive thermal insulation threshold.'
    ],
    actions: [
      'Switch to secondary cooling loop 4B and throttle non-essential payload power.',
      'Activate auxiliary fluid pump 2 and lock thermal isolation valve 4A.',
      'Reorient spacecraft thermal louvers and engage secondary heat dissipation unit.'
    ]
  },
  busVoltageV: {
    causes: [
      'Solid-state power controller short circuit causing main DC bus voltage drop.',
      'Battery cell 3 impedance spike during eclipse cycle discharge.',
      'Primary EPS regulator switching regulator transient drop.'
    ],
    actions: [
      'Trip solid-state power controller for payload 3 and isolate bus line B.',
      'Bypass battery cell bank 3 and balance EPS charge controller load.',
      'Re-route primary bus power through standby EPS regulator module.'
    ]
  },
  rfSignalDb: {
    causes: [
      'High-Gain Antenna pointing drift of >1.5° during DSN ground station pass.',
      'RF amplifier gain degradation caused by solar plasma propagation noise.',
      'X-band feed horn phase imbalance during Earth relay orientation.'
    ],
    actions: [
      'Invoke star-tracker recalibration and realign High-Gain Antenna feed lock.',
      'Switch DSN transmission channel to Ka-band fallback frequency.',
      'Re-lock auxiliary star sensor and adjust gimbal pointing offset.'
    ]
  },
  antennaAngleDeg: {
    causes: [
      'Gimbal drive motor stepping error during high-gain antenna tracking pass.',
      'Reaction wheel momentum saturation inducing structural torque drift.',
      'Star tracker optic blinding by solar flare particulate glare.'
    ],
    actions: [
      'Re-index antenna gimbal stepper motor to primary star lock reference.',
      'Fire thruster pulse to desaturate reaction wheels and stabilize attitude.',
      'Switch attitude reference to secondary inertial measurement unit (IMU).'
    ]
  }
};

const MODEL_STORAGE_KEY = 'localstorage://spacecraft-autoencoder-v1';
const THRESHOLDS_STORAGE_KEY = 'spacecraft-autoencoder-v1-thresholds';

// Seeded LCG PRNG for reproducible shuffle
function pseudoRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function seededShuffle<T>(array: T[], seed = 42): T[] {
  const result = [...array];
  const prng = pseudoRandom(seed);
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(prng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Z-Score normalization: (x - mean) / std
export function normalizeReading(reading: TelemetryReading, means = BASELINE_MEANS, stds = BASELINE_STDS): number[] {
  return [
    (reading.temperatureC - means[0]) / stds[0],
    (reading.busVoltageV - means[1]) / stds[1],
    (reading.rfSignalDb - means[2]) / stds[2],
    (reading.antennaAngleDeg - means[3]) / stds[3],
  ];
}

// Primary classifier: pure statistical threshold hierarchy
export function classifyRisk(totalMse: number, thresholds: StatisticalThresholds): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
  if (totalMse < thresholds.lowThreshold) {
    return 'LOW';
  }
  if (totalMse < thresholds.mediumThreshold) {
    return 'MEDIUM';
  }
  if (totalMse < thresholds.highThreshold) {
    return 'HIGH';
  }
  return 'CRITICAL';
}

// Secondary deterministic hard physical limit checker
export function checkHardLimits(reading: TelemetryReading): HardLimitStatus {
  const breaches: { feature: keyof TelemetryReading; isBreached: boolean }[] = [
    { feature: 'temperatureC', isBreached: reading.temperatureC > 55.0 },
    { feature: 'busVoltageV', isBreached: reading.busVoltageV < 25.5 },
    { feature: 'rfSignalDb', isBreached: reading.rfSignalDb < 10.0 },
    { feature: 'antennaAngleDeg', isBreached: reading.antennaAngleDeg > 2.5 },
  ];

  for (const pKey of HARD_LIMIT_PRIORITY) {
    const match = breaches.find(b => b.feature === pKey);
    if (match && match.isBreached) {
      return { breached: true, feature: pKey };
    }
  }

  return { breached: false, feature: null };
}

// Per-feature attribution calculator
export function calculateAttributions(
  rawValues: number[],
  normalized: number[],
  reconstructed: number[],
  means = BASELINE_MEANS,
  stds = BASELINE_STDS
): FeatureAttribution[] {
  return FEATURE_KEYS.map((key, idx) => {
    const error = Math.pow(normalized[idx] - reconstructed[idx], 2);
    const expectedVal = parseFloat((reconstructed[idx] * stds[idx] + means[idx]).toFixed(1));
    const deviation = Math.abs(rawValues[idx] - expectedVal);

    return {
      featureName: key,
      observedValue: rawValues[idx],
      expectedValue: expectedVal,
      reconstructionError: parseFloat(error.toFixed(4)),
      deviationPct: parseFloat(((deviation / (means[idx] || 1)) * 100).toFixed(1)),
    };
  });
}

export function isValidThresholds(t: any): t is StatisticalThresholds {
  return (
    t &&
    typeof t.meanValError === 'number' &&
    typeof t.stdValError === 'number' &&
    typeof t.lowThreshold === 'number' &&
    typeof t.mediumThreshold === 'number' &&
    typeof t.highThreshold === 'number' &&
    !isNaN(t.meanValError) &&
    !isNaN(t.stdValError) &&
    !isNaN(t.lowThreshold) &&
    !isNaN(t.mediumThreshold) &&
    !isNaN(t.highThreshold) &&
    t.lowThreshold < t.mediumThreshold &&
    t.mediumThreshold < t.highThreshold
  );
}

export class LocalExplainableAiDetector {
  private model: tf.LayersModel | null = null;
  public isTrained = false;
  public isTraining = false;
  public status: DetectorStatus = 'INITIALIZING';
  public initPromise: Promise<void>;

  public thresholds: StatisticalThresholds = {
    meanValError: 0.02,
    stdValError: 0.015,
    lowThreshold: 0.035,
    mediumThreshold: 0.05,
    highThreshold: 0.065,
  };

  constructor() {
    this.initPromise = this.initPipeline();
  }

  private async initPipeline(): Promise<void> {
    this.status = 'LOADING_STORAGE';
    try {
      const loadedModel = await tf.loadLayersModel(MODEL_STORAGE_KEY);
      const rawThresholds = typeof localStorage !== 'undefined' ? localStorage.getItem(THRESHOLDS_STORAGE_KEY) : null;
      let parsedThresholds = null;
      if (rawThresholds) {
        try {
          parsedThresholds = JSON.parse(rawThresholds);
        } catch (e) {}
      }

      if (loadedModel && isValidThresholds(parsedThresholds)) {
        this.model = loadedModel;
        this.thresholds = parsedThresholds;
        this.isTrained = true;
        this.status = 'READY';
        console.log('✓ Successfully loaded model and validated thresholds from localStorage.');
        return;
      }
    } catch (e) {
      console.log('Model or thresholds unavailable in localStorage. Initializing training...');
    }

    await this.trainModel();
  }

  public async trainModel(): Promise<void> {
    if (this.isTraining) return;
    this.isTraining = true;
    this.status = 'TRAINING';

    try {
      // Generate 1,000 nominal dataset samples
      const samples: number[][] = [];
      const prng = pseudoRandom(12345);

      for (let i = 0; i < 1000; i++) {
        const temp = (32.5 + (prng() - 0.5) * 6 - BASELINE_MEANS[0]) / BASELINE_STDS[0];
        const volt = (28.0 + (prng() - 0.5) * 0.8 - BASELINE_MEANS[1]) / BASELINE_STDS[1];
        const rf = (22.0 + (prng() - 0.5) * 3 - BASELINE_MEANS[2]) / BASELINE_STDS[2];
        const angle = (1.0 + (prng() - 0.5) * 0.8 - BASELINE_MEANS[3]) / BASELINE_STDS[3];
        samples.push([temp, volt, rf, angle]);
      }

      // 80/20 train/validation split with reproducible seeded shuffle
      const shuffled = seededShuffle(samples, 999);
      const trainData = shuffled.slice(0, 800);
      const valData = shuffled.slice(800);

      const autoencoder = tf.sequential();
      autoencoder.add(tf.layers.dense({ units: 2, activation: 'relu', inputShape: [4] }));
      autoencoder.add(tf.layers.dense({ units: 4, activation: 'linear' }));
      autoencoder.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

      const xTrain = tf.tensor2d(trainData);
      const xVal = tf.tensor2d(valData);

      const history = await autoencoder.fit(xTrain, xTrain, {
        epochs: 15,
        batchSize: 32,
        validationData: [xVal, xVal],
        verbose: 0,
      });

      const finalTrainLoss = history.history.loss[history.history.loss.length - 1];
      const finalValLoss = history.history.val_loss[history.history.val_loss.length - 1];
      console.log(`✓ Training Complete. Final Train Loss: ${Number(finalTrainLoss).toFixed(4)}, Val Loss: ${Number(finalValLoss).toFixed(4)}`);

      // Compute validation set MSE statistics (mu_val, sigma_val)
      tf.tidy(() => {
        const valPreds = autoencoder.predict(xVal) as tf.Tensor;
        const valPredArr = valPreds.arraySync() as number[][];
        const valMses = valData.map((row, rIdx) =>
          row.reduce((sum, val, cIdx) => sum + Math.pow(val - valPredArr[rIdx][cIdx], 2), 0) / 4
        );

        const meanVal = valMses.reduce((a, b) => a + b, 0) / valMses.length;
        const stdVal = Math.sqrt(valMses.reduce((a, b) => a + Math.pow(b - meanVal, 2), 0) / valMses.length);

        this.thresholds = {
          meanValError: parseFloat(meanVal.toFixed(4)),
          stdValError: parseFloat(stdVal.toFixed(4)),
          lowThreshold: parseFloat((meanVal + 1 * stdVal).toFixed(4)),
          mediumThreshold: parseFloat((meanVal + 2 * stdVal).toFixed(4)),
          highThreshold: parseFloat((meanVal + 3 * stdVal).toFixed(4)),
        };
        console.log('✓ Derived Statistical Thresholds (mu + k*sigma):', this.thresholds);
      });

      xTrain.dispose();
      xVal.dispose();

      this.model = autoencoder;
      this.isTrained = true;
      this.status = 'READY';

      // Save model and thresholds to localStorage together
      try {
        await autoencoder.save(MODEL_STORAGE_KEY);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(THRESHOLDS_STORAGE_KEY, JSON.stringify(this.thresholds));
        }
        console.log('✓ Saved autoencoder model and derived thresholds to localStorage.');
      } catch (e) {
        console.warn('LocalStorage save warning:', e);
      }

      // Run synthetic anomaly sanity check
      this.runSyntheticAnomalySanityCheck();

    } catch (err) {
      console.warn('TF.js autoencoder fitting deferred.', err);
      this.status = 'ERROR';
    } finally {
      this.isTraining = false;
    }
  }

  // Synthetic Anomaly Sanity Check
  public runSyntheticAnomalySanityCheck() {
    if (!this.model) return;

    const sanityScenarios: { name: string; reading: TelemetryReading }[] = [
      { name: 'Nominal baseline', reading: { temperatureC: 33.0, busVoltageV: 28.0, rfSignalDb: 22.0, antennaAngleDeg: 1.0 } },
      { name: 'Minor temperature deviation', reading: { temperatureC: 48.0, busVoltageV: 27.5, rfSignalDb: 21.0, antennaAngleDeg: 1.2 } },
      { name: 'Major thermal/voltage anomaly', reading: { temperatureC: 68.5, busVoltageV: 24.1, rfSignalDb: 18.0, antennaAngleDeg: 1.0 } },
      { name: 'Major RF/antenna anomaly', reading: { temperatureC: 34.0, busVoltageV: 28.0, rfSignalDb: 4.2, antennaAngleDeg: 3.8 } },
    ];

    console.log('🧪 Running Synthetic Anomaly Sanity Check...');
    sanityScenarios.forEach((sc) => {
      const res = this.analyze(sc.reading);
      console.log(`  [Sanity Check] ${sc.name} -> Risk: ${res.riskLevel}, Severity: ${res.severityScore}, Path: ${res.detectionPath}, MSE: ${res.totalMse}`);
    });
  }

  public analyze(reading: TelemetryReading): ExplanationOutput {
    const rawValues = [reading.temperatureC, reading.busVoltageV, reading.rfSignalDb, reading.antennaAngleDeg];
    const keys = FEATURE_KEYS;

    const norm = normalizeReading(reading);
    let reconstructed = [...norm];

    if (this.model && this.isTrained) {
      tf.tidy(() => {
        const inputTensor = tf.tensor2d([norm]);
        const outputTensor = this.model!.predict(inputTensor) as tf.Tensor;
        reconstructed = Array.from(outputTensor.dataSync());
      });
    }

    const attributions = calculateAttributions(rawValues, norm, reconstructed);
    const totalMse = attributions.reduce((sum, a) => sum + a.reconstructionError, 0) / 4;

    // PRIMARY CLASSIFIER: Statistics-driven risk classification
    const statisticalRisk = classifyRisk(totalMse, this.thresholds);

    // SECONDARY CLASSIFIER: Hard safety limit check
    const hardLimitStatus = checkHardLimits(reading);

    // Final risk determination
    let finalRiskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = statisticalRisk;
    if (hardLimitStatus.breached) {
      finalRiskLevel = 'CRITICAL';
    }

    // Formula-driven Severity Score (Section 6.2 & 8 floor definition)
    const severityScore = hardLimitStatus.breached
      ? Math.max(0.9, Math.min(1.0, totalMse / (this.thresholds.highThreshold * 1.5)))
      : Math.min(1.0, totalMse / (this.thresholds.highThreshold * 1.5));

    // Identify top deviated feature
    const topDeviated = [...attributions].sort((a, b) => b.reconstructionError - a.reconstructionError)[0];
    const topDeviatedFeatureName = FRIENDLY_NAMES[topDeviated.featureName] || topDeviated.featureName;

    // Detection Path Classification for UI
    let detectionPath: 'NOMINAL' | 'STATISTICAL_ONLY' | 'HARD_LIMIT_ONLY' | 'BOTH' = 'NOMINAL';
    if (hardLimitStatus.breached && statisticalRisk !== 'LOW') {
      detectionPath = 'BOTH';
    } else if (hardLimitStatus.breached) {
      detectionPath = 'HARD_LIMIT_ONLY';
    } else if (statisticalRisk !== 'LOW') {
      detectionPath = 'STATISTICAL_ONLY';
    }

    // Handle Nominal Return Path
    if (finalRiskLevel === 'LOW') {
      return {
        explanation: `All telemetry parameters operating within nominal baseline limits (Temp: ${reading.temperatureC}°C, Voltage: ${reading.busVoltageV}V, RF: ${reading.rfSignalDb}dB). Status nominal.`,
        riskLevel: 'LOW',
        recommendedAction: 'Continue routine scientific data queueing and orbital tracking operations.',
        topDeviatedFeature: 'None (Nominal Baseline)',
        severityScore: parseFloat(severityScore.toFixed(2)),
        totalMse: parseFloat(totalMse.toFixed(4)),
        attributions,
        thresholds: this.thresholds,
        hardLimitBreached: hardLimitStatus,
        detectionPath,
      };
    }

    // Explanation Generation handling Cases A, B, and C
    let explanation = '';
    const hardLimitFeatureName = hardLimitStatus.feature ? FRIENDLY_NAMES[hardLimitStatus.feature] : null;

    if (!hardLimitStatus.breached) {
      // Case A: No hard limit breached
      explanation = `TensorFlow.js Autoencoder detected abnormal reconstruction error primarily in ${topDeviatedFeatureName} (Observed: ${topDeviated.observedValue}, Expected: ${topDeviated.expectedValue}).`;
    } else if (hardLimitStatus.feature === topDeviated.featureName) {
      // Case B: Hard limit feature === topDeviatedFeature
      explanation = `${hardLimitFeatureName} breached the hard safety limit and also shows the largest statistical deviation from baseline (Observed: ${topDeviated.observedValue}, Expected: ${topDeviated.expectedValue}).`;
    } else {
      // Case C: Hard limit feature !== topDeviatedFeature
      const hardVal = reading[hardLimitStatus.feature as keyof TelemetryReading];
      explanation = `${hardLimitFeatureName} breached the hard safety limit (Observed: ${hardVal}); ${topDeviatedFeatureName} also shows the largest statistical deviation from baseline (Observed: ${topDeviated.observedValue}, Expected: ${topDeviated.expectedValue}).`;
    }

    // Action selection based on primary breached feature
    const primaryFeatureKey = hardLimitStatus.feature || topDeviated.featureName;
    const hash = Math.abs(Math.round(reading.temperatureC * 10 + reading.busVoltageV * 100 + reading.rfSignalDb * 5));
    const variantIdx = hash % 3;
    const mapping = CAUSE_MAPPING[primaryFeatureKey] || CAUSE_MAPPING.temperatureC;
    const actionText = mapping.actions[variantIdx] || mapping.actions[0];

    return {
      explanation,
      riskLevel: finalRiskLevel,
      recommendedAction: actionText,
      topDeviatedFeature: topDeviatedFeatureName,
      severityScore: parseFloat(severityScore.toFixed(2)),
      totalMse: parseFloat(totalMse.toFixed(4)),
      attributions,
      thresholds: this.thresholds,
      hardLimitBreached: hardLimitStatus,
      detectionPath,
    };
  }
}

export const localAiDetector = new LocalExplainableAiDetector();
