#!/usr/bin/env node
/**
 * Generate API Documentation
 * Creates OpenAPI spec and API documentation
 */

import { writeFileSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const apiRoutesDir = 'apps/web/src/app/api';
const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: "What's for Dinner API",
    version: '1.0.0',
    description: 'API for What\'s for Dinner meal planning application',
  },
  servers: [
    { url: 'http://localhost:3000/api', description: 'Development' },
    { url: 'https://whatsfordinner.app/api', description: 'Production' },
  ],
  paths: {},
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};

// Scan API routes
function scanRoutes(dir, basePath = '') {
  const entries = readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (entry.name.startsWith('_') || entry.name.startsWith('[')) {
        // Skip private directories and dynamic routes for now
        continue;
      }
      scanRoutes(fullPath, `${basePath}/${entry.name}`);
    } else if (entry.name === 'route.ts') {
      const routePath = basePath || '/';
      const content = readFileSync(fullPath, 'utf-8');
      
      // Extract HTTP methods
      const methods = [];
      if (content.includes('export async function GET')) methods.push('get');
      if (content.includes('export async function POST')) methods.push('post');
      if (content.includes('export async function PUT')) methods.push('put');
      if (content.includes('export async function DELETE')) methods.push('delete');
      if (content.includes('export async function PATCH')) methods.push('patch');
      
      // Extract description from comments
      const commentMatch = content.match(/\/\*\*([^*]*(?:\*(?!\/)[^*]*)*)\*\//s);
      const description = commentMatch ? commentMatch[1].trim() : `API endpoint at ${routePath}`;
      
      if (!openApiSpec.paths[routePath]) {
        openApiSpec.paths[routePath] = {};
      }
      
      for (const method of methods) {
        openApiSpec.paths[routePath][method] = {
          summary: description.split('\n')[0],
          description,
          responses: {
            '200': { description: 'Success' },
            '400': { description: 'Bad Request' },
            '401': { description: 'Unauthorized' },
            '500': { description: 'Internal Server Error' },
          },
        };
        
        // Add auth if route checks for user
        if (content.includes('getUser') || content.includes('auth.getUser')) {
          openApiSpec.paths[routePath][method].security = [{ bearerAuth: [] }];
        }
      }
    }
  }
}

scanRoutes(apiRoutesDir);

// Write OpenAPI spec (as JSON for now, can convert to YAML later)
writeFileSync('openapi.json', JSON.stringify(openApiSpec, null, 2));
console.log('✅ Generated openapi.yaml');

// Generate API documentation markdown
let markdown = '# API Documentation\n\n';
markdown += 'Generated API documentation for What\'s for Dinner.\n\n';
markdown += '## Endpoints\n\n';

for (const [path, methods] of Object.entries(openApiSpec.paths)) {
  markdown += `### ${path}\n\n`;
  for (const [method, spec] of Object.entries(methods)) {
    markdown += `#### ${method.toUpperCase()}\n\n`;
    markdown += `${spec.description}\n\n`;
    if (spec.security) {
      markdown += '**Authentication**: Required\n\n';
    }
    markdown += '**Responses**:\n';
    for (const [code, response] of Object.entries(spec.responses)) {
      markdown += `- ${code}: ${response.description}\n`;
    }
    markdown += '\n';
  }
}

writeFileSync('docs/API.md', markdown);
console.log('✅ Generated docs/API.md');
