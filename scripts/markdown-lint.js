#!/usr/bin/env node

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
      const command = `markdownlint "**/*.md" --config ${this.configPath}`;
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
      const command = `markdownlint "**/*.md" --config ${this.configPath} --fix`;
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
