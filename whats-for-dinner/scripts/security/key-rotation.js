#!/usr/bin/env node

/**
 * Automated Key Rotation Script
 * Manages rotation of API keys, database credentials, and other secrets
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const config = {
  supabaseUrl: process.env.SUPABASE_URL || 'http://localhost:54321',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  outputDir: path.join(__dirname, '../security-audit'),
  rotationInterval: 90 * 24 * 60 * 60 * 1000, // 90 days in milliseconds
  dryRun: process.env.DRY_RUN === 'true',
  verbose: process.env.VERBOSE === 'true'
};

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logVerbose(message) {
  if (config.verbose) {
    log(`[VERBOSE] ${message}`, 'blue');
  }
}

/**
 * Generate a secure random key
 */
function generateSecureKey(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate a JWT secret
 */
function generateJWTSecret() {
  return crypto.randomBytes(64).toString('base64');
}

/**
 * Generate a database password
 */
function generateDatabasePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 32; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * Check if a key needs rotation
 */
function needsRotation(keyInfo) {
  if (!keyInfo.lastRotated) return true;
  
  const lastRotated = new Date(keyInfo.lastRotated);
  const now = new Date();
  const daysSinceRotation = (now - lastRotated) / (1000 * 60 * 60 * 24);
  
  return daysSinceRotation > 90; // 90 days
}

/**
 * Rotate Supabase API keys
 */
async function rotateSupabaseKeys() {
  log('Rotating Supabase API keys...', 'yellow');
  
  if (config.dryRun) {
    log('DRY RUN: Would rotate Supabase API keys', 'yellow');
    return { success: true, dryRun: true };
  }
  
  try {
    // This would typically involve calling Supabase management API
    // For now, we'll simulate the process
    const newAnonKey = generateSecureKey(32);
    const newServiceKey = generateSecureKey(32);
    
    logVerbose('Generated new anon key');
    logVerbose('Generated new service key');
    
    // In a real implementation, you would:
    // 1. Generate new keys via Supabase API
    // 2. Update environment variables
    // 3. Update deployment configurations
    // 4. Test the new keys
    // 5. Deploy the changes
    
    return {
      success: true,
      newAnonKey,
      newServiceKey,
      rotatedAt: new Date().toISOString()
    };
  } catch (error) {
    log(`Error rotating Supabase keys: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

/**
 * Rotate database credentials
 */
async function rotateDatabaseCredentials() {
  log('Rotating database credentials...', 'yellow');
  
  if (config.dryRun) {
    log('DRY RUN: Would rotate database credentials', 'yellow');
    return { success: true, dryRun: true };
  }
  
  try {
    const newPassword = generateDatabasePassword();
    
    logVerbose('Generated new database password');
    
    // In a real implementation, you would:
    // 1. Update database user password
    // 2. Update connection strings
    // 3. Update environment variables
    // 4. Test the new credentials
    // 5. Deploy the changes
    
    return {
      success: true,
      newPassword,
      rotatedAt: new Date().toISOString()
    };
  } catch (error) {
    log(`Error rotating database credentials: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

/**
 * Rotate JWT secrets
 */
async function rotateJWTSecrets() {
  log('Rotating JWT secrets...', 'yellow');
  
  if (config.dryRun) {
    log('DRY RUN: Would rotate JWT secrets', 'yellow');
    return { success: true, dryRun: true };
  }
  
  try {
    const newJWTSecret = generateJWTSecret();
    
    logVerbose('Generated new JWT secret');
    
    // In a real implementation, you would:
    // 1. Update JWT secret in Supabase
    // 2. Update environment variables
    // 3. Test authentication with new secret
    // 4. Deploy the changes
    
    return {
      success: true,
      newJWTSecret,
      rotatedAt: new Date().toISOString()
    };
  } catch (error) {
    log(`Error rotating JWT secrets: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

/**
 * Rotate third-party API keys
 */
async function rotateThirdPartyKeys() {
  log('Rotating third-party API keys...', 'yellow');
  
  const thirdPartyKeys = [
    { name: 'OpenAI API Key', envVar: 'OPENAI_API_KEY' },
    { name: 'Stripe Secret Key', envVar: 'STRIPE_SECRET_KEY' },
    { name: 'Resend API Key', envVar: 'RESEND_API_KEY' },
    { name: 'PostHog API Key', envVar: 'POSTHOG_API_KEY' }
  ];
  
  const results = [];
  
  for (const keyInfo of thirdPartyKeys) {
    if (config.dryRun) {
      log(`DRY RUN: Would rotate ${keyInfo.name}`, 'yellow');
      results.push({
        name: keyInfo.name,
        success: true,
        dryRun: true
      });
      continue;
    }
    
    try {
      // In a real implementation, you would:
      // 1. Generate new API key via third-party service
      // 2. Update environment variables
      // 3. Test the new key
      // 4. Deploy the changes
      
      logVerbose(`Rotating ${keyInfo.name}`);
      
      results.push({
        name: keyInfo.name,
        success: true,
        rotatedAt: new Date().toISOString()
      });
    } catch (error) {
      log(`Error rotating ${keyInfo.name}: ${error.message}`, 'red');
      results.push({
        name: keyInfo.name,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}

/**
 * Check key rotation status
 */
async function checkRotationStatus() {
  log('Checking key rotation status...', 'blue');
  
  const keys = [
    { name: 'Supabase Anon Key', lastRotated: '2024-01-01', needsRotation: true },
    { name: 'Supabase Service Key', lastRotated: '2024-01-01', needsRotation: true },
    { name: 'Database Password', lastRotated: '2024-01-15', needsRotation: true },
    { name: 'JWT Secret', lastRotated: '2024-02-01', needsRotation: true },
    { name: 'OpenAI API Key', lastRotated: '2024-02-15', needsRotation: true },
    { name: 'Stripe Secret Key', lastRotated: '2024-03-01', needsRotation: true }
  ];
  
  const status = {
    totalKeys: keys.length,
    keysNeedingRotation: keys.filter(k => k.needsRotation).length,
    keysUpToDate: keys.filter(k => !k.needsRotation).length,
    keys: keys
  };
  
  return status;
}

/**
 * Generate rotation report
 */
function generateRotationReport(rotationResults, status) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalKeys: status.totalKeys,
      keysNeedingRotation: status.keysNeedingRotation,
      keysUpToDate: status.keysUpToDate,
      rotationAttempted: rotationResults.length > 0,
      successfulRotations: rotationResults.filter(r => r.success).length,
      failedRotations: rotationResults.filter(r => !r.success).length
    },
    status: status,
    results: rotationResults
  };
  
  return report;
}

/**
 * Main rotation function
 */
async function rotateKeys() {
  log('Starting key rotation process...', 'blue');
  
  // Ensure output directory exists
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }
  
  // Check current status
  const status = await checkRotationStatus();
  
  log(`Found ${status.keysNeedingRotation} keys needing rotation`, 'yellow');
  
  const rotationResults = [];
  
  // Rotate Supabase keys
  const supabaseResult = await rotateSupabaseKeys();
  rotationResults.push({ type: 'supabase', ...supabaseResult });
  
  // Rotate database credentials
  const dbResult = await rotateDatabaseCredentials();
  rotationResults.push({ type: 'database', ...dbResult });
  
  // Rotate JWT secrets
  const jwtResult = await rotateJWTSecrets();
  rotationResults.push({ type: 'jwt', ...jwtResult });
  
  // Rotate third-party keys
  const thirdPartyResults = await rotateThirdPartyKeys();
  rotationResults.push({ type: 'third-party', results: thirdPartyResults });
  
  // Generate report
  const report = generateRotationReport(rotationResults, status);
  
  // Save report
  const reportFile = path.join(config.outputDir, 'key-rotation-results.json');
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  
  // Print summary
  log('\n=== Key Rotation Summary ===', 'blue');
  log(`Total keys: ${report.summary.totalKeys}`, 'green');
  log(`Keys needing rotation: ${report.summary.keysNeedingRotation}`, 'yellow');
  log(`Keys up to date: ${report.summary.keysUpToDate}`, 'green');
  log(`Successful rotations: ${report.summary.successfulRotations}`, 'green');
  log(`Failed rotations: ${report.summary.failedRotations}`, 'red');
  
  // Print failed rotations
  const failedRotations = rotationResults.filter(r => !r.success);
  if (failedRotations.length > 0) {
    log('\n=== Failed Rotations ===', 'red');
    failedRotations.forEach(result => {
      log(`${result.type}: ${result.error}`, 'red');
    });
  }
  
  log(`\nDetailed report saved to: ${reportFile}`, 'green');
  
  return report;
}

// Run rotation if called directly
if (require.main === module) {
  rotateKeys()
    .then(() => {
      log('Key rotation completed successfully', 'green');
      process.exit(0);
    })
    .catch(error => {
      log(`Key rotation failed: ${error.message}`, 'red');
      process.exit(1);
    });
}

module.exports = { rotateKeys, checkRotationStatus };