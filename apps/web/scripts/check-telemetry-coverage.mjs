#!/usr/bin/env node
/**
 * Check Telemetry Coverage
 * Verifies that all API routes have telemetry instrumentation
 */

import { readdirSync, readFileSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const apiDir = join(projectRoot, 'src/app/api');

const routes = [];

function findRoutes(dir) {
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        findRoutes(fullPath);
      } else if (entry.name === 'route.ts' || entry.name === 'route.js') {
        routes.push(fullPath);
      }
    }
  } catch (err) {
    // Directory doesn't exist or can't be read
  }
}

findRoutes(apiDir);

let withTelemetry = 0;
const missingTelemetry = [];

for (const route of routes) {
  try {
    const content = readFileSync(route, 'utf-8');
    const hasTelemetry = 
      content.includes('withTelemetry') || 
      content.includes('telemetry') ||
      content.includes('trackMetrics') ||
      content.includes('@sentry/nextjs');
    
    if (hasTelemetry) {
      withTelemetry++;
    } else {
      const relativePath = route.replace(projectRoot + '/', '');
      missingTelemetry.push(relativePath);
    }
  } catch (err) {
    console.error(`Error reading ${route}:`, err.message);
  }
}

const coverage = routes.length > 0 ? Math.round((withTelemetry / routes.length) * 100) : 0;

console.log(`\n📊 Telemetry Coverage Report`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`Total API routes: ${routes.length}`);
console.log(`With telemetry: ${withTelemetry}`);
console.log(`Coverage: ${coverage}%`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

if (missingTelemetry.length > 0 && missingTelemetry.length <= 10) {
  console.log(`\n⚠️  Missing telemetry (showing first 10):`);
  missingTelemetry.slice(0, 10).forEach(route => {
    console.log(`   - ${route}`);
  });
}

if (coverage === 100) {
  console.log(`\n✅ All API routes have telemetry coverage!`);
  process.exit(0);
} else {
  console.log(`\n❌ ${routes.length - withTelemetry} routes missing telemetry`);
  process.exit(1);
}
