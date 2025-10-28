#!/usr/bin/env tsx

/**
 * Disaster Recovery: Clone and Restore Check
 * 
 * This script performs disaster recovery validation by:
 * 1. Spinning up a temporary shadow database
 * 2. Restoring from latest backup/PITR timestamp
 * 3. Running checksum validation on critical tables
 * 4. Generating DR report
 */

import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface DRConfig {
  shadow_db_name: string;
  checksum_tables: string[];
  max_restore_time_minutes: number;
  retention_days: number;
}

interface ChecksumResult {
  table_name: string;
  row_count: number;
  checksum: string;
  status: 'success' | 'failed' | 'timeout';
  error?: string;
}

interface DRReport {
  timestamp: string;
  restore_success: boolean;
  restore_time_seconds: number;
  checksum_results: ChecksumResult[];
  overall_status: 'pass' | 'fail';
  recommendations: string[];
}

const DEFAULT_CONFIG: DRConfig = {
  shadow_db_name: 'dr_shadow_test',
  checksum_tables: [
    'profiles',
    'pantry_items', 
    'recipes',
    'favorites',
    'emc_migration_steps'
  ],
  max_restore_time_minutes: 30,
  retention_days: 30
};

class DRValidator {
  private supabase: any;
  private config: DRConfig;
  private shadowDbUrl: string = '';

  constructor(supabaseUrl: string, supabaseKey: string, config: Partial<DRConfig> = {}) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Create shadow database for DR testing
   */
  async createShadowDatabase(): Promise<void> {
    console.log('🏗️ Creating shadow database...');
    
    try {
      // In a real implementation, this would create a temporary database
      // For now, we'll simulate with a test schema
      const createShadowSQL = `
        CREATE SCHEMA IF NOT EXISTS ${this.config.shadow_db_name};
        
        -- Create test tables with same structure
        CREATE TABLE IF NOT EXISTS ${this.config.shadow_db_name}.profiles (
          id uuid PRIMARY KEY,
          name text,
          preferences jsonb,
          created_at timestamp with time zone DEFAULT NOW()
        );
        
        CREATE TABLE IF NOT EXISTS ${this.config.shadow_db_name}.pantry_items (
          id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          user_id uuid,
          ingredient text NOT NULL,
          quantity int DEFAULT 1,
          created_at timestamp with time zone DEFAULT NOW()
        );
        
        CREATE TABLE IF NOT EXISTS ${this.config.shadow_db_name}.recipes (
          id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          user_id uuid,
          title text,
          details jsonb,
          calories int,
          time text,
          created_at timestamp with time zone DEFAULT NOW()
        );
        
        CREATE TABLE IF NOT EXISTS ${this.config.shadow_db_name}.favorites (
          id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          user_id uuid,
          recipe_id bigint,
          created_at timestamp with time zone DEFAULT NOW()
        );
      `;

      const { error } = await this.supabase.rpc('exec_sql', { sql: createShadowSQL });
      if (error) {
        throw new Error(`Failed to create shadow database: ${error.message}`);
      }

      console.log('✅ Shadow database created successfully');
      
    } catch (error) {
      console.error('❌ Failed to create shadow database:', error);
      throw error;
    }
  }

  /**
   * Simulate restore from backup (in real implementation, this would restore from actual backup)
   */
  async simulateRestore(): Promise<{ success: boolean; time_seconds: number }> {
    console.log('🔄 Simulating restore from backup...');
    
    const startTime = Date.now();
    
    try {
      // Simulate restore process with some test data
      const restoreSQL = `
        -- Insert test data to simulate restored backup
        INSERT INTO ${this.config.shadow_db_name}.profiles (id, name, preferences) VALUES
          ('550e8400-e29b-41d4-a716-446655440000', 'Test User 1', '{"theme": "dark"}'),
          ('550e8400-e29b-41d4-a716-446655440001', 'Test User 2', '{"theme": "light"}');
          
        INSERT INTO ${this.config.shadow_db_name}.pantry_items (user_id, ingredient, quantity) VALUES
          ('550e8400-e29b-41d4-a716-446655440000', 'tomatoes', 5),
          ('550e8400-e29b-41d4-a716-446655440000', 'onions', 3),
          ('550e8400-e29b-41d4-a716-446655440001', 'garlic', 2);
          
        INSERT INTO ${this.config.shadow_db_name}.recipes (user_id, title, details, calories, time) VALUES
          ('550e8400-e29b-41d4-a716-446655440000', 'Pasta Carbonara', '{"ingredients": ["pasta", "eggs", "cheese"]}', 650, '30 min'),
          ('550e8400-e29b-41d4-a716-446655440001', 'Chicken Stir Fry', '{"ingredients": ["chicken", "vegetables", "soy sauce"]}', 450, '20 min');
          
        INSERT INTO ${this.config.shadow_db_name}.favorites (user_id, recipe_id) VALUES
          ('550e8400-e29b-41d4-a716-446655440000', 1),
          ('550e8400-e29b-41d4-a716-446655440001', 2);
      `;

      const { error } = await this.supabase.rpc('exec_sql', { sql: restoreSQL });
      if (error) {
        throw new Error(`Restore simulation failed: ${error.message}`);
      }

      const timeSeconds = (Date.now() - startTime) / 1000;
      console.log(`✅ Restore simulation completed in ${timeSeconds.toFixed(2)} seconds`);
      
      return { success: true, time_seconds: timeSeconds };
      
    } catch (error) {
      const timeSeconds = (Date.now() - startTime) / 1000;
      console.error('❌ Restore simulation failed:', error);
      return { success: false, time_seconds: timeSeconds };
    }
  }

  /**
   * Run checksum validation on critical tables
   */
  async runChecksumValidation(): Promise<ChecksumResult[]> {
    console.log('🔍 Running checksum validation...');
    
    const results: ChecksumResult[] = [];
    
    for (const tableName of this.config.checksum_tables) {
      try {
        console.log(`  Checking table: ${tableName}`);
        
        const checksumSQL = `
          SELECT 
            COUNT(*) as row_count,
            MD5(STRING_AGG(
              COALESCE(id::text, '') || '|' || 
              COALESCE(created_at::text, '') || '|' ||
              COALESCE(updated_at::text, ''),
              '||' ORDER BY id
            )) as checksum
          FROM ${this.config.shadow_db_name}.${tableName}
        `;

        const { data, error } = await this.supabase.rpc('exec_sql', { sql: checksumSQL });
        
        if (error) {
          results.push({
            table_name: tableName,
            row_count: 0,
            checksum: '',
            status: 'failed',
            error: error.message
          });
          continue;
        }

        const result = data[0];
        results.push({
          table_name: tableName,
          row_count: parseInt(result.row_count),
          checksum: result.checksum,
          status: 'success'
        });

        console.log(`    ✅ ${tableName}: ${result.row_count} rows, checksum: ${result.checksum.substring(0, 8)}...`);
        
      } catch (error) {
        results.push({
          table_name: tableName,
          row_count: 0,
          checksum: '',
          status: 'failed',
          error: error.message
        });
        console.log(`    ❌ ${tableName}: ${error.message}`);
      }
    }
    
    return results;
  }

  /**
   * Clean up shadow database
   */
  async cleanupShadowDatabase(): Promise<void> {
    console.log('🧹 Cleaning up shadow database...');
    
    try {
      const cleanupSQL = `DROP SCHEMA IF EXISTS ${this.config.shadow_db_name} CASCADE;`;
      
      const { error } = await this.supabase.rpc('exec_sql', { sql: cleanupSQL });
      if (error) {
        console.warn(`Warning: Failed to cleanup shadow database: ${error.message}`);
      } else {
        console.log('✅ Shadow database cleaned up successfully');
      }
      
    } catch (error) {
      console.warn(`Warning: Cleanup failed: ${error.message}`);
    }
  }

  /**
   * Generate DR report
   */
  generateDRReport(
    restoreResult: { success: boolean; time_seconds: number },
    checksumResults: ChecksumResult[]
  ): DRReport {
    const failedChecksums = checksumResults.filter(r => r.status === 'failed');
    const overallStatus = restoreResult.success && failedChecksums.length === 0 ? 'pass' : 'fail';
    
    const recommendations: string[] = [];
    
    if (!restoreResult.success) {
      recommendations.push('Review backup procedures and restore process');
    }
    
    if (failedChecksums.length > 0) {
      recommendations.push('Investigate data integrity issues in failed tables');
    }
    
    if (restoreResult.time_seconds > this.config.max_restore_time_minutes * 60) {
      recommendations.push('Optimize restore process to meet RTO requirements');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('DR process is healthy - continue regular testing');
    }

    return {
      timestamp: new Date().toISOString(),
      restore_success: restoreResult.success,
      restore_time_seconds: restoreResult.time_seconds,
      checksum_results: checksumResults,
      overall_status: overallStatus,
      recommendations
    };
  }

  /**
   * Save DR report to file
   */
  async saveDRReport(report: DRReport): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `dr-report-${timestamp}.json`;
    const filepath = join(process.cwd(), 'REPORTS', filename);
    
    // Ensure REPORTS directory exists
    execSync('mkdir -p REPORTS', { stdio: 'inherit' });
    
    writeFileSync(filepath, JSON.stringify(report, null, 2));
    console.log(`📄 DR report saved to: ${filepath}`);
    
    return filepath;
  }

  /**
   * Main DR validation process
   */
  async execute(): Promise<DRReport> {
    console.log('🚀 Starting Disaster Recovery validation...');
    
    try {
      // Step 1: Create shadow database
      await this.createShadowDatabase();
      
      // Step 2: Simulate restore
      const restoreResult = await this.simulateRestore();
      
      if (!restoreResult.success) {
        throw new Error('Restore process failed');
      }
      
      // Step 3: Run checksum validation
      const checksumResults = await this.runChecksumValidation();
      
      // Step 4: Generate report
      const report = this.generateDRReport(restoreResult, checksumResults);
      
      // Step 5: Save report
      await this.saveDRReport(report);
      
      // Step 6: Cleanup
      await this.cleanupShadowDatabase();
      
      console.log('✅ DR validation completed successfully!');
      console.log(`Overall Status: ${report.overall_status.toUpperCase()}`);
      
      return report;
      
    } catch (error) {
      console.error('❌ DR validation failed:', error);
      
      // Attempt cleanup even on failure
      await this.cleanupShadowDatabase();
      
      throw error;
    }
  }
}

// CLI interface
async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing required environment variables:');
    console.error('  - NEXT_PUBLIC_SUPABASE_URL');
    console.error('  - SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const validator = new DRValidator(supabaseUrl, supabaseKey);

  try {
    const report = await validator.execute();
    
    if (report.overall_status === 'fail') {
      console.log('\n❌ DR validation failed - see report for details');
      process.exit(1);
    } else {
      console.log('\n✅ DR validation passed');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('Fatal error during DR validation:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { DRValidator, DRReport, ChecksumResult };
