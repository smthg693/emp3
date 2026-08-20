import React, { useState } from 'react';
import { TelemetryData } from '../types/mission';
import { 
  Cpu, 
  Activity, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  BarChart3, 
  Layers, 
  AlertCircle,
  Zap,
  ArrowRight
} from 'lucide-react';

interface MissionAdvisorProps {
  telemetry: TelemetryData;
}

export const MissionAdvisor: React.FC<MissionAdvisorProps> = ({ telemetry }) => {
  const [selectedStrategy, setSelectedStrategy] = useState<'MANUAL' | 'AI_OPTIMIZED'>('AI_OPTIMIZED');

  return (
    <div className="bg-space-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <span className="text-xs font-mono text-spacegold-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <Cpu className="w-4 h-4" /> Feature 04 & 05 — Decision Support
          </span>
          <h3 className="text-lg font-bold font-heading text-white mt-1">
            AI Mission Advisor & Control Dashboard
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Provides operators with anomaly detection, alternative strategy comparisons, and explainable recommendations for deep space data routing.
          </p>
        </div>

        {/* Strategy Switcher */}
        <div className="flex items-center gap-2 bg-space-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto font-mono text-xs">
          <button
            onClick={() => setSelectedStrategy('MANUAL')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedStrategy === 'MANUAL'
                ? 'bg-slate-700 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Manual Static Pass
          </button>
          <button
            onClick={() => setSelectedStrategy('AI_OPTIMIZED')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedStrategy === 'AI_OPTIMIZED'
                ? 'bg-gradient-to-r from-mars-500 to-orange-600 text-white font-bold shadow-md'
                : 'text-slate-400 hover:text-mars-400'
            }`}
          >
            AI Dynamic Strategy
          </button>
        </div>
      </div>

      {/* 3 Core Pillars (Slide 10 Top Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Pillar 1: Anomaly Detection */}
        <div className="bg-space-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-mars-500 font-mono text-xs font-bold">
            <div className="w-7 h-7 rounded-lg bg-mars-500/10 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <span>Anomaly Detection</span>
          </div>
          <p className="text-xs text-slate-300 font-mono leading-relaxed">
            Flags unusual latency spikes, packet loss, or solar noise degradation before total signal loss.
          </p>
          <div className="text-[11px] font-mono text-emerald-400 bg-space-900 p-2 rounded border border-slate-800">
            ✓ Status: RF Link Stable (+22dB SNR)
          </div>
        </div>

        {/* Pillar 2: Strategy Comparison */}
        <div className="bg-space-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-earth-400 font-mono text-xs font-bold">
            <div className="w-7 h-7 rounded-lg bg-earth-500/10 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <span>Strategy Comparison</span>
          </div>
          <p className="text-xs text-slate-300 font-mono leading-relaxed">
            Weighs alternative transmission schedules and transparently explains the latency vs bandwidth trade-offs.
          </p>
          <div className="text-[11px] font-mono text-earth-400 bg-space-900 p-2 rounded border border-slate-800">
            +38% Bandwidth Efficiency Gain
          </div>
        </div>

        {/* Pillar 3: Explainable Recommendations */}
        <div className="bg-space-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-spacegold-400 font-mono text-xs font-bold">
            <div className="w-7 h-7 rounded-lg bg-spacegold-500/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <span>Explainable AI</span>
          </div>
          <p className="text-xs text-slate-300 font-mono leading-relaxed">
            Every AI suggestion comes with a stated physical reason so operators maintain full oversight.
          </p>
          <div className="text-[11px] font-mono text-spacegold-400 bg-space-900 p-2 rounded border border-slate-800">
            Rule Log: XAI Reason Stated
          </div>
        </div>

      </div>

      {/* MISSION CONTROL — EARTH-MARS LINK DASHBOARD (Slide 10 Lower Banner) */}
      <div className="bg-gradient-to-br from-space-950 via-space-900 to-space-950 border border-slate-800 rounded-xl p-5 space-y-5 shadow-2xl">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono text-xs">
          <span className="text-spacegold-400 font-bold uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Mission Control — Earth–Mars Link
          </span>
          <span className="text-slate-400">DSN Complex: Goldstone 120°</span>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
          <div className="bg-space-950 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Distance</span>
            <span className="text-xl font-bold text-white">{telemetry.distanceKm.toFixed(1)}M km</span>
          </div>

          <div className="bg-space-950 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">One-Way Latency</span>
            <span className="text-xl font-bold text-mars-500">{telemetry.oneWayLatencyMin.toFixed(1)} min</span>
          </div>

          <div className="bg-space-950 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Round-Trip RTT</span>
            <span className="text-xl font-bold text-spacegold-400">{telemetry.roundTripLatencyMin.toFixed(1)} min</span>
          </div>

          <div className="bg-space-950 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Bandwidth</span>
            <span className="text-xl font-bold text-emerald-400">{telemetry.isConjunction ? '0 Kbps' : `${telemetry.bandwidthMbps} Mbps`}</span>
          </div>
        </div>

        {/* Priority Queue & AI Recommendation Box (Slide 10 Bottom Half) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 font-mono text-xs pt-2">
          
          {/* Priority Queue */}
          <div className="bg-space-950 p-4 rounded-xl border border-slate-800/90 space-y-2">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-2">
              Active Priority Queue
            </span>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded bg-space-900 border border-red-500/30 text-red-300">
                <span className="font-bold">P1 Emergency Telemetry</span>
                <span>100 MB • Priority 1</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-space-900 border border-mars-500/30 text-mars-300">
                <span className="font-bold">P2 Navigation Data</span>
                <span>400 MB • Priority 2</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-space-900 border border-slate-800 text-slate-300">
                <span className="font-bold">P3 Power & Health Data</span>
                <span>500 MB • Priority 3</span>
              </div>
            </div>
          </div>

          {/* AI Recommendation Quote Box (Slide 10 Quote) */}
          <div className="bg-space-950 p-4 rounded-xl border border-slate-800/90 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-spacegold-400 text-[10px] uppercase font-bold tracking-wider block mb-1">
                AI Recommendation Engine
              </span>
              <p className="text-sm font-bold text-white italic">
                “Transmit emergency telemetry before scientific data due to 12.5 min one-way signal delay.”
              </p>
            </div>

            <div className="text-[11px] text-slate-400 bg-space-900 p-2.5 rounded border border-slate-800">
              <strong className="text-slate-200">Stated Reason:</strong> Current synodic orbit position increases latency by +1.2 min over next 48 hours. Emergency telemetry risk buffer requires immediate DSN confirmation pass.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
