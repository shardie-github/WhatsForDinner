/**
 * Future Runtime Readiness Checker
 * Validates build for Edge Runtime, WASM, Workers compatibility
 * Detects blocking libraries and provides migration guidance
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface CompatibilityReport {
  edgeRuntime: {
    compatible: boolean;
    issues: string[];
    recommendations: string[];
  };
  wasm: {
    compatible: boolean;
    issues: string[];
    recommendations: string[];
  };
  workers: {
    compatible: boolean;
    issues: string[];
    recommendations: string[];
  };
  hydrogenOxygen: {
    compatible: boolean;
    issues: string[];
    recommendations: string[];
  };
  overall: {
    score: number;
    status: 'ready' | 'needs-work' | 'not-ready';
  };
}

class FutureCheck {
  private projectRoot: string;
  private packageJson: any;
  private nextConfig: any;

  constructor() {
    this.projectRoot = process.cwd();
    this.packageJson = this.loadPackageJson();
    this.nextConfig = this.loadNextConfig();
  }

  /**
   * Run comprehensive future readiness check
   */
  async runCheck(): Promise<CompatibilityReport> {
    console.log('🔮 Running future runtime readiness check...');

    const report: CompatibilityReport = {
      edgeRuntime: await this.checkEdgeRuntime(),
      wasm: await this.checkWasmCompatibility(),
      workers: await this.checkWorkersCompatibility(),
      hydrogenOxygen: await this.checkHydrogenOxygenCompatibility(),
      overall: { score: 0, status: 'not-ready' }
    };

    // Calculate overall score
    const scores = [
      report.edgeRuntime.compatible ? 1 : 0,
      report.wasm.compatible ? 1 : 0,
      report.workers.compatible ? 1 : 0,
      report.hydrogenOxygen.compatible ? 1 : 0
    ];
    
    report.overall.score = (scores.reduce((a, b) => a + b, 0) / scores.length) * 100;
    
    if (report.overall.score >= 75) {
      report.overall.status = 'ready';
    } else if (report.overall.score >= 50) {
      report.overall.status = 'needs-work';
    }

    this.generateReport(report);
    return report;
  }

  /**
   * Check Edge Runtime compatibility
   */
  private async checkEdgeRuntime() {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check Next.js configuration
    if (!this.nextConfig.experimental?.runtime) {
      issues.push('No Edge Runtime configuration found in next.config.js');
      recommendations.push('Add runtime: "edge" to experimental configuration');
    }

    // Check for Node.js specific dependencies
    const nodeDeps = this.findNodeSpecificDependencies();
    if (nodeDeps.length > 0) {
      issues.push(`Node.js specific dependencies found: ${nodeDeps.join(', ')}`);
      recommendations.push('Replace Node.js specific dependencies with Edge-compatible alternatives');
    }

    // Check for file system usage
    const fsUsage = this.findFileSystemUsage();
    if (fsUsage.length > 0) {
      issues.push(`File system usage detected: ${fsUsage.join(', ')}`);
      recommendations.push('Replace fs operations with Edge-compatible alternatives (e.g., fetch API)');
    }

    // Check for process.env usage
    const envUsage = this.findProcessEnvUsage();
    if (envUsage.length > 0) {
      issues.push(`Process.env usage detected: ${envUsage.length} occurrences`);
      recommendations.push('Use Edge-compatible environment variable access');
    }

    return {
      compatible: issues.length === 0,
      issues,
      recommendations
    };
  }

  /**
   * Check WASM compatibility
   */
  private async checkWasmCompatibility() {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check for Prisma engine type
    if (this.packageJson.env?.PRISMA_CLIENT_ENGINE_TYPE !== 'wasm') {
      issues.push('Prisma engine not configured for WASM');
      recommendations.push('Set PRISMA_CLIENT_ENGINE_TYPE=wasm in environment variables');
    }

    // Check for native dependencies
    const nativeDeps = this.findNativeDependencies();
    if (nativeDeps.length > 0) {
      issues.push(`Native dependencies found: ${nativeDeps.join(', ')}`);
      recommendations.push('Replace native dependencies with WASM-compatible alternatives');
    }

    // Check for Node.js APIs
    const nodeApis = this.findNodeApiUsage();
    if (nodeApis.length > 0) {
      issues.push(`Node.js APIs detected: ${nodeApis.join(', ')}`);
      recommendations.push('Replace Node.js APIs with WASM-compatible alternatives');
    }

    return {
      compatible: issues.length === 0,
      issues,
      recommendations
    };
  }

  /**
   * Check Workers compatibility
   */
  private async checkWorkersCompatibility() {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check for Cloudflare Workers compatibility
    const workersIssues = this.checkCloudflareWorkersCompatibility();
    issues.push(...workersIssues);

    // Check for Vercel Edge Functions compatibility
    const edgeIssues = this.checkVercelEdgeCompatibility();
    issues.push(...edgeIssues);

    if (issues.length === 0) {
      recommendations.push('Code is compatible with Workers runtime');
    } else {
      recommendations.push('Review and replace incompatible APIs for Workers support');
    }

    return {
      compatible: issues.length === 0,
      issues,
      recommendations
    };
  }

  /**
   * Check Hydrogen/Oxygen compatibility
   */
  private async checkHydrogenOxygenCompatibility() {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check for Shopify-specific patterns
    const shopifyPatterns = this.findShopifyPatterns();
    if (shopifyPatterns.length > 0) {
      issues.push(`Shopify-specific patterns found: ${shopifyPatterns.join(', ')}`);
      recommendations.push('Implement Hydrogen/Oxygen bridge for Shopify integration');
    }

    // Check for server-side rendering compatibility
    const ssrIssues = this.checkSSRCompatibility();
    if (ssrIssues.length > 0) {
      issues.push(`SSR compatibility issues: ${ssrIssues.join(', ')}`);
      recommendations.push('Ensure SSR compatibility with Hydrogen/Oxygen');
    }

    return {
      compatible: issues.length === 0,
      issues,
      recommendations
    };
  }

  /**
   * Find Node.js specific dependencies
   */
  private findNodeSpecificDependencies(): string[] {
    const nodeDeps = [
      'fs', 'path', 'os', 'crypto', 'util', 'stream', 'buffer',
      'child_process', 'cluster', 'dgram', 'dns', 'net', 'tls',
      'http', 'https', 'url', 'querystring', 'readline', 'repl',
      'vm', 'zlib', 'events', 'assert', 'timers'
    ];

    const found: string[] = [];
    const sourceFiles = this.getSourceFiles();

    sourceFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      nodeDeps.forEach(dep => {
        if (content.includes(`require('${dep}')`) || content.includes(`import ${dep}`)) {
          if (!found.includes(dep)) {
            found.push(dep);
          }
        }
      });
    });

    return found;
  }

  /**
   * Find file system usage
   */
  private findFileSystemUsage(): string[] {
    const fsPatterns = [
      'fs.readFile', 'fs.writeFile', 'fs.readdir', 'fs.mkdir',
      'fs.unlink', 'fs.stat', 'fs.access', 'fs.chmod'
    ];

    const found: string[] = [];
    const sourceFiles = this.getSourceFiles();

    sourceFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      fsPatterns.forEach(pattern => {
        if (content.includes(pattern)) {
          if (!found.includes(pattern)) {
            found.push(pattern);
          }
        }
      });
    });

    return found;
  }

  /**
   * Find process.env usage
   */
  private findProcessEnvUsage(): string[] {
    const found: string[] = [];
    const sourceFiles = this.getSourceFiles();

    sourceFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const matches = content.match(/process\.env\.[a-zA-Z_][a-zA-Z0-9_]*/g);
      if (matches) {
        found.push(...matches);
      }
    });

    return found;
  }

  /**
   * Find native dependencies
   */
  private findNativeDependencies(): string[] {
    const nativeDeps = [
      'sharp', 'canvas', 'sqlite3', 'pg-native', 'mysql2',
      'bcrypt', 'argon2', 'node-gyp', 'node-sass'
    ];

    const found: string[] = [];
    const allDeps = { ...this.packageJson.dependencies, ...this.packageJson.devDependencies };

    Object.keys(allDeps).forEach(dep => {
      if (nativeDeps.includes(dep)) {
        found.push(dep);
      }
    });

    return found;
  }

  /**
   * Find Node.js API usage
   */
  private findNodeApiUsage(): string[] {
    const nodeApis = [
      'Buffer', 'process', 'global', 'console', 'setTimeout',
      'setInterval', 'clearTimeout', 'clearInterval'
    ];

    const found: string[] = [];
    const sourceFiles = this.getSourceFiles();

    sourceFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      nodeApis.forEach(api => {
        if (content.includes(api) && !found.includes(api)) {
          found.push(api);
        }
      });
    });

    return found;
  }

  /**
   * Check Cloudflare Workers compatibility
   */
  private checkCloudflareWorkersCompatibility(): string[] {
    const issues: string[] = [];
    const sourceFiles = this.getSourceFiles();

    sourceFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for Node.js specific APIs
      if (content.includes('require(') || content.includes('module.exports')) {
        issues.push(`CommonJS usage in ${file}`);
      }
      
      if (content.includes('process.exit')) {
        issues.push(`process.exit usage in ${file}`);
      }
    });

    return issues;
  }

  /**
   * Check Vercel Edge Functions compatibility
   */
  private checkVercelEdgeCompatibility(): string[] {
    const issues: string[] = [];
    
    // Check Next.js configuration for Edge Runtime
    if (!this.nextConfig.experimental?.runtime) {
      issues.push('Edge Runtime not configured in Next.js');
    }

    return issues;
  }

  /**
   * Find Shopify patterns
   */
  private findShopifyPatterns(): string[] {
    const patterns = [
      'shopify', 'hydrogen', 'oxygen', 'storefront',
      'shopify-api', 'shopify-auth'
    ];

    const found: string[] = [];
    const allDeps = { ...this.packageJson.dependencies, ...this.packageJson.devDependencies };

    Object.keys(allDeps).forEach(dep => {
      if (patterns.some(pattern => dep.includes(pattern))) {
        found.push(dep);
      }
    });

    return found;
  }

  /**
   * Check SSR compatibility
   */
  private checkSSRCompatibility(): string[] {
    const issues: string[] = [];
    const sourceFiles = this.getSourceFiles();

    sourceFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for client-side only code
      if (content.includes('window.') || content.includes('document.')) {
        issues.push(`Client-side code in ${file} may cause SSR issues`);
      }
    });

    return issues;
  }

  /**
   * Get all source files
   */
  private getSourceFiles(): string[] {
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    const files: string[] = [];

    const scanDir = (dir: string) => {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scanDir(fullPath);
        } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
          files.push(fullPath);
        }
      });
    };

    scanDir(this.projectRoot);
    return files;
  }

  /**
   * Load package.json
   */
  private loadPackageJson(): any {
    try {
      const content = fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.error('Failed to load package.json:', error);
      return {};
    }
  }

  /**
   * Load Next.js configuration
   */
  private loadNextConfig(): any {
    try {
      const configPath = path.join(this.projectRoot, 'next.config.js');
      if (fs.existsSync(configPath)) {
        delete require.cache[require.resolve(configPath)];
        return require(configPath);
      }
    } catch (error) {
      console.error('Failed to load next.config.js:', error);
    }
    return {};
  }

  /**
   * Generate compatibility report
   */
  private generateReport(report: CompatibilityReport) {
    console.log('\n🔮 Future Runtime Readiness Report');
    console.log('=====================================');
    
    console.log(`\n📊 Overall Score: ${report.overall.score.toFixed(1)}% (${report.overall.status})`);
    
    console.log('\n🌐 Edge Runtime Compatibility:');
    console.log(`  Status: ${report.edgeRuntime.compatible ? '✅ Compatible' : '❌ Issues Found'}`);
    if (report.edgeRuntime.issues.length > 0) {
      console.log('  Issues:');
      report.edgeRuntime.issues.forEach(issue => console.log(`    - ${issue}`));
    }
    if (report.edgeRuntime.recommendations.length > 0) {
      console.log('  Recommendations:');
      report.edgeRuntime.recommendations.forEach(rec => console.log(`    - ${rec}`));
    }

    console.log('\n🦀 WASM Compatibility:');
    console.log(`  Status: ${report.wasm.compatible ? '✅ Compatible' : '❌ Issues Found'}`);
    if (report.wasm.issues.length > 0) {
      console.log('  Issues:');
      report.wasm.issues.forEach(issue => console.log(`    - ${issue}`));
    }
    if (report.wasm.recommendations.length > 0) {
      console.log('  Recommendations:');
      report.wasm.recommendations.forEach(rec => console.log(`    - ${rec}`));
    }

    console.log('\n⚡ Workers Compatibility:');
    console.log(`  Status: ${report.workers.compatible ? '✅ Compatible' : '❌ Issues Found'}`);
    if (report.workers.issues.length > 0) {
      console.log('  Issues:');
      report.workers.issues.forEach(issue => console.log(`    - ${issue}`));
    }
    if (report.workers.recommendations.length > 0) {
      console.log('  Recommendations:');
      report.workers.recommendations.forEach(rec => console.log(`    - ${rec}`));
    }

    console.log('\n🛍️ Hydrogen/Oxygen Compatibility:');
    console.log(`  Status: ${report.hydrogenOxygen.compatible ? '✅ Compatible' : '❌ Issues Found'}`);
    if (report.hydrogenOxygen.issues.length > 0) {
      console.log('  Issues:');
      report.hydrogenOxygen.issues.forEach(issue => console.log(`    - ${issue}`));
    }
    if (report.hydrogenOxygen.recommendations.length > 0) {
      console.log('  Recommendations:');
      report.hydrogenOxygen.recommendations.forEach(rec => console.log(`    - ${rec}`));
    }

    // Save report to file
    const reportPath = path.join(this.projectRoot, 'REPORTS', 'future-runtime-readiness.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Report saved to: ${reportPath}`);
  }
}

// CLI execution
if (require.main === module) {
  const checker = new FutureCheck();
  checker.runCheck().catch(console.error);
}

export default FutureCheck;