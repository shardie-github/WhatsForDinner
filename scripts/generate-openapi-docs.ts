#!/usr/bin/env tsx
/**
 * OpenAPI/Swagger Documentation Generator
 * 
 * Scans all API routes and generates OpenAPI 3.0 specification
 * Supports Next.js App Router API routes
 */

import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { join, relative } from 'path';

interface RouteInfo {
  path: string;
  methods: string[];
  filePath: string;
  description?: string;
}

interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  servers: Array<{ url: string; description: string }>;
  paths: Record<string, Record<string, any>>;
  components: {
    schemas: Record<string, any>;
    securitySchemes: Record<string, any>;
  };
}

const API_BASE = '/api';
const API_DIR = join(process.cwd(), 'apps/web/src/app/api');
const OUTPUT_FILE = join(process.cwd(), 'docs/openapi.json');

/**
 * Recursively scan API routes
 */
function scanRoutes(dir: string, basePath: string = ''): RouteInfo[] {
  const routes: RouteInfo[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    const relativePath = join(basePath, entry.name);

    if (entry.isDirectory()) {
      // Skip node_modules and other non-route directories
      if (entry.name.startsWith('.') || entry.name === 'node_modules') {
        continue;
      }
      routes.push(...scanRoutes(fullPath, relativePath));
    } else if (entry.name === 'route.ts' || entry.name === 'route.js') {
      // Next.js App Router route handler
      const routePath = relativePath
        .replace(/\/route\.(ts|js)$/, '')
        .replace(/\[([^\]]+)\]/g, '{$1}') // Convert [param] to {param}
        .replace(/\([^)]+\)\//g, ''); // Remove route groups

      const methods = extractMethods(fullPath);
      routes.push({
        path: `/${routePath}`,
        methods,
        filePath: fullPath,
        description: extractDescription(fullPath),
      });
    }
  }

  return routes;
}

/**
 * Extract HTTP methods from route file
 */
function extractMethods(filePath: string): string[] {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const methods: string[] = [];

    // Check for exported functions (Next.js App Router)
    if (content.includes('export const GET')) methods.push('GET');
    if (content.includes('export const POST')) methods.push('POST');
    if (content.includes('export const PUT')) methods.push('PUT');
    if (content.includes('export const DELETE')) methods.push('DELETE');
    if (content.includes('export const PATCH')) methods.push('PATCH');
    if (content.includes('export const OPTIONS')) methods.push('OPTIONS');
    if (content.includes('export const HEAD')) methods.push('HEAD');

    // If no methods found, default to GET
    return methods.length > 0 ? methods : ['GET'];
  } catch {
    return ['GET'];
  }
}

/**
 * Extract description from JSDoc comments
 */
function extractDescription(filePath: string): string | undefined {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const match = content.match(/\/\*\*[\s\S]*?\*\s*([^\n]+)/);
    return match ? match[1].trim() : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Generate OpenAPI spec from routes
 */
function generateOpenAPISpec(routes: RouteInfo[]): OpenAPISpec {
  const paths: Record<string, Record<string, any>> = {};

  for (const route of routes) {
    const openAPIPath = `${API_BASE}${route.path}`;

    if (!paths[openAPIPath]) {
      paths[openAPIPath] = {};
    }

    for (const method of route.methods) {
      const methodLower = method.toLowerCase();
      paths[openAPIPath][methodLower] = {
        summary: route.description || `${method} ${route.path}`,
        description: route.description || `Endpoint at ${route.path}`,
        operationId: `${methodLower}_${route.path.replace(/\//g, '_').replace(/[{}]/g, '')}`,
        tags: [route.path.split('/')[1] || 'root'],
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
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' },
                  },
                },
              },
            },
          },
          '500': {
            description: 'Internal Server Error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      };

      // Add security if path suggests auth requirement
      if (route.path.includes('/admin') || route.path.includes('/premium')) {
        paths[openAPIPath][methodLower].security = [{ bearerAuth: [] }];
      }

      // Add request body for POST/PUT/PATCH
      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        paths[openAPIPath][methodLower].requestBody = {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' },
            },
          },
        };
      }
    }
  }

  return {
    openapi: '3.0.3',
    info: {
      title: "What's for Dinner API",
      version: '1.0.0',
      description: 'API documentation for What\'s for Dinner meal planning application',
    },
    servers: [
      {
        url: 'https://whats-for-dinner.vercel.app',
        description: 'Production',
      },
      {
        url: 'http://localhost:3000',
        description: 'Local Development',
      },
    ],
    paths,
    components: {
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            code: { type: 'string' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            plan: { type: 'string', enum: ['free', 'premium', 'partner'] },
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
}

/**
 * Main execution
 */
function main() {
  console.log('📚 Generating OpenAPI documentation...');
  console.log(`📂 Scanning ${API_DIR}...`);

  if (!statSync(API_DIR).isDirectory()) {
    console.error(`❌ API directory not found: ${API_DIR}`);
    process.exit(1);
  }

  const routes = scanRoutes(API_DIR);
  console.log(`✅ Found ${routes.length} API routes`);

  const spec = generateOpenAPISpec(routes);
  
  // Ensure docs directory exists
  const docsDir = join(process.cwd(), 'docs');
  if (!statSync(docsDir).isDirectory()) {
    require('fs').mkdirSync(docsDir, { recursive: true });
  }

  writeFileSync(OUTPUT_FILE, JSON.stringify(spec, null, 2));
  console.log(`✅ OpenAPI spec written to ${OUTPUT_FILE}`);

  // Also generate YAML version if yaml package is available
  try {
    const yaml = require('yaml');
    const yamlFile = OUTPUT_FILE.replace('.json', '.yaml');
    writeFileSync(yamlFile, yaml.stringify(spec));
    console.log(`✅ OpenAPI YAML written to ${yamlFile}`);
  } catch {
    // YAML generation is optional
  }

  console.log('\n📊 Summary:');
  console.log(`   - Total routes: ${routes.length}`);
  console.log(`   - Total paths: ${Object.keys(spec.paths).length}`);
  console.log(`   - Documentation: ${OUTPUT_FILE}`);
}

if (require.main === module) {
  main();
}

export { generateOpenAPISpec, scanRoutes };
