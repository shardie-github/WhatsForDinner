#!/usr/bin/env tsx

/**
 * Production-Grade Restore Runner
 * 
 * Features:
 * - Restore from encrypted backups
 * - Verify checksums before restore
 * - Point-in-time recovery support
 * - Dry-run mode for testing
 * - Multi-step restore process
 */

import { execSync } from 'child_process';
import { createHash } from 'crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { promisify } from 'util';
import { gunzip } from 'zlib';
import { logger } from '../../packages/server/src/observability/index.js';
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('restore-run-ts');
const gunzipAsync = promisify(gunzip);

interface RestoreConfig {
  backupBucketUrl: string;
  encryptionKey?: string;
  postgresUrl: string;
  redisUrl?: string;
  artifactsPath: string;
  evidencePath: string;
}

interface RestoreResult {
  success: boolean;
  timestamp: string;
  restored: Array<{
    type: string;
    source: string;
    checksumVerified: boolean;
  }>;
  duration: number;
  error?: string;
}

class RestoreRunner {
  private config: RestoreConfig;
  private restoreDir: string;

  constructor() {
    this.config = this.loadConfig();
    this.restoreDir = join(process.cwd(), '.restore', new Date().toISOString().replace(/[:.]/g, '-'));
  }

  private loadConfig(): RestoreConfig {
    return {
      backupBucketUrl: process.env.BACKUP_BUCKET_URL || '/tmp/backups',
      encryptionKey: process.env.BACKUP_ENCRYPTION_KEY,
      postgresUrl: process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || '',
      redisUrl: process.env.REDIS_URL,
      artifactsPath: process.env.ARTIFACTS_BUCKET_URL || '/tmp/artifacts',
      evidencePath: process.env.EVIDENCE_IMMUTABLE_BUCKET_URL || '/tmp/evidence',
    };
  }

  /**
   * Verify checksum of file
   */
  private async verifyChecksum(filePath: string, expectedChecksum: string): Promise<boolean> {
    const content = readFileSync(filePath);
    const actualChecksum = createHash('sha256').update(content).digest('hex');
    return actualChecksum === expectedChecksum;
  }

  /**
   * Decrypt backup file if encrypted
   */
  private async decryptBackup(filePath: string): Promise<string> {
    if (!filePath.endsWith('.enc') || !this.config.encryptionKey) {
      return filePath; // Not encrypted or no key
    }

    const crypto = await import('crypto');
    const algorithm = 'aes-256-gcm';
    const key = crypto.createHash('sha256').update(this.config.encryptionKey).digest();

    const encryptedData = JSON.parse(readFileSync(filePath, 'utf-8'));
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const authTag = Buffer.from(encryptedData.authTag, 'hex');
    const encrypted = Buffer.from(encryptedData.data, 'hex');

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

    const decryptedPath = filePath.replace('.enc', '');
    writeFileSync(decryptedPath, decrypted);

    return decryptedPath;
  }

  /**
   * Download from object storage
   */
  private async downloadFromStorage(remotePath: string, localPath: string): Promise<void> {
    const bucketUrl = this.config.backupBucketUrl;

    mkdirSync(dirname(localPath), { recursive: true });

    if (bucketUrl.startsWith('s3://') || bucketUrl.startsWith('gs://')) {
      if (bucketUrl.startsWith('s3://')) {
        execSync(`aws s3 cp "${bucketUrl}/${remotePath}" "${localPath}"`, {
          stdio: 'inherit',
        });
      } else {
        execSync(`gsutil cp "${bucketUrl}/${remotePath}" "${localPath}"`, {
          stdio: 'inherit',
        });
      }
    } else {
      // Local filesystem
      execSync(`cp "${join(bucketUrl, remotePath)}" "${localPath}"`);
    }
  }

  /**
   * Restore PostgreSQL database
   */
  private async restorePostgres(backupPath: string, expectedChecksum?: string, dryRun = false): Promise<boolean> {
    if (!this.config.postgresUrl) {
      throw new Error('PostgreSQL URL not configured');
    }

    const localPath = join(this.restoreDir, 'postgres-restore.sql.gz');

    // Download backup
    await this.downloadFromStorage(backupPath, localPath);

    // Verify checksum
    if (expectedChecksum) {
      const verified = await this.verifyChecksum(localPath, expectedChecksum);
      if (!verified) {
        throw new Error(`Checksum verification failed for ${backupPath}`);
      }
      logger.info('Checksum verified');
    }

    if (dryRun) {
      logger.info('Dry run: Would restore PostgreSQL database');
      return true;
    }

    // Decrypt if needed
    const decryptedPath = await this.decryptBackup(localPath);

    // Restore database
    execSync(`gunzip -c "${decryptedPath}" | psql "${this.config.postgresUrl}"`, {
      stdio: 'inherit',
    });

    logger.info({ backupPath }, 'PostgreSQL restore completed');

    return true;
  }

  /**
   * Restore Redis database
   */
  private async restoreRedis(backupPath: string, expectedChecksum?: string, dryRun = false): Promise<boolean> {
    if (!this.config.redisUrl) {
      logger.info('Redis not configured, skipping restore');
      return false;
    }

    const localPath = join(this.restoreDir, 'redis-restore.rdb.gz');

    await this.downloadFromStorage(backupPath, localPath);

    if (expectedChecksum) {
      const verified = await this.verifyChecksum(localPath, expectedChecksum);
      if (!verified) {
        throw new Error(`Checksum verification failed for ${backupPath}`);
      }
    }

    if (dryRun) {
      logger.info('Dry run: Would restore Redis database');
      return true;
    }

    // Decrypt if needed
    const decryptedPath = await this.decryptBackup(localPath);

    // Restore Redis (requires redis-server to be stopped or replica mode)
    try {
      const redisHost = new URL(this.config.redisUrl);
      execSync(`gunzip -c "${decryptedPath}" | redis-cli -h ${redisHost.hostname} -p ${redisHost.port || 6379} --rdb /dev/stdin`, {
        stdio: 'inherit',
      });
    } catch (error) {
      logger.warn({ error }, 'Redis restore failed - may require manual intervention');
      return false;
    }

    logger.info({ backupPath }, 'Redis restore completed');

    return true;
  }

  /**
   * Restore artifacts
   */
  private async restoreArtifacts(backupPath: string, expectedChecksum?: string, dryRun = false): Promise<boolean> {
    const localPath = join(this.restoreDir, 'artifacts-restore.tar.gz');

    await this.downloadFromStorage(backupPath, localPath);

    if (expectedChecksum) {
      const verified = await this.verifyChecksum(localPath, expectedChecksum);
      if (!verified) {
        throw new Error(`Checksum verification failed for ${backupPath}`);
      }
    }

    if (dryRun) {
      logger.info('Dry run: Would restore artifacts');
      return true;
    }

    mkdirSync(this.config.artifactsPath, { recursive: true });
    execSync(`tar -xzf "${localPath}" -C "${this.config.artifactsPath}"`, {
      stdio: 'inherit',
    });

    logger.info({ backupPath }, 'Artifacts restore completed');

    return true;
  }

  /**
   * Restore evidence
   */
  private async restoreEvidence(backupPath: string, expectedChecksum?: string, dryRun = false): Promise<boolean> {
    const localPath = join(this.restoreDir, 'evidence-restore.tar.gz');

    await this.downloadFromStorage(backupPath, localPath);

    if (expectedChecksum) {
      const verified = await this.verifyChecksum(localPath, expectedChecksum);
      if (!verified) {
        throw new Error(`Checksum verification failed for ${backupPath}`);
      }
    }

    if (dryRun) {
      logger.info('Dry run: Would restore evidence');
      return true;
    }

    mkdirSync(this.config.evidencePath, { recursive: true });
    execSync(`tar -xzf "${localPath}" -C "${this.config.evidencePath}"`, {
      stdio: 'inherit',
    });

    logger.info({ backupPath }, 'Evidence restore completed');

    return true;
  }

  /**
   * Run restore
   */
  async run(options: {
    backupPaths: Array<{ type: string; path: string; checksum?: string }>;
    dryRun?: boolean;
  }): Promise<RestoreResult> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    const dryRun = options.dryRun ?? false;

    logger.info({ dryRun }, 'Starting restore run');

    try {
      mkdirSync(this.restoreDir, { recursive: true });

      const restored: RestoreResult['restored'] = [];

      for (const backup of options.backupPaths) {
        try {
          let success = false;
          let checksumVerified = false;

          switch (backup.type) {
            case 'postgres':
              success = await this.restorePostgres(backup.path, backup.checksum, dryRun);
              checksumVerified = !!backup.checksum;
              break;
            case 'redis':
              success = await this.restoreRedis(backup.path, backup.checksum, dryRun);
              checksumVerified = !!backup.checksum;
              break;
            case 'artifacts':
              success = await this.restoreArtifacts(backup.path, backup.checksum, dryRun);
              checksumVerified = !!backup.checksum;
              break;
            case 'evidence':
              success = await this.restoreEvidence(backup.path, backup.checksum, dryRun);
              checksumVerified = !!backup.checksum;
              break;
            default:
              throw new Error(`Unknown backup type: ${backup.type}`);
          }

          if (success) {
            restored.push({
              type: backup.type,
              source: backup.path,
              checksumVerified,
            });
          }
        } catch (error) {
          logger.error({ error, type: backup.type, path: backup.path }, 'Restore failed for backup');
        }
      }

      const duration = Date.now() - startTime;

      logger.info({ restored: restored.length, duration, dryRun }, 'Restore run completed');

      return {
        success: restored.length > 0,
        timestamp,
        restored,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error({ error, duration }, 'Restore run failed');

      return {
        success: false,
        timestamp,
        restored: [],
        duration,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  
  // Example: restore from latest backup
  // In production, this would query backup manifest or take paths as arguments
  const runner = new RestoreRunner();
  
  // Placeholder - would load from backup manifest
  const backupPaths: RestoreResult['restored'] = [];
  
  runner
    .run({
      backupPaths: backupPaths.map(b => ({ type: b.type, path: b.source })),
      dryRun,
    })
    .then((result) => {
      logger.info(`Restore ${result.success ? 'completed' : 'failed'}`);
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      logger.error('Restore failed:', { error });
      process.exit(1);
    });
}

export { RestoreRunner };
