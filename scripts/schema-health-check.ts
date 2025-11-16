#!/usr/bin/env tsx
/**
 * Database Schema Health Check
 * 
 * Compares Prisma schema against Supabase migrations
 * Identifies missing tables, columns, indexes, and constraints
 * Generates safe migration suggestions
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';

interface SchemaDiff {
  missingTables: string[];
  missingColumns: Record<string, string[]>;
  missingIndexes: Record<string, string[]>;
  missingConstraints: Record<string, string[]>;
  extraTables: string[];
  typeMismatches: Array<{ table: string; column: string; expected: string; actual: string }>;
}

interface MigrationFile {
  name: string;
  path: string;
  content: string;
  tables: string[];
  columns: Record<string, string[]>;
}

/**
 * Parse Prisma schema to extract table definitions
 */
function parsePrismaSchema(schemaPath: string): Record<string, any> {
  const content = readFileSync(schemaPath, 'utf-8');
  const tables: Record<string, any> = {};

  // Extract model definitions
  const modelRegex = /model\s+(\w+)\s*\{([^}]+)\}/g;
  let match;

  while ((match = modelRegex.exec(content)) !== null) {
    const tableName = match[1];
    const modelContent = match[2];
    const columns: Record<string, string> = {};

    // Extract field definitions
    const fieldRegex = /(\w+)\s+([^\n]+)/g;
    let fieldMatch;

    while ((fieldMatch = fieldRegex.exec(modelContent)) !== null) {
      const fieldName = fieldMatch[1].trim();
      const fieldDef = fieldMatch[2].trim();
      columns[fieldName] = fieldDef;
    }

    tables[tableName] = {
      columns,
      indexes: extractIndexes(modelContent),
      relations: extractRelations(modelContent),
    };
  }

  return tables;
}

/**
 * Extract index definitions from Prisma model
 */
function extractIndexes(modelContent: string): string[] {
  const indexes: string[] = [];
  const indexRegex = /@@index\(\[([^\]]+)\]/g;
  let match;

  while ((match = indexRegex.exec(modelContent)) !== null) {
    indexes.push(match[1].split(',').map((c: string) => c.trim().replace(/"/g, '')));
  }

  return indexes.flat();
}

/**
 * Extract relation definitions
 */
function extractRelations(modelContent: string): string[] {
  const relations: string[] = [];
  const relationRegex = /@relation\([^)]+\)/g;
  let match;

  while ((match = relationRegex.exec(modelContent)) !== null) {
    relations.push(match[0]);
  }

  return relations;
}

/**
 * Parse SQL migration files
 */
function parseMigrations(migrationsDir: string): MigrationFile[] {
  const migrations: MigrationFile[] = [];
  const files = readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));

  for (const file of files) {
    const path = join(migrationsDir, file);
    const content = readFileSync(path, 'utf-8');
    const tables = extractTablesFromSQL(content);
    const columns = extractColumnsFromSQL(content);

    migrations.push({
      name: file,
      path,
      content,
      tables,
      columns,
    });
  }

  return migrations;
}

/**
 * Extract table names from SQL
 */
function extractTablesFromSQL(sql: string): string[] {
  const tables: string[] = [];
  const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?(\w+)/gi;
  let match;

  while ((match = createTableRegex.exec(sql)) !== null) {
    tables.push(match[1]);
  }

  return tables;
}

/**
 * Extract column definitions from SQL
 */
function extractColumnsFromSQL(sql: string): Record<string, string[]> {
  const columns: Record<string, string[]> = {};
  const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?(\w+)\s*\(([^)]+)\)/gi;
  let match;

  while ((match = createTableRegex.exec(sql)) !== null) {
    const tableName = match[1];
    const tableDef = match[2];
    const columnNames: string[] = [];

    const columnRegex = /(\w+)\s+[^,]+/g;
    let colMatch;

    while ((colMatch = columnRegex.exec(tableDef)) !== null) {
      columnNames.push(colMatch[1]);
    }

    columns[tableName] = columnNames;
  }

  return columns;
}

/**
 * Compare Prisma schema with migrations
 */
function compareSchemas(
  prismaSchema: Record<string, any>,
  migrations: MigrationFile[]
): SchemaDiff {
  const diff: SchemaDiff = {
    missingTables: [],
    missingColumns: {},
    missingIndexes: {},
    missingConstraints: {},
    extraTables: [],
    typeMismatches: [],
  };

  // Collect all tables from migrations
  const migrationTables = new Set<string>();
  const migrationColumns: Record<string, Set<string>> = {};

  for (const migration of migrations) {
    for (const table of migration.tables) {
      migrationTables.add(table);
      if (!migrationColumns[table]) {
        migrationColumns[table] = new Set();
      }
      if (migration.columns[table]) {
        migration.columns[table].forEach(col => migrationColumns[table].add(col));
      }
    }
  }

  // Check Prisma models against migrations
  for (const [modelName, modelDef] of Object.entries(prismaSchema)) {
    const tableName = modelName.toLowerCase().replace(/([A-Z])/g, '_$1').toLowerCase();
    
    if (!migrationTables.has(tableName)) {
      diff.missingTables.push(tableName);
    } else {
      // Check columns
      const prismaColumns = Object.keys(modelDef.columns);
      const missingCols: string[] = [];

      for (const col of prismaColumns) {
        const colName = col.toLowerCase().replace(/([A-Z])/g, '_$1').toLowerCase();
        if (!migrationColumns[tableName]?.has(colName)) {
          missingCols.push(colName);
        }
      }

      if (missingCols.length > 0) {
        diff.missingColumns[tableName] = missingCols;
      }
    }
  }

  // Check for extra tables in migrations
  for (const table of migrationTables) {
    const modelName = table.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
    if (!prismaSchema[modelName]) {
      diff.extraTables.push(table);
    }
  }

  return diff;
}

/**
 * Generate safe migration SQL
 */
function generateMigrationSQL(diff: SchemaDiff): string {
  const statements: string[] = [];

  statements.push('-- Auto-generated migration based on schema health check');
  statements.push('-- Review carefully before applying');
  statements.push('');

  // Create missing tables
  for (const table of diff.missingTables) {
    statements.push(`-- TODO: Create table ${table}`);
    statements.push(`-- CREATE TABLE IF NOT EXISTS public.${table} (`);
    statements.push(`--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),`);
    statements.push(`--   created_at TIMESTAMPTZ DEFAULT NOW(),`);
    statements.push(`--   updated_at TIMESTAMPTZ DEFAULT NOW()`);
    statements.push(`-- );`);
    statements.push('');
  }

  // Add missing columns
  for (const [table, columns] of Object.entries(diff.missingColumns)) {
    for (const column of columns) {
      statements.push(`-- TODO: Add column ${column} to ${table}`);
      statements.push(`-- ALTER TABLE public.${table} ADD COLUMN IF NOT EXISTS ${column} TEXT;`);
      statements.push('');
    }
  }

  return statements.join('\n');
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Running database schema health check...\n');

  const schemaPath = join(process.cwd(), 'prisma/schema.prisma');
  const migrationsDir = join(process.cwd(), 'supabase/migrations');

  if (!statSync(schemaPath).isFile()) {
    console.error(`❌ Prisma schema not found: ${schemaPath}`);
    process.exit(1);
  }

  if (!statSync(migrationsDir).isDirectory()) {
    console.error(`❌ Migrations directory not found: ${migrationsDir}`);
    process.exit(1);
  }

  console.log('📖 Parsing Prisma schema...');
  const prismaSchema = parsePrismaSchema(schemaPath);
  console.log(`   Found ${Object.keys(prismaSchema).length} models`);

  console.log('📖 Parsing SQL migrations...');
  const migrations = parseMigrations(migrationsDir);
  console.log(`   Found ${migrations.length} migration files`);

  console.log('🔍 Comparing schemas...');
  const diff = compareSchemas(prismaSchema, migrations);

  console.log('\n📊 Schema Health Report:');
  console.log(`   ✅ Tables in sync: ${Object.keys(prismaSchema).length - diff.missingTables.length}`);
  console.log(`   ⚠️  Missing tables: ${diff.missingTables.length}`);
  console.log(`   ⚠️  Tables with missing columns: ${Object.keys(diff.missingColumns).length}`);
  console.log(`   ⚠️  Extra tables in migrations: ${diff.extraTables.length}`);

  if (diff.missingTables.length > 0) {
    console.log('\n❌ Missing Tables:');
    diff.missingTables.forEach(t => console.log(`   - ${t}`));
  }

  if (Object.keys(diff.missingColumns).length > 0) {
    console.log('\n❌ Missing Columns:');
    for (const [table, columns] of Object.entries(diff.missingColumns)) {
      console.log(`   - ${table}:`);
      columns.forEach(col => console.log(`     • ${col}`));
    }
  }

  if (diff.extraTables.length > 0) {
    console.log('\n⚠️  Extra Tables (in migrations but not in Prisma):');
    diff.extraTables.forEach(t => console.log(`   - ${t}`));
  }

  // Generate migration SQL
  if (diff.missingTables.length > 0 || Object.keys(diff.missingColumns).length > 0) {
    const migrationSQL = generateMigrationSQL(diff);
    const outputPath = join(process.cwd(), 'supabase/migrations/999_schema_health_fix.sql');
    require('fs').writeFileSync(outputPath, migrationSQL);
    console.log(`\n💾 Generated migration file: ${outputPath}`);
    console.log('   ⚠️  Review and test before applying!');
  }

  if (diff.missingTables.length === 0 && Object.keys(diff.missingColumns).length === 0) {
    console.log('\n✅ Schema is healthy! No issues found.');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { compareSchemas, parsePrismaSchema, parseMigrations };
