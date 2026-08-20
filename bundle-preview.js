import fs from 'fs';
import path from 'path';

const distDir = './dist';
const assetsDir = './dist/assets';

const htmlContent = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
const files = fs.readdirSync(assetsDir);
const cssFile = files.find(f => f.endsWith('.css'));
const jsFile = files.find(f => f.endsWith('.js'));

const cssContent = fs.readFileSync(path.join(assetsDir, cssFile), 'utf8');
const jsContent = fs.readFileSync(path.join(assetsDir, jsFile), 'utf8');

// Replace CSS link tag with inline <style>
let singleHtml = htmlContent.replace(/<link rel="stylesheet"[^>]*>/, `<style>${cssContent}</style>`);

// Replace JS script tag with inline <script>
singleHtml = singleHtml.replace(/<script type="module"[^>]*><\/script>/, `<script>${jsContent.replace(/<\/script>/g, '<\\/script>')}</script>`);

fs.writeFileSync('./preview.html', singleHtml);
console.log('✓ Successfully created preview.html! File size:', (fs.statSync('./preview.html').size / 1024).toFixed(1), 'KB');
