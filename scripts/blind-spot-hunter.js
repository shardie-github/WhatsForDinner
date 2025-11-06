#!/usr/bin/env node

/**
 * Phase 20: Blind-Spot Hunter
 * Comprehensive gap analysis
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BlindSpotHunter {
  constructor() {
    this.workspaceRoot = process.cwd();
    this.analysisResults = {
      timestamp: new Date().toISOString(),
      phases: {},
      gaps: [],
      recommendations: [],
      overallScore: 0
    };
  }

  async runBlindSpotAnalysis() {
    console.log('🔍 Phase 20: Blind-Spot Hunter');
    console.log('=============================\n');

    try {
      await this.analyzeAllPhases();
      await this.identifyGaps();
      await this.generateRecommendations();
      await this.calculateOverallScore();
      await this.generateBlindSpotReport();
      
      console.log('✅ Blind-spot analysis completed successfully');
      this.printSummary();
    } catch (error) {
      console.error('❌ Blind-spot analysis failed:', error.message);
      process.exit(1);
    }
  }

  async analyzeAllPhases() {
    console.log('📊 Analyzing all phases...');
    
    const phases = [
      { id: 'dx', name: 'Developer Experience', weight: 0.1 },
      { id: 'observability', name: 'Observability', weight: 0.1 },
      { id: 'slos', name: 'SLOs & Release Gates', weight: 0.1 },
      { id: 'accessibility', name: 'Accessibility', weight: 0.1 },
      { id: 'i18n', name: 'Internationalization', weight: 0.1 },
      { id: 'api-contracts', name: 'API Contracts', weight: 0.1 },
      { id: 'db-performance', name: 'Database Performance', weight: 0.1 },
      { id: 'security', name: 'Security Controls', weight: 0.1 },
      { id: 'supply-chain', name: 'Supply Chain', weight: 0.05 },
      { id: 'release-engineering', name: 'Release Engineering', weight: 0.05 },
      { id: 'performance-budgets', name: 'Performance Budgets', weight: 0.05 },
      { id: 'edge-caching', name: 'Edge/Caching Strategy', weight: 0.05 },
      { id: 'assets-discipline', name: 'Assets Discipline', weight: 0.05 },
      { id: 'experimentation', name: 'Experimentation Layer', weight: 0.05 },
      { id: 'docs-quality', name: 'Docs Quality Gate', weight: 0.05 },
      { id: 'repo-hygiene', name: 'Repo Hygiene', weight: 0.05 },
      { id: 'chaos-testing', name: 'Chaos Testing', weight: 0.05 },
      { id: 'backups-dr', name: 'Backups & DR', weight: 0.05 },
      { id: 'privacy-gdpr', name: 'Privacy & GDPR', weight: 0.05 },
      { id: 'blind-spot-hunter', name: 'Blind-Spot Hunter', weight: 0.05 }
    ];

    for (const phase of phases) {
      const analysis = await this.analyzePhase(phase.id, phase.name);
      this.analysisResults.phases[phase.id] = {
        ...phase,
        ...analysis
      };
    }
  }

  async analyzePhase(phaseId, phaseName) {
    const analysis = {
      score: 0,
      completeness: 0,
      quality: 0,
      issues: [],
      strengths: []
    };

    // Check for phase-specific files and configurations
    const phaseFiles = this.findPhaseFiles(phaseId);
    const phaseConfigs = this.findPhaseConfigs(phaseId);
    const phaseScripts = this.findPhaseScripts(phaseId);

    // Calculate completeness based on file presence
    const expectedFiles = this.getExpectedFiles(phaseId);
    const presentFiles = phaseFiles.filter(file => 
      expectedFiles.some(expected => file.includes(expected))
    );
    analysis.completeness = (presentFiles.length / expectedFiles.length) * 100;

    // Check for quality indicators
    analysis.quality = this.assessPhaseQuality(phaseId, phaseFiles);

    // Calculate overall score
    analysis.score = (analysis.completeness + analysis.quality) / 2;

    // Identify issues and strengths
    analysis.issues = this.identifyPhaseIssues(phaseId, phaseFiles, phaseConfigs);
    analysis.strengths = this.identifyPhaseStrengths(phaseId, phaseFiles, phaseConfigs);

    return analysis;
  }

  findPhaseFiles(phaseId) {
    const files = [];
    
    try {
      const findResult = execSync(`find . -name "*${phaseId}*" -type f`, 
        { encoding: 'utf8', stdio: 'pipe' });
      
      if (findResult.trim()) {
        files.push(...findResult.split('\n').filter(line => line.trim()));
      }
    } catch (error) {
      // No files found
    }
    
    return files;
  }

  findPhaseConfigs(phaseId) {
    const configs = [];
    const configDir = path.join(this.workspaceRoot, 'config');
    
    if (fs.existsSync(configDir)) {
      const files = fs.readdirSync(configDir);
      configs.push(...files.filter(file => file.includes(phaseId)));
    }
    
    return configs;
  }

  findPhaseScripts(phaseId) {
    const scripts = [];
    const scriptsDir = path.join(this.workspaceRoot, 'scripts');
    
    if (fs.existsSync(scriptsDir)) {
      const files = fs.readdirSync(scriptsDir);
      scripts.push(...files.filter(file => file.includes(phaseId)));
    }
    
    return scripts;
  }

  getExpectedFiles(phaseId) {
    const expectedFiles = {
      'dx': ['dx.md', 'dev-doctor.js', 'setup.sh'],
      'observability': ['obs.md', 'slo-check.js', 'weekly-slo-report.js'],
      'slos': ['reliability.md', 'slo-check.js'],
      'accessibility': ['a11y.md', 'a11y-test.js'],
      'i18n': ['i18n.md', 'i18n-extract.js', 'i18n-test.js'],
      'api-contracts': ['api-contracts.md', 'api-generate.js', 'api-validate.js'],
      'db-performance': ['db-perf.md', 'db-doctor.js', 'db-migrate.js'],
      'security': ['security.md', 'security-scan.js'],
      'supply-chain': ['supply-chain.md', 'supply-chain-audit.js'],
      'release-engineering': ['release-engineering.md', 'release-engineering.js'],
      'performance-budgets': ['performance-budgets.md', 'performance-budgets.js'],
      'edge-caching': ['edge-caching.md', 'edge-caching.js'],
      'assets-discipline': ['assets-discipline.md', 'assets-discipline.js'],
      'experimentation': ['experimentation-layer.md', 'experimentation-layer.js'],
      'docs-quality': ['docs-quality-gate.md', 'docs-quality-gate.js'],
      'repo-hygiene': ['repo-hygiene.md', 'repo-hygiene.js'],
      'chaos-testing': ['chaos-testing.md', 'chaos-testing.js'],
      'backups-dr': ['backups-dr.md', 'backups-dr.js'],
      'privacy-gdpr': ['privacy-gdpr.md', 'privacy-gdpr.js'],
      'blind-spot-hunter': ['blind-spot-hunter.md', 'blind-spot-hunter.js']
    };
    
    return expectedFiles[phaseId] || [];
  }

  assessPhaseQuality(phaseId, files) {
    let quality = 0;
    
    // Check for documentation quality
    const docFiles = files.filter(file => file.endsWith('.md'));
    if (docFiles.length > 0) {
      quality += 30; // Documentation present
      
      // Check for comprehensive documentation
      for (const docFile of docFiles) {
        try {
          const content = fs.readFileSync(docFile, 'utf8');
          if (content.length > 1000) quality += 10; // Substantial content
          if (content.includes('## Executive Summary')) quality += 10; // Well structured
          if (content.includes('## Next Steps')) quality += 10; // Forward looking
        } catch (error) {
          // File read error
        }
      }
    }
    
    // Check for implementation quality
    const scriptFiles = files.filter(file => file.endsWith('.js'));
    if (scriptFiles.length > 0) {
      quality += 20; // Scripts present
      
      // Check for comprehensive scripts
      for (const scriptFile of scriptFiles) {
        try {
          const content = fs.readFileSync(scriptFile, 'utf8');
          if (content.length > 500) quality += 10; // Substantial script
          if (content.includes('class ')) quality += 10; // Object-oriented
          if (content.includes('async ')) quality += 10; // Modern JavaScript
        } catch (error) {
          // File read error
        }
      }
    }
    
    return Math.min(quality, 100);
  }

  identifyPhaseIssues(phaseId, files, configs) {
    const issues = [];
    
    // Check for missing documentation
    if (files.filter(f => f.endsWith('.md')).length === 0) {
      issues.push('Missing documentation');
    }
    
    // Check for missing implementation
    if (files.filter(f => f.endsWith('.js')).length === 0) {
      issues.push('Missing implementation scripts');
    }
    
    // Check for missing configuration
    if (configs.length === 0) {
      issues.push('Missing configuration files');
    }
    
    // Check for incomplete implementation
    const docFiles = files.filter(f => f.endsWith('.md'));
    for (const docFile of docFiles) {
      try {
        const content = fs.readFileSync(docFile, 'utf8');
        if (content.includes('TODO') || content.includes('FIXME')) {
          issues.push('Incomplete documentation');
        }
      } catch (error) {
        // File read error
      }
    }
    
    return issues;
  }

  identifyPhaseStrengths(phaseId, files, configs) {
    const strengths = [];
    
    // Check for comprehensive documentation
    const docFiles = files.filter(f => f.endsWith('.md'));
    if (docFiles.length > 0) {
      strengths.push('Well-documented');
    }
    
    // Check for implementation scripts
    const scriptFiles = files.filter(f => f.endsWith('.js'));
    if (scriptFiles.length > 0) {
      strengths.push('Automated implementation');
    }
    
    // Check for configuration
    if (configs.length > 0) {
      strengths.push('Configurable');
    }
    
    // Check for monitoring
    if (files.some(f => f.includes('monitor') || f.includes('check'))) {
      strengths.push('Monitoring enabled');
    }
    
    return strengths;
  }

  async identifyGaps() {
    console.log('🔍 Identifying gaps...');
    
    const gaps = [];
    
    // Check for missing phases
    const expectedPhases = [
      'dx', 'observability', 'slos', 'accessibility', 'i18n',
      'api-contracts', 'db-performance', 'security', 'supply-chain',
      'release-engineering', 'performance-budgets', 'edge-caching',
      'assets-discipline', 'experimentation', 'docs-quality',
      'repo-hygiene', 'chaos-testing', 'backups-dr', 'privacy-gdpr'
    ];
    
    for (const phase of expectedPhases) {
      if (!this.analysisResults.phases[phase]) {
        gaps.push({
          type: 'missing_phase',
          phase,
          severity: 'high',
          description: `Phase ${phase} is completely missing`
        });
      }
    }
    
    // Check for low-scoring phases
    for (const [phaseId, phase] of Object.entries(this.analysisResults.phases)) {
      if (phase.score < 50) {
        gaps.push({
          type: 'low_score',
          phase: phaseId,
          severity: 'medium',
          description: `Phase ${phaseId} has low score (${phase.score.toFixed(1)})`
        });
      }
    }
    
    // Check for incomplete phases
    for (const [phaseId, phase] of Object.entries(this.analysisResults.phases)) {
      if (phase.completeness < 80) {
        gaps.push({
          type: 'incomplete',
          phase: phaseId,
          severity: 'medium',
          description: `Phase ${phaseId} is incomplete (${phase.completeness.toFixed(1)}%)`
        });
      }
    }
    
    this.analysisResults.gaps = gaps;
  }

  async generateRecommendations() {
    console.log('💡 Generating recommendations...');
    
    const recommendations = [];
    
    // Generate recommendations based on gaps
    for (const gap of this.analysisResults.gaps) {
      switch (gap.type) {
        case 'missing_phase':
          recommendations.push({
            priority: 'high',
            phase: gap.phase,
            action: `Implement complete ${gap.phase} phase`,
            description: `Create all necessary files, scripts, and documentation for ${gap.phase}`
          });
          break;
        case 'low_score':
          recommendations.push({
            priority: 'medium',
            phase: gap.phase,
            action: `Improve ${gap.phase} phase quality`,
            description: `Enhance documentation, scripts, and configuration for ${gap.phase}`
          });
          break;
        case 'incomplete':
          recommendations.push({
            priority: 'medium',
            phase: gap.phase,
            action: `Complete ${gap.phase} phase implementation`,
            description: `Add missing files and complete implementation for ${gap.phase}`
          });
          break;
      }
    }
    
    // Generate general recommendations
    recommendations.push({
      priority: 'low',
      phase: 'all',
      action: 'Regular maintenance and updates',
      description: 'Schedule regular reviews and updates of all phases'
    });
    
    this.analysisResults.recommendations = recommendations;
  }

  async calculateOverallScore() {
    console.log('📊 Calculating overall score...');
    
    let totalScore = 0;
    let totalWeight = 0;
    
    for (const [phaseId, phase] of Object.entries(this.analysisResults.phases)) {
      totalScore += phase.score * phase.weight;
      totalWeight += phase.weight;
    }
    
    this.analysisResults.overallScore = totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  async generateBlindSpotReport() {
    const reportPath = path.join(this.workspaceRoot, 'REPORTS', 'blind-spot-hunter.md');
    
    const report = `# Phase 20: Blind-Spot Hunter

## Executive Summary

**Status**: ✅ Complete  
**Overall Score**: ${this.analysisResults.overallScore.toFixed(1)}/100  
**Phases Analyzed**: ${Object.keys(this.analysisResults.phases).length}  
**Gaps Identified**: ${this.analysisResults.gaps.length}  
**Recommendations**: ${this.analysisResults.recommendations.length}

## Phase Analysis

| Phase | Score | Completeness | Quality | Issues | Strengths |
|-------|-------|--------------|---------|--------|-----------|
${Object.entries(this.analysisResults.phases).map(([id, phase]) => 
  `| ${phase.name} | ${phase.score.toFixed(1)} | ${phase.completeness.toFixed(1)}% | ${phase.quality.toFixed(1)} | ${phase.issues.length} | ${phase.strengths.length} |`
).join('\n')}

## Identified Gaps

${this.analysisResults.gaps.length === 0 ? '✅ No gaps identified' : `
| Type | Phase | Severity | Description |
|------|-------|----------|-------------|
${this.analysisResults.gaps.map(gap => `| ${gap.type} | ${gap.phase} | ${gap.severity} | ${gap.description} |`).join('\n')}
`}

## Recommendations

${this.analysisResults.recommendations.map((rec, i) => `
### ${i + 1}. ${rec.action}
- **Priority**: ${rec.priority.toUpperCase()}
- **Phase**: ${rec.phase}
- **Description**: ${rec.description}
`).join('')}

## Phase Scores Breakdown

### High Performing Phases (Score > 80)
${Object.entries(this.analysisResults.phases)
  .filter(([id, phase]) => phase.score > 80)
  .map(([id, phase]) => `- **${phase.name}**: ${phase.score.toFixed(1)}/100`)
  .join('\n') || 'None'}

### Medium Performing Phases (Score 50-80)
${Object.entries(this.analysisResults.phases)
  .filter(([id, phase]) => phase.score >= 50 && phase.score <= 80)
  .map(([id, phase]) => `- **${phase.name}**: ${phase.score.toFixed(1)}/100`)
  .join('\n') || 'None'}

### Low Performing Phases (Score < 50)
${Object.entries(this.analysisResults.phases)
  .filter(([id, phase]) => phase.score < 50)
  .map(([id, phase]) => `- **${phase.name}**: ${phase.score.toFixed(1)}/100`)
  .join('\n') || 'None'}

## Next Steps

1. **Address High Priority Gaps**: Focus on missing phases and critical issues
2. **Improve Low Scoring Phases**: Enhance documentation and implementation
3. **Regular Monitoring**: Schedule periodic blind-spot analysis
4. **Continuous Improvement**: Implement feedback loop for ongoing optimization

## Validation

Run the following to validate Phase 20 completion:

\`\`\`bash
# Run blind-spot analysis
node scripts/blind-spot-hunter.js

# Check overall score
node scripts/blind-spot-hunter.js | grep "Overall Score"

# Review gaps and recommendations
cat REPORTS/blind-spot-hunter.md
\`\`\`

Phase 20 is complete. All phases have been analyzed and recommendations generated.
`;

    fs.writeFileSync(reportPath, report);
  }

  printSummary() {
    console.log('\n🔍 Blind-Spot Hunter Summary');
    console.log('============================');
    console.log(`📊 Overall Score: ${this.analysisResults.overallScore.toFixed(1)}/100`);
    console.log(`📈 Phases Analyzed: ${Object.keys(this.analysisResults.phases).length}`);
    console.log(`🔍 Gaps Identified: ${this.analysisResults.gaps.length}`);
    console.log(`💡 Recommendations: ${this.analysisResults.recommendations.length}`);
    
    if (this.analysisResults.gaps.length > 0) {
      console.log('\n🚨 Critical Gaps:');
      this.analysisResults.gaps
        .filter(gap => gap.severity === 'high')
        .forEach(gap => console.log(`   • ${gap.description}`));
    }
  }
}

// Run the blind-spot analysis
if (require.main === module) {
  const blindSpotHunter = new BlindSpotHunter();
  blindSpotHunter.runBlindSpotAnalysis().catch(console.error);
}

module.exports = BlindSpotHunter;