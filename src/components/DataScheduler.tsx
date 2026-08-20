import React, { useState } from 'react';
import { DataPayloadItem, TelemetryData } from '../types/mission';
import { 
  Sliders, 
  Play, 
  CheckCircle2, 
  Clock, 
  HardDrive, 
  Sparkles, 
  Database,
  Zap,
  ArrowUpRight
} from 'lucide-react';

interface DataSchedulerProps {
  telemetry: TelemetryData;
}

const initialPayloads: DataPayloadItem[] = [
  { id: 'p1', name: 'Emergency Telemetry & Fault Flags', category: 'Emergency', sizeMB: 100, priorityScore: 1, urgencyLevel: 'CRITICAL', timestamp: '00:00', status: 'QUEUED' },
  { id: 'p2', name: 'Critical Spacecraft Status & Health', category: 'Telemetry', sizeMB: 500, priorityScore: 2, urgencyLevel: 'HIGH', timestamp: '02:00', status: 'QUEUED' },
  { id: 'p3', name: 'Navigation & Trajectory Adjustments', category: 'Navigation', sizeMB: 400, priorityScore: 3, urgencyLevel: 'HIGH', timestamp: '04:00', status: 'QUEUED' },
  { id: 'p4', name: 'Rover Scientific Spectrometer Data', category: 'Scientific', sizeMB: 2048, priorityScore: 4, urgencyLevel: 'MEDIUM', timestamp: '07:00', status: 'QUEUED' },
  { id: 'p5', name: 'High-Res Terrain & Orbital Images', category: 'Images', sizeMB: 5120, priorityScore: 5, urgencyLevel: 'LOW', timestamp: '09:00', status: 'QUEUED' },
];

export const DataScheduler: React.FC<DataSchedulerProps> = ({ telemetry }) => {
  const [payloads, setPayloads] = useState<DataPayloadItem[]>(initialPayloads);
  const [windowMinutes, setWindowMinutes] = useState<number>(10);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [isOptimized, setIsOptimized] = useState<boolean>(false);
  const [activeToast, setActiveToast] = useState<string | null>(null);

  const bandwidthMbps = telemetry.isConjunction ? 0 : telemetry.bandwidthMbps;
  const totalCapacityMB = (bandwidthMbps * 60 * windowMinutes) / 8;

  const handleOptimize = () => {
    setIsOptimizing(true);
    setIsOptimized(false);
    setActiveToast('AI Engine packing priority transmission queue...');

    setTimeout(() => {
      let remainingCap = totalCapacityMB;
      const sorted = [...initialPayloads].sort((a, b) => a.priorityScore - b.priorityScore);

      const updated = sorted.map((item) => {
        if (telemetry.isConjunction) {
          return { ...item, status: 'STORED_IN_DTN' as const };
        }
        if (remainingCap >= item.sizeMB) {
          remainingCap -= item.sizeMB;
          return { ...item, status: 'SENT' as const };
        } else if (remainingCap > 0) {
          remainingCap = 0;
          return { ...item, status: 'TRANSMITTING' as const };
        } else {
          return { ...item, status: 'STORED_IN_DTN' as const };
        }
      });

      setPayloads(updated);
      setIsOptimizing(false);
      setIsOptimized(true);
      setActiveToast('Transmission schedule optimized for current pass!');
      setTimeout(() => setActiveToast(null), 3500);
    }, 600);
  };

  const handleReset = () => {
    setPayloads(initialPayloads);
    setIsOptimized(false);
    setActiveToast(null);
  };

  const transmittedMB = payloads
    .filter((p) => p.status === 'SENT')
    .reduce((acc, p) => acc + p.sizeMB, 0);

  const utilizationPct = totalCapacityMB > 0 
    ? Math.min(100, Math.round((transmittedMB / totalCapacityMB) * 100))
    : 0;

  return (
    <div className="bg-space-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 relative overflow-hidden flex flex-col justify-between">
      
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
            <Sliders className="w-3.5 h-3.5" /> Feature 02 — Data Optimization
          </span>
          <h3 className="text-base font-bold font-heading text-white mt-0.5">
            Intelligent Transmission Data Scheduler
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOptimize}
            disabled={isOptimizing || telemetry.isConjunction}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 shadow-md transition-all ${
              telemetry.isConjunction
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-mars-500 to-orange-600 hover:from-mars-600 hover:to-orange-700 text-white shadow-mars-500/20 active:scale-95'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isOptimizing ? 'animate-spin' : ''}`} />
            <span>{isOptimizing ? 'Optimizing...' : 'Run AI Scheduler'}</span>
          </button>
          
          {isOptimized && (
            <button
              onClick={handleReset}
              className="px-2.5 py-1.5 rounded-lg text-xs font-mono bg-space-950 hover:bg-slate-800 text-slate-400 border border-slate-800 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Config Bar */}
      <div className="bg-space-950 p-3 rounded-xl border border-slate-800/90 grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
        <div>
          <span className="text-slate-400 block text-[9px] uppercase mb-0.5">
            Pass Window Length
          </span>
          <select
            value={windowMinutes}
            onChange={(e) => {
              setWindowMinutes(Number(e.target.value));
              if (isOptimized) setIsOptimized(false);
            }}
            className="w-full bg-space-900 border border-slate-800 rounded-md px-2 py-1 text-white text-xs font-mono focus:outline-none focus:border-mars-500"
          >
            <option value={10}>10 Min (Standard Pass)</option>
            <option value={20}>20 Min (Extended Pass)</option>
            <option value={30}>30 Min (Orbiter Pass)</option>
            <option value={60}>60 Min (DSN Pass)</option>
          </select>
        </div>

        <div>
          <span className="text-slate-400 block text-[9px] uppercase mb-0.5">
            Pass Window Capacity
          </span>
          <span className="text-emerald-400 font-bold text-sm block">
            {totalCapacityMB >= 1024 
              ? `${(totalCapacityMB / 1024).toFixed(2)} GB` 
              : `${totalCapacityMB.toFixed(0)} MB`}
            <span className="text-[10px] text-slate-500 ml-1">({telemetry.bandwidthMbps} Mbps)</span>
          </span>
        </div>

        <div>
          <div className="flex justify-between text-[10px] mb-0.5">
            <span className="text-slate-400 uppercase">Bandwidth Rate</span>
            <span className="text-earth-400 font-bold">{utilizationPct}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-earth-400 transition-all duration-500 rounded-full"
              style={{ width: `${utilizationPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Clean Organized Table View (Fixes text wrapping and bulky layout) */}
      <div className="bg-space-950 rounded-xl border border-slate-800/90 overflow-hidden font-mono text-xs">
        <div className="bg-space-900/90 px-3 py-2 border-b border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <span className="w-16">Slot / Pri</span>
          <span className="flex-1">Payload Name</span>
          <span className="w-20 text-right">Size</span>
          <span className="w-32 text-right">Status / Queue</span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {payloads.map((item) => {
            const isSent = item.status === 'SENT';

            return (
              <div
                key={item.id}
                className={`px-3 py-2.5 flex items-center justify-between gap-2 transition-colors ${
                  isSent ? 'bg-space-900/60' : 'bg-space-950/40 hover:bg-space-900/40'
                }`}
              >
                {/* Slot & Priority */}
                <div className="w-16 flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] text-slate-500 font-bold">{item.timestamp}</span>
                  <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                    item.urgencyLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    item.urgencyLevel === 'HIGH' ? 'bg-mars-500/20 text-mars-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    P{item.priorityScore}
                  </span>
                </div>

                {/* Name & Category */}
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-white block truncate text-xs">{item.name}</span>
                  <span className="text-[10px] text-slate-500 block truncate">{item.category}</span>
                </div>

                {/* Size */}
                <div className="w-20 text-right shrink-0">
                  <span className="text-slate-300 font-semibold">
                    {item.sizeMB >= 1024 ? `${(item.sizeMB/1024).toFixed(1)} GB` : `${item.sizeMB} MB`}
                  </span>
                </div>

                {/* Status Pill (No wrapping!) */}
                <div className="w-32 text-right shrink-0">
                  {isSent ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Scheduled
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      <HardDrive className="w-3 h-3" /> DTN Outbox
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* NASA DTN Note */}
      <div className="bg-space-950 p-2.5 rounded-lg border border-slate-800/80 text-[10px] font-mono text-slate-400 flex items-center gap-2">
        <HardDrive className="w-3.5 h-3.5 text-mars-500 shrink-0" />
        <span>
          <strong>NASA DTN Store-and-Forward:</strong> Payloads exceeding window bandwidth are stored in non-volatile flash memory for the next pass.
        </span>
      </div>

    </div>
  );
};
