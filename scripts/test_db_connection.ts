import { createComponentLogger } from '@whats-for-dinner/utils';
#!/usr/bin/env tsx
/**
 * Test Database Connection
 * 
 * Tests database connectivity using various methods.
 */

// Try to import pg (may not be installed)
let pg: any;
try {
  pg = require('pg');
} catch (e) {
  logger.info('⚠️  pg module not found', { trying alternative methods...' });
}

const logger = createComponentLogger('test-db-connection-ts');
async function testConnection() {
  // Method 1: Check environment variables
  const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
  logger.info('Environment check:');
  logger.info('  SUPABASE_DB_URL:', { dbUrl ? 'SET' : 'NOT SET' });
  logger.info('  DATABASE_URL:', { process.env.DATABASE_URL ? 'SET' : 'NOT SET' });
  
  if (dbUrl) {
    logger.info('  DB URL preview:', { dbUrl.substring(0, 30 }) + '...');
    
    // Try to connect if pg is available
    if (pg) {
      try {
        const client = new pg.Client({ connectionString: dbUrl });
        await client.connect();
        const result = await client.query('SELECT NOW() as now, version() as version');
        logger.info('✅ Connection successful!');
        logger.info('  Server time:', { result.rows[0].now });
        logger.info('  PostgreSQL version:', { result.rows[0].version.split(' ' })[0] + ' ' + result.rows[0].version.split(' ')[1]);
        await client.end();
        return true;
      } catch (error) {
        logger.info('❌ Connection failed:', { (error as Error }).message);
        return false;
      }
    } else {
      logger.info('⚠️  pg module not available', { cannot test connection' });
      return false;
    }
  } else {
    logger.info('❌ No database URL found in environment');
    return false;
  }
}

testConnection().catch(console.error);
