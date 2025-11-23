#!/usr/bin/env tsx
/**
 * Environment Variable Inventory
 * 
 * Generates report of all required env vars, their consumers, and detects
 * dead/unused secrets.
 */

import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { glob } from 'glob';
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('env-inventory-ts');
interface EnvVar {
  name: string;
  required: boolean;
  consumers: string[];
  description?: string;
  maskValue?: boolean;
}

const REPORT_DIR = join(process.cwd(), 'reports', 'connectivity');
mkdirSync(REPORT_DIR, { recursive: true });

const envVars: EnvVar[] = [
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    consumers: [],
    description: 'Supabase project URL',
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    consumers: [],
    description: 'Supabase anonymous key (client-side safe)',
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    consumers: [],
    description: 'Supabase service role key (server-side only)',
    maskValue: true,
  },
  {
    name: 'SUPABASE_DB_URL',
    required: true,
    consumers: [],
    description: 'PostgreSQL connection string',
    maskValue: true,
  },
  {
    name: 'REDIS_URL',
    required: true,
    consumers: [],
    description: 'Redis connection URL',
    maskValue: true,
  },
  {
    name: 'STRIPE_SECRET_KEY',
    required: false,
    consumers: [],
    description: 'Stripe secret API key',
    maskValue: true,
  },
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    required: false,
    consumers: [],
    description: 'Stripe webhook signing secret',
    maskValue: true,
  },
  {
    name: 'OPENAI_API_KEY',
    required: false,
    consumers: [],
    description: 'OpenAI API key for meal generation',
    maskValue: true,
  },
  {
    name: 'SENDGRID_API_KEY',
    required: false,
    consumers: [],
    description: 'SendGrid API key for emails',
    maskValue: true,
  },
  {
    name: 'NEXT_PUBLIC_POSTHOG_KEY',
    required: false,
    consumers: [],
    description: 'PostHog analytics key',
  },
  {
    name: 'PARTNER_CONVERSION_HMAC_SECRET',
    required: false,
    consumers: [],
    description: 'HMAC secret for partner conversion webhooks',
    maskValue: true,
  },
  {
    name: 'LINK_SIGNING_SECRET',
    required: false,
    consumers: [],
    description: 'Secret for signing referral links',
    maskValue: true,
  },
  {
    name: 'DSAR_VERIFICATION_JWT_SECRET',
    required: false,
    consumers: [],
    description: 'JWT secret for DSAR verification',
    maskValue: true,
  },
  {
    name: 'ARTIFACTS_BUCKET_URL',
    required: false,
    consumers: [],
    description: 'Storage bucket URL for DSAR artifacts',
  },
  {
    name: 'OTEL_EXPORTER_OTLP_ENDPOINT',
    required: false,
    consumers: [],
    description: 'OpenTelemetry OTLP endpoint',
  },
];

async function findConsumers(envVar: string): Promise<string[]> {
  const consumers: string[] = [];
  
  // Search codebase for usage
  const patterns = [
    '**/*.ts',
    '**/*.tsx',
    '**/*.js',
    '**/*.jsx',
    '**/*.mjs',
  ];
  
  for (const pattern of patterns) {
    const files = await glob(pattern, {
      ignore: ['**/node_modules/**', '**/.next/**', '**/dist/**'],
    });
    
    for (const file of files) {
      try {
        const content = readFileSync(file, 'utf-8');
        if (content.includes(envVar) || content.includes(`process.env.${envVar}`)) {
          consumers.push(file);
        }
      } catch {
        // Skip unreadable files
      }
    }
  }
  
  return consumers;
}

async function main() {
    
  // Find consumers for each env var
  for (const envVar of envVars) {
    envVar.consumers = await findConsumers(envVar.name);
  }
  
  // Check which vars are set
  const setVars = envVars.map(v => ({
    ...v,
    isSet: !!process.env[v.name],
    value: v.isSet && !v.maskValue 
      ? process.env[v.name]?.substring(0, 50)
      : v.isSet
      ? `${process.env[v.name]?.substring(0, 8)}...${process.env[v.name]?.substring(process.env[v.name]!.length - 4)}`
      : 'NOT SET',
  }));
  
  // Generate Markdown report
  const markdown = `# Environment Variable Inventory

Generated: ${new Date().toISOString()}

## Summary

- **Total Variables**: ${envVars.length}
- **Required**: ${envVars.filter(v => v.required).length}
- **Optional**: ${envVars.filter(v => !v.required).length}
- **Set**: ${setVars.filter(v => v.isSet).length}
- **Missing Required**: ${setVars.filter(v => v.required && !v.isSet).length}

## Variables

| Name | Required | Set | Description | Consumers |
|------|----------|-----|-------------|-----------|
${setVars.map(v => `| \`${v.name}\` | ${v.required ? '?' : '?'} | ${v.isSet ? '?' : '?'} | ${v.description || '-'} | ${v.consumers.length} file(s) |`).join('\n')}

## Details

${setVars.map(v => {
  if (!v.isSet && v.required) {
    return `### ?? ${v.name} (MISSING - REQUIRED)
- **Description**: ${v.description || 'No description'}
- **Consumers**: ${v.consumers.length > 0 ? v.consumers.slice(0, 5).join(', ') : 'None found'}
${v.consumers.length > 5 ? `- ... and ${v.consumers.length - 5} more` : ''}
`;
  }
  return '';
}).filter(Boolean).join('\n')}

## Dead Secrets Detection

Variables with no consumers found:

${envVars.filter(v => v.consumers.length === 0).map(v => `- \`${v.name}\` - No consumers found (may be unused or loaded dynamically)`).join('\n')}

## Recommendations

${setVars.filter(v => v.required && !v.isSet).map(v => 
  `1. **Set ${v.name}** - Required for: ${v.description || 'core functionality'}`
).join('\n')}

${setVars.filter(v => !v.isSet && !v.required).map(v =>
  `1. **Consider setting ${v.name}** - Optional but recommended: ${v.description || 'additional features'}`
).join('\n')}
`;
  
  writeFileSync(
    join(REPORT_DIR, 'env_inventory.md'),
    markdown,
  );
  
  // Generate JSON report
  writeFileSync(
    join(REPORT_DIR, 'env_inventory.json'),
    JSON.stringify({ timestamp: new Date().toISOString(), vars: setVars }, null, 2),
  );
  
  logger.info('\nEnvironment Variables Inventory:');
  logger.info('Total: ${setVars.length}', { Set: ${setVars.filter(v => v.isSet }).length}, Missing: ${setVars.filter(v => !v.isSet).length}`);
  
  const missingRequired = setVars.filter(v => v.required && !v.isSet);
  if (missingRequired.length > 0) {
        process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}` || require.main === module) {
  main().catch((error) => {
    logger.error('Fatal error:', { error });
    process.exit(1);
  });
}

// Removed unused export - not imported anywhere
// export { main as generateEnvInventory };
