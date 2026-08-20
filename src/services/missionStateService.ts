import type { UnifiedMissionState, MissionEvent, DemoStepId, AutonomousAction } from '../types/mission';
import { getPhysicsState, PhysicsState } from './orbitalPhysics';
import { generateTelemetry, TelemetryScenario } from './telemetrySimulator';
import { localAiDetector, ExplanationOutput } from './anomalyDetector';
import { evaluateSafetyPolicy, SafetyValidationResult } from './safetyPolicy';
import { compareSchedulers, INITIAL_PAYLOADS, SchedulerComparison } from './schedulerOptimizer';
import { runMlEvaluationOnce, getBenchmarkMetrics } from './anomalyEvaluator';
import { dtnQueueService } from './dtnQueueService';
import { demoScenarioService, DemoStateController } from './demoScenarioService';

class MissionStateService {
  private synodicMonth = 7.0;
  private scenario: TelemetryScenario = 'NORMAL';
  private manualMode: 'NORMAL' | 'CONJUNCTION' | 'EMERGENCY' = 'NORMAL';
  private events: MissionEvent[] = [];
  private demoStep: DemoStepId = 'IDLE';
  private operationalState: 'NOMINAL' | 'THERMAL_MITIGATION' | 'POWER_CONSERVATION' | 'ANTENNA_RECOVERY' | 'STABILIZING' | 'STABILIZED' = 'NOMINAL';

  private windowMinutes = 10;
  private isPhysicsDirty = true;
  private isSchedulerDirty = true;
  private lastAnomalyScenario: TelemetryScenario | null = null;
  private cachedPhysics: PhysicsState | null = null;
  private cachedAnomaly: ExplanationOutput | null = null;
  private cachedSafety: SafetyValidationResult | null = null;
  private cachedScheduler: SchedulerComparison | null = null;

  constructor() {
    this.addEvent('SYSTEM', 'Kepler Crew Mission Control system initialized.');
    runMlEvaluationOnce().then(() => {
      this.addEvent('SYSTEM', 'Benchmark metrics evaluated & cached.');
    });
  }

  public setSynodicMonth(month: number): void {
    this.synodicMonth = month;
    this.isPhysicsDirty = true;
    this.isSchedulerDirty = true;
  }

  public setWindowMinutes(mins: number): void {
    this.windowMinutes = mins;
    this.isSchedulerDirty = true;
  }

  public getPassWindowCapacityMb(): number {
    if (!this.cachedPhysics?.communicationAvailable) return 0;
    const bandwidthMbps = this.cachedPhysics.communicationState === 'DEGRADED' ? 2.0 : 6.0;
    return (bandwidthMbps * this.windowMinutes * 60) / 8;
  }

  public setScenario(sc: TelemetryScenario): void {
    this.scenario = sc;
    this.addEvent('ANOMALY', `Telemetry scenario updated to ${sc}.`);
  }

  public setManualMode(mode: 'NORMAL' | 'CONJUNCTION' | 'EMERGENCY'): void {
    this.manualMode = mode;
    if (mode === 'CONJUNCTION') this.synodicMonth = 13.0;
    this.addEvent('PHYSICS', `Simulation mode set to ${mode}.`);
    this.isPhysicsDirty = true;
    this.isSchedulerDirty = true;
  }

  public addEvent(category: MissionEvent['category'], message: string, details?: string): void {
    const now = Date.now();
    const newEvent: MissionEvent = {
      id: now.toString(),
      numericTimestamp: now,
      timestamp: new Date(now).toISOString().substring(11, 19),
      category,
      message,
      details,
    };
    this.events = [newEvent, ...this.events.slice(0, 49)];
  }

  public executeLocalAction(decision?: SafetyValidationResult): void {
    const currentDecision = decision || this.cachedSafety;
    if (!currentDecision || !currentDecision.approved || !currentDecision.action) {
      this.addEvent('SAFETY', 'Safety policy evaluation REJECTED. Action not executed.', currentDecision?.policyRationale);
      return;
    }

    const currentAction = currentDecision.action;
    const triggeredBy = currentAction.triggeredBy;

    if (triggeredBy === 'temperatureC') {
      this.operationalState = 'THERMAL_MITIGATION';
    } else if (triggeredBy === 'busVoltageV') {
      this.operationalState = 'POWER_CONSERVATION';
    } else if (triggeredBy === 'rfSignalDb' || triggeredBy === 'antennaAngleDeg') {
      this.operationalState = 'ANTENNA_RECOVERY';
    }

    this.cachedSafety = currentDecision;
    this.addEvent('SAFETY', `Executed autonomous safety rule (${currentAction.actionId}).`, 'DEMO_ACTION_EXECUTED');
  }

  public createDemoController(): DemoStateController {
    return {
      setManualMode: (m) => this.setManualMode(m),
      setScenario: (s) => this.setScenario(s),
      addEvent: (c, msg, details) => this.addEvent(c, msg, details),
      runAnomalyDetection: () => {
        const telemetry = generateTelemetry(this.scenario);
        this.cachedAnomaly = localAiDetector.analyze(telemetry);
        this.cachedSafety = evaluateSafetyPolicy(this.cachedAnomaly);
        this.lastAnomalyScenario = this.scenario;
        this.addEvent('ANOMALY', `TF.js Autoencoder detected anomaly in ${this.cachedAnomaly.topDeviatedFeature} (${this.cachedAnomaly.riskLevel} risk).`, 'DEMO_ANOMALY_DETECTED');
      },
      runSafetyValidation: () => {
        if (!this.cachedAnomaly || this.lastAnomalyScenario !== this.scenario) {
          const telemetry = generateTelemetry(this.scenario);
          this.cachedAnomaly = localAiDetector.analyze(telemetry);
          this.lastAnomalyScenario = this.scenario;
        }
        this.cachedSafety = evaluateSafetyPolicy(this.cachedAnomaly);
        this.addEvent('SAFETY', `Evaluated safety policy: ${this.cachedSafety.policyRationale}`, 'DEMO_SAFETY_VALIDATED');
      },
      executeLocalAction: () => {
        this.executeLocalAction();
      },
      stabilizeSpacecraft: () => {
        this.operationalState = 'STABILIZED';
        this.setScenario('NORMAL');
        this.addEvent('SYSTEM', 'Spacecraft telemetry stabilized nominal.', 'DEMO_SPACECRAFT_STABILIZED');
      },
      runDtnOptimizer: () => {
        const capacityMb = this.getPassWindowCapacityMb();
        this.cachedScheduler = compareSchedulers(INITIAL_PAYLOADS, capacityMb);
        this.isSchedulerDirty = false;
        this.addEvent('SCHEDULER', 'Ran 0/1 DP Knapsack optimizer on DTN queue.');
      },
      startDtnTransmission: () => {
        const capacityMb = this.getPassWindowCapacityMb();
        dtnQueueService.startTransmission(capacityMb);
        this.isSchedulerDirty = true;
        this.addEvent('DTN', 'Critical payload transmitting via DSN downlink.');
      },
      confirmEarthDelivery: () => {
        dtnQueueService.confirmDelivery();
        this.isSchedulerDirty = true;
        this.addEvent('DTN', 'Emergency payload delivered to Earth DSN.');
      },
    };
  }

  public startBlackoutDemo(): void {
    this.addEvent('DEMO', '1-Click Mars Blackout Demo Started.');
    const controller = this.createDemoController();
    demoScenarioService.startDemo(controller, (stepId) => {
      this.demoStep = stepId;
    });
  }

  public getState(): UnifiedMissionState {
    if (this.isPhysicsDirty || !this.cachedPhysics) {
      this.cachedPhysics = getPhysicsState(this.synodicMonth, this.manualMode);
      this.isPhysicsDirty = false;
      this.isSchedulerDirty = true;
    }

    if (!this.cachedAnomaly || this.lastAnomalyScenario !== this.scenario) {
      const telemetry = generateTelemetry(this.scenario);
      this.cachedAnomaly = localAiDetector.analyze(telemetry);
      this.cachedSafety = evaluateSafetyPolicy(this.cachedAnomaly);
      this.lastAnomalyScenario = this.scenario;
    }

    if (this.isSchedulerDirty || !this.cachedScheduler) {
      const capacityMb = this.getPassWindowCapacityMb();
      this.cachedScheduler = compareSchedulers(INITIAL_PAYLOADS, capacityMb);
      dtnQueueService.processQueue(this.cachedPhysics.communicationAvailable, capacityMb);
      this.isSchedulerDirty = false;
    }

    const benchmarkMetrics = getBenchmarkMetrics(this.synodicMonth, this.events);

    return {
      missionTimeSec: Math.floor(Date.now() / 1000),
      synodicMonth: this.synodicMonth,
      isDemoActive: this.demoStep !== 'IDLE' && this.demoStep !== 'DEMO_COMPLETE',
      demoStep: this.demoStep,
      demoProgressPct: parseFloat(((demoScenarioService.getCurrentStep().stepNumber / demoScenarioService.getCurrentStep().totalSteps) * 100).toFixed(0)),
      orbital: this.cachedPhysics,
      spacecraftHealth: this.cachedAnomaly.riskLevel === 'CRITICAL' ? 'CRITICAL' : this.cachedAnomaly.riskLevel === 'HIGH' ? 'DEGRADED' : 'NOMINAL',
      spacecraftOperationalState: this.operationalState,
      dtnQueue: dtnQueueService.getQueue(),
      latestAction: this.cachedSafety.action,
      schedulerComparison: this.cachedScheduler,
      benchmarkMetrics,
      anomalyExplanation: this.cachedAnomaly,
      events: this.events,
    };
  }
}

export const missionStateService = new MissionStateService();
