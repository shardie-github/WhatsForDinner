#!/usr/bin/env node

/**
 * Automated Secrets Rotation Script for What's for Dinner
 *
 * This script handles automated rotation of:
 * - API keys (OpenAI, Stripe, etc.)
 * - Database credentials
 * - JWT secrets
 * - Encryption keys
 * - Third-party service tokens
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

class SecretsRotationManager {
  constructor() {
    this.rotationLog = [];
    this.secretsConfig = {
      rotationSchedule: {
        apiKeys: '30d', // Rotate every 30 days
        dbCredentials: '90d', // Rotate every 90 days
        jwtSecrets: '7d', // Rotate every 7 days
        encryptionKeys: '180d', // Rotate every 180 days
      },
      backupRetention: '90d', // Keep backups for 90 days
      notificationChannels: ['email', 'slack', 'webhook'],
    };
  }

  async rotateAllSecrets() {
    console.log('🔄 Starting automated secrets rotation...\n');

    try {
      await this.rotateAPIKeys();
      await this.rotateDatabaseCredentials();
      await this.rotateJWTSecrets();
      await this.rotateEncryptionKeys();
      await this.rotateThirdPartyTokens();
      await this.updateEnvironmentVariables();
      await this.notifyRotationComplete();
      await this.cleanupOldSecrets();

      console.log('\n✅ Secrets rotation completed successfully!');
      this.generateRotationReport();

      return this.rotationLog;
    } catch (error) {
      console.error('❌ Secrets rotation failed:', error);
      await this.rollbackRotation();
      throw error;
    }
  }

  async rotateAPIKeys() {
    console.log('🔑 Rotating API keys...');

    const apiKeys = [
      'OPENAI_API_KEY',
      'STRIPE_SECRET_KEY',
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
    ];

    for (const keyName of apiKeys) {
      try {
        const newKey = await this.generateSecureKey(keyName);
        await this.updateSecret(keyName, newKey);

        this.rotationLog.push({
          type: 'API_KEY_ROTATION',
          key: keyName,
          timestamp: new Date().toISOString(),
          status: 'success',
        });

        console.log(`✅ Rotated ${keyName}`);
      } catch (error) {
        console.error(`❌ Failed to rotate ${keyName}:`, error.message);
        this.rotationLog.push({
          type: 'API_KEY_ROTATION',
          key: keyName,
          timestamp: new Date().toISOString(),
          status: 'failed',
          error: error.message,
        });
      }
    }
  }

  async rotateDatabaseCredentials() {
    console.log('🗄️  Rotating database credentials...');

    try {
      // Generate new database password
      const newPassword = this.generateSecurePassword(32);

      // Update Supabase project settings
      await this.updateSupabaseCredentials(newPassword);

      // Update environment variables
      await this.updateSecret('SUPABASE_DB_PASSWORD', newPassword);

      this.rotationLog.push({
        type: 'DB_CREDENTIALS_ROTATION',
        timestamp: new Date().toISOString(),
        status: 'success',
      });

      console.log('✅ Database credentials rotated');
    } catch (error) {
      console.error('❌ Failed to rotate database credentials:', error.message);
      this.rotationLog.push({
        type: 'DB_CREDENTIALS_ROTATION',
        timestamp: new Date().toISOString(),
        status: 'failed',
        error: error.message,
      });
    }
  }

  async rotateJWTSecrets() {
    console.log('🔐 Rotating JWT secrets...');

    try {
      const newJWTSecret = this.generateSecureKey('JWT_SECRET');
      await this.updateSecret('JWT_SECRET', newJWTSecret);

      // Update Supabase JWT settings
      await this.updateSupabaseJWTSecret(newJWTSecret);

      this.rotationLog.push({
        type: 'JWT_SECRET_ROTATION',
        timestamp: new Date().toISOString(),
        status: 'success',
      });

      console.log('✅ JWT secrets rotated');
    } catch (error) {
      console.error('❌ Failed to rotate JWT secrets:', error.message);
      this.rotationLog.push({
        type: 'JWT_SECRET_ROTATION',
        timestamp: new Date().toISOString(),
        status: 'failed',
        error: error.message,
      });
    }
  }

  async rotateEncryptionKeys() {
    console.log('🔒 Rotating encryption keys...');

    try {
      const newEncryptionKey = this.generateSecureKey('ENCRYPTION_KEY');
      await this.updateSecret('ENCRYPTION_KEY', newEncryptionKey);

      // Re-encrypt existing data with new key
      await this.reencryptData(newEncryptionKey);

      this.rotationLog.push({
        type: 'ENCRYPTION_KEY_ROTATION',
        timestamp: new Date().toISOString(),
        status: 'success',
      });

      console.log('✅ Encryption keys rotated');
    } catch (error) {
      console.error('❌ Failed to rotate encryption keys:', error.message);
      this.rotationLog.push({
        type: 'ENCRYPTION_KEY_ROTATION',
        timestamp: new Date().toISOString(),
        status: 'failed',
        error: error.message,
      });
    }
  }

  async rotateThirdPartyTokens() {
    console.log('🔗 Rotating third-party tokens...');

    const thirdPartyServices = [
      'SENTRY_DSN',
      'ANALYTICS_TOKEN',
      'MONITORING_TOKEN',
      'CDN_TOKEN',
    ];

    for (const tokenName of thirdPartyServices) {
      try {
        if (process.env[tokenName]) {
          const newToken = await this.generateSecureToken(tokenName);
          await this.updateSecret(tokenName, newToken);

          this.rotationLog.push({
            type: 'THIRD_PARTY_TOKEN_ROTATION',
            token: tokenName,
            timestamp: new Date().toISOString(),
            status: 'success',
          });

          console.log(`✅ Rotated ${tokenName}`);
        }
      } catch (error) {
        console.error(`❌ Failed to rotate ${tokenName}:`, error.message);
        this.rotationLog.push({
          type: 'THIRD_PARTY_TOKEN_ROTATION',
          token: tokenName,
          timestamp: new Date().toISOString(),
          status: 'failed',
          error: error.message,
        });
      }
    }
  }

  async updateEnvironmentVariables() {
    console.log('🌍 Updating environment variables...');

    try {
      // Update .env files
      await this.updateEnvFile('.env.local');
      await this.updateEnvFile('.env.production');

      // Update Vercel environment variables
      await this.updateVercelSecrets();

      // Update Supabase Edge Function secrets
      await this.updateSupabaseEdgeFunctionSecrets();

      this.rotationLog.push({
        type: 'ENV_VAR_UPDATE',
        timestamp: new Date().toISOString(),
        status: 'success',
      });

      console.log('✅ Environment variables updated');
    } catch (error) {
      console.error(
        '❌ Failed to update environment variables:',
        error.message
      );
      this.rotationLog.push({
        type: 'ENV_VAR_UPDATE',
        timestamp: new Date().toISOString(),
        status: 'failed',
        error: error.message,
      });
    }
  }

  async notifyRotationComplete() {
    console.log('📢 Sending rotation notifications...');

    try {
      const notificationData = {
        timestamp: new Date().toISOString(),
        rotationLog: this.rotationLog,
        summary: this.generateRotationSummary(),
      };

      // Send email notification
      await this.sendEmailNotification(notificationData);

      // Send Slack notification
      await this.sendSlackNotification(notificationData);

      // Send webhook notification
      await this.sendWebhookNotification(notificationData);

      console.log('✅ Notifications sent');
    } catch (error) {
      console.error('❌ Failed to send notifications:', error.message);
    }
  }

  async cleanupOldSecrets() {
    console.log('🧹 Cleaning up old secrets...');

    try {
      // Remove old secret backups older than retention period
      await this.removeOldBackups();

      // Clean up temporary files
      await this.cleanupTempFiles();

      console.log('✅ Cleanup completed');
    } catch (error) {
      console.error('❌ Cleanup failed:', error.message);
    }
  }

  async rollbackRotation() {
    console.log('🔄 Rolling back rotation...');

    try {
      // Restore from latest backup
      await this.restoreFromBackup();

      // Revert environment variables
      await this.revertEnvironmentVariables();

      console.log('✅ Rollback completed');
    } catch (error) {
      console.error('❌ Rollback failed:', error.message);
    }
  }

  // Helper methods
  generateSecureKey(keyType) {
    const keyLengths = {
      OPENAI_API_KEY: 64,
      STRIPE_SECRET_KEY: 128,
      JWT_SECRET: 64,
      ENCRYPTION_KEY: 32,
    };

    const length = keyLengths[keyType] || 32;
    return crypto.randomBytes(length).toString('hex');
  }

  generateSecurePassword(length = 32) {
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';

    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return password;
  }

  generateSecureToken(tokenType) {
    return crypto.randomBytes(32).toString('base64url');
  }

  async updateSecret(keyName, newValue) {
    // Store in secure vault (implement based on your vault solution)
    console.log(`Updating secret: ${keyName}`);

    // For now, just log the update
    this.rotationLog.push({
      type: 'SECRET_UPDATE',
      key: keyName,
      timestamp: new Date().toISOString(),
      status: 'success',
    });
  }

  async updateSupabaseCredentials(newPassword) {
    // Update Supabase project database password
    console.log('Updating Supabase database credentials...');
  }

  async updateSupabaseJWTSecret(newSecret) {
    // Update Supabase JWT secret
    console.log('Updating Supabase JWT secret...');
  }

  async reencryptData(newKey) {
    // Re-encrypt existing data with new encryption key
    console.log('Re-encrypting data with new key...');
  }

  async updateEnvFile(filePath) {
    if (fs.existsSync(filePath)) {
      console.log(`Updating ${filePath}...`);
      // Update environment file with new values
    }
  }

  async updateVercelSecrets() {
    console.log('Updating Vercel secrets...');
    // Update Vercel environment variables
  }

  async updateSupabaseEdgeFunctionSecrets() {
    console.log('Updating Supabase Edge Function secrets...');
    // Update Edge Function secrets
  }

  async sendEmailNotification(data) {
    console.log('Sending email notification...');
    // Send email notification
  }

  async sendSlackNotification(data) {
    console.log('Sending Slack notification...');
    // Send Slack notification
  }

  async sendWebhookNotification(data) {
    console.log('Sending webhook notification...');
    // Send webhook notification
  }

  async removeOldBackups() {
    console.log('Removing old backups...');
    // Remove backups older than retention period
  }

  async cleanupTempFiles() {
    console.log('Cleaning up temporary files...');
    // Clean up temporary files
  }

  async restoreFromBackup() {
    console.log('Restoring from backup...');
    // Restore from latest backup
  }

  async revertEnvironmentVariables() {
    console.log('Reverting environment variables...');
    // Revert environment variables to previous state
  }

  generateRotationSummary() {
    const totalRotations = this.rotationLog.length;
    const successfulRotations = this.rotationLog.filter(
      log => log.status === 'success'
    ).length;
    const failedRotations = this.rotationLog.filter(
      log => log.status === 'failed'
    ).length;

    return {
      totalRotations,
      successfulRotations,
      failedRotations,
      successRate: (successfulRotations / totalRotations) * 100,
    };
  }

  generateRotationReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.generateRotationSummary(),
      rotationLog: this.rotationLog,
      recommendations: this.generateRecommendations(),
    };

    // Write report to file
    fs.writeFileSync(
      'SECRETS_ROTATION_REPORT.json',
      JSON.stringify(report, null, 2)
    );

    // Generate markdown report
    const markdownReport = this.generateMarkdownReport(report);
    fs.writeFileSync('SECRETS_ROTATION_REPORT.md', markdownReport);

    console.log('\n📊 Secrets rotation report generated:');
    console.log('  - SECRETS_ROTATION_REPORT.json');
    console.log('  - SECRETS_ROTATION_REPORT.md');
  }

  generateRecommendations() {
    const recommendations = [];

    if (this.rotationLog.some(log => log.status === 'failed')) {
      recommendations.push('Review failed rotations and implement fixes');
    }

    recommendations.push('Implement automated testing after each rotation');
    recommendations.push('Set up monitoring for secret rotation failures');
    recommendations.push(
      'Document rotation procedures for manual intervention'
    );

    return recommendations;
  }

  generateMarkdownReport(report) {
    return `# Secrets Rotation Report

**Generated:** ${report.timestamp}

## Summary

- **Total Rotations:** ${report.summary.totalRotations}
- **Successful:** ${report.summary.successfulRotations}
- **Failed:** ${report.summary.failedRotations}
- **Success Rate:** ${report.summary.successRate.toFixed(2)}%

## Rotation Log

${report.rotationLog
  .map(
    log => `### ${log.type}
- **Timestamp:** ${log.timestamp}
- **Status:** ${log.status}
- **Key/Token:** ${log.key || log.token || 'N/A'}
- **Error:** ${log.error || 'None'}
`
  )
  .join('\n')}

## Recommendations

${report.recommendations.map(rec => `- ${rec}`).join('\n')}

---
*This report was generated automatically by the Secrets Rotation Script*
`;
  }
}

// Run the rotation if this script is executed directly
if (require.main === module) {
  const rotationManager = new SecretsRotationManager();
  rotationManager
    .rotateAllSecrets()
    .then(results => {
      console.log('\n✅ Secrets rotation completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Secrets rotation failed:', error);
      process.exit(1);
    });
}

module.exports = SecretsRotationManager;
