#!/usr/bin/env tsx
/**
 * Complete OpenAPI Spec Generator
 * 
 * Generates a complete OpenAPI 3.0 specification from API routes
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { glob } from 'glob';

interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  servers: Array<{ url: string; description: string }>;
  paths: Record<string, any>;
  components: {
    schemas: Record<string, any>;
    securitySchemes: Record<string, any>;
  };
}

const API_ROUTES_DIR = join(process.cwd(), 'apps/web/src/app/api');

function extractRouteInfo(filePath: string): {
  path: string;
  methods: string[];
  summary?: string;
  description?: string;
} {
  const content = readFileSync(filePath, 'utf-8');
  
  // Extract path from file structure
  const relativePath = filePath.replace(API_ROUTES_DIR, '').replace(/\\/g, '/');
  const pathParts = relativePath
    .split('/')
    .filter(Boolean)
    .map((part) => {
      // Convert [param] to {param}
      if (part.startsWith('[') && part.endsWith(']')) {
        return `{${part.slice(1, -1)}}`;
      }
      return part;
    });
  
  // Remove route.ts or route.tsx
  if (pathParts[pathParts.length - 1] === 'route.ts' || pathParts[pathParts.length - 1] === 'route.tsx') {
    pathParts.pop();
  }
  
  const path = '/api/' + pathParts.join('/');
  
  // Extract HTTP methods
  const methods: string[] = [];
  if (content.includes('export async function GET') || content.includes('export const GET')) {
    methods.push('GET');
  }
  if (content.includes('export async function POST') || content.includes('export const POST')) {
    methods.push('POST');
  }
  if (content.includes('export async function PUT') || content.includes('export const PUT')) {
    methods.push('PUT');
  }
  if (content.includes('export async function DELETE') || content.includes('export const DELETE')) {
    methods.push('DELETE');
  }
  if (content.includes('export async function PATCH') || content.includes('export const PATCH')) {
    methods.push('PATCH');
  }
  
  // Extract summary/description from comments
  const summaryMatch = content.match(/\/\*\*\s*\*\s*(.+?)\s*\*\//s);
  const summary = summaryMatch ? summaryMatch[1].trim() : undefined;
  
  return {
    path,
    methods,
    summary,
    description: summary,
  };
}

function generateOpenAPISpec(): OpenAPISpec {
  const spec: OpenAPISpec = {
    openapi: '3.0.0',
    info: {
      title: "What's For Dinner API",
      version: '1.0.0',
      description: 'API for What\'s For Dinner meal planning application',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development',
      },
      {
        url: 'https://whatsfordinner.app/api',
        description: 'Production',
      },
    ],
    paths: {},
    components: {
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            details: { type: 'array', items: { type: 'object' } },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100 },
            total: { type: 'integer' },
            totalPages: { type: 'integer' },
            hasNext: { type: 'boolean' },
            hasPrev: { type: 'boolean' },
          },
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  };
  
  // Find all API route files
  const routeFiles = glob.sync('**/route.{ts,tsx}', {
    cwd: API_ROUTES_DIR,
    absolute: true,
  });
  
  // Process each route file
  routeFiles.forEach((filePath) => {
    try {
      const routeInfo = extractRouteInfo(filePath);
      
      if (routeInfo.methods.length === 0) return;
      
      // Initialize path if not exists
      if (!spec.paths[routeInfo.path]) {
        spec.paths[routeInfo.path] = {};
      }
      
      // Add methods
      routeInfo.methods.forEach((method) => {
        spec.paths[routeInfo.path][method.toLowerCase()] = {
          summary: routeInfo.summary || `${method} ${routeInfo.path}`,
          description: routeInfo.description || routeInfo.summary,
          responses: {
            '200': {
              description: 'Success',
              content: {
                'application/json': {
                  schema: { type: 'object' },
                },
              },
            },
            '400': {
              description: 'Bad Request',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
            '500': {
              description: 'Internal Server Error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        };
      });
    } catch (error) {
      console.warn(`Failed to process ${filePath}:`, error);
    }
  });
  
  return spec;
}

function main() {
  console.log('Generating OpenAPI specification...');
  
  const spec = generateOpenAPISpec();
  
  const outputPath = join(process.cwd(), 'openapi.json');
  writeFileSync(outputPath, JSON.stringify(spec, null, 2));
  
  console.log(`✅ OpenAPI spec generated: ${outputPath}`);
  console.log(`   Found ${Object.keys(spec.paths).length} API paths`);
}

main().catch((error) => {
  console.error('Error generating OpenAPI spec:', error);
  process.exit(1);
});
