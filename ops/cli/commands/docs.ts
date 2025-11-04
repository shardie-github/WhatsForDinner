/**
 * Docs command - generate documentation
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export async function runDocs(options: { rebuild?: boolean; watch?: boolean }) {
  console.log('📚 Generating documentation...\n');

  const docsDir = path.join(process.cwd(), 'ops', 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  try {
    // Generate API docs
    console.log('1️⃣ Generating API documentation...');
    if (fs.existsSync('scripts/api-generate.js')) {
      execSync('node scripts/api-generate.js', { stdio: 'inherit' });
    }

    // Generate runbooks
    console.log('\n2️⃣ Generating runbooks...');
    generateRunbooks(docsDir);

    // Generate HTML index
    console.log('\n3️⃣ Generating HTML index...');
    generateHTMLIndex(docsDir);

    if (options.watch) {
      console.log('\n👀 Watching for changes...');
      console.log('   ⚠️  Watch mode not yet implemented');
    }

    console.log(`\n✅ Documentation generated: ${docsDir}`);
    console.log(`   Open: ${path.join(docsDir, 'index.html')}`);
  } catch (error) {
    console.error('\n❌ Documentation generation failed:', error);
    process.exit(1);
  }
}

function generateRunbooks(docsDir: string) {
  const runbooksDir = path.join(process.cwd(), 'ops', 'runbooks');
  const runbooksHTML = path.join(docsDir, 'runbooks.html');

  if (!fs.existsSync(runbooksDir)) {
    fs.mkdirSync(runbooksDir, { recursive: true });
  }

  const runbooks = fs.readdirSync(runbooksDir).filter((f) => f.endsWith('.md'));
  
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Ops Runbooks</title>
  <style>
    body { font-family: system-ui; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; }
    .runbook { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
    .runbook h2 { margin-top: 0; }
  </style>
</head>
<body>
  <h1>Operations Runbooks</h1>
  ${runbooks.map((rb) => `<div class="runbook"><h2>${rb}</h2><p><a href="../ops/runbooks/${rb}">View</a></p></div>`).join('\n')}
</body>
</html>`;

  fs.writeFileSync(runbooksHTML, html);
}

function generateHTMLIndex(docsDir: string) {
  const indexHTML = path.join(docsDir, 'index.html');
  
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Ops Documentation</title>
  <style>
    body { font-family: system-ui; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; }
    .section { margin: 30px 0; }
    .section h2 { border-bottom: 2px solid #333; padding-bottom: 10px; }
    ul { list-style: none; padding: 0; }
    li { margin: 10px 0; }
    a { color: #0066cc; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>Operations Documentation</h1>
  
  <div class="section">
    <h2>Runbooks</h2>
    <ul>
      <li><a href="runbooks.html">All Runbooks</a></li>
      <li><a href="../ops/runbooks/DR.md">Disaster Recovery</a></li>
    </ul>
  </div>
  
  <div class="section">
    <h2>Reports</h2>
    <ul>
      <li><a href="../ops/reports/rls-audit.md">RLS Audit</a></li>
      <li><a href="../ops/reports/index.html">Dashboard</a></li>
    </ul>
  </div>
  
  <div class="section">
    <h2>CLI Commands</h2>
    <ul>
      <li><code>npm run ops doctor</code> - System health checks</li>
      <li><code>npm run ops check</code> - Run safety checks</li>
      <li><code>npm run ops release</code> - Semantic release</li>
      <li><code>npm run ops sb-guard</code> - RLS audit</li>
      <li><code>npm run ops test:e2e</code> - E2E tests</li>
    </ul>
  </div>
</body>
</html>`;

  fs.writeFileSync(indexHTML, html);
}
