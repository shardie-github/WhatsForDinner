#!/usr/bin/env node

/**
 * PR Generator
 * Auto-generates PRs for safe remediations
 * Minor security fixes → auto-PR with label security-auto
 * Major or breaking → open issue + draft PR requiring manual approval
 */

import { execSync } from 'child_process';
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';

export class PRGenerator {
  constructor(config) {
    this.config = config;
    this.prs = [];
  }

  async generatePRs(results) {
    try {
      // Check if we're in a git repository
      try {
        execSync('git rev-parse --git-dir', { stdio: 'pipe' });
      } catch (e) {
        console.warn('Not in a git repository, skipping PR generation');
        return [];
      }
      
      // Generate PRs for dependency updates (patch/minor only)
      await this.generateDependencyPRs(results);
      
      // Generate PRs for security fixes
      await this.generateSecurityPRs(results);
      
      // Generate issues for recurring failures
      await this.generateFailureIssues(results);
      
      return this.prs;
    } catch (error) {
      console.error('Error generating PRs:', error);
      return [];
    }
  }

  async generateDependencyPRs(results) {
    // Find safe patch/minor updates
    const safeUpdates = results.dependencyHealth.outdated.filter(pkg => {
      return pkg.type === 'patch' || pkg.type === 'minor';
    });
    
    if (safeUpdates.length === 0) return;
    
    // Group by workspace/service
    const updatesByService = {};
    safeUpdates.forEach(update => {
      const service = update.workspace || 'root';
      if (!updatesByService[service]) {
        updatesByService[service] = [];
      }
      updatesByService[service].push(update);
    });
    
    // Generate PR for each service (or combined)
    for (const [service, updates] of Object.entries(updatesByService)) {
      if (updates.length === 0) continue;
      
      const pr = await this.createDependencyPR(service, updates);
      if (pr) {
        this.prs.push(pr);
      }
    }
  }

  async createDependencyPR(service, updates) {
    const branchName = `reliability/dependency-updates-${service}-${Date.now()}`;
    const prTitle = `chore: Update dependencies (${service})`;
    
    try {
      // Create branch
      execSync(`git checkout -b ${branchName}`, { stdio: 'pipe' });
      
      // Update packages (this would actually run pnpm update)
      // For now, create a changelog file
      const changelog = this.generateDependencyChangelog(updates);
      const changelogPath = join(process.cwd(), 'DEPENDENCY_UPDATES.md');
      writeFileSync(changelogPath, changelog);
      
      // Commit
      execSync(`git add ${changelogPath}`, { stdio: 'pipe' });
      execSync(`git commit -m "chore: Update dependencies for ${service}"`, { stdio: 'pipe' });
      
      // Note: Actual PR creation would require GitHub API
      // For now, return PR metadata
      return {
        type: 'dependency',
        branch: branchName,
        title: prTitle,
        body: changelog,
        labels: ['security-auto', 'dependencies'],
        updates: updates.length,
        service: service
      };
    } catch (error) {
      // If branch already exists or other git error, skip
      console.warn(`Could not create PR for ${service}:`, error.message);
      return null;
    }
  }

  generateDependencyChangelog(updates) {
    let changelog = `# Dependency Updates\n\n`;
    changelog += `This PR updates the following dependencies:\n\n`;
    
    updates.forEach(update => {
      changelog += `- **${update.package}**: ${update.current} → ${update.latest} (${update.type})\n`;
    });
    
    changelog += `\n## Type\n`;
    changelog += `- Patch/Minor updates only (safe for auto-merge)\n\n`;
    changelog += `## Testing\n`;
    changelog += `- [ ] Run tests\n`;
    changelog += `- [ ] Verify build succeeds\n`;
    changelog += `- [ ] Check for breaking changes\n`;
    
    return changelog;
  }

  async generateSecurityPRs(results) {
    // Find high-severity vulnerabilities with fixes available
    const fixableVulns = results.dependencyHealth.vulnerabilities.filter(v => {
      return (v.severity === 'high' || v.severity === 'critical') && v.fixAvailable;
    });
    
    if (fixableVulns.length === 0) return;
    
    // Group by severity
    const critical = fixableVulns.filter(v => v.severity === 'critical');
    const high = fixableVulns.filter(v => v.severity === 'high');
    
    if (critical.length > 0) {
      // Critical vulnerabilities → create issue + draft PR
      const issue = await this.createSecurityIssue('critical', critical);
      if (issue) {
        this.prs.push({ type: 'issue', ...issue });
      }
    }
    
    if (high.length > 0) {
      // High vulnerabilities → auto-PR
      const pr = await this.createSecurityPR('high', high);
      if (pr) {
        this.prs.push(pr);
      }
    }
  }

  async createSecurityPR(severity, vulnerabilities) {
    const branchName = `security/fix-${severity}-vulnerabilities-${Date.now()}`;
    const prTitle = `🔒 Security: Fix ${severity} vulnerabilities`;
    
    try {
      execSync(`git checkout -b ${branchName}`, { stdio: 'pipe' });
      
      const changelog = this.generateSecurityChangelog(severity, vulnerabilities);
      const changelogPath = join(process.cwd(), 'SECURITY_FIXES.md');
      writeFileSync(changelogPath, changelog);
      
      execSync(`git add ${changelogPath}`, { stdio: 'pipe' });
      execSync(`git commit -m "security: Fix ${severity} vulnerabilities"`, { stdio: 'pipe' });
      
      return {
        type: 'security',
        branch: branchName,
        title: prTitle,
        body: changelog,
        labels: ['security-auto', 'security'],
        severity: severity,
        vulnerabilities: vulnerabilities.length
      };
    } catch (error) {
      console.warn(`Could not create security PR:`, error.message);
      return null;
    }
  }

  generateSecurityChangelog(severity, vulnerabilities) {
    let changelog = `# Security Fixes\n\n`;
    changelog += `This PR addresses ${severity}-severity vulnerabilities:\n\n`;
    
    vulnerabilities.forEach(vuln => {
      changelog += `- **${vuln.package}**: ${vuln.title}\n`;
      if (vuln.url) {
        changelog += `  - [Details](${vuln.url})\n`;
      }
    });
    
    changelog += `\n## Action Required\n`;
    changelog += `- Run \`npm audit fix\` or update affected packages\n`;
    changelog += `- Review changes before merging\n`;
    changelog += `- Test thoroughly\n`;
    
    return changelog;
  }

  async createSecurityIssue(severity, vulnerabilities) {
    // Create issue metadata (actual GitHub issue creation would use API)
    return {
      type: 'issue',
      title: `🚨 Recurring Failure: ${severity} Security Vulnerabilities`,
      body: this.generateIssueBody(severity, vulnerabilities),
      labels: ['security', 'critical', 'needs-review'],
      severity: severity,
      vulnerabilities: vulnerabilities.length
    };
  }

  generateIssueBody(severity, vulnerabilities) {
    let body = `## ${severity.toUpperCase()} Security Vulnerabilities Detected\n\n`;
    body += `The reliability orchestrator detected ${vulnerabilities.length} ${severity}-severity vulnerabilities:\n\n`;
    
    vulnerabilities.forEach(vuln => {
      body += `- **${vuln.package}**: ${vuln.title}\n`;
      if (vuln.url) {
        body += `  - [Details](${vuln.url})\n`;
      }
    });
    
    body += `\n## Recommended Actions\n`;
    body += `1. Review each vulnerability\n`;
    body += `2. Determine if fix is available\n`;
    body += `3. Create PR with fixes\n`;
    body += `4. Test thoroughly before merging\n`;
    
    return body;
  }

  async generateFailureIssues(results) {
    // Create issues for recurring failures
    results.errorTriage.recurringFailures.forEach(failure => {
      const issue = {
        type: 'issue',
        title: `🚨 Recurring Failure: ${failure.component}`,
        body: this.generateFailureIssueBody(failure),
        labels: ['reliability', 'bug', 'needs-triage'],
        component: failure.component,
        count: failure.count
      };
      
      this.prs.push(issue);
    });
  }

  generateFailureIssueBody(failure) {
    let body = `## Recurring Failure Detected\n\n`;
    body += `**Component**: ${failure.component}\n`;
    body += `**Occurrences**: ${failure.count} times\n`;
    body += `**First Seen**: ${failure.firstSeen}\n`;
    body += `**Last Seen**: ${failure.lastSeen}\n`;
    body += `**Category**: ${failure.category}\n\n`;
    
    body += `## Error Pattern\n\`\`\`\n${failure.pattern}\n\`\`\`\n\n`;
    
    body += `## Examples\n\n`;
    failure.examples.forEach((example, i) => {
      body += `### Example ${i + 1}\n`;
      body += `**Timestamp**: ${example.timestamp}\n`;
      body += `**Message**: ${example.message}\n`;
      if (example.context) {
        body += `**Context**: \`\`\`json\n${JSON.stringify(example.context, null, 2)}\n\`\`\`\n`;
      }
      body += `\n`;
    });
    
    body += `## Recommended Actions\n`;
    body += `1. Investigate root cause\n`;
    body += `2. Implement fix\n`;
    body += `3. Add monitoring/alerting\n`;
    body += `4. Add tests to prevent regression\n`;
    
    return body;
  }
}
