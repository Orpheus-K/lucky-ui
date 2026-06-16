const fs = require('fs');
const path = require('path');
const { parse } = require('vue/compiler-sfc');

const root = path.join(process.cwd(), 'src');
const files = [];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }
    if (entry.isFile() && fullPath.endsWith('.vue')) {
      files.push(fullPath);
    }
  }
}

walk(root);

const bad = [];
for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const result = parse(source, { filename: file });
  if (Array.isArray(result.errors) && result.errors.length > 0) {
    bad.push({
      file,
      errors: result.errors.map(err => (typeof err === 'string' ? err : err.message || String(err))),
    });
  }
}

console.log(`VUE_TOTAL=${files.length}`);
console.log(`SFC_PARSE_ERRORS=${bad.length}`);

for (const item of bad) {
  console.log(item.file);
  for (const err of item.errors) {
    console.log(`  - ${err}`);
  }
}
