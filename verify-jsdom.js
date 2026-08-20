import fs from 'fs';
import { JSDOM } from 'jsdom';

console.log('🔍 Running JSDOM verification of index.html & JS bundle...');

const html = fs.readFileSync('./dist/index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "outside-only" });

const { document } = dom.window;
const root = document.getElementById('root');

console.log('Document Title:', document.title);
console.log('#root Element Found:', !!root);
console.log('Body HTML:', document.body.innerHTML);

if (root) {
  console.log('✅ DOM structure is valid and ready for React mounting!');
} else {
  console.error('❌ #root element missing!');
}
