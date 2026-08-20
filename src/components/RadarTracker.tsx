import React, { useState } from 'react';
import { TelemetryData } from '../types/mission';
import { Radio, Globe, Signal, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';

interface RadarTrackerProps {
  telemetry: TelemetryData;
}

export const RadarTracker: React.FC<RadarTrackerProps> = ({ telemetry }) => {
  const [activeSite, setActiveSite] = useState<'GOLDSTONE' | 'MADRID' | 'CANBERRA'>('GOLDSTONE');

  const sites = [
    { id: 'GOLDSTONE', name: 'Goldstone Complex', location: 'California, USA', az: '214°', el: '42°', snr: '+24.5 dB', status: 'ACTIVE LOCK' },
    { id: 'MADRID', name: 'Madrid Complex', location: 'Robledo, Spain', az: '118°', el: '12°', snr: '+18.2 dB', status: 'STANDBY / HANDOVER' },
    { id: 'CANBERRA', name: 'Canberra Complex', location: 'Tidbinbilla, Australia', az: '045°', el: '02°', snr: '-- dB', status: 'BELOW HORIZON' },
  ];

  return (
    <div className="bg-space-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <span className="text-xs font-mono text-earth-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <Radio className="w-4 h-4" /> DSN Ground Station Telemetry
          </span>
          <h3 className="text-lg font-bold font-heading text-white mt-1">
            Deep Space Network 120° Antenna Tracking
          </h3>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span>Ka-Band 32 GHz Carrier Lock</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        
        {/* Radar Dish SVG Animation */}
        <div className="lg:col-span-1 bg-space-950 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="relative w-48 h-48 flex items-center justify-center">
            
            {/* Concentric Radar Rings */}
            <div className="absolute inset-0 rounded-full border border-slate-800" />
            <div className="absolute inset-4 rounded-full border border-slate-800/70" />
            <div className="absolute inset-10 rounded-full border border-slate-800/50" />
            <div className="absolute inset-16 rounded-full border border-earth-500/20" />

            {/* Crosshair Axes */}
            <div className="absolute w-full h-[1px] bg-slate-800" />
            <div className="absolute h-full w-[1px] bg-slate-800" />

            {/* Rotating Radar Beam Line */}
            <div className="absolute inset-0 animate-radar pointer-events-none">
              <div className="w-1/2 h-1/2 bg-gradient-to-br from-earth-400/40 to-transparent origin-bottom-right rounded-tl-full" />
            </div>

            {/* Center Dish Beacon */}
            <div className="w-6 h-6 rounded-full bg-earth-500/30 border border-earth-400 flex items-center justify-center z-10 glow-earth">
              <div className="w-2.5 h-2.5 rounded-full bg-earth-400 animate-ping" />
            </div>

          </div>

          <div className="mt-4 text-center font-mono text-xs">
            <span className="text-earth-400 font-bold block">120° ANTENNA GEOMETRY</span>
            <span className="text-slate-500 text-[10px]">Continuous 24/7 Deep Space Coverage</span>
          </div>
        </div>

        {/* 3 Ground Station Cards */}
        <div className="lg:col-span-2 space-y-3 font-mono">
          {sites.map((site) => {
            const isSelected = activeSite === site.id;
            return (
              <div
                key={site.id}
                onClick={() => setActiveSite(site.id as any)}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 flex items-center justify-between gap-4 ${
                  isSelected
                    ? 'bg-space-950 border-earth-500/50 shadow-lg shadow-earth-500/10'
                    : 'bg-space-950/60 border-slate-800/80 hover:border-slate-700 opacity-80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-earth-500/20 text-earth-400 border border-earth-500/40' : 'bg-space-900 text-slate-500'
                  }`}>
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{site.name}</h4>
                    <span className="text-[10px] text-slate-400">{site.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs">
                  <div className="hidden sm:block text-right">
                    <span className="text-[10px] text-slate-500 block">AZ / EL</span>
                    <span className="text-slate-300 font-bold">{site.az} / {site.el}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">SNR</span>
                    <span className="text-earth-400 font-bold">{site.snr}</span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-1 rounded border ${
                    site.status === 'ACTIVE LOCK' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                    site.status.includes('STANDBY') ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                    'bg-slate-800 text-slate-500 border-slate-700'
                  }`}>
                    {site.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
