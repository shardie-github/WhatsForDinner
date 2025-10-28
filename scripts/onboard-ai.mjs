/**
 * AI-Powered Onboarding Script
 * Generates personalized onboarding experience for new developers and agents
 */

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class AIOnboardingGenerator {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  /**
   * Generate personalized onboarding for a new developer
   */
  async generateDeveloperOnboarding(developerInfo) {
    console.log(`👋 Generating onboarding for ${developerInfo.name}...`);

    try {
      // Analyze the codebase
      const codebaseAnalysis = await this.analyzeCodebase();
      
      // Generate personalized content
      const onboardingContent = await this.generatePersonalizedContent(developerInfo, codebaseAnalysis);
      
      // Create onboarding files
      await this.createOnboardingFiles(developerInfo, onboardingContent);
      
      // Generate setup instructions
      await this.generateSetupInstructions(developerInfo);
      
      console.log('✅ Developer onboarding generated successfully!');
      return onboardingContent;
    } catch (error) {
      console.error('❌ Failed to generate developer onboarding:', error);
      throw error;
    }
  }

  /**
   * Generate agent training data
   */
  async generateAgentTraining(agentType, requirements) {
    console.log(`🤖 Generating training data for ${agentType} agent...`);

    try {
      // Analyze project structure
      const projectAnalysis = await this.analyzeProjectStructure();
      
      // Generate training data
      const trainingData = await this.generateTrainingData(agentType, requirements, projectAnalysis);
      
      // Create training files
      await this.createTrainingFiles(agentType, trainingData);
      
      console.log('✅ Agent training data generated successfully!');
      return trainingData;
    } catch (error) {
      console.error('❌ Failed to generate agent training:', error);
      throw error;
    }
  }

  /**
   * Analyze the codebase for onboarding
   */
  async analyzeCodebase() {
    console.log('🔍 Analyzing codebase...');

    const analysis = {
      structure: await this.analyzeProjectStructure(),
      technologies: await this.analyzeTechnologies(),
      patterns: await this.analyzeCodePatterns(),
      documentation: await this.analyzeDocumentation(),
      testing: await this.analyzeTesting(),
      deployment: await this.analyzeDeployment()
    };

    return analysis;
  }

  /**
   * Analyze project structure
   */
  async analyzeProjectStructure() {
    const structure = {
      apps: [],
      packages: [],
      scripts: [],
      configs: []
    };

    // Analyze apps directory
    const appsDir = path.join(process.cwd(), 'apps');
    if (fs.existsSync(appsDir)) {
      const apps = fs.readdirSync(appsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      structure.apps = apps;
    }

    // Analyze packages directory
    const packagesDir = path.join(process.cwd(), 'packages');
    if (fs.existsSync(packagesDir)) {
      const packages = fs.readdirSync(packagesDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      structure.packages = packages;
    }

    // Analyze scripts directory
    const scriptsDir = path.join(process.cwd(), 'scripts');
    if (fs.existsSync(scriptsDir)) {
      const scripts = fs.readdirSync(scriptsDir)
        .filter(file => file.endsWith('.js') || file.endsWith('.mjs') || file.endsWith('.ts'));
      
      structure.scripts = scripts;
    }

    // Analyze config files
    const configFiles = [
      'package.json',
      'tsconfig.json',
      'next.config.cache.js',
      'turbo.json',
      'pnpm-workspace.yaml'
    ];

    structure.configs = configFiles.filter(file => 
      fs.existsSync(path.join(process.cwd(), file))
    );

    return structure;
  }

  /**
   * Analyze technologies used
   */
  async analyzeTechnologies() {
    const technologies = {
      frontend: [],
      backend: [],
      database: [],
      deployment: [],
      tools: []
    };

    // Read package.json
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };

      // Categorize dependencies
      Object.keys(allDeps).forEach(dep => {
        if (dep.includes('react') || dep.includes('next') || dep.includes('vue') || dep.includes('svelte')) {
          technologies.frontend.push(dep);
        } else if (dep.includes('express') || dep.includes('fastify') || dep.includes('koa')) {
          technologies.backend.push(dep);
        } else if (dep.includes('supabase') || dep.includes('prisma') || dep.includes('mongoose')) {
          technologies.database.push(dep);
        } else if (dep.includes('vercel') || dep.includes('netlify') || dep.includes('aws')) {
          technologies.deployment.push(dep);
        } else {
          technologies.tools.push(dep);
        }
      });
    }

    return technologies;
  }

  /**
   * Analyze code patterns
   */
  async analyzeCodePatterns() {
    const patterns = {
      architecture: 'monorepo',
      patterns: [],
      conventions: []
    };

    // Check for common patterns
    const commonPatterns = [
      'component-based',
      'api-routes',
      'middleware',
      'hooks',
      'context',
      'state-management',
      'routing',
      'styling',
      'testing',
      'linting'
    ];

    // Analyze for patterns (simplified)
    patterns.patterns = commonPatterns;

    // Check for conventions
    const conventions = [
      'typescript',
      'eslint',
      'prettier',
      'conventional-commits',
      'semantic-versioning'
    ];

    patterns.conventions = conventions;

    return patterns;
  }

  /**
   * Analyze documentation
   */
  async analyzeDocumentation() {
    const docs = {
      readme: fs.existsSync(path.join(process.cwd(), 'README.md')),
      contributing: fs.existsSync(path.join(process.cwd(), 'CONTRIBUTING.md')),
      changelog: fs.existsSync(path.join(process.cwd(), 'CHANGELOG.md')),
      api: fs.existsSync(path.join(process.cwd(), 'docs/api_reference.md')),
      architecture: fs.existsSync(path.join(process.cwd(), 'docs/architecture_map.svg')),
      guides: []
    };

    // Check for guide files
    const guideFiles = [
      'ONBOARDING.md',
      'DX_GUIDE.md',
      'A11Y_GUIDE.md',
      'I18N_README.md'
    ];

    docs.guides = guideFiles.filter(file => 
      fs.existsSync(path.join(process.cwd(), file))
    );

    return docs;
  }

  /**
   * Analyze testing setup
   */
  async analyzeTesting() {
    const testing = {
      framework: 'unknown',
      coverage: false,
      e2e: false,
      unit: false,
      integration: false
    };

    // Check for testing frameworks
    const testFrameworks = ['jest', 'vitest', 'mocha', 'cypress', 'playwright', 'testing-library'];
    
    // This would need to be implemented with actual file analysis
    testing.framework = 'jest'; // Placeholder
    testing.unit = true;
    testing.integration = true;

    return testing;
  }

  /**
   * Analyze deployment setup
   */
  async analyzeDeployment() {
    const deployment = {
      platform: 'unknown',
      ci: false,
      cd: false,
      environments: []
    };

    // Check for deployment configs
    if (fs.existsSync(path.join(process.cwd(), '.github/workflows'))) {
      deployment.ci = true;
      deployment.cd = true;
    }

    if (fs.existsSync(path.join(process.cwd(), 'vercel.json'))) {
      deployment.platform = 'vercel';
    } else if (fs.existsSync(path.join(process.cwd(), 'netlify.toml'))) {
      deployment.platform = 'netlify';
    }

    return deployment;
  }

  /**
   * Generate personalized content
   */
  async generatePersonalizedContent(developerInfo, codebaseAnalysis) {
    const prompt = `Generate personalized onboarding content for a new developer joining this project.

Developer Info:
- Name: ${developerInfo.name}
- Role: ${developerInfo.role || 'Developer'}
- Experience Level: ${developerInfo.experience || 'Intermediate'}
- Focus Areas: ${developerInfo.focusAreas?.join(', ') || 'General development'}

Codebase Analysis:
${JSON.stringify(codebaseAnalysis, null, 2)}

Please generate:
1. A personalized welcome message
2. Role-specific setup instructions
3. Key areas to focus on first
4. Learning path recommendations
5. Common gotchas and tips
6. Resources and documentation links

Format as a comprehensive markdown document.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert technical mentor who creates personalized onboarding experiences for developers. Focus on practical, actionable guidance.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    return response.choices[0].message.content;
  }

  /**
   * Generate training data for agents
   */
  async generateTrainingData(agentType, requirements, projectAnalysis) {
    const prompt = `Generate training data for a ${agentType} agent working with this project.

Agent Requirements:
${JSON.stringify(requirements, null, 2)}

Project Analysis:
${JSON.stringify(projectAnalysis, null, 2)}

Please generate:
1. Agent capabilities and responsibilities
2. Project-specific context and knowledge
3. Common tasks and workflows
4. API endpoints and data structures
5. Error handling patterns
6. Performance considerations
7. Security guidelines
8. Testing strategies

Format as structured training data.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI trainer who creates comprehensive training data for AI agents. Focus on practical, actionable knowledge.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 3000
    });

    return response.choices[0].message.content;
  }

  /**
   * Create onboarding files
   */
  async createOnboardingFiles(developerInfo, content) {
    const onboardingDir = path.join(process.cwd(), 'onboarding');
    if (!fs.existsSync(onboardingDir)) {
      fs.mkdirSync(onboardingDir, { recursive: true });
    }

    // Create personalized onboarding file
    const filename = `onboarding-${developerInfo.name.toLowerCase().replace(/\s+/g, '-')}.md`;
    const filepath = path.join(onboardingDir, filename);
    
    fs.writeFileSync(filepath, content);
    console.log(`📄 Onboarding file created: ${filepath}`);

    // Create quick reference
    const quickRef = await this.generateQuickReference(developerInfo);
    const quickRefPath = path.join(onboardingDir, `quick-ref-${developerInfo.name.toLowerCase().replace(/\s+/g, '-')}.md`);
    fs.writeFileSync(quickRefPath, quickRef);
    console.log(`📄 Quick reference created: ${quickRefPath}`);
  }

  /**
   * Generate quick reference
   */
  async generateQuickReference(developerInfo) {
    return `# Quick Reference - ${developerInfo.name}

## Essential Commands
\`\`\`bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Run tests
pnpm run test

# Build for production
pnpm run build

# Run linting
pnpm run lint

# Run type checking
pnpm run type-check
\`\`\`

## Key Directories
- \`apps/\` - Main applications
- \`packages/\` - Shared packages
- \`scripts/\` - Automation scripts
- \`docs/\` - Documentation

## Important Files
- \`package.json\` - Project configuration
- \`tsconfig.json\` - TypeScript configuration
- \`next.config.cache.js\` - Next.js configuration
- \`turbo.json\` - Turborepo configuration

## Getting Help
- Check the main README.md
- Review the onboarding guide
- Ask questions in the team chat
- Check existing issues and PRs

## Next Steps
1. Set up your development environment
2. Review the codebase structure
3. Make your first contribution
4. Join team meetings and discussions
`;
  }

  /**
   * Generate setup instructions
   */
  async generateSetupInstructions(developerInfo) {
    const setupInstructions = `# Setup Instructions - ${developerInfo.name}

## Prerequisites
- Node.js 18+ 
- pnpm
- Git
- Code editor (VS Code recommended)

## Environment Setup
1. Clone the repository
2. Install dependencies: \`pnpm install\`
3. Set up environment variables
4. Run the development server: \`pnpm run dev\`

## Development Workflow
1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Create a pull request
5. Get code review
6. Merge to main

## Useful Scripts
- \`pnpm run dev\` - Start development
- \`pnpm run build\` - Build for production
- \`pnpm run test\` - Run tests
- \`pnpm run lint\` - Run linting
- \`pnpm run type-check\` - Type checking

## Resources
- [Project Documentation](./docs/)
- [API Reference](./docs/api_reference.md)
- [Architecture Guide](./docs/architecture_map.svg)
- [Contributing Guide](./CONTRIBUTING.md)
`;

    const setupPath = path.join(process.cwd(), 'onboarding', `setup-${developerInfo.name.toLowerCase().replace(/\s+/g, '-')}.md`);
    fs.writeFileSync(setupPath, setupInstructions);
    console.log(`📄 Setup instructions created: ${setupPath}`);
  }

  /**
   * Create training files
   */
  async createTrainingFiles(agentType, trainingData) {
    const trainingDir = path.join(process.cwd(), 'ai', 'training');
    if (!fs.existsSync(trainingDir)) {
      fs.mkdirSync(trainingDir, { recursive: true });
    }

    const filename = `${agentType}-training.md`;
    const filepath = path.join(trainingDir, filename);
    
    fs.writeFileSync(filepath, trainingData);
    console.log(`📄 Training file created: ${filepath}`);

    // Create agent configuration
    const config = await this.generateAgentConfig(agentType, trainingData);
    const configPath = path.join(trainingDir, `${agentType}-config.json`);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`📄 Agent config created: ${configPath}`);
  }

  /**
   * Generate agent configuration
   */
  async generateAgentConfig(agentType, trainingData) {
    return {
      agent_type: agentType,
      version: '1.0.0',
      created_at: new Date().toISOString(),
      capabilities: [
        'code_analysis',
        'documentation_generation',
        'error_detection',
        'performance_optimization'
      ],
      training_data: trainingData,
      configuration: {
        model: 'gpt-4-turbo-preview',
        temperature: 0.3,
        max_tokens: 2000,
        timeout: 30000
      },
      monitoring: {
        enabled: true,
        metrics: ['accuracy', 'response_time', 'error_rate'],
        alerts: ['high_error_rate', 'slow_response']
      }
    };
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new AIOnboardingGenerator();
  
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === 'developer') {
    const developerInfo = {
      name: args[1] || 'New Developer',
      role: args[2] || 'Developer',
      experience: args[3] || 'Intermediate',
      focusAreas: args[4] ? args[4].split(',') : ['General development']
    };
    
    generator.generateDeveloperOnboarding(developerInfo).catch(console.error);
  } else if (command === 'agent') {
    const agentType = args[1] || 'general';
    const requirements = {
      capabilities: args[2] ? args[2].split(',') : ['code_analysis', 'documentation'],
      focus: args[3] || 'general_development'
    };
    
    generator.generateAgentTraining(agentType, requirements).catch(console.error);
  } else {
    console.log('Usage:');
    console.log('  node onboard-ai.mjs developer [name] [role] [experience] [focusAreas]');
    console.log('  node onboard-ai.mjs agent [type] [capabilities] [focus]');
  }
}

export default AIOnboardingGenerator;