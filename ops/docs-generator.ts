/**
 * Documentation Generator - Mermaid diagrams + endpoint examples + README
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { glob } from 'glob';
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('docs-generator-ts');
const DOCS_DIR = join(process.cwd(), 'ops', 'docs');

function generateMermaidDiagram(): string {
  return `graph TB
    A[User] -->|HTTPS| B[Vercel Edge]
    B -->|API Calls| C[Supabase]
    C -->|Auth| D[PostgreSQL]
    C -->|Storage| E[Supabase Storage]
    B -->|AI| F[OpenAI API]
    B -->|Payments| G[Stripe]
    B -->|Analytics| H[PostHog]
    B -->|Errors| I[Sentry]
`;
}

function generateEndpointExamples(): string {
  return `## API Endpoints

### Health Check
\`\`\`bash
GET /api/health
\`\`\`

### Get Recipes
\`\`\`bash
GET /api/recipes
Authorization: Bearer <token>
\`\`\`

### Create Recipe
\`\`\`bash
POST /api/recipes
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Pasta Carbonara",
  "ingredients": ["pasta", "eggs", "bacon"],
  "instructions": "..."
}
\`\`\`
`;
}

function generateWhyThisWins(): string {
  return `# Why This Wins

## 🚀 Performance
- **Edge-first architecture**: Sub-100ms response times globally
- **WASM Prisma**: Zero native dependencies, runs everywhere
- **Static export**: Lightning-fast page loads

## 🔒 Security
- **RLS enforced**: Row-level security on all tables
- **Automated audits**: Continuous security scanning
- **Secrets rotation**: 20-day rotation schedule

## 📊 Observability
- **OpenTelemetry**: Full request tracing
- **Real-time metrics**: P95 latency, error rates, costs
- **Automated dashboards**: Self-updating reports

## 🧪 Reliability
- **E2E tests**: Playwright + synthetic monitors
- **DR rehearsals**: Quarterly automated tests
- **Circuit breakers**: AI calls protected

## 💰 Monetization
- **Feature flags**: Instant pricing changes
- **A/B testing**: Built-in experimentation
- **Growth engine**: Cohort analysis + LTV tracking

## 🌍 Global Ready
- **i18n built-in**: Multi-language support
- **Compliance**: DSAR, GDPR, cookie consent
- **Store ready**: Play Store + App Store manifests
`;
}

async function generateDocs(): Promise<void> {
  
  if (!existsSync(DOCS_DIR)) {
    mkdirSync(DOCS_DIR, { recursive: true });
  }

  // Generate architecture diagram
  const mermaid = generateMermaidDiagram();
  writeFileSync(join(DOCS_DIR, 'architecture.md'), `# Architecture\n\n\`\`\`mermaid\n${mermaid}\n\`\`\`\n`);

  // Generate API docs
  const apiDocs = generateEndpointExamples();
  writeFileSync(join(DOCS_DIR, 'api.md'), apiDocs);

  // Generate "Why This Wins"
  const whyWins = generateWhyThisWins();
  writeFileSync(join(DOCS_DIR, 'why-this-wins.md'), whyWins);

  // Generate index.html
  const indexHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Ops Documentation</title>
  <style>
    body { font-family: sans-serif; max-width: 800px; margin: 40px auto; }
    h1 { color: #333; }
    ul { list-style: none; padding: 0; }
    li { margin: 10px 0; }
    a { color: #0070f3; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>Ops Documentation</h1>
  <ul>
    <li><a href="architecture.md">Architecture</a></li>
    <li><a href="api.md">API Endpoints</a></li>
    <li><a href="why-this-wins.md">Why This Wins</a></li>
    <li><a href="../runbooks/DR.md">DR Playbook</a></li>
  </ul>
</body>
</html>`;

  writeFileSync(join(DOCS_DIR, 'index.html'), indexHtml);

  }

if (require.main === module) {
  generateDocs().catch(error => {
    logger.error('Failed to generate docs:', { error });
    process.exit(1);
  });
}

export { generateDocs };
