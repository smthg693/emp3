import fs from 'fs';
import path from 'path';

console.log('Inspecting built index.html and JS assets...');
const distHtml = fs.readFileSync('./dist/index.html', 'utf8');
console.log('Dist HTML:', distHtml);

const assets = fs.readdirSync('./dist/assets');
console.log('Dist Assets:', assets);

for (const f of assets) {
  if (f.endsWith('.js')) {
    const jsContent = fs.readFileSync('./dist/assets/' + f, 'utf8');
    console.log('JS Bundle size:', jsContent.length, 'bytes');
    
    // Check if there are any undefined variable references or unescaped tokens
    if (jsContent.includes('window.process') || jsContent.includes('process.env')) {
      console.warn('Warning: process.env reference found in bundle');
    }
  }
}
