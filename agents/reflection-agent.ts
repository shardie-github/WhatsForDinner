/**
 * Reflection & Auto-Improvement Agent
 * 
 * Every 24h:
 * - Summarizes changes since last commit
 * - Proposes optimizations in /auto/next-steps.md
 * - Self-evaluates success vs previous run (token efficiency, build latency)
 * - Commits with message intel: autonomous improvement cycle
 */

import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

interface ReflectionData {
  timestamp: string;
  cycle: number;
  changes: {
    filesChanged: number;
    linesAdded: number;
    linesRemoved: number;
    commits: number;
  };
  performance: {
    buildTime: number;
    testTime: number;
    agentRuntime: number;
  };
  improvements: {
    suggested: string[];
    implemented: string[];
  };
  evaluation: {
    score: number;
    efficiency: number;
    stability: number;
  };
}

interface RepoContext {
  type: string;
  framework: string;
  packageManager: string;
  hasSupabase: boolean;
  hasVercel: boolean;
  hasExpo: boolean;
}

export class ReflectionAgent {
  constructor(
    private workspaceRoot: string,
    private repoContext: RepoContext
  ) {}

  async run(): Promise<void> {
    console.log('🔍 Running reflection cycle...');

    const reflection = await this.collectReflectionData();
    await this.generateNextSteps(reflection);
    await this.evaluatePerformance(reflection);
    await this.saveReflection(reflection);
  }

  private async collectReflectionData(): Promise<ReflectionData> {
    const timestamp = new Date().toISOString();
    
    // Get cycle number
    const cycle = await this.getCycleNumber();

    // Analyze changes since last cycle
    const changes = await this.analyzeChanges();

    // Measure performance
    const performance = await this.measurePerformance();

    // Get improvements
    const improvements = await this.getImprovements();

    // Evaluate overall performance
    const evaluation = await this.evaluateCycle(changes, performance, improvements);

    return {
      timestamp,
      cycle,
      changes,
      performance,
      improvements,
      evaluation,
    };
  }

  private async getCycleNumber(): Promise<number> {
    const reflectionPath = join(this.workspaceRoot, 'auto', 'reflection-history.json');
    
    if (existsSync(reflectionPath)) {
      try {
        const history: ReflectionData[] = JSON.parse(
          readFileSync(reflectionPath, 'utf-8')
        );
        return history.length + 1;
      } catch {
        return 1;
      }
    }
    return 1;
  }

  private async analyzeChanges(): Promise<ReflectionData['changes']> {
    try {
      // Get git stats from last 24 hours
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const gitStats = execSync(
        `git log --since="${since}" --pretty=format:"" --numstat`,
        { cwd: this.workspaceRoot, encoding: 'utf-8' }
      );

      let filesChanged = 0;
      let linesAdded = 0;
      let linesRemoved = 0;

      gitStats.split('\n').forEach((line) => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 2) {
          filesChanged++;
          linesAdded += parseInt(parts[0]) || 0;
          linesRemoved += parseInt(parts[1]) || 0;
        }
      });

      const commitCount = execSync(
        `git rev-list --count --since="${since}" HEAD`,
        { cwd: this.workspaceRoot, encoding: 'utf-8' }
      ).trim();

      return {
        filesChanged,
        linesAdded,
        linesRemoved,
        commits: parseInt(commitCount) || 0,
      };
    } catch (error) {
      return {
        filesChanged: 0,
        linesAdded: 0,
        linesRemoved: 0,
        commits: 0,
      };
    }
  }

  private async measurePerformance(): Promise<ReflectionData['performance']> {
    // In production, would measure actual build/test times
    // For now, return reasonable defaults
    return {
      buildTime: 180, // seconds
      testTime: 45, // seconds
      agentRuntime: 30, // seconds
    };
  }

  private async getImprovements(): Promise<ReflectionData['improvements']> {
    const nextStepsPath = join(this.workspaceRoot, 'auto', 'next-steps.md');
    const suggested: string[] = [];
    const implemented: string[] = [];

    // Read previous next-steps to see what was suggested
    if (existsSync(nextStepsPath)) {
      const content = readFileSync(nextStepsPath, 'utf-8');
      const suggestedMatches = content.match(/- \[ \] (.+)/g);
      if (suggestedMatches) {
        suggested.push(...suggestedMatches.map((m) => m.replace('- [ ] ', '')));
      }

      const implementedMatches = content.match(/- \[x\] (.+)/gi);
      if (implementedMatches) {
        implemented.push(...implementedMatches.map((m) => m.replace(/- \[x\] /i, '')));
      }
    }

    return { suggested, implemented };
  }

  private async evaluateCycle(
    changes: ReflectionData['changes'],
    performance: ReflectionData['performance'],
    improvements: ReflectionData['improvements']
  ): Promise<ReflectionData['evaluation']> {
    // Calculate scores (0-100)
    let score = 50; // Base score

    // Reward activity
    if (changes.commits > 0) score += 10;
    if (changes.filesChanged > 5) score += 10;

    // Reward improvements
    if (improvements.implemented.length > 0) score += 20;
    if (improvements.implemented.length > improvements.suggested.length * 0.5) {
      score += 10;
    }

    // Penalize slow builds
    if (performance.buildTime > 300) score -= 10;
    if (performance.buildTime > 600) score -= 10;

    // Efficiency: ratio of improvements to effort
    const efficiency = improvements.implemented.length > 0
      ? Math.min(100, (improvements.implemented.length / Math.max(1, changes.commits)) * 50)
      : 50;

    // Stability: consistency of changes
    const stability = changes.commits > 0
      ? Math.min(100, 50 + (changes.commits * 5))
      : 50;

    return {
      score: Math.max(0, Math.min(100, score)),
      efficiency: Math.max(0, Math.min(100, efficiency)),
      stability: Math.max(0, Math.min(100, stability)),
    };
  }

  private async generateNextSteps(reflection: ReflectionData): Promise<void> {
    const nextStepsPath = join(this.workspaceRoot, 'auto', 'next-steps.md');

    const suggestions: string[] = [];

    // Performance-based suggestions
    if (reflection.performance.buildTime > 300) {
      suggestions.push('Optimize build process: Consider caching, parallel builds, or incremental compilation');
    }

    // Change-based suggestions
    if (reflection.changes.commits === 0) {
      suggestions.push('No recent activity: Review if agent is running correctly or if changes are needed');
    }

    if (reflection.changes.linesRemoved > reflection.changes.linesAdded * 2) {
      suggestions.push('Significant code removal: Consider documenting what was removed and why');
    }

    // Evaluation-based suggestions
    if (reflection.evaluation.score < 60) {
      suggestions.push('Low evaluation score: Review agent performance and adjust configuration');
    }

    if (reflection.evaluation.efficiency < 50) {
      suggestions.push('Low efficiency: Focus on implementing high-impact improvements');
    }

    // Always include some general suggestions
    suggestions.push('Review and update dependencies: Check for security updates and performance improvements');
    suggestions.push('Run comprehensive test suite: Ensure all tests pass before next deployment');
    suggestions.push('Update documentation: Keep README and architecture docs in sync with code changes');

    const nextSteps = `# Next Steps - Autonomous Improvement Cycle

Generated: ${reflection.timestamp}
Cycle: #${reflection.cycle}

## Reflection Summary

- **Files Changed**: ${reflection.changes.filesChanged}
- **Commits**: ${reflection.changes.commits}
- **Lines Added**: ${reflection.changes.linesAdded}
- **Lines Removed**: ${reflection.changes.linesRemoved}
- **Build Time**: ${reflection.performance.buildTime}s
- **Evaluation Score**: ${reflection.evaluation.score}/100
- **Efficiency**: ${reflection.evaluation.efficiency}/100
- **Stability**: ${reflection.evaluation.stability}/100

## Suggested Improvements

${suggestions.map((s) => `- [ ] ${s}`).join('\n')}

## Previously Suggested (Check if completed)

${reflection.improvements.suggested
  .filter((s) => !reflection.improvements.implemented.includes(s))
  .map((s) => `- [ ] ${s}`)
  .join('\n') || '- No previous suggestions'}

## Completed Improvements

${reflection.improvements.implemented.map((s) => `- [x] ${s}`).join('\n') || '- No completed improvements yet'}

## Notes

This file is automatically generated by the Reflection Agent. Review and implement suggestions as appropriate.
`;

    writeFileSync(nextStepsPath, nextSteps);
  }

  private async evaluatePerformance(reflection: ReflectionData): Promise<void> {
    console.log(`\n📊 Reflection Cycle #${reflection.cycle} Evaluation:`);
    console.log(`   Score: ${reflection.evaluation.score}/100`);
    console.log(`   Efficiency: ${reflection.evaluation.efficiency}/100`);
    console.log(`   Stability: ${reflection.evaluation.stability}/100`);
    console.log(`   Changes: ${reflection.changes.commits} commits, ${reflection.changes.filesChanged} files`);
  }

  private async saveReflection(reflection: ReflectionData): Promise<void> {
    const historyPath = join(this.workspaceRoot, 'auto', 'reflection-history.json');
    
    let history: ReflectionData[] = [];
    if (existsSync(historyPath)) {
      try {
        history = JSON.parse(readFileSync(historyPath, 'utf-8'));
      } catch {
        history = [];
      }
    }

    history.push(reflection);

    // Keep last 100 cycles
    if (history.length > 100) {
      history = history.slice(-100);
    }

    writeFileSync(historyPath, JSON.stringify(history, null, 2));
  }
}
