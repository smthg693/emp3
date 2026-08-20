import fs from 'fs';
import path from 'path';

try {
  const binDir = path.join(process.cwd(), 'node_modules', '.bin');
  if (fs.existsSync(binDir) && process.platform !== 'win32') {
    const files = fs.readdirSync(binDir);
    for (const f of files) {
      try {
        fs.chmodSync(path.join(binDir, f), 0o755);
      } catch (e) {}
    }
  }
} catch (e) {}
