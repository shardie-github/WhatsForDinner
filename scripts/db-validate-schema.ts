#!/usr/bin/env tsx
/**
 * Database Schema Validation Script
 * 
 * Validates that the database schema matches expectations:
 * - Core tables exist
 * - Core columns exist
 * - Indexes exist
 * - RLS policies exist (if applicable)
 * 
 * Usage:
 *   tsx scripts/db-validate-schema.ts
 * 
 * Environment Variables:
 *   DATABASE_URL - PostgreSQL connection string
 */

import { PrismaClient } from '@prisma/client';
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('db-validate-schema');

interface ValidationResult {
  table: string;
  exists: boolean;
  columns?: string[];
  missingColumns?: string[];
}

const REQUIRED_TABLES = [
  'users',
  'households',
  'household_members',
  'recipes',
  'meal_plans',
  'grocery_lists',
  'health_metrics',
];

const REQUIRED_COLUMNS: Record<string, string[]> = {
  users: ['id', 'email', 'plan', 'created_at', 'updated_at'],
  households: ['id', 'owner_id', 'created_at', 'updated_at'],
  recipes: ['id', 'title', 'steps', 'ingredients', 'created_at', 'updated_at'],
  meal_plans: ['id', 'user_id', 'day', 'items', 'created_at', 'updated_at'],
};

async function validateTableExists(prisma: PrismaClient, tableName: string): Promise<boolean> {
  try {
    // Use raw query to check if table exists
    const result = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = ${tableName}
      ) as exists
    `;
    return result[0]?.exists ?? false;
  } catch (error) {
    logger.error(`Error checking table ${tableName}:`, { error });
    return false;
  }
}

async function validateColumns(prisma: PrismaClient, tableName: string, requiredColumns: string[]): Promise<{ columns: string[]; missingColumns: string[] }> {
  try {
    const result = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = ${tableName}
    `;
    
    const existingColumns = result.map(r => r.column_name);
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    return {
      columns: existingColumns,
      missingColumns,
    };
  } catch (error) {
    logger.error(`Error checking columns for ${tableName}:`, { error });
    return {
      columns: [],
      missingColumns: requiredColumns,
    };
  }
}

async function validateIndexes(prisma: PrismaClient, tableName: string): Promise<number> {
  try {
    const result = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND tablename = ${tableName}
    `;
    return Number(result[0]?.count ?? 0);
  } catch (error) {
    logger.error(`Error checking indexes for ${tableName}:`, { error });
    return 0;
  }
}

async function validateRLSPolicies(prisma: PrismaClient, tableName: string): Promise<number> {
  try {
    const result = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM pg_policies
      WHERE schemaname = 'public'
      AND tablename = ${tableName}
    `;
    return Number(result[0]?.count ?? 0);
  } catch (error) {
    logger.error(`Error checking RLS policies for ${tableName}:`, { error });
    return 0;
  }
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    logger.error('❌ DATABASE_URL environment variable is not set');
    logger.info('Set DATABASE_URL to a PostgreSQL connection string');
    process.exit(1);
  }

  logger.info('🔍 Validating database schema...\n');

  const prisma = new PrismaClient();
  const results: ValidationResult[] = [];
  let allValid = true;

  try {
    // Test connection
    await prisma.$connect();
    logger.info('✅ Database connection successful\n');

    // Validate each required table
    for (const tableName of REQUIRED_TABLES) {
      logger.info(`Checking table: ${tableName}`);
      
      const exists = await validateTableExists(prisma, tableName);
      
      if (!exists) {
        logger.error(`  ❌ Table ${tableName} does not exist`);
        results.push({ table: tableName, exists: false });
        allValid = false;
        continue;
      }

      logger.info(`  ✅ Table ${tableName} exists`);

      // Validate columns if specified
      const requiredColumns = REQUIRED_COLUMNS[tableName];
      if (requiredColumns) {
        const { columns, missingColumns } = await validateColumns(prisma, tableName, requiredColumns);
        
        if (missingColumns.length > 0) {
          logger.error(`  ❌ Missing columns: ${missingColumns.join(', ')}`);
          results.push({
            table: tableName,
            exists: true,
            columns,
            missingColumns,
          });
          allValid = false;
        } else {
          logger.info(`  ✅ All required columns exist`);
          results.push({
            table: tableName,
            exists: true,
            columns,
          });
        }
      }

      // Check indexes
      const indexCount = await validateIndexes(prisma, tableName);
      logger.info(`  ℹ️  Indexes: ${indexCount}`);

      // Check RLS policies (informational)
      const policyCount = await validateRLSPolicies(prisma, tableName);
      if (policyCount > 0) {
        logger.info(`  ℹ️  RLS policies: ${policyCount}`);
      }
    }

    // Summary
    logger.info('\n' + '='.repeat(50));
    logger.info('Schema Validation Summary');
    logger.info('='.repeat(50));

    const validTables = results.filter(r => r.exists && (!r.missingColumns || r.missingColumns.length === 0)).length;
    const invalidTables = results.length - validTables;

    logger.info(`✅ Valid tables: ${validTables}`);
    if (invalidTables > 0) {
      logger.info(`❌ Invalid tables: ${invalidTables}`);
    }

    results.forEach(result => {
      if (!result.exists) {
        logger.info(`  ❌ ${result.table}: Table missing`);
      } else if (result.missingColumns && result.missingColumns.length > 0) {
        logger.info(`  ❌ ${result.table}: Missing columns (${result.missingColumns.join(', ')})`);
      } else {
        logger.info(`  ✅ ${result.table}: Valid`);
      }
    });

    logger.info('='.repeat(50) + '\n');

    if (allValid) {
      logger.info('✅ Schema validation passed!');
      process.exit(0);
    } else {
      logger.error('❌ Schema validation failed!');
      logger.info('Run migrations: pnpm db:migrate');
      process.exit(1);
    }
  } catch (error) {
    logger.error('Fatal error during schema validation:', { error });
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  logger.error('Unhandled error:', { error });
  process.exit(1);
});
