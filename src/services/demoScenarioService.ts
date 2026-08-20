import type { DemoStepId } from '../types/mission';

export interface DemoStepInfo {
  stepId: DemoStepId;
  stepNumber: number;
  totalSteps: number;
  title: string;
  description: string;
}

export interface DemoStateController {
  setManualMode: (mode: 'NORMAL' | 'CONJUNCTION' | 'EMERGENCY') => void;
  setScenario: (scenario: any) => void;
  addEvent: (category: any, message: string, details?: string) => void;
  runSafetyValidation: () => void;
  executeLocalAction: () => void;
  stabilizeSpacecraft: () => void;
  runDtnOptimizer: () => void;
  startDtnTransmission: () => void;
  confirmEarthDelivery: () => void;
}

class DemoScenarioService {
  private currentStepIndex = 0;
  private isRunning = false;
  private timer: any = null;

  public readonly STEPS: { id: DemoStepId; title: string; desc: string }[] = [
    { id: 'IDLE', title: 'Idle State', desc: 'System in baseline simulation mode.' },
    { id: 'CONJUNCTION_START', title: 'Solar Conjunction Initiated', desc: 'Earth and Mars approaching 180° alignment behind the Sun.' },
    { id: 'COMMUNICATION_BLACKOUT', title: 'RF Communication Blackout', desc: 'Sun-Earth-Mars angle < 3.0°. Ground link offline.' },
    { id: 'ANOMALY_INJECTED', title: 'Thermal Anomaly Injected', desc: 'Cooling loop 4 radiator line pressure drop (+68.5°C).' },
    { id: 'ANOMALY_DETECTED', title: 'TF.js ML Anomaly Detected', desc: 'Reconstruction error spike. Thermal Loop identified.' },
    { id: 'SAFETY_VALIDATION', title: 'Safety Policy Evaluated', desc: 'Rule RULE-TH-092 matched. Safety check APPROVED.' },
    { id: 'LOCAL_ACTION_EXECUTED', title: 'Local Action Executed', desc: 'Switched cooling loop 4B. Power throttled.' },
    { id: 'SPACECRAFT_STABILIZED', title: 'Spacecraft Stabilized', desc: 'Thermal loop temp returning to nominal margin.' },
    { id: 'CONTACT_RESTORED', title: 'Communication Contact Restored', desc: 'Solar blackout period ended. Carrier signal locked.' },
    { id: 'DTN_SCHEDULING', title: 'DTN Optimizer Engaged', desc: 'Running 0/1 Knapsack Optimizer on buffered bundles.' },
    { id: 'CRITICAL_DATA_TRANSMITTING', title: 'Emergency Telemetry Transmitting', desc: 'High priority fault payload downlink in progress.' },
    { id: 'EARTH_DATA_RECEIVED', title: 'Earth Downlink Confirmed', desc: 'Emergency fault telemetry received at JPL DSN.' },
    { id: 'DEMO_COMPLETE', title: 'Demo Scenario Complete', desc: 'End-to-end autonomous recovery workflow demonstrated.' },
  ];

  public stepNext(controller: DemoStateController, onStep?: (stepId: DemoStepId) => void): DemoStepId {
    this.currentStepIndex++;
    if (this.currentStepIndex >= this.STEPS.length) {
      this.currentStepIndex = 0;
      this.isRunning = false;
      return 'IDLE';
    }

    const stepId = this.STEPS[this.currentStepIndex].id;
    if (stepId === 'CONJUNCTION_START' || stepId === 'COMMUNICATION_BLACKOUT') {
      controller.setManualMode('CONJUNCTION');
    } else if (stepId === 'ANOMALY_INJECTED') {
      controller.setScenario('THERMAL_ANOMALY');
    } else if (stepId === 'ANOMALY_DETECTED') {
      controller.addEvent('ANOMALY', 'TF.js Autoencoder detected Thermal anomaly.', 'DEMO_ANOMALY_DETECTED');
    } else if (stepId === 'SAFETY_VALIDATION') {
      controller.runSafetyValidation();
    } else if (stepId === 'LOCAL_ACTION_EXECUTED') {
      controller.executeLocalAction();
    } else if (stepId === 'SPACECRAFT_STABILIZED') {
      controller.stabilizeSpacecraft();
    } else if (stepId === 'CONTACT_RESTORED') {
      controller.setManualMode('NORMAL');
    } else if (stepId === 'DTN_SCHEDULING') {
      controller.runDtnOptimizer();
    } else if (stepId === 'CRITICAL_DATA_TRANSMITTING') {
      controller.startDtnTransmission();
    } else if (stepId === 'EARTH_DATA_RECEIVED') {
      controller.confirmEarthDelivery();
    }

    controller.addEvent('DEMO', `Demo Phase ${this.currentStepIndex}/12: ${stepId}`);
    if (onStep) onStep(stepId);
    return stepId;
  }

  public startDemo(controller: DemoStateController, onStep: (stepId: DemoStepId) => void): void {
    this.stopDemo();
    this.isRunning = true;
    this.currentStepIndex = 1;

    const applyStepEffects = (stepId: DemoStepId) => {
      if (stepId === 'CONJUNCTION_START' || stepId === 'COMMUNICATION_BLACKOUT') {
        controller.setManualMode('CONJUNCTION');
      } else if (stepId === 'ANOMALY_INJECTED') {
        controller.setScenario('THERMAL_ANOMALY');
      } else if (stepId === 'ANOMALY_DETECTED') {
        controller.addEvent('ANOMALY', 'TF.js Autoencoder detected Thermal anomaly.', 'DEMO_ANOMALY_DETECTED');
      } else if (stepId === 'SAFETY_VALIDATION') {
        controller.runSafetyValidation();
      } else if (stepId === 'LOCAL_ACTION_EXECUTED') {
        controller.executeLocalAction();
      } else if (stepId === 'SPACECRAFT_STABILIZED') {
        controller.stabilizeSpacecraft();
      } else if (stepId === 'CONTACT_RESTORED') {
        controller.setManualMode('NORMAL');
      } else if (stepId === 'DTN_SCHEDULING') {
        controller.runDtnOptimizer();
      } else if (stepId === 'CRITICAL_DATA_TRANSMITTING') {
        controller.startDtnTransmission();
      } else if (stepId === 'EARTH_DATA_RECEIVED') {
        controller.confirmEarthDelivery();
      }

      controller.addEvent('DEMO', `Demo Phase ${this.currentStepIndex}/12: ${stepId}`);
      onStep(stepId);
    };

    applyStepEffects(this.STEPS[this.currentStepIndex].id);

    this.timer = setInterval(() => {
      this.currentStepIndex++;
      if (this.currentStepIndex >= this.STEPS.length) {
        this.stopDemo();
        return;
      }
      applyStepEffects(this.STEPS[this.currentStepIndex].id);
    }, 2000);
  }

  public reset(): void {
    this.stopDemo();
    this.currentStepIndex = 0;
    this.isRunning = false;
  }

  public stopDemo(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    this.currentStepIndex = 0;
  }

  public getCurrentStep(): DemoStepInfo {
    const s = this.STEPS[this.currentStepIndex] || this.STEPS[0];
    return {
      stepId: s.id,
      stepNumber: this.currentStepIndex,
      totalSteps: this.STEPS.length - 1,
      title: s.title,
      description: s.desc,
    };
  }
}

export const demoScenarioService = new DemoScenarioService();
