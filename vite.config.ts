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

                  if (!apiKey) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.end(JSON.stringify({
                      isFallback: true,
                      explanation: `[Local Dev] OPENROUTER_API_KEY not found in .env.local. Add key to .env.local to enable live OpenRouter output.`,
                      riskLevel: 'HIGH',
                      recommendedAction: 'Add OPENROUTER_API_KEY=sk-or-v1-... to .env.local and save.',
                    }));
                  }

                  const systemPrompt = `You are an AI Spacecraft Systems Advisor for NASA/JPL Earth-Mars Mission Control.
Given an anomaly telemetry snapshot, analyze the situation and return a JSON object with:
1. "explanation": Concise 2-sentence explanation of why the parameter failed and its mission risk.
2. "riskLevel": One of "CRITICAL", "HIGH", "MEDIUM", or "LOW".
3. "recommendedAction": Specific safety recovery procedure mapped to spacecraft rules.

Respond ONLY with valid JSON.`;

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
                      temperature: 0.2,
                      max_tokens: 250,
                    }),
                  });

                  if (!openRouterResponse.ok) {
                    const errText = await openRouterResponse.text();
                    console.error('[Local Dev /api/advisor] OpenRouter API error:', openRouterResponse.status, errText);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.end(JSON.stringify({
                      isFallback: true,
                      explanation: `[OpenRouter Error ${openRouterResponse.status}] ${errText.substring(0, 120)}`,
                      riskLevel: 'HIGH',
                      recommendedAction: 'Check OpenRouter API key validity or model rate limits.',
                    }));
                  }

                  const data = await openRouterResponse.json();
                  const messageObj = data.choices?.[0]?.message || {};
                  const content = messageObj.content || messageObj.reasoning || '';

                  let parsedResult;
                  try {
                    const jsonMatch = content.match(/\{[\s\S]*\}/);
                    parsedResult = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
                  } catch (e) {
                    parsedResult = {
                      explanation: content.trim().substring(0, 180) || 'Telemetry anomaly flagged.',
                      riskLevel: 'HIGH',
                      recommendedAction: 'Execute safe-hold procedure.',
                    };
                  }

                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  return res.end(JSON.stringify({
                    isFallback: false,
                    modelUsed: data.model || model,
                    ...parsedResult,
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
