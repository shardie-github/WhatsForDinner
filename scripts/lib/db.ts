/**
 * Database Helper: PostgreSQL Pool
 * 
 * Provides a reusable PostgreSQL connection pool.
 */

import { Pool, PoolConfig } from 'pg';

const DB_URL = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

if (!DB_URL) {
  throw new Error('SUPABASE_DB_URL or DATABASE_URL required');
}

const poolConfig: PoolConfig = {
  connectionString: DB_URL,
  max: 10, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export const pool = new Pool(poolConfig);

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Helper: Query with error handling
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
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
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await pool.end();
  process.exit(0);
});
