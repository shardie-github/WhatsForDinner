/**
 * OpenAPI/Swagger Documentation Generator
 * Automatically generates OpenAPI 3.0 documentation from Next.js API routes
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname, relative } from 'path';

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

interface RouteInfo {
  path: string;
  methods: string[];
  handler: string;
  description?: string;
}

export class OpenAPIGenerator {
  private workspaceRoot: string;
  private apiRoutesPath: string;
  private spec: OpenAPISpec;

  constructor(workspaceRoot: string = process.cwd()) {
    this.workspaceRoot = workspaceRoot;
    this.apiRoutesPath = join(workspaceRoot, 'apps', 'web', 'src', 'app', 'api');
    this.spec = this.initializeSpec();
  }

  /**
   * Initialize OpenAPI spec structure
   */
  private initializeSpec(): OpenAPISpec {
    return {
      openapi: '3.0.0',
      info: {
        title: "What's for Dinner API",
        version: '1.0.0',
        description: 'API documentation for What\'s for Dinner meal planning application',
      },
      servers: [
        {
          url: 'https://whats-for-dinner.vercel.app/api',
          description: 'Production',
        },
        {
          url: 'http://localhost:3000/api',
          description: 'Development',
        },
      ],
      paths: {},
      components: {
        schemas: {},
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
          apiKey: {
            type: 'apiKey',
            in: 'header',
            name: 'x-api-key',
          },
        },
      },
    };
  }

  /**
   * Generate OpenAPI documentation
   */
  async generate(): Promise<OpenAPISpec> {
    const routes = this.discoverRoutes(this.apiRoutesPath);
    
    for (const route of routes) {
      const path = this.normalizePath(route.path);
      const routeSpec = await this.analyzeRoute(route);
      
      if (!this.spec.paths[path]) {
        this.spec.paths[path] = {};
      }
      
      for (const method of route.methods) {
        this.spec.paths[path][method.toLowerCase()] = routeSpec;
      }
    }
    
    return this.spec;
  }

  /**
   * Discover all API routes
   */
  private discoverRoutes(dir: string, basePath: string = ''): RouteInfo[] {
    const routes: RouteInfo[] = [];
    
    if (!statSync(dir).isDirectory()) {
      return routes;
    }
    
    const entries = readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relativePath = join(basePath, entry.name);
      
      if (entry.isDirectory()) {
        // Recursively discover routes in subdirectories
        routes.push(...this.discoverRoutes(fullPath, relativePath));
      } else if (entry.name === 'route.ts' || entry.name === 'route.tsx') {
        // Found a route handler
        const methods = this.extractMethods(fullPath);
        const path = relativePath.replace(/\/route\.tsx?$/, '').replace(/\[([^\]]+)\]/g, '{$1}');
        
        routes.push({
          path: path || '/',
          methods,
          handler: fullPath,
        });
      }
    }
    
    return routes;
  }

  /**
   * Extract HTTP methods from route handler
   */
  private extractMethods(filePath: string): string[] {
    const content = readFileSync(filePath, 'utf-8');
    const methods: string[] = [];
    
    // Check for exported functions
    if (content.includes('export async function GET')) methods.push('GET');
    if (content.includes('export async function POST')) methods.push('POST');
    if (content.includes('export async function PUT')) methods.push('PUT');
    if (content.includes('export async function DELETE')) methods.push('DELETE');
    if (content.includes('export async function PATCH')) methods.push('PATCH');
    if (content.includes('export async function OPTIONS')) methods.push('OPTIONS');
    
    // Default to GET if no methods found
    if (methods.length === 0) {
      methods.push('GET');
    }
    
    return methods;
  }

  /**
   * Analyze route handler to extract API documentation
   */
  private async analyzeRoute(route: RouteInfo): Promise<any> {
    const content = readFileSync(route.handler, 'utf-8');
    
    // Extract JSDoc comments
    const jsDocMatch = content.match(/\/\*\*([\s\S]*?)\*\//);
    const description = jsDocMatch ? this.extractDescription(jsDocMatch[1]) : undefined;
    
    // Extract parameters from path
    const pathParams = this.extractPathParams(route.path);
    
    // Extract request body schema (if using Zod)
    const requestSchema = this.extractZodSchema(content, 'request');
    
    // Extract response schema
    const responseSchema = this.extractZodSchema(content, 'response');
    
    // Determine authentication requirements
    const requiresAuth = content.includes('createClient') || content.includes('getUser');
    const requiresApiKey = content.includes('x-api-key');
    
    const operation: any = {
      summary: description?.summary || `${route.methods.join(', ')} ${route.path}`,
      description: description?.full || undefined,
      operationId: `${route.methods[0].toLowerCase()}_${route.path.replace(/\//g, '_').replace(/[{}]/g, '')}`,
      tags: this.extractTags(route.path),
    };
    
    // Add parameters
    if (pathParams.length > 0) {
      operation.parameters = pathParams.map(param => ({
        name: param,
        in: 'path',
        required: true,
        schema: { type: 'string' },
      }));
    }
    
    // Add request body for POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].some(m => route.methods.includes(m))) {
      operation.requestBody = {
        required: true,
        content: {
          'application/json': {
            schema: requestSchema || { type: 'object' },
          },
        },
      };
    }
    
    // Add responses
    operation.responses = {
      '200': {
        description: 'Success',
        content: {
          'application/json': {
            schema: responseSchema || { type: 'object' },
          },
        },
      },
      '400': {
        description: 'Bad Request',
      },
      '401': {
        description: 'Unauthorized',
      },
      '500': {
        description: 'Internal Server Error',
      },
    };
    
    // Add security requirements
    if (requiresAuth || requiresApiKey) {
      operation.security = [];
      if (requiresAuth) {
        operation.security.push({ bearerAuth: [] });
      }
      if (requiresApiKey) {
        operation.security.push({ apiKey: [] });
      }
    }
    
    return operation;
  }

  /**
   * Extract description from JSDoc
   */
  private extractDescription(jsDoc: string): { summary?: string; full?: string } {
    const lines = jsDoc.split('\n').map(l => l.trim().replace(/^\*\s*/, ''));
    const summary = lines.find(l => l && !l.startsWith('@'));
    return { summary, full: jsDoc };
  }

  /**
   * Extract path parameters
   */
  private extractPathParams(path: string): string[] {
    const matches = path.matchAll(/\{(\w+)\}/g);
    return Array.from(matches).map(m => m[1]);
  }

  /**
   * Extract Zod schema from code
   */
  private extractZodSchema(content: string, type: 'request' | 'response'): any {
    // Look for Zod schema definitions
    const schemaMatch = content.match(/z\.object\([\s\S]*?\)/);
    if (schemaMatch) {
      // Return a generic object schema
      return { type: 'object', properties: {} };
    }
    return null;
  }

  /**
   * Extract tags from path
   */
  private extractTags(path: string): string[] {
    const segments = path.split('/').filter(s => s && !s.startsWith('{'));
    return segments.length > 0 ? [segments[0]] : ['general'];
  }

  /**
   * Normalize path for OpenAPI
   */
  private normalizePath(path: string): string {
    return `/api${path === '/' ? '' : path}`;
  }

  /**
   * Save OpenAPI spec to file
   */
  save(outputPath: string = join(this.workspaceRoot, 'docs', 'openapi.json')): void {
    writeFileSync(outputPath, JSON.stringify(this.spec, null, 2), 'utf-8');
    console.log(`✅ OpenAPI documentation saved to ${outputPath}`);
  }
}

// CLI entry point
if (require.main === module) {
  const generator = new OpenAPIGenerator();
  generator.generate()
    .then(spec => {
      generator.save();
      console.log(`📚 Generated OpenAPI spec with ${Object.keys(spec.paths).length} paths`);
    })
    .catch(error => {
      console.error('❌ Failed to generate OpenAPI documentation:', error);
      process.exit(1);
    });
}
