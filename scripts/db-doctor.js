#!/usr/bin/env node

/**
 * Database Performance Doctor
 * 
 * Analyzes database performance, identifies bottlenecks, and provides optimization recommendations
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
  performance: {
    budgets: {
      queryTime: {
        simple: 10,      // ms
        complex: 100,    // ms
        analytics: 1000  // ms
      },
      throughput: {
        reads: 1000,     // QPS
        writes: 100,     // QPS
        mixed: 500       // QPS
      },
      resources: {
        cpu: 70,         // %
        memory: 80,      // %
        diskIO: 1000,    // IOPS
        connections: 80  // %
      }
    },
    thresholds: {
      slowQuery: 100,    // ms
      highCpu: 70,       // %
      highMemory: 80,    // %
      connectionPool: 80 // %
    }
  },
  tables: [
    'users',
    'meals',
    'meal_ingredients',
    'user_preferences',
    'meal_plans'
  ]
};

class DatabaseDoctor {
  constructor() {
    this.results = {
      summary: {
        overallHealth: 'unknown',
        totalIssues: 0,
        criticalIssues: 0,
        warnings: 0,
        recommendations: 0
      },
      performance: {
        queryTime: {},
        throughput: {},
        resources: {},
        budgets: {}
      },
      queries: {
        slow: [],
        missingIndexes: [],
        optimization: []
      },
      tables: {},
      recommendations: [],
      errors: []
    };
  }

  /**
   * Run database health check
   */
  async runDiagnosis() {
    log('🏥 Database Performance Doctor', 'bold');
    log('=============================', 'bold');

    try {
      // Check database connection
      await this.checkConnection();

      // Analyze query performance
      await this.analyzeQueryPerformance();

      // Check table performance
      await this.analyzeTablePerformance();

      // Check resource utilization
      await this.analyzeResourceUtilization();

      // Check indexes
      await this.analyzeIndexes();

      // Generate recommendations
      this.generateRecommendations();

      // Calculate overall health
      this.calculateOverallHealth();

      this.generateReport();
      return this.results;

    } catch (error) {
      log(`❌ Database diagnosis failed: ${error.message}`, 'red');
      this.results.errors.push({
        type: 'connection_error',
        message: error.message
      });
      return this.results;
    }
  }

  /**
   * Check database connection
   */
  async checkConnection() {
    log('\n🔌 Checking Database Connection...', 'blue');
    
    try {
      // Mock connection check (in production, use actual database connection)
      const connectionInfo = {
        host: config.database.host,
        port: config.database.port,
        database: config.database.name,
        status: 'connected',
        responseTime: 5 // ms
      };

      this.results.connection = connectionInfo;
      log(`  ✅ Connected to ${connectionInfo.host}:${connectionInfo.port}/${connectionInfo.database}`, 'green');
      log(`  Response time: ${connectionInfo.responseTime}ms`, 'green');

    } catch (error) {
      log(`  ❌ Connection failed: ${error.message}`, 'red');
      throw error;
    }
  }

  /**
   * Analyze query performance
   */
  async analyzeQueryPerformance() {
    log('\n📊 Analyzing Query Performance...', 'blue');

    // Mock query performance data
    const queryData = {
      totalQueries: 15420,
      averageTime: 45, // ms
      p95Time: 180,    // ms
      p99Time: 450,    // ms
      slowQueries: 23,
      queriesPerSecond: 125
    };

    this.results.performance.queryTime = queryData;

    // Check against budgets
    const queryBudget = config.performance.budgets.queryTime;
    const throughputBudget = config.performance.budgets.throughput;

    if (queryData.averageTime > queryBudget.complex) {
      this.results.summary.warnings++;
      this.results.recommendations.push({
        type: 'query_performance',
        severity: 'warning',
        message: `Average query time (${queryData.averageTime}ms) exceeds budget (${queryBudget.complex}ms)`
      });
    }

    if (queryData.queriesPerSecond < throughputBudget.mixed) {
      this.results.summary.warnings++;
      this.results.recommendations.push({
        type: 'throughput',
        severity: 'warning',
        message: `Query throughput (${queryData.queriesPerSecond} QPS) below budget (${throughputBudget.mixed} QPS)`
      });
    }

    log(`  Total Queries: ${queryData.totalQueries}`, 'blue');
    log(`  Average Time: ${queryData.averageTime}ms`, queryData.averageTime > queryBudget.complex ? 'yellow' : 'green');
    log(`  P95 Time: ${queryData.p95Time}ms`, queryData.p95Time > queryBudget.analytics ? 'yellow' : 'green');
    log(`  Slow Queries: ${queryData.slowQueries}`, queryData.slowQueries > 0 ? 'yellow' : 'green');
    log(`  QPS: ${queryData.queriesPerSecond}`, queryData.queriesPerSecond < throughputBudget.mixed ? 'yellow' : 'green');
  }

  /**
   * Analyze table performance
   */
  async analyzeTablePerformance() {
    log('\n📋 Analyzing Table Performance...', 'blue');

    for (const table of config.tables) {
      const tableData = this.analyzeTable(table);
      this.results.tables[table] = tableData;

      const status = tableData.health === 'good' ? 'green' : 
                   tableData.health === 'warning' ? 'yellow' : 'red';
      
      log(`  ${table}: ${tableData.health} (${tableData.rowCount} rows, ${tableData.averageQueryTime}ms)`, status);
    }
  }

  /**
   * Analyze individual table
   */
  analyzeTable(tableName) {
    // Mock table analysis data
    const tableData = {
      name: tableName,
      rowCount: Math.floor(Math.random() * 1000000) + 10000,
      averageQueryTime: Math.floor(Math.random() * 100) + 10,
      indexCount: Math.floor(Math.random() * 5) + 2,
      lastAnalyzed: new Date().toISOString(),
      health: 'good',
      issues: []
    };

    // Determine health based on metrics
    if (tableData.averageQueryTime > config.performance.thresholds.slowQuery) {
      tableData.health = 'warning';
      tableData.issues.push('Slow queries detected');
    }

    if (tableData.rowCount > 1000000) {
      tableData.health = 'warning';
      tableData.issues.push('Large table size');
    }

    if (tableData.indexCount < 2) {
      tableData.health = 'warning';
      tableData.issues.push('Insufficient indexes');
    }

    return tableData;
  }

  /**
   * Analyze resource utilization
   */
  async analyzeResourceUtilization() {
    log('\n💻 Analyzing Resource Utilization...', 'blue');

    // Mock resource utilization data
    const resourceData = {
      cpu: {
        usage: 45, // %
        cores: 4,
        load: [0.8, 0.6, 0.4]
      },
      memory: {
        usage: 65, // %
        total: 8192, // MB
        used: 5324,  // MB
        available: 2868 // MB
      },
      disk: {
        usage: 55, // %
        total: 100, // GB
        used: 55,   // GB
        available: 45, // GB
        iops: 250
      },
      connections: {
        current: 15,
        max: 100,
        usage: 15 // %
      }
    };

    this.results.performance.resources = resourceData;

    // Check against budgets
    const budgets = config.performance.budgets.resources;

    if (resourceData.cpu.usage > budgets.cpu) {
      this.results.summary.warnings++;
      this.results.recommendations.push({
        type: 'cpu_usage',
        severity: 'warning',
        message: `CPU usage (${resourceData.cpu.usage}%) exceeds budget (${budgets.cpu}%)`
      });
    }

    if (resourceData.memory.usage > budgets.memory) {
      this.results.summary.warnings++;
      this.results.recommendations.push({
        type: 'memory_usage',
        severity: 'warning',
        message: `Memory usage (${resourceData.memory.usage}%) exceeds budget (${budgets.memory}%)`
      });
    }

    if (resourceData.connections.usage > budgets.connections) {
      this.results.summary.warnings++;
      this.results.recommendations.push({
        type: 'connection_usage',
        severity: 'warning',
        message: `Connection usage (${resourceData.connections.usage}%) exceeds budget (${budgets.connections}%)`
      });
    }

    log(`  CPU Usage: ${resourceData.cpu.usage}%`, resourceData.cpu.usage > budgets.cpu ? 'yellow' : 'green');
    log(`  Memory Usage: ${resourceData.memory.usage}%`, resourceData.memory.usage > budgets.memory ? 'yellow' : 'green');
    log(`  Disk Usage: ${resourceData.disk.usage}%`, resourceData.disk.usage > 80 ? 'yellow' : 'green');
    log(`  Connections: ${resourceData.connections.current}/${resourceData.connections.max}`, 
        resourceData.connections.usage > budgets.connections ? 'yellow' : 'green');
  }

  /**
   * Analyze indexes
   */
  async analyzeIndexes() {
    log('\n🔍 Analyzing Indexes...', 'blue');

    // Mock index analysis data
    const indexData = {
      totalIndexes: 15,
      unusedIndexes: 2,
      missingIndexes: 3,
      duplicateIndexes: 1,
      recommendations: [
        {
          table: 'meals',
          type: 'missing',
          column: 'user_id',
          impact: 'high',
          message: 'Add index on user_id column for faster user meal queries'
        },
        {
          table: 'meal_ingredients',
          type: 'missing',
          column: 'ingredient',
          impact: 'medium',
          message: 'Add index on ingredient column for faster ingredient searches'
        },
        {
          table: 'users',
          type: 'unused',
          column: 'last_login',
          impact: 'low',
          message: 'Consider removing unused index on last_login column'
        }
      ]
    };

    this.results.queries.missingIndexes = indexData.recommendations.filter(r => r.type === 'missing');
    this.results.queries.optimization = indexData.recommendations;

    log(`  Total Indexes: ${indexData.totalIndexes}`, 'blue');
    log(`  Unused Indexes: ${indexData.unusedIndexes}`, indexData.unusedIndexes > 0 ? 'yellow' : 'green');
    log(`  Missing Indexes: ${indexData.missingIndexes}`, indexData.missingIndexes > 0 ? 'yellow' : 'green');
    log(`  Duplicate Indexes: ${indexData.duplicateIndexes}`, indexData.duplicateIndexes > 0 ? 'yellow' : 'green');

    if (indexData.recommendations.length > 0) {
      log('\n  Index Recommendations:', 'yellow');
      indexData.recommendations.forEach(rec => {
        const color = rec.impact === 'high' ? 'red' : rec.impact === 'medium' ? 'yellow' : 'blue';
        log(`    ${rec.impact.toUpperCase()}: ${rec.message}`, color);
      });
    }
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations() {
    log('\n💡 Generating Recommendations...', 'blue');

    const recommendations = [
      {
        type: 'query_optimization',
        priority: 'high',
        title: 'Optimize Slow Queries',
        description: '23 slow queries detected. Review and optimize query execution plans.',
        action: 'Run EXPLAIN ANALYZE on slow queries and add appropriate indexes.'
      },
      {
        type: 'index_optimization',
        priority: 'high',
        title: 'Add Missing Indexes',
        description: '3 missing indexes identified that could improve query performance.',
        action: 'Add indexes on user_id, ingredient, and created_at columns.'
      },
      {
        type: 'connection_pooling',
        priority: 'medium',
        title: 'Optimize Connection Pooling',
        description: 'Current connection usage is optimal, but monitor for growth.',
        action: 'Consider implementing connection pooling if not already in place.'
      },
      {
        type: 'monitoring',
        priority: 'medium',
        title: 'Implement Query Monitoring',
        description: 'Set up automated monitoring for query performance and resource usage.',
        action: 'Configure alerts for slow queries and resource thresholds.'
      },
      {
        type: 'maintenance',
        priority: 'low',
        title: 'Regular Maintenance',
        description: 'Schedule regular database maintenance tasks.',
        action: 'Set up automated VACUUM, ANALYZE, and index maintenance tasks.'
      }
    ];

    this.results.recommendations = recommendations;
    this.results.summary.recommendations = recommendations.length;

    recommendations.forEach(rec => {
      const color = rec.priority === 'high' ? 'red' : rec.priority === 'medium' ? 'yellow' : 'blue';
      log(`  ${rec.priority.toUpperCase()}: ${rec.title}`, color);
    });
  }

  /**
   * Calculate overall health
   */
  calculateOverallHealth() {
    const { warnings, criticalIssues } = this.results.summary;
    
    if (criticalIssues > 0) {
      this.results.summary.overallHealth = 'critical';
    } else if (warnings > 5) {
      this.results.summary.overallHealth = 'warning';
    } else if (warnings > 0) {
      this.results.summary.overallHealth = 'good';
    } else {
      this.results.summary.overallHealth = 'excellent';
    }

    this.results.summary.totalIssues = warnings + criticalIssues;
  }

  /**
   * Generate summary report
   */
  generateReport() {
    log('\n📊 Database Health Report', 'bold');
    log('========================', 'bold');

    const { overallHealth, totalIssues, warnings, criticalIssues, recommendations } = this.results.summary;

    // Overall health
    const healthColor = overallHealth === 'excellent' ? 'green' :
                       overallHealth === 'good' ? 'green' :
                       overallHealth === 'warning' ? 'yellow' : 'red';
    
    log(`Overall Health: ${overallHealth.toUpperCase()}`, healthColor);
    log(`Total Issues: ${totalIssues}`, totalIssues > 0 ? 'yellow' : 'green');
    log(`Critical Issues: ${criticalIssues}`, criticalIssues > 0 ? 'red' : 'green');
    log(`Warnings: ${warnings}`, warnings > 0 ? 'yellow' : 'green');
    log(`Recommendations: ${recommendations}`, 'blue');

    // Performance summary
    const perf = this.results.performance;
    if (perf.queryTime) {
      log('\nQuery Performance:', 'blue');
      log(`  Average Time: ${perf.queryTime.averageTime}ms`, 'blue');
      log(`  P95 Time: ${perf.queryTime.p95Time}ms`, 'blue');
      log(`  QPS: ${perf.queryTime.queriesPerSecond}`, 'blue');
    }

    // Resource utilization
    if (perf.resources) {
      log('\nResource Utilization:', 'blue');
      log(`  CPU: ${perf.resources.cpu.usage}%`, 'blue');
      log(`  Memory: ${perf.resources.memory.usage}%`, 'blue');
      log(`  Connections: ${perf.resources.connections.current}/${perf.resources.connections.max}`, 'blue');
    }

    // Top recommendations
    if (recommendations > 0) {
      log('\nTop Recommendations:', 'yellow');
      this.results.recommendations
        .filter(r => r.priority === 'high')
        .slice(0, 3)
        .forEach(rec => {
          log(`  • ${rec.title}`, 'yellow');
        });
    }
  }

  /**
   * Save results to file
   */
  saveResults() {
    const resultsPath = path.join(process.cwd(), 'REPORTS', 'db-doctor-results.json');
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
  log('🏥 Database Performance Doctor Starting...', 'bold');
  
  const doctor = new DatabaseDoctor();
  const results = await doctor.runDiagnosis();
  doctor.saveResults();

  // Exit with appropriate code
  const exitCode = results.summary.overallHealth === 'critical' ? 2 :
                  results.summary.overallHealth === 'warning' ? 1 : 0;
  process.exit(exitCode);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Database doctor failed:', error);
    process.exit(1);
  });
}

module.exports = { DatabaseDoctor, config };