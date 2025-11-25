#!/usr/bin/env tsx
/**
 * API Documentation Validator
 * 
 * Validates OpenAPI spec against actual API routes
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { glob } from 'glob';

interface RouteInfo {
  path: string;
  file: string;
  methods: string[];
}

function extractRouteFromPath(filePath: string, baseDir: string): string {
  // Convert file path to API route
  // apps/web/src/app/api/user/me/route.ts -> /api/user/me
  const relativePath = relative(baseDir, filePath);
  const route = relativePath
    .replace(/\/route\.tsx?$/, '')
    .replace(/^apps\/web\/src\/app\/api/, '/api')
    .replace(/\[([^\]]+)\]/g, '{$1}'); // Convert [id] to {id}
  
  return route;
}

function extractMethods(filePath: string): string[] {
  const content = readFileSync(filePath, 'utf-8');
  const methods: string[] = [];
  
  // Check for exported HTTP methods
  if (content.match(/export\s+(async\s+)?function\s+GET/i)) methods.push('GET');
  if (content.match(/export\s+(async\s+)?function\s+POST/i)) methods.push('POST');
  if (content.match(/export\s+(async\s+)?function\s+PUT/i)) methods.push('PUT');
  if (content.match(/export\s+(async\s+)?function\s+PATCH/i)) methods.push('PATCH');
  if (content.match(/export\s+(async\s+)?function\s+DELETE/i)) methods.push('DELETE');
  
  // Check for exported constants
  if (content.match(/export\s+const\s+GET\s*=/i)) methods.push('GET');
  if (content.match(/export\s+const\s+POST\s*=/i)) methods.push('POST');
  if (content.match(/export\s+const\s+PUT\s*=/i)) methods.push('PUT');
  if (content.match(/export\s+const\s+PATCH\s*=/i)) methods.push('PATCH');
  if (content.match(/export\s+const\s+DELETE\s*=/i)) methods.push('DELETE');
  
  return methods;
}

async function discoverRoutes(): Promise<Map<string, RouteInfo>> {
  const routes = new Map<string, RouteInfo>();
  const baseDir = join(process.cwd(), 'apps', 'web', 'src', 'app', 'api');
  
  const routeFiles = await glob('**/route.ts', {
    cwd: baseDir });
  const routeFiles2 = await glob('**/route.tsx', { cwd: baseDir });
  
  for (const file of [...routeFiles, ...routeFiles2]) {
    const fullPath = join(baseDir, file);
    const route = extractRouteFromPath(fullPath, baseDir);
    const methods = extractMethods(fullPath);
    
    if (methods.length > 0) {
      routes.set(route, {
        path: route,
        file: file,
        methods,
      });
    }
  }
  
  return routes;
}

function loadOpenAPISpec(): any {
  try {
    const content = readFileSync(join(process.cwd(), 'openapi.json'), 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    return null;
  }
}

function main() {
  console.log('🔍 Validating API Documentation...\n');
  
  const spec = loadOpenAPISpec();
  if (!spec) {
    console.error('❌ Could not load openapi.json');
    process.exit(1);
  }
  
  discoverRoutes().then(routes => {
    const documentedPaths = Object.keys(spec.paths || {});
    const actualRoutes = Array.from(routes.keys());
    
    console.log(`📊 Statistics:`);
    console.log(`   Documented paths: ${documentedPaths.length}`);
    console.log(`   Actual routes: ${actualRoutes.length}\n`);
    
    // Find undocumented routes
    const undocumented = actualRoutes.filter(r => !documentedPaths.includes(r));
    if (undocumented.length > 0) {
      console.log(`⚠️  Undocumented routes (${undocumented.length}):`);
      undocumented.slice(0, 20).forEach(route => {
        const info = routes.get(route);
        console.log(`   - ${route} [${info?.methods.join(', ')}]`);
      });
      if (undocumented.length > 20) {
        console.log(`   ... and ${undocumented.length - 20} more`);
      }
      console.log('');
    }
    
    // Find documented but non-existent routes
    const nonExistent = documentedPaths.filter(p => !actualRoutes.includes(p));
    if (nonExistent.length > 0) {
      console.log(`⚠️  Documented but non-existent routes (${nonExistent.length}):`);
      nonExistent.slice(0, 10).forEach(route => {
        console.log(`   - ${route}`);
      });
      if (nonExistent.length > 10) {
        console.log(`   ... and ${nonExistent.length - 10} more`);
      }
      console.log('');
    }
    
    // Check method coverage
    let methodsCovered = 0;
    let methodsTotal = 0;
    
    routes.forEach((info, route) => {
      methodsTotal += info.methods.length;
      const pathSpec = spec.paths[route];
      if (pathSpec) {
        info.methods.forEach(method => {
          if (pathSpec[method.toLowerCase()]) {
            methodsCovered++;
          }
        });
      }
    });
    
    const coverage = methodsTotal > 0 ? (methodsCovered / methodsTotal * 100).toFixed(1) : '0';
    console.log(`📈 Coverage:`);
    console.log(`   Methods documented: ${methodsCovered}/${methodsTotal} (${coverage}%)\n`);
    
    if (undocumented.length === 0 && nonExistent.length === 0 && methodsCovered === methodsTotal) {
      console.log('✅ API documentation is complete!\n');
      process.exit(0);
    } else {
      console.log('⚠️  API documentation needs updates\n');
      process.exit(1);
    }
  });
}

if (require.main === module) {
  main();
}

export { discoverRoutes, extractRouteFromPath, extractMethods };
