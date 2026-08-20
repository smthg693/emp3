import React, { useState } from 'react';
import { DataPayloadItem, TelemetryData } from '../types/mission';
import { missionStateService } from '../services/missionStateService';
import { 
  Sliders, 
  CheckCircle2, 
  Clock, 
  HardDrive, 
  Sparkles, 
  Zap,
  ShieldCheck
} from 'lucide-react';

interface DataSchedulerProps {
  telemetry: TelemetryData;
}

export const DataScheduler: React.FC<DataSchedulerProps> = ({ telemetry }) => {
  const [windowMinutes, setWindowMinutes] = useState<number>(10);
  const [activeToast, setActiveToast] = useState<string | null>(null);

  const state = missionStateService.getState();
  const comparison = state.schedulerComparison;
  const dtnQueue = state.dtnQueue;

  const bandwidthMbps = telemetry.isConjunction ? 0 : telemetry.bandwidthMbps;
  const totalCapacityMB = (bandwidthMbps * 60 * windowMinutes) / 8;

  const handleRunOptimizer = () => {
    setActiveToast('0/1 DP Knapsack Engine executing transmission schedule optimization...');
    missionStateService.setSynodicMonth(telemetry.synodicMonth);
    setTimeout(() => setActiveToast(null), 3000);
  };

  return (
    <div className="bg-space-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 relative overflow-hidden flex flex-col justify-between font-mono text-xs">
      
      {/* Toast Notification */}
      {activeToast && (
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-30 bg-gradient-to-r from-mars-600 to-orange-600 text-white text-xs font-mono px-3.5 py-1.5 rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
          <Zap className="w-3.5 h-3.5 text-amber-200" />
          <span>{activeToast}</span>
        </div>
      )}

      {/* Section Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <span className="text-[11px] font-mono text-mars-500 uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5" /> Feature 02 — 0/1 DP Knapsack Optimization
          </span>
          <h3 className="text-base font-bold font-heading text-white mt-0.5">
            Intelligent Data Downlink Queue Scheduler
          </h3>
        </div>

        <button
          onClick={handleRunOptimizer}
          disabled={telemetry.isConjunction}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 shadow-md transition-all ${
            telemetry.isConjunction
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-mars-500 to-orange-600 hover:from-mars-600 hover:to-orange-700 text-white shadow-mars-500/20 active:scale-95'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-200" />
          <span>Run 0/1 DP Optimizer</span>
        </button>
      </div>

      {/* Baseline Greedy vs Kepler 0/1 DP Comparison Card */}
      <div className="bg-space-950 p-3 rounded-xl border border-slate-800/90 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <span className="text-slate-400 block text-[9px] uppercase mb-0.5">Pass Window Capacity</span>
          <span className="text-cyan-400 font-bold text-sm block tabular-nums">
            {totalCapacityMB >= 1024 ? `${(totalCapacityMB / 1024).toFixed(2)} GB` : `${totalCapacityMB.toFixed(0)} MB`}
            <span className="text-[10px] text-slate-500 ml-1">({bandwidthMbps} Mbps)</span>
          </span>
        </div>

        <div>
          <span className="text-slate-400 block text-[9px] uppercase mb-0.5">Baseline vs Kepler Value</span>
          <span className="text-emerald-400 font-bold text-sm block tabular-nums">
            {comparison?.baselineMissionValue || 0} ➔ {comparison?.optimizedMissionValue || 0}
          </span>
        </div>

        <div>
          <span className="text-slate-400 block text-[9px] uppercase mb-0.5">Measured Optimizer Gain</span>
          <span className="text-spacegold-400 font-bold text-sm block tabular-nums">
            +{comparison?.measuredImprovementPct || 0}%
          </span>
        </div>
      </div>

      {/* DTN Queue Table View */}
      <div className="bg-space-950 rounded-xl border border-slate-800/90 overflow-hidden">
        <div className="bg-space-900/90 px-3 py-2 border-b border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <span className="w-16">Priority</span>
          <span className="flex-1">Payload Name</span>
          <span className="w-20 text-right">Size</span>
          <span className="w-32 text-right">DTN Status</span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {dtnQueue.map((item) => {
            const isDelivered = item.status === 'DELIVERED';
            const isTransmitting = item.status === 'TRANSMITTING';

            return (
              <div
                key={item.id}
                className="px-3 py-2.5 flex items-center justify-between gap-2 transition-colors hover:bg-space-900/40"
              >
                <div className="w-16 flex items-center gap-1.5 shrink-0">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                    item.priority === 1 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-mars-500/20 text-mars-400'
                  }`}>
                    P{item.priority}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <span className="font-bold text-white block truncate text-xs">{item.payloadName}</span>
                </div>

                <div className="w-20 text-right shrink-0">
                  <span className="text-slate-300 font-semibold tabular-nums">{item.sizeMb} MB</span>
                </div>

                <div className="w-32 text-right shrink-0">
                  {isDelivered ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> DELIVERED
                    </span>
                  ) : isTransmitting ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 animate-pulse">
                      <Zap className="w-3 h-3 text-cyan-400" /> TRANSMITTING
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      <HardDrive className="w-3 h-3" /> BUFFERED
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* NASA DTN Note */}
      <div className="bg-space-950 p-2.5 rounded-lg border border-slate-800/80 text-[10px] text-slate-400 flex items-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>
          <strong>NASA Store-and-Forward DTN:</strong> Unsent payloads remain BUFFERED in non-volatile flash memory during solar blackout or link non-contact.
        </span>
      </div>

    </div>
  );
};
