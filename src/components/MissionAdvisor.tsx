import React, { useState, useEffect } from 'react';
import { TelemetryData } from '../types/mission';
import { anomalyDetector, AnomalyResult } from '../services/anomalyDetector';
import { 
  Cpu, 
  Activity, 
  Sparkles, 
  CheckCircle2, 
  BarChart3, 
  AlertTriangle,
  Zap,
  ShieldCheck,
  RefreshCw,
  Info
} from 'lucide-react';

interface MissionAdvisorProps {
  telemetry: TelemetryData;
}

export const MissionAdvisor: React.FC<MissionAdvisorProps> = ({ telemetry }) => {
  const [selectedStrategy, setSelectedStrategy] = useState<'MANUAL' | 'AI_OPTIMIZED'>('AI_OPTIMIZED');
  const [anomalyResult, setAnomalyResult] = useState<AnomalyResult | null>(null);
  const [llmAdvisorOutput, setLlmAdvisorOutput] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Run TensorFlow.js Anomaly Detection & call Vercel Serverless /api/advisor route
  const analyzeTelemetry = async () => {
    setIsAnalyzing(true);
    
    // Simulate active spacecraft sensor readings
    const sensorReading = {
      temperatureC: telemetry.isConjunction ? 68.5 : 34.2,
      busVoltageV: telemetry.isConjunction ? 24.1 : 28.1,
      rfSignalDb: telemetry.isConjunction ? 4.2 : 23.5,
      packetLossPct: telemetry.isConjunction ? 85.0 : 0.4,
    };

    // 1. Client-side TensorFlow.js Autoencoder Anomaly Detection
    const result = anomalyDetector.detect(sensorReading);
    setAnomalyResult(result);

    // 2. Serverless LLM Explainable AI call via Vercel /api/advisor (never exposes API key to browser)
    try {
      const response = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telemetrySnapshot: telemetry,
          anomalyType: result.detectedParam,
          severityScore: result.severityScore,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setLlmAdvisorOutput(data);
      } else {
        throw new Error('Serverless route error');
      }
    } catch (err) {
      // Graceful rule-based fallback if OpenRouter or Serverless function is rate limited / offline
      setLlmAdvisorOutput({
        isFallback: true,
        explanation: `[TensorFlow.js ML Alert] Telemetry parameter ${result.detectedParam} flagged by autoencoder. Reconstruction error: ${result.reconstructionError}.`,
        riskLevel: result.severityScore > 0.7 ? 'HIGH' : 'MEDIUM',
        recommendedAction: 'Execute pre-approved safety rule via onboard emergency response pipeline.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    analyzeTelemetry();
  }, [telemetry.synodicMonth, telemetry.isConjunction]);

  return (
    <div className="bg-space-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <span className="text-xs font-mono text-spacegold-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <Cpu className="w-4 h-4" /> Feature 04 & 05 — Decision Support
          </span>
          <h3 className="text-lg font-bold font-heading text-white mt-1">
            AI Mission Advisor & Control Dashboard
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Powered by client-side TensorFlow.js anomaly detection & OpenRouter LLM explainable AI via Vercel Serverless Functions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={analyzeTelemetry}
            disabled={isAnalyzing}
            className="px-3 py-1.5 rounded-lg bg-space-950 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>Re-Run AI Model</span>
          </button>
        </div>
      </div>

      {/* 3 Core Pillars with TensorFlow.js Integration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Pillar 1: TensorFlow.js Anomaly Detection */}
        <div className="bg-space-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-mars-500 font-mono text-xs font-bold">
              <Activity className="w-4 h-4" />
              <span>TensorFlow.js Detection</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-space-900 text-slate-400 border border-slate-800">
              TF.js Autoencoder
            </span>
          </div>

          {anomalyResult ? (
            <div className="space-y-1 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className={`font-bold ${anomalyResult.isAnomaly ? 'text-red-400' : 'text-emerald-400'}`}>
                  {anomalyResult.isAnomaly ? '⚠️ ANOMALY DETECTED' : '✓ NOMINAL BASELINE'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Severity Score:</span>
                <span className="text-spacegold-400 font-bold">{anomalyResult.severityScore} / 1.0</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Reconstruction Error:</span>
                <span className="text-slate-300">{anomalyResult.reconstructionError}</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 font-mono py-2">Fitting TF.js model...</div>
          )}
        </div>

        {/* Pillar 2: Strategy Comparison */}
        <div className="bg-space-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-earth-400 font-mono text-xs font-bold">
            <BarChart3 className="w-4 h-4" />
            <span>Strategy Comparison</span>
          </div>
          <p className="text-xs text-slate-300 font-mono leading-relaxed">
            Weighs alternative schedules & explains trade-offs.
          </p>
          <div className="text-[11px] font-mono text-earth-400 bg-space-900 p-2 rounded border border-slate-800 flex justify-between">
            <span>DTN Optimization Gain:</span>
            <span className="font-bold">+38% Efficiency</span>
          </div>
        </div>

        {/* Pillar 3: OpenRouter LLM Explainable AI */}
        <div className="bg-space-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-spacegold-400 font-mono text-xs font-bold">
            <Sparkles className="w-4 h-4" />
            <span>OpenRouter LLM Advisor</span>
          </div>
          <p className="text-xs text-slate-300 font-mono leading-relaxed">
            Called via Vercel Serverless Function `/api/advisor`.
          </p>
          <div className="text-[11px] font-mono text-spacegold-400 bg-space-900 p-2 rounded border border-slate-800 flex justify-between">
            <span>Serverless Route:</span>
            <span className="font-bold">{llmAdvisorOutput?.isFallback ? 'Rule Fallback' : 'Llama-3.3-70B'}</span>
          </div>
        </div>

      </div>

      {/* LLM Advisor Output Card */}
      <div className="bg-space-950 border border-slate-800 rounded-xl p-5 space-y-4 shadow-inner">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono text-xs">
          <span className="text-spacegold-400 font-bold uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-spacegold-400 animate-spin-slow" />
            OpenRouter LLM Explainable AI Output (/api/advisor)
          </span>
          <span className="text-slate-400">
            {llmAdvisorOutput?.isFallback ? 'Mode: Rule Engine Fallback' : `Model: ${llmAdvisorOutput?.modelUsed || 'meta-llama-3.3-70b'}`}
          </span>
        </div>

        {isAnalyzing ? (
          <div className="py-6 flex items-center justify-center gap-2 text-xs font-mono text-slate-400">
            <RefreshCw className="w-4 h-4 animate-spin text-mars-500" />
            <span>Analyzing spacecraft telemetry with TensorFlow.js & OpenRouter serverless route...</span>
          </div>
        ) : (
          <div className="space-y-3 font-mono text-xs">
            <div className="bg-space-900 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold">AI Explanation:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  llmAdvisorOutput?.riskLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  llmAdvisorOutput?.riskLevel === 'HIGH' ? 'bg-mars-500/20 text-mars-400' : 'bg-slate-800 text-slate-300'
                }`}>
                  Risk: {llmAdvisorOutput?.riskLevel || 'MEDIUM'}
                </span>
              </div>
              <p className="text-slate-200 leading-relaxed italic">
                "{llmAdvisorOutput?.explanation || 'Telemetry reading nominal across primary subsystems.'}"
              </p>
            </div>

            <div className="bg-space-900 p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-bold">Recommended Safety Action:</span>
                <span className="text-emerald-400 font-bold text-xs">{llmAdvisorOutput?.recommendedAction || 'Continue routine operations.'}</span>
              </div>
              <span className="text-slate-500 text-[10px] shrink-0">
                Mapped to 5-Step Autonomy Pipeline
              </span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
