import React from 'react';
import { TelemetryData } from '../types/mission';
import { LineChart, Clock, Zap, AlertTriangle, ShieldCheck } from 'lucide-react';
import { calculateEarthMarsDistance, calculateLightTimeDelay } from '../services/orbitalPhysics';

interface LatencyPredictionChartProps {
  telemetry: TelemetryData;
}

export const LatencyPredictionChart: React.FC<LatencyPredictionChartProps> = ({ telemetry }) => {
  const currentMonth = telemetry.synodicMonth;

  // Generate 27 data points across the 26-month synodic cycle
  const points: { month: number; latencyMin: number }[] = [];
  for (let m = 0; m <= 26; m += 1) {
    const { distanceKm } = calculateEarthMarsDistance(m);
    const { oneWayMin } = calculateLightTimeDelay(distanceKm);
    points.push({ month: m, latencyMin: parseFloat(oneWayMin.toFixed(1)) });
  }

  // SVG Chart Geometry
  const width = 600;
  const height = 180;
  const padding = 30;

  const minLatency = 3.0;
  const maxLatency = 23.0;

  const getX = (m: number) => padding + (m / 26.0) * (width - 2 * padding);
  const getY = (lat: number) => height - padding - ((lat - minLatency) / (maxLatency - minLatency)) * (height - 2 * padding);

  const pathD = points.reduce((acc, pt, idx) => {
    const x = getX(pt.month);
    const y = getY(pt.latencyMin);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const currentX = getX(currentMonth);
  const currentY = getY(telemetry.oneWayLatencyMin);

  return (
    <div className="bg-space-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 font-mono text-xs">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-mars-400 font-bold">
          <LineChart className="w-4 h-4" />
          <span className="uppercase tracking-wider">26-Month Synodic Signal Latency Forecast</span>
        </div>
        <div className="text-[10px] text-slate-400 flex items-center gap-2">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Solar Blackout (Month ~13)</span>
        </div>
      </div>

      {/* SVG Latency Curve */}
      <div className="bg-space-950 p-4 rounded-xl border border-slate-800/90 overflow-hidden relative">
        
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          {/* Grid lines */}
          <line x1={padding} y1={getY(5)} x2={width - padding} y2={getY(5)} stroke="#1E293B" strokeDasharray="3 3" />
          <line x1={padding} y1={getY(10)} x2={width - padding} y2={getY(10)} stroke="#1E293B" strokeDasharray="3 3" />
          <line x1={padding} y1={getY(15)} x2={width - padding} y2={getY(15)} stroke="#1E293B" strokeDasharray="3 3" />
          <line x1={padding} y1={getY(20)} x2={width - padding} y2={getY(20)} stroke="#1E293B" strokeDasharray="3 3" />

          {/* Blackout Window Zone */}
          <rect
            x={getX(12.2)}
            y={padding}
            width={getX(13.8) - getX(12.2)}
            height={height - 2 * padding}
            fill="rgba(239, 68, 68, 0.12)"
            stroke="rgba(239, 68, 68, 0.3)"
            strokeDasharray="2 2"
          />

          {/* Latency Curve */}
          <path d={pathD} fill="none" stroke="#FF3D00" strokeWidth="2.5" />

          {/* Current Month Active Indicator */}
          <line x1={currentX} y1={padding} x2={currentX} y2={height - padding} stroke="#00E5FF" strokeWidth="1.5" strokeDasharray="2 2" />
          <circle cx={currentX} cy={currentY} r="5" fill="#00E5FF" className="animate-ping" />
          <circle cx={currentX} cy={currentY} r="4" fill="#00E5FF" />

          {/* X Axis Labels */}
          <text x={getX(0)} y={height - 8} fill="#64748B" fontSize="9">M0</text>
          <text x={getX(6.5)} y={height - 8} fill="#64748B" fontSize="9">M6.5</text>
          <text x={getX(13)} y={height - 8} fill="#EF4444" fontSize="9" fontWeight="bold">M13 (Conjunction)</text>
          <text x={getX(19.5)} y={height - 8} fill="#64748B" fontSize="9">M19.5</text>
          <text x={getX(26)} y={height - 8} fill="#64748B" fontSize="9">M26</text>

          {/* Y Axis Labels */}
          <text x={5} y={getY(5) + 3} fill="#64748B" fontSize="8">5m</text>
          <text x={5} y={getY(12.5) + 3} fill="#64748B" fontSize="8">12.5m</text>
          <text x={5} y={getY(20) + 3} fill="#64748B" fontSize="8">20m</text>
        </svg>

        {/* Current Pin Floating Readout */}
        <div className="mt-3 flex items-center justify-between text-[11px] bg-space-900 p-2.5 rounded-lg border border-slate-800">
          <span className="text-slate-400">Current Position (Month {currentMonth.toFixed(1)}):</span>
          <span className="text-cyan-400 font-bold tabular-nums">
            1-Way: {telemetry.oneWayLatencyMin.toFixed(1)} min | RTT: {telemetry.roundTripLatencyMin.toFixed(1)} min
          </span>
        </div>

      </div>

    </div>
  );
};
