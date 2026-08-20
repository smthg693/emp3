import React, { useState } from 'react';
import { TelemetryData } from '../types/mission';
import { 
  Orbit, 
  Sun, 
  Globe, 
  Radio, 
  AlertTriangle, 
  Info,
  Maximize2,
  Compass,
  Zap,
  Sliders
} from 'lucide-react';

interface OrbitalVisualizerProps {
  telemetry: TelemetryData;
  setSynodicMonth: (month: number) => void;
}

export const OrbitalVisualizer: React.FC<OrbitalVisualizerProps> = ({
  telemetry,
  setSynodicMonth
}) => {
  const [activeTab, setActiveTab] = useState<'2d' | '3d'>('2d');

  const synodicMonth = telemetry.synodicMonth;
  const isConjunction = telemetry.isConjunction;

  // Synodic math (0 to 26 months)
  const earthAngleRad = -Math.PI / 2;
  const marsAngleRad = earthAngleRad + ((synodicMonth % 26) / 26.0) * (2 * Math.PI);

  const cx = 150;
  const cy = 150;
  const earthRadius = 60;
  const marsRadius = 110;

  const earthX = cx + earthRadius * Math.cos(earthAngleRad);
  const earthY = cy + earthRadius * Math.sin(earthAngleRad);

  const marsX = cx + marsRadius * Math.cos(marsAngleRad);
  const marsY = cy + marsRadius * Math.sin(marsAngleRad);

  // 3D Isometric Projection Transformation
  const isoRx = 45;
  const isoRy = 22;
  const earthX3d = cx + earthRadius * Math.cos(earthAngleRad);
  const earthY3d = cy + (earthRadius * Math.sin(earthAngleRad) * isoRy) / isoRx;

  const marsX3d = cx + marsRadius * Math.cos(marsAngleRad);
  const marsY3d = cy + (marsRadius * Math.sin(marsAngleRad) * isoRy) / isoRx;

  return (
    <div className="bg-space-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 font-mono">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <Orbit className="w-3.5 h-3.5 text-cyan-400" /> Heliocentric Physics Engine
          </span>
          <h3 className="text-base font-bold font-heading text-white mt-0.5">
            Earth–Mars Heliocentric Orbit & RF Signal Beam Path
          </h3>
        </div>

        {/* 2D / 3D Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-space-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('2d')}
              className={`px-3 py-1 rounded text-[11px] transition-colors ${
                activeTab === '2d' ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2D Orbit
            </button>
            <button
              onClick={() => setActiveTab('3d')}
              className={`px-3 py-1 rounded text-[11px] transition-colors ${
                activeTab === '3d' ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3D Vector
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas + Telemetry Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left Column: Interactive Orbit Map */}
        <div className="lg:col-span-2 bg-space-950 rounded-xl p-4 border border-slate-800/90 flex flex-col items-center justify-center relative min-h-[300px]">
          
          {activeTab === '2d' ? (
            <svg viewBox="0 0 300 300" className="w-full max-w-[340px] h-auto">
              {/* Sun Exclusion Zone (<3.0 degrees) */}
              <circle cx={cx} cy={cy} r="28" fill="rgba(239, 68, 68, 0.08)" stroke="rgba(239, 68, 68, 0.3)" strokeDasharray="3 3" />
              
              {/* Sun Center */}
              <circle cx={cx} cy={cy} r="14" fill="#EAB308" className="animate-pulse" />
              <circle cx={cx} cy={cy} r="18" fill="rgba(234, 179, 8, 0.2)" />

              {/* Earth Orbit */}
              <circle cx={cx} cy={cy} r={earthRadius} fill="none" stroke="#1E293B" strokeWidth="1.5" strokeDasharray="4 4" />
              
              {/* Mars Orbit */}
              <circle cx={cx} cy={cy} r={marsRadius} fill="none" stroke="#1E293B" strokeWidth="1.5" strokeDasharray="4 4" />

              {/* RF Beam Vector */}
              {isConjunction ? (
                // Solar Blackout: Broken Scattered Signal Beam
                <g>
                  <line x1={earthX} y1={earthY} x2={cx} y2={cy} stroke="#EF4444" strokeWidth="2" strokeDasharray="2 4" className="animate-pulse" />
                  <line x1={cx} y1={cy} x2={marsX} y2={marsY} stroke="#EF4444" strokeWidth="2" strokeDasharray="2 4" className="animate-pulse" />
                </g>
              ) : (
                // Normal Signal Vector: Phosphor Cyan Carrier Link
                <g>
                  <line x1={earthX} y1={earthY} x2={marsX} y2={marsY} stroke="#00E5FF" strokeWidth="2" strokeOpacity="0.8" />
                  <circle cx={(earthX + marsX) / 2} cy={(earthY + marsY) / 2} r="3" fill="#00E5FF" className="animate-ping" />
                </g>
              )}

              {/* Earth Planet */}
              <circle cx={earthX} cy={earthY} r="7" fill="#38BDF8" />
              <text x={earthX + 10} y={earthY + 4} fill="#94A3B8" fontSize="9" className="font-mono font-bold">Earth (1.0 AU)</text>

              {/* Mars Planet */}
              <circle cx={marsX} cy={marsY} r="6" fill="#EF4444" />
              <text x={marsX + 10} y={marsY + 4} fill="#FCA5A5" fontSize="9" className="font-mono font-bold">Mars (1.524 AU)</text>
            </svg>
          ) : (
            <svg viewBox="0 0 300 300" className="w-full max-w-[340px] h-auto">
              {/* 3D Isometric View */}
              <ellipse cx={cx} cy={cy} rx="28" ry="14" fill="rgba(239, 68, 68, 0.1)" stroke="rgba(239, 68, 68, 0.4)" strokeDasharray="3 3" />
              <circle cx={cx} cy={cy} r="14" fill="#EAB308" className="animate-pulse" />

              {/* Tilted Earth Orbit */}
              <ellipse cx={cx} cy={cy} rx={earthRadius} ry={(earthRadius * isoRy) / isoRx} fill="none" stroke="#00E5FF" strokeWidth="1.5" strokeDasharray="4 4" strokeOpacity="0.6" />

              {/* Tilted Mars Orbit */}
              <ellipse cx={cx} cy={cy} rx={marsRadius} ry={(marsRadius * isoRy) / isoRx} fill="none" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="4 4" strokeOpacity="0.6" />

              {/* 3D RF Vector Line */}
              <line x1={earthX3d} y1={earthY3d} x2={marsX3d} y2={marsY3d} stroke={isConjunction ? '#EF4444' : '#00E5FF'} strokeWidth="2.5" />
              <circle cx={(earthX3d + marsX3d) / 2} cy={(earthY3d + marsY3d) / 2} r="3.5" fill={isConjunction ? '#EF4444' : '#00E5FF'} className="animate-ping" />

              {/* 3D Earth Node */}
              <circle cx={earthX3d} cy={earthY3d} r="7" fill="#38BDF8" />
              <text x={earthX3d + 10} y={earthY3d + 4} fill="#94A3B8" fontSize="9" className="font-mono font-bold">Earth 3D Vector</text>

              {/* 3D Mars Node */}
              <circle cx={marsX3d} cy={marsY3d} r="6" fill="#EF4444" />
              <text x={marsX3d + 10} y={marsY3d + 4} fill="#FCA5A5" fontSize="9" className="font-mono font-bold">Mars 3D Vector</text>
            </svg>
          )}

          {/* Map Overlay Badge */}
          <div className="absolute top-3 left-3 bg-space-900/90 border border-slate-800 px-2.5 py-1 rounded-lg text-[10px] text-slate-400">
            <span className="text-cyan-400 font-bold">Synodic Month:</span> <span className="tabular-nums text-white font-bold">{synodicMonth.toFixed(1)} / 26.0</span>
          </div>
        </div>

        {/* Right Column: Synodic Slider & Distance Metrics */}
        <div className="space-y-4 bg-space-950 p-4 rounded-xl border border-slate-800/90 flex flex-col justify-between text-xs">
          
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Synodic Orbit Timeline</span>
              <span className="text-xs font-bold text-cyan-400 tabular-nums">Month {synodicMonth.toFixed(1)}</span>
            </div>

            {/* Synodic Slider */}
            <div className="space-y-1.5">
              <input
                type="range"
                min="0"
                max="26"
                step="0.1"
                value={synodicMonth}
                onChange={(e) => setSynodicMonth(parseFloat(e.target.value))}
                className="w-full h-2 bg-space-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>M0 (Opposition ~54M km)</span>
                <span>M13 (Conjunction ~401M km)</span>
                <span>M26</span>
              </div>
            </div>
          </div>

          {/* Physics Calculations Card */}
          <div className="bg-space-900 p-3 rounded-lg border border-slate-800 space-y-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400 uppercase">Calculated Distance:</span>
              <span className="text-cyan-400 font-bold tabular-nums">{telemetry.distanceKm.toFixed(1)} M km</span>
            </div>

            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400 uppercase">1-Way Light Delay:</span>
              <span className="text-mars-400 font-bold tabular-nums">{telemetry.oneWayLatencyMin.toFixed(1)} min ({telemetry.oneWayLatencySec.toFixed(0)} s)</span>
            </div>

            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400 uppercase">Round-Trip Time (RTT):</span>
              <span className="text-spacegold-400 font-bold tabular-nums">{telemetry.roundTripLatencyMin.toFixed(1)} min</span>
            </div>

            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400 uppercase">Sun-Earth-Mars Angle:</span>
              <span className={`font-bold tabular-nums ${isConjunction ? 'text-red-400' : 'text-emerald-400'}`}>
                {telemetry.sunAngleDeg.toFixed(1)}°
              </span>
            </div>
          </div>

          {/* NASA Technical Physics Note */}
          <div className="text-[10px] text-slate-400 italic bg-space-900/60 p-2.5 rounded-lg border border-slate-800/80">
            <strong>Kepler Physics Model:</strong> Distance calculated via heliocentric polar coordinates ($d^2 = r_E^2 + r_M^2 - 2 r_E r_M \cos\Delta\theta$).
          </div>

        </div>

      </div>

    </div>
  );
};
