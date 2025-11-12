/**
 * Database Helper: PostgreSQL Pool
 * 
 * Provides a reusable PostgreSQL connection pool.
 */

// Lazy import pg to handle missing dependency gracefully
let Pool: any, PoolConfig: any;
try {
  const pg = require('pg');
  Pool = pg.Pool;
  PoolConfig = pg.PoolConfig;
} catch (e) {
  // pg not installed - will throw when actually used
}

const DB_URL = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

if (!DB_URL && !process.argv.includes('--dry-run')) {
  throw new Error('SUPABASE_DB_URL or DATABASE_URL required (or use --dry-run)');
}

const poolConfig: PoolConfig = {
  connectionString: DB_URL,
  max: 10, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export const pool = DB_URL && Pool ? new Pool(poolConfig) : null;

// Handle pool errors (only if pool exists)
if (pool) {
  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
  });
}

// Helper: Query with error handling
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  if (!pool) {
    throw new Error('Database pool not initialized. Install pg: npm install pg');
  }
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`[DB] Query executed in ${duration}ms: ${text.substring(0, 50)}...`);
    return res.rows;
  } catch (error) {
    console.error(`[DB] Query failed: ${text.substring(0, 50)}...`, error);
    throw error;
  }
}

// Helper: Transaction
export async function transaction<T>(
  callback: (client: any) => Promise<T>
): Promise<T> {
  if (!pool) {
    throw new Error('Database pool not initialized. Install pg: npm install pg');
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Cleanup on process exit
process.on('SIGINT', async () => {
  if (pool) await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  if (pool) await pool.end();
  process.exit(0);
});
