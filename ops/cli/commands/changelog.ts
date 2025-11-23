/**
 * Changelog command
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('changelog-ts');
export async function runChangelog(options: { version?: string; unreleased?: boolean }) {
  
  const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');

  try {
    // Get git log
    const gitLog = execSync('git log --pretty=format:"%h|%s|%an|%ad" --date=short', {
      encoding: 'utf-8',
    });

    const commits = gitLog
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => {
        const [hash, message, author, date] = line.split('|');
        return { hash, message, author, date };
      });

    // Categorize commits
    const features: string[] = [];
    const fixes: string[] = [];
    const docs: string[] = [];
    const other: string[] = [];

    commits.forEach((commit) => {
      const msg = commit.message.toLowerCase();
      if (msg.startsWith('feat:') || msg.startsWith('feature:')) {
        features.push(`- ${commit.message} (${commit.hash})`);
      } else if (msg.startsWith('fix:') || msg.startsWith('bugfix:')) {
        fixes.push(`- ${commit.message} (${commit.hash})`);
      } else if (msg.startsWith('docs:') || msg.startsWith('doc:')) {
        docs.push(`- ${commit.message} (${commit.hash})`);
      } else {
        other.push(`- ${commit.message} (${commit.hash})`);
      }
    });

    const version = options.version || 'Unreleased';
    const date = new Date().toISOString().split('T')[0];

    const changelog = `# Changelog

All notable changes to this project will be documented in this file.

## [${version}] - ${date}

${features.length > 0 ? `### Added\n${features.join('\n')}\n` : ''}
${fixes.length > 0 ? `### Fixed\n${fixes.join('\n')}\n` : ''}
${docs.length > 0 ? `### Documentation\n${docs.join('\n')}\n` : ''}
${other.length > 0 ? `### Other\n${other.join('\n')}\n` : ''}
`;

    if (fs.existsSync(changelogPath)) {
      const existing = fs.readFileSync(changelogPath, 'utf-8');
      const newContent = changelog + '\n' + existing.replace(/^# Changelog\n/, '');
      fs.writeFileSync(changelogPath, newContent);
    } else {
      fs.writeFileSync(changelogPath, changelog);
    }

      } catch (error) {
    logger.error('❌ Changelog generation failed:', { error });
    process.exit(1);
  }
}
