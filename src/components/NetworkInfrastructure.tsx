import React from 'react';
import { 
  Network, 
  Radio, 
  Globe, 
  CheckCircle2, 
  Award, 
  ArrowRight, 
  Zap, 
  Database,
  Cpu,
  Monitor
} from 'lucide-react';
import { RadarTracker } from './RadarTracker';
import { TelemetryData } from '../types/mission';

interface NetworkInfrastructureProps {
  telemetry?: TelemetryData;
}

export const NetworkInfrastructure: React.FC<NetworkInfrastructureProps> = ({ telemetry }) => {
  const dummyTelemetry: TelemetryData = telemetry || {
    distanceKm: 225.4,
    oneWayLatencySec: 750,
    oneWayLatencyMin: 12.5,
    roundTripLatencyMin: 25.0,
    bandwidthMbps: 6.0,
    sunAngleDeg: 45,
    isConjunction: false,
    synodicMonth: 7.0,
  };

  return (
    <div className="space-y-6">
      
      {/* Live Radar Dish Tracker */}
      <RadarTracker telemetry={dummyTelemetry} />

      {/* Existing Infrastructure Details */}
      <div className="bg-space-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="border-b border-slate-800/80 pb-4">
          <span className="text-xs font-mono text-earth-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <Network className="w-4 h-4" /> DSN Infrastructure & Link Data Rates
          </span>
          <h3 className="text-lg font-bold font-heading text-white mt-1">
            How Data Moves Between Earth & Mars
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Rovers on Mars relay through orbiters overhead, which transmit to NASA's Deep Space Network (DSN) complexes spaced 120° apart (California, Madrid, Canberra).
          </p>
        </div>

        {/* DSN Link Data Rates (Slide 4 Metrics) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          
          <div className="bg-space-950 p-4 rounded-xl border border-slate-800 space-y-2 hover:border-mars-500/40 transition-colors">
            <div className="flex items-center gap-2 text-mars-500 font-bold">
              <Radio className="w-4 h-4" /> Rover → Orbiter Link
            </div>
            <div className="text-2xl font-bold text-white">Up to 2 Mbps</div>
            <p className="text-slate-400 text-[11px]">
              Surface rovers (Curiosity/Perseverance) relay data overhead to UHF orbiter passes (MRO/MAVEN).
            </p>
          </div>

          <div className="bg-space-950 p-4 rounded-xl border border-slate-800 space-y-2 hover:border-earth-500/40 transition-colors">
            <div className="flex items-center gap-2 text-earth-400 font-bold">
              <Globe className="w-4 h-4" /> Orbiter → DSN Link (Ka-Band)
            </div>
            <div className="text-2xl font-bold text-white">Up to 6 Mbps</div>
            <p className="text-slate-400 text-[11px]">
              Mars Reconnaissance Orbiter (MRO) transmits primary payload data to Earth using Ka-Band frequency.
            </p>
          </div>

          <div className="bg-space-950 p-4 rounded-xl border border-slate-800 space-y-2 hover:border-amber-500/40 transition-colors">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Zap className="w-4 h-4" /> Direct Rover → DSN Fallback
            </div>
            <div className="text-2xl font-bold text-white">0.5 – 32 Kbps</div>
            <p className="text-slate-400 text-[11px]">
              Direct-to-Earth emergency X-band fallback link used only when orbiters are unavailable.
            </p>
          </div>

        </div>

        {/* SYSTEM DESIGN FLOW (Slide 11) */}
        <div className="bg-space-950 p-5 rounded-xl border border-slate-800 space-y-4">
          <h4 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
            System Architecture — How The Pieces Fit Together (Slide 11)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            
            <div className="bg-space-900 p-3.5 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-earth-400">
                <span className="w-5 h-5 rounded-full bg-earth-500/20 flex items-center justify-center text-[10px]">1</span>
                <span>Orbital Engine</span>
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                Planetary position → distance → delay calculation
              </p>
            </div>

            <div className="bg-space-900 p-3.5 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-spacegold-400">
                <span className="w-5 h-5 rounded-full bg-spacegold-500/20 flex items-center justify-center text-[10px]">2</span>
                <span>Comm Simulation</span>
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                Data queue & bandwidth modeling for current window
              </p>
            </div>

            <div className="bg-space-900 p-3.5 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-mars-400">
                <span className="w-5 h-5 rounded-full bg-mars-500/20 flex items-center justify-center text-[10px]">3</span>
                <span>AI Engine</span>
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                Priority scoring, latency prediction, schedule optimization
              </p>
            </div>

            <div className="bg-space-900 p-3.5 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-emerald-400">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">4</span>
                <span>Mission Control</span>
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                Dashboard output & AI recommendation to operators
              </p>
            </div>

          </div>
        </div>

        {/* NASA REAL-WORLD PRECEDENT (Slide 12) */}
        <div className="bg-gradient-to-br from-space-950 via-space-900 to-space-950 border border-slate-800 p-5 rounded-xl space-y-4">
          
          <div>
            <span className="text-xs font-mono text-spacegold-400 uppercase tracking-wider font-semibold">
              Real-World Precedent — NASA DTN Validation
            </span>
            <h4 className="text-base font-bold font-heading text-white mt-0.5">
              NASA Is Already Building This Kind Of System
            </h4>
            <p className="text-xs text-slate-300 font-mono mt-1 leading-relaxed">
              NASA's Delay/Disruption Tolerant Networking (DTN) uses a store-and-forward approach — each node holds data until the next link becomes available, similar to an email outbox — to keep data moving despite long delays and broken links.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
            <div className="bg-space-950 p-4 rounded-xl border border-slate-800/80 text-center hover:border-earth-400/50 transition-colors">
              <div className="text-3xl font-extrabold text-earth-400">34M+</div>
              <div className="text-[11px] text-slate-300 mt-1">
                Bundles delivered by NASA's PACE mission using DTN in 2024
              </div>
            </div>

            <div className="bg-space-950 p-4 rounded-xl border border-slate-800/80 text-center hover:border-spacegold-400/50 transition-colors">
              <div className="text-3xl font-extrabold text-spacegold-400">100%</div>
              <div className="text-[11px] text-slate-300 mt-1">
                Delivery success rate reported for those DTN transmissions
              </div>
            </div>

            <div className="bg-space-950 p-4 rounded-xl border border-slate-800/80 text-center hover:border-mars-500/50 transition-colors">
              <div className="text-3xl font-extrabold text-mars-500">2009</div>
              <div className="text-[11px] text-slate-300 mt-1">
                Year NASA first tested DTN in space, aboard the International Space Station (ISS)
              </div>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-400 italic bg-space-950 p-3 rounded-lg border border-slate-800/80 text-center">
            "Our system applies the same store-and-forward, priority-aware philosophy — at the mission-planning and scheduling layer rather than the raw networking layer."
          </div>

        </div>

      </div>

    </div>
  );
};
