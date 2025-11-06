/**
 * Init command - initialize ops framework
 */

import * as fs from 'fs';
import * as path from 'path';

export async function runInit(options: { force?: boolean }) {
  
  const opsDir = path.join(process.cwd(), 'ops');
  const configPath = path.join(opsDir, 'ops.config.json');

  // Create ops directory structure
  const dirs = [
    'ops/cli',
    'ops/commands',
    'ops/secrets',
    'ops/runbooks',
    'ops/docs',
    'ops/reports',
    'ops/store',
    'tests/reality',
    'tests/contracts',
    'partners',
  ];

  dirs.forEach((dir) => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
          }
  });

  // Create ops.config.json
  if (!fs.existsSync(configPath) || options.force) {
    const config = {
      version: '1.0.0',
      secrets: {
        rotationDays: 20,
        alertDays: 5,
      },
      performance: {
        budgets: {
          lcp: 2500,
          cls: 0.1,
          tbt: 300,
          jsSize: 170000,
        },
      },
      observability: {
        enabled: true,
        samplingRate: 0.1,
      },
      release: {
        semanticVersioning: true,
        generateChangelog: true,
      },
      dr: {
        rehearsalFrequency: 'quarterly',
        snapshotRetention: 30,
      },
    };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      }

  // Create .env.example if missing
  if (!fs.existsSync('.env.example')) {
    const envExample = `# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Vercel
VERCEL_TOKEN=
VERCEL_ORG_ID=
VERCEL_PROJECT_ID=

# Stripe (optional)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Observability
OTEL_EXPORTER_OTLP_ENDPOINT=
OTEL_SERVICE_NAME=whats-for-dinner

# Webhooks
DISCORD_WEBHOOK_URL=
SLACK_WEBHOOK_URL=

# Feature Flags
ENABLE_BILLING=false
ENABLE_QUIET_MODE=false
`;
    fs.writeFileSync('.env.example', envExample);
      }

  // Create .envrc template
  if (!fs.existsSync('.envrc')) {
    const envrc = `# Use direnv to load environment variables
# Run: direnv allow

# Load .env.local if exists
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
fi
`;
    fs.writeFileSync('.envrc', envrc);
      }

          }
