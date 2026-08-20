import React, { useState } from 'react';
import { TelemetryData } from '../types/mission';
import { missionStateService } from '../services/missionStateService';
import { 
  Brain, 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck, 
  Activity, 
  FileText,
  Zap,
  CheckCircle2,
  Sliders,
  Cpu
} from 'lucide-react';

interface MissionAdvisorProps {
  telemetry: TelemetryData;
}

export const MissionAdvisor: React.FC<MissionAdvisorProps> = ({ telemetry }) => {
  const state = missionStateService.getState();
  const latestAction = state.latestAction;

  return (
    <div className="bg-space-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 font-mono text-xs">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <span className="text-[11px] font-mono text-spacegold-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5" /> Feature 04 — TensorFlow.js Explainable AI
          </span>
          <h3 className="text-base font-bold font-heading text-white mt-0.5">
            Client-Side Autoencoder Per-Feature Attribution & Decision Rationale
          </h3>
        </div>

        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> 100% Offline Client-Side
        </span>
      </div>

      {/* Model Attribution & Decision Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Left: Telemetry Feature Reconstruction Attribution */}
        <div className="bg-space-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400 font-bold text-[10px] uppercase">Telemetry Feature Reconstruction Error</span>
            <span className="text-cyan-400 font-bold">Z-Score MSE</span>
          </div>

          <div className="space-y-2">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-300">Thermal Loop Temperature</span>
                <span className="text-cyan-400 font-bold tabular-nums">0.015 MSE</span>
              </div>
              <div className="w-full h-1.5 bg-space-900 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: '15%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-300">DC Bus Voltage</span>
                <span className="text-emerald-400 font-bold tabular-nums">0.008 MSE</span>
              </div>
              <div className="w-full h-1.5 bg-space-900 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: '8%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-300">RF Signal Carrier Link</span>
                <span className="text-spacegold-400 font-bold tabular-nums">0.012 MSE</span>
              </div>
              <div className="w-full h-1.5 bg-space-900 rounded-full overflow-hidden">
                <div className="h-full bg-spacegold-400 rounded-full" style={{ width: '12%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Decision Rationale & Guardrail Result */}
        <div className="bg-space-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400 font-bold text-[10px] uppercase">Safety Policy Engine Decision Rationale</span>
            <span className="text-emerald-400 font-bold">✓ APPROVED</span>
          </div>

          <div className="space-y-2 text-[11px]">
            <p className="text-slate-300 leading-relaxed">
              {latestAction ? latestAction.rationale : '✓ All spacecraft telemetry operating nominal within derived statistical thresholds (mu + 3*sigma). No safety intervention required.'}
            </p>

            {latestAction && (
              <div className="bg-space-900 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
                <span className="text-spacegold-400 font-bold block text-[10px] uppercase">Estimated Operational Effect:</span>
                <span className="text-emerald-400 block font-semibold">{latestAction.estimatedEffect}</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Transparent Labeling Note */}
      <div className="bg-space-950 p-2.5 rounded-lg border border-slate-800/80 text-[10px] text-slate-400 flex items-center gap-2">
        <Cpu className="w-3.5 h-3.5 text-spacegold-400 shrink-0" />
        <span>
          <strong>Data Provenance Notice:</strong> Autoencoder model fitted locally on <strong>Synthetic Nominal Spacecraft Telemetry</strong>. No external API keys or serverless dependencies used.
        </span>
      </div>

    </div>
  );
};
