#!/usr/bin/env tsx
/**
 * Redis Setup Script
 * 
 * Validates Redis connection and sets up initial configuration
 */

import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL;

async function setupRedis() {
  if (!REDIS_URL) {
    console.log('⚠️  REDIS_URL not set. Using in-memory cache fallback.');
    console.log('   To enable Redis caching, set REDIS_URL environment variable.');
    return;
  }

  console.log('🔌 Connecting to Redis...');

  try {
    const client = createClient({
      url: REDIS_URL,
    });

    client.on('error', (err) => {
      console.error('❌ Redis Client Error:', err);
    });

    await client.connect();
    console.log('✅ Connected to Redis successfully');

    // Test basic operations
    await client.set('test:connection', 'ok', { EX: 10 });
    const value = await client.get('test:connection');
    
    if (value === 'ok') {
      console.log('✅ Redis read/write test passed');
    } else {
      console.error('❌ Redis read/write test failed');
    }

    // Get Redis info
    const info = await client.info('server');
    console.log('\n📊 Redis Server Info:');
    console.log(info.split('\n').slice(0, 5).join('\n'));

    await client.quit();
    console.log('\n✅ Redis setup complete');
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error);
    console.log('\n⚠️  Falling back to in-memory cache.');
    console.log('   Redis is optional - the app will work without it.');
  }
}

setupRedis().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
