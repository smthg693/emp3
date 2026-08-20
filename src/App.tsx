import React, { useState, useEffect } from 'react';
import { missionStateService } from './services/missionStateService';
import { TelemetryData } from './types/mission';
import { Header } from './components/Header';
import { OrbitalVisualizer } from './components/OrbitalVisualizer';
import { LatencyPredictionChart } from './components/LatencyPredictionChart';
import { DataScheduler } from './components/DataScheduler';
import { AutonomousEmergencyHandler } from './components/AutonomousEmergencyHandler';
import { MissionAdvisor } from './components/MissionAdvisor';
import { NetworkInfrastructure } from './components/NetworkInfrastructure';
import { ResearchCenter } from './components/ResearchCenter';
import { ConsoleLogger } from './components/ConsoleLogger';
import { BenchmarkPanel } from './components/BenchmarkPanel';
import { Footer } from './components/Footer';

import { Sparkles, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

export default function App() {
  const [missionState, setMissionState] = useState(missionStateService.getState());
  const [synodicMonth, setSynodicMonth] = useState<number>(7.0);
  const [simulationMode, setSimulationModeState] = useState<'NORMAL' | 'CONJUNCTION' | 'EMERGENCY'>('NORMAL');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showConsole, setShowConsole] = useState<boolean>(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setMissionState(missionStateService.getState());
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleSetSimulationMode = (mode: 'NORMAL' | 'CONJUNCTION' | 'EMERGENCY') => {
    setSimulationModeState(mode);
    missionStateService.setManualMode(mode);
    if (mode === 'CONJUNCTION') {
      setSynodicMonth(13.0);
    } else if (mode === 'NORMAL') {
      setSynodicMonth(7.0);
    }
  };

  const handleSetSynodicMonth = (month: number) => {
    setSynodicMonth(month);
    missionStateService.setSynodicMonth(month);
  };

  const telemetry: TelemetryData = {
    distanceKm: missionState.orbital.distanceKm,
    oneWayLatencySec: missionState.orbital.oneWayLatencyMin * 60,
    oneWayLatencyMin: missionState.orbital.oneWayLatencyMin,
    roundTripLatencyMin: missionState.orbital.roundTripLatencyMin,
    bandwidthMbps: missionState.orbital.communicationAvailable ? 6.0 : 0,
    sunAngleDeg: missionState.orbital.sunAngleDeg,
    isConjunction: !missionState.orbital.communicationAvailable,
    synodicMonth: missionState.synodicMonth,
  };

  return (
    <div className="min-h-screen bg-stars bg-space-950 text-slate-100 flex flex-col justify-between selection:bg-mars-500 selection:text-white">
      
      {/* Sleek Header & Telemetry Bar */}
      <Header
        telemetry={telemetry}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        simulationMode={simulationMode}
        setSimulationMode={handleSetSimulationMode}
      />

      {/* Main Streamlined Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 w-full space-y-6 flex-1">
        
        {/* Tab 1: OVERVIEW DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 transition-all duration-300">
            
            {/* Compact Mission Hero Banner */}
            <div className="bg-gradient-to-r from-space-900/90 via-space-850/90 to-space-900/90 border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-lg relative overflow-hidden backdrop-blur-md">
              <div className="relative z-10 max-w-3xl space-y-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-mars-500/10 border border-mars-500/30 text-mars-400 text-[11px] font-mono font-bold">
                  <Sparkles className="w-3 h-3" /> Kepler's Crew • Deep Space AI Engine
                </div>
                <h2 className="text-xl sm:text-3xl font-extrabold font-heading text-white tracking-tight leading-tight">
                  Reducing Deep-Space Communication Delay
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  An intelligent scheduling and autonomous decision support system for the Earth–Mars link handling 3 to 22 minute signal latency and 13-day solar blackout periods.
                </p>
                <div className="flex flex-wrap gap-3 pt-1 font-mono text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Heliocentric Physics</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 0/1 DP Knapsack</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Safety Policy Engine</span>
                </div>
              </div>
            </div>

            {/* Benchmark Metrics Panel */}
            <BenchmarkPanel state={missionState} />

            {/* Orbit Map Visualizer */}
            <OrbitalVisualizer telemetry={telemetry} setSynodicMonth={handleSetSynodicMonth} />

            {/* Feature Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <DataScheduler telemetry={telemetry} />
              <AutonomousEmergencyHandler telemetry={telemetry} />
            </div>

            <MissionAdvisor telemetry={telemetry} />
            <ResearchCenter />

          </div>
        )}

        {/* Tab 2: ORBITAL & LATENCY AI */}
        {activeTab === 'orbital' && (
          <div className="space-y-6 transition-all duration-300">
            <OrbitalVisualizer telemetry={telemetry} setSynodicMonth={handleSetSynodicMonth} />
            <LatencyPredictionChart telemetry={telemetry} />
          </div>
        )}

        {/* Tab 3: DATA SCHEDULER */}
        {activeTab === 'scheduler' && (
          <div className="space-y-6 transition-all duration-300">
            <DataScheduler telemetry={telemetry} />
          </div>
        )}

        {/* Tab 4: AUTONOMOUS EMERGENCY */}
        {activeTab === 'autonomy' && (
          <div className="space-y-6 transition-all duration-300">
            <AutonomousEmergencyHandler telemetry={telemetry} />
          </div>
        )}

        {/* Tab 5: AI ADVISOR & ANALYTICS */}
        {activeTab === 'advisor' && (
          <div className="space-y-6 transition-all duration-300">
            <MissionAdvisor telemetry={telemetry} />
            <LatencyPredictionChart telemetry={telemetry} />
          </div>
        )}

        {/* Tab 6: DSN & DTN ARCHITECTURE */}
        {activeTab === 'dtn' && (
          <div className="space-y-6 transition-all duration-300">
            <NetworkInfrastructure telemetry={telemetry} />
          </div>
        )}

        {/* Tab 7: SCIENTIFIC RESEARCH */}
        {activeTab === 'research' && (
          <div className="space-y-6 transition-all duration-300">
            <ResearchCenter />
          </div>
        )}

        {/* Streamlined Collapsible Telemetry Console */}
        <div className="space-y-2">
          <button
            onClick={() => setShowConsole(!showConsole)}
            className="w-full flex items-center justify-between px-4 py-2 rounded-xl bg-space-900 border border-slate-800/80 text-slate-400 hover:text-slate-200 text-xs font-mono transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live Telemetry Console Stream
            </span>
            {showConsole ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showConsole && <ConsoleLogger telemetry={telemetry} />}
        </div>

      </main>

      <Footer />

    </div>
  );
}
