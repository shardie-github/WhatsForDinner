/**
 * Deployment Configuration Validator
 * Validates deployment configurations for Vercel, Netlify, Cloudflare, etc.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';

interface DeploymentValidationResult {
  platform: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
  config: any;
}

const VercelConfigSchema = z.object({
  version: z.number().optional(),
  buildCommand: z.string().optional(),
  outputDirectory: z.string().optional(),
  installCommand: z.string().optional(),
  framework: z.string().optional(),
  rewrites: z.array(z.any()).optional(),
  headers: z.array(z.any()).optional(),
  redirects: z.array(z.any()).optional(),
  crons: z.array(z.any()).optional(),
});

const NetlifyConfigSchema = z.object({
  build: z.object({
    command: z.string().optional(),
    publish: z.string().optional(),
  }).optional(),
  redirects: z.array(z.any()).optional(),
  headers: z.array(z.any()).optional(),
});

const DockerfileSchema = z.object({
  hasFrom: z.boolean(),
  hasWorkdir: z.boolean(),
  hasCopy: z.boolean(),
  hasRun: z.boolean(),
  hasExpose: z.boolean(),
  hasCmd: z.boolean(),
});

export class DeploymentConfigValidator {
  private workspaceRoot: string;

  constructor(workspaceRoot: string = process.cwd()) {
    this.workspaceRoot = workspaceRoot;
  }

  /**
   * Validate all deployment configurations
   */
  async validateAll(): Promise<DeploymentValidationResult[]> {
    const results: DeploymentValidationResult[] = [];

    // Check Vercel
    const vercelResult = this.validateVercel();
    if (vercelResult) results.push(vercelResult);

    // Check Netlify
    const netlifyResult = this.validateNetlify();
    if (netlifyResult) results.push(netlifyResult);

    // Check Dockerfile
    const dockerResult = this.validateDockerfile();
    if (dockerResult) results.push(dockerResult);

    // Check Next.js config
    const nextjsResult = this.validateNextConfig();
    if (nextjsResult) results.push(nextjsResult);

    return results;
  }

  /**
   * Validate Vercel configuration
   */
  validateVercel(): DeploymentValidationResult | null {
    const vercelPath = join(this.workspaceRoot, 'vercel.json');
    if (!existsSync(vercelPath)) {
      return {
        platform: 'vercel',
        valid: false,
        errors: ['vercel.json not found'],
        warnings: [],
        config: null,
      };
    }

    try {
      const config = JSON.parse(readFileSync(vercelPath, 'utf-8'));
      const parsed = VercelConfigSchema.safeParse(config);
      
      const errors: string[] = [];
      const warnings: string[] = [];

      if (!parsed.success) {
        errors.push(`Invalid vercel.json schema: ${parsed.error.message}`);
      }

      // Check for required build configuration
      if (!config.buildCommand && !existsSync(join(this.workspaceRoot, 'package.json'))) {
        warnings.push('No buildCommand specified in vercel.json');
      }

      // Check output directory
      if (config.outputDirectory && !existsSync(join(this.workspaceRoot, config.outputDirectory))) {
        warnings.push(`Output directory ${config.outputDirectory} does not exist`);
      }

      // Validate cron jobs
      if (config.crons) {
        for (const cron of config.crons) {
          if (!cron.path || !cron.schedule) {
            errors.push('Cron jobs must have path and schedule');
          }
        }
      }

      return {
        platform: 'vercel',
        valid: errors.length === 0,
        errors,
        warnings,
        config,
      };
    } catch (error) {
      return {
        platform: 'vercel',
        valid: false,
        errors: [`Failed to parse vercel.json: ${error}`],
        warnings: [],
        config: null,
      };
    }
  }

  /**
   * Validate Netlify configuration
   */
  validateNetlify(): DeploymentValidationResult | null {
    const netlifyPath = join(this.workspaceRoot, 'netlify.toml');
    if (!existsSync(netlifyPath)) {
      return null; // Netlify config is optional
    }

    try {
      // Basic TOML parsing (simplified)
      const content = readFileSync(netlifyPath, 'utf-8');
      const errors: string[] = [];
      const warnings: string[] = [];

      // Check for build command
      if (!content.includes('[build]')) {
        warnings.push('No [build] section found in netlify.toml');
      }

      return {
        platform: 'netlify',
        valid: errors.length === 0,
        errors,
        warnings,
        config: { content },
      };
    } catch (error) {
      return {
        platform: 'netlify',
        valid: false,
        errors: [`Failed to read netlify.toml: ${error}`],
        warnings: [],
        config: null,
      };
    }
  }

  /**
   * Validate Dockerfile
   */
  validateDockerfile(): DeploymentValidationResult | null {
    const dockerfilePath = join(this.workspaceRoot, 'Dockerfile');
    if (!existsSync(dockerfilePath)) {
      return null; // Dockerfile is optional
    }

    try {
      const content = readFileSync(dockerfilePath, 'utf-8');
      const errors: string[] = [];
      const warnings: string[] = [];

      const checks = {
        hasFrom: content.includes('FROM'),
        hasWorkdir: content.includes('WORKDIR'),
        hasCopy: content.includes('COPY'),
        hasRun: content.includes('RUN'),
        hasExpose: content.includes('EXPOSE'),
        hasCmd: content.includes('CMD') || content.includes('ENTRYPOINT'),
      };

      if (!checks.hasFrom) {
        errors.push('Dockerfile missing FROM instruction');
      }
      if (!checks.hasWorkdir) {
        warnings.push('Dockerfile missing WORKDIR instruction');
      }
      if (!checks.hasCopy) {
        warnings.push('Dockerfile missing COPY instruction');
      }
      if (!checks.hasRun) {
        warnings.push('Dockerfile missing RUN instruction');
      }
      if (!checks.hasExpose) {
        warnings.push('Dockerfile missing EXPOSE instruction');
      }
      if (!checks.hasCmd) {
        errors.push('Dockerfile missing CMD or ENTRYPOINT instruction');
      }

      return {
        platform: 'docker',
        valid: errors.length === 0,
        errors,
        warnings,
        config: checks,
      };
    } catch (error) {
      return {
        platform: 'docker',
        valid: false,
        errors: [`Failed to read Dockerfile: ${error}`],
        warnings: [],
        config: null,
      };
    }
  }

  /**
   * Validate Next.js configuration
   */
  validateNextConfig(): DeploymentValidationResult | null {
    const nextConfigPath = join(this.workspaceRoot, 'apps', 'web', 'next.config.ts');
    if (!existsSync(nextConfigPath)) {
      return {
        platform: 'nextjs',
        valid: false,
        errors: ['next.config.ts not found'],
        warnings: [],
        config: null,
      };
    }

    try {
      const content = readFileSync(nextConfigPath, 'utf-8');
      const errors: string[] = [];
      const warnings: string[] = [];

      // Check for common issues
      if (content.includes('output: \'export\'')) {
        // Static export - check for API routes
        if (content.includes('app/api')) {
          warnings.push('Static export enabled but API routes detected');
        }
      }

      // Check for image optimization
      if (!content.includes('images:')) {
        warnings.push('No image optimization configuration found');
      }

      return {
        platform: 'nextjs',
        valid: errors.length === 0,
        errors,
        warnings,
        config: { hasConfig: true },
      };
    } catch (error) {
      return {
        platform: 'nextjs',
        valid: false,
        errors: [`Failed to read next.config.ts: ${error}`],
        warnings: [],
        config: null,
      };
    }
  }

  /**
   * Generate deployment recommendations
   */
  generateRecommendations(results: DeploymentValidationResult[]): string[] {
    const recommendations: string[] = [];

    for (const result of results) {
      if (!result.valid) {
        recommendations.push(`Fix ${result.platform} configuration errors`);
      }
      for (const warning of result.warnings) {
        recommendations.push(`${result.platform}: ${warning}`);
      }
    }

    return recommendations;
  }
}

// CLI entry point
if (require.main === module) {
  const validator = new DeploymentConfigValidator();
  validator.validateAll()
    .then(results => {
      console.log(JSON.stringify(results, null, 2));
      const recommendations = validator.generateRecommendations(results);
      if (recommendations.length > 0) {
        console.log('\n📋 Recommendations:');
        recommendations.forEach((rec, i) => {
          console.log(`${i + 1}. ${rec}`);
        });
      }
      const allValid = results.every(r => r.valid);
      process.exit(allValid ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Deployment validation failed:', error);
      process.exit(1);
    });
}
