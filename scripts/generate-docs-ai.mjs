/**
 * AI-Powered Documentation Generator
 * Automatically generates API reference and architecture documentation
 */

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

class AIDocumentationGenerator {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  /**
   * Generate comprehensive documentation
   */
  async generateDocumentation() {
    console.log('📚 Generating AI-powered documentation...');

    try {
      // Generate API reference
      await this.generateAPIReference();
      
      // Generate architecture map
      await this.generateArchitectureMap();
      
      // Generate component documentation
      await this.generateComponentDocs();
      
      // Generate deployment guide
      await this.generateDeploymentGuide();

      console.log('✅ Documentation generation completed!');
    } catch (error) {
      console.error('❌ Documentation generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate API reference documentation
   */
  async generateAPIReference() {
    console.log('📖 Generating API reference...');

    try {
      // Find API routes
      const apiFiles = await glob('apps/web/app/api/**/*.{ts,js}', { cwd: process.cwd() });
      
      let apiContent = '# API Reference\n\n';
      apiContent += 'This document provides a comprehensive reference for all API endpoints.\n\n';

      for (const file of apiFiles) {
        const filePath = path.join(process.cwd(), file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Extract API information
        const apiInfo = this.extractAPIInfo(file, content);
        apiContent += this.formatAPIEndpoint(apiInfo);
      }

      // Generate with AI enhancement
      const enhancedContent = await this.enhanceWithAI(apiContent, 'api-reference');
      
      // Save to docs directory
      const docsDir = path.join(process.cwd(), 'docs');
      if (!fs.existsSync(docsDir)) {
        fs.mkdirSync(docsDir, { recursive: true });
      }
      
      fs.writeFileSync(path.join(docsDir, 'api_reference.md'), enhancedContent);
      console.log('✅ API reference generated');
    } catch (error) {
      console.error('Failed to generate API reference:', error);
    }
  }

  /**
   * Generate architecture map
   */
  async generateArchitectureMap() {
    console.log('🏗️ Generating architecture map...');

    try {
      // Analyze project structure
      const structure = await this.analyzeProjectStructure();
      
      // Generate Mermaid diagram
      const mermaidContent = this.generateMermaidDiagram(structure);
      
      // Generate architecture documentation
      const archContent = `# Architecture Map

This document provides a visual representation of the system architecture.

## System Overview

\`\`\`mermaid
${mermaidContent}
\`\`\`

## Components

${this.generateComponentDescriptions(structure)}

## Data Flow

${this.generateDataFlowDescription(structure)}

## Technology Stack

${this.generateTechStackDescription(structure)}
`;

      // Enhance with AI
      const enhancedContent = await this.enhanceWithAI(archContent, 'architecture');
      
      // Save to docs directory
      const docsDir = path.join(process.cwd(), 'docs');
      if (!fs.existsSync(docsDir)) {
        fs.mkdirSync(docsDir, { recursive: true });
      }
      
      fs.writeFileSync(path.join(docsDir, 'architecture_map.md'), enhancedContent);
      console.log('✅ Architecture map generated');
    } catch (error) {
      console.error('Failed to generate architecture map:', error);
    }
  }

  /**
   * Generate component documentation
   */
  async generateComponentDocs() {
    console.log('🧩 Generating component documentation...');

    try {
      // Find component files
      const componentFiles = await glob('packages/ui/src/**/*.{ts,tsx}', { cwd: process.cwd() });
      
      let componentContent = '# Component Documentation\n\n';
      componentContent += 'This document provides detailed information about all UI components.\n\n';

      for (const file of componentFiles) {
        const filePath = path.join(process.cwd(), file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Extract component information
        const componentInfo = this.extractComponentInfo(file, content);
        if (componentInfo) {
          componentContent += this.formatComponent(componentInfo);
        }
      }

      // Enhance with AI
      const enhancedContent = await this.enhanceWithAI(componentContent, 'components');
      
      // Save to docs directory
      const docsDir = path.join(process.cwd(), 'docs');
      if (!fs.existsSync(docsDir)) {
        fs.mkdirSync(docsDir, { recursive: true });
      }
      
      fs.writeFileSync(path.join(docsDir, 'component_docs.md'), enhancedContent);
      console.log('✅ Component documentation generated');
    } catch (error) {
      console.error('Failed to generate component documentation:', error);
    }
  }

  /**
   * Generate deployment guide
   */
  async generateDeploymentGuide() {
    console.log('🚀 Generating deployment guide...');

    try {
      const deploymentContent = `# Deployment Guide

This guide provides comprehensive instructions for deploying the Whats-for-Dinner application.

## Prerequisites

- Node.js 18+ 
- pnpm package manager
- Supabase account
- Vercel account (for hosting)
- OpenAI API key (for AI features)

## Environment Setup

### 1. Clone Repository
\`\`\`bash
git clone <repository-url>
cd whats-for-dinner-monorepo
\`\`\`

### 2. Install Dependencies
\`\`\`bash
pnpm install
\`\`\`

### 3. Environment Variables
Create \`.env.local\` files in each app directory:

\`\`\`bash
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_PROJECT_REF=your_project_ref

# AI Services
OPENAI_API_KEY=your_openai_api_key

# GitHub Integration
GITHUB_TOKEN=your_github_token
GITHUB_OWNER=your_org
GITHUB_REPO=your_repo
\`\`\`

## Database Setup

### 1. Run Migrations
\`\`\`bash
cd supabase
supabase db reset
\`\`\`

### 2. Enable Extensions
\`\`\`sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_cron;
\`\`\`

## AI System Setup

### 1. Generate Embeddings
\`\`\`bash
pnpm run ai:embeddings
\`\`\`

### 2. Test AI Features
\`\`\`bash
pnpm run ai:status
\`\`\`

## Deployment

### 1. Build Applications
\`\`\`bash
pnpm run build
\`\`\`

### 2. Deploy to Vercel
\`\`\`bash
vercel deploy --prod
\`\`\`

### 3. Configure CI/CD
The repository includes GitHub Actions workflows for:
- AI audit (weekly)
- Future runtime checks (daily)
- Watcher cron jobs (nightly)

## Monitoring

### 1. Health Checks
\`\`\`bash
pnpm run health:check
\`\`\`

### 2. Performance Monitoring
\`\`\`bash
pnpm run performance:audit
\`\`\`

### 3. AI System Status
\`\`\`bash
pnpm run ai:status
\`\`\`

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check Supabase credentials
   - Verify network connectivity
   - Review database status

2. **AI Service Issues**
   - Check OpenAI API key
   - Verify service status
   - Review rate limits

3. **Build Issues**
   - Check Node.js version
   - Clear node_modules and reinstall
   - Review TypeScript errors

## Security

### 1. Environment Variables
- Never commit sensitive credentials
- Use secure secret management
- Rotate keys regularly

### 2. Database Security
- Enable Row Level Security (RLS)
- Review access policies
- Monitor database logs

### 3. AI Security
- Implement privacy guards
- Monitor AI usage
- Review data retention policies

## Maintenance

### 1. Regular Updates
- Update dependencies monthly
- Review security advisories
- Test compatibility updates

### 2. Performance Optimization
- Monitor performance metrics
- Optimize database queries
- Review caching strategies

### 3. AI System Maintenance
- Review AI model performance
- Update embeddings regularly
- Monitor cost and usage
`;

      // Enhance with AI
      const enhancedContent = await this.enhanceWithAI(deploymentContent, 'deployment');
      
      // Save to docs directory
      const docsDir = path.join(process.cwd(), 'docs');
      if (!fs.existsSync(docsDir)) {
        fs.mkdirSync(docsDir, { recursive: true });
      }
      
      fs.writeFileSync(path.join(docsDir, 'deployment_guide.md'), enhancedContent);
      console.log('✅ Deployment guide generated');
    } catch (error) {
      console.error('Failed to generate deployment guide:', error);
    }
  }

  /**
   * Extract API information from file
   */
  extractAPIInfo(filePath, content) {
    const route = filePath.replace(/.*\/app\/api/, '').replace(/\/route\.(ts|js)$/, '');
    const methods = this.extractHTTPMethods(content);
    
    return {
      route,
      methods,
      file: filePath,
      description: this.extractDescription(content)
    };
  }

  /**
   * Extract HTTP methods from content
   */
  extractHTTPMethods(content) {
    const methods = [];
    const methodPatterns = [
      /export\s+(?:async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)/gi,
      /export\s+const\s+(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)/gi
    ];

    for (const pattern of methodPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const method = match.replace(/export\s+(?:async\s+)?function\s+|export\s+const\s+/g, '').toUpperCase();
          if (!methods.includes(method)) {
            methods.push(method);
          }
        });
      }
    }

    return methods.length > 0 ? methods : ['GET'];
  }

  /**
   * Extract description from content
   */
  extractDescription(content) {
    // Look for JSDoc comments
    const jsdocMatch = content.match(/\/\*\*\s*\n\s*\*\s*(.+?)\s*\n/);
    if (jsdocMatch) {
      return jsdocMatch[1].trim();
    }
    return '';
  }

  /**
   * Format API endpoint documentation
   */
  formatAPIEndpoint(apiInfo) {
    return `## ${apiInfo.methods.join(', ')} ${apiInfo.route}

${apiInfo.description ? `**Description:** ${apiInfo.description}\n` : ''}
**File:** \`${apiInfo.file}\`

\`\`\`typescript
// Example usage
fetch('${apiInfo.route}', {
  method: '${apiInfo.methods[0]}',
  headers: {
    'Content-Type': 'application/json'
  }
});
\`\`\`

---
`;
  }

  /**
   * Analyze project structure
   */
  async analyzeProjectStructure() {
    const structure = {
      apps: [],
      packages: [],
      scripts: [],
      docs: []
    };

    // Analyze apps
    const appDirs = await glob('apps/*', { cwd: process.cwd(), onlyDirectories: true });
    for (const app of appDirs) {
      const appName = path.basename(app);
      structure.apps.push({
        name: appName,
        type: this.detectAppType(app),
        description: this.getAppDescription(app)
      });
    }

    // Analyze packages
    const packageDirs = await glob('packages/*', { cwd: process.cwd(), onlyDirectories: true });
    for (const pkg of packageDirs) {
      const packageName = path.basename(pkg);
      structure.packages.push({
        name: packageName,
        type: this.detectPackageType(pkg),
        description: this.getPackageDescription(pkg)
      });
    }

    return structure;
  }

  /**
   * Detect app type
   */
  detectAppType(appPath) {
    if (appPath.includes('web')) return 'Next.js Web App';
    if (appPath.includes('mobile')) return 'React Native App';
    if (appPath.includes('api')) return 'API Service';
    return 'Application';
  }

  /**
   * Detect package type
   */
  detectPackageType(packagePath) {
    if (packagePath.includes('ui')) return 'UI Components';
    if (packagePath.includes('utils')) return 'Utilities';
    if (packagePath.includes('config')) return 'Configuration';
    if (packagePath.includes('theme')) return 'Theme System';
    return 'Package';
  }

  /**
   * Get app description
   */
  getAppDescription(appPath) {
    try {
      const packageJsonPath = path.join(process.cwd(), appPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        return packageJson.description || '';
      }
    } catch (error) {
      // Ignore errors
    }
    return '';
  }

  /**
   * Get package description
   */
  getPackageDescription(packagePath) {
    try {
      const packageJsonPath = path.join(process.cwd(), packagePath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        return packageJson.description || '';
      }
    } catch (error) {
      // Ignore errors
    }
    return '';
  }

  /**
   * Generate Mermaid diagram
   */
  generateMermaidDiagram(structure) {
    let diagram = 'graph TD\n';
    
    // Add apps
    structure.apps.forEach(app => {
      diagram += `  ${app.name.replace(/[^a-zA-Z0-9]/g, '')}["${app.name}"]\n`;
    });
    
    // Add packages
    structure.packages.forEach(pkg => {
      diagram += `  ${pkg.name.replace(/[^a-zA-Z0-9]/g, '')}["${pkg.name}"]\n`;
    });
    
    // Add connections
    structure.apps.forEach(app => {
      structure.packages.forEach(pkg => {
        diagram += `  ${app.name.replace(/[^a-zA-Z0-9]/g, '')} --> ${pkg.name.replace(/[^a-zA-Z0-9]/g, '')}\n`;
      });
    });
    
    return diagram;
  }

  /**
   * Generate component descriptions
   */
  generateComponentDescriptions(structure) {
    let descriptions = '';
    
    structure.packages.forEach(pkg => {
      descriptions += `### ${pkg.name}\n`;
      descriptions += `${pkg.description || 'No description available'}\n\n`;
    });
    
    return descriptions;
  }

  /**
   * Generate data flow description
   */
  generateDataFlowDescription(structure) {
    return `The application follows a typical monorepo architecture with the following data flow:

1. **Web App** (Next.js) serves the main user interface
2. **Mobile App** (React Native) provides mobile experience
3. **API Services** handle backend logic and data processing
4. **UI Packages** provide shared components across applications
5. **Utility Packages** offer common functionality
6. **Configuration Packages** manage shared settings

Data flows from the UI components through the utility packages to the API services, which interact with the database and external services.`;
  }

  /**
   * Generate tech stack description
   */
  generateTechStackDescription(structure) {
    return `## Frontend
- **Next.js 16** - React framework for web applications
- **React Native** - Mobile application framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework

## Backend
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Primary database
- **Edge Functions** - Serverless functions

## AI & Automation
- **OpenAI GPT-4** - AI analysis and insights
- **Vector Embeddings** - Semantic search
- **Automated Monitoring** - Health and performance tracking

## Development
- **pnpm** - Package manager
- **Turbo** - Monorepo build system
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework`;
  }

  /**
   * Extract component information
   */
  extractComponentInfo(filePath, content) {
    // Look for React components
    const componentMatch = content.match(/export\s+(?:default\s+)?(?:function|const)\s+(\w+)/);
    if (!componentMatch) return null;

    const componentName = componentMatch[1];
    const props = this.extractProps(content);
    const description = this.extractDescription(content);

    return {
      name: componentName,
      file: filePath,
      props,
      description
    };
  }

  /**
   * Extract component props
   */
  extractProps(content) {
    const props = [];
    const propPatterns = [
      /interface\s+(\w+Props)\s*\{([^}]+)\}/g,
      /type\s+(\w+Props)\s*=\s*\{([^}]+)\}/g
    ];

    for (const pattern of propPatterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const interfaceName = match[1];
        const interfaceContent = match[2];
        
        // Extract individual properties
        const propMatches = interfaceContent.matchAll(/(\w+)(\?)?\s*:\s*([^;,\n]+)/g);
        for (const propMatch of propMatches) {
          props.push({
            name: propMatch[1],
            optional: !!propMatch[2],
            type: propMatch[3].trim()
          });
        }
      }
    }

    return props;
  }

  /**
   * Format component documentation
   */
  formatComponent(componentInfo) {
    let content = `## ${componentInfo.name}\n\n`;
    
    if (componentInfo.description) {
      content += `${componentInfo.description}\n\n`;
    }
    
    content += `**File:** \`${componentInfo.file}\`\n\n`;
    
    if (componentInfo.props.length > 0) {
      content += `### Props\n\n`;
      content += `| Name | Type | Required | Description |\n`;
      content += `|------|------|----------|-------------|\n`;
      
      componentInfo.props.forEach(prop => {
        content += `| ${prop.name} | \`${prop.type}\` | ${prop.optional ? 'No' : 'Yes'} | - |\n`;
      });
      
      content += `\n`;
    }
    
    content += `### Usage\n\n`;
    content += `\`\`\`tsx\n`;
    content += `<${componentInfo.name} />\n`;
    content += `\`\`\`\n\n`;
    content += `---\n\n`;
    
    return content;
  }

  /**
   * Enhance content with AI
   */
  async enhanceWithAI(content, type) {
    try {
      const prompt = `Please enhance the following ${type} documentation to make it more comprehensive, clear, and professional. Add examples, improve formatting, and ensure it follows best practices for technical documentation:

${content}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert technical writer specializing in software documentation. Enhance the provided documentation to be clear, comprehensive, and professional.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4000
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.warn('AI enhancement failed, using original content:', error.message);
      return content;
    }
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new AIDocumentationGenerator();
  generator.generateDocumentation().catch(console.error);
}

export default AIDocumentationGenerator;