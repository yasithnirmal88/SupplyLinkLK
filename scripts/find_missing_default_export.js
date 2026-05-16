const fs = require('fs');
const path = require('path');

const base = path.resolve(process.cwd(), 'apps/mobile/app');

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...walk(full));
    else if (e.isFile() && (full.endsWith('.tsx') || full.endsWith('.ts'))) files.push(full);
  }
  return files;
}

if (!fs.existsSync(base)) {
  console.error('PATH_NOT_FOUND', base);
  process.exit(2);
}

const files = walk(base);
const missing = [];
for (const f of files) {
  try {
    const content = fs.readFileSync(f, 'utf8');
    if (!/export\s+default/.test(content)) missing.push(f);
  } catch (err) {
    // ignore
  }
}

if (missing.length === 0) {
  console.log('NO_MISSING_EXPORT_DEFAULT');
} else {
  missing.forEach(m => console.log(m));
}
