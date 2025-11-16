#!/usr/bin/env node
/**
 * Generate Release Notes from Conventional Commits
 * Analyzes git commits and generates formatted release notes
 */

import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { secretsManager } from './secrets-manager-unified.mjs';

interface Commit {
  type: string;
  scope?: string;
  subject: string;
  hash: string;
  breaking?: boolean;
}

const RELEASE_NOTES_FILE = path.join(__dirname, '../RELEASE_NOTES.md');

function exec(command: string): string {
  try {
    return child_process.execSync(command, { encoding: 'utf-8', cwd: path.join(__dirname, '..') }).trim();
  } catch (error) {
    return '';
  }
}

function parseCommits(fromTag?: string): Commit[] {
  const range = fromTag ? `${fromTag}..HEAD` : 'HEAD';
  const logFormat = '%H|%s|%b';
  
  const log = exec(`git log ${range} --pretty=format:"${logFormat}" --no-merges`);
  if (!log) return [];

  const commits: Commit[] = [];
  const lines = log.split('\n').filter(Boolean);

  for (const line of lines) {
    const [hash, subject, body] = line.split('|');
    if (!hash || !subject) continue;

    // Parse conventional commit: type(scope): subject
    const match = subject.match(/^(\w+)(?:\(([^)]+)\))?(!)?:\s*(.+)$/);
    if (!match) continue;

    const [, type, scope, breaking, subj] = match;
    commits.push({
      type: type.toLowerCase(),
      scope: scope,
      subject: subj || subject,
      hash: hash.substring(0, 7),
      breaking: !!breaking || (body && body.includes('BREAKING CHANGE')),
    });
  }

  return commits;
}

function groupCommits(commits: Commit[]): Record<string, Commit[]> {
  const groups: Record<string, Commit[]> = {
    breaking: [],
    feat: [],
    fix: [],
    perf: [],
    docs: [],
    refactor: [],
    test: [],
    chore: [],
    other: [],
  };

  for (const commit of commits) {
    if (commit.breaking) {
      groups.breaking.push(commit);
    } else if (groups[commit.type]) {
      groups[commit.type].push(commit);
    } else {
      groups.other.push(commit);
    }
  }

  return groups;
}

function generateReleaseNotes(fromTag?: string): string {
  const commits = parseCommits(fromTag);
  if (commits.length === 0) {
    return '# Release Notes\n\nNo commits found.\n';
  }

  const groups = groupCommits(commits);
  const version = (await secretsManager.getSecret('VERSION')) || process.env.VERSION || '1.0.0';
  const date = new Date().toISOString().split('T')[0];

  let notes = `# Release Notes\n\n`;
  notes += `**Version:** ${version}\n`;
  notes += `**Date:** ${date}\n`;
  notes += `**Commits:** ${commits.length}\n\n`;

  if (groups.breaking.length > 0) {
    notes += `## ?? Breaking Changes\n\n`;
    for (const commit of groups.breaking) {
      notes += `- **${commit.scope || 'general'}**: ${commit.subject} (${commit.hash})\n`;
    }
    notes += '\n';
  }

  if (groups.feat.length > 0) {
    notes += `## ? New Features\n\n`;
    for (const commit of groups.feat) {
      notes += `- ${commit.subject}${commit.scope ? ` (${commit.scope})` : ''}\n`;
    }
    notes += '\n';
  }

  if (groups.fix.length > 0) {
    notes += `## ?? Bug Fixes\n\n`;
    for (const commit of groups.fix) {
      notes += `- ${commit.subject}${commit.scope ? ` (${commit.scope})` : ''}\n`;
    }
    notes += '\n';
  }

  if (groups.perf.length > 0) {
    notes += `## ? Performance Improvements\n\n`;
    for (const commit of groups.perf) {
      notes += `- ${commit.subject}${commit.scope ? ` (${commit.scope})` : ''}\n`;
    }
    notes += '\n';
  }

  if (groups.docs.length > 0) {
    notes += `## ?? Documentation\n\n`;
    for (const commit of groups.docs) {
      notes += `- ${commit.subject}\n`;
    }
    notes += '\n';
  }

  if (groups.refactor.length > 0) {
    notes += `## ?? Refactoring\n\n`;
    for (const commit of groups.refactor) {
      notes += `- ${commit.subject}${commit.scope ? ` (${commit.scope})` : ''}\n`;
    }
    notes += '\n';
  }

  // Other changes
  const otherCount = Object.values(groups).reduce((sum, arr) => {
    if (arr === groups.breaking || arr === groups.feat || arr === groups.fix ||
        arr === groups.perf || arr === groups.docs || arr === groups.refactor) {
      return sum;
    }
    return sum + arr.length;
  }, 0);

  if (otherCount > 0) {
    notes += `## Other Changes\n\n`;
    for (const [type, commits] of Object.entries(groups)) {
      if (type === 'other' || type === 'breaking' || type === 'feat' ||
          type === 'fix' || type === 'perf' || type === 'docs' || type === 'refactor') {
        continue;
      }
      for (const commit of commits) {
        notes += `- [${type}] ${commit.subject}\n`;
      }
    }
    notes += '\n';
  }

  notes += `---\n\n`;
  notes += `*Generated automatically from git commits*\n`;

  return notes;
}

async function main() {
  const fromTag = process.argv[2] || (await secretsManager.getSecret('LAST_TAG')) || process.env.LAST_TAG;
  const notes = generateReleaseNotes(fromTag);
  
  fs.writeFileSync(RELEASE_NOTES_FILE, notes);
  console.log(`Release notes written to ${RELEASE_NOTES_FILE}`);
}

if (require.main === module) {
  main().catch(console.error);
}

export { generateReleaseNotes };
