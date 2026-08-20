import React, { useState } from 'react';
import { TelemetryData } from '../types/mission';
import { TrendingUp, Sparkles, Calendar, Info } from 'lucide-react';

interface LatencyPredictionChartProps {
  telemetry: TelemetryData;
}

const synodicCyclePoints = [
  { month: 'M0', monthNum: 0, delayMin: 3.0, distanceM: 54.6, x: 20, y: 190, label: 'Closest (3.0m)' },
  { month: 'M2', monthNum: 2, delayMin: 5.2, distanceM: 93.6, x: 60, y: 170, label: '5.2 min' },
  { month: 'M4', monthNum: 4, delayMin: 9.1, distanceM: 163.8, x: 100, y: 140, label: '9.1 min' },
  { month: 'M8', monthNum: 8, delayMin: 16.0, distanceM: 288.0, x: 180, y: 80, label: '16.0 min' },
  { month: 'M12', monthNum: 12, delayMin: 22.0, distanceM: 396.0, x: 260, y: 30, label: '22.0 min' },
  { month: 'M13', monthNum: 13, delayMin: 22.3, distanceM: 401.0, x: 280, y: 25, isConjunction: true, label: 'Peak / Blackout (22.3m)' },
  { month: 'M16', monthNum: 16, delayMin: 18.0, distanceM: 324.0, x: 340, y: 65, label: '18.0 min' },
  { month: 'M20', monthNum: 20, delayMin: 11.0, distanceM: 198.0, x: 420, y: 125, label: '11.0 min' },
  { month: 'M24', monthNum: 24, delayMin: 5.1, distanceM: 91.8, x: 500, y: 172, label: '5.1 min' },
  { month: 'M26', monthNum: 26, delayMin: 3.0, distanceM: 54.6, x: 540, y: 190, label: 'Next Closest (3.0m)' },
];

export const LatencyPredictionChart: React.FC<LatencyPredictionChartProps> = ({ telemetry }) => {
  const [hoveredPoint, setHoveredPoint] = useState<typeof synodicCyclePoints[0] | null>(null);

  // SVG Path generator
  const areaPath = `M 20 190 L 60 170 L 100 140 L 180 80 L 260 30 L 280 25 L 340 65 L 420 125 L 500 172 L 540 190 L 540 210 L 20 210 Z`;
  const linePath = `M 20 190 L 60 170 L 100 140 L 180 80 L 260 30 L 280 25 L 340 65 L 420 125 L 500 172 L 540 190`;

  return (
    <div className="bg-space-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <span className="text-xs font-mono text-earth-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4" /> Orbital Latency Analytics
          </span>
          <h3 className="text-lg font-bold font-heading text-white mt-1">
            26-Month Synodic Latency Forecast Curve
          </h3>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-slate-400 bg-space-950 px-3 py-1.5 rounded-lg border border-slate-800 self-start sm:self-auto">
          <Calendar className="w-3.5 h-3.5 text-mars-500" />
          <span>Full Synodic Period: ~780 Days</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Curve Chart */}
        <div className="lg:col-span-2 bg-space-950 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>One-Way Delay Profile (Minutes)</span>
            <span className="text-earth-400 font-semibold">Min: 3.0m (M0/M26) | Peak: 22.3m (M13)</span>
          </div>

          {/* SVG Latency Chart */}
          <div className="w-full relative py-2">
            <svg viewBox="0 0 560 230" className="w-full h-auto overflow-visible">
              <defs>
                <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EA580C" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#EA580C" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Background Grid Lines */}
              <line x1="20" y1="30" x2="540" y2="30" stroke="#1E293B" strokeDasharray="3 3" />
              <line x1="20" y1="80" x2="540" y2="80" stroke="#1E293B" strokeDasharray="3 3" />
              <line x1="20" y1="130" x2="540" y2="130" stroke="#1E293B" strokeDasharray="3 3" />
              <line x1="20" y1="180" x2="540" y2="180" stroke="#1E293B" strokeDasharray="3 3" />

              {/* Y-Axis Labels */}
              <text x="5" y="34" fill="#64748B" fontSize="9" fontFamily="JetBrains Mono">22m</text>
              <text x="5" y="84" fill="#64748B" fontSize="9" fontFamily="JetBrains Mono">16m</text>
              <text x="5" y="134" fill="#64748B" fontSize="9" fontFamily="JetBrains Mono">10m</text>
              <text x="5" y="184" fill="#64748B" fontSize="9" fontFamily="JetBrains Mono">3m</text>

              {/* Solar Conjunction Vertical Marker Line (M13) */}
              <line x1="280" y1="10" x2="280" y2="210" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="4 4" />
              <text x="285" y="20" fill="#EF4444" fontSize="10" fontWeight="bold" fontFamily="JetBrains Mono">Solar Conjunction (~13d Blackout)</text>

              {/* Area Gradient Fill */}
              <path d={areaPath} fill="url(#areaGlow)" />

              {/* Latency Curve */}
              <path d={linePath} fill="none" stroke="#EA580C" strokeWidth="3" strokeLinecap="round" />

              {/* Data Nodes */}
              {synodicCyclePoints.map((pt) => {
                const isCurrentMonth = Math.abs(telemetry.synodicMonth - pt.monthNum) < 1.2;

                return (
                  <g key={pt.month} onMouseEnter={() => setHoveredPoint(pt)} onMouseLeave={() => setHoveredPoint(null)} className="cursor-pointer">
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isCurrentMonth ? 7 : 4}
                      fill={pt.isConjunction ? '#EF4444' : isCurrentMonth ? '#F59E0B' : '#EA580C'}
                      stroke="#FFFFFF"
                      strokeWidth={isCurrentMonth ? 2 : 1}
                      className="transition-all duration-300"
                    />
                    <text x={pt.x - 8} y="224" fill="#94A3B8" fontSize="10" fontFamily="JetBrains Mono">{pt.month}</text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Interactive Tooltip Card */}
          {hoveredPoint ? (
            <div className="bg-space-900 border border-slate-700 p-2.5 rounded-lg text-xs font-mono flex items-center justify-between text-slate-200 mt-2 shadow-lg">
              <span>Position: <strong>{hoveredPoint.month}</strong></span>
              <span>Distance: <strong>{hoveredPoint.distanceM}M km</strong></span>
              <span className="text-mars-400 font-bold">Delay: {hoveredPoint.delayMin} min</span>
            </div>
          ) : (
            <div className="text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-2 mt-2 flex justify-between">
              <span>Hover nodes to view orbital position metrics</span>
              <span className="text-spacegold-400">Current: M{telemetry.synodicMonth.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* AI Mission Guidance & Recommendation Box */}
        <div className="bg-space-950 p-5 rounded-xl border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-spacegold-400 font-semibold mb-2">
              <Sparkles className="w-4 h-4" /> AI Orbital Advisor Output
            </div>
            <h4 className="text-base font-bold text-white font-heading">
              Forward-Looking Mission Guidance
            </h4>
          </div>

          <div className="bg-space-900/90 border border-slate-800 p-3.5 rounded-xl space-y-2 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Current One-Way Latency:</span>
              <span className="text-mars-500 font-bold text-sm">{telemetry.oneWayLatencyMin.toFixed(1)} min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Round-Trip (RTT):</span>
              <span className="text-spacegold-400 font-bold text-sm">{telemetry.roundTripLatencyMin.toFixed(1)} min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Trend Direction:</span>
              <span className={`font-semibold ${telemetry.synodicMonth <= 13 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {telemetry.synodicMonth <= 13 ? '↑ Increasing Delay (Approaching Conjunction)' : '↓ Decreasing Delay (Approaching Opposition)'}
              </span>
            </div>
          </div>

          <div className="bg-slate-900/60 border-l-4 border-mars-500 p-3 rounded-r-xl text-xs text-slate-300 italic font-mono leading-relaxed">
            "{telemetry.isConjunction 
              ? 'Solar conjunction blackout in effect. Pre-loaded autonomous safety rules active on spacecraft.'
              : telemetry.synodicMonth > 10 && telemetry.synodicMonth < 16
              ? 'High latency orbit phase (~20-22 min). Pre-load flight commands prior to solar conjunction blackout.'
              : 'Low to moderate latency orbit phase (~3-12 min). Prioritize high-resolution imaging and scientific data transmission.'}"
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <Info className="w-3.5 h-3.5 text-earth-400 shrink-0" />
            <span>AI model converts physical orbital delay into actionable mission plans.</span>
          </div>

        </div>

      </div>

    </div>
  );
};
