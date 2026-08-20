import React, { useState, useEffect } from 'react';
import { TelemetryData } from '../types/mission';
import { Terminal, Play, Pause, Trash2, ShieldCheck, Wifi, Sparkles } from 'lucide-react';

interface ConsoleLoggerProps {
  telemetry: TelemetryData;
}

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'INFO' | 'SUCCESS' | 'WARN' | 'AI_EXEC' | 'DTN';
  message: string;
}

export const ConsoleLogger: React.FC<ConsoleLoggerProps> = ({ telemetry }) => {
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', timestamp: '14:22:01.042', type: 'INFO', message: 'DSN Station 12 (Goldstone) link established. Azimuth 214°, Elevation 42°.' },
    { id: '2', timestamp: '14:22:04.819', type: 'SUCCESS', message: `Orbital recalculation complete. One-Way latency = ${telemetry.oneWayLatencyMin.toFixed(1)} min.` },
    { id: '3', timestamp: '14:22:12.301', type: 'AI_EXEC', message: 'AI Scheduler: Prioritized P1 Emergency Telemetry (100 MB) ahead of scientific imagery.' },
    { id: '4', timestamp: '14:22:15.540', type: 'DTN', message: 'DTN Store-and-Forward Outbox: 5,120 MB buffered for MRO passes.' },
  ]);
  const [isLive, setIsLive] = useState<boolean>(true);

  // Generate continuous background log entries
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
      
      const templates = [
        { type: 'INFO' as const, msg: `Telemetry heartbeat ACK received. DSN Carrier Lock SNR: +24.2 dB.` },
        { type: 'DTN' as const, msg: `DTN Bundle #${Math.floor(Math.random() * 900000 + 100000)} verified & forwarded.` },
        { type: 'AI_EXEC' as const, msg: `AI Orbital Engine: Orbit distance shift ${telemetry.distanceKm.toFixed(1)}M km. Latency updated.` },
        { type: 'SUCCESS' as const, msg: `Ka-band transmitter operating at 6.0 Mbps peak capacity.` },
      ];

      const chosen = templates[Math.floor(Math.random() * templates.length)];
      const newEntry: LogEntry = {
        id: Date.now().toString(),
        timestamp: timeStr,
        type: chosen.type,
        message: chosen.msg,
      };

      setLogs((prev) => [newEntry, ...prev.slice(0, 49)]); // keep last 50
    }, 3500);

    return () => clearInterval(interval);
  }, [isLive, telemetry.distanceKm, telemetry.oneWayLatencyMin]);

  const clearLogs = () => setLogs([]);

  return (
    <div className="bg-space-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4 font-mono">
      
      {/* Console Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Live Telemetry Console & DTN Log Stream
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLive(!isLive)}
            className={`px-2.5 py-1 rounded text-[11px] flex items-center gap-1 border transition-colors ${
              isLive ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {isLive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isLive ? 'LIVE' : 'PAUSED'}</span>
          </button>

          <button
            onClick={clearLogs}
            className="p-1 rounded text-slate-400 hover:text-slate-200 bg-space-950 border border-slate-800"
            title="Clear logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Viewport */}
      <div className="bg-space-950 p-4 rounded-xl border border-slate-800/90 h-[220px] overflow-y-auto space-y-1.5 text-xs font-mono">
        {logs.length === 0 ? (
          <div className="text-slate-600 text-center py-16">Terminal cleared. Waiting for telemetry packets...</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 leading-relaxed hover:bg-space-900/50 p-1 rounded">
              <span className="text-slate-500 text-[10px] shrink-0">{log.timestamp}</span>
              
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                log.type === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400' :
                log.type === 'AI_EXEC' ? 'bg-mars-500/20 text-mars-400' :
                log.type === 'DTN' ? 'bg-earth-500/20 text-earth-400' :
                log.type === 'WARN' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-300'
              }`}>
                [{log.type}]
              </span>

              <span className="text-slate-300 break-all">{log.message}</span>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <Wifi className="w-3.5 h-3.5 text-emerald-400" /> DTN Gateway: Node mars-relay-mro-01.nasa.gov
        </span>
        <span>Showing last {logs.length} packet events</span>
      </div>

    </div>
  );
};
