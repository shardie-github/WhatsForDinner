# Database Performance Guide

This guide covers database performance optimization, query profiling, and performance budgeting for What's For Dinner.

## Overview

Database performance optimization ensures fast, reliable data access through:
- **Query Profiling**: Identify slow queries and bottlenecks
- **Index Optimization**: Strategic index placement and management
- **Performance Budgets**: Set and enforce performance limits
- **Query Analysis**: Automated query performance monitoring
- **Migration Planning**: Safe database schema evolution

## Quick Start

### 1. Profile Database Queries

```bash
# Run database performance analysis
pnpm run db:doctor

# Profile specific queries
pnpm run db:profile --query "SELECT * FROM meals"

# Analyze query performance
pnpm run db:analyze --table meals
```

### 2. Check Performance Budgets

```bash
# Check performance budgets
pnpm run db:budget

# Validate query performance
pnpm run db:validate

# Generate performance report
pnpm run db:report
```

### 3. Optimize Queries

```bash
# Suggest query optimizations
pnpm run db:optimize

# Generate migration plan
pnpm run db:migrate --plan

# Apply optimizations
pnpm run db:migrate --apply
```

## Performance Budgets

### 1. Query Performance Limits

#### Response Time Budgets
- **Simple Queries**: < 10ms (SELECT by primary key)
- **Complex Queries**: < 100ms (JOINs, aggregations)
- **Analytics Queries**: < 1000ms (reports, dashboards)
- **Bulk Operations**: < 5000ms (batch inserts/updates)

#### Throughput Budgets
- **Read Operations**: > 1000 QPS
- **Write Operations**: > 100 QPS
- **Mixed Workload**: > 500 QPS

#### Resource Budgets
- **CPU Usage**: < 70% average
- **Memory Usage**: < 80% of allocated
- **Disk I/O**: < 1000 IOPS
- **Connection Pool**: < 80% utilization

### 2. Table-Specific Budgets

#### Users Table
- **Query Time**: < 5ms
- **Index Usage**: > 95%
- **Row Count**: < 1M rows
- **Growth Rate**: < 10K rows/day

#### Meals Table
- **Query Time**: < 20ms
- **Index Usage**: > 90%
- **Row Count**: < 10M rows
- **Growth Rate**: < 100K rows/day

#### Meal_Ingredients Table
- **Query Time**: < 15ms
- **Index Usage**: > 85%
- **Row Count**: < 50M rows
- **Growth Rate**: < 500K rows/day

## Query Profiling

### 1. Profiling Tools

#### Built-in Profiling
```sql
-- Enable query profiling
SET profiling = 1;

-- Run your query
SELECT * FROM meals WHERE user_id = 1;

-- Show profile
SHOW PROFILES;

-- Show detailed profile
SHOW PROFILE FOR QUERY 1;
```

#### Performance Schema
```sql
-- Enable performance schema
UPDATE performance_schema.setup_instruments 
SET ENABLED = 'YES' 
WHERE NAME LIKE '%statement%';

-- Query performance data
SELECT 
    DIGEST_TEXT,
    COUNT_STAR,
    AVG_TIMER_WAIT/1000000000 as avg_time_seconds,
    MAX_TIMER_WAIT/1000000000 as max_time_seconds
FROM performance_schema.events_statements_summary_by_digest 
ORDER BY AVG_TIMER_WAIT DESC 
LIMIT 10;
```

### 2. Query Analysis

#### Slow Query Detection
```sql
-- Find slow queries
SELECT 
    query_time,
    lock_time,
    rows_sent,
    rows_examined,
    sql_text
FROM mysql.slow_log 
WHERE start_time > DATE_SUB(NOW(), INTERVAL 1 HOUR)
ORDER BY query_time DESC;
```

#### Query Execution Plans
```sql
-- Analyze query execution plan
EXPLAIN SELECT m.*, u.name 
FROM meals m 
JOIN users u ON m.user_id = u.id 
WHERE m.difficulty = 'easy';

-- Analyze with format
EXPLAIN FORMAT=JSON SELECT m.*, u.name 
FROM meals m 
JOIN users u ON m.user_id = u.id 
WHERE m.difficulty = 'easy';
```

## Index Optimization

### 1. Index Analysis

#### Index Usage Statistics
```sql
-- Check index usage
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    CARDINALITY,
    NULLABLE,
    INDEX_TYPE
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = 'whats_for_dinner'
ORDER BY TABLE_NAME, CARDINALITY DESC;
```

#### Missing Indexes
```sql
-- Find missing indexes
SELECT 
    object_name,
    statement,
    avg_total_user_cost,
    avg_user_impact,
    user_seeks,
    user_scans
FROM sys.dm_db_missing_index_details
ORDER BY avg_total_user_cost * avg_user_impact DESC;
```

### 2. Index Recommendations

#### Primary Indexes
```sql
-- Users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Meals table
CREATE INDEX idx_meals_user_id ON meals(user_id);
CREATE INDEX idx_meals_difficulty ON meals(difficulty);
CREATE INDEX idx_meals_created_at ON meals(created_at);
CREATE INDEX idx_meals_dietary ON meals(vegetarian, vegan, gluten_free);

-- Meal ingredients table
CREATE INDEX idx_meal_ingredients_meal_id ON meal_ingredients(meal_id);
CREATE INDEX idx_meal_ingredients_ingredient ON meal_ingredients(ingredient);
```

#### Composite Indexes
```sql
-- Composite index for common queries
CREATE INDEX idx_meals_user_difficulty ON meals(user_id, difficulty);
CREATE INDEX idx_meals_user_created ON meals(user_id, created_at);
CREATE INDEX idx_meal_ingredients_meal_ingredient ON meal_ingredients(meal_id, ingredient);
```

#### Partial Indexes
```sql
-- Partial index for active users
CREATE INDEX idx_users_active ON users(created_at) WHERE active = 1;

-- Partial index for recent meals
CREATE INDEX idx_meals_recent ON meals(created_at) WHERE created_at > DATE_SUB(NOW(), INTERVAL 30 DAY);
```

## Query Optimization

### 1. Common Optimizations

#### Avoid SELECT *
```sql
-- Bad
SELECT * FROM meals WHERE user_id = 1;

-- Good
SELECT id, name, description, prep_time, cook_time 
FROM meals 
WHERE user_id = 1;
```

#### Use LIMIT
```sql
-- Bad
SELECT * FROM meals WHERE user_id = 1;

-- Good
SELECT id, name, description 
FROM meals 
WHERE user_id = 1 
LIMIT 20;
```

#### Optimize JOINs
```sql
-- Bad - Cartesian product
SELECT m.*, u.* 
FROM meals m, users u 
WHERE m.user_id = u.id;

-- Good - Explicit JOIN
SELECT m.id, m.name, u.name as user_name
FROM meals m
JOIN users u ON m.user_id = u.id;
```

#### Use EXISTS instead of IN
```sql
-- Bad
SELECT * FROM meals 
WHERE user_id IN (
    SELECT id FROM users WHERE active = 1
);

-- Good
SELECT * FROM meals m
WHERE EXISTS (
    SELECT 1 FROM users u 
    WHERE u.id = m.user_id AND u.active = 1
);
```

### 2. Advanced Optimizations

#### Query Rewriting
```sql
-- Original query
SELECT m.*, COUNT(mi.id) as ingredient_count
FROM meals m
LEFT JOIN meal_ingredients mi ON m.id = mi.meal_id
WHERE m.user_id = 1
GROUP BY m.id;

-- Optimized query
SELECT m.*, mi_count.ingredient_count
FROM meals m
LEFT JOIN (
    SELECT meal_id, COUNT(*) as ingredient_count
    FROM meal_ingredients
    GROUP BY meal_id
) mi_count ON m.id = mi_count.meal_id
WHERE m.user_id = 1;
```

#### Pagination Optimization
```sql
-- Bad - OFFSET pagination
SELECT * FROM meals 
ORDER BY created_at DESC 
LIMIT 20 OFFSET 1000;

-- Good - Cursor pagination
SELECT * FROM meals 
WHERE created_at < '2024-12-19 10:00:00'
ORDER BY created_at DESC 
LIMIT 20;
```

## Performance Monitoring

### 1. Key Metrics

#### Query Performance
- **Average Query Time**: < 50ms
- **95th Percentile**: < 200ms
- **99th Percentile**: < 500ms
- **Slow Query Count**: < 1% of total queries

#### Resource Utilization
- **CPU Usage**: < 70%
- **Memory Usage**: < 80%
- **Disk I/O**: < 1000 IOPS
- **Connection Count**: < 80% of max

#### Throughput
- **Queries Per Second**: > 500
- **Transactions Per Second**: > 100
- **Data Transfer Rate**: < 100MB/s

### 2. Monitoring Queries

#### Real-time Monitoring
```sql
-- Current running queries
SELECT 
    id,
    user,
    host,
    db,
    command,
    time,
    state,
    info
FROM information_schema.processlist
WHERE command != 'Sleep';
```

#### Historical Analysis
```sql
-- Query performance over time
SELECT 
    DATE(start_time) as date,
    COUNT(*) as query_count,
    AVG(query_time) as avg_time,
    MAX(query_time) as max_time
FROM mysql.slow_log
WHERE start_time > DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(start_time)
ORDER BY date;
```

## Migration Planning

### 1. Safe Schema Changes

#### Adding Indexes
```sql
-- Add index online (MySQL 5.7+)
ALTER TABLE meals ADD INDEX idx_meals_difficulty (difficulty), ALGORITHM=INPLACE, LOCK=NONE;

-- Add index with progress monitoring
ALTER TABLE meals ADD INDEX idx_meals_created_at (created_at), ALGORITHM=INPLACE, LOCK=NONE;
```

#### Adding Columns
```sql
-- Add nullable column
ALTER TABLE meals ADD COLUMN nutrition_score DECIMAL(3,2) NULL;

-- Add column with default value
ALTER TABLE meals ADD COLUMN updated_by VARCHAR(255) DEFAULT 'system';
```

#### Modifying Columns
```sql
-- Modify column type
ALTER TABLE meals MODIFY COLUMN prep_time INT UNSIGNED NOT NULL;

-- Modify column with data conversion
ALTER TABLE meals MODIFY COLUMN difficulty ENUM('easy', 'medium', 'hard') NOT NULL;
```

### 2. Migration Strategy

#### Blue-Green Deployment
1. **Prepare**: Create new schema version
2. **Migrate**: Copy data to new schema
3. **Validate**: Verify data integrity
4. **Switch**: Point application to new schema
5. **Cleanup**: Remove old schema

#### Rolling Migration
1. **Backup**: Create full database backup
2. **Test**: Run migration on staging
3. **Deploy**: Apply migration in production
4. **Monitor**: Watch for performance issues
5. **Rollback**: Revert if issues occur

## Performance Testing

### 1. Load Testing

#### Query Load Testing
```bash
# Test query performance
pnpm run db:test --queries 1000 --concurrency 10

# Test specific query
pnpm run db:test --query "SELECT * FROM meals WHERE user_id = ?" --params 1

# Test with different data sizes
pnpm run db:test --data-size 1M --queries 100
```

#### Stress Testing
```bash
# Stress test database
pnpm run db:stress --duration 300 --concurrency 50

# Test connection limits
pnpm run db:stress --connections 100 --duration 60
```

### 2. Benchmarking

#### Baseline Performance
```bash
# Establish baseline
pnpm run db:benchmark --baseline

# Compare against baseline
pnpm run db:benchmark --compare

# Generate performance report
pnpm run db:benchmark --report
```

## Troubleshooting

### 1. Common Issues

#### Slow Queries
- **Missing Indexes**: Add appropriate indexes
- **Poor Query Plans**: Rewrite queries
- **Data Skew**: Optimize data distribution
- **Resource Contention**: Scale resources

#### High CPU Usage
- **Inefficient Queries**: Optimize query logic
- **Missing Indexes**: Add required indexes
- **Resource Limits**: Increase CPU allocation
- **Concurrent Load**: Optimize connection pooling

#### Memory Issues
- **Buffer Pool Size**: Increase innodb_buffer_pool_size
- **Query Cache**: Enable and tune query cache
- **Connection Memory**: Optimize connection limits
- **Temporary Tables**: Optimize temporary table usage

### 2. Performance Tuning

#### Configuration Optimization
```ini
# MySQL configuration
[mysqld]
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2
query_cache_size = 64M
query_cache_type = 1
max_connections = 200
```

#### Connection Pooling
```typescript
// Connection pool configuration
const poolConfig = {
  host: 'localhost',
  user: 'app_user',
  password: 'password',
  database: 'whats_for_dinner',
  connectionLimit: 20,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};
```

## Best Practices

### 1. Query Design

- **Use Indexes**: Always use appropriate indexes
- **Limit Results**: Use LIMIT for pagination
- **Avoid SELECT ***: Select only needed columns
- **Use JOINs**: Prefer JOINs over subqueries
- **Optimize WHERE**: Put most selective conditions first

### 2. Schema Design

- **Normalize Data**: Follow 3NF principles
- **Choose Data Types**: Use appropriate data types
- **Index Strategy**: Plan index placement
- **Partitioning**: Consider table partitioning
- **Constraints**: Use appropriate constraints

### 3. Monitoring

- **Set Alerts**: Monitor key metrics
- **Regular Analysis**: Analyze query performance
- **Capacity Planning**: Plan for growth
- **Backup Strategy**: Regular backups
- **Disaster Recovery**: Test recovery procedures

## Success Metrics

### 1. Performance Metrics

- **Query Response Time**: < 50ms average
- **Database Availability**: > 99.9%
- **Throughput**: > 500 QPS
- **Resource Utilization**: < 80%

### 2. Operational Metrics

- **Migration Success Rate**: > 95%
- **Index Usage**: > 90%
- **Query Optimization**: > 80% improvement
- **Monitoring Coverage**: 100%

This guide provides a comprehensive foundation for database performance optimization and monitoring.