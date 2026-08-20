import React, { useState, useEffect } from 'react';
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
  Sliders,
  Play,
  Pause,
  RotateCcw,
  Sparkles
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
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [orbitSpeed, setOrbitSpeed] = useState<number>(1); // 1x, 2x, 4x

  const synodicMonth = telemetry.synodicMonth;
  const isConjunction = telemetry.isConjunction;

  // Auto-orbit animation loop
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = Math.max(40, Math.floor(120 / orbitSpeed));
    const interval = setInterval(() => {
      setSynodicMonth(parseFloat(((synodicMonth + 0.1) % 26.0).toFixed(1)));
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isPlaying, orbitSpeed, synodicMonth, setSynodicMonth]);

  // Synodic math (0 to 26 months)
  const earthAngleRad = -Math.PI / 2;
  const marsAngleRad = earthAngleRad + ((synodicMonth % 26) / 26.0) * (2 * Math.PI);

  // Canvas geometry (400x400 viewBox to ensure full label visibility)
  const viewBoxSize = 400;
  const cx = 200;
  const cy = 200;
  const earthRadius = 72;
  const marsRadius = 130;

  const earthX = cx + earthRadius * Math.cos(earthAngleRad);
  const earthY = cy + earthRadius * Math.sin(earthAngleRad);

  const marsX = cx + marsRadius * Math.cos(marsAngleRad);
  const marsY = cy + marsRadius * Math.sin(marsAngleRad);

  // Generous padding (28px) to guarantee labels never hit rounded corners or canvas edges
  const padding = 28;
  
  // Mars label math
  const marsLabelW = 102;
  const marsLabelH = 22;
  const cosM = Math.cos(marsAngleRad);
  const sinM = Math.sin(marsAngleRad);
  let rawMarsLx = marsX + (cosM >= 0 ? 12 : -12 - marsLabelW);
  let rawMarsLy = marsY + (sinM >= 0 ? 10 : -10 - marsLabelH);
  const marsLabelX = Math.max(padding, Math.min(viewBoxSize - marsLabelW - padding, rawMarsLx));
  const marsLabelY = Math.max(padding, Math.min(viewBoxSize - marsLabelH - padding, rawMarsLy));

  // Earth label math
  const earthLabelW = 92;
  const earthLabelH = 20;
  const cosE = Math.cos(earthAngleRad);
  const sinE = Math.sin(earthAngleRad);
  let rawEarthLx = earthX + (cosE >= 0 ? 12 : -12 - earthLabelW);
  let rawEarthLy = earthY + (sinE >= 0 ? 10 : -10 - earthLabelH);
  const earthLabelX = Math.max(padding, Math.min(viewBoxSize - earthLabelW - padding, rawEarthLx));
  const earthLabelY = Math.max(padding, Math.min(viewBoxSize - earthLabelH - padding, rawEarthLy));

  // 3D Isometric Projection Transformation
  const isoRx = 55;
  const isoRy = 26;
  const earthX3d = cx + earthRadius * Math.cos(earthAngleRad);
  const earthY3d = cy + (earthRadius * Math.sin(earthAngleRad) * isoRy) / isoRx;

  const marsX3d = cx + marsRadius * Math.cos(marsAngleRad);
  const marsY3d = cy + (marsRadius * Math.sin(marsAngleRad) * isoRy) / isoRx;

  const mars3dLabelW = 100;
  let rawMars3dLx = marsX3d + (marsX3d >= cx ? 12 : -12 - mars3dLabelW);
  const mars3dLabelX = Math.max(padding, Math.min(viewBoxSize - mars3dLabelW - padding, rawMars3dLx));
  const mars3dLabelY = Math.max(padding, Math.min(viewBoxSize - 22 - padding, marsY3d - 10));

  const earth3dLabelW = 98;
  let rawEarth3dLx = earthX3d + (earthX3d >= cx ? 12 : -12 - earth3dLabelW);
  const earth3dLabelX = Math.max(padding, Math.min(viewBoxSize - earth3dLabelW - padding, rawEarth3dLx));
  const earth3dLabelY = Math.max(padding, Math.min(viewBoxSize - 20 - padding, earthY3d - 10));

  // Traveling RF Signal Packet interpolation (0.25, 0.5, 0.75 along beam)
  const pulse1X = earthX + (marsX - earthX) * 0.25;
  const pulse1Y = earthY + (marsY - earthY) * 0.25;
  const pulse2X = earthX + (marsX - earthX) * 0.5;
  const pulse2Y = earthY + (marsY - earthY) * 0.5;
  const pulse3X = earthX + (marsX - earthX) * 0.75;
  const pulse3Y = earthY + (marsY - earthY) * 0.75;

  return (
    <div className="bg-space-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 font-mono">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <Orbit className="w-3.5 h-3.5 text-cyan-400 motion-reduce:animate-none animate-spin-slow" /> Heliocentric Physics Engine
          </span>
          <h3 className="text-base font-bold font-heading text-white mt-0.5">
            Earth–Mars Heliocentric Orbit & RF Signal Beam Path
          </h3>
        </div>

        {/* Animation Controls & 2D/3D Mode Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Auto-Orbit Play/Pause */}
          <div className="flex items-center gap-1 bg-space-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-all ${
                isPlaying
                  ? 'bg-mars-500/20 text-mars-400 border border-mars-500/40 motion-reduce:animate-none animate-pulse'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{isPlaying ? 'PAUSE ORBIT' : 'AUTO ORBIT'}</span>
            </button>

            {isPlaying && (
              <button
                onClick={() => setOrbitSpeed(orbitSpeed === 1 ? 2 : orbitSpeed === 2 ? 4 : 1)}
                className="px-2 py-1 rounded text-[10px] font-bold text-cyan-400 bg-space-900 border border-slate-800 hover:text-white"
              >
                {orbitSpeed}x
              </button>
            )}

            <button
              onClick={() => {
                setIsPlaying(false);
                setSynodicMonth(0);
              }}
              className="p-1 rounded text-slate-400 hover:text-slate-200 bg-space-900 border border-slate-800"
              title="Reset to Opposition (Month 0)"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* 2D / 3D Mode Toggle */}
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
        <div className="lg:col-span-2 bg-space-950 rounded-xl p-4 border border-slate-800/90 flex flex-col items-center justify-center relative min-h-[360px] overflow-hidden">
          
          {activeTab === '2d' ? (
            <svg viewBox="0 0 400 400" className="w-full max-w-[400px] h-auto">
              <defs>
                {/* Sunlight Radial Background Gradient */}
                <radialGradient id="sunlightBg" cx="50%" cy="50%" r="65%" fx="50%" fy="50%">
                  <stop offset="0%" stopColor="#3E1A05" stopOpacity="0.85" />
                  <stop offset="25%" stopColor="#29120C" stopOpacity="0.65" />
                  <stop offset="50%" stopColor="#170E1A" stopOpacity="0.45" />
                  <stop offset="85%" stopColor="#0B0F19" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#070A12" stopOpacity="1" />
                </radialGradient>

                {/* Sun Photosphere Core Gradient (#FFB300 / #FFD700 family) */}
                <radialGradient id="sunPhotosphere" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFF8E1" />
                  <stop offset="35%" stopColor="#FFD700" />
                  <stop offset="70%" stopColor="#FFB300" />
                  <stop offset="100%" stopColor="#FF8F00" />
                </radialGradient>

                {/* Sun Corona Warm Radial Bleed */}
                <radialGradient id="sunCoronaBleed" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFB300" stopOpacity="0.5" />
                  <stop offset="35%" stopColor="#FF9100" stopOpacity="0.25" />
                  <stop offset="70%" stopColor="#D97706" stopOpacity="0.10" />
                  <stop offset="100%" stopColor="#7C2D12" stopOpacity="0" />
                </radialGradient>

                {/* Sun Glow Filter */}
                <filter id="glow-sun-core" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="6" result="blur1" />
                  <feGaussianBlur stdDeviation="16" result="blur2" />
                  <feMerge>
                    <feMergeNode in="blur2" />
                    <feMergeNode in="blur1" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                
                {/* Cyan Glow Filter */}
                <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Mars Glow Filter */}
                <filter id="glow-mars" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Animated Signal Beam Gradient */}
                <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38BDF8" />
                  <stop offset="50%" stopColor="#00E5FF" />
                  <stop offset="100%" stopColor="#EF4444" />
                </linearGradient>
              </defs>

              {/* Rich Warm Heliocentric Background Rect */}
              <rect x="0" y="0" width="400" height="400" rx="14" fill="url(#sunlightBg)" />

              {/* Sun Solar Exclusion Zone (<3.0 degrees) */}
              <circle cx={cx} cy={cy} r="38" fill="rgba(239, 68, 68, 0.07)" stroke="#EF4444" strokeOpacity="0.5" strokeDasharray="4 3" />
              <text x={cx} y={cy - 44} fill="#EF4444" fontSize="7.5" textAnchor="middle" opacity="0.85" className="font-mono font-bold">SOLAR EXCLUSION ZONE (&lt;3°)</text>

              {/* Sun Outer Bleeding Warm Corona */}
              <circle cx={cx} cy={cy} r="70" fill="url(#sunCoronaBleed)" filter="url(#glow-sun-core)" className="motion-reduce:animate-none animate-pulse" />
              <circle cx={cx} cy={cy} r="28" fill="rgba(255, 179, 0, 0.16)" />
              <circle cx={cx} cy={cy} r="20" fill="rgba(255, 215, 0, 0.32)" filter="url(#glow-sun-core)" />

              {/* Sun Photosphere Core */}
              <circle cx={cx} cy={cy} r="13" fill="url(#sunPhotosphere)" filter="url(#glow-sun-core)" />

              {/* Earth Orbit (Picks up warm amber tint near Sun) */}
              <circle cx={cx} cy={cy} r={earthRadius} fill="none" stroke="rgba(160, 110, 80, 0.45)" strokeWidth="1.5" strokeDasharray="5 4" />
              
              {/* Mars Orbit (Cooler slate gray path towards edges) */}
              <circle cx={cx} cy={cy} r={marsRadius} fill="none" stroke="#334155" strokeWidth="1.5" strokeDasharray="5 4" />

              {/* RF Beam Vector Line & Animated Laser Stream */}
              {isConjunction ? (
                // Solar Blackout: Broken Scattered Signal Beam with Warning Jitter
                <g>
                  <line x1={earthX} y1={earthY} x2={cx} y2={cy} stroke="#EF4444" strokeWidth="2.5" strokeDasharray="3 4" className="motion-reduce:animate-none animate-pulse" />
                  <line x1={cx} y1={cy} x2={marsX} y2={marsY} stroke="#EF4444" strokeWidth="2.5" strokeDasharray="3 4" className="motion-reduce:animate-none animate-pulse" />
                  <circle cx={cx} cy={cy} r="30" stroke="#EF4444" strokeWidth="1" fill="none" strokeDasharray="2 2" className="motion-reduce:animate-none animate-spin-slow" />
                </g>
              ) : (
                // Normal Signal Vector: Phosphor Cyan Laser Beam with Traveling Pulse Packets
                <g>
                  <line x1={earthX} y1={earthY} x2={marsX} y2={marsY} stroke="url(#beamGrad)" strokeWidth="2.5" strokeOpacity="0.9" filter="url(#glow-cyan)" />
                  <line x1={earthX} y1={earthY} x2={marsX} y2={marsY} stroke="#FFFFFF" strokeWidth="1" strokeDasharray="8 12" strokeOpacity="0.75" />

                  {/* Travelling RF Signal Packets */}
                  <circle cx={pulse1X} cy={pulse1Y} r="3" fill="#00E5FF" filter="url(#glow-cyan)" />
                  <circle cx={pulse2X} cy={pulse2Y} r="4" fill="#FFFFFF" filter="url(#glow-cyan)" className="motion-reduce:animate-none animate-ping" />
                  <circle cx={pulse3X} cy={pulse3Y} r="3" fill="#EF4444" filter="url(#glow-mars)" />
                </g>
              )}

              {/* Earth Planet & Aura */}
              <circle cx={earthX} cy={earthY} r="10" fill="rgba(56, 189, 248, 0.3)" />
              <circle cx={earthX} cy={earthY} r="6.5" fill="#38BDF8" filter="url(#glow-cyan)" />
              
              {/* Earth Label (Gradients & Clamped Coordinates - Never Clips) */}
              <g transform={`translate(${earthLabelX}, ${earthLabelY})`}>
                <rect x="0" y="0" width={earthLabelW} height={earthLabelH} rx="5" fill="rgba(10, 20, 35, 0.92)" stroke="rgba(56, 189, 248, 0.6)" strokeWidth="1" />
                <text x={earthLabelW / 2} y={earthLabelH / 2 + 3.5} fill="#38BDF8" fontSize="9" textAnchor="middle" className="font-mono font-bold">Earth (1.0 AU)</text>
              </g>

              {/* Mars Planet & Aura */}
              <circle cx={marsX} cy={marsY} r="9" fill="rgba(239, 68, 68, 0.3)" />
              <circle cx={marsX} cy={marsY} r="6" fill="#EF4444" filter="url(#glow-mars)" />
              
              {/* Mars Label (Gradients & Clamped Coordinates - Never Clips) */}
              <g transform={`translate(${marsLabelX}, ${marsLabelY})`}>
                <rect x="0" y="0" width={marsLabelW} height={marsLabelH} rx="5" fill="rgba(15, 12, 25, 0.92)" stroke="rgba(239, 68, 68, 0.6)" strokeWidth="1" />
                <text x={marsLabelW / 2} y={marsLabelH / 2 + 4} fill="#FCA5A5" fontSize="9" textAnchor="middle" className="font-mono font-bold">Mars (1.524 AU)</text>
              </g>

            </svg>
          ) : (
            <svg viewBox="0 0 400 400" className="w-full max-w-[400px] h-auto">
              <defs>
                <radialGradient id="sunlightBg3d" cx="50%" cy="50%" r="65%">
                  <stop offset="0%" stopColor="#3E1A05" stopOpacity="0.85" />
                  <stop offset="30%" stopColor="#29120C" stopOpacity="0.6" />
                  <stop offset="85%" stopColor="#0B0F19" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#070A12" stopOpacity="1" />
                </radialGradient>
              </defs>

              <rect x="0" y="0" width="400" height="400" rx="14" fill="url(#sunlightBg3d)" />

              {/* 3D Isometric View */}
              <ellipse cx={cx} cy={cy} rx="38" ry="18" fill="rgba(239, 68, 68, 0.12)" stroke="rgba(239, 68, 68, 0.45)" strokeDasharray="3 3" />
              <circle cx={cx} cy={cy} r="14" fill="#FFB300" filter="url(#glow-sun-core)" className="motion-reduce:animate-none animate-pulse" />

              {/* Tilted Earth Orbit */}
              <ellipse cx={cx} cy={cy} rx={earthRadius} ry={(earthRadius * isoRy) / isoRx} fill="none" stroke="rgba(0, 229, 255, 0.65)" strokeWidth="1.5" strokeDasharray="5 4" />

              {/* Tilted Mars Orbit */}
              <ellipse cx={cx} cy={cy} rx={marsRadius} ry={(marsRadius * isoRy) / isoRx} fill="none" stroke="rgba(239, 68, 68, 0.65)" strokeWidth="1.5" strokeDasharray="5 4" />

              {/* 3D RF Vector Line */}
              <line x1={earthX3d} y1={earthY3d} x2={marsX3d} y2={marsY3d} stroke={isConjunction ? '#EF4444' : '#00E5FF'} strokeWidth="2.5" />
              <circle cx={(earthX3d + marsX3d) / 2} cy={(earthY3d + marsY3d) / 2} r="3.5" fill={isConjunction ? '#EF4444' : '#00E5FF'} className="motion-reduce:animate-none animate-ping" />

              {/* 3D Earth Node */}
              <circle cx={earthX3d} cy={earthY3d} r="7" fill="#38BDF8" />
              <g transform={`translate(${earth3dLabelX}, ${earth3dLabelY})`}>
                <rect x="0" y="0" width={earth3dLabelW} height="18" rx="4" fill="rgba(10, 20, 35, 0.9)" stroke="rgba(56, 189, 248, 0.5)" strokeWidth="0.9" />
                <text x={earth3dLabelW / 2} y="12" fill="#38BDF8" fontSize="8.5" textAnchor="middle" className="font-mono font-bold">Earth 3D Vector</text>
              </g>

              {/* 3D Mars Node */}
              <circle cx={marsX3d} cy={marsY3d} r="6" fill="#EF4444" />
              <g transform={`translate(${mars3dLabelX}, ${mars3dLabelY})`}>
                <rect x="0" y="0" width={mars3dLabelW} height="18" rx="4" fill="rgba(15, 12, 25, 0.9)" stroke="rgba(239, 68, 68, 0.6)" strokeWidth="0.9" />
                <text x={mars3dLabelW / 2} y="12" fill="#FCA5A5" fontSize="8.5" textAnchor="middle" className="font-mono font-bold">Mars 3D Vector</text>
              </g>
            </svg>
          )}

          {/* Map Overlay Badge */}
          <div className="absolute top-3 left-3 bg-space-900/90 border border-slate-800 px-2.5 py-1 rounded-lg text-[10px] text-slate-400 flex items-center gap-2">
            <span className="text-cyan-400 font-bold">Synodic Month:</span> 
            <span className="tabular-nums text-white font-bold">{synodicMonth.toFixed(1)} / 26.0</span>
            {isPlaying && <span className="w-2 h-2 rounded-full bg-emerald-400 motion-reduce:animate-none animate-ping" />}
          </div>

          {/* Solar Blackout Warning Banner */}
          {isConjunction && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-red-500/20 border border-red-500/40 text-red-400 px-3 py-1 rounded-xl text-[10px] font-mono font-bold flex items-center gap-1.5 motion-reduce:animate-none animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>RF LINK BLACKOUT (&lt;3.0° SEM ALIGNMENT)</span>
            </div>
          )}

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
                onChange={(e) => {
                  setIsPlaying(false);
                  setSynodicMonth(parseFloat(e.target.value));
                }}
                className="w-full h-2 bg-space-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>M0 (Opposition)</span>
                <span>M13 (Conjunction)</span>
                <span>M26</span>
              </div>
            </div>

            {/* Shortcut Orbit Presets */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <button
                onClick={() => { setIsPlaying(false); setSynodicMonth(0.0); }}
                className={`py-1 rounded text-[9.5px] font-mono border transition-all ${
                  synodicMonth === 0.0 ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 font-bold' : 'bg-space-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                M0 (54M km)
              </button>
              <button
                onClick={() => { setIsPlaying(false); setSynodicMonth(13.0); }}
                className={`py-1 rounded text-[9.5px] font-mono border transition-all ${
                  synodicMonth === 13.0 ? 'bg-red-500/20 text-red-400 border-red-500/40 font-bold' : 'bg-space-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                M13 (401M km)
              </button>
              <button
                onClick={() => { setIsPlaying(false); setSynodicMonth(26.0); }}
                className={`py-1 rounded text-[9.5px] font-mono border transition-all ${
                  synodicMonth === 26.0 ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 font-bold' : 'bg-space-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                M26 (Loop)
              </button>
            </div>
          </div>

          {/* Physics Calculations Card */}
          <div className="bg-space-900 p-3 rounded-lg border border-slate-800 space-y-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400 uppercase">Calculated Distance:</span>
              <span className="text-cyan-400 font-bold tabular-nums">{(telemetry.distanceKm / 1e6).toFixed(1)} M km</span>
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
          <div className="text-[10px] text-slate-400 italic bg-space-900/60 p-2.5 rounded-lg border border-violet-500/30">
            <strong className="text-violet-300">Kepler Physics Model:</strong> Distance calculated via heliocentric polar coordinates ($d^2 = r_E^2 + r_M^2 - 2 r_E r_M \cos\Delta\theta$).
          </div>

        </div>

      </div>

    </div>
  );
};
