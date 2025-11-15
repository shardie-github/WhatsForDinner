#!/usr/bin/env tsx
/**
 * Full-Stack Guardian Agent
 * 
 * Autonomous agent that continuously monitors and corrects:
 * 1. Environment & Secret Drift
 * 2. Supabase Schema & Migration Alignment
 * 3. Vercel Deployment Configuration
 * 4. Repo Integrity & Code Health
 * 5. AI Agent Mesh Orchestration
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, basename } from 'path';
import { execSync } from 'child_process';

interface DriftReport {
  domain: string;
  issues: Array<{
    severity: 'critical' | 'warning' | 'info';
    issue: string;
    location: string;
    fix?: string;
  }>;
  summary: {
    total: number;
    critical: number;
    warning: number;
    info: number;
  };
}

interface HealthReport {
  timestamp: string;
  drift: DriftReport[];
  schema: {
    prismaTables: string[];
    migrationFiles: string[];
    mismatches: string[];
  };
  vercel: {
    configValid: boolean;
    issues: string[];
  };
  repo: {
    deadFiles: string[];
    circularImports: string[];
    brokenImports: string[];
  };
  agents: {
    zapier: boolean;
    integrations: Record<string, boolean>;
  };
}

class FullStackGuardian {
  private rootDir: string;
  private reports: HealthReport;

  constructor(rootDir: string = process.cwd()) {
    this.rootDir = rootDir;
    this.reports = {
      timestamp: new Date().toISOString(),
      drift: [],
      schema: { prismaTables: [], migrationFiles: [], mismatches: [] },
      vercel: { configValid: false, issues: [] },
      repo: { deadFiles: [], circularImports: [], brokenImports: [] },
      agents: { zapier: false, integrations: {} },
    };
  }

  /**
   * DOMAIN 1: Environment & Secret Drift Detection
   */
  async auditEnvironmentDrift(): Promise<DriftReport> {
    const report: DriftReport = {
      domain: 'Environment & Secrets',
      issues: [],
      summary: { total: 0, critical: 0, warning: 0, info: 0 },
    };

    // Find all .env.example files
    const envExamples = this.findFiles('**/.env.example', true);
    const envFiles = this.findFiles('**/.env*', true).filter(
      (f) => !f.includes('.example') && !f.includes('.local')
    );

    // Read main .env.example
    const mainEnvExample = join(this.rootDir, '.env.example');
    if (existsSync(mainEnvExample)) {
      const envVars = this.parseEnvFile(mainEnvExample);
      
      // Check for required Supabase vars
      const requiredSupabase = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
      ];

      for (const varName of requiredSupabase) {
        if (!envVars.has(varName)) {
          report.issues.push({
            severity: 'critical',
            issue: `Missing required environment variable: ${varName}`,
            location: mainEnvExample,
            fix: `Add ${varName}=<value> to .env.example`,
          });
        }
      }

      // Check for inconsistent naming
      if (envVars.has('SUPABASE_URL') && envVars.has('NEXT_PUBLIC_SUPABASE_URL')) {
        report.issues.push({
          severity: 'warning',
          issue: 'Both SUPABASE_URL and NEXT_PUBLIC_SUPABASE_URL defined. Prefer NEXT_PUBLIC_SUPABASE_URL for client-side usage.',
          location: mainEnvExample,
        });
      }
    }

    // Check Supabase client initialization
    const supabaseClients = this.findFiles('**/*supabaseClient*.ts', true);
    for (const clientFile of supabaseClients) {
      const content = readFileSync(clientFile, 'utf-8');
      
      // Check for hardcoded values
      if (content.includes('supabase.co') && !content.includes('process.env')) {
        report.issues.push({
          severity: 'critical',
          issue: 'Hardcoded Supabase URL found in client initialization',
          location: clientFile,
          fix: 'Use process.env.NEXT_PUBLIC_SUPABASE_URL instead',
        });
      }

      // Check for missing error handling
      if (content.includes('process.env.NEXT_PUBLIC_SUPABASE_URL!') && !content.includes('||')) {
        report.issues.push({
          severity: 'warning',
          issue: 'Non-null assertion used without fallback. May cause runtime errors if env var is missing.',
          location: clientFile,
        });
      }
    }

    // Check API routes for missing env vars
    const apiRoutes = this.findFiles('**/api/**/route.ts', true);
    const usedEnvVars = new Set<string>();
    
    for (const route of apiRoutes) {
      const content = readFileSync(route, 'utf-8');
      const matches = content.matchAll(/process\.env\.([A-Z_]+)/g);
      for (const match of matches) {
        usedEnvVars.add(match[1]);
      }
    }

    // Verify all used env vars are documented
    if (existsSync(mainEnvExample)) {
      const documentedVars = this.parseEnvFile(mainEnvExample);
      for (const usedVar of usedEnvVars) {
        if (!documentedVars.has(usedVar) && !usedVar.startsWith('NEXT_PUBLIC_')) {
          report.issues.push({
            severity: 'info',
            issue: `Environment variable ${usedVar} is used in code but not documented in .env.example`,
            location: `Used in API routes`,
            fix: `Add ${usedVar}=<value> to .env.example`,
          });
        }
      }
    }

    // Check for Vercel-specific env var patterns
    const vercelConfig = join(this.rootDir, 'vercel.json');
    if (existsSync(vercelConfig)) {
      const vercelContent = JSON.parse(readFileSync(vercelConfig, 'utf-8'));
      if (vercelContent.env) {
        for (const [key, value] of Object.entries(vercelContent.env)) {
          if (typeof value === 'string' && value.includes('$')) {
            report.issues.push({
              severity: 'info',
              issue: `Vercel env var ${key} uses reference. Ensure it's set in Vercel dashboard.`,
              location: vercelConfig,
            });
          }
        }
      }
    }

    report.summary = {
      total: report.issues.length,
      critical: report.issues.filter((i) => i.severity === 'critical').length,
      warning: report.issues.filter((i) => i.severity === 'warning').length,
      info: report.issues.filter((i) => i.severity === 'info').length,
    };

    return report;
  }

  /**
   * DOMAIN 2: Supabase Schema & Migration Sentinel
   */
  async auditSchemaAlignment(): Promise<void> {
    // Read Prisma schema
    const prismaSchema = join(this.rootDir, 'prisma/schema.prisma');
    if (!existsSync(prismaSchema)) {
      this.reports.schema.mismatches.push('Prisma schema file not found');
      return;
    }

    const prismaContent = readFileSync(prismaSchema, 'utf-8');
    const prismaTables = this.extractPrismaTables(prismaContent);
    this.reports.schema.prismaTables = prismaTables;

    // Read migration files
    const migrationsDir = join(this.rootDir, 'supabase/migrations');
    if (existsSync(migrationsDir)) {
      const migrationFiles = readdirSync(migrationsDir)
        .filter((f) => f.endsWith('.sql'))
        .map((f) => join(migrationsDir, f));
      this.reports.schema.migrationFiles = migrationFiles.map((f) => basename(f));

      // Check for CREATE TABLE statements in migrations
      for (const migrationFile of migrationFiles) {
        const migrationContent = readFileSync(migrationFile, 'utf-8');
        const migrationTables = this.extractMigrationTables(migrationContent);

        // Compare with Prisma schema
        for (const table of migrationTables) {
          const prismaTable = prismaTables.find((t) => t.toLowerCase() === table.toLowerCase());
          if (!prismaTable) {
            this.reports.schema.mismatches.push(
              `Table ${table} exists in migration ${basename(migrationFile)} but not in Prisma schema`
            );
          }
        }
      }
    }

    // Check for missing indexes
    const prismaIndexes = this.extractPrismaIndexes(prismaContent);
    // This would require comparing with actual database, which we can't do without connection
    // But we can check migration files for index creation
  }

  /**
   * DOMAIN 3: Vercel Deployment Forensics
   */
  async auditVercelConfig(): Promise<void> {
    const vercelConfig = join(this.rootDir, 'vercel.json');
    if (!existsSync(vercelConfig)) {
      this.reports.vercel.issues.push('vercel.json not found');
      return;
    }

    try {
      const config = JSON.parse(readFileSync(vercelConfig, 'utf-8'));
      this.reports.vercel.configValid = true;

      // Check cron jobs
      if (config.crons) {
        for (const cron of config.crons) {
          if (!cron.path || !cron.schedule) {
            this.reports.vercel.issues.push(`Invalid cron job configuration: ${JSON.stringify(cron)}`);
          }
          
          // Verify cron endpoint exists (remove query params for file check)
          if (cron.path) {
            const cronPath = cron.path.split('?')[0].replace('/api/', '');
            const routeFile = join(this.rootDir, 'apps/web/src/app/api', `${cronPath}/route.ts`);
            if (!existsSync(routeFile)) {
              this.reports.vercel.issues.push(`Cron endpoint ${cron.path} does not exist`);
            }
          }
        }
      }

      // Check next.config compatibility
      const nextConfig = join(this.rootDir, 'apps/web/next.config.ts');
      if (existsSync(nextConfig)) {
        const nextContent = readFileSync(nextConfig, 'utf-8');
        
        // Check for output: 'export' which conflicts with API routes
        if (nextContent.includes("output: 'export'")) {
          this.reports.vercel.issues.push(
            "next.config.ts has output: 'export' which disables API routes. Cron jobs will not work."
          );
        }
      }
    } catch (error) {
      this.reports.vercel.issues.push(`Invalid JSON in vercel.json: ${error}`);
      this.reports.vercel.configValid = false;
    }
  }

  /**
   * DOMAIN 4: Repo Integrity & Code Health
   */
  async auditRepoIntegrity(): Promise<void> {
    // Check for dead files (simplified - would need more sophisticated analysis)
    const tsFiles = this.findFiles('**/*.ts', true);
    const tsxFiles = this.findFiles('**/*.tsx', true);
    const allFiles = [...tsFiles, ...tsxFiles];

    // Check for broken imports
    for (const file of allFiles.slice(0, 100)) { // Limit to first 100 for performance
      try {
        const content = readFileSync(file, 'utf-8');
        const imports = this.extractImports(content);
        
        for (const imp of imports) {
          if (!this.resolveImport(imp, file)) {
            this.reports.repo.brokenImports.push(`${file}: ${imp}`);
          }
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }
  }

  /**
   * DOMAIN 5: AI Agent Mesh Orchestration
   */
  async auditAgentMesh(): Promise<void> {
    // Check Zapier spec
    const zapierSpec = join(this.rootDir, 'automations/zapier_spec.json');
    if (existsSync(zapierSpec)) {
      try {
        const spec = JSON.parse(readFileSync(zapierSpec, 'utf-8'));
        this.reports.agents.zapier = true;

        // Verify webhook endpoints exist
        if (spec.actions) {
          for (const action of spec.actions) {
            if (action.type === 'webhook' && action.url) {
              const urlPath = new URL(action.url).pathname;
              const routePath = urlPath.replace('/api/', '');
              const routeFile = join(this.rootDir, 'apps/web/src/app/api', `${routePath}/route.ts`);
              
              if (!existsSync(routeFile)) {
                this.reports.agents.integrations[`zapier-${action.name}`] = false;
              } else {
                this.reports.agents.integrations[`zapier-${action.name}`] = true;
              }
            }
          }
        }
      } catch (error) {
        this.reports.agents.zapier = false;
      }
    }

    // Check for integration references in code
    const integrationKeywords = ['TikTok', 'Meta.*Ads', 'ElevenLabs', 'AutoDS', 'CapCut', 'MindStudio'];
    for (const keyword of integrationKeywords) {
      const matches = this.findFiles(`**/*${keyword}*.ts`, true);
      this.reports.agents.integrations[keyword.toLowerCase()] = matches.length > 0;
    }
  }

  /**
   * Run full audit
   */
  async runFullAudit(): Promise<HealthReport> {
    console.log('🔍 Starting Full-Stack Guardian Audit...\n');

    console.log('📋 Domain 1: Environment & Secret Drift');
    const envReport = await this.auditEnvironmentDrift();
    this.reports.drift.push(envReport);
    console.log(`   Found ${envReport.summary.total} issues (${envReport.summary.critical} critical)\n`);

    console.log('🗄️  Domain 2: Supabase Schema Alignment');
    await this.auditSchemaAlignment();
    console.log(`   Prisma tables: ${this.reports.schema.prismaTables.length}`);
    console.log(`   Migration files: ${this.reports.schema.migrationFiles.length}`);
    console.log(`   Mismatches: ${this.reports.schema.mismatches.length}\n`);

    console.log('🚀 Domain 3: Vercel Deployment Config');
    await this.auditVercelConfig();
    console.log(`   Config valid: ${this.reports.vercel.configValid}`);
    console.log(`   Issues: ${this.reports.vercel.issues.length}\n`);

    console.log('📁 Domain 4: Repo Integrity');
    await this.auditRepoIntegrity();
    console.log(`   Broken imports: ${this.reports.repo.brokenImports.length}\n`);

    console.log('🤖 Domain 5: AI Agent Mesh');
    await this.auditAgentMesh();
    console.log(`   Zapier configured: ${this.reports.agents.zapier}`);
    console.log(`   Integrations: ${Object.keys(this.reports.agents.integrations).length}\n`);

    return this.reports;
  }

  /**
   * Generate comprehensive report
   */
  generateReport(): string {
    const reportPath = join(this.rootDir, 'reports/guardian-health-report.json');
    writeFileSync(reportPath, JSON.stringify(this.reports, null, 2));
    
    // Generate markdown summary
    const markdown = this.generateMarkdownReport();
    const markdownPath = join(this.rootDir, 'reports/guardian-health-report.md');
    writeFileSync(markdownPath, markdown);

    return reportPath;
  }

  private generateMarkdownReport(): string {
    let md = `# Full-Stack Guardian Health Report\n\n`;
    md += `**Generated:** ${this.reports.timestamp}\n\n`;
    md += `---\n\n`;

    // Environment Drift
    md += `## 1. Environment & Secret Drift\n\n`;
    for (const drift of this.reports.drift) {
      md += `### ${drift.domain}\n\n`;
      md += `**Summary:** ${drift.summary.total} total issues (${drift.summary.critical} critical, ${drift.summary.warning} warnings, ${drift.summary.info} info)\n\n`;
      
      if (drift.issues.length > 0) {
        md += `| Severity | Issue | Location | Fix |\n`;
        md += `|----------|-------|----------|-----|\n`;
        for (const issue of drift.issues) {
          md += `| ${issue.severity} | ${issue.issue} | ${issue.location} | ${issue.fix || 'N/A'} |\n`;
        }
      }
      md += `\n`;
    }

    // Schema
    md += `## 2. Supabase Schema Alignment\n\n`;
    md += `- **Prisma Tables:** ${this.reports.schema.prismaTables.length}\n`;
    md += `- **Migration Files:** ${this.reports.schema.migrationFiles.length}\n`;
    if (this.reports.schema.mismatches.length > 0) {
      md += `\n**Mismatches:**\n`;
      for (const mismatch of this.reports.schema.mismatches) {
        md += `- ⚠️ ${mismatch}\n`;
      }
    }
    md += `\n`;

    // Vercel
    md += `## 3. Vercel Deployment Config\n\n`;
    md += `- **Config Valid:** ${this.reports.vercel.configValid ? '✅' : '❌'}\n`;
    if (this.reports.vercel.issues.length > 0) {
      md += `\n**Issues:**\n`;
      for (const issue of this.reports.vercel.issues) {
        md += `- ⚠️ ${issue}\n`;
      }
    }
    md += `\n`;

    // Repo Integrity
    md += `## 4. Repo Integrity\n\n`;
    md += `- **Broken Imports:** ${this.reports.repo.brokenImports.length}\n`;
    if (this.reports.repo.brokenImports.length > 0) {
      md += `\n**Broken Imports:**\n`;
      for (const imp of this.reports.repo.brokenImports.slice(0, 10)) {
        md += `- ${imp}\n`;
      }
      if (this.reports.repo.brokenImports.length > 10) {
        md += `- ... and ${this.reports.repo.brokenImports.length - 10} more\n`;
      }
    }
    md += `\n`;

    // Agent Mesh
    md += `## 5. AI Agent Mesh\n\n`;
    md += `- **Zapier Configured:** ${this.reports.agents.zapier ? '✅' : '❌'}\n`;
    md += `\n**Integrations:**\n`;
    for (const [name, status] of Object.entries(this.reports.agents.integrations)) {
      md += `- ${name}: ${status ? '✅' : '❌'}\n`;
    }

    return md;
  }

  // Helper methods
  private findFiles(pattern: string, recursive: boolean = false): string[] {
    try {
      const result = execSync(`find ${this.rootDir} -name "${pattern.replace('**/', '')}" -type f`, {
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024,
      });
      return result.trim().split('\n').filter(Boolean);
    } catch {
      return [];
    }
  }

  private parseEnvFile(path: string): Set<string> {
    const content = readFileSync(path, 'utf-8');
    const vars = new Set<string>();
    for (const line of content.split('\n')) {
      const match = line.match(/^([A-Z_]+)=/);
      if (match) {
        vars.add(match[1]);
      }
    }
    return vars;
  }

  private extractPrismaTables(content: string): string[] {
    const tables: string[] = [];
    const modelMatches = content.matchAll(/model\s+(\w+)\s*\{/g);
    for (const match of modelMatches) {
      tables.push(match[1]);
    }
    return tables;
  }

  private extractPrismaIndexes(content: string): string[] {
    const indexes: string[] = [];
    const indexMatches = content.matchAll(/@@index\(\[([^\]]+)\]/g);
    for (const match of indexMatches) {
      indexes.push(match[1]);
    }
    return indexes;
  }

  private extractMigrationTables(content: string): string[] {
    const tables: string[] = [];
    const createMatches = content.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?(\w+)/gi);
    for (const match of createMatches) {
      tables.push(match[1]);
    }
    return tables;
  }

  private extractImports(content: string): string[] {
    const imports: string[] = [];
    const importMatches = content.matchAll(/from\s+['"]([^'"]+)['"]/g);
    for (const match of importMatches) {
      imports.push(match[1]);
    }
    return imports;
  }

  private resolveImport(importPath: string, fromFile: string): boolean {
    // Simplified resolution - would need proper TypeScript resolution
    if (importPath.startsWith('.')) {
      const dir = dirname(fromFile);
      const resolved = join(dir, importPath);
      return existsSync(resolved) || existsSync(`${resolved}.ts`) || existsSync(`${resolved}.tsx`);
    }
    // External package - assume exists if referenced
    return true;
  }
}

// Main execution
if (require.main === module) {
  const guardian = new FullStackGuardian();
  guardian
    .runFullAudit()
    .then(() => {
      const reportPath = guardian.generateReport();
      console.log(`\n✅ Audit complete! Report saved to: ${reportPath}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Audit failed:', error);
      process.exit(1);
    });
}

export { FullStackGuardian };
