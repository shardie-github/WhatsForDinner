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
  console.log('⚠️  pg module not found, trying alternative methods...');
}

async function testConnection() {
  // Method 1: Check environment variables
  const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
  console.log('Environment check:');
  console.log('  SUPABASE_DB_URL:', dbUrl ? 'SET' : 'NOT SET');
  console.log('  DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
  
  if (dbUrl) {
    console.log('  DB URL preview:', dbUrl.substring(0, 30) + '...');
    
    // Try to connect if pg is available
    if (pg) {
      try {
        const client = new pg.Client({ connectionString: dbUrl });
        await client.connect();
        const result = await client.query('SELECT NOW() as now, version() as version');
        console.log('✅ Connection successful!');
        console.log('  Server time:', result.rows[0].now);
        console.log('  PostgreSQL version:', result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1]);
        await client.end();
        return true;
      } catch (error) {
        console.log('❌ Connection failed:', (error as Error).message);
        return false;
      }
    } else {
      console.log('⚠️  pg module not available, cannot test connection');
      return false;
    }
  } else {
    console.log('❌ No database URL found in environment');
    return false;
  }
}

testConnection().catch(console.error);
