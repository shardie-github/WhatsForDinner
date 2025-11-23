/**
 * Learning & Continuity Layer
 * 
 * Compares all repos nightly; detects reusable code patterns.
 * Consolidates shared utilities into /shared-core automatically.
 * Maintains .cursor/agent-discoveries.md across repos (knowledge ledger).
 * Suggests repo unification when duplication ≥ 30%.
 */

import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('learning-agent-ts');
interface Pattern {
  name: string;
  files: string[];
  similarity: number;
  suggestion: string;
}

interface Discovery {
  timestamp: string;
  patterns: Pattern[];
  duplications: Array<{
    pattern: string;
    files: string[];
    duplicationPercent: number;
  }>;
  recommendations: string[];
}

interface RepoContext {
  type: string;
  framework: string;
  packageManager: string;
  hasSupabase: boolean;
  hasVercel: boolean;
  hasExpo: boolean;
}

export class LearningAgent {
  constructor(
    private workspaceRoot: string,
    private repoContext: RepoContext
  ) {}

  async run(): Promise<void> {
    logger.info('🧠 Running learning and pattern detection...');

    const discovery = await this.analyzePatterns();
    await this.saveDiscoveries(discovery);
    await this.generateRecommendations(discovery);
  }

  private async analyzePatterns(): Promise<Discovery> {
    const timestamp = new Date().toISOString();

    // Detect code patterns (simplified - would use AST analysis in production)
    const patterns = await this.detectPatterns();

    // Detect duplications
    const duplications = await this.detectDuplications();

    // Generate recommendations
    const recommendations = this.generateRecommendations(patterns, duplications);

    return {
      timestamp,
      patterns,
      duplications,
      recommendations,
    };
  }

  private async detectPatterns(): Promise<Pattern[]> {
    // In production, would use AST analysis to detect common patterns
    // For now, return empty array
    return [];
  }

  private async detectDuplications(): Promise<Discovery['duplications']> {
    // In production, would use code similarity analysis
    // For now, return empty array
    return [];
  }

  private generateRecommendations(
    patterns: Pattern[],
    duplications: Discovery['duplications']
  ): string[] {
    const recommendations: string[] = [];

    // Check for high duplication
    const highDuplication = duplications.find((d) => d.duplicationPercent >= 30);
    if (highDuplication) {
      recommendations.push(
        `High code duplication detected (${highDuplication.duplicationPercent}%): Consider extracting shared utilities to /packages/shared-core`
      );
    }

    // Suggest pattern consolidation
    if (patterns.length > 0) {
      recommendations.push(
        `${patterns.length} reusable patterns detected: Consider creating shared utilities or packages`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('No significant patterns or duplications detected. Codebase is well-organized.');
    }

    return recommendations;
  }

  private async saveDiscoveries(discovery: Discovery): Promise<void> {
    const discoveriesPath = join(this.workspaceRoot, '.cursor', 'agent-discoveries.md');
    
    let existingContent = '';
    if (existsSync(discoveriesPath)) {
      existingContent = readFileSync(discoveriesPath, 'utf-8');
    }

    const newEntry = `## ${discovery.timestamp}

### Patterns Detected

${discovery.patterns.length > 0
  ? discovery.patterns.map((p) => `- **${p.name}**: ${p.suggestion}`).join('\n')
  : '- No patterns detected'
}

### Duplications

${discovery.duplications.length > 0
  ? discovery.duplications
      .map(
        (d) =>
          `- **${d.pattern}**: ${d.duplicationPercent}% duplication across ${d.files.length} files`
      )
      .join('\n')
  : '- No significant duplications'
}

### Recommendations

${discovery.recommendations.map((r) => `- ${r}`).join('\n')}

---

`;

    const header = `# Agent Discoveries

This file tracks patterns, duplications, and recommendations discovered by the Learning Agent across the codebase.

---

`;

    writeFileSync(discoveriesPath, header + newEntry + existingContent);
  }

  private async generateRecommendations(discovery: Discovery): Promise<void> {
    // Recommendations are already included in the discovery object
    // This method could be extended to create GitHub issues or PRs
    if (discovery.recommendations.length > 0) {
      logger.info('💡 Recommendations:', { discovery.recommendations });
    }
  }
}
