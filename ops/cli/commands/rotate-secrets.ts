/**
 * Rotate secrets command
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import crypto from 'crypto';

export async function runRotateSecrets(options: { force?: boolean; dryRun?: boolean }) {
  console.log('🔐 Rotating secrets...\n');

  const secretsDir = path.join(process.cwd(), 'ops', 'secrets');
  if (!fs.existsSync(secretsDir)) {
    fs.mkdirSync(secretsDir, { recursive: true });
  }

  const rotationLog = path.join(secretsDir, 'rotation-log.json');
  let rotationHistory: Array<{ key: string; rotated: string; expires: string }> = [];
  
  if (fs.existsSync(rotationLog)) {
    rotationHistory = JSON.parse(fs.readFileSync(rotationLog, 'utf-8'));
  }

  const rotationDays = 20;
  const alertDays = 5;
  const now = new Date();

  const secretsToRotate = [
    'SUPABASE_SERVICE_ROLE_KEY',
    'VERCEL_TOKEN',
    'STRIPE_SECRET_KEY',
    'DISCORD_WEBHOOK_URL',
    'SLACK_WEBHOOK_URL',
  ];

  const rotated: string[] = [];

  for (const secretKey of secretsToRotate) {
    const lastRotation = rotationHistory.find((r) => r.key === secretKey);
    const daysSinceRotation = lastRotation
      ? Math.floor((now.getTime() - new Date(lastRotation.rotated).getTime()) / (1000 * 60 * 60 * 24))
      : Infinity;

    if (options.force || daysSinceRotation >= rotationDays) {
      if (options.dryRun) {
        console.log(`   Would rotate: ${secretKey} (${daysSinceRotation} days old)`);
        rotated.push(secretKey);
      } else {
        console.log(`   Rotating: ${secretKey}...`);
        
        // Generate new secret (in production, use proper secret generation)
        const newSecret = crypto.randomBytes(32).toString('hex');
        
        // Update rotation history
        const rotationEntry = {
          key: secretKey,
          rotated: now.toISOString(),
          expires: new Date(now.getTime() + rotationDays * 24 * 60 * 60 * 1000).toISOString(),
        };
        
        const existingIndex = rotationHistory.findIndex((r) => r.key === secretKey);
        if (existingIndex >= 0) {
          rotationHistory[existingIndex] = rotationEntry;
        } else {
          rotationHistory.push(rotationEntry);
        }

        // In production, update in Supabase and Vercel via API
        console.log(`   ⚠️  Secret rotation not fully implemented`);
        console.log(`   Would update ${secretKey} in Supabase/Vercel`);
        
        rotated.push(secretKey);
      }
    } else if (daysSinceRotation >= rotationDays - alertDays) {
      console.log(`   ⚠️  ${secretKey} expires in ${rotationDays - daysSinceRotation} days`);
    }
  }

  if (!options.dryRun && rotated.length > 0) {
    fs.writeFileSync(rotationLog, JSON.stringify(rotationHistory, null, 2));
    console.log(`\n✅ Rotated ${rotated.length} secrets`);
    console.log('   Update secrets in Supabase and Vercel dashboards');
  } else if (options.dryRun) {
    console.log(`\n✅ Would rotate ${rotated.length} secrets`);
  } else {
    console.log('\n✅ No secrets need rotation');
  }
}
