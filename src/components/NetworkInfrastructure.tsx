import React from 'react';
import { 
  Network, 
  Radio, 
  Globe, 
  CheckCircle2, 
  Zap, 
  Database,
  Cpu
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
    <div className="space-y-6 font-mono text-xs">
      
      {/* Live Radar Dish Tracker */}
      <RadarTracker telemetry={dummyTelemetry} />

      {/* DSN Infrastructure */}
      <div className="bg-space-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="border-b border-slate-800/80 pb-4">
          <span className="text-xs font-mono text-earth-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <Network className="w-4 h-4" /> DSN Infrastructure & Link Data Rates
          </span>
          <h3 className="text-lg font-bold font-heading text-white mt-1">
            Deep Space Network (DSN) Communication Links
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Rovers on Mars relay through orbiters overhead, transmitting to NASA's 3 DSN complexes spaced 120° apart (Goldstone USA, Madrid Spain, Canberra Australia).
          </p>
        </div>

        {/* Link Data Rates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          
          <div className="bg-space-950 p-4 rounded-xl border border-slate-800 space-y-2 hover:border-mars-500/40 transition-colors">
            <div className="flex items-center gap-2 text-mars-500 font-bold">
              <Radio className="w-4 h-4" /> Surface Rover → Orbiter Link
            </div>
            <div className="text-2xl font-bold text-white tabular-nums">2.0 Mbps</div>
            <p className="text-slate-400 text-[11px]">
              Surface rovers relay data overhead via UHF band during orbiter passes.
            </p>
          </div>

          <div className="bg-space-950 p-4 rounded-xl border border-slate-800 space-y-2 hover:border-earth-500/40 transition-colors">
            <div className="flex items-center gap-2 text-earth-400 font-bold">
              <Globe className="w-4 h-4" /> Orbiter → DSN Link (Ka-Band)
            </div>
            <div className="text-2xl font-bold text-white tabular-nums">6.0 Mbps</div>
            <p className="text-slate-400 text-[11px]">
              Mars Reconnaissance Orbiter (MRO) transmits primary payload data to Earth.
            </p>
          </div>

          <div className="bg-space-950 p-4 rounded-xl border border-slate-800 space-y-2 hover:border-amber-500/40 transition-colors">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Zap className="w-4 h-4" /> Direct Rover → DSN Fallback
            </div>
            <div className="text-2xl font-bold text-white tabular-nums">32.0 Kbps</div>
            <p className="text-slate-400 text-[11px]">
              Emergency X-band fallback link used only when orbiters are unavailable.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
