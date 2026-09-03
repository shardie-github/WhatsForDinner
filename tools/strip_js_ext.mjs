import fs from 'fs';
import path from 'path';

function walk(dir) {
  let files = [];
  for (const item of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      files = files.concat(walk(fullPath));
    } else if (fullPath.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = walk('packages/server/src');
let modifiedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  const original = content;

  // Replace from './foo.js' or from '../foo.js' with from './foo'
  content = content.replace(/from\s+['"](\.[^'"]*?)\.js['"]/g, "from '$1'");
  content = content.replace(/import\s*\(\s*['"](\.[^'"]*?)\.js['"]\s*\)/g, "import('$1')");

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf-8');
    modifiedCount++;
  }
}

console.log(`Stripped .js from ${modifiedCount} files in packages/server/src`);
