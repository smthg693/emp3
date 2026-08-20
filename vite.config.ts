import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'local-api-advisor-plugin',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/advisor' && req.method === 'POST') {
              let bodyStr = '';
              req.on('data', chunk => { bodyStr += chunk; });
              req.on('end', async () => {
                try {
                  const body = JSON.parse(bodyStr || '{}');
                  const apiKey = env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;
                  const model = env.OPENROUTER_MODEL || process.env.OPENROUTER_MODEL || 'openrouter/free';

                  const fallbackObj = {
                    isFallback: true,
                    explanation: `[Telemetry Guardrail] ${body.anomalyType || 'Subsystem Anomaly'} flagged (Severity: ${body.severityScore || 0.85}). Automated rule engine enforcing safety protocol.`,
                    riskLevel: (body.severityScore || 0.85) > 0.8 ? 'CRITICAL' : 'HIGH',
                    recommendedAction: 'Execute pre-approved emergency safety procedure immediately via onboard rule engine.',
                  };

                  if (!apiKey) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.end(JSON.stringify(fallbackObj));
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
                    anomalyType: body.anomalyType || 'Subsystem Anomaly',
                    severityScore: body.severityScore || 0.85,
                    telemetrySnapshot: body.telemetrySnapshot || {},
                  });

                  const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${apiKey}`,
                      'Content-Type': 'application/json',
                      'HTTP-Referer': 'http://localhost:3000',
                      'X-Title': 'Kepler Crew Mars Local Dev',
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
                    const errText = await openRouterResponse.text();
                    console.error('[Local Dev /api/advisor] OpenRouter API error:', openRouterResponse.status, errText);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.end(JSON.stringify(fallbackObj));
                  }

                  const data = await openRouterResponse.json();
                  console.log('[Local Dev /api/advisor] Raw OpenRouter Response:', JSON.stringify(data));

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
                      console.warn('[Local Dev /api/advisor] Failed to parse JSON:', e);
                    }
                  }

                  if (
                    !parsedResult ||
                    typeof parsedResult.explanation !== 'string' ||
                    typeof parsedResult.riskLevel !== 'string' ||
                    typeof parsedResult.recommendedAction !== 'string'
                  ) {
                    console.warn('[Local Dev /api/advisor] Parsed JSON missing required fields. Using fallback.');
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.end(JSON.stringify(fallbackObj));
                  }

                  const exp = parsedResult.explanation.trim();
                  const leakedReasoningPhrases = [
                    'we need to', 'we should', 'let\'s', 'thinking', 'reasoning',
                    'step 1', 'step 2', 'the user wants', 'i need to', 'we must'
                  ];

                  const hasLeakedReasoning = leakedReasoningPhrases.some(phrase => exp.toLowerCase().includes(phrase));
                  const endsWithPunctuation = /[.!?"]$/.test(exp);

                  if (hasLeakedReasoning || !endsWithPunctuation) {
                    console.warn('[Local Dev /api/advisor] Detected leaked reasoning or truncated text. Using fallback.');
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.end(JSON.stringify(fallbackObj));
                  }

                  const validRiskLevels = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
                  const riskLevel = validRiskLevels.includes(parsedResult.riskLevel.toUpperCase())
                    ? parsedResult.riskLevel.toUpperCase()
                    : ((body.severityScore || 0.85) > 0.8 ? 'CRITICAL' : 'HIGH');

                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  return res.end(JSON.stringify({
                    isFallback: false,
                    modelUsed: data.model || model,
                    explanation: exp,
                    riskLevel: riskLevel,
                    recommendedAction: parsedResult.recommendedAction.trim(),
                  }));

                } catch (err: any) {
                  console.error('[Local Dev /api/advisor] Error:', err);
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  return res.end(JSON.stringify({
                    isFallback: true,
                    explanation: 'Local Dev server error processing request.',
                    riskLevel: 'HIGH',
                    recommendedAction: 'Verify node fetch capability.',
                  }));
                }
              });
              return;
            }
            next();
          });
        }
      }
    ],
    base: './',
    server: {
      port: 3000,
      host: true
    }
  }
})
