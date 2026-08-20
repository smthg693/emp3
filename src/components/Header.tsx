import React from 'react';
import { TelemetryData } from '../types/mission';
import { missionStateService } from '../services/missionStateService';
import { 
  Radio, 
  Orbit, 
  Sliders, 
  ShieldAlert, 
  Brain, 
  Network, 
  AlertTriangle,
  Clock,
  BookOpen,
  SignalHigh,
  Zap,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface HeaderProps {
  telemetry: TelemetryData;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  simulationMode: 'NORMAL' | 'CONJUNCTION' | 'EMERGENCY';
  setSimulationMode: (mode: 'NORMAL' | 'CONJUNCTION' | 'EMERGENCY') => void;
}

export const Header: React.FC<HeaderProps> = ({
  telemetry,
  activeTab,
  setActiveTab,
  simulationMode,
  setSimulationMode
}) => {
  const state = missionStateService.getState();
  const opState = state.spacecraftOperationalState;

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: Orbit },
    { id: 'orbital', label: 'Orbital Physics', icon: Radio },
    { id: 'scheduler', label: 'Data Scheduler', icon: Sliders },
    { id: 'autonomy', label: 'Emergency Autonomy', icon: ShieldAlert },
    { id: 'advisor', label: 'TF.js Advisor', icon: Brain },
    { id: 'dtn', label: 'DSN / DTN Architecture', icon: Network },
    { id: 'research', label: 'Research', icon: BookOpen },
  ];

  return (
    <header className="bg-space-900/95 border-b border-slate-800/90 backdrop-blur-md sticky top-0 z-50">
      
      {/* Top Mission Critical Telemetry Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 border-b border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-mars-500 to-orange-600 flex items-center justify-center shadow-lg shadow-mars-500/20">
            <Orbit className="w-5 h-5 text-white animate-spin-slow" />
          </div>
          <div>
            <span className="font-bold text-white tracking-wider uppercase font-heading text-sm block leading-none">
              KEPLER'S CREW
            </span>
            <span className="text-[10px] text-slate-400 font-mono tracking-tight">
              Earth–Mars Deep Space Mission Control
            </span>
          </div>
        </div>

        {/* Global Operational State Badge */}
        <div className="flex items-center gap-2 bg-space-950 px-3 py-1 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Operational State:</span>
          <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded border ${
            opState === 'NOMINAL' || opState === 'STABILIZED'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : opState === 'THERMAL_MITIGATION'
              ? 'bg-mars-500/20 text-mars-400 border-mars-500/40 animate-pulse'
              : opState === 'POWER_CONSERVATION'
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse'
              : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40 animate-pulse'
          }`}>
            {opState}
          </span>
        </div>

        {/* Live Physics Telemetry Badges */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono">
          
          {/* Distance */}
          <div className="flex items-center gap-1.5 bg-space-950 px-2.5 py-1 rounded-lg border border-slate-800">
            <span className="text-slate-500 uppercase">Distance:</span>
            <span className="text-cyan-400 font-bold tabular-nums">
              {telemetry.distanceKm.toFixed(1)} M km
            </span>
            <span className="text-[9px] text-slate-500">({(telemetry.distanceKm / 149.6).toFixed(2)} AU)</span>
          </div>

          {/* Latency */}
          <div className="flex items-center gap-1.5 bg-space-950 px-2.5 py-1 rounded-lg border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-mars-500" />
            <span className="text-slate-500 uppercase">Delay (1-Way / RTT):</span>
            <span className="text-mars-400 font-bold tabular-nums">
              +{telemetry.oneWayLatencyMin.toFixed(1)}m / {telemetry.roundTripLatencyMin.toFixed(1)}m
            </span>
          </div>

          {/* Link / Conjunction Status */}
          <div className="flex items-center gap-1.5 bg-space-950 px-2.5 py-1 rounded-lg border border-slate-800">
            <SignalHigh className={`w-3.5 h-3.5 ${telemetry.isConjunction ? 'text-red-500 animate-ping' : 'text-emerald-400'}`} />
            <span className="text-slate-500 uppercase">Link:</span>
            <span className={`font-bold ${telemetry.isConjunction ? 'text-red-400' : 'text-emerald-400'}`}>
              {telemetry.isConjunction ? 'BLACKOUT (<3.0°)' : 'NORMAL (6 Mbps)'}
            </span>
          </div>

        </div>

        {/* Mode Selector & 1-Click Blackout Demo */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-space-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setSimulationMode('NORMAL')}
              className={`px-2.5 py-0.5 rounded text-[10px] font-mono transition-all ${
                simulationMode === 'NORMAL' ? 'bg-emerald-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Nominal
            </button>
            <button
              onClick={() => setSimulationMode('CONJUNCTION')}
              className={`px-2.5 py-0.5 rounded text-[10px] font-mono transition-all ${
                simulationMode === 'CONJUNCTION' ? 'bg-amber-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              Conjunction
            </button>
          </div>

          <button
            onClick={() => missionStateService.startBlackoutDemo()}
            className="px-3 py-1 rounded-lg text-[11px] font-mono bg-gradient-to-r from-mars-500 to-amber-600 text-white font-bold shadow-md hover:from-mars-600 hover:to-amber-700 flex items-center gap-1.5 transition-transform active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 text-amber-200" /> Blackout Demo
          </button>
        </div>

      </div>

      {/* Primary Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all shrink-0 ${
                  isActive
                    ? 'bg-space-950 text-mars-400 font-bold border border-mars-500/30 shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-space-950/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-mars-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

    </header>
  );
};
