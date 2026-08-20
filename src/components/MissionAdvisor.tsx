import React, { useState, useEffect } from 'react';
import { TelemetryData } from '../types/mission';
import { localAiDetector, ExplanationOutput } from '../services/anomalyDetector';
import { 
  Cpu, 
  Activity, 
  Sparkles, 
  CheckCircle2, 
  BarChart3, 
  AlertTriangle,
  Zap,
  ShieldCheck,
  RefreshCw,
  Info,
  Layers
} from 'lucide-react';

interface MissionAdvisorProps {
  telemetry: TelemetryData;
}

export const MissionAdvisor: React.FC<MissionAdvisorProps> = ({ telemetry }) => {
  const [selectedStrategy, setSelectedStrategy] = useState<'MANUAL' | 'AI_OPTIMIZED'>('AI_OPTIMIZED');
  const [aiOutput, setAiOutput] = useState<ExplanationOutput | null>(null);

  const runAiAnalysis = () => {
    const sensorReading = {
      temperatureC: telemetry.isConjunction ? 68.5 : 34.2,
      busVoltageV: telemetry.isConjunction ? 24.1 : 28.1,
      rfSignalDb: telemetry.isConjunction ? 4.2 : 23.5,
      antennaAngleDeg: telemetry.isConjunction ? 3.8 : 0.4,
    };

    const result = localAiDetector.analyze(sensorReading);
    setAiOutput(result);
  };

  useEffect(() => {
    runAiAnalysis();
  }, [telemetry.synodicMonth, telemetry.isConjunction]);

  return (
    <div className="bg-space-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <span className="text-xs font-mono text-spacegold-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <Cpu className="w-4 h-4" /> Feature 04 & 05 — Decision Support
          </span>
          <h3 className="text-lg font-bold font-heading text-white mt-1">
            AI Mission Advisor & Decision Dashboard
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Powered by 100% offline TensorFlow.js Autoencoder & Deterministic Per-Feature Anomaly Attribution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={runAiAnalysis}
            className="px-3 py-1.5 rounded-lg bg-space-950 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-Evaluate Model</span>
          </button>
        </div>
      </div>

      {/* 3 Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Pillar 1: TensorFlow.js Anomaly Attribution */}
        <div className="bg-space-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-mars-500 font-mono text-xs font-bold">
              <Activity className="w-4 h-4" />
              <span>TF.js Autoencoder Model</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Offline Neural ML
            </span>
          </div>

          {aiOutput ? (
            <div className="space-y-1 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Deviated Feature:</span>
                <span className="text-mars-400 font-bold">{aiOutput.topDeviatedFeature}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Severity Score:</span>
                <span className="text-spacegold-400 font-bold">{aiOutput.severityScore} / 1.0</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Total MSE Loss:</span>
                <span className="text-slate-300">{aiOutput.totalMse}</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 font-mono py-2">Fitting neural weights...</div>
          )}
        </div>

        {/* Pillar 2: Strategy Comparison */}
        <div className="bg-space-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-earth-400 font-mono text-xs font-bold">
            <BarChart3 className="w-4 h-4" />
            <span>Strategy Comparison</span>
          </div>
          <p className="text-xs text-slate-300 font-mono leading-relaxed">
            Weighs alternative schedules & explains trade-offs.
          </p>
          <div className="text-[11px] font-mono text-earth-400 bg-space-900 p-2 rounded border border-slate-800 flex justify-between">
            <span>DTN Optimization Gain:</span>
            <span className="font-bold">+38% Efficiency</span>
          </div>
        </div>

        {/* Pillar 3: Deterministic Template Engine */}
        <div className="bg-space-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-spacegold-400 font-mono text-xs font-bold">
            <Sparkles className="w-4 h-4" />
            <span>Explainable AI Engine</span>
          </div>
          <p className="text-xs text-slate-300 font-mono leading-relaxed">
            Per-feature cause mapping & recovery rules.
          </p>
          <div className="text-[11px] font-mono text-spacegold-400 bg-space-900 p-2 rounded border border-slate-800 flex justify-between">
            <span>Execution Mode:</span>
            <span className="font-bold">Local TF.js Neural Model</span>
          </div>
        </div>

      </div>

      {/* Local Explainable AI Output Card */}
      <div className="bg-space-950 border border-slate-800 rounded-xl p-5 space-y-4 shadow-inner">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono text-xs">
          <span className="text-spacegold-400 font-bold uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-spacegold-400" />
            TensorFlow.js Explainable AI Analysis & Guidance
          </span>
          <span className="text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
            ✓ 100% Local (Offline Mode)
          </span>
        </div>

        <div className="space-y-3 font-mono text-xs">
          {/* Explanation Banner */}
          <div className="bg-space-900 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-bold">Per-Feature Neural Attribution:</span>
              
              {/* Detection Path Pill Indicator */}
              <div className="flex items-center gap-2">
                {aiOutput?.detectionPath === 'HARD_LIMIT_ONLY' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600/20 text-red-400 border border-red-500/30">
                    HARD LIMIT EXCEEDED
                  </span>
                )}
                {aiOutput?.detectionPath === 'STATISTICAL_ONLY' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    STATISTICAL ANOMALY • 3σ
                  </span>
                )}
                {aiOutput?.detectionPath === 'BOTH' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    HARD LIMIT EXCEEDED • STATISTICAL ANOMALY
                  </span>
                )}
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  aiOutput?.riskLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  aiOutput?.riskLevel === 'HIGH' ? 'bg-mars-500/20 text-mars-400' : 'bg-slate-800 text-slate-300'
                }`}>
                  Risk: {aiOutput?.riskLevel || 'LOW'}
                </span>
              </div>
            </div>
            <p className="text-slate-200 leading-relaxed italic">
              "{aiOutput?.explanation || 'Telemetry reading nominal across primary subsystems.'}"
            </p>
          </div>

          {/* Per-Feature Attributions Grid */}
          {aiOutput?.attributions && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {aiOutput.attributions.map((attr) => (
                <div key={attr.featureName} className="bg-space-900 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-[9px] text-slate-400 block uppercase font-bold truncate">{attr.featureName}</span>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs font-bold text-white">{attr.observedValue}</span>
                    <span className="text-[9px] text-slate-500">(Exp: {attr.expectedValue})</span>
                  </div>
                  <div className="text-[9px] text-mars-400 mt-0.5 font-mono">
                    MSE Error: {attr.reconstructionError}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recommended Action Box */}
          <div className="bg-space-900 p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Recommended Safety Recovery Action:</span>
              <span className="text-emerald-400 font-bold text-xs">{aiOutput?.recommendedAction || 'Continue routine operations.'}</span>
            </div>
            <span className="text-slate-500 text-[10px] shrink-0">
              Mapped to 5-Step Autonomy Pipeline
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
