import fs from 'fs';
import path from 'path';

function scan(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scan(fullPath);
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      const text = fs.readFileSync(fullPath, 'utf8');
      const lines = text.split('\n');
      lines.forEach((line, i) => {
        // match km surrounded by non-quote chars
        if (/\bkm\b/.test(line)) {
          console.log(`${entry.name}:${i + 1} -> ${line.trim()}`);
        }
      });
    }
  }
}

scan('./src');
