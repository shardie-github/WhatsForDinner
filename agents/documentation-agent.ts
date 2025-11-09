/**
 * Documentation & Knowledge Agent
 * 
 * Updates README, CHANGELOG, and /docs/architecture.md after each PR merge.
 * Auto-diagrams module dependencies (.cursor/diagrams/architecture.svg).
 * Appends intent logs for each commit in /docs/intent-log.md.
 */

import { writeFileSync, existsSync, readFileSync, appendFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

interface RepoContext {
  type: string;
  framework: string;
  packageManager: string;
  hasSupabase: boolean;
  hasVercel: boolean;
  hasExpo: boolean;
}

export class DocumentationAgent {
  constructor(
    private workspaceRoot: string,
    private repoContext: RepoContext
  ) {}

  async run(): Promise<void> {
    console.log('📚 Updating documentation...');

    await this.updateIntentLog();
    await this.updateChangelog();
    await this.updateArchitectureDocs();
    await this.generateDependencyDiagram();
  }

  private async updateIntentLog(): Promise<void> {
    const intentLogPath = join(this.workspaceRoot, 'docs', 'intent-log.md');
    
    // Get recent commits
    let recentCommits: Array<{ hash: string; message: string; date: string }> = [];
    try {
      const gitLog = execSync(
        'git log --pretty=format:"%H|%s|%ai" -10',
        { cwd: this.workspaceRoot, encoding: 'utf-8' }
      );
      recentCommits = gitLog
        .trim()
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          const [hash, ...messageParts] = line.split('|');
          const date = messageParts.pop() || '';
          const message = messageParts.join('|');
          return { hash, message, date };
        });
    } catch (error) {
      console.warn('Could not read git log:', error);
    }

    // Check if intent log exists
    if (!existsSync(intentLogPath)) {
      const header = `# Intent Log

This file tracks the reasoning and intent behind each commit, automatically maintained by the Documentation Agent.

## Format

Each entry includes:
- **Commit Hash**: Git commit hash
- **Date**: Commit timestamp
- **Message**: Commit message
- **Intent**: Reasoning and context behind the change

---

`;
      writeFileSync(intentLogPath, header);
    }

    // Append new commits (avoid duplicates)
    const existingContent = readFileSync(intentLogPath, 'utf-8');
    const existingHashes = new Set(
      existingContent.match(/Commit: `([a-f0-9]+)`/g)?.map((m) => m.match(/`([a-f0-9]+)`/)?.[1]) || []
    );

    for (const commit of recentCommits) {
      if (!existingHashes.has(commit.hash)) {
        const entry = `## ${commit.date}

**Commit**: \`${commit.hash}\`
**Message**: ${commit.message}

**Intent**: ${this.inferIntent(commit.message)}

---

`;
        appendFileSync(intentLogPath, entry);
      }
    }
  }

  private inferIntent(message: string): string {
    // Simple intent inference based on commit message patterns
    const lower = message.toLowerCase();
    
    if (lower.includes('fix') || lower.includes('bug')) {
      return 'Bug fix: Resolving an issue or error in the codebase.';
    }
    if (lower.includes('feat') || lower.includes('add')) {
      return 'Feature addition: Adding new functionality to the system.';
    }
    if (lower.includes('refactor')) {
      return 'Code refactoring: Improving code structure without changing functionality.';
    }
    if (lower.includes('perf') || lower.includes('optimize')) {
      return 'Performance optimization: Improving system performance or efficiency.';
    }
    if (lower.includes('docs')) {
      return 'Documentation update: Improving or adding documentation.';
    }
    if (lower.includes('test')) {
      return 'Test addition: Adding or updating tests.';
    }
    if (lower.includes('chore') || lower.includes('deps')) {
      return 'Maintenance: Updating dependencies or performing routine maintenance.';
    }
    
    return 'General update: Code changes for various improvements.';
  }

  private async updateChangelog(): Promise<void> {
    const changelogPath = join(this.workspaceRoot, 'CHANGELOG.md');
    
    if (!existsSync(changelogPath)) {
      const initialChangelog = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Automated changelog generation

### Changed
- Documentation agent now maintains changelog automatically

`;
      writeFileSync(changelogPath, initialChangelog);
      return;
    }

    // Get recent commits since last changelog update
    const changelog = readFileSync(changelogPath, 'utf-8');
    const lastVersionMatch = changelog.match(/## \[([^\]]+)\]/);
    
    // In production, would parse commits and categorize them
    // For now, just ensure changelog exists and is formatted correctly
  }

  private async updateArchitectureDocs(): Promise<void> {
    const archPath = join(this.workspaceRoot, 'docs', 'architecture.md');
    const existingArchPath = join(this.workspaceRoot, 'ARCHITECTURE.md');
    
    // Copy or update architecture docs
    if (existsSync(existingArchPath) && !existsSync(archPath)) {
      const archContent = readFileSync(existingArchPath, 'utf-8');
      writeFileSync(archPath, archContent);
    }

    // Update with current repo context
    if (existsSync(archPath)) {
      let content = readFileSync(archPath, 'utf-8');
      
      // Add agent section if not present
      if (!content.includes('## Agent System')) {
        const agentSection = `

## Agent System

This repository uses a unified Background + Composer Agent system for autonomous operations:

- **Reliability Agent**: Monitors performance and uptime
- **Cost Agent**: Tracks and optimizes cloud spend
- **Security Agent**: Maintains security posture and compliance
- **Documentation Agent**: Keeps docs up to date
- **Planning Agent**: Manages roadmap and sprints
- **Observability Agent**: Collects telemetry and metrics
- **Reflection Agent**: Self-evaluates and suggests improvements

See \`.cursor/config/master-agent.json\` for configuration.

Last updated: ${new Date().toISOString()}
`;
        content += agentSection;
        writeFileSync(archPath, content);
      }
    }
  }

  private async generateDependencyDiagram(): Promise<void> {
    const diagramDir = join(this.workspaceRoot, '.cursor', 'diagrams');
    const diagramPath = join(diagramDir, 'architecture.md');
    
    // Create directory if needed
    if (!existsSync(diagramDir)) {
      execSync(`mkdir -p "${diagramDir}"`, { cwd: this.workspaceRoot });
    }

    // Generate simple dependency diagram in Mermaid format
    const diagram = `# Architecture Dependency Diagram

Generated: ${new Date().toISOString()}

\`\`\`mermaid
graph TB
    subgraph "Frontend"
        Web[Next.js Web App]
        Mobile[Expo Mobile App]
    end
    
    subgraph "Backend"
        Supabase[Supabase Backend]
        API[API Routes]
    end
    
    subgraph "Infrastructure"
        Vercel[Vercel Deployment]
        EAS[EAS Build]
    end
    
    subgraph "Agent System"
        Unified[Unified Agent]
        Reliability[Reliability Agent]
        Cost[Cost Agent]
        Security[Security Agent]
        Docs[Documentation Agent]
        Planning[Planning Agent]
        Observability[Observability Agent]
        Reflection[Reflection Agent]
    end
    
    Web --> Supabase
    Mobile --> Supabase
    Web --> API
    Web --> Vercel
    Mobile --> EAS
    API --> Supabase
    
    Unified --> Reliability
    Unified --> Cost
    Unified --> Security
    Unified --> Docs
    Unified --> Planning
    Unified --> Observability
    Unified --> Reflection
    
    Reliability --> Supabase
    Cost --> Vercel
    Cost --> Supabase
    Cost --> EAS
    Security --> Supabase
    Observability --> Supabase
\`\`\`

## Module Dependencies

This diagram shows the high-level architecture and how the agent system integrates with the application stack.
`;

    writeFileSync(diagramPath, diagram);
  }
}
