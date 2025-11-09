/**
 * Planning & Roadmap Agent
 * 
 * Extracts TODOs / FIXMEs → opens GitHub issues.
 * Clusters into Epics and Milestones (by feature folder).
 * Generates /roadmap/current-sprint.md
 */

import { writeFileSync, existsSync, readFileSync } from 'fs';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

interface TodoItem {
  file: string;
  line: number;
  type: 'TODO' | 'FIXME' | 'HACK' | 'NOTE' | 'XXX';
  message: string;
  priority: 'high' | 'medium' | 'low';
}

interface Epic {
  name: string;
  todos: TodoItem[];
  estimatedEffort: number;
}

interface RepoContext {
  type: string;
  framework: string;
  packageManager: string;
  hasSupabase: boolean;
  hasVercel: boolean;
  hasExpo: boolean;
}

export class PlanningAgent {
  constructor(
    private workspaceRoot: string,
    private repoContext: RepoContext
  ) {}

  async run(): Promise<void> {
    console.log('📋 Analyzing roadmap and planning...');

    const todos = await this.extractTodos();
    const epics = await this.clusterIntoTodos(todos);
    await this.generateRoadmap(epics);
    await this.generateSprintPlan(epics);
  }

  private async extractTodos(): Promise<TodoItem[]> {
    const todos: TodoItem[] = [];
    const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.rs', '.go'];

    const scanDirectory = (dir: string): void => {
      try {
        const entries = readdirSync(dir);
        for (const entry of entries) {
          // Skip common ignore patterns
          if (
            entry.startsWith('.') ||
            entry === 'node_modules' ||
            entry === 'dist' ||
            entry === 'build' ||
            entry === '.next' ||
            entry === '.turbo'
          ) {
            continue;
          }

          const fullPath = join(dir, entry);
          const stat = statSync(fullPath);

          if (stat.isDirectory()) {
            scanDirectory(fullPath);
          } else if (stat.isFile()) {
            const ext = entry.substring(entry.lastIndexOf('.'));
            if (codeExtensions.includes(ext)) {
              this.scanFileForTodos(fullPath, todos);
            }
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    };

    // Scan common source directories
    const sourceDirs = ['apps', 'packages', 'scripts', 'ops'];
    for (const dir of sourceDirs) {
      const fullPath = join(this.workspaceRoot, dir);
      if (existsSync(fullPath)) {
        scanDirectory(fullPath);
      }
    }

    return todos;
  }

  private scanFileForTodos(filePath: string, todos: TodoItem[]): void {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        const todoMatch = line.match(
          /(TODO|FIXME|HACK|NOTE|XXX)[\s:]+(.+)/i
        );
        if (todoMatch) {
          const type = todoMatch[1].toUpperCase() as TodoItem['type'];
          const message = todoMatch[2].trim();
          const priority = this.inferPriority(type, message);

          todos.push({
            file: filePath.replace(this.workspaceRoot + '/', ''),
            line: index + 1,
            type,
            message,
            priority,
          });
        }
      });
    } catch (error) {
      // Skip files we can't read
    }
  }

  private inferPriority(
    type: TodoItem['type'],
    message: string
  ): TodoItem['priority'] {
    const lower = message.toLowerCase();

    if (type === 'FIXME' || type === 'HACK' || lower.includes('critical') || lower.includes('urgent')) {
      return 'high';
    }
    if (type === 'TODO' && (lower.includes('important') || lower.includes('soon'))) {
      return 'high';
    }
    if (type === 'XXX' || lower.includes('deprecated') || lower.includes('remove')) {
      return 'high';
    }
    if (type === 'NOTE') {
      return 'low';
    }

    return 'medium';
  }

  private async clusterIntoTodos(todos: TodoItem[]): Promise<Epic[]> {
    const epics: Map<string, TodoItem[]> = new Map();

    // Cluster by directory/feature area
    for (const todo of todos) {
      const parts = todo.file.split('/');
      let epicName = 'General';

      // Determine epic based on file path
      if (parts[0] === 'apps') {
        epicName = `App: ${parts[1] || 'Unknown'}`;
      } else if (parts[0] === 'packages') {
        epicName = `Package: ${parts[1] || 'Unknown'}`;
      } else if (parts[0] === 'ops') {
        epicName = 'Operations';
      } else if (parts[0] === 'scripts') {
        epicName = 'Scripts & Automation';
      } else if (todo.file.includes('security')) {
        epicName = 'Security';
      } else if (todo.file.includes('performance')) {
        epicName = 'Performance';
      } else if (todo.file.includes('test')) {
        epicName = 'Testing';
      }

      if (!epics.has(epicName)) {
        epics.set(epicName, []);
      }
      epics.get(epicName)!.push(todo);
    }

    // Convert to Epic objects
    return Array.from(epics.entries()).map(([name, todos]) => ({
      name,
      todos,
      estimatedEffort: this.estimateEffort(todos),
    }));
  }

  private estimateEffort(todos: TodoItem[]): number {
    // Simple estimation: high priority = 3 points, medium = 2, low = 1
    return todos.reduce((sum, todo) => {
      if (todo.priority === 'high') return sum + 3;
      if (todo.priority === 'medium') return sum + 2;
      return sum + 1;
    }, 0);
  }

  private async generateRoadmap(epics: Epic[]): Promise<void> {
    const roadmapPath = join(this.workspaceRoot, 'roadmap', 'current-sprint.md');

    const roadmap = `# Current Sprint Roadmap

Generated: ${new Date().toISOString()}

## Overview

This roadmap is automatically generated from TODO/FIXME comments in the codebase.

**Total TODOs**: ${epics.reduce((sum, epic) => sum + epic.todos.length, 0)}
**Total Epics**: ${epics.length}
**Estimated Effort**: ${epics.reduce((sum, epic) => sum + epic.estimatedEffort, 0)} story points

## Epics

${epics
  .sort((a, b) => b.estimatedEffort - a.estimatedEffort)
  .map(
    (epic) => `### ${epic.name}

**Effort**: ${epic.estimatedEffort} story points
**Items**: ${epic.todos.length}

${epic.todos
  .sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  })
  .map(
    (todo) => `- [ ] **${todo.type}** (${todo.priority}): ${todo.message}
  - File: \`${todo.file}:${todo.line}\``
  )
  .join('\n')}
`
  )
  .join('\n')}

## Priority Breakdown

- **High Priority**: ${epics.reduce((sum, epic) => sum + epic.todos.filter((t) => t.priority === 'high').length, 0)} items
- **Medium Priority**: ${epics.reduce((sum, epic) => sum + epic.todos.filter((t) => t.priority === 'medium').length, 0)} items
- **Low Priority**: ${epics.reduce((sum, epic) => sum + epic.todos.filter((t) => t.priority === 'low').length, 0)} items

## Next Steps

1. Review high-priority items and create GitHub issues
2. Assign epics to team members
3. Estimate sprint capacity and select items for next sprint
4. Update this roadmap weekly
`;

    writeFileSync(roadmapPath, roadmap);
  }

  private async generateSprintPlan(epics: Epic[]): Promise<void> {
    // In production, would create GitHub issues for high-priority TODOs
    const highPriorityTodos = epics
      .flatMap((epic) => epic.todos)
      .filter((todo) => todo.priority === 'high');

    if (highPriorityTodos.length > 0) {
      console.log(`📌 Found ${highPriorityTodos.length} high-priority TODOs that should be converted to GitHub issues`);
      // In production, would use GitHub API to create issues
    }
  }
}
