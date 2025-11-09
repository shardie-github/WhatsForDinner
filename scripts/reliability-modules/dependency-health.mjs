#!/usr/bin/env node

/**
 * Dependency Health Checker
 * Runs pnpm outdated, npm audit, expo doctor
 * Detects outdated/vulnerable packages and groups by service
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..', '..');

export class DependencyHealthChecker {
  constructor(supabase) {
    this.supabase = supabase;
    this.results = {
      timestamp: new Date().toISOString(),
      outdated: [],
      vulnerabilities: [],
      lockfileConsistency: { status: 'unknown', issues: [] },
      services: {}
    };
  }

  async run() {
    try {
      // Check pnpm outdated
      await this.checkPnpmOutdated();
      
      // Check npm audit
      await this.checkNpmAudit();
      
      // Check expo doctor (if expo is present)
      await this.checkExpoDoctor();
      
      // Validate lockfile consistency
      await this.validateLockfileConsistency();
      
      // Group by service
      this.groupByService();
      
      return this.results;
    } catch (error) {
      console.error('Error in dependency health check:', error);
      throw error;
    }
  }

  async checkPnpmOutdated() {
    try {
      const output = execSync('pnpm outdated --json', { 
        cwd: projectRoot,
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024 // 10MB
      });
      
      const outdated = JSON.parse(output);
      
      for (const [packageName, info] of Object.entries(outdated)) {
        this.results.outdated.push({
          package: packageName,
          current: info.current,
          wanted: info.wanted,
          latest: info.latest,
          workspace: info.workspace || 'root',
          type: this.determineUpgradeType(info.current, info.wanted, info.latest)
        });
      }
    } catch (error) {
      // pnpm outdated exits with code 1 if there are outdated packages
      if (error.status === 1 && error.stdout) {
        try {
          const output = JSON.parse(error.stdout);
          for (const [packageName, info] of Object.entries(output)) {
            this.results.outdated.push({
              package: packageName,
              current: info.current,
              wanted: info.wanted,
              latest: info.latest,
              workspace: info.workspace || 'root',
              type: this.determineUpgradeType(info.current, info.wanted, info.latest)
            });
          }
        } catch (parseError) {
          console.warn('Could not parse pnpm outdated output');
        }
      } else {
        console.warn('pnpm outdated check failed:', error.message);
      }
    }
  }

  async checkNpmAudit() {
    try {
      const output = execSync('npm audit --json', { 
        cwd: projectRoot,
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024
      });
      
      const audit = JSON.parse(output);
      
      if (audit.vulnerabilities) {
        for (const [packageName, vuln] of Object.entries(audit.vulnerabilities)) {
          this.results.vulnerabilities.push({
            package: packageName,
            severity: vuln.severity || 'moderate',
            title: vuln.title || 'Unknown vulnerability',
            url: vuln.url || '',
            via: vuln.via || [],
            fixAvailable: vuln.fixAvailable || false
          });
        }
      }
    } catch (error) {
      // npm audit exits with code 1 if vulnerabilities found
      if (error.status === 1 && error.stdout) {
        try {
          const audit = JSON.parse(error.stdout);
          if (audit.vulnerabilities) {
            for (const [packageName, vuln] of Object.entries(audit.vulnerabilities)) {
              this.results.vulnerabilities.push({
                package: packageName,
                severity: vuln.severity || 'moderate',
                title: vuln.title || 'Unknown vulnerability',
                url: vuln.url || '',
                via: vuln.via || [],
                fixAvailable: vuln.fixAvailable || false
              });
            }
          }
        } catch (parseError) {
          console.warn('Could not parse npm audit output');
        }
      } else {
        console.warn('npm audit check failed:', error.message);
      }
    }
  }

  async checkExpoDoctor() {
    try {
      // Check if expo is installed
      const packageJson = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf8'));
      const hasExpo = packageJson.dependencies?.expo || 
                     packageJson.devDependencies?.expo ||
                     existsSync(join(projectRoot, 'app.json')) ||
                     existsSync(join(projectRoot, 'app.config.js'));
      
      if (hasExpo) {
        try {
          const output = execSync('npx expo doctor', { 
            cwd: projectRoot,
            encoding: 'utf8',
            maxBuffer: 5 * 1024 * 1024
          });
          
          this.results.expoDoctor = {
            status: 'ok',
            output: output
          };
        } catch (error) {
          this.results.expoDoctor = {
            status: 'issues',
            output: error.stdout || error.message
          };
        }
      }
    } catch (error) {
      // Expo not present or check failed - not critical
      this.results.expoDoctor = { status: 'skipped', reason: 'Expo not detected' };
    }
  }

  async validateLockfileConsistency() {
    const issues = [];
    
    // Check if pnpm-lock.yaml exists and is consistent
    const lockfilePath = join(projectRoot, 'pnpm-lock.yaml');
    if (existsSync(lockfilePath)) {
      try {
        // Try to verify lockfile integrity
        execSync('pnpm install --frozen-lockfile --dry-run', { 
          cwd: projectRoot,
          stdio: 'pipe'
        });
        this.results.lockfileConsistency.status = 'ok';
      } catch (error) {
        issues.push('pnpm-lock.yaml may be inconsistent');
        this.results.lockfileConsistency.status = 'warning';
      }
    } else {
      issues.push('pnpm-lock.yaml not found');
      this.results.lockfileConsistency.status = 'missing';
    }
    
    this.results.lockfileConsistency.issues = issues;
  }

  determineUpgradeType(current, wanted, latest) {
    if (!current || !latest) return 'unknown';
    
    const currentParts = current.split('.');
    const latestParts = latest.split('.');
    
    if (currentParts[0] !== latestParts[0]) return 'major';
    if (currentParts[1] !== latestParts[1]) return 'minor';
    return 'patch';
  }

  groupByService() {
    const services = {};
    
    // Group outdated packages by workspace
    this.results.outdated.forEach(pkg => {
      const service = pkg.workspace || 'root';
      if (!services[service]) {
        services[service] = { outdated: [], vulnerabilities: [] };
      }
      services[service].outdated.push(pkg);
    });
    
    // Group vulnerabilities by package location (heuristic)
    this.results.vulnerabilities.forEach(vuln => {
      // Try to determine service from package name or path
      const service = this.guessServiceFromPackage(vuln.package);
      if (!services[service]) {
        services[service] = { outdated: [], vulnerabilities: [] };
      }
      services[service].vulnerabilities.push(vuln);
    });
    
    this.results.services = services;
  }

  guessServiceFromPackage(packageName) {
    // Heuristic: check if package is in a specific workspace
    // This is a simplified version - could be enhanced with actual workspace detection
    if (packageName.includes('@whats-for-dinner/web')) return 'web';
    if (packageName.includes('@whats-for-dinner/mobile')) return 'mobile';
    if (packageName.includes('@whats-for-dinner/server')) return 'server';
    return 'root';
  }
}
