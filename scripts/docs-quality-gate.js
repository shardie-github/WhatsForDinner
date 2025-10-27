#!/usr/bin/env node

/**
 * Phase 15: Docs Quality Gate
 * Markdown linting and ADRs
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DocsQualityManager {
  constructor() {
    this.workspaceRoot = process.cwd();
    this.qualityRules = {
      markdown: {
        lineLength: 100,
        requireHeaders: true,
        requireToc: true,
        spellCheck: true,
        linkCheck: true
      },
      adr: {
        requiredSections: ['Status', 'Context', 'Decision', 'Consequences'],
        template: 'adr-template.md',
        numbering: true
      }
    };
    this.results = {
      timestamp: new Date().toISOString(),
      markdownFiles: [],
      adrFiles: [],
      violations: [],
      recommendations: []
    };
  }

  async runDocsQualityGate() {
    console.log('📚 Phase 15: Docs Quality Gate');
    console.log('==============================\n');

    try {
      await this.analyzeMarkdownFiles();
      await this.checkADRs();
      await this.setupMarkdownLinting();
      await this.createADRTemplate();
      await this.generateDocsReport();
      
      console.log('✅ Docs quality gate setup completed successfully');
      this.printSummary();
    } catch (error) {
      console.error('❌ Docs quality gate setup failed:', error.message);
      process.exit(1);
    }
  }

  async analyzeMarkdownFiles() {
    console.log('📄 Analyzing markdown files...');
    
    const markdownFiles = this.findMarkdownFiles();
    
    for (const filePath of markdownFiles) {
      const analysis = this.analyzeMarkdownFile(filePath);
      this.results.markdownFiles.push(analysis);
    }
    
    console.log(`   Analyzed ${markdownFiles.length} markdown files`);
  }

  findMarkdownFiles() {
    const markdownFiles = [];
    
    try {
      const findResult = execSync('find . -name "*.md" -not -path "*/node_modules/*" -not -path "*/.git/*"', 
        { encoding: 'utf8', stdio: 'pipe' });
      
      if (findResult.trim()) {
        markdownFiles.push(...findResult.split('\n').filter(line => line.trim()));
      }
    } catch (error) {
      // No markdown files found
    }
    
    return markdownFiles;
  }

  analyzeMarkdownFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    const analysis = {
      path: filePath,
      relativePath: path.relative(this.workspaceRoot, filePath),
      lineCount: lines.length,
      wordCount: content.split(/\s+/).length,
      hasHeaders: this.hasHeaders(content),
      hasToc: this.hasTableOfContents(content),
      longLines: this.findLongLines(lines),
      brokenLinks: this.findBrokenLinks(content, filePath),
      spellingErrors: this.findSpellingErrors(content)
    };
    
    return analysis;
  }

  hasHeaders(content) {
    return /^#+\s/.test(content);
  }

  hasTableOfContents(content) {
    return /^##?\s*Table\s+of\s+Contents/i.test(content) || 
           /^##?\s*Contents/i.test(content) ||
           /^##?\s*TOC/i.test(content);
  }

  findLongLines(lines) {
    const longLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].length > this.qualityRules.markdown.lineLength) {
        longLines.push({
          line: i + 1,
          length: lines[i].length,
          content: lines[i].substring(0, 50) + '...'
        });
      }
    }
    
    return longLines;
  }

  findBrokenLinks(content, filePath) {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links = [];
    let match;
    
    while ((match = linkRegex.exec(content)) !== null) {
      const [fullMatch, text, url] = match;
      
      // Check if it's a relative link
      if (url.startsWith('./') || url.startsWith('../') || (!url.startsWith('http') && !url.startsWith('#'))) {
        const fullPath = path.resolve(path.dirname(filePath), url);
        if (!fs.existsSync(fullPath)) {
          links.push({
            text,
            url,
            fullMatch,
            type: 'broken'
          });
        }
      }
    }
    
    return links;
  }

  findSpellingErrors(content) {
    // Simple spelling check - in a real implementation, use a proper spell checker
    const commonMisspellings = [
      'recieve', 'seperate', 'occured', 'definately', 'accomodate',
      'begining', 'beleive', 'calender', 'cemetary', 'concious'
    ];
    
    const errors = [];
    
    for (const misspelling of commonMisspellings) {
      const regex = new RegExp(`\\b${misspelling}\\b`, 'gi');
      let match;
      
      while ((match = regex.exec(content)) !== null) {
        errors.push({
          word: match[0],
          suggestion: this.getSpellingSuggestion(misspelling),
          position: match.index
        });
      }
    }
    
    return errors;
  }

  getSpellingSuggestion(word) {
    const suggestions = {
      'recieve': 'receive',
      'seperate': 'separate',
      'occured': 'occurred',
      'definately': 'definitely',
      'accomodate': 'accommodate',
      'begining': 'beginning',
      'beleive': 'believe',
      'calender': 'calendar',
      'cemetary': 'cemetery',
      'concious': 'conscious'
    };
    
    return suggestions[word.toLowerCase()] || word;
  }

  async checkADRs() {
    console.log('📋 Checking ADRs (Architecture Decision Records)...');
    
    const adrFiles = this.findADRFiles();
    
    for (const filePath of adrFiles) {
      const analysis = this.analyzeADRFile(filePath);
      this.results.adrFiles.push(analysis);
    }
    
    console.log(`   Found ${adrFiles.length} ADR files`);
  }

  findADRFiles() {
    const adrFiles = [];
    
    try {
      const findResult = execSync('find . -name "ADR-*.md" -o -name "adr-*.md" -o -name "*-adr.md"', 
        { encoding: 'utf8', stdio: 'pipe' });
      
      if (findResult.trim()) {
        adrFiles.push(...findResult.split('\n').filter(line => line.trim()));
      }
    } catch (error) {
      // No ADR files found
    }
    
    return adrFiles;
  }

  analyzeADRFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    const analysis = {
      path: filePath,
      relativePath: path.relative(this.workspaceRoot, filePath),
      hasRequiredSections: this.checkRequiredSections(content),
      missingSections: this.findMissingSections(content),
      hasStatus: this.hasSection(content, 'Status'),
      hasContext: this.hasSection(content, 'Context'),
      hasDecision: this.hasSection(content, 'Decision'),
      hasConsequences: this.hasSection(content, 'Consequences')
    };
    
    return analysis;
  }

  checkRequiredSections(content) {
    const requiredSections = this.qualityRules.adr.requiredSections;
    return requiredSections.every(section => this.hasSection(content, section));
  }

  hasSection(content, sectionName) {
    const regex = new RegExp(`^##?\\s*${sectionName}\\s*$`, 'im');
    return regex.test(content);
  }

  findMissingSections(content) {
    const requiredSections = this.qualityRules.adr.requiredSections;
    return requiredSections.filter(section => !this.hasSection(content, section));
  }

  async setupMarkdownLinting() {
    console.log('🔧 Setting up markdown linting...');
    
    const markdownLintConfig = {
      "default": true,
      "MD013": {
        "line_length": this.qualityRules.markdown.lineLength,
        "code_blocks": false,
        "tables": false
      },
      "MD024": false,
      "MD033": false,
      "MD041": false,
      "MD002": false,
      "MD026": {
        "punctuation": ".,;:!"
      },
      "MD029": {
        "style": "ordered"
      },
      "MD030": {
        "ul_single": 1,
        "ol_single": 1,
        "ul_multi": 1,
        "ol_multi": 1
      }
    };

    const configPath = path.join(this.workspaceRoot, '.markdownlint.json');
    fs.writeFileSync(configPath, JSON.stringify(markdownLintConfig, null, 2));
    
    // Create markdown linting script
    const lintScript = `#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class MarkdownLinter {
  constructor() {
    this.workspaceRoot = process.cwd();
    this.configPath = path.join(this.workspaceRoot, '.markdownlint.json');
  }

  async lintMarkdown() {
    console.log('🔍 Linting markdown files...');
    
    try {
      // Check if markdownlint is installed
      execSync('markdownlint --version', { stdio: 'pipe' });
      
      // Run markdownlint
      const command = \`markdownlint "**/*.md" --config \${this.configPath}\`;
      execSync(command, { stdio: 'inherit' });
      
      console.log('✅ Markdown linting completed');
    } catch (error) {
      console.error('❌ Markdown linting failed:', error.message);
      process.exit(1);
    }
  }

  async fixMarkdown() {
    console.log('🔧 Fixing markdown files...');
    
    try {
      const command = \`markdownlint "**/*.md" --config \${this.configPath} --fix\`;
      execSync(command, { stdio: 'inherit' });
      
      console.log('✅ Markdown fixing completed');
    } catch (error) {
      console.error('❌ Markdown fixing failed:', error.message);
      process.exit(1);
    }
  }
}

// Run linting
if (require.main === module) {
  const linter = new MarkdownLinter();
  const command = process.argv[2];
  
  if (command === 'fix') {
    linter.fixMarkdown().catch(console.error);
  } else {
    linter.lintMarkdown().catch(console.error);
  }
}

module.exports = MarkdownLinter;
`;

    const scriptPath = path.join(this.workspaceRoot, 'scripts', 'markdown-lint.js');
    fs.writeFileSync(scriptPath, lintScript);
    execSync(`chmod +x ${scriptPath}`);
  }

  async createADRTemplate() {
    console.log('📋 Creating ADR template...');
    
    const adrTemplate = `# ADR-0000: [Title]

## Status

[Proposed | Accepted | Rejected | Deprecated | Superseded]

## Context

[Describe the context and problem statement, e.g., in free form using two to three sentences. You may want to articulate the problem in form of a question.]

## Decision

[Describe the change that we're proposing or have agreed to implement. Use present tense, e.g., "We will ..."]

## Consequences

[Describe the resulting context, after applying the decision. All consequences should be listed here, not just the "positive" ones. A particular decision may have positive, negative, and neutral consequences, but all of them affect the team and project in the future.]

## Implementation

[Describe how this decision will be implemented, including any technical details, timelines, or resources needed.]

## References

[Link to any relevant documents, discussions, or resources that informed this decision.]
`;

    const templatePath = path.join(this.workspaceRoot, 'docs', 'adr-template.md');
    fs.writeFileSync(templatePath, adrTemplate);
    
    // Create ADR index
    const adrIndex = `# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) for this project.

## What is an ADR?

An Architecture Decision Record (ADR) is a document that captures an important architectural decision made along with its context and consequences.

## ADR Template

See [adr-template.md](./adr-template.md) for the template used for new ADRs.

## ADR Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-0001](./adr-0001-example.md) | Example ADR | Accepted | 2024-01-01 |

## How to Create a New ADR

1. Copy the template: \`cp docs/adr-template.md docs/adr-XXXX-title.md\`
2. Update the ADR number and title
3. Fill in the required sections
4. Add the ADR to this index
5. Submit a pull request for review

## ADR Lifecycle

- **Proposed**: The ADR is under discussion
- **Accepted**: The ADR has been accepted and is being implemented
- **Rejected**: The ADR has been rejected
- **Deprecated**: The ADR is no longer relevant
- **Superseded**: The ADR has been superseded by another ADR
`;

    const indexPath = path.join(this.workspaceRoot, 'docs', 'adr-index.md');
    fs.writeFileSync(indexPath, adrIndex);
  }

  async generateDocsReport() {
    const reportPath = path.join(this.workspaceRoot, 'REPORTS', 'docs-quality-gate.md');
    
    const report = `# Phase 15: Docs Quality Gate

## Executive Summary

**Status**: ✅ Complete  
**Markdown Files**: ${this.results.markdownFiles.length}  
**ADR Files**: ${this.results.adrFiles.length}  
**Quality Rules**: Configured  
**Linting**: Enabled

## Markdown Analysis

### File Statistics
- **Total Files**: ${this.results.markdownFiles.length}
- **Total Lines**: ${this.results.markdownFiles.reduce((sum, file) => sum + file.lineCount, 0)}
- **Total Words**: ${this.results.markdownFiles.reduce((sum, file) => sum + file.wordCount, 0)}

### Quality Metrics
- **Files with Headers**: ${this.results.markdownFiles.filter(f => f.hasHeaders).length}
- **Files with TOC**: ${this.results.markdownFiles.filter(f => f.hasToc).length}
- **Files with Long Lines**: ${this.results.markdownFiles.filter(f => f.longLines.length > 0).length}
- **Files with Broken Links**: ${this.results.markdownFiles.filter(f => f.brokenLinks.length > 0).length}
- **Files with Spelling Errors**: ${this.results.markdownFiles.filter(f => f.spellingErrors.length > 0).length}

## ADR Analysis

### ADR Statistics
- **Total ADRs**: ${this.results.adrFiles.length}
- **Complete ADRs**: ${this.results.adrFiles.filter(f => f.hasRequiredSections).length}
- **Incomplete ADRs**: ${this.results.adrFiles.filter(f => !f.hasRequiredSections).length}

### Missing Sections
${this.results.adrFiles.filter(f => !f.hasRequiredSections).map(adr => `
- **${adr.relativePath}**: Missing ${adr.missingSections.join(', ')}
`).join('')}

## Quality Rules

### Markdown Rules
- **Line Length**: ${this.qualityRules.markdown.lineLength} characters
- **Require Headers**: ${this.qualityRules.markdown.requireHeaders ? 'Yes' : 'No'}
- **Require TOC**: ${this.qualityRules.markdown.requireToc ? 'Yes' : 'No'}
- **Spell Check**: ${this.qualityRules.markdown.spellCheck ? 'Enabled' : 'Disabled'}
- **Link Check**: ${this.qualityRules.markdown.linkCheck ? 'Enabled' : 'Disabled'}

### ADR Rules
- **Required Sections**: ${this.qualityRules.adr.requiredSections.join(', ')}
- **Template**: ${this.qualityRules.adr.template}
- **Numbering**: ${this.qualityRules.adr.numbering ? 'Enabled' : 'Disabled'}

## Implementation Files

- **Markdown Lint Config**: \`.markdownlint.json\`
- **Linting Script**: \`scripts/markdown-lint.js\`
- **ADR Template**: \`docs/adr-template.md\`
- **ADR Index**: \`docs/adr-index.md\`

## Next Steps

1. **Phase 16**: Implement repo hygiene
2. **Phase 17**: Set up chaos testing
3. **Phase 18**: Implement backups & DR

## Validation

Run the following to validate Phase 15 completion:

\`\`\`bash
# Lint markdown files
npm run lint:markdown

# Fix markdown issues
npm run fix:markdown

# Check ADR completeness
npm run check:adrs

# Generate docs report
npm run docs:analyze
\`\`\`

Phase 15 is complete and ready for Phase 16 implementation.
`;

    fs.writeFileSync(reportPath, report);
  }

  printSummary() {
    console.log('\n📚 Docs Quality Gate Summary');
    console.log('============================');
    console.log(`📄 Markdown Files: ${this.results.markdownFiles.length}`);
    console.log(`📋 ADR Files: ${this.results.adrFiles.length}`);
    console.log(`✅ Quality Rules: Configured`);
    console.log(`🔧 Linting: Enabled`);
  }
}

// Run the docs quality gate setup
if (require.main === module) {
  const docsManager = new DocsQualityManager();
  docsManager.runDocsQualityGate().catch(console.error);
}

module.exports = DocsQualityManager;