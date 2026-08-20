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

  private isDirty = true;
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
    this.isDirty = true;
  }

  public setScenario(sc: TelemetryScenario): void {
    this.scenario = sc;
    this.addEvent('ANOMALY', `Telemetry scenario updated to ${sc}.`);
    this.isDirty = true;
  }

  public setManualMode(mode: 'NORMAL' | 'CONJUNCTION' | 'EMERGENCY'): void {
    this.manualMode = mode;
    if (mode === 'CONJUNCTION') this.synodicMonth = 13.0;
    this.addEvent('PHYSICS', `Simulation mode set to ${mode}.`);
    this.isDirty = true;
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
      this.addEvent('SAFETY', 'Safety policy evaluation REJECTED or invalid. Action not executed.', currentDecision?.policyRationale);
      return;
    }

    const currentAction = currentDecision.action;
    const triggeredBy = currentAction.triggeredBy;

    if (triggeredBy === 'temperatureC') {
      this.operationalState = 'THERMAL_MITIGATION';
    } else if (triggeredBy === 'busVoltageV') {
      this.operationalState = 'POWER_CONSERVATION';
    } else {
      this.operationalState = 'ANTENNA_RECOVERY';
    }

    this.cachedSafety = currentDecision;
    this.addEvent('SAFETY', `Executed autonomous safety rule (${currentAction.actionId}).`, 'DEMO_ACTION_EXECUTED');
    this.isDirty = true;
  }

  public createDemoController(): DemoStateController {
    return {
      setManualMode: (m) => this.setManualMode(m),
      setScenario: (s) => this.setScenario(s),
      addEvent: (c, msg, details) => this.addEvent(c, msg, details),
      runSafetyValidation: () => {
        const telemetry = generateTelemetry(this.scenario);
        const freshAnomaly = localAiDetector.analyze(telemetry);
        this.cachedAnomaly = freshAnomaly;
        this.cachedSafety = evaluateSafetyPolicy(freshAnomaly);
        this.addEvent('SAFETY', 'Evaluated safety policy for detected anomaly.', 'DEMO_SAFETY_VALIDATED');
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
        const capacityMb = this.cachedPhysics?.communicationAvailable ? 800 : 0;
        this.cachedScheduler = compareSchedulers(INITIAL_PAYLOADS, capacityMb);
        this.addEvent('SCHEDULER', 'Ran 0/1 DP Knapsack optimizer on DTN queue.');
      },
      startDtnTransmission: () => {
        const queue = dtnQueueService.getQueue();
        if (queue.length > 0) {
          queue[0].status = 'TRANSMITTING';
        }
        this.addEvent('DTN', 'Critical payload transmitting via DSN downlink.');
      },
      confirmEarthDelivery: () => {
        const queue = dtnQueueService.getQueue();
        if (queue.length > 0) {
          queue[0].status = 'DELIVERED';
        }
        this.addEvent('DTN', 'Emergency payload delivered to Earth DSN.');
      },
    };
  }

  public startBlackoutDemo(): void {
    this.addEvent('DEMO', '1-Click Mars Blackout Demo Started.');
    const controller = this.createDemoController();
    demoScenarioService.startDemo(controller, (stepId) => {
      this.demoStep = stepId;
      this.isDirty = true;
    });
  }

  public getState(): UnifiedMissionState {
    if (this.isDirty || !this.cachedPhysics || !this.cachedAnomaly || !this.cachedSafety || !this.cachedScheduler) {
      this.cachedPhysics = getPhysicsState(this.synodicMonth, this.manualMode);
      const telemetry = generateTelemetry(this.scenario);
      this.cachedAnomaly = localAiDetector.analyze(telemetry);
      this.cachedSafety = evaluateSafetyPolicy(this.cachedAnomaly);

      const capacityMb = this.cachedPhysics.communicationAvailable ? (this.cachedPhysics.communicationState === 'DEGRADED' ? 200 : 800) : 0;
      this.cachedScheduler = compareSchedulers(INITIAL_PAYLOADS, capacityMb);
      dtnQueueService.processQueue(this.cachedPhysics.communicationAvailable, capacityMb);
      this.isDirty = false;
    }

    const benchmarkMetrics = getBenchmarkMetrics(this.synodicMonth, this.events);

    return {
      missionTimeSec: Math.floor(Date.now() / 1000), // Lightweight clock tick
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
      events: this.events,
    };
  }
}

export const missionStateService = new MissionStateService();
