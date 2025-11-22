/**
 * Journeys Runner Job
 * BullMQ worker processor for journey orchestration
 */
import { runJourneys } from '../journeys/engine.js';
import { logger } from '../observability/index.js';
export async function journeysRunnerProcessor(data) {
    logger.info('Starting journeys runner job');
    const result = await runJourneys();
    logger.info({ processed: result.processed, errors: result.errors }, 'Journeys runner completed');
    return result;
}
