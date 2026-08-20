import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    const model = process.env.OPENROUTER_MODEL || 'openrouter/free';

    const fallbackObj = {
      isFallback: true,
      explanation: `[Telemetry Guardrail] ${anomalyType || 'Subsystem Anomaly'} flagged (Severity: ${severityScore || 0.85}). Automated rule engine enforcing safety protocol.`,
      riskLevel: severityScore > 0.8 ? 'CRITICAL' : 'HIGH',
      recommendedAction: 'Execute pre-approved emergency safety procedure immediately via onboard rule engine.',
    };

    if (!apiKey) {
      console.warn('[Vercel Serverless /api/advisor] OPENROUTER_API_KEY not set. Serving fallback guidance.');
      return res.status(200).json(fallbackObj);
    }

    const systemPrompt = `You are an AI Spacecraft Systems Advisor for NASA/JPL Earth-Mars Mission Control.
Respond with ONLY a valid JSON object. Do not include any reasoning, planning, or explanation of your process outside the JSON. Do not think out loud. Output the final JSON directly, nothing before or after it.

Required JSON shape:
{
  "explanation": "A concise 2-sentence explanation of why the parameter failed and its mission risk.",
  "riskLevel": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "recommendedAction": "Specific safety recovery procedure mapped to spacecraft rules."
}`;

    const userPrompt = JSON.stringify({
      anomalyType: anomalyType || 'Subsystem Anomaly',
      severityScore: severityScore || 0.85,
      telemetrySnapshot: telemetrySnapshot || {},
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
        response_format: { type: 'json_object' },
        temperature: 0.2,
        max_tokens: 600,
      }),
    });

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      console.error(`[Vercel /api/advisor] OpenRouter HTTP ${openRouterResponse.status}:`, errorText);
      return res.status(200).json(fallbackObj);
    }

    const data = await openRouterResponse.json();
    console.log('[Vercel /api/advisor] Raw OpenRouter Response:', JSON.stringify(data));

    const choice = data.choices?.[0];
    const rawContent = choice?.message?.content;

    let parsedResult: { explanation?: string; riskLevel?: string; recommendedAction?: string } | null = null;

    if (typeof rawContent === 'string' && rawContent.trim()) {
      try {
        let cleaned = rawContent.trim();
        cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleaned = jsonMatch[0];
        }
        parsedResult = JSON.parse(cleaned);
      } catch (e) {
        console.warn('[Vercel /api/advisor] Failed to parse JSON from content:', e);
      }
    }

    if (
      !parsedResult ||
      typeof parsedResult.explanation !== 'string' ||
      typeof parsedResult.riskLevel !== 'string' ||
      typeof parsedResult.recommendedAction !== 'string'
    ) {
      console.warn('[Vercel /api/advisor] Parsed JSON missing required fields. Using fallback.');
      return res.status(200).json(fallbackObj);
    }

    const exp = parsedResult.explanation.trim();
    const leakedReasoningPhrases = [
      'we need to', 'we should', 'let\'s', 'thinking', 'reasoning',
      'step 1', 'step 2', 'the user wants', 'i need to', 'we must'
    ];

    const hasLeakedReasoning = leakedReasoningPhrases.some(phrase => exp.toLowerCase().includes(phrase));
    const endsWithPunctuation = /[.!?"]$/.test(exp);

    if (hasLeakedReasoning || !endsWithPunctuation) {
      console.warn('[Vercel /api/advisor] Detected leaked reasoning or truncated explanation text. Using fallback.');
      return res.status(200).json(fallbackObj);
    }

    const validRiskLevels = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
    const riskLevel = validRiskLevels.includes(parsedResult.riskLevel.toUpperCase())
      ? parsedResult.riskLevel.toUpperCase()
      : (severityScore > 0.8 ? 'CRITICAL' : 'HIGH');

    return res.status(200).json({
      isFallback: false,
      modelUsed: data.model || model,
      explanation: exp,
      riskLevel: riskLevel,
      recommendedAction: parsedResult.recommendedAction.trim(),
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
