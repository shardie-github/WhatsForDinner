/**
 * Secrets Management
 * 
 * Rotate secrets and push to Supabase + Vercel
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import crypto from 'crypto';
import { secretsManager } from './secrets-manager-unified.mjs';

const SECRETS_DIR = join(process.cwd(), 'ops', 'secrets');

interface SecretRotation {
  name: string;
  currentValue?: string;
  newValue: string;
  rotatedAt: string;
  expiresAt: string;
}

function generateSecret(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

function generateJWTSecret(): string {
  return crypto.randomBytes(64).toString('base64');
}

async function rotateSecrets(): Promise<SecretRotation[]> {
  const rotations: SecretRotation[] = [];
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000); // 20 days

  // Rotate SUPABASE_JWT_SECRET
  rotations.push({
    name: 'SUPABASE_JWT_SECRET',
    newValue: generateJWTSecret(),
    rotatedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString()
  });

  // Rotate STRIPE_WEBHOOK_SECRET
  rotations.push({
    name: 'STRIPE_WEBHOOK_SECRET',
    newValue: generateSecret(32),
    rotatedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString()
  });

  // Rotate ADMIN_JWT_SECRET
  rotations.push({
    name: 'ADMIN_JWT_SECRET',
    newValue: generateJWTSecret(),
    rotatedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString()
  });

  // Rotate DSAR_VERIFICATION_JWT_SECRET
  rotations.push({
    name: 'DSAR_VERIFICATION_JWT_SECRET',
    newValue: generateJWTSecret(),
    rotatedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString()
  });

  // Save rotation log
  const logPath = join(SECRETS_DIR, 'rotations.json');
  let rotationsLog: SecretRotation[] = [];
  if (existsSync(logPath)) {
    rotationsLog = JSON.parse(readFileSync(logPath, 'utf-8'));
  }
  rotationsLog.push(...rotations);
  writeFileSync(logPath, JSON.stringify(rotationsLog, null, 2));

  // Update Supabase secrets (via CLI)
  console.log('Updating Supabase secrets...');
  for (const rotation of rotations) {
    try {
      execSync(`supabase secrets set ${rotation.name}=${rotation.newValue}`, {
        stdio: 'inherit'
      });
    } catch (error) {
      console.error(`Failed to update ${rotation.name} in Supabase:`, error);
    }
  }

  // Update Vercel secrets (via API)
  console.log('Updating Vercel secrets...');
  const vercelToken = (await secretsManager.getSecret('VERCEL_TOKEN')) || process.env.VERCEL_TOKEN;
  const vercelProjectId = (await secretsManager.getSecret('VERCEL_PROJECT_ID')) || process.env.VERCEL_PROJECT_ID;
  const vercelOrgId = (await secretsManager.getSecret('VERCEL_ORG_ID')) || process.env.VERCEL_ORG_ID;

  if (vercelToken && vercelProjectId && vercelOrgId) {
    for (const rotation of rotations) {
      try {
        execSync(
          `vercel env add ${rotation.name} production ${rotation.newValue} --token ${vercelToken}`,
          { stdio: 'inherit' }
        );
      } catch (error) {
        console.error(`Failed to update ${rotation.name} in Vercel:`, error);
      }
    }
  }

  return rotations;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
}

function checkSecretRotation(): void {
  const logPath = join(SECRETS_DIR, 'rotations.json');
  if (!existsSync(logPath)) {
    console.log('⚠️  No rotation history found. Run ops rotate-secrets first.');
    return;
  }

  const rotations: SecretRotation[] = JSON.parse(readFileSync(logPath, 'utf-8'));
  const now = new Date();
  
  for (const rotation of rotations) {
    const expiresAt = new Date(rotation.expiresAt);
    const daysUntilExpiry = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry <= 20) {
      console.warn(`⚠️  ${rotation.name} expires in ${daysUntilExpiry} days`);
    }
  }
}

if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'rotate') {
    rotateSecrets().then(rotations => {
      console.log(`✅ Rotated ${rotations.length} secrets`);
      console.log('Rotated secrets:', rotations.map(r => r.name).join(', '));
    });
  } else if (command === 'check') {
    checkSecretRotation();
  } else {
    console.log('Usage: node secrets.ts [rotate|check]');
    process.exit(1);
  }
}

export { rotateSecrets, requireEnv, checkSecretRotation };
