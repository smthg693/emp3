import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const keyMatch = envContent.match(/OPENROUTER_API_KEY=\s*([^\s]+)/);
const apiKey = keyMatch ? keyMatch[1] : '';

console.log('API Key length:', apiKey.length);

const testModels = [
  'qwen/qwen-2.5-72b-instruct:free',
  'deepseek/deepseek-r1:free',
  'google/gemini-2.0-flash-exp:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  'meta-llama/llama-3.3-70b-instruct',
  'mistralai/mistral-7b-instruct:free'
];

async function test() {
  for (const m of testModels) {
    console.log(`\nTesting model: ${m} ...`);
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: m,
          messages: [{ role: 'user', content: 'Say hello in 5 words.' }],
          max_tokens: 50,
        }),
      });
      console.log('HTTP Status:', res.status);
      const text = await res.text();
      console.log('Response:', text.substring(0, 200));
      if (res.ok) {
        console.log(`🎉 MODEL SUCCESS: ${m}`);
        break;
      }
    } catch (e) {
      console.error('Error testing model', m, e.message);
    }
  }
}

test();
