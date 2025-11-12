/**
 * Logger: Timestamped Logs
 * 
 * Provides structured logging with timestamps.
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

const LOG_LEVEL = (process.env.LOG_LEVEL || 'info').toUpperCase() as keyof typeof LogLevel;
const CURRENT_LOG_LEVEL = LogLevel[LOG_LEVEL] ?? LogLevel.INFO;

function timestamp(): string {
  return new Date().toISOString();
}

function log(level: LogLevel, levelName: string, ...args: any[]): void {
  if (level < CURRENT_LOG_LEVEL) return;

  const prefix = `[${timestamp()}] [${levelName}]`;
  const consoleMethod =
    level === LogLevel.ERROR ? console.error :
    level === LogLevel.WARN ? console.warn :
    level === LogLevel.DEBUG ? console.debug :
    console.log;

  consoleMethod(prefix, ...args);
}

export const logger = {
  debug: (...args: any[]) => log(LogLevel.DEBUG, 'DEBUG', ...args),
  info: (...args: any[]) => log(LogLevel.INFO, 'INFO', ...args),
  warn: (...args: any[]) => log(LogLevel.WARN, 'WARN', ...args),
  error: (...args: any[]) => log(LogLevel.ERROR, 'ERROR', ...args),
};
