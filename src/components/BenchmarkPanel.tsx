import React from 'react';
import type { UnifiedMissionState } from '../types/mission';
import { BarChart2, ShieldCheck } from 'lucide-react';

interface BenchmarkPanelProps {
  state: UnifiedMissionState;
}

export const BenchmarkPanel: React.FC<BenchmarkPanelProps> = ({ state }) => {
  const bm = state.benchmarkMetrics;
  const sc = state.schedulerComparison;

  if (!bm || !sc) return null;

  return (
    <div className="bg-space-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-violet-400 font-bold font-heading">
          <BarChart2 className="w-4 h-4" />
          <span className="uppercase tracking-wider">Measured Technical Results & Benchmarks</span>
        </div>
        <span className="text-[10px] text-slate-500">Evaluated on {bm.evaluationSampleSize} Independent Samples</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-space-950 p-3 rounded-xl border border-slate-800">
          <span className="text-[9px] text-slate-400 block uppercase font-bold">ML Precision</span>
          <span className="text-base font-bold text-emerald-400">{bm.precisionPct}%</span>
          <span className="text-[9px] text-slate-500 block">F1 Score: {bm.f1ScorePct}%</span>
        </div>

        <div className="bg-space-950 p-3 rounded-xl border border-slate-800">
          <span className="text-[9px] text-slate-400 block uppercase font-bold">ML Recall / Detect</span>
          <span className="text-base font-bold text-earth-400">{bm.recallPct}%</span>
          <span className="text-[9px] text-slate-500 block">FPR: {bm.falsePositiveRatePct}%</span>
        </div>

        <div className="bg-space-950 p-3 rounded-xl border border-slate-800">
          <span className="text-[9px] text-slate-400 block uppercase font-bold">Response Reduction</span>
          <span className="text-base font-bold text-mars-500">
            {bm.responseTimeReductionPct !== null ? `${bm.responseTimeReductionPct}%` : 'Pending Demo'}
          </span>
          <span className="text-[9px] text-slate-500 block">
            {bm.keplerLocalResponseSec !== null ? `Local: ${bm.keplerLocalResponseSec}s` : `Earth RTT: ${bm.earthDependentResponseMin}m`}
          </span>
        </div>

        <div className="bg-space-950 p-3 rounded-xl border border-slate-800">
          <span className="text-[9px] text-slate-400 block uppercase font-bold">Knapsack Value Gain</span>
          <span className="text-base font-bold text-violet-400">+{sc.measuredImprovementPct}%</span>
          <span className="text-[9px] text-slate-500 block">Single Objective DP</span>
        </div>
      </div>

      <div className="bg-space-950 p-2.5 rounded-lg border border-violet-500/30 text-[10px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 font-bold text-violet-300">
          <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
          Data Provenance:
        </span>
        <span className="text-slate-500">Synthetic ML Evaluation • Simplified Heliocentric Physics • Simulated DTN Queue • Simulated Spacecraft Telemetry</span>
      </div>
    </div>
  );
};
