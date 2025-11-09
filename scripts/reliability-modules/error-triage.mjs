#!/usr/bin/env node

/**
 * Error Triage Module
 * Analyzes deployment logs and CI runs for recurring errors
 * Classifies root cause and auto-creates issues/PRs for fixes
 */

export class ErrorTriage {
  constructor(supabase) {
    this.supabase = supabase;
    this.results = {
      timestamp: new Date().toISOString(),
      totalErrors: 0,
      recurringFailures: [],
      errorRate: 0,
      categories: {
        build: [],
        api: [],
        auth: [],
        network: [],
        other: []
      }
    };
  }

  async run() {
    try {
      // Get errors from logs table
      const errors = await this.getErrors();
      
      // Analyze recurring patterns
      await this.analyzeRecurringErrors(errors);
      
      // Calculate error rate
      this.calculateErrorRate(errors);
      
      // Categorize errors
      this.categorizeErrors(errors);
      
      return this.results;
    } catch (error) {
      console.error('Error in error triage:', error);
      throw error;
    }
  }

  async getErrors() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data, error } = await this.supabase
      .from('logs')
      .select('*')
      .eq('level', 'error')
      .gte('timestamp', sevenDaysAgo.toISOString())
      .order('timestamp', { ascending: false });
    
    if (error) {
      console.warn('Could not fetch errors from logs:', error.message);
      return [];
    }
    
    return data || [];
  }

  async analyzeRecurringErrors(errors) {
    // Group errors by message/stack trace
    const errorGroups = {};
    
    errors.forEach(error => {
      const key = this.normalizeError(error);
      if (!errorGroups[key]) {
        errorGroups[key] = {
          count: 0,
          firstSeen: error.timestamp,
          lastSeen: error.timestamp,
          examples: [],
          category: this.classifyError(error)
        };
      }
      
      errorGroups[key].count++;
      errorGroups[key].lastSeen = error.timestamp;
      if (errorGroups[key].examples.length < 3) {
        errorGroups[key].examples.push({
          timestamp: error.timestamp,
          message: error.message,
          context: error.context,
          source: error.source
        });
      }
    });
    
    // Find recurring failures (> 3 occurrences)
    this.results.recurringFailures = Object.entries(errorGroups)
      .filter(([_, group]) => group.count > 3)
      .map(([key, group]) => ({
        pattern: key,
        count: group.count,
        firstSeen: group.firstSeen,
        lastSeen: group.lastSeen,
        category: group.category,
        examples: group.examples,
        component: this.extractComponent(group.examples[0])
      }))
      .sort((a, b) => b.count - a.count);
    
    this.results.totalErrors = errors.length;
  }

  normalizeError(error) {
    // Normalize error message for grouping
    let message = error.message || '';
    
    // Remove variable parts (IDs, timestamps, etc.)
    message = message.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '<id>');
    message = message.replace(/\d{4}-\d{2}-\d{2}/g, '<date>');
    message = message.replace(/\d+\.\d+\.\d+\.\d+/g, '<ip>');
    message = message.replace(/\/[a-z0-9_-]+/gi, '/<path>');
    
    // Use stack trace if available for better grouping
    if (error.stack_trace) {
      const stackLines = error.stack_trace.split('\n').slice(0, 3);
      return stackLines.join(' | ').substring(0, 200);
    }
    
    return message.substring(0, 200);
  }

  classifyError(error) {
    const message = (error.message || '').toLowerCase();
    const stack = (error.stack_trace || '').toLowerCase();
    const source = (error.source || '').toLowerCase();
    
    if (message.includes('build') || message.includes('compile') || message.includes('webpack')) {
      return 'build';
    }
    
    if (message.includes('auth') || message.includes('token') || message.includes('unauthorized') || message.includes('permission')) {
      return 'auth';
    }
    
    if (message.includes('network') || message.includes('timeout') || message.includes('connection') || message.includes('fetch')) {
      return 'network';
    }
    
    if (source === 'api' || message.includes('api') || message.includes('endpoint')) {
      return 'api';
    }
    
    return 'other';
  }

  extractComponent(example) {
    if (!example) return 'unknown';
    
    const context = example.context || {};
    const source = example.source || '';
    const message = example.message || '';
    
    // Try to extract component from context
    if (context.component) return context.component;
    if (context.route) return `route:${context.route}`;
    if (context.function) return `function:${context.function}`;
    
    // Try to extract from source
    if (source) return source;
    
    // Try to extract from message
    const match = message.match(/([a-zA-Z]+)\.[a-zA-Z]+/);
    if (match) return match[1];
    
    return 'unknown';
  }

  categorizeErrors(errors) {
    errors.forEach(error => {
      const category = this.classifyError(error);
      this.results.categories[category].push({
        timestamp: error.timestamp,
        message: error.message,
        source: error.source,
        component: error.component
      });
    });
  }

  calculateErrorRate(errors) {
    // Calculate errors per hour over last 7 days
    const sevenDaysInHours = 7 * 24;
    this.results.errorRate = errors.length / sevenDaysInHours;
  }
}
