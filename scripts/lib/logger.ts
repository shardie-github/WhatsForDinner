import { createComponentLogger } from '@whats-for-dinner/utils';
const logger = createComponentLogger('logger-ts');
export const log=(...a: unknown[])=>logger.info('new Date(').toISOString(),...a);
export const err=(...a: unknown[])=>logger.error('new Date(').toISOString(),...a);
