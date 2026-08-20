import React, { useState } from 'react';
import { TelemetryData } from '../types/mission';
import { missionStateService } from '../services/missionStateService';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Cpu, 
  ShieldCheck, 
  Radio, 
  CheckCircle2, 
  Info,
  Zap
} from 'lucide-react';

interface AutonomousEmergencyHandlerProps {
  telemetry: TelemetryData;
}

interface FaultScenario {
  id: string;
  name: string;
  subsystem: string;
  severity: 'CRITICAL' | 'WARNING';
  anomalyDescription: string;
  aiAssessment: string;
  ruleMatched: string;
  autonomousAction: string;
}

const presetFaults: FaultScenario[] = [
  {
    id: 'fault-1',
    name: 'Thermal Loop Overheat',
    subsystem: 'Thermal & Power',
    severity: 'CRITICAL',
    anomalyDescription: 'Subsystem 4 temperature exceeded safe operating limit (T > +65°C).',
    aiAssessment: 'Severe component damage imminent within 4 minutes. Earth RTT delay is min. Earth cannot intervene in time.',
    ruleMatched: 'Rule #TH-092: If T > +65°C, isolation valve 4B auto-trigger pre-approved.',
    autonomousAction: 'Switched primary cooling loop, throttled instrument 2 to standby power.',
  },
  {
    id: 'fault-2',
    name: 'High-Gain Antenna Drift',
    subsystem: 'Communications',
    severity: 'WARNING',
    anomalyDescription: 'RF signal loss detected due to 1.8° attitude drift during DSN pass.',
    aiAssessment: 'Telemetry link degradation -14 dB. Next Earth command window in 18 minutes.',
    ruleMatched: 'Rule #COM-014: If RF link degraded > 10dB, invoke star-tracker recalibration.',
    autonomousAction: 'Re-aligned High-Gain Antenna using auxiliary star sensor lock.',
  },
  {
    id: 'fault-3',
    name: 'Battery Discharge Spike',
    subsystem: 'Electrical Power (EPS)',
    severity: 'CRITICAL',
    anomalyDescription: 'Bus voltage dropped to 24.2V due to short circuit in science payload 3.',
    aiAssessment: 'Spacecraft brownout risk within 3 minutes. Emergency isolation required.',
    ruleMatched: 'Rule #EPS-005: If Bus V < 25V, immediately isolate non-essential loads.',
    autonomousAction: 'Tripped solid-state power controller for payload 3. Voltage stabilized at 28.0V.',
  },
];

export const AutonomousEmergencyHandler: React.FC<AutonomousEmergencyHandlerProps> = ({ telemetry }) => {
  const [selectedFault, setSelectedFault] = useState<FaultScenario>(presetFaults[0]);
  const [activeStep, setActiveStep] = useState<number>(5);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  const steps = [
    { title: 'Fault Detected', subtitle: 'Onboard anomaly flag', icon: AlertTriangle },
    { title: 'AI Analysis', subtitle: 'Severity assessed', icon: Cpu },
    { title: 'Rule Check', subtitle: 'Procedure check', icon: ShieldCheck },
    { title: 'Execute Action', subtitle: 'Response executed', icon: Zap },
    { title: 'Report to Earth', subtitle: 'DTN outbox report', icon: Radio },
  ];

  const handleSimulateScenario = (fault: FaultScenario) => {
    setSelectedFault(fault);
    setActiveStep(1);
    setIsExecuting(true);

    if (fault.id === 'fault-1') {
      missionStateService.setScenario('THERMAL_ANOMALY');
    } else if (fault.id === 'fault-2') {
      missionStateService.setScenario('RF_ANOMALY');
    } else if (fault.id === 'fault-3') {
      missionStateService.setScenario('VOLTAGE_ANOMALY');
    }

    let step = 1;
    const interval = setInterval(() => {
      step++;
      if (step <= 5) {
        setActiveStep(step);
      } else {
        clearInterval(interval);
        setIsExecuting(false);
      }
    }, 700);
  };

  return (
    <div className="bg-space-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between font-mono text-xs">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <span className="text-[11px] font-mono text-red-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" /> Feature 03 — Spacecraft Autonomy Guardrail
          </span>
          <h3 className="text-base font-bold font-heading text-white mt-0.5">
            Autonomous Emergency Response Pipeline
          </h3>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {presetFaults.map((fault) => (
            <button
              key={fault.id}
              onClick={() => handleSimulateScenario(fault)}
              disabled={isExecuting}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all border ${
                selectedFault.id === fault.id
                  ? 'bg-red-600 text-white border-red-500 font-bold shadow-md shadow-red-500/20'
                  : 'bg-space-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {fault.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* CORE DESIGN PRINCIPLE BANNER */}
      <div className="bg-space-950 border border-slate-800 p-3 rounded-xl shadow-inner">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-spacegold-400 shrink-0 mt-0.5" />
          <div className="text-[11px] font-mono leading-relaxed">
            <span className="text-spacegold-400 font-bold uppercase tracking-wider block mb-0.5">
              Autonomy Guardrail Architecture:
            </span>
            <span className="text-slate-300">
              The AI <strong className="text-white">never independently controls</strong> the spacecraft. It recommends; validated mission rules approve; autonomous logic executes pre-approved safety procedures.
            </span>
          </div>
        </div>
      </div>

      {/* 5-STEP HORIZONTAL PIPELINE */}
      <div className="grid grid-cols-5 gap-2">
        {steps.map((step, idx) => {
          const StepIcon = step.icon;
          const stepNum = idx + 1;
          const isActive = activeStep >= stepNum;
          const isCurrent = activeStep === stepNum;

          return (
            <div
              key={step.title}
              className={`p-2.5 rounded-xl border transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-space-950 border-emerald-500/40 text-slate-200 shadow-sm'
                  : 'bg-space-950/40 border-slate-800/60 text-slate-500 opacity-60'
              } ${isCurrent ? 'ring-1 ring-mars-500' : ''}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-mono text-slate-500">0{stepNum}</span>
                <StepIcon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-600'}`} />
              </div>

              <div>
                <h4 className="text-[11px] font-bold font-mono text-white leading-tight truncate">{step.title}</h4>
                <p className="text-[9px] text-slate-500 leading-tight truncate mt-0.5">{step.subtitle}</p>
              </div>

              <div className="mt-2 pt-1 border-t border-slate-800/40 text-[9px] font-mono">
                {isActive ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Done
                  </span>
                ) : (
                  <span className="text-slate-600">Pending</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Scenario Log Detail Card */}
      <div className="bg-space-950 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="text-white font-bold">{selectedFault.name}</span>
            <span className="text-slate-500 text-[10px]">({selectedFault.subsystem})</span>
          </div>
          <span className="text-red-400 text-[10px] font-bold bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
            {selectedFault.severity}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-space-900 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
            <span className="text-slate-400 text-[9px] block uppercase">1 & 2. Anomaly & AI Analysis</span>
            <p className="text-slate-300 text-[11px]">{selectedFault.anomalyDescription}</p>
            <p className="text-amber-400 italic text-[10px]">{selectedFault.aiAssessment.replace('min', `${telemetry.roundTripLatencyMin.toFixed(1)} min`)}</p>
          </div>

          <div className="bg-space-900 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
            <span className="text-slate-400 text-[9px] block uppercase">3 & 4. Matched Rule & Executed Action</span>
            <p className="text-spacegold-400 font-semibold text-[11px]">{selectedFault.ruleMatched}</p>
            <p className="text-emerald-400 font-semibold text-[11px]">✓ {selectedFault.autonomousAction}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 bg-space-900/60 p-2 rounded-lg border border-slate-800/80">
          <span>
            <strong>DTN Report:</strong> Stored in outbox for Earth transmission in next window.
          </span>
          <span className="text-earth-400 font-semibold shrink-0 ml-2 tabular-nums">
            1-Way Latency: +{telemetry.oneWayLatencyMin.toFixed(1)}m
          </span>
        </div>
      </div>

    </div>
  );
};
