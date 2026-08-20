import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const keyMatch = envContent.match(/OPENROUTER_API_KEY=\s*([^\s]+)/);
const apiKey = keyMatch ? keyMatch[1] : '';

async function testAutoFree() {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openrouter/free',
      messages: [
        { role: 'system', content: 'You are an AI Spacecraft Advisor. Respond in JSON with keys: explanation, riskLevel, recommendedAction.' },
        { role: 'user', content: 'Thermal Loop Overheat (+68.5°C)' }
      ],
      max_tokens: 150
    })
  });

  console.log('Status:', res.status);
  const data = await res.json();
  console.log('RESPONSE:', JSON.stringify(data, null, 2));
}

testAutoFree();
