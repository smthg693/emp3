import React, { useRef, useEffect, useState } from 'react';
import { TelemetryData } from '../types/mission';
import { Orbit, Compass, Play, Pause, Eye } from 'lucide-react';

interface OrbitalVisualizerProps {
  telemetry: TelemetryData;
  setSynodicMonth: (month: number) => void;
}

export const OrbitalVisualizer: React.FC<OrbitalVisualizerProps> = ({
  telemetry,
  setSynodicMonth,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [viewAngle, setViewAngle] = useState<'2D' | '3D'>('2D');

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSynodicMonth((prev) => {
        const next = prev + 0.1;
        return next > 26 ? 0 : next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying, setSynodicMonth]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particleOffset = 0;

    const render = () => {
      particleOffset = (particleOffset + 0.012) % 1;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2 + (viewAngle === '3D' ? 15 : 0);

      const spaceGrad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, width);
      spaceGrad.addColorStop(0, '#0F172A');
      spaceGrad.addColorStop(0.6, '#0A0F1D');
      spaceGrad.addColorStop(1, '#060B16');
      ctx.fillStyle = spaceGrad;
      ctx.fillRect(0, 0, width, height);

      const ySquish = viewAngle === '3D' ? 0.45 : 1.0;
      const rEarth = Math.min(width, height) * 0.24;
      const rMars = Math.min(width, height) * 0.40;

      const progress = telemetry.synodicMonth / 26.0;
      const earthAngle = -Math.PI / 2;
      const marsAngle = earthAngle + progress * (2 * Math.PI);

      const earthX = centerX + rEarth * Math.cos(earthAngle);
      const earthY = centerY + rEarth * Math.sin(earthAngle) * ySquish;

      const marsX = centerX + rMars * Math.cos(marsAngle);
      const marsY = centerY + rMars * Math.sin(marsAngle) * ySquish;

      // Draw Orbit Lines
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, rEarth, rEarth * ySquish, 0, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(centerX, centerY, rMars, rMars * ySquish, 0, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(234, 88, 12, 0.25)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Sun
      const sunGlow = ctx.createRadialGradient(centerX, centerY, 2, centerX, centerY, 35);
      sunGlow.addColorStop(0, '#FFFFFF');
      sunGlow.addColorStop(0.3, '#FBBF24');
      sunGlow.addColorStop(1, 'rgba(234, 88, 12, 0)');
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 35, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 14, 0, 2 * Math.PI);
      ctx.fill();

      const isConjunction = telemetry.isConjunction;

      // Radio Beam Path
      ctx.beginPath();
      ctx.moveTo(earthX, earthY);
      ctx.lineTo(marsX, marsY);

      if (isConjunction) {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#EF4444';
        ctx.font = 'bold 10px JetBrains Mono';
        ctx.fillText('⚡ SOLAR BLACKOUT DETECTED', centerX - 70, centerY - 40);
      } else {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        for (let i = 0; i < 3; i++) {
          const pProgress = (particleOffset + i * 0.33) % 1;
          const px = earthX + (marsX - earthX) * pProgress;
          const py = earthY + (marsY - earthY) * pProgress;

          const pGlow = ctx.createRadialGradient(px, py, 1, px, py, 6);
          pGlow.addColorStop(0, '#FFFFFF');
          pGlow.addColorStop(0.5, '#38BDF8');
          pGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
          ctx.fillStyle = pGlow;
          ctx.beginPath();
          ctx.arc(px, py, 6, 0, 2 * Math.PI);
          ctx.fill();
        }
      }

      // Earth Body
      ctx.fillStyle = '#0284C7';
      ctx.beginPath();
      ctx.arc(earthX, earthY, 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#F8FAFC';
      ctx.font = 'bold 10px Inter';
      ctx.fillText('EARTH', earthX - 16, earthY - 12);

      // Mars Body
      ctx.fillStyle = '#EA580C';
      ctx.beginPath();
      ctx.arc(marsX, marsY, 6.5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#F97316';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#F8FAFC';
      ctx.font = 'bold 10px Inter';
      ctx.fillText('MARS', marsX - 14, marsY + 18);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [telemetry.synodicMonth, telemetry.isConjunction, viewAngle]);

  return (
    <div className="bg-space-900/90 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
      <div className="flex flex-col lg:flex-row gap-5 items-center">
        
        {/* Left: Orbit Map Canvas */}
        <div className="w-full lg:w-1/2 flex flex-col items-center">
          <div className="relative w-full max-w-[360px] aspect-square rounded-2xl bg-space-950 border border-slate-800/90 p-2 shadow-inner overflow-hidden">
            <canvas
              ref={canvasRef}
              width={350}
              height={350}
              className="w-full h-full rounded-xl cursor-crosshair"
            />
            
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <div className="bg-space-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-300">
                <span className="text-earth-400 font-bold">Earth</span> ⇄ <span className="text-mars-500 font-bold">Mars</span>
              </div>
            </div>

            <div className="absolute top-3 right-3 flex items-center gap-1">
              <button
                onClick={() => setViewAngle(viewAngle === '2D' ? '3D' : '2D')}
                className="bg-space-900/90 text-slate-300 border border-slate-800 px-2 py-0.5 rounded-md text-[10px] font-mono flex items-center gap-1 hover:bg-slate-800 transition-colors"
              >
                <Eye className="w-3 h-3 text-mars-500" />
                <span>{viewAngle}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Controls & Slider */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-mars-500 uppercase tracking-wider mb-0.5 font-semibold">
              <Orbit className="w-3.5 h-3.5" /> Orbital Delay Physics
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-heading text-white">
              Why Mars Can't Be Real-Time Controlled
            </h2>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">
              Orbital positions vary distance between <span className="text-earth-400 font-semibold">54.6M km</span> and <span className="text-mars-500 font-semibold">401M km</span>, setting one-way delay from 3 to 22 minutes.
            </p>
          </div>

          <div className="bg-space-950 p-3.5 rounded-xl border border-slate-800/80 space-y-2.5">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-300 font-semibold flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-mars-500" /> Orbit Position:
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 transition-all ${
                    isPlaying ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-space-900 text-slate-300 border border-slate-800'
                  }`}
                >
                  {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{isPlaying ? 'Pause' : 'Auto'}</span>
                </button>

                <span className="text-spacegold-400 font-bold text-xs bg-space-900 px-2 py-0.5 rounded border border-slate-800">
                  M{telemetry.synodicMonth.toFixed(1)} / 26
                </span>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="26"
              step="0.1"
              value={telemetry.synodicMonth}
              onChange={(e) => setSynodicMonth(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-mars-500"
            />

            <div className="grid grid-cols-3 text-[10px] font-mono text-slate-400">
              <div><span className="text-earth-400 font-bold block">Closest</span><span>54.6M km</span></div>
              <div className="text-center"><span className="text-amber-400 font-bold block">Conjunction</span><span>Blackout</span></div>
              <div className="text-right"><span className="text-mars-500 font-bold block">Farthest</span><span>401M km</span></div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-space-950 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-[9px] font-mono text-slate-400 uppercase block">1-Way Delay</span>
              <span className="text-base font-bold font-mono text-mars-500">{telemetry.oneWayLatencyMin.toFixed(1)} min</span>
            </div>

            <div className="bg-space-950 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-[9px] font-mono text-slate-400 uppercase block">Round-Trip</span>
              <span className="text-base font-bold font-mono text-spacegold-400">{telemetry.roundTripLatencyMin.toFixed(1)} min</span>
            </div>

            <div className="bg-space-950 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-[9px] font-mono text-slate-400 uppercase block">Radio Link</span>
              <span className={`text-xs font-bold font-mono ${telemetry.isConjunction ? 'text-red-400' : 'text-emerald-400'}`}>
                {telemetry.isConjunction ? 'BLOCKED' : 'ACTIVE'}
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
