/**
 * Full-Stack Guardian Summary
 * Generates comprehensive report of all implemented features and gaps
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface GuardianReport {
  timestamp: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  categories: {
    environment: CategoryReport;
    database: CategoryReport;
    api: CategoryReport;
    deployment: CategoryReport;
    observability: CategoryReport;
    ux: CategoryReport;
    cicd: CategoryReport;
    agents: CategoryReport;
  };
  recommendations: string[];
}

interface CategoryReport {
  status: 'complete' | 'partial' | 'missing';
  implemented: string[];
  missing: string[];
  score: number;
}

export class FullStackGuardianSummary {
  private workspaceRoot: string;

  constructor(workspaceRoot: string = process.cwd()) {
    this.workspaceRoot = workspaceRoot;
  }

  /**
   * Generate comprehensive guardian report
   */
  async generateReport(): Promise<GuardianReport> {
    const report: GuardianReport = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      categories: {
        environment: await this.checkEnvironment(),
        database: await this.checkDatabase(),
        api: await this.checkAPI(),
        deployment: await this.checkDeployment(),
        observability: await this.checkObservability(),
        ux: await this.checkUX(),
        cicd: await this.checkCICD(),
        agents: await this.checkAgents(),
      },
      recommendations: [],
    };

    // Calculate overall status
    const scores = Object.values(report.categories).map(c => c.score);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    if (avgScore >= 0.9) {
      report.status = 'healthy';
    } else if (avgScore >= 0.7) {
      report.status = 'degraded';
    } else {
      report.status = 'unhealthy';
    }

    // Generate recommendations
    report.recommendations = this.generateRecommendations(report);

    return report;
  }

  private async checkEnvironment(): Promise<CategoryReport> {
    const implemented: string[] = [];
    const missing: string[] = [];

    // Check for env validation schema
    if (existsSync(join(this.workspaceRoot, 'packages', 'config', 'src', 'env.ts'))) {
      implemented.push('Environment validation schema (Zod)');
    } else {
      missing.push('Environment validation schema');
    }

    // Check for .env.example
    if (existsSync(join(this.workspaceRoot, '.env.example'))) {
      implemented.push('.env.example file');
    } else {
      missing.push('.env.example file');
    }

    const score = implemented.length / (implemented.length + missing.length);
    return {
      status: missing.length === 0 ? 'complete' : missing.length <= 2 ? 'partial' : 'missing',
      implemented,
      missing,
      score,
    };
  }

  private async checkDatabase(): Promise<CategoryReport> {
    const implemented: string[] = [];
    const missing: string[] = [];

    if (existsSync(join(this.workspaceRoot, 'prisma', 'schema.prisma'))) {
      implemented.push('Prisma schema');
    } else {
      missing.push('Prisma schema');
    }

    if (existsSync(join(this.workspaceRoot, 'scripts', 'schema-health-check.ts'))) {
      implemented.push('Schema health checker');
    } else {
      missing.push('Schema health checker');
    }

    const migrationsDir = join(this.workspaceRoot, 'supabase', 'migrations');
    if (existsSync(migrationsDir)) {
      implemented.push('Database migrations');
    } else {
      missing.push('Database migrations');
    }

    const score = implemented.length / (implemented.length + missing.length);
    return {
      status: missing.length === 0 ? 'complete' : 'partial',
      implemented,
      missing,
      score,
    };
  }

  private async checkAPI(): Promise<CategoryReport> {
    const implemented: string[] = [];
    const missing: string[] = [];

    if (existsSync(join(this.workspaceRoot, 'packages', 'utils', 'src', 'api', 'contracts.ts'))) {
      implemented.push('API contract validators');
    } else {
      missing.push('API contract validators');
    }

    if (existsSync(join(this.workspaceRoot, 'docs', 'API.md'))) {
      implemented.push('API documentation');
    } else {
      missing.push('API documentation');
    }

    if (existsSync(join(this.workspaceRoot, 'scripts', 'generate-openapi-docs.ts'))) {
      implemented.push('OpenAPI generator');
    } else {
      missing.push('OpenAPI generator');
    }

    const score = implemented.length / (implemented.length + missing.length);
    return {
      status: missing.length === 0 ? 'complete' : 'partial',
      implemented,
      missing,
      score,
    };
  }

  private async checkDeployment(): Promise<CategoryReport> {
    const implemented: string[] = [];
    const missing: string[] = [];

    if (existsSync(join(this.workspaceRoot, 'vercel.json'))) {
      implemented.push('Vercel configuration');
    } else {
      missing.push('Vercel configuration');
    }

    if (existsSync(join(this.workspaceRoot, 'scripts', 'validate-deployment-config.ts'))) {
      implemented.push('Deployment config validator');
    } else {
      missing.push('Deployment config validator');
    }

    const score = implemented.length / (implemented.length + missing.length);
    return {
      status: missing.length === 0 ? 'complete' : 'partial',
      implemented,
      missing,
      score,
    };
  }

  private async checkObservability(): Promise<CategoryReport> {
    const implemented: string[] = [];
    const missing: string[] = [];

    if (existsSync(join(this.workspaceRoot, 'packages', 'utils', 'src', 'observability', 'telemetry.ts'))) {
      implemented.push('OpenTelemetry instrumentation');
    } else {
      missing.push('OpenTelemetry instrumentation');
    }

    const score = implemented.length / (implemented.length + missing.length);
    return {
      status: missing.length === 0 ? 'complete' : 'partial',
      implemented,
      missing,
      score,
    };
  }

  private async checkUX(): Promise<CategoryReport> {
    const implemented: string[] = [];
    const missing: string[] = [];

    const onboardingPath = join(this.workspaceRoot, 'apps', 'web', 'src', 'components', 'onboarding');
    if (existsSync(onboardingPath)) {
      implemented.push('Onboarding flow');
    } else {
      missing.push('Onboarding flow');
    }

    const settingsPath = join(this.workspaceRoot, 'apps', 'web', 'src', 'components', 'settings');
    if (existsSync(settingsPath)) {
      implemented.push('Settings page');
    } else {
      missing.push('Settings page');
    }

    const score = implemented.length / (implemented.length + missing.length);
    return {
      status: missing.length === 0 ? 'complete' : 'partial',
      implemented,
      missing,
      score,
    };
  }

  private async checkCICD(): Promise<CategoryReport> {
    const implemented: string[] = [];
    const missing: string[] = [];

    const workflowsPath = join(this.workspaceRoot, '.github', 'workflows');
    if (existsSync(join(workflowsPath, 'schema-validation.yml'))) {
      implemented.push('Schema validation CI');
    } else {
      missing.push('Schema validation CI');
    }

    if (existsSync(join(workflowsPath, 'api-contract-testing.yml'))) {
      implemented.push('API contract testing CI');
    } else {
      missing.push('API contract testing CI');
    }

    const score = implemented.length / (implemented.length + missing.length);
    return {
      status: missing.length === 0 ? 'complete' : 'partial',
      implemented,
      missing,
      score,
    };
  }

  private async checkAgents(): Promise<CategoryReport> {
    const implemented: string[] = [];
    const missing: string[] = [];

    if (existsSync(join(this.workspaceRoot, 'packages', 'server', 'src', 'routes', 'agent-webhook.ts'))) {
      implemented.push('Agent webhook router');
    } else {
      missing.push('Agent webhook router');
    }

    const score = implemented.length / (implemented.length + missing.length);
    return {
      status: missing.length === 0 ? 'complete' : 'partial',
      implemented,
      missing,
      score,
    };
  }

  private generateRecommendations(report: GuardianReport): string[] {
    const recommendations: string[] = [];

    for (const [category, categoryReport] of Object.entries(report.categories)) {
      if (categoryReport.status === 'missing' || categoryReport.status === 'partial') {
        for (const missingItem of categoryReport.missing) {
          recommendations.push(`[${category.toUpperCase()}] Implement ${missingItem}`);
        }
      }
    }

    return recommendations;
  }
}

// CLI entry point
if (require.main === module) {
  const guardian = new FullStackGuardianSummary();
  guardian.generateReport()
    .then(report => {
      console.log(JSON.stringify(report, null, 2));
      
      console.log('\n📊 Summary:');
      console.log(`Status: ${report.status.toUpperCase()}`);
      console.log(`Overall Score: ${(Object.values(report.categories).reduce((sum, c) => sum + c.score, 0) / Object.keys(report.categories).length * 100).toFixed(1)}%`);
      
      if (report.recommendations.length > 0) {
        console.log('\n📋 Recommendations:');
        report.recommendations.forEach((rec, i) => {
          console.log(`${i + 1}. ${rec}`);
        });
      }
      
      process.exit(report.status === 'healthy' ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Failed to generate guardian report:', error);
      process.exit(1);
    });
}
