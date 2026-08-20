import React, { useState } from 'react';
import { 
  BookOpen, 
  Orbit, 
  Radio, 
  ShieldCheck, 
  Globe, 
  Zap
} from 'lucide-react';

export const ResearchCenter: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<'PHYSICS' | 'NETWORKING' | 'AUTONOMY' | 'NASA_PRECEDENTS'>('PHYSICS');

  return (
    <div className="bg-space-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <span className="text-xs font-mono text-earth-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" /> Technical & Scientific Research Briefing
          </span>
          <h3 className="text-lg font-bold font-heading text-white mt-1">
            Deep-Space Communication & AI Systems Engineering Research
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative research notes synthesized from NASA JPL, ESA, and CCSDS Deep Space Network standards.
          </p>
        </div>

        {/* Topic Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-space-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setSelectedTopic('PHYSICS')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedTopic === 'PHYSICS' ? 'bg-earth-500 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Orbital Physics
          </button>
          <button
            onClick={() => setSelectedTopic('NETWORKING')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedTopic === 'NETWORKING' ? 'bg-spacegold-500 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            DTN Protocol
          </button>
          <button
            onClick={() => setSelectedTopic('AUTONOMY')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedTopic === 'AUTONOMY' ? 'bg-mars-500 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Space Autonomy
          </button>
          <button
            onClick={() => setSelectedTopic('NASA_PRECEDENTS')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedTopic === 'NASA_PRECEDENTS' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            NASA Precedents
          </button>
        </div>
      </div>

      {/* TOPIC 1: ORBITAL PHYSICS & LATENCY MATHEMATICS */}
      {selectedTopic === 'PHYSICS' && (
        <div className="space-y-4 font-mono text-xs text-slate-300">
          <div className="bg-space-950 p-5 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-earth-400 uppercase tracking-wider flex items-center gap-2">
              <Orbit className="w-4 h-4" /> 1. The Light-Speed Delay Equation (c ≈ 299,792 km/s)
            </h4>
            <p className="leading-relaxed">
              Radio communications travel at the speed of light (c = 299,792.458 km/s). Because Earth (1.0 AU) and Mars (1.52 AU) orbit the Sun at different velocities, their relative distance varies between <strong className="text-white">54.6 million km</strong> (closest approach) and <strong className="text-white">401 million km</strong> (aphelion opposition).
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="bg-space-900 p-3 rounded-lg border border-slate-800">
                <span className="text-earth-400 font-bold block mb-1">Closest Approach Equation:</span>
                <code>T_min = 54.6 × 10^6 km / 299,792.458 km/s = 182.12 s ≈ 3.03 minutes</code>
              </div>
              <div className="bg-space-900 p-3 rounded-lg border border-slate-800">
                <span className="text-mars-500 font-bold block mb-1">Farthest Distance Equation:</span>
                <code>T_max = 401.0 × 10^6 km / 299,792.458 km/s = 1,337.59 s ≈ 22.29 minutes</code>
              </div>
            </div>
          </div>

          <div className="bg-space-950 p-5 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4" /> 2. Solar Conjunction Blackout Physics
            </h4>
            <p className="leading-relaxed">
              Every <strong className="text-white">25.6 months (~26 months)</strong>, Mars passes directly behind the Sun as seen from Earth. When the Sun-Earth-Mars (SEM) angle narrows below <strong className="text-white">~2°–3°</strong>, energetic solar coronal plasma refracts radio waves, causing phase noise and signal degradation for approximately <strong className="text-white">13 to 14 days</strong>.
            </p>
          </div>
        </div>
      )}

      {/* TOPIC 2: DTN PROTOCOL & STORE-AND-FORWARD */}
      {selectedTopic === 'NETWORKING' && (
        <div className="space-y-4 font-mono text-xs text-slate-300">
          <div className="bg-space-950 p-5 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-spacegold-400 uppercase tracking-wider flex items-center gap-2">
              <Radio className="w-4 h-4" /> Delay/Disruption Tolerant Networking (DTN - RFC 4838 / BPv7)
            </h4>
            <p className="leading-relaxed">
              Standard terrestrial TCP/IP protocols break when packet round-trip delays exceed seconds or connection paths disconnect. DTN solves this by introducing the <strong className="text-white">Bundle Protocol (BPv7)</strong> operating on a store-and-forward principle.
            </p>

            <div className="space-y-2 pt-2">
              <div className="bg-space-900 p-3 rounded-lg border border-slate-800">
                <strong className="text-white block mb-1">Custody Transfer:</strong>
                <span>Each intermediate node (e.g. Mars Orbiter) accepts reliable custody of data packets, storing them in non-volatile memory until the next reliable link opens to Earth.</span>
              </div>
              <div className="bg-space-900 p-3 rounded-lg border border-slate-800">
                <strong className="text-white block mb-1">Asymmetric Bandwidth Optimization:</strong>
                <span>Prioritizes telemetry metadata (100 MB) over raw imagery (5 GB) during short orbiter overhead passes (10-20 min).</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOPIC 3: SPACE AUTONOMY & SAFETY BOUNDARIES */}
      {selectedTopic === 'AUTONOMY' && (
        <div className="space-y-4 font-mono text-xs text-slate-300">
          <div className="bg-space-950 p-5 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-mars-500 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Spacecraft Fault Autonomy & Rule Guardrails
            </h4>
            <p className="leading-relaxed">
              Because a critical anomaly on Mars cannot wait up to <strong className="text-white">44 minutes</strong> for Earth operators to respond, spacecraft are programmed with onboard autonomy engines.
            </p>

            <div className="bg-space-900 p-4 rounded-xl border border-slate-800 space-y-2">
              <strong className="text-spacegold-400 block">The Human-in-the-Loop Constraint Architecture:</strong>
              <p className="text-slate-300">
                AI algorithms perform real-time situation assessment and propose recovery actions. However, execution is restricted to <strong className="text-white">pre-approved, deterministic mission rules</strong> created and flight-tested by Earth engineering teams before launch.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TOPIC 4: REAL-WORLD NASA PRECEDENTS */}
      {selectedTopic === 'NASA_PRECEDENTS' && (
        <div className="space-y-4 font-mono text-xs text-slate-300">
          <div className="bg-space-950 p-5 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4" /> NASA & ESA Flight Precedents
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-space-900 p-3.5 rounded-lg border border-slate-800">
                <strong className="text-white block mb-1">NASA PACE Mission (2024):</strong>
                <span>Delivered over <strong className="text-emerald-400">34 million DTN bundles</strong> with a 100% reported delivery success rate across disrupted ground links.</span>
              </div>
              <div className="bg-space-900 p-3.5 rounded-lg border border-slate-800">
                <strong className="text-white block mb-1">NASA ISS Flight Tests (2009):</strong>
                <span>First operational space testing of Delay Tolerant Networking protocol aboard the International Space Station.</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
