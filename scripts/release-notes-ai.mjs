/**
 * AI-Powered Release Notes Generator
 * Uses commit diffs and AI summarization to generate human-readable release notes
 */

import OpenAI from 'openai';
import { execSync } from 'git-raw-commits';
import fs from 'fs';
import path from 'path';

class AIReleaseNotesGenerator {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  /**
   * Generate release notes for a specific version
   */
  async generateReleaseNotes(version, fromTag = null, toTag = 'HEAD') {
    console.log(`📝 Generating release notes for version ${version}...`);

    try {
      // Get commits
      const commits = await this.getCommits(fromTag, toTag);
      
      // Categorize commits
      const categorizedCommits = this.categorizeCommits(commits);
      
      // Generate AI summaries
      const summaries = await this.generateAISummaries(categorizedCommits);
      
      // Generate release notes
      const releaseNotes = this.formatReleaseNotes(version, summaries, commits);
      
      // Save release notes
      await this.saveReleaseNotes(version, releaseNotes);
      
      console.log('✅ Release notes generated successfully!');
      return releaseNotes;
    } catch (error) {
      console.error('❌ Failed to generate release notes:', error);
      throw error;
    }
  }

  /**
   * Get commits between tags
   */
  async getCommits(fromTag, toTag) {
    try {
      const range = fromTag ? `${fromTag}..${toTag}` : toTag;
      const command = `git log ${range} --pretty=format:"%H|%an|%ae|%ad|%s|%b" --date=short`;
      
      const output = execSync(command, { encoding: 'utf8' });
      const lines = output.trim().split('\n').filter(line => line.length > 0);
      
      return lines.map(line => {
        const [hash, author, email, date, subject, body] = line.split('|', 6);
        return {
          hash,
          author,
          email,
          date,
          subject,
          body: body || ''
        };
      });
    } catch (error) {
      console.error('Failed to get commits:', error);
      return [];
    }
  }

  /**
   * Categorize commits by type
   */
  categorizeCommits(commits) {
    const categories = {
      features: [],
      fixes: [],
      docs: [],
      refactor: [],
      perf: [],
      chore: [],
      breaking: [],
      security: [],
      other: []
    };

    commits.forEach(commit => {
      const type = this.getCommitType(commit.subject);
      const category = this.mapTypeToCategory(type);
      
      if (category) {
        categories[category].push(commit);
      } else {
        categories.other.push(commit);
      }
    });

    return categories;
  }

  /**
   * Get commit type from subject
   */
  getCommitType(subject) {
    const conventionalPattern = /^(\w+)(\(.+\))?: (.+)$/;
    const match = subject.match(conventionalPattern);
    
    if (match) {
      return match[1].toLowerCase();
    }
    
    // Fallback patterns
    if (subject.toLowerCase().includes('feat')) return 'feat';
    if (subject.toLowerCase().includes('fix')) return 'fix';
    if (subject.toLowerCase().includes('doc')) return 'docs';
    if (subject.toLowerCase().includes('refactor')) return 'refactor';
    if (subject.toLowerCase().includes('perf')) return 'perf';
    if (subject.toLowerCase().includes('chore')) return 'chore';
    if (subject.toLowerCase().includes('security')) return 'security';
    if (subject.toLowerCase().includes('breaking')) return 'breaking';
    
    return 'other';
  }

  /**
   * Map commit type to category
   */
  mapTypeToCategory(type) {
    const mapping = {
      'feat': 'features',
      'feature': 'features',
      'fix': 'fixes',
      'bugfix': 'fixes',
      'docs': 'docs',
      'documentation': 'docs',
      'refactor': 'refactor',
      'perf': 'perf',
      'performance': 'perf',
      'chore': 'chore',
      'security': 'security',
      'breaking': 'breaking'
    };
    
    return mapping[type] || 'other';
  }

  /**
   * Generate AI summaries for each category
   */
  async generateAISummaries(categorizedCommits) {
    const summaries = {};
    
    for (const [category, commits] of Object.entries(categorizedCommits)) {
      if (commits.length === 0) continue;
      
      try {
        const summary = await this.generateCategorySummary(category, commits);
        summaries[category] = summary;
      } catch (error) {
        console.warn(`Failed to generate summary for ${category}:`, error.message);
        summaries[category] = this.generateFallbackSummary(category, commits);
      }
    }
    
    return summaries;
  }

  /**
   * Generate AI summary for a category
   */
  async generateCategorySummary(category, commits) {
    const commitTexts = commits.map(commit => 
      `${commit.subject}${commit.body ? `\n${commit.body}` : ''}`
    ).join('\n\n');

    const prompt = `Analyze the following ${category} commits and provide a concise, user-friendly summary. Focus on what users will notice and benefit from. Group related changes together and highlight the most important ones:

${commitTexts}

Please provide:
1. A brief overview of the changes
2. Key highlights (3-5 bullet points)
3. Any breaking changes or important notes
4. Impact on users

Format as markdown.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert technical writer who creates clear, user-friendly release notes. Focus on user benefits and impact.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    return response.choices[0].message.content;
  }

  /**
   * Generate fallback summary when AI fails
   */
  generateFallbackSummary(category, commits) {
    const categoryNames = {
      features: 'New Features',
      fixes: 'Bug Fixes',
      docs: 'Documentation',
      refactor: 'Code Improvements',
      perf: 'Performance',
      chore: 'Maintenance',
      breaking: 'Breaking Changes',
      security: 'Security',
      other: 'Other Changes'
    };

    const categoryName = categoryNames[category] || 'Changes';
    let summary = `## ${categoryName}\n\n`;

    commits.forEach(commit => {
      summary += `- ${commit.subject}\n`;
    });

    return summary;
  }

  /**
   * Format release notes
   */
  formatReleaseNotes(version, summaries, commits) {
    const date = new Date().toISOString().split('T')[0];
    const totalCommits = commits.length;
    const contributors = [...new Set(commits.map(c => c.author))].length;

    let releaseNotes = `# Release ${version}\n\n`;
    releaseNotes += `**Release Date:** ${date}\n`;
    releaseNotes += `**Total Commits:** ${totalCommits}\n`;
    releaseNotes += `**Contributors:** ${contributors}\n\n`;

    // Add breaking changes first
    if (summaries.breaking) {
      releaseNotes += `## 🚨 Breaking Changes\n\n`;
      releaseNotes += summaries.breaking;
      releaseNotes += `\n\n`;
    }

    // Add security updates
    if (summaries.security) {
      releaseNotes += `## 🔒 Security Updates\n\n`;
      releaseNotes += summaries.security;
      releaseNotes += `\n\n`;
    }

    // Add new features
    if (summaries.features) {
      releaseNotes += `## ✨ New Features\n\n`;
      releaseNotes += summaries.features;
      releaseNotes += `\n\n`;
    }

    // Add bug fixes
    if (summaries.fixes) {
      releaseNotes += `## 🐛 Bug Fixes\n\n`;
      releaseNotes += summaries.fixes;
      releaseNotes += `\n\n`;
    }

    // Add performance improvements
    if (summaries.perf) {
      releaseNotes += `## ⚡ Performance Improvements\n\n`;
      releaseNotes += summaries.perf;
      releaseNotes += `\n\n`;
    }

    // Add documentation updates
    if (summaries.docs) {
      releaseNotes += `## 📚 Documentation\n\n`;
      releaseNotes += summaries.docs;
      releaseNotes += `\n\n`;
    }

    // Add other improvements
    if (summaries.refactor) {
      releaseNotes += `## 🔧 Code Improvements\n\n`;
      releaseNotes += summaries.refactor;
      releaseNotes += `\n\n`;
    }

    // Add maintenance updates
    if (summaries.chore) {
      releaseNotes += `## 🛠️ Maintenance\n\n`;
      releaseNotes += summaries.chore;
      releaseNotes += `\n\n`;
    }

    // Add other changes
    if (summaries.other) {
      releaseNotes += `## 📝 Other Changes\n\n`;
      releaseNotes += summaries.other;
      releaseNotes += `\n\n`;
    }

    // Add full changelog
    releaseNotes += `## 📋 Full Changelog\n\n`;
    releaseNotes += `\`\`\`\n`;
    commits.forEach(commit => {
      releaseNotes += `${commit.hash.substring(0, 7)} ${commit.subject} (${commit.author})\n`;
    });
    releaseNotes += `\`\`\`\n\n`;

    // Add installation instructions
    releaseNotes += `## 🚀 Installation\n\n`;
    releaseNotes += `\`\`\`bash\n`;
    releaseNotes += `# Update to latest version\n`;
    releaseNotes += `git pull origin main\n`;
    releaseNotes += `pnpm install\n`;
    releaseNotes += `pnpm run build\n`;
    releaseNotes += `\`\`\`\n\n`;

    // Add migration guide if breaking changes
    if (summaries.breaking) {
      releaseNotes += `## 🔄 Migration Guide\n\n`;
      releaseNotes += `This release includes breaking changes. Please review the breaking changes section above and update your code accordingly.\n\n`;
      releaseNotes += `For detailed migration instructions, please refer to the [migration guide](./MIGRATION.md).\n\n`;
    }

    return releaseNotes;
  }

  /**
   * Save release notes to file
   */
  async saveReleaseNotes(version, releaseNotes) {
    const releasesDir = path.join(process.cwd(), 'RELEASES');
    if (!fs.existsSync(releasesDir)) {
      fs.mkdirSync(releasesDir, { recursive: true });
    }

    const filename = `release-${version}.md`;
    const filepath = path.join(releasesDir, filename);
    
    fs.writeFileSync(filepath, releaseNotes);
    console.log(`📄 Release notes saved to: ${filepath}`);

    // Also update the main CHANGELOG.md
    await this.updateChangelog(version, releaseNotes);
  }

  /**
   * Update main changelog
   */
  async updateChangelog(version, releaseNotes) {
    const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
    
    let changelog = '';
    if (fs.existsSync(changelogPath)) {
      changelog = fs.readFileSync(changelogPath, 'utf8');
    } else {
      changelog = '# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n';
    }

    // Extract the release notes content (without the title)
    const releaseContent = releaseNotes.replace(/^# Release .+\n\n/, '');
    
    // Insert at the beginning
    const newChangelog = `# Changelog\n\n## [${version}] - ${new Date().toISOString().split('T')[0]}\n\n${releaseContent}\n\n${changelog.replace(/^# Changelog\n\n/, '')}`;
    
    fs.writeFileSync(changelogPath, newChangelog);
    console.log('📄 Changelog updated');
  }

  /**
   * Generate release notes for the latest version
   */
  async generateLatestReleaseNotes() {
    try {
      // Get the latest tag
      const latestTag = execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
      
      // Get the previous tag
      let previousTag = null;
      try {
        const tags = execSync('git tag --sort=-version:refname', { encoding: 'utf8' }).trim().split('\n');
        if (tags.length > 1) {
          previousTag = tags[1];
        }
      } catch (error) {
        // No previous tag found
      }

      return await this.generateReleaseNotes(latestTag, previousTag, latestTag);
    } catch (error) {
      console.error('Failed to generate latest release notes:', error);
      throw error;
    }
  }

  /**
   * Generate release notes for a specific range
   */
  async generateRangeReleaseNotes(version, fromTag, toTag) {
    return await this.generateReleaseNotes(version, fromTag, toTag);
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new AIReleaseNotesGenerator();
  
  const args = process.argv.slice(2);
  const version = args[0] || 'v1.0.0';
  const fromTag = args[1] || null;
  const toTag = args[2] || 'HEAD';

  if (args.includes('--latest')) {
    generator.generateLatestReleaseNotes().catch(console.error);
  } else {
    generator.generateRangeReleaseNotes(version, fromTag, toTag).catch(console.error);
  }
}

export default AIReleaseNotesGenerator;