import React from 'react';
import { Rocket, ShieldCheck, Globe, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-space-950 border-t border-slate-800 text-slate-400 py-8 px-4 font-mono text-xs mt-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left: Branding & Team */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-mars-600/20 border border-mars-500/40 flex items-center justify-center text-mars-500">
            <Rocket className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-200">KEPLER'S CREW — RESEARCH & PROJECT BRIEFING</div>
            <div className="text-[11px] text-slate-500">Reducing the Delay of Deep-Space Communication</div>
          </div>
        </div>

        {/* Center: NASA/JPL/ESA Citations */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
          <span className="text-slate-500">Sources & Precedents:</span>
          <span className="text-slate-300 hover:text-earth-400 transition-colors">NASA Mars Relay Network</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-300 hover:text-earth-400 transition-colors">ESA Mars Express Notes</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-300 hover:text-earth-400 transition-colors">NASA DTN Protocol (PACE 2024)</span>
        </div>

        {/* Right: Copyright / Status */}
        <div className="text-[11px] text-slate-500 text-right">
          <span>AI-Assisted Mission Control Prototype</span>
        </div>

      </div>
    </footer>
  );
};
