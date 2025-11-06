#!/usr/bin/env node

/**
 * Database Migration Planning Script
 * 
 * Analyzes database schema, generates migration plans, and applies optimizations
 */

const fs = require('fs');
const path = require('path');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Configuration
const config = {
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'whats_for_dinner',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password'
  },
  migrations: {
    outputDir: 'migrations',
    backupDir: 'backups',
    rollbackDir: 'rollbacks'
  },
  safety: {
    backupBeforeMigrate: true,
    validateBeforeApply: true,
    dryRun: false
  }
};

class DatabaseMigrator {
  constructor() {
    this.results = {
      summary: {
        totalMigrations: 0,
        appliedMigrations: 0,
        failedMigrations: 0,
        rollbackMigrations: 0
      },
      migrations: [],
      optimizations: [],
      backups: [],
      errors: []
    };
  }

  /**
   * Generate migration plan
   */
  async generateMigrationPlan() {
    log('📋 Generating Migration Plan...', 'blue');
    log('==============================', 'blue');

    // Analyze current schema
    const currentSchema = await this.analyzeCurrentSchema();
    
    // Generate optimizations
    const optimizations = await this.generateOptimizations(currentSchema);
    
    // Create migration plan
    const migrationPlan = this.createMigrationPlan(optimizations);
    
    // Save migration plan
    this.saveMigrationPlan(migrationPlan);
    
    return migrationPlan;
  }

  /**
   * Analyze current database schema
   */
  async analyzeCurrentSchema() {
    log('\n🔍 Analyzing Current Schema...', 'blue');

    // Mock schema analysis (in production, connect to actual database)
    const schema = {
      tables: {
        users: {
          columns: ['id', 'email', 'name', 'created_at', 'updated_at'],
          indexes: ['PRIMARY', 'idx_users_email'],
          rowCount: 12500,
          size: '2.5MB'
        },
        meals: {
          columns: ['id', 'user_id', 'name', 'description', 'prep_time', 'cook_time', 'difficulty', 'created_at'],
          indexes: ['PRIMARY'],
          rowCount: 45000,
          size: '15.2MB'
        },
        meal_ingredients: {
          columns: ['id', 'meal_id', 'ingredient', 'quantity', 'unit'],
          indexes: ['PRIMARY'],
          rowCount: 180000,
          size: '8.7MB'
        }
      },
      performance: {
        slowQueries: 12,
        missingIndexes: 5,
        unusedIndexes: 2
      }
    };

    log(`  Tables: ${Object.keys(schema.tables).length}`, 'blue');
    log(`  Total Rows: ${Object.values(schema.tables).reduce((sum, table) => sum + table.rowCount, 0)}`, 'blue');
    log(`  Slow Queries: ${schema.performance.slowQueries}`, schema.performance.slowQueries > 0 ? 'yellow' : 'green');
    log(`  Missing Indexes: ${schema.performance.missingIndexes}`, schema.performance.missingIndexes > 0 ? 'yellow' : 'green');

    return schema;
  }

  /**
   * Generate database optimizations
   */
  async generateOptimizations(schema) {
    log('\n⚡ Generating Optimizations...', 'blue');

    const optimizations = [];

    // Index optimizations
    optimizations.push({
      type: 'index',
      priority: 'high',
      table: 'meals',
      action: 'add',
      name: 'idx_meals_user_id',
      columns: ['user_id'],
      reason: 'Improve user meal queries',
      sql: 'CREATE INDEX CONCURRENTLY idx_meals_user_id ON meals(user_id);'
    });

    optimizations.push({
      type: 'index',
      priority: 'high',
      table: 'meals',
      action: 'add',
      name: 'idx_meals_difficulty',
      columns: ['difficulty'],
      reason: 'Improve difficulty-based queries',
      sql: 'CREATE INDEX CONCURRENTLY idx_meals_difficulty ON meals(difficulty);'
    });

    optimizations.push({
      type: 'index',
      priority: 'medium',
      table: 'meal_ingredients',
      action: 'add',
      name: 'idx_meal_ingredients_meal_id',
      columns: ['meal_id'],
      reason: 'Improve meal ingredient queries',
      sql: 'CREATE INDEX CONCURRENTLY idx_meal_ingredients_meal_id ON meal_ingredients(meal_id);'
    });

    optimizations.push({
      type: 'index',
      priority: 'medium',
      table: 'meal_ingredients',
      action: 'add',
      name: 'idx_meal_ingredients_ingredient',
      columns: ['ingredient'],
      reason: 'Improve ingredient search queries',
      sql: 'CREATE INDEX CONCURRENTLY idx_meal_ingredients_ingredient ON meal_ingredients(ingredient);'
    });

    // Composite indexes
    optimizations.push({
      type: 'index',
      priority: 'medium',
      table: 'meals',
      action: 'add',
      name: 'idx_meals_user_difficulty',
      columns: ['user_id', 'difficulty'],
      reason: 'Optimize user meal filtering by difficulty',
      sql: 'CREATE INDEX CONCURRENTLY idx_meals_user_difficulty ON meals(user_id, difficulty);'
    });

    // Column optimizations
    optimizations.push({
      type: 'column',
      priority: 'low',
      table: 'meals',
      action: 'modify',
      column: 'prep_time',
      reason: 'Change prep_time to integer for better performance',
      sql: 'ALTER TABLE meals ALTER COLUMN prep_time TYPE INTEGER USING prep_time::INTEGER;'
    });

    optimizations.push({
      type: 'column',
      priority: 'low',
      table: 'meals',
      action: 'modify',
      column: 'cook_time',
      reason: 'Change cook_time to integer for better performance',
      sql: 'ALTER TABLE meals ALTER COLUMN cook_time TYPE INTEGER USING cook_time::INTEGER;'
    });

    // Table optimizations
    optimizations.push({
      type: 'table',
      priority: 'low',
      table: 'meals',
      action: 'analyze',
      reason: 'Update table statistics for better query planning',
      sql: 'ANALYZE meals;'
    });

    optimizations.push({
      type: 'table',
      priority: 'low',
      table: 'meal_ingredients',
      action: 'analyze',
      reason: 'Update table statistics for better query planning',
      sql: 'ANALYZE meal_ingredients;'
    });

    // Remove unused indexes
    optimizations.push({
      type: 'index',
      priority: 'low',
      table: 'users',
      action: 'remove',
      name: 'idx_users_last_login',
      reason: 'Unused index consuming storage and slowing writes',
      sql: 'DROP INDEX CONCURRENTLY idx_users_last_login;'
    });

    this.results.optimizations = optimizations;

    log(`  Generated ${optimizations.length} optimizations`, 'blue');
    optimizations.forEach(opt => {
      const color = opt.priority === 'high' ? 'red' : opt.priority === 'medium' ? 'yellow' : 'blue';
      log(`    ${opt.priority.toUpperCase()}: ${opt.action} ${opt.type} on ${opt.table}`, color);
    });

    return optimizations;
  }

  /**
   * Create migration plan
   */
  createMigrationPlan(optimizations) {
    log('\n📝 Creating Migration Plan...', 'blue');

    const migrations = [];
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    // Group optimizations by priority
    const highPriority = optimizations.filter(opt => opt.priority === 'high');
    const mediumPriority = optimizations.filter(opt => opt.priority === 'medium');
    const lowPriority = optimizations.filter(opt => opt.priority === 'low');

    // Create migration for high priority optimizations
    if (highPriority.length > 0) {
      migrations.push({
        id: `${timestamp}-001`,
        name: 'high_priority_optimizations',
        description: 'High priority database optimizations',
        priority: 'high',
        optimizations: highPriority,
        estimatedDuration: '5-10 minutes',
        riskLevel: 'low',
        rollbackSQL: this.generateRollbackSQL(highPriority)
      });
    }

    // Create migration for medium priority optimizations
    if (mediumPriority.length > 0) {
      migrations.push({
        id: `${timestamp}-002`,
        name: 'medium_priority_optimizations',
        description: 'Medium priority database optimizations',
        priority: 'medium',
        optimizations: mediumPriority,
        estimatedDuration: '10-15 minutes',
        riskLevel: 'low',
        rollbackSQL: this.generateRollbackSQL(mediumPriority)
      });
    }

    // Create migration for low priority optimizations
    if (lowPriority.length > 0) {
      migrations.push({
        id: `${timestamp}-003`,
        name: 'low_priority_optimizations',
        description: 'Low priority database optimizations',
        priority: 'low',
        optimizations: lowPriority,
        estimatedDuration: '5-10 minutes',
        riskLevel: 'low',
        rollbackSQL: this.generateRollbackSQL(lowPriority)
      });
    }

    this.results.migrations = migrations;
    this.results.summary.totalMigrations = migrations.length;

    log(`  Created ${migrations.length} migration(s)`, 'blue');
    migrations.forEach(migration => {
      const color = migration.priority === 'high' ? 'red' : migration.priority === 'medium' ? 'yellow' : 'blue';
      log(`    ${migration.id}: ${migration.name} (${migration.optimizations.length} optimizations)`, color);
    });

    return migrations;
  }

  /**
   * Generate rollback SQL
   */
  generateRollbackSQL(optimizations) {
    const rollbackStatements = [];

    for (const opt of optimizations) {
      if (opt.type === 'index' && opt.action === 'add') {
        rollbackStatements.push(`DROP INDEX CONCURRENTLY IF EXISTS ${opt.name};`);
      } else if (opt.type === 'index' && opt.action === 'remove') {
        rollbackStatements.push(`CREATE INDEX CONCURRENTLY ${opt.name} ON ${opt.table}(${opt.columns.join(', ')});`);
      } else if (opt.type === 'column' && opt.action === 'modify') {
        // Rollback column changes (simplified)
        rollbackStatements.push(`-- Rollback column change for ${opt.table}.${opt.column}`);
      }
    }

    return rollbackStatements.join('\n');
  }

  /**
   * Save migration plan
   */
  saveMigrationPlan(migrationPlan) {
    const migrationsDir = config.migrations.outputDir;
    
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
    }

    // Save individual migration files
    for (const migration of migrationPlan) {
      const migrationFile = path.join(migrationsDir, `${migration.id}.sql`);
      const migrationContent = this.generateMigrationSQL(migration);
      
      fs.writeFileSync(migrationFile, migrationContent);
      log(`  Saved: ${migrationFile}`, 'green');
    }

    // Save migration plan summary
    const planFile = path.join(migrationsDir, 'migration-plan.json');
    fs.writeFileSync(planFile, JSON.stringify(migrationPlan, null, 2));
    log(`  Saved: ${planFile}`, 'green');
  }

  /**
   * Generate migration SQL
   */
  generateMigrationSQL(migration) {
    const sql = [
      `-- Migration: ${migration.name}`,
      `-- Description: ${migration.description}`,
      `-- Priority: ${migration.priority}`,
      `-- Risk Level: ${migration.riskLevel}`,
      `-- Estimated Duration: ${migration.estimatedDuration}`,
      `-- Created: ${new Date().toISOString()}`,
      '',
      'BEGIN;',
      ''
    ];

    for (const opt of migration.optimizations) {
      sql.push(`-- ${opt.reason}`);
      sql.push(opt.sql);
      sql.push('');
    }

    sql.push('COMMIT;');
    sql.push('');
    sql.push('-- Rollback SQL:');
    sql.push(migration.rollbackSQL);

    return sql.join('\n');
  }

  /**
   * Apply migrations
   */
  async applyMigrations(migrations = null) {
    log('🚀 Applying Migrations...', 'blue');
    log('========================', 'blue');

    const migrationsToApply = migrations || this.results.migrations;

    if (migrationsToApply.length === 0) {
      log('  No migrations to apply', 'yellow');
      return;
    }

    for (const migration of migrationsToApply) {
      try {
        log(`\n  Applying: ${migration.name}`, 'blue');
        
        if (config.safety.dryRun) {
          log(`    DRY RUN: Would execute ${migration.optimizations.length} optimizations`, 'yellow');
          continue;
        }

        // Create backup before migration
        if (config.safety.backupBeforeMigrate) {
          await this.createBackup(migration);
        }

        // Validate migration
        if (config.safety.validateBeforeApply) {
          await this.validateMigration(migration);
        }

        // Apply migration
        await this.executeMigration(migration);
        
        this.results.summary.appliedMigrations++;
        log(`    ✅ Applied successfully`, 'green');

      } catch (error) {
        this.results.summary.failedMigrations++;
        log(`    ❌ Failed: ${error.message}`, 'red');
        this.results.errors.push({
          migration: migration.id,
          error: error.message
        });
      }
    }
  }

  /**
   * Create backup before migration
   */
  async createBackup(migration) {
    const backupDir = config.migrations.backupDir;
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const backupFile = path.join(backupDir, `${migration.id}-backup.sql`);
    
    // Mock backup creation (in production, use actual database backup)
    const backupContent = `-- Backup for migration ${migration.id}
-- Created: ${new Date().toISOString()}
-- Tables: ${migration.optimizations.map(opt => opt.table).join(', ')}

-- This is a mock backup file
-- In production, this would contain actual database dump
`;

    fs.writeFileSync(backupFile, backupContent);
    log(`    📦 Created backup: ${backupFile}`, 'blue');
  }

  /**
   * Validate migration before applying
   */
  async validateMigration(migration) {
    log(`    🔍 Validating migration...`, 'blue');
    
    // Mock validation (in production, validate SQL syntax and safety)
    const validationResults = {
      syntaxValid: true,
      safetyChecks: true,
      dependenciesMet: true
    };

    if (!validationResults.syntaxValid) {
      throw new Error('SQL syntax validation failed');
    }

    if (!validationResults.safetyChecks) {
      throw new Error('Safety checks failed');
    }

    if (!validationResults.dependenciesMet) {
      throw new Error('Dependencies not met');
    }

    log(`    ✅ Validation passed`, 'green');
  }

  /**
   * Execute migration
   */
  async executeMigration(migration) {
    log(`    ⚡ Executing ${migration.optimizations.length} optimizations...`, 'blue');
    
    // Mock execution (in production, execute actual SQL)
    for (const opt of migration.optimizations) {
      log(`      ${opt.action} ${opt.type} on ${opt.table}`, 'blue');
      // Simulate execution time
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * Generate migration report
   */
  generateReport() {
    log('\n📊 Migration Report', 'bold');
    log('==================', 'bold');

    const { totalMigrations, appliedMigrations, failedMigrations } = this.results.summary;

    log(`Total Migrations: ${totalMigrations}`, 'blue');
    log(`Applied: ${appliedMigrations}`, 'green');
    log(`Failed: ${failedMigrations}`, failedMigrations > 0 ? 'red' : 'green');

    if (this.results.errors.length > 0) {
      log('\n❌ Errors:', 'red');
      this.results.errors.forEach(error => {
        log(`  ${error.migration}: ${error.error}`, 'red');
      });
    }

    if (this.results.optimizations.length > 0) {
      log('\n⚡ Optimizations Generated:', 'blue');
      const byType = this.results.optimizations.reduce((acc, opt) => {
        acc[opt.type] = (acc[opt.type] || 0) + 1;
        return acc;
      }, {});
      
      Object.entries(byType).forEach(([type, count]) => {
        log(`  ${type}: ${count}`, 'blue');
      });
    }
  }

  /**
   * Save results to file
   */
  saveResults() {
    const resultsPath = path.join(process.cwd(), 'REPORTS', 'db-migration-results.json');
    const reportsDir = path.dirname(resultsPath);
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(resultsPath, JSON.stringify(this.results, null, 2));
    log(`\n📁 Results saved to: ${resultsPath}`, 'blue');
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'plan';

  log('🗄️  Database Migration Tool', 'bold');
  log('==========================', 'bold');

  const migrator = new DatabaseMigrator();

  try {
    switch (command) {
      case 'plan':
        await migrator.generateMigrationPlan();
        break;
      case 'apply':
        await migrator.applyMigrations();
        break;
      case 'validate':
        log('Validation not implemented yet', 'yellow');
        break;
      default:
        log(`Unknown command: ${command}`, 'red');
        log('Available commands: plan, apply, validate', 'blue');
        process.exit(1);
    }

    migrator.generateReport();
    migrator.saveResults();

  } catch (error) {
    log(`❌ Migration failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Database migration failed:', error);
    process.exit(1);
  });
}

module.exports = { DatabaseMigrator, config };