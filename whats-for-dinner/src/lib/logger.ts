import { supabase } from './supabaseClient'
import { v4 as uuidv4 } from 'uuid'

export interface LogEntry {
  id: string
  level: 'error' | 'warn' | 'info' | 'debug'
  message: string
  context?: Record<string, any>
  user_id?: string
  session_id?: string
  stack_trace?: string
  timestamp: string
  source: 'frontend' | 'api' | 'edge_function' | 'system'
  component?: string
}

export interface ErrorReport {
  id: string
  error_type: string
  message: string
  stack_trace?: string
  user_id?: string
  session_id?: string
  context: Record<string, any>
  resolved: boolean
  created_at: string
  resolved_at?: string
}

class Logger {
  private sessionId: string
  private userId?: string

  constructor() {
    this.sessionId = this.getOrCreateSessionId()
  }

  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return uuidv4()
    
    let sessionId = localStorage.getItem('logger_session_id')
    if (!sessionId) {
      sessionId = uuidv4()
      localStorage.setItem('logger_session_id', sessionId)
    }
    return sessionId
  }

  setUserId(userId: string) {
    this.userId = userId
  }

  private async writeLog(entry: LogEntry) {
    try {
      const { error } = await supabase
        .from('logs')
        .insert(entry)

      if (error) {
        console.error('Failed to write log to database:', error)
      }
    } catch (error) {
      console.error('Logger database error:', error)
    }
  }

  private createLogEntry(
    level: LogEntry['level'],
    message: string,
    context?: Record<string, any>,
    source: LogEntry['source'] = 'frontend',
    component?: string
  ): LogEntry {
    return {
      id: uuidv4(),
      level,
      message,
      context,
      user_id: this.userId,
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      source,
      component,
    }
  }

  async error(
    message: string,
    context?: Record<string, any>,
    source: LogEntry['source'] = 'frontend',
    component?: string,
    error?: Error
  ) {
    const entry = this.createLogEntry('error', message, context, source, component)
    
    if (error) {
      entry.stack_trace = error.stack
      entry.context = { ...context, error: error.message }
    }

    // Always log to console for immediate debugging
    console.error(`[${source}] ${message}`, context, error)

    // Write to database
    await this.writeLog(entry)

    // If it's an error, also create an error report
    if (error || level === 'error') {
      await this.reportError(message, error, context, source, component)
    }
  }

  async warn(
    message: string,
    context?: Record<string, any>,
    source: LogEntry['source'] = 'frontend',
    component?: string
  ) {
    const entry = this.createLogEntry('warn', message, context, source, component)
    
    console.warn(`[${source}] ${message}`, context)
    await this.writeLog(entry)
  }

  async info(
    message: string,
    context?: Record<string, any>,
    source: LogEntry['source'] = 'frontend',
    component?: string
  ) {
    const entry = this.createLogEntry('info', message, context, source, component)
    
    console.info(`[${source}] ${message}`, context)
    await this.writeLog(entry)
  }

  async debug(
    message: string,
    context?: Record<string, any>,
    source: LogEntry['source'] = 'frontend',
    component?: string
  ) {
    const entry = this.createLogEntry('debug', message, context, source, component)
    
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${source}] ${message}`, context)
    }
    await this.writeLog(entry)
  }

  private async reportError(
    message: string,
    error?: Error,
    context?: Record<string, any>,
    source: LogEntry['source'] = 'frontend',
    component?: string
  ) {
    const errorReport: ErrorReport = {
      id: uuidv4(),
      error_type: error?.name || 'UnknownError',
      message: error?.message || message,
      stack_trace: error?.stack,
      user_id: this.userId,
      session_id: this.sessionId,
      context: {
        ...context,
        source,
        component,
        user_agent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
      },
      resolved: false,
      created_at: new Date().toISOString(),
    }

    try {
      const { error: dbError } = await supabase
        .from('error_reports')
        .insert(errorReport)

      if (dbError) {
        console.error('Failed to create error report:', dbError)
      }
    } catch (err) {
      console.error('Error report creation failed:', err)
    }
  }

  async getErrorReports(limit: number = 50, resolved?: boolean) {
    try {
      let query = supabase
        .from('error_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (resolved !== undefined) {
        query = query.eq('resolved', resolved)
      }

      const { data, error } = await query

      if (error) {
        console.error('Failed to fetch error reports:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Failed to fetch error reports:', error)
      return []
    }
  }

  async resolveErrorReport(errorId: string) {
    try {
      const { error } = await supabase
        .from('error_reports')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', errorId)

      if (error) {
        console.error('Failed to resolve error report:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Failed to resolve error report:', error)
      return false
    }
  }

  // Performance monitoring
  async trackPerformance(
    operation: string,
    duration: number,
    metadata?: Record<string, any>
  ) {
    await this.info(`Performance: ${operation}`, {
      duration_ms: duration,
      ...metadata,
    }, 'system', 'performance')
  }

  // API call monitoring
  async trackAPICall(
    endpoint: string,
    method: string,
    statusCode: number,
    duration: number,
    metadata?: Record<string, any>
  ) {
    const level = statusCode >= 400 ? 'error' : 'info'
    await this[level](`API Call: ${method} ${endpoint}`, {
      status_code: statusCode,
      duration_ms: duration,
      ...metadata,
    }, 'api', 'api_client')
  }
}

export const logger = new Logger()

// React hook for logging
export function useLogger() {
  return {
    error: logger.error.bind(logger),
    warn: logger.warn.bind(logger),
    info: logger.info.bind(logger),
    debug: logger.debug.bind(logger),
    trackPerformance: logger.trackPerformance.bind(logger),
    trackAPICall: logger.trackAPICall.bind(logger),
  }
}

// Global error handler for unhandled errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    logger.error('Unhandled error', {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    }, 'frontend', 'global', event.error)
  })

  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection', {
      reason: event.reason,
    }, 'frontend', 'global')
  })
}