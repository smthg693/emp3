import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS & handle preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const { telemetrySnapshot, anomalyType, severityScore } = req.body || {};

    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free';

    // If API key is missing, return a clean rule-based fallback response (never fail UI)
    if (!apiKey) {
      console.warn('[Vercel Serverless /api/advisor] OPENROUTER_API_KEY not set. Serving fallback guidance.');
      return res.status(200).json({
        isFallback: true,
        explanation: `[Telemetry Guardrail] ${anomalyType || 'Subsystem Anomaly'} flagged with severity score ${severityScore || 0.85}. Subsystem parameters operating outside normal baseline margins.`,
        riskLevel: severityScore > 0.8 ? 'CRITICAL' : 'HIGH',
        recommendedAction: 'Execute pre-approved emergency safety procedure immediately via onboard rule engine.',
      });
    }

    const systemPrompt = `You are an AI Spacecraft Systems Advisor for NASA/JPL Earth-Mars Mission Control.
Given an anomaly telemetry snapshot, analyze the physical situation and return a JSON object with:
1. "explanation": A concise 2-sentence explanation of why the physical parameter failed and its mission risk.
2. "riskLevel": Exactly one of "CRITICAL", "HIGH", "MEDIUM", or "LOW".
3. "recommendedAction": A specific safety action mapped to spacecraft rules (Thermal Loop Switch, High-Gain Antenna Realignment, or EPS Load Shedding).

Respond ONLY with valid JSON. Do not include markdown or extra commentary.`;

    const userPrompt = JSON.stringify({
      anomalyType: anomalyType || 'Subsystem Anomaly',
      severityScore: severityScore || 0.85,
      telemetrySnapshot: telemetrySnapshot || {
        distanceKm: 225.4,
        oneWayLatencyMin: 12.5,
        roundTripLatencyMin: 25.0,
      },
    });

    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://keplers-crew-mars.vercel.app',
        'X-Title': 'Kepler Crew Mars Mission Control',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 250,
      }),
    });

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      console.error(`[Vercel /api/advisor] OpenRouter HTTP ${openRouterResponse.status}:`, errorText);

      return res.status(200).json({
        isFallback: true,
        explanation: `[Rule Engine Fallback] Anomaly (${anomalyType}) detected. Remote OpenRouter LLM rate-limited or unavailable (HTTP ${openRouterResponse.status}).`,
        riskLevel: severityScore > 0.8 ? 'CRITICAL' : 'HIGH',
        recommendedAction: 'Apply validated deterministic mission safety procedure.',
      });
    }

    const data = await openRouterResponse.json();
    const content = data.choices?.[0]?.message?.content || '';

    let parsedResult;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsedResult = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch (e) {
      parsedResult = {
        explanation: content.trim() || 'Anomaly detected in telemetry parameters.',
        riskLevel: severityScore > 0.8 ? 'HIGH' : 'MEDIUM',
        recommendedAction: 'Isolate subsystem and monitor telemetry link.',
      };
    }

    return res.status(200).json({
      isFallback: false,
      modelUsed: model,
      ...parsedResult,
    });

  } catch (error: any) {
    console.error('[Vercel Serverless /api/advisor] Error:', error);
    return res.status(200).json({
      isFallback: true,
      explanation: 'System telemetry anomaly flagged by TensorFlow.js autoencoder. Serverless advisor offline.',
      riskLevel: 'HIGH',
      recommendedAction: 'Isolate affected thermal/power subsystem via onboard rule engine.',
    });
  }
}
