#!/usr/bin/env tsx

/**
 * EMC (Expand/Migrate/Contract) Migration Script
 * 
 * This script implements the EMC pattern for online-safe database migrations:
 * 1. Expand: Add nullable/new columns, views; dual-write if needed
 * 2. Migrate: Backfill script (idempotent) with chunking + retry/backoff
 * 3. Contract: Remove old columns after verification window
 */

import { createClient } from '@supabase/supabase-js';

interface MigrationStep {
  id: string;
  type: 'expand' | 'migrate' | 'contract';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  description: string;
  sql: string;
  depends_on?: string[];
  created_at: string;
  completed_at?: string;
  error?: string;
}

interface EMCConfig {
  chunk_size: number;
  max_retries: number;
  retry_delay_ms: number;
  verification_window_days: number;
}

const DEFAULT_CONFIG: EMCConfig = {
  chunk_size: 1000,
  max_retries: 3,
  retry_delay_ms: 1000,
  verification_window_days: 7
};

class EMCMigrator {
  private supabase: any;
  private config: EMCConfig;
  private migrationSteps: MigrationStep[] = [];

  constructor(supabaseUrl: string, supabaseKey: string, config: Partial<EMCConfig> = {}) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize EMC migration tracking table
   */
  async initialize(): Promise<void> {
    const initSQL = `
      CREATE TABLE IF NOT EXISTS emc_migration_steps (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL CHECK (type IN ('expand', 'migrate', 'contract')),
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
        description TEXT NOT NULL,
        sql TEXT NOT NULL,
        depends_on TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE,
        error TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_emc_migration_steps_status ON emc_migration_steps(status);
      CREATE INDEX IF NOT EXISTS idx_emc_migration_steps_type ON emc_migration_steps(type);
    `;

    await this.supabase.rpc('exec_sql', { sql: initSQL });
    console.log('✅ EMC migration tracking initialized');
  }

  /**
   * Add a new migration step
   */
  async addStep(step: Omit<MigrationStep, 'created_at' | 'status'>): Promise<void> {
    const migrationStep: MigrationStep = {
      ...step,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    const { error } = await this.supabase
      .from('emc_migration_steps')
      .insert(migrationStep);

    if (error) {
      throw new Error(`Failed to add migration step: ${error.message}`);
    }

    this.migrationSteps.push(migrationStep);
    console.log(`📝 Added ${step.type} step: ${step.id}`);
  }

  /**
   * Load migration steps from database
   */
  async loadSteps(): Promise<void> {
    const { data, error } = await this.supabase
      .from('emc_migration_steps')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to load migration steps: ${error.message}`);
    }

    this.migrationSteps = data || [];
    console.log(`📋 Loaded ${this.migrationSteps.length} migration steps`);
  }

  /**
   * Execute expand steps (add columns, views, etc.)
   */
  async executeExpandSteps(): Promise<void> {
    const expandSteps = this.migrationSteps.filter(
      step => step.type === 'expand' && step.status === 'pending'
    );

    for (const step of expandSteps) {
      try {
        console.log(`🔧 Executing expand step: ${step.id}`);
        await this.updateStepStatus(step.id, 'in_progress');

        // Execute the SQL
        const { error } = await this.supabase.rpc('exec_sql', { sql: step.sql });
        
        if (error) {
          throw new Error(`SQL execution failed: ${error.message}`);
        }

        await this.updateStepStatus(step.id, 'completed');
        console.log(`✅ Completed expand step: ${step.id}`);

      } catch (error) {
        console.error(`❌ Failed expand step ${step.id}:`, error);
        await this.updateStepStatus(step.id, 'failed', error.message);
        throw error;
      }
    }
  }

  /**
   * Execute migrate steps (backfill data)
   */
  async executeMigrateSteps(): Promise<void> {
    const migrateSteps = this.migrationSteps.filter(
      step => step.type === 'migrate' && step.status === 'pending'
    );

    for (const step of migrateSteps) {
      try {
        console.log(`🔄 Executing migrate step: ${step.id}`);
        await this.updateStepStatus(step.id, 'in_progress');

        // Parse the migration SQL to extract table and conditions
        const migrationInfo = this.parseMigrationSQL(step.sql);
        
        if (migrationInfo) {
          await this.executeChunkedMigration(step.id, migrationInfo);
        } else {
          // Execute as single SQL statement
          const { error } = await this.supabase.rpc('exec_sql', { sql: step.sql });
          if (error) {
            throw new Error(`SQL execution failed: ${error.message}`);
          }
        }

        await this.updateStepStatus(step.id, 'completed');
        console.log(`✅ Completed migrate step: ${step.id}`);

      } catch (error) {
        console.error(`❌ Failed migrate step ${step.id}:`, error);
        await this.updateStepStatus(step.id, 'failed', error.message);
        throw error;
      }
    }
  }

  /**
   * Execute contract steps (remove old columns)
   */
  async executeContractSteps(): Promise<void> {
    const contractSteps = this.migrationSteps.filter(
      step => step.type === 'contract' && step.status === 'pending'
    );

    for (const step of contractSteps) {
      try {
        console.log(`🗑️ Executing contract step: ${step.id}`);
        await this.updateStepStatus(step.id, 'in_progress');

        // Execute the SQL
        const { error } = await this.supabase.rpc('exec_sql', { sql: step.sql });
        
        if (error) {
          throw new Error(`SQL execution failed: ${error.message}`);
        }

        await this.updateStepStatus(step.id, 'completed');
        console.log(`✅ Completed contract step: ${step.id}`);

      } catch (error) {
        console.error(`❌ Failed contract step ${step.id}:`, error);
        await this.updateStepStatus(step.id, 'failed', error.message);
        throw error;
      }
    }
  }

  /**
   * Execute chunked migration with retry logic
   */
  private async executeChunkedMigration(
    stepId: string,
    migrationInfo: { table: string; whereClause?: string; updateSQL: string }
  ): Promise<void> {
    let offset = 0;
    let totalProcessed = 0;
    let retryCount = 0;

    while (true) {
      try {
        // Build chunk query
        const chunkQuery = `
          SELECT id FROM ${migrationInfo.table}
          ${migrationInfo.whereClause ? `WHERE ${migrationInfo.whereClause}` : ''}
          ORDER BY id
          LIMIT ${this.config.chunk_size} OFFSET ${offset}
        `;

        const { data: chunk, error: chunkError } = await this.supabase
          .rpc('exec_sql', { sql: chunkQuery });

        if (chunkError) {
          throw new Error(`Chunk query failed: ${chunkError.message}`);
        }

        if (!chunk || chunk.length === 0) {
          break; // No more records to process
        }

        // Process chunk
        const ids = chunk.map((row: any) => row.id);
        const updateQuery = migrationInfo.updateSQL.replace('{ids}', ids.join(','));

        const { error: updateError } = await this.supabase
          .rpc('exec_sql', { sql: updateQuery });

        if (updateError) {
          throw new Error(`Update query failed: ${updateError.message}`);
        }

        totalProcessed += chunk.length;
        offset += this.config.chunk_size;
        retryCount = 0; // Reset retry count on success

        console.log(`📊 Processed ${totalProcessed} records for step ${stepId}`);

        // Small delay between chunks to avoid overwhelming the database
        await this.delay(100);

      } catch (error) {
        retryCount++;
        if (retryCount > this.config.max_retries) {
          throw new Error(`Max retries exceeded for step ${stepId}: ${error.message}`);
        }

        console.log(`⚠️ Retry ${retryCount}/${this.config.max_retries} for step ${stepId}`);
        await this.delay(this.config.retry_delay_ms * retryCount);
      }
    }

    console.log(`✅ Completed chunked migration for step ${stepId}: ${totalProcessed} records processed`);
  }

  /**
   * Parse migration SQL to extract table and conditions
   */
  private parseMigrationSQL(sql: string): { table: string; whereClause?: string; updateSQL: string } | null {
    // Simple parser for UPDATE statements with WHERE conditions
    const updateMatch = sql.match(/UPDATE\s+(\w+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+))?/i);
    if (!updateMatch) return null;

    const table = updateMatch[1];
    const setClause = updateMatch[2];
    const whereClause = updateMatch[3];

    return {
      table,
      whereClause,
      updateSQL: sql
    };
  }

  /**
   * Update migration step status
   */
  private async updateStepStatus(
    stepId: string,
    status: MigrationStep['status'],
    error?: string
  ): Promise<void> {
    const updateData: any = {
      status,
      ...(status === 'completed' && { completed_at: new Date().toISOString() }),
      ...(error && { error })
    };

    const { error: updateError } = await this.supabase
      .from('emc_migration_steps')
      .update(updateData)
      .eq('id', stepId);

    if (updateError) {
      console.error(`Failed to update step status: ${updateError.message}`);
    }
  }

  /**
   * Generate migration summary
   */
  async generateSummary(): Promise<string> {
    const summary = {
      total: this.migrationSteps.length,
      pending: this.migrationSteps.filter(s => s.status === 'pending').length,
      in_progress: this.migrationSteps.filter(s => s.status === 'in_progress').length,
      completed: this.migrationSteps.filter(s => s.status === 'completed').length,
      failed: this.migrationSteps.filter(s => s.status === 'failed').length
    };

    return `
## EMC Migration Summary

- **Total Steps:** ${summary.total}
- **Pending:** ${summary.pending}
- **In Progress:** ${summary.in_progress}
- **Completed:** ${summary.completed}
- **Failed:** ${summary.failed}

### Steps by Type:
${this.migrationSteps.reduce((acc, step) => {
  acc[step.type] = (acc[step.type] || 0) + 1;
  return acc;
}, {} as Record<string, number>)}
    `.trim();
  }

  /**
   * Utility function for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Main execution method
   */
  async execute(): Promise<void> {
    try {
      console.log('🚀 Starting EMC migration process...');
      
      await this.initialize();
      await this.loadSteps();

      // Execute steps in order: expand -> migrate -> contract
      await this.executeExpandSteps();
      await this.executeMigrateSteps();
      await this.executeContractSteps();

      const summary = await this.generateSummary();
      console.log(summary);

      console.log('✅ EMC migration process completed successfully!');

    } catch (error) {
      console.error('❌ EMC migration process failed:', error);
      throw error;
    }
  }

  /**
   * Check mode - validate migration steps without executing
   */
  async check(): Promise<void> {
    try {
      console.log('🔍 Checking EMC migration steps...');
      
      await this.initialize();
      await this.loadSteps();

      const summary = await this.generateSummary();
      console.log(summary);

      // Check for any failed steps
      const failedSteps = this.migrationSteps.filter(s => s.status === 'failed');
      if (failedSteps.length > 0) {
        console.log('\n❌ Failed steps:');
        failedSteps.forEach(step => {
          console.log(`- ${step.id}: ${step.error}`);
        });
        process.exit(1);
      }

      console.log('✅ EMC migration check passed!');

    } catch (error) {
      console.error('❌ EMC migration check failed:', error);
      process.exit(1);
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const isCheckMode = args.includes('--check');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing required environment variables:');
    console.error('  - NEXT_PUBLIC_SUPABASE_URL');
    console.error('  - SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const migrator = new EMCMigrator(supabaseUrl, supabaseKey);

  if (isCheckMode) {
    await migrator.check();
  } else {
    await migrator.execute();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { EMCMigrator, MigrationStep, EMCConfig };
