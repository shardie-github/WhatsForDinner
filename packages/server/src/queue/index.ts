import { Queue, Worker, QueueEvents } from 'bullmq';
import Redis from 'ioredis';
import { logger } from '../observability/index.js';

let redisConnection: Redis | null = null;

function getRedisConnection(): Redis {
  if (!redisConnection) {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      throw new Error('REDIS_URL must be set');
    }
    redisConnection = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
    });
  }
  return redisConnection;
}

const connection = getRedisConnection();

// Queue instances
export const queue = new Queue('nomad-jobs', {
  connection,
  defaultJobOptions: {
    removeOnComplete: {
      age: 3600,
      count: 1000,
    },
    removeOnFail: {
      age: 86400,
    },
  },
});

const queueEvents = new QueueEvents('nomad-jobs', { connection });

// Worker setup
let worker: Worker | null = null;

export async function startWorker() {
  const concurrency = parseInt(process.env.QUEUE_CONCURRENCY || '5', 10);

  worker = new Worker(
    'nomad-jobs',
    async (job) => {
      logger.info({ jobId: job.id, jobName: job.name }, 'Processing job');

      switch (job.name) {
        case 'mealgen':
          const { mealGenProcessor } = await import('../jobs/mealGen.js');
          return await mealGenProcessor(job.data);
        case 'digest':
          const { digestProcessor } = await import('../jobs/digests.js');
          return await digestProcessor(job.data);
        case 'journeys':
          const { journeysRunnerProcessor } = await import('../jobs/journeysRunner.js');
          return await journeysRunnerProcessor(job.data);
        case 'digest_weekly':
          const { digestRunnerProcessor } = await import('../jobs/digestRunner.js');
          return await digestRunnerProcessor(job.data);
        case 'anomaly_guard':
          const { anomalyGuardProcessor } = await import('../jobs/anomalyGuard.js');
          return await anomalyGuardProcessor();
        case 'price_rollout':
          const { priceRolloutProcessor } = await import('../jobs/priceRollout.js');
          return await priceRolloutProcessor();
        default:
          throw new Error(`Unknown job type: ${job.name}`);
      }
    },
    {
      connection,
      concurrency,
      removeOnComplete: {
        age: 3600,
        count: 1000,
      },
      removeOnFail: {
        age: 86400,
      },
    },
  );

  worker.on('completed', (job) => {
    logger.info({ jobId: job.id }, 'Job completed');
  });

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, error: err.message }, 'Job failed');
  });

  worker.on('error', (err) => {
    logger.error({ error: err.message }, 'Worker error');
  });

  logger.info({ concurrency }, 'Queue worker started');
}

// Graceful shutdown
export async function stopWorker() {
  if (worker) {
    await worker.close();
    worker = null;
  }
  await queue.close();
  await queueEvents.close();
  if (redisConnection) {
    await redisConnection.quit();
    redisConnection = null;
  }
  logger.info('Queue worker stopped');
}

// Health check
export async function queueHealth(): Promise<{ healthy: boolean; pending: number; active: number }> {
  try {
    const [waiting, active] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
    ]);

    return {
      healthy: true,
      pending: waiting,
      active,
    };
  } catch (error) {
    logger.error({ error }, 'Queue health check failed');
    return {
      healthy: false,
      pending: 0,
      active: 0,
    };
  }
}

// Handle process signals
process.on('SIGTERM', async () => {
  await stopWorker();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await stopWorker();
  process.exit(0);
});

// Auto-start worker if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startWorker().catch((err) => {
    logger.error({ error: err }, 'Failed to start queue worker');
    process.exit(1);
  });
}
