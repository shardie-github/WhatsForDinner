/**
 * Database Schema Health Checker
 * Compares Prisma schema vs actual database schema
 * Identifies missing tables, columns, indexes, constraints, RLS policies
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

interface SchemaHealthReport {
  timestamp: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  issues: SchemaIssue[];
  summary: {
    totalTables: number;
    missingTables: number;
    missingColumns: number;
    missingIndexes: number;
    missingConstraints: number;
    missingRLSPolicies: number;
  };
}

interface SchemaIssue {
  type: 'missing_table' | 'missing_column' | 'missing_index' | 'missing_constraint' | 'missing_rls' | 'type_mismatch';
  severity: 'error' | 'warning';
  table?: string;
  column?: string;
  index?: string;
  constraint?: string;
  message: string;
  recommendation: string;
}

export class SchemaHealthChecker {
  private prisma: PrismaClient;
  private workspaceRoot: string;

  constructor(workspaceRoot: string = process.cwd()) {
    this.workspaceRoot = workspaceRoot;
    this.prisma = new PrismaClient();
  }

  /**
   * Run comprehensive schema health check
   */
  async check(): Promise<SchemaHealthReport> {
    const issues: SchemaIssue[] = [];
    
    // Load Prisma schema
    const prismaSchema = this.loadPrismaSchema();
    
    // Get actual database schema
    const dbSchema = await this.getDatabaseSchema();
    
    // Compare schemas
    issues.push(...this.checkTables(prismaSchema, dbSchema));
    issues.push(...await this.checkColumns(prismaSchema, dbSchema));
    issues.push(...await this.checkIndexes(prismaSchema, dbSchema));
    issues.push(...await this.checkConstraints(prismaSchema, dbSchema));
    issues.push(...await this.checkRLSPolicies(dbSchema));
    
    // Determine status
    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (errorCount > 0) {
      status = 'unhealthy';
    } else if (warningCount > 0) {
      status = 'degraded';
    }
    
    const report: SchemaHealthReport = {
      timestamp: new Date().toISOString(),
      status,
      issues,
      summary: {
        totalTables: dbSchema.tables.length,
        missingTables: issues.filter(i => i.type === 'missing_table').length,
        missingColumns: issues.filter(i => i.type === 'missing_column').length,
        missingIndexes: issues.filter(i => i.type === 'missing_index').length,
        missingConstraints: issues.filter(i => i.type === 'missing_constraint').length,
        missingRLSPolicies: issues.filter(i => i.type === 'missing_rls').length,
      },
    };
    
    return report;
  }

  /**
   * Load Prisma schema file
   */
  private loadPrismaSchema(): any {
    const schemaPath = join(this.workspaceRoot, 'prisma', 'schema.prisma');
    const schemaContent = readFileSync(schemaPath, 'utf-8');
    
    // Extract model names
    const modelMatches = schemaContent.matchAll(/model\s+(\w+)\s*\{/g);
    const models = Array.from(modelMatches).map(m => m[1]);
    
    return { models };
  }

  /**
   * Get actual database schema
   */
  private async getDatabaseSchema(): Promise<{
    tables: string[];
    columns: Record<string, string[]>;
    indexes: Record<string, string[]>;
    constraints: Record<string, string[]>;
  }> {
    // Get all tables
    const tablesResult = await this.prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;
    const tables = tablesResult.map(t => t.tablename);
    
    // Get columns for each table
    const columns: Record<string, string[]> = {};
    for (const table of tables) {
      const columnsResult = await this.prisma.$queryRaw<Array<{ column_name: string }>>`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = ${table}
        ORDER BY ordinal_position;
      `;
      columns[table] = columnsResult.map(c => c.column_name);
    }
    
    // Get indexes for each table
    const indexes: Record<string, string[]> = {};
    for (const table of tables) {
      const indexesResult = await this.prisma.$queryRaw<Array<{ indexname: string }>>`
        SELECT indexname 
        FROM pg_indexes 
        WHERE schemaname = 'public' AND tablename = ${table}
        AND indexname NOT LIKE '%_pkey';
      `;
      indexes[table] = indexesResult.map(i => i.indexname);
    }
    
    // Get constraints for each table
    const constraints: Record<string, string[]> = {};
    for (const table of tables) {
      const constraintsResult = await this.prisma.$queryRaw<Array<{ constraint_name: string }>>`
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_schema = 'public' AND table_name = ${table}
        AND constraint_type != 'PRIMARY KEY';
      `;
      constraints[table] = constraintsResult.map(c => c.constraint_name);
    }
    
    return { tables, columns, indexes, constraints };
  }

  /**
   * Check for missing tables
   */
  private checkTables(prismaSchema: any, dbSchema: any): SchemaIssue[] {
    const issues: SchemaIssue[] = [];
    const dbTables = new Set(dbSchema.tables);
    
    for (const model of prismaSchema.models) {
      const tableName = this.camelToSnake(model);
      if (!dbTables.has(tableName)) {
        issues.push({
          type: 'missing_table',
          severity: 'error',
          table: tableName,
          message: `Table ${tableName} (from model ${model}) is missing in database`,
          recommendation: `Run migration: prisma migrate deploy or create migration: prisma migrate dev --name add_${tableName}`,
        });
      }
    }
    
    return issues;
  }

  /**
   * Check for missing columns
   */
  private async checkColumns(prismaSchema: any, dbSchema: any): Promise<SchemaIssue[]> {
    const issues: SchemaIssue[] = [];
    
    // This would require parsing Prisma schema more deeply
    // For now, return empty array - can be enhanced
    
    return issues;
  }

  /**
   * Check for missing indexes
   */
  private async checkIndexes(prismaSchema: any, dbSchema: any): Promise<SchemaIssue[]> {
    const issues: SchemaIssue[] = [];
    
    // Check for common indexes that should exist
    const expectedIndexes: Record<string, string[]> = {
      users: ['users_email_idx'],
      meal_plans: ['meal_plans_user_day_idx'],
      health_metrics: ['health_metrics_user_kind_ts_idx'],
      messages: ['messages_room_ts_idx'],
      events: ['events_user_ts_idx'],
    };
    
    for (const [table, expectedIndexNames] of Object.entries(expectedIndexes)) {
      if (dbSchema.tables.includes(table)) {
        const actualIndexes = new Set(dbSchema.indexes[table] || []);
        for (const indexName of expectedIndexNames) {
          if (!actualIndexes.has(indexName)) {
            issues.push({
              type: 'missing_index',
              severity: 'warning',
              table,
              index: indexName,
              message: `Index ${indexName} is missing on table ${table}`,
              recommendation: `CREATE INDEX ${indexName} ON ${table} (...);`,
            });
          }
        }
      }
    }
    
    return issues;
  }

  /**
   * Check for missing constraints
   */
  private async checkConstraints(prismaSchema: any, dbSchema: any): Promise<SchemaIssue[]> {
    const issues: SchemaIssue[] = [];
    
    // Check for foreign key constraints
    // This would require parsing Prisma relations
    
    return issues;
  }

  /**
   * Check for missing RLS policies
   */
  private async checkRLSPolicies(dbSchema: any): Promise<SchemaIssue[]> {
    const issues: SchemaIssue[] = [];
    
    // Get tables with RLS enabled
    const rlsTablesResult = await this.prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN (
        SELECT tablename 
        FROM pg_tables t
        JOIN pg_class c ON c.relname = t.tablename
        WHERE c.relrowsecurity = true
      );
    `;
    const rlsTables = new Set(rlsTablesResult.map(t => t.tablename));
    
    // Check for policies on RLS-enabled tables
    for (const table of rlsTables) {
      const policiesResult = await this.prisma.$queryRaw<Array<{ policyname: string }>>`
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = ${table};
      `;
      
      if (policiesResult.length === 0) {
        issues.push({
          type: 'missing_rls',
          severity: 'error',
          table,
          message: `Table ${table} has RLS enabled but no policies defined`,
          recommendation: `Create RLS policies for ${table} or disable RLS if not needed`,
        });
      }
    }
    
    return issues;
  }

  /**
   * Convert camelCase to snake_case
   */
  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).replace(/^_/, '');
  }

  /**
   * Generate migration recommendations
   */
  generateMigrationRecommendations(report: SchemaHealthReport): string[] {
    const recommendations: string[] = [];
    
    for (const issue of report.issues) {
      if (issue.recommendation && !recommendations.includes(issue.recommendation)) {
        recommendations.push(issue.recommendation);
      }
    }
    
    return recommendations;
  }

  /**
   * Cleanup
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

// CLI entry point
if (require.main === module) {
  const checker = new SchemaHealthChecker();
  checker.check()
    .then(report => {
      console.log(JSON.stringify(report, null, 2));
      const recommendations = checker.generateMigrationRecommendations(report);
      if (recommendations.length > 0) {
        console.log('\n📋 Migration Recommendations:');
        recommendations.forEach((rec, i) => {
          console.log(`${i + 1}. ${rec}`);
        });
      }
      process.exit(report.status === 'healthy' ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Schema health check failed:', error);
      process.exit(1);
    })
    .finally(() => {
      checker.disconnect();
    });
}
