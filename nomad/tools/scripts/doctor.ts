#!/usr/bin/env tsx

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
}

const results: CheckResult[] = [];

function check(name: string, fn: () => boolean | string): void {
  try {
    const result = fn();
    if (result === true) {
      results.push({ name, status: 'pass', message: 'OK' });
          } else if (typeof result === 'string') {
      results.push({ name, status: 'warn', message: result });
          } else {
      results.push({ name, status: 'fail', message: 'Failed' });
          }
  } catch (error) {
    results.push({ name, status: 'fail', message: String(error) });
  }
}

// Check Node version
check('Node version', () => {
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0] || '0');
  if (major >= 18 && major < 21) {
    return true;
  }
  return `Expected Node 18-20, got ${version}`;
});

// Check pnpm
check('pnpm installed', () => {
  try {
    execSync('pnpm --version', { stdio: 'ignore' });
    return true;
  } catch {
    return 'pnpm not found. Install with: npm install -g pnpm';
  }
});

// Check .env file
check('.env file', () => {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    return true;
  }
  return '.env file not found. Copy .env.example to .env';
});

// Check required env vars
check('Required env vars', () => {
  require('dotenv').config();
  const required = [
    'API_BASE_URL',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
  ];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length === 0) {
    return true;
  }
  return `Missing: ${missing.join(', ')}`;
});

// Check Android toolchain (if on macOS/Linux)
if (process.platform !== 'win32') {
  check('Android SDK', () => {
    try {
      const androidHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
      if (androidHome && fs.existsSync(androidHome)) {
        return true;
      }
      return 'ANDROID_HOME not set or invalid';
    } catch {
      return 'Could not check Android SDK';
    }
  });
}

// Check iOS toolchain (if on macOS)
if (process.platform === 'darwin') {
  check('Xcode Command Line Tools', () => {
    try {
      execSync('xcode-select -p', { stdio: 'ignore' });
      return true;
    } catch {
      return 'Xcode Command Line Tools not installed';
    }
  });
}

// Check ports
check('Port 3000 available', () => {
  try {
    execSync('lsof -ti:3000', { stdio: 'ignore' });
    return 'Port 3000 is in use';
  } catch {
    return true;
  }
});

// Summary
const passed = results.filter((r) => r.status === 'pass').length;
const warned = results.filter((r) => r.status === 'warn').length;
const failed = results.filter((r) => r.status === 'fail').length;


if (failed > 0) {
  process.exit(1);
}
