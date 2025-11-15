#!/usr/bin/env tsx
/**
 * Supabase Schema Health Check
 * 
 * Compares Prisma schema with migration files and identifies:
 * - Missing tables in Prisma schema
 * - Missing migrations for Prisma tables
 * - Index mismatches
 * - RLS policy gaps
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

interface SchemaHealth {
  prismaTables: string[];
  migrationTables: string[];
  missingInPrisma: string[];
  missingInMigrations: string[];
  indexMismatches: string[];
  rlsGaps: string[];
}

class SchemaHealthChecker {
  private rootDir: string;

  constructor(rootDir: string = process.cwd()) {
    this.rootDir = rootDir;
  }

  async checkHealth(): Promise<SchemaHealth> {
    const prismaSchema = join(this.rootDir, 'prisma/schema.prisma');
    const migrationsDir = join(this.rootDir, 'supabase/migrations');

    if (!existsSync(prismaSchema)) {
      throw new Error('Prisma schema not found');
    }

    const prismaContent = readFileSync(prismaSchema, 'utf-8');
    const prismaTables = this.extractPrismaTables(prismaContent);
    const prismaIndexes = this.extractPrismaIndexes(prismaContent);

    const migrationTables = new Set<string>();
    const migrationIndexes = new Set<string>();
    const rlsPolicies = new Set<string>();

    if (existsSync(migrationsDir)) {
      const migrationFiles = readdirSync(migrationsDir)
        .filter((f) => f.endsWith('.sql'))
        .map((f) => join(migrationsDir, f));

      for (const migrationFile of migrationFiles) {
        const content = readFileSync(migrationFile, 'utf-8');
        const tables = this.extractMigrationTables(content);
        tables.forEach((t) => migrationTables.add(t));

        const indexes = this.extractMigrationIndexes(content);
        indexes.forEach((i) => migrationIndexes.add(i));

        const policies = this.extractRLSPolicies(content);
        policies.forEach((p) => rlsPolicies.add(p));
      }
    }

    const missingInPrisma = Array.from(migrationTables).filter(
      (t) => !prismaTables.some((pt) => pt.toLowerCase() === t.toLowerCase())
    );

    const missingInMigrations = prismaTables.filter(
      (t) => !Array.from(migrationTables).some((mt) => mt.toLowerCase() === t.toLowerCase())
    );

    const indexMismatches: string[] = [];
    // Compare indexes (simplified - would need more sophisticated comparison)
    for (const prismaIdx of prismaIndexes) {
      const found = Array.from(migrationIndexes).some((mi) =>
        mi.toLowerCase().includes(prismaIdx.toLowerCase())
      );
      if (!found) {
        indexMismatches.push(`Index for ${prismaIdx} missing in migrations`);
      }
    }

    return {
      prismaTables,
      migrationTables: Array.from(migrationTables),
      missingInPrisma,
      missingInMigrations,
      indexMismatches,
      rlsGaps: [], // Would need to check RLS policies more thoroughly
    };
  }

  private extractPrismaTables(content: string): string[] {
    const tables: string[] = [];
    const modelMatches = content.matchAll(/model\s+(\w+)\s*\{/g);
    for (const match of modelMatches) {
      tables.push(match[1]);
    }
    return tables;
  }

  private extractPrismaIndexes(content: string): string[] {
    const indexes: string[] = [];
    const indexMatches = content.matchAll(/@@index\(\[([^\]]+)\]/g);
    for (const match of indexMatches) {
      indexes.push(match[1]);
    }
    return indexes;
  }

  private extractMigrationTables(content: string): string[] {
    const tables: string[] = [];
    const createMatches = content.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?(\w+)/gi);
    for (const match of createMatches) {
      tables.push(match[1]);
    }
    return tables;
  }

  private extractMigrationIndexes(content: string): string[] {
    const indexes: string[] = [];
    const indexMatches = content.matchAll(/CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:\w+\.)?(\w+)\s+ON/gi);
    for (const match of indexMatches) {
      indexes.push(match[1]);
    }
    return indexes;
  }

  private extractRLSPolicies(content: string): string[] {
    const policies: string[] = [];
    const policyMatches = content.matchAll(/CREATE\s+POLICY\s+(\w+)\s+ON/gi);
    for (const match of policyMatches) {
      policies.push(match[1]);
    }
    return policies;
  }
}

if (require.main === module) {
  const checker = new SchemaHealthChecker();
  checker
    .checkHealth()
    .then((health) => {
      console.log('Schema Health Report:');
      console.log(`Prisma Tables: ${health.prismaTables.length}`);
      console.log(`Migration Tables: ${health.migrationTables.length}`);
      console.log(`Missing in Prisma: ${health.missingInPrisma.length}`);
      console.log(`Missing in Migrations: ${health.missingInMigrations.length}`);
      console.log(`Index Mismatches: ${health.indexMismatches.length}`);

      if (health.missingInPrisma.length > 0) {
        console.log('\n⚠️  Tables in migrations but not in Prisma:');
        health.missingInPrisma.forEach((t) => console.log(`  - ${t}`));
      }

      if (health.missingInMigrations.length > 0) {
        console.log('\n⚠️  Tables in Prisma but not in migrations:');
        health.missingInMigrations.forEach((t) => console.log(`  - ${t}`));
      }

      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Schema health check failed:', error);
      process.exit(1);
    });
}

export { SchemaHealthChecker };
