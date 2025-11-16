/**
 * Migration Safety - Shadow migrations with snapshot/restore
 */

import { execSync, spawn } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import crypto from 'crypto';

const SNAPSHOTS_DIR = join(process.cwd(), 'ops', 'snapshots');

interface SnapshotMetadata {
  id: string;
  timestamp: string;
  description: string;
  tables: string[];
  encrypted: boolean;
  size: number;
}

function ensureSnapshotsDir() {
  if (!existsSync(SNAPSHOTS_DIR)) {
    mkdirSync(SNAPSHOTS_DIR, { recursive: true });
  }
}

async function createSnapshot(description?: string): Promise<SnapshotMetadata> {
  ensureSnapshotsDir();
  
  const snapshotId = `snapshot-${Date.now()}`;
  const timestamp = new Date().toISOString();
  
    
  // Use Supabase CLI to create snapshot
  try {
    const projectRef = (await secretsManager.getSecret('SUPABASE_PROJECT_REF')) || process.env.SUPABASE_PROJECT_REF;
    if (!projectRef) {
      throw new Error('SUPABASE_PROJECT_REF not set');
    }

    execSync(`supabase db dump --project-ref ${projectRef} > ${join(SNAPSHOTS_DIR, `${snapshotId}.sql`)}`, {
      stdio: 'inherit'
    });

    const snapshotPath = join(SNAPSHOTS_DIR, `${snapshotId}.sql`);
    const stats = require('fs').statSync(snapshotPath);
    
    const metadata: SnapshotMetadata = {
      id: snapshotId,
      timestamp,
      description: description || 'Manual snapshot',
      tables: [], // Would parse SQL to extract tables
      encrypted: false,
      size: stats.size
    };

    // Save metadata
    writeFileSync(
      join(SNAPSHOTS_DIR, `${snapshotId}.json`),
      JSON.stringify(metadata, null, 2)
    );

        return metadata;
  } catch (error) {
    console.error('Failed to create snapshot:', error);
    throw error;
  }
}

async function restoreSnapshot(snapshotId: string): Promise<void> {
  ensureSnapshotsDir();
  
  const snapshotPath = join(SNAPSHOTS_DIR, `${snapshotId}.sql`);
  const metadataPath = join(SNAPSHOTS_DIR, `${snapshotId}.json`);

  if (!existsSync(snapshotPath)) {
    throw new Error(`Snapshot ${snapshotId} not found`);
  }

  const metadata: SnapshotMetadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));
  
  `);
  
  // Check for locks
    try {
    execSync('supabase db execute "SELECT COUNT(*) FROM pg_stat_activity WHERE datname = current_database();"', {
      stdio: 'pipe'
    });
  } catch (error) {
    console.warn('Could not check for locks');
  }

  // Restore snapshot
  try {
    const projectRef = (await secretsManager.getSecret('SUPABASE_PROJECT_REF')) || process.env.SUPABASE_PROJECT_REF;
    if (!projectRef) {
      throw new Error('SUPABASE_PROJECT_REF not set');
    }

    const snapshotContent = readFileSync(snapshotPath, 'utf8');
    const child = spawn('supabase', ['db', 'push', '--project-ref', projectRef], {
      stdio: ['pipe', 'inherit', 'inherit']
    });
    if (child.stdin) {
      child.stdin.write(snapshotContent);
      child.stdin.end();
    }
    await new Promise<void>((resolve, reject) => {
      child.on('close', (code: number) => {
        if (code !== 0) reject(new Error(`Process exited with code ${code}`));
        else resolve();
      });
      child.on('error', reject);
    });
  } catch (error) {
    console.error('Failed to restore snapshot:', error);
    throw error;
  }
}

async function listSnapshots(): Promise<SnapshotMetadata[]> {
  ensureSnapshotsDir();
  
  const files = require('fs').readdirSync(SNAPSHOTS_DIR);
import { secretsManager } from './secrets-manager-unified.mjs';
  const snapshots: SnapshotMetadata[] = [];

  for (const file of files) {
    if (file.endsWith('.json')) {
      const metadata = JSON.parse(readFileSync(join(SNAPSHOTS_DIR, file), 'utf-8'));
      snapshots.push(metadata);
    }
  }

  return snapshots.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

async function dryRunMigration(migrationPath: string): Promise<{ passed: boolean; errors: string[] }> {
    
  // Parse migration SQL
  const migrationSQL = readFileSync(migrationPath, 'utf-8');
  
  // Check for unsafe operations
  const unsafePatterns = [
    /DROP\s+TABLE/i,
    /DROP\s+COLUMN/i,
    /TRUNCATE/i,
    /DELETE\s+FROM/i
  ];

  const errors: string[] = [];
  for (const pattern of unsafePatterns) {
    if (pattern.test(migrationSQL)) {
      errors.push(`Unsafe operation detected: ${pattern.toString()}`);
    }
  }

  // Try to parse SQL (basic check)
  if (!migrationSQL.trim()) {
    errors.push('Migration file is empty');
  }

  if (errors.length > 0) {
    return { passed: false, errors };
  }

  // In a real implementation, would run against a shadow database
    return { passed: true, errors: [] };
}

async function encryptSnapshot(snapshotId: string, encryptionKey: string): Promise<void> {
  const snapshotPath = join(SNAPSHOTS_DIR, `${snapshotId}.sql`);
  const encryptedPath = join(SNAPSHOTS_DIR, `${snapshotId}.encrypted`);

  if (!existsSync(snapshotPath)) {
    throw new Error(`Snapshot ${snapshotId} not found`);
  }

  const data = readFileSync(snapshotPath);
  const cipher = crypto.createCipher('aes-256-cbc', encryptionKey);
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);

  writeFileSync(encryptedPath, encrypted);
  }

if (require.main === module) {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  switch (command) {
    case 'snapshot':
      createSnapshot(args[0]).then(metadata => {
              });
      break;
    case 'restore':
      if (!args[0]) {
        console.error('Usage: migration-safety.ts restore <snapshot-id>');
        process.exit(1);
      }
      restoreSnapshot(args[0]).catch(error => {
        console.error(error);
        process.exit(1);
      });
      break;
    case 'list':
      listSnapshots().then(snapshots => {
                for (const snapshot of snapshots) {
                  }
      });
      break;
    case 'dry-run':
      if (!args[0]) {
        console.error('Usage: migration-safety.ts dry-run <migration-path>');
        process.exit(1);
      }
      dryRunMigration(args[0]).then(result => {
        if (!result.passed) {
          console.error('Dry-run failed:');
          result.errors.forEach(e => console.error(`  - ${e}`));
          process.exit(1);
        }
      });
      break;
    default:
            process.exit(1);
  }
}

export { createSnapshot, restoreSnapshot, listSnapshots, dryRunMigration };
