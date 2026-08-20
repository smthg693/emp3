import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const keyMatch = envContent.match(/OPENROUTER_API_KEY=\s*([^\s]+)/);
const apiKey = keyMatch ? keyMatch[1] : '';

async function findFreeModels() {
  console.log('Fetching OpenRouter models list...');
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models');
    const data = await res.json();
    const models = data.data || [];

    const freeModels = models.filter((m) => 
      m.id.endsWith(':free') || 
      (m.pricing && m.pricing.prompt === '0' && m.pricing.completion === '0')
    );

    console.log(`Found ${freeModels.length} free models on OpenRouter:`);
    freeModels.forEach((m) => console.log(' - ' + m.id));

    // Test each found free model with user's key
    for (const fm of freeModels) {
      console.log(`\nTesting free model: ${fm.id} ...`);
      try {
        const testRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: fm.id,
            messages: [{ role: 'user', content: 'Respond with JSON: {"status": "ok"}' }],
            max_tokens: 30,
          }),
        });

        console.log('Status:', testRes.status);
        const text = await testRes.text();
        console.log('Response:', text.substring(0, 150));
        if (testRes.ok) {
          console.log(`🎉 WORKING FREE MODEL FOUND: ${fm.id}`);
          break;
        }
      } catch (err) {
        console.log('Error testing model:', err.message);
      }
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
}

findFreeModels();
