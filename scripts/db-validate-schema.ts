#!/usr/bin/env tsx
/**
 * Database Schema Validator
 * 
 * Validates that Prisma schema matches Supabase migrations
 * and identifies schema drift or missing migrations.
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';

interface SchemaIssue {
  type: 'missing_table' | 'missing_column' | 'type_mismatch' | 'missing_index' | 'missing_migration';
  table?: string;
  column?: string;
  expected?: string;
  actual?: string;
  migration?: string;
  severity: 'error' | 'warning';
  message: string;
}

interface SchemaValidation {
  issues: SchemaIssue[];
  tablesInPrisma: string[];
  tablesInMigrations: string[];
  migrations: string[];
}

function loadPrismaSchema(): any {
  const schemaPath = join(process.cwd(), 'prisma', 'schema.prisma');
  if (!existsSync(schemaPath)) {
    throw new Error('Prisma schema not found at prisma/schema.prisma');
  }

  const content = readFileSync(schemaPath, 'utf-8');
  
  // Extract table names from Prisma schema
  const tableMatches = content.matchAll(/model\s+(\w+)\s*\{/g);
  const tables = Array.from(tableMatches, m => m[1]);
  
  return {
    content,
    tables,
    path: schemaPath
  };
}

function loadSupabaseMigrations(): { files: string[]; tables: Set<string> } {
  const migrationDirs = [
    join(process.cwd(), 'apps', 'web', 'supabase', 'migrations'),
    join(process.cwd(), 'supabase', 'migrations'),
    join(process.cwd(), 'whats-for-dinner', 'supabase', 'migrations'),
  ];

  const allMigrations: string[] = [];
  const tables = new Set<string>();

  for (const dir of migrationDirs) {
    if (existsSync(dir)) {
      const files = readdirSync(dir)
        .filter(f => f.endsWith('.sql'))
        .map(f => join(dir, f));
      
      allMigrations.push(...files);

      // Extract table names from SQL migrations
      for (const file of files) {
        try {
          const content = readFileSync(file, 'utf-8');
          const createTableMatches = content.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?([a-z_]+)/gi);
          for (const match of createTableMatches) {
            tables.add(match[1]);
          }
        } catch (err) {
          // Skip files that can't be read
        }
      }
    }
  }

  return {
    files: allMigrations.sort(),
    tables
  };
}

async function validateSchema(): Promise<SchemaValidation> {
  const issues: SchemaIssue[] = [];
  
  const prismaSchema = loadPrismaSchema();
  const migrations = loadSupabaseMigrations();

  // Check for tables in Prisma but not in migrations
  for (const table of prismaSchema.tables) {
    const tableName = table.toLowerCase();
    if (!migrations.tables.has(tableName)) {
      issues.push({
        type: 'missing_migration',
        table: tableName,
        severity: 'error',
        message: `Table "${table}" exists in Prisma schema but no migration found`
      });
    }
  }

  // Check for multiple migration directories (fragmentation)
  const migrationDirs = [
    join(process.cwd(), 'apps', 'web', 'supabase', 'migrations'),
    join(process.cwd(), 'supabase', 'migrations'),
    join(process.cwd(), 'whats-for-dinner', 'supabase', 'migrations'),
  ].filter(dir => existsSync(dir));

  if (migrationDirs.length > 1) {
    issues.push({
      type: 'missing_migration',
      severity: 'warning',
      message: `Found ${migrationDirs.length} migration directories. Consider consolidating: ${migrationDirs.join(', ')}`
    });
  }

  // Check migration file naming consistency
  const inconsistentNames = migrations.files.filter(f => {
    const name = f.split('/').pop() || '';
    // Check if migration follows naming convention (timestamp_name.sql or YYYY-MM-DD_name.sql)
    return !name.match(/^\d{13,}_|^\d{4}-\d{2}-\d{2}_/) && !name.includes('master');
  });

  if (inconsistentNames.length > 0) {
    issues.push({
      type: 'missing_migration',
      severity: 'warning',
      message: `Found ${inconsistentNames.length} migrations with inconsistent naming: ${inconsistentNames.map(f => f.split('/').pop()).join(', ')}`
    });
  }

  return {
    issues,
    tablesInPrisma: prismaSchema.tables,
    tablesInMigrations: Array.from(migrations.tables),
    migrations: migrations.files.map(f => f.split('/').pop() || f)
  };
}

async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const prisma = new PrismaClient();
    await prisma.$connect();
    await prisma.$disconnect();
    return true;
  } catch (err) {
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === '--check' || command === 'check' || !command) {
    console.log('🔍 Validating database schema...\n');

    try {
      const validation = await validateSchema();

      if (validation.issues.length === 0) {
        console.log('✅ Schema validation passed!\n');
        console.log(`Found ${validation.tablesInPrisma.length} tables in Prisma schema`);
        console.log(`Found ${validation.migrations.length} migration files\n`);
      } else {
        console.log(`⚠️  Found ${validation.issues.length} issues:\n`);

        const errors = validation.issues.filter(i => i.severity === 'error');
        const warnings = validation.issues.filter(i => i.severity === 'warning');

        if (errors.length > 0) {
          console.log('❌ Errors:');
          for (const issue of errors) {
            console.log(`   - ${issue.message}`);
          }
          console.log('');
        }

        if (warnings.length > 0) {
          console.log('⚠️  Warnings:');
          for (const issue of warnings) {
            console.log(`   - ${issue.message}`);
          }
          console.log('');
        }
      }

      // Check database connection
      console.log('🔌 Checking database connection...');
      const canConnect = await checkDatabaseConnection();
      if (canConnect) {
        console.log('✅ Database connection successful\n');
      } else {
        console.log('⚠️  Could not connect to database (DATABASE_URL may not be set)\n');
      }

      process.exit(validation.issues.filter(i => i.severity === 'error').length > 0 ? 1 : 0);
    } catch (err: any) {
      console.error('❌ Schema validation failed:', err.message);
      process.exit(1);
    }
  } else if (command === '--list-migrations') {
    const migrations = loadSupabaseMigrations();
    console.log('📁 Migration files:\n');
    for (const file of migrations.files) {
      console.log(`   ${file}`);
    }
  } else {
    console.log('Database Schema Validator\n');
    console.log('Usage:');
    console.log('  pnpm db:validate          Validate schema consistency');
    console.log('  pnpm db:validate --list-migrations  List all migration files');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { validateSchema, SchemaValidation, SchemaIssue };
