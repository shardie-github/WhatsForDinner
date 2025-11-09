/**
 * Unified Background + Composer Agent for Hardonia-linked repositories
 * 
 * Core orchestrator that manages all specialized agents and maintains
 * self-awareness, self-maintenance, self-optimization, self-protection,
 * and self-documentation capabilities.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

interface AgentConfig {
  agentMode: string;
  autoRun: boolean;
  repoType: string;
  detectedStack: Record<string, string>;
  agents: Record<string, AgentSettings>;
  artifacts: Record<string, string>;
  safety: SafetySettings;
}

interface AgentSettings {
  enabled: boolean;
  schedule?: string;
  [key: string]: any;
}

interface SafetySettings {
  neverExposeSecrets: boolean;
  requireCI: boolean;
  preferPR: boolean;
  retainAudits: number;
}

interface RepoContext {
  type: 'webapp' | 'mobile' | 'backend' | 'library' | 'monorepo';
  framework: string;
  packageManager: 'npm' | 'pnpm' | 'yarn';
  hasSupabase: boolean;
  hasVercel: boolean;
  hasExpo: boolean;
}

export class UnifiedAgent {
  private config: AgentConfig;
  private repoContext: RepoContext;
  private workspaceRoot: string;

  constructor(workspaceRoot: string = process.cwd()) {
    this.workspaceRoot = workspaceRoot;
    this.config = this.loadConfig();
    this.repoContext = this.detectRepoContext();
  }

  /**
   * Load agent configuration from .cursor/config/master-agent.json
   */
  private loadConfig(): AgentConfig {
    const configPath = join(this.workspaceRoot, '.cursor', 'config', 'master-agent.json');
    if (existsSync(configPath)) {
      return JSON.parse(readFileSync(configPath, 'utf-8'));
    }
    // Return default config
    return {
      agentMode: 'hardonia-global',
      autoRun: true,
      repoType: 'monorepo',
      detectedStack: {},
      agents: {},
      artifacts: {},
      safety: {
        neverExposeSecrets: true,
        requireCI: true,
        preferPR: true,
        retainAudits: 3,
      },
    };
  }

  /**
   * Detect repository context by analyzing manifest files
   */
  private detectRepoContext(): RepoContext {
    const packageJsonPath = join(this.workspaceRoot, 'package.json');
    const context: RepoContext = {
      type: 'monorepo',
      framework: 'unknown',
      packageManager: 'pnpm',
      hasSupabase: false,
      hasVercel: false,
      hasExpo: false,
    };

    if (existsSync(packageJsonPath)) {
      const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      
      // Detect package manager
      if (pkg.packageManager) {
        if (pkg.packageManager.includes('pnpm')) context.packageManager = 'pnpm';
        else if (pkg.packageManager.includes('yarn')) context.packageManager = 'yarn';
        else context.packageManager = 'npm';
      }

      // Detect frameworks and services
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      
      if (deps['next'] || deps['@next/next']) {
        context.framework = 'nextjs';
        context.type = 'webapp';
      }
      if (deps['expo'] || deps['react-native']) {
        context.hasExpo = true;
        if (context.type === 'monorepo') context.type = 'mobile';
      }
      if (deps['@supabase/supabase-js'] || existsSync(join(this.workspaceRoot, 'supabase'))) {
        context.hasSupabase = true;
      }
      if (deps['vercel'] || existsSync(join(this.workspaceRoot, '.vercel'))) {
        context.hasVercel = true;
      }

      // Check for monorepo structure
      if (pkg.workspaces || pkg.turbo) {
        context.type = 'monorepo';
      }
    }

    return context;
  }

  /**
   * Initialize artifact directories
   */
  async initializeArtifacts(): Promise<void> {
    const artifactDirs = [
      'admin',
      'security',
      'roadmap',
      'auto',
      'docs',
      '.cursor/diagrams',
    ];

    for (const dir of artifactDirs) {
      const fullPath = join(this.workspaceRoot, dir);
      if (!existsSync(fullPath)) {
        mkdirSync(fullPath, { recursive: true });
      }
    }
  }

  /**
   * Run all enabled agents
   */
  async runAll(): Promise<void> {
    console.log('🤖 Unified Agent: Starting agent cycle...');
    console.log(`📦 Repository Context: ${this.repoContext.type} (${this.repoContext.framework})`);

    await this.initializeArtifacts();

    const agents = [
      { name: 'reliability', runner: () => this.runReliabilityAgent() },
      { name: 'cost', runner: () => this.runCostAgent() },
      { name: 'security', runner: () => this.runSecurityAgent() },
      { name: 'documentation', runner: () => this.runDocumentationAgent() },
      { name: 'planning', runner: () => this.runPlanningAgent() },
      { name: 'observability', runner: () => this.runObservabilityAgent() },
      { name: 'reflection', runner: () => this.runReflectionAgent() },
      { name: 'learning', runner: () => this.runLearningAgent() },
    ];

    for (const agent of agents) {
      const settings = this.config.agents[agent.name];
      if (settings?.enabled !== false) {
        try {
          console.log(`\n🔄 Running ${agent.name} agent...`);
          await agent.runner();
          console.log(`✅ ${agent.name} agent completed`);
        } catch (error) {
          console.error(`❌ ${agent.name} agent failed:`, error);
        }
      }
    }

    console.log('\n✨ Unified Agent cycle complete!');
  }

  /**
   * Reliability & Performance Agent
   */
  private async runReliabilityAgent(): Promise<void> {
    // This will be implemented by the ReliabilityAgent class
    const { ReliabilityAgent } = await import('./reliability-agent');
    const agent = new ReliabilityAgent(this.workspaceRoot, this.repoContext);
    await agent.run();
  }

  /**
   * Cost & Efficiency Agent
   */
  private async runCostAgent(): Promise<void> {
    const { CostAgent } = await import('./cost-agent');
    const agent = new CostAgent(this.workspaceRoot, this.repoContext);
    await agent.run();
  }

  /**
   * Security & Compliance Agent
   */
  private async runSecurityAgent(): Promise<void> {
    const { SecurityAgent } = await import('./security-agent');
    const agent = new SecurityAgent(this.workspaceRoot, this.repoContext);
    await agent.run();
  }

  /**
   * Documentation & Knowledge Agent
   */
  private async runDocumentationAgent(): Promise<void> {
    const { DocumentationAgent } = await import('./documentation-agent');
    const agent = new DocumentationAgent(this.workspaceRoot, this.repoContext);
    await agent.run();
  }

  /**
   * Planning & Roadmap Agent
   */
  private async runPlanningAgent(): Promise<void> {
    const { PlanningAgent } = await import('./planning-agent');
    const agent = new PlanningAgent(this.workspaceRoot, this.repoContext);
    await agent.run();
  }

  /**
   * Observability & Telemetry Agent
   */
  private async runObservabilityAgent(): Promise<void> {
    const { ObservabilityAgent } = await import('./observability-agent');
    const agent = new ObservabilityAgent(this.workspaceRoot, this.repoContext);
    await agent.run();
  }

  /**
   * Reflection & Auto-Improvement Agent
   */
  private async runReflectionAgent(): Promise<void> {
    const { ReflectionAgent } = await import('./reflection-agent');
    const agent = new ReflectionAgent(this.workspaceRoot, this.repoContext);
    await agent.run();
  }

  /**
   * Learning & Continuity Agent
   */
  private async runLearningAgent(): Promise<void> {
    const { LearningAgent } = await import('./learning-agent');
    const agent = new LearningAgent(this.workspaceRoot, this.repoContext);
    await agent.run();
  }

  /**
   * Get repository context for external use
   */
  getRepoContext(): RepoContext {
    return this.repoContext;
  }

  /**
   * Get agent configuration
   */
  getConfig(): AgentConfig {
    return this.config;
  }
}

// CLI entry point
if (require.main === module) {
  const agent = new UnifiedAgent();
  agent.runAll().catch(console.error);
}
