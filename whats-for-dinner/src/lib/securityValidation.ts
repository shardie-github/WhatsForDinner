/**
 * Comprehensive Security Validation System
 * 
 * This module provides security validation including:
 * - Input sanitization
 * - SQL injection prevention
 * - XSS protection
 * - CSRF protection
 * - Rate limiting
 * - Security headers validation
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { logger } from './logger';

export interface SecurityConfig {
  maxRequestSize: number;
  rateLimitWindow: number; // in milliseconds
  rateLimitMax: number; // max requests per window
  allowedOrigins: string[];
  blockedPatterns: RegExp[];
  maxFileSize: number;
  allowedFileTypes: string[];
}

export interface SecurityViolation {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: Record<string, any>;
  timestamp: Date;
  ip: string;
  userAgent: string;
}

class SecurityValidator {
  private config: SecurityConfig;
  private rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();
  private blockedIPs: Set<string> = new Set();
  private violations: SecurityViolation[] = [];

  constructor() {
    this.config = {
      maxRequestSize: 10 * 1024 * 1024, // 10MB
      rateLimitWindow: 15 * 60 * 1000, // 15 minutes
      rateLimitMax: 100, // 100 requests per 15 minutes
      allowedOrigins: [
        'http://localhost:3000',
        'https://whatsfordinner.com',
        'https://www.whatsfordinner.com',
      ],
      blockedPatterns: [
        /<script[^>]*>.*?<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /union\s+select/gi,
        /drop\s+table/gi,
        /delete\s+from/gi,
        /insert\s+into/gi,
        /update\s+set/gi,
        /exec\s*\(/gi,
        /eval\s*\(/gi,
        /<iframe[^>]*>/gi,
        /<object[^>]*>/gi,
        /<embed[^>]*>/gi,
      ],
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    };
  }

  /**
   * Validate a request for security issues
   */
  public async validateRequest(request: NextRequest): Promise<{
    isValid: boolean;
    violations: SecurityViolation[];
    response?: NextResponse;
  }> {
    const violations: SecurityViolation[] = [];
    const ip = this.getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';

    // Check if IP is blocked
    if (this.blockedIPs.has(ip)) {
      const violation: SecurityViolation = {
        type: 'blocked_ip',
        severity: 'critical',
        message: 'Request from blocked IP address',
        details: { ip },
        timestamp: new Date(),
        ip,
        userAgent,
      };
      violations.push(violation);
      this.logViolation(violation);
      
      return {
        isValid: false,
        violations,
        response: new NextResponse('Access Denied', { status: 403 }),
      };
    }

    // Rate limiting
    const rateLimitViolation = this.checkRateLimit(ip);
    if (rateLimitViolation) {
      violations.push(rateLimitViolation);
      this.logViolation(rateLimitViolation);
      
      return {
        isValid: false,
        violations,
        response: new NextResponse('Rate Limit Exceeded', { 
          status: 429,
          headers: {
            'Retry-After': '900', // 15 minutes
          },
        }),
      };
    }

    // CORS validation
    const corsViolation = this.validateCORS(request);
    if (corsViolation) {
      violations.push(corsViolation);
      this.logViolation(corsViolation);
    }

    // Request size validation
    const sizeViolation = this.validateRequestSize(request);
    if (sizeViolation) {
      violations.push(sizeViolation);
      this.logViolation(sizeViolation);
    }

    // Input validation
    const inputViolations = await this.validateInputs(request);
    violations.push(...inputViolations);
    inputViolations.forEach(v => this.logViolation(v));

    // Security headers validation
    const headerViolations = this.validateSecurityHeaders(request);
    violations.push(...headerViolations);
    headerViolations.forEach(v => this.logViolation(v));

    // If there are critical violations, block the request
    const criticalViolations = violations.filter(v => v.severity === 'critical');
    if (criticalViolations.length > 0) {
      this.blockIP(ip);
      return {
        isValid: false,
        violations,
        response: new NextResponse('Security Violation Detected', { status: 403 }),
      };
    }

    return {
      isValid: violations.length === 0,
      violations,
    };
  }

  /**
   * Check rate limiting
   */
  private checkRateLimit(ip: string): SecurityViolation | null {
    const now = Date.now();
    const windowStart = now - this.config.rateLimitWindow;
    
    const current = this.rateLimitStore.get(ip);
    
    if (!current || current.resetTime < now) {
      this.rateLimitStore.set(ip, {
        count: 1,
        resetTime: now + this.config.rateLimitWindow,
      });
      return null;
    }
    
    if (current.count >= this.config.rateLimitMax) {
      return {
        type: 'rate_limit_exceeded',
        severity: 'high',
        message: 'Rate limit exceeded',
        details: {
          ip,
          count: current.count,
          limit: this.config.rateLimitMax,
          window: this.config.rateLimitWindow,
        },
        timestamp: new Date(),
        ip,
        userAgent: '',
      };
    }
    
    current.count++;
    return null;
  }

  /**
   * Validate CORS
   */
  private validateCORS(request: NextRequest): SecurityViolation | null {
    const origin = request.headers.get('origin');
    
    if (!origin) {
      return null; // No origin header, not a CORS request
    }
    
    if (!this.config.allowedOrigins.includes(origin)) {
      return {
        type: 'cors_violation',
        severity: 'medium',
        message: 'Request from unauthorized origin',
        details: {
          origin,
          allowedOrigins: this.config.allowedOrigins,
        },
        timestamp: new Date(),
        ip: this.getClientIP(request),
        userAgent: request.headers.get('user-agent') || '',
      };
    }
    
    return null;
  }

  /**
   * Validate request size
   */
  private validateRequestSize(request: NextRequest): SecurityViolation | null {
    const contentLength = request.headers.get('content-length');
    
    if (contentLength && parseInt(contentLength) > this.config.maxRequestSize) {
      return {
        type: 'request_size_exceeded',
        severity: 'medium',
        message: 'Request size exceeds maximum allowed',
        details: {
          size: parseInt(contentLength),
          maxSize: this.config.maxRequestSize,
        },
        timestamp: new Date(),
        ip: this.getClientIP(request),
        userAgent: request.headers.get('user-agent') || '',
      };
    }
    
    return null;
  }

  /**
   * Validate inputs for malicious content
   */
  private async validateInputs(request: NextRequest): Promise<SecurityViolation[]> {
    const violations: SecurityViolation[] = [];
    const ip = this.getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';
    
    try {
      // Check URL parameters
      const url = new URL(request.url);
      for (const [key, value] of url.searchParams) {
        const violation = this.checkForMaliciousContent(key, value, 'url_param');
        if (violation) {
          violation.ip = ip;
          violation.userAgent = userAgent;
          violations.push(violation);
        }
      }
      
      // Check request body for POST/PUT requests
      if (request.method === 'POST' || request.method === 'PUT') {
        const contentType = request.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
          const body = await request.json();
          const bodyViolations = this.validateObject(body, 'request_body');
          violations.push(...bodyViolations.map(v => ({
            ...v,
            ip,
            userAgent,
          })));
        } else if (contentType.includes('multipart/form-data')) {
          const formData = await request.formData();
          for (const [key, value] of formData) {
            if (typeof value === 'string') {
              const violation = this.checkForMaliciousContent(key, value, 'form_data');
              if (violation) {
                violation.ip = ip;
                violation.userAgent = userAgent;
                violations.push(violation);
              }
            }
          }
        }
      }
    } catch (error) {
      // If we can't parse the request, it might be malicious
      violations.push({
        type: 'malformed_request',
        severity: 'high',
        message: 'Unable to parse request body',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date(),
        ip,
        userAgent,
      });
    }
    
    return violations;
  }

  /**
   * Check for malicious content in a string
   */
  private checkForMaliciousContent(
    key: string, 
    value: string, 
    source: string
  ): SecurityViolation | null {
    for (const pattern of this.config.blockedPatterns) {
      if (pattern.test(value)) {
        return {
          type: 'malicious_content',
          severity: 'critical',
          message: 'Malicious content detected',
          details: {
            key,
            value: value.substring(0, 100), // Truncate for logging
            source,
            pattern: pattern.toString(),
          },
          timestamp: new Date(),
          ip: '',
          userAgent: '',
        };
      }
    }
    
    return null;
  }

  /**
   * Validate an object recursively
   */
  private validateObject(obj: any, path: string = ''): SecurityViolation[] {
    const violations: SecurityViolation[] = [];
    
    if (typeof obj === 'string') {
      const violation = this.checkForMaliciousContent(path, obj, 'object_property');
      if (violation) {
        violations.push(violation);
      }
    } else if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        violations.push(...this.validateObject(item, `${path}[${index}]`));
      });
    } else if (obj && typeof obj === 'object') {
      for (const [key, value] of Object.entries(obj)) {
        violations.push(...this.validateObject(value, path ? `${path}.${key}` : key));
      }
    }
    
    return violations;
  }

  /**
   * Validate security headers
   */
  private validateSecurityHeaders(request: NextRequest): SecurityViolation[] {
    const violations: SecurityViolation[] = [];
    const ip = this.getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';
    
    // Check for suspicious headers
    const suspiciousHeaders = [
      'x-forwarded-for',
      'x-real-ip',
      'x-originating-ip',
      'x-remote-ip',
      'x-remote-addr',
    ];
    
    for (const header of suspiciousHeaders) {
      const value = request.headers.get(header);
      if (value && !this.isValidIP(value)) {
        violations.push({
          type: 'suspicious_header',
          severity: 'medium',
          message: 'Suspicious header value detected',
          details: {
            header,
            value,
          },
          timestamp: new Date(),
          ip,
          userAgent,
        });
      }
    }
    
    return violations;
  }

  /**
   * Check if an IP address is valid
   */
  private isValidIP(ip: string): boolean {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  /**
   * Get client IP address
   */
  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    if (realIP) {
      return realIP;
    }
    
    return 'unknown';
  }

  /**
   * Block an IP address
   */
  private blockIP(ip: string): void {
    this.blockedIPs.add(ip);
    
    logger.warn(`IP address blocked: ${ip}`, {
      ip,
      reason: 'security_violation',
      blocked_at: new Date(),
    }, 'security', 'ip_blocking');
    
    // Auto-unblock after 24 hours
    setTimeout(() => {
      this.blockedIPs.delete(ip);
      logger.info(`IP address unblocked: ${ip}`, {
        ip,
        unblocked_at: new Date(),
      }, 'security', 'ip_blocking');
    }, 24 * 60 * 60 * 1000);
  }

  /**
   * Log a security violation
   */
  private logViolation(violation: SecurityViolation): void {
    this.violations.push(violation);
    
    logger.warn(`Security violation: ${violation.type}`, {
      type: violation.type,
      severity: violation.severity,
      message: violation.message,
      details: violation.details,
      ip: violation.ip,
      userAgent: violation.userAgent,
      timestamp: violation.timestamp,
    }, 'security', 'violation');
  }

  /**
   * Sanitize input string
   */
  public sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Generate CSRF token
   */
  public generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Validate CSRF token
   */
  public validateCSRFToken(token: string, sessionToken: string): boolean {
    return crypto.timingSafeEqual(
      Buffer.from(token, 'hex'),
      Buffer.from(sessionToken, 'hex')
    );
  }

  /**
   * Get security statistics
   */
  public getSecurityStats(): {
    totalViolations: number;
    violationsByType: Record<string, number>;
    violationsBySeverity: Record<string, number>;
    blockedIPs: number;
    rateLimitEntries: number;
  } {
    const violationsByType: Record<string, number> = {};
    const violationsBySeverity: Record<string, number> = {};
    
    for (const violation of this.violations) {
      violationsByType[violation.type] = (violationsByType[violation.type] || 0) + 1;
      violationsBySeverity[violation.severity] = (violationsBySeverity[violation.severity] || 0) + 1;
    }
    
    return {
      totalViolations: this.violations.length,
      violationsByType,
      violationsBySeverity,
      blockedIPs: this.blockedIPs.size,
      rateLimitEntries: this.rateLimitStore.size,
    };
  }

  /**
   * Clean up old data
   */
  public cleanup(): void {
    const now = Date.now();
    const cutoff = now - (24 * 60 * 60 * 1000); // 24 hours ago
    
    // Clean up old rate limit entries
    for (const [ip, data] of this.rateLimitStore) {
      if (data.resetTime < cutoff) {
        this.rateLimitStore.delete(ip);
      }
    }
    
    // Clean up old violations (keep last 1000)
    if (this.violations.length > 1000) {
      this.violations = this.violations.slice(-1000);
    }
  }
}

// Export singleton instance
export const securityValidator = new SecurityValidator();

// Export types and utilities
export { SecurityValidator };
export type { SecurityConfig, SecurityViolation };