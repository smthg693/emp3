import React from 'react';
import { TelemetryData } from '../types/mission';
import { 
  Radio, 
  Orbit, 
  ShieldAlert, 
  Activity, 
  Cpu, 
  Network, 
  Sliders, 
  AlertTriangle,
  Clock,
  BookOpen,
  SignalHigh,
  Sparkles
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
  setSimulationMode,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Overview', icon: Activity },
    { id: 'orbital', label: 'Orbital AI', icon: Orbit },
    { id: 'scheduler', label: 'Queue Optimizer', icon: Sliders },
    { id: 'autonomy', label: 'Autonomy', icon: ShieldAlert },
    { id: 'advisor', label: 'AI Advisor', icon: Cpu },
    { id: 'dtn', label: 'DSN / DTN', icon: Network },
    { id: 'research', label: 'Research', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 bg-space-950/90 backdrop-blur-xl border-b border-slate-800/80 shadow-md">
      {/* Top Banner for Conjunction or Emergency */}
      {telemetry.isConjunction && (
        <div className="bg-amber-600/90 text-white text-[11px] font-mono py-1 px-4 flex items-center justify-center gap-2 animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-200" />
          <span className="font-bold">SOLAR CONJUNCTION:</span>
          <span>Sun-Earth-Mars Alignment &lt; 3° — Radio Blackout ~13 Days. Autonomous DTN Active.</span>
        </div>
      )}

      {simulationMode === 'EMERGENCY' && !telemetry.isConjunction && (
        <div className="bg-red-600/90 text-white text-[11px] font-mono py-1 px-4 flex items-center justify-center gap-2 animate-pulse">
          <ShieldAlert className="w-3.5 h-3.5 text-red-200" />
          <span className="font-bold">SIMULATION MODE:</span>
          <span>Subsystem Anomaly Active. Round-trip delay: {telemetry.roundTripLatencyMin.toFixed(1)} min. Executing safety autonomy.</span>
        </div>
      )}

      {/* Natural, Sleek Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          
          {/* Natural Logo & Branding */}
          <div className="flex items-center gap-3">
            {/* Sleek Orbit Badge Icon */}
            <div className="w-9 h-9 rounded-xl bg-space-900 border border-slate-800 flex items-center justify-center shadow-inner group hover:border-mars-500/50 transition-colors">
              <Radio className="w-4 h-4 text-mars-500 group-hover:scale-110 transition-transform" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white font-heading tracking-tight">
                  Earth–Mars Mission Control
                </h1>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-mars-500/10 text-mars-400 border border-mars-500/20 font-semibold">
                  Kepler's Crew
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                Deep-Space AI System <span className="text-slate-600">•</span> v2.4
              </p>
            </div>
          </div>

          {/* Compact Telemetry Widgets */}
          <div className="flex items-center gap-2 sm:gap-3 font-mono text-[11px]">
            <div className="bg-space-900/90 border border-slate-800/80 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
              <span className="text-slate-500 uppercase text-[9px]">Dist</span>
              <span className="text-earth-400 font-bold">{telemetry.distanceKm.toFixed(1)}M km</span>
            </div>

            <div className="bg-space-900/90 border border-slate-800/80 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
              <Clock className="w-3 h-3 text-mars-500" />
              <span className="text-mars-500 font-bold">{telemetry.oneWayLatencyMin.toFixed(1)}m</span>
            </div>

            <div className="bg-space-900/90 border border-slate-800/80 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
              <span className="text-slate-500 uppercase text-[9px]">RTT</span>
              <span className="text-spacegold-400 font-bold">{telemetry.roundTripLatencyMin.toFixed(1)}m</span>
            </div>

            <div className="bg-space-900/90 border border-slate-800/80 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
              <SignalHigh className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-bold">{telemetry.isConjunction ? '0' : telemetry.bandwidthMbps} Mbps</span>
            </div>

            {/* Mode Toggles */}
            <div className="flex items-center gap-1 bg-space-900 p-0.5 rounded-lg border border-slate-800/80">
              <button
                onClick={() => setSimulationMode('NORMAL')}
                className={`px-2.5 py-0.5 rounded text-[10px] font-mono transition-all ${
                  simulationMode === 'NORMAL' ? 'bg-slate-700 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Normal
              </button>
              <button
                onClick={() => setSimulationMode('CONJUNCTION')}
                className={`px-2.5 py-0.5 rounded text-[10px] font-mono transition-all ${
                  simulationMode === 'CONJUNCTION' ? 'bg-amber-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-amber-300'
                }`}
              >
                Conjunction
              </button>
              <button
                onClick={() => setSimulationMode('EMERGENCY')}
                className={`px-2.5 py-0.5 rounded text-[10px] font-mono transition-all ${
                  simulationMode === 'EMERGENCY' ? 'bg-red-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-red-300'
                }`}
              >
                Emergency
              </button>
            </div>
          </div>

        </div>

        {/* Tab Bar */}
        <nav className="flex items-center gap-1 mt-2.5 overflow-x-auto pb-0.5 scrollbar-none border-t border-slate-800/60 pt-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-white border border-slate-700/80 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-space-900/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-mars-500' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

      </div>
    </header>
  );
};
