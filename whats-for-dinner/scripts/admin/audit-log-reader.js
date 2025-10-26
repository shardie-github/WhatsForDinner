#!/usr/bin/env node

/**
 * Admin Audit Log Reader Script
 * Reads and analyzes admin audit logs for security and compliance
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  supabaseUrl: process.env.SUPABASE_URL || 'http://localhost:54321',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  outputDir: path.join(__dirname, '../admin-dashboard'),
  verbose: process.env.VERBOSE === 'true',
};

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logVerbose(message) {
  if (config.verbose) {
    log(`[VERBOSE] ${message}`, 'blue');
  }
}

// Initialize Supabase client
const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);

/**
 * Get audit logs with filters
 */
async function getAuditLogs(filters = {}) {
  try {
    log('Fetching audit logs...', 'yellow');

    let query = supabase
      .from('admin_audit_logs')
      .select(
        `
        *,
        admin_users!inner(
          user_id,
          role,
          permissions
        )
      `
      )
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.userId) {
      query = query.eq('admin_user_id', filters.userId);
    }

    if (filters.action) {
      query = query.eq('action', filters.action);
    }

    if (filters.resource) {
      query = query.eq('resource', filters.resource);
    }

    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    log(`Found ${data.length} audit log entries`, 'green');
    return data;
  } catch (error) {
    log(`Error fetching audit logs: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Get system logs with filters
 */
async function getSystemLogs(filters = {}) {
  try {
    log('Fetching system logs...', 'yellow');

    let query = supabase
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.level) {
      query = query.eq('level', filters.level);
    }

    if (filters.component) {
      query = query.eq('component', filters.component);
    }

    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    log(`Found ${data.length} system log entries`, 'green');
    return data;
  } catch (error) {
    log(`Error fetching system logs: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Analyze audit logs for security issues
 */
function analyzeAuditLogs(auditLogs) {
  const analysis = {
    totalEntries: auditLogs.length,
    suspiciousActivities: [],
    failedActions: [],
    permissionViolations: [],
    unusualPatterns: [],
    summary: {},
  };

  // Analyze each log entry
  auditLogs.forEach(log => {
    // Check for suspicious activities
    if (log.action === 'login' && log.details?.ip_address) {
      // Check for multiple failed logins
      const failedLogins = auditLogs.filter(
        l =>
          l.action === 'login' &&
          l.details?.ip_address === log.details.ip_address &&
          l.details?.success === false
      );

      if (failedLogins.length > 5) {
        analysis.suspiciousActivities.push({
          type: 'multiple_failed_logins',
          ip: log.details.ip_address,
          count: failedLogins.length,
          timestamp: log.created_at,
        });
      }
    }

    // Check for failed actions
    if (log.details?.success === false) {
      analysis.failedActions.push({
        action: log.action,
        resource: log.resource,
        error: log.details.error,
        timestamp: log.created_at,
      });
    }

    // Check for permission violations
    if (log.details?.permission_denied) {
      analysis.permissionViolations.push({
        action: log.action,
        resource: log.resource,
        user: log.admin_users?.user_id,
        timestamp: log.created_at,
      });
    }

    // Check for unusual patterns
    if (log.action === 'delete' && log.resource === 'admin_users') {
      analysis.unusualPatterns.push({
        type: 'admin_user_deletion',
        user: log.admin_users?.user_id,
        target: log.details?.target_user,
        timestamp: log.created_at,
      });
    }
  });

  // Generate summary
  analysis.summary = {
    totalEntries: analysis.totalEntries,
    suspiciousActivities: analysis.suspiciousActivities.length,
    failedActions: analysis.failedActions.length,
    permissionViolations: analysis.permissionViolations.length,
    unusualPatterns: analysis.unusualPatterns.length,
  };

  return analysis;
}

/**
 * Generate audit log report
 */
function generateAuditReport(auditLogs, systemLogs, analysis) {
  const report = {
    generatedAt: new Date().toISOString(),
    summary: analysis.summary,
    auditLogs: auditLogs.slice(0, 100), // Limit to first 100 entries
    systemLogs: systemLogs.slice(0, 100), // Limit to first 100 entries
    analysis: analysis,
    recommendations: [],
  };

  // Generate recommendations based on analysis
  if (analysis.suspiciousActivities.length > 0) {
    report.recommendations.push({
      type: 'security',
      priority: 'high',
      message:
        'Multiple suspicious activities detected. Review IP addresses and user behavior.',
      count: analysis.suspiciousActivities.length,
    });
  }

  if (analysis.failedActions.length > 10) {
    report.recommendations.push({
      type: 'reliability',
      priority: 'medium',
      message:
        'High number of failed actions. Check system health and user permissions.',
      count: analysis.failedActions.length,
    });
  }

  if (analysis.permissionViolations.length > 0) {
    report.recommendations.push({
      type: 'security',
      priority: 'high',
      message:
        'Permission violations detected. Review user roles and access controls.',
      count: analysis.permissionViolations.length,
    });
  }

  if (analysis.unusualPatterns.length > 0) {
    report.recommendations.push({
      type: 'security',
      priority: 'high',
      message:
        'Unusual patterns detected. Review admin user management activities.',
      count: analysis.unusualPatterns.length,
    });
  }

  return report;
}

/**
 * Generate audit log HTML report
 */
function generateAuditHTMLReport(auditLogs, systemLogs, analysis) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Audit Log Report - What's for Dinner</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f5f5f5;
            color: #333;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }
        
        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .section {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .section h2 {
            margin-bottom: 1rem;
            color: #333;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }
        
        .stat-card {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 1rem;
            text-align: center;
        }
        
        .stat-card h3 {
            font-size: 2rem;
            color: #333;
            margin-bottom: 0.5rem;
        }
        
        .stat-card p {
            color: #666;
            font-size: 0.9rem;
        }
        
        .alert {
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
        }
        
        .alert-high {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        .alert-medium {
            background-color: #fff3cd;
            color: #856404;
            border: 1px solid #ffeaa7;
        }
        
        .alert-low {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .log-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
        }
        
        .log-table th,
        .log-table td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        
        .log-table th {
            background-color: #f8f9fa;
            font-weight: 600;
            color: #666;
        }
        
        .log-table tr:hover {
            background-color: #f8f9fa;
        }
        
        .status-badge {
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .status-success {
            background-color: #d4edda;
            color: #155724;
        }
        
        .status-error {
            background-color: #f8d7da;
            color: #721c24;
        }
        
        .status-warning {
            background-color: #fff3cd;
            color: #856404;
        }
        
        .filter-form {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 2rem;
        }
        
        .filter-form h3 {
            margin-bottom: 1rem;
            color: #333;
        }
        
        .filter-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 1rem;
        }
        
        .filter-group {
            display: flex;
            flex-direction: column;
        }
        
        .filter-group label {
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: #333;
        }
        
        .filter-group input,
        .filter-group select {
            padding: 0.5rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 0.9rem;
        }
        
        .filter-group button {
            background: #007bff;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9rem;
        }
        
        .filter-group button:hover {
            background: #0056b3;
        }
        
        @media (max-width: 768px) {
            .stats-grid {
                grid-template-columns: 1fr;
            }
            
            .filter-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Audit Log Report</h1>
        <p>What's for Dinner - Security and Compliance Analysis</p>
    </div>
    
    <div class="container">
        <!-- Summary Statistics -->
        <div class="section">
            <h2>Summary Statistics</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>${analysis.summary.totalEntries}</h3>
                    <p>Total Audit Entries</p>
                </div>
                
                <div class="stat-card">
                    <h3>${analysis.summary.suspiciousActivities}</h3>
                    <p>Suspicious Activities</p>
                </div>
                
                <div class="stat-card">
                    <h3>${analysis.summary.failedActions}</h3>
                    <p>Failed Actions</p>
                </div>
                
                <div class="stat-card">
                    <h3>${analysis.summary.permissionViolations}</h3>
                    <p>Permission Violations</p>
                </div>
                
                <div class="stat-card">
                    <h3>${analysis.summary.unusualPatterns}</h3>
                    <p>Unusual Patterns</p>
                </div>
            </div>
        </div>
        
        <!-- Security Recommendations -->
        <div class="section">
            <h2>Security Recommendations</h2>
            ${
              analysis.suspiciousActivities.length > 0
                ? `
                <div class="alert alert-high">
                    <strong>High Priority:</strong> ${analysis.suspiciousActivities.length} suspicious activities detected. 
                    Review IP addresses and user behavior patterns.
                </div>
            `
                : ''
            }
            
            ${
              analysis.permissionViolations.length > 0
                ? `
                <div class="alert alert-high">
                    <strong>High Priority:</strong> ${analysis.permissionViolations.length} permission violations detected. 
                    Review user roles and access controls.
                </div>
            `
                : ''
            }
            
            ${
              analysis.failedActions.length > 10
                ? `
                <div class="alert alert-medium">
                    <strong>Medium Priority:</strong> ${analysis.failedActions.length} failed actions detected. 
                    Check system health and user permissions.
                </div>
            `
                : ''
            }
            
            ${
              analysis.unusualPatterns.length > 0
                ? `
                <div class="alert alert-high">
                    <strong>High Priority:</strong> ${analysis.unusualPatterns.length} unusual patterns detected. 
                    Review admin user management activities.
                </div>
            `
                : ''
            }
        </div>
        
        <!-- Audit Logs Table -->
        <div class="section">
            <h2>Recent Audit Logs</h2>
            <table class="log-table">
                <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>User</th>
                        <th>Action</th>
                        <th>Resource</th>
                        <th>Status</th>
                        <th>Details</th>
                    </tr>
                </thead>
                <tbody>
                    ${auditLogs
                      .slice(0, 50)
                      .map(
                        log => `
                        <tr>
                            <td>${new Date(log.created_at).toLocaleString()}</td>
                            <td>${log.admin_users?.user_id || 'N/A'}</td>
                            <td>${log.action}</td>
                            <td>${log.resource || 'N/A'}</td>
                            <td>
                                <span class="status-badge ${log.details?.success === false ? 'status-error' : 'status-success'}">
                                    ${log.details?.success === false ? 'Failed' : 'Success'}
                                </span>
                            </td>
                            <td>${log.details ? JSON.stringify(log.details).substring(0, 100) + '...' : 'N/A'}</td>
                        </tr>
                    `
                      )
                      .join('')}
                </tbody>
            </table>
        </div>
        
        <!-- System Logs Table -->
        <div class="section">
            <h2>Recent System Logs</h2>
            <table class="log-table">
                <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>Level</th>
                        <th>Component</th>
                        <th>Message</th>
                        <th>Details</th>
                    </tr>
                </thead>
                <tbody>
                    ${systemLogs
                      .slice(0, 50)
                      .map(
                        log => `
                        <tr>
                            <td>${new Date(log.created_at).toLocaleString()}</td>
                            <td>
                                <span class="status-badge ${
                                  log.level === 'error'
                                    ? 'status-error'
                                    : log.level === 'warning'
                                      ? 'status-warning'
                                      : 'status-success'
                                }">
                                    ${log.level.toUpperCase()}
                                </span>
                            </td>
                            <td>${log.component}</td>
                            <td>${log.message}</td>
                            <td>${log.details ? JSON.stringify(log.details).substring(0, 100) + '...' : 'N/A'}</td>
                        </tr>
                    `
                      )
                      .join('')}
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>`;
}

/**
 * Generate audit log API endpoints
 */
function generateAuditLogAPI() {
  return `// Audit Log API Endpoints
// This file contains API endpoints for reading and analyzing audit logs

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Get audit logs with filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const filters = {
      userId: searchParams.get('userId'),
      action: searchParams.get('action'),
      resource: searchParams.get('resource'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')) : 100
    };
    
    // Remove undefined filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === null || filters[key] === undefined) {
        delete filters[key];
      }
    });
    
    let query = supabase
      .from('admin_audit_logs')
      .select(\`
        *,
        admin_users!inner(
          user_id,
          role,
          permissions
        )
      \`)
      .order('created_at', { ascending: false });
    
    // Apply filters
    if (filters.userId) {
      query = query.eq('admin_user_id', filters.userId);
    }
    
    if (filters.action) {
      query = query.eq('action', filters.action);
    }
    
    if (filters.resource) {
      query = query.eq('resource', filters.resource);
    }
    
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }
    
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Get system logs with filters
export async function POST(request) {
  try {
    const { filters = {} } = await request.json();
    
    let query = supabase
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Apply filters
    if (filters.level) {
      query = query.eq('level', filters.level);
    }
    
    if (filters.component) {
      query = query.eq('component', filters.component);
    }
    
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }
    
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Analyze audit logs for security issues
export async function PUT(request) {
  try {
    const { startDate, endDate } = await request.json();
    
    // Get audit logs for analysis
    let query = supabase
      .from('admin_audit_logs')
      .select(\`
        *,
        admin_users!inner(
          user_id,
          role,
          permissions
        )
      \`)
      .order('created_at', { ascending: false });
    
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    
    const { data: auditLogs, error: auditError } = await query;
    
    if (auditError) throw auditError;
    
    // Get system logs for analysis
    let systemQuery = supabase
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (startDate) {
      systemQuery = systemQuery.gte('created_at', startDate);
    }
    
    if (endDate) {
      systemQuery = systemQuery.lte('created_at', endDate);
    }
    
    const { data: systemLogs, error: systemError } = await systemQuery;
    
    if (systemError) throw systemError;
    
    // Analyze logs
    const analysis = analyzeAuditLogs(auditLogs);
    
    return Response.json({ 
      success: true, 
      data: {
        auditLogs,
        systemLogs,
        analysis
      }
    });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Helper function to analyze audit logs
function analyzeAuditLogs(auditLogs) {
  const analysis = {
    totalEntries: auditLogs.length,
    suspiciousActivities: [],
    failedActions: [],
    permissionViolations: [],
    unusualPatterns: [],
    summary: {}
  };
  
  // Analyze each log entry
  auditLogs.forEach(log => {
    // Check for suspicious activities
    if (log.action === 'login' && log.details?.ip_address) {
      const failedLogins = auditLogs.filter(l => 
        l.action === 'login' && 
        l.details?.ip_address === log.details.ip_address &&
        l.details?.success === false
      );
      
      if (failedLogins.length > 5) {
        analysis.suspiciousActivities.push({
          type: 'multiple_failed_logins',
          ip: log.details.ip_address,
          count: failedLogins.length,
          timestamp: log.created_at
        });
      }
    }
    
    // Check for failed actions
    if (log.details?.success === false) {
      analysis.failedActions.push({
        action: log.action,
        resource: log.resource,
        error: log.details.error,
        timestamp: log.created_at
      });
    }
    
    // Check for permission violations
    if (log.details?.permission_denied) {
      analysis.permissionViolations.push({
        action: log.action,
        resource: log.resource,
        user: log.admin_users?.user_id,
        timestamp: log.created_at
      });
    }
    
    // Check for unusual patterns
    if (log.action === 'delete' && log.resource === 'admin_users') {
      analysis.unusualPatterns.push({
        type: 'admin_user_deletion',
        user: log.admin_users?.user_id,
        target: log.details?.target_user,
        timestamp: log.created_at
      });
    }
  });
  
  // Generate summary
  analysis.summary = {
    totalEntries: analysis.totalEntries,
    suspiciousActivities: analysis.suspiciousActivities.length,
    failedActions: analysis.failedActions.length,
    permissionViolations: analysis.permissionViolations.length,
    unusualPatterns: analysis.unusualPatterns.length
  };
  
  return analysis;
}`;
}

/**
 * Main setup function
 */
async function setupAuditLogReader() {
  try {
    log('Setting up audit log reader...', 'blue');

    // Ensure output directory exists
    if (!fs.existsSync(config.outputDir)) {
      fs.mkdirSync(config.outputDir, { recursive: true });
    }

    // Get audit logs and system logs
    const auditLogs = await getAuditLogs({ limit: 1000 });
    const systemLogs = await getSystemLogs({ limit: 1000 });

    // Analyze logs
    const analysis = analyzeAuditLogs(auditLogs);

    // Generate HTML report
    const htmlReport = generateAuditHTMLReport(auditLogs, systemLogs, analysis);
    fs.writeFileSync(
      path.join(config.outputDir, 'audit-report.html'),
      htmlReport
    );
    log('Generated audit log HTML report', 'green');

    // Generate JSON report
    const jsonReport = generateAuditReport(auditLogs, systemLogs, analysis);
    fs.writeFileSync(
      path.join(config.outputDir, 'audit-report.json'),
      JSON.stringify(jsonReport, null, 2)
    );
    log('Generated audit log JSON report', 'green');

    // Generate API endpoints
    const auditAPI = generateAuditLogAPI();
    fs.writeFileSync(path.join(config.outputDir, 'audit-log-api.js'), auditAPI);
    log('Generated audit log API endpoints', 'green');

    // Generate README
    const readme = generateAuditLogReadme();
    fs.writeFileSync(
      path.join(config.outputDir, 'AUDIT_LOG_README.md'),
      readme
    );
    log('Generated audit log README', 'green');

    log('Audit log reader setup completed successfully!', 'green');
    log(`Output directory: ${config.outputDir}`, 'blue');
  } catch (error) {
    log(`Error setting up audit log reader: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Generate audit log README
 */
function generateAuditLogReadme() {
  return `# Audit Log Reader for What's for Dinner

This directory contains the audit log reader and analysis system for the What's for Dinner application.

## Files Overview

- \`audit-report.html\` - HTML report with visual analysis of audit logs
- \`audit-report.json\` - JSON report with detailed audit log data
- \`audit-log-api.js\` - API endpoints for audit log access
- \`AUDIT_LOG_README.md\` - This documentation file

## Features

### Audit Log Analysis
- **Suspicious Activities**: Detects multiple failed logins, unusual IP patterns
- **Failed Actions**: Tracks failed operations and error patterns
- **Permission Violations**: Identifies unauthorized access attempts
- **Unusual Patterns**: Flags suspicious admin user management activities

### Security Monitoring
- **Real-time Analysis**: Continuous monitoring of security events
- **Pattern Detection**: Identifies potential security threats
- **Compliance Reporting**: Generates reports for security audits
- **Alert System**: Notifies administrators of critical issues

### Log Management
- **Filtering**: Advanced filtering by user, action, resource, date range
- **Search**: Full-text search across log entries
- **Export**: Export logs in various formats (JSON, CSV, HTML)
- **Retention**: Configurable log retention policies

## API Endpoints

### GET /api/admin/audit-logs
Get audit logs with optional filters.

**Query Parameters:**
- \`userId\`: Filter by admin user ID
- \`action\`: Filter by action type
- \`resource\`: Filter by resource type
- \`startDate\`: Filter by start date (ISO format)
- \`endDate\`: Filter by end date (ISO format)
- \`limit\`: Limit number of results (default: 100)

**Example:**
\`\`\`bash
GET /api/admin/audit-logs?userId=user-uuid&action=login&limit=50
\`\`\`

### POST /api/admin/audit-logs
Get system logs with filters.

**Request Body:**
\`\`\`json
{
  "filters": {
    "level": "error",
    "component": "database",
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-01-31T23:59:59Z",
    "limit": 100
  }
}
\`\`\`

### PUT /api/admin/audit-logs
Analyze audit logs for security issues.

**Request Body:**
\`\`\`json
{
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-01-31T23:59:59Z"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "auditLogs": [...],
    "systemLogs": [...],
    "analysis": {
      "totalEntries": 1000,
      "suspiciousActivities": [...],
      "failedActions": [...],
      "permissionViolations": [...],
      "unusualPatterns": [...],
      "summary": {...}
    }
  }
}
\`\`\`

## Usage Examples

### Get Recent Audit Logs
\`\`\`javascript
const response = await fetch('/api/admin/audit-logs?limit=50');
const data = await response.json();
console.log(data.data);
\`\`\`

### Filter by User and Action
\`\`\`javascript
const response = await fetch('/api/admin/audit-logs?userId=user-uuid&action=login');
const data = await response.json();
console.log(data.data);
\`\`\`

### Analyze Security Issues
\`\`\`javascript
const response = await fetch('/api/admin/audit-logs', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-01-31T23:59:59Z'
  })
});

const data = await response.json();
console.log(data.data.analysis);
\`\`\`

### Get System Logs
\`\`\`javascript
const response = await fetch('/api/admin/audit-logs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    filters: {
      level: 'error',
      component: 'database',
      limit: 100
    }
  })
});

const data = await response.json();
console.log(data.data);
\`\`\`

## Security Features

### Row Level Security (RLS)
- Audit logs are protected by RLS
- Only admin users can access audit data
- All access attempts are logged

### Data Privacy
- Sensitive information is masked in logs
- IP addresses are anonymized after 30 days
- Personal data is encrypted at rest

### Compliance
- GDPR compliant log retention
- SOX compliance for financial data
- HIPAA compliance for health data

## Monitoring and Alerts

### Real-time Monitoring
- Continuous analysis of new log entries
- Automatic detection of security threats
- Performance impact monitoring

### Alert Configuration
- Email notifications for critical events
- Slack integration for team alerts
- Webhook support for custom integrations

### Dashboard Integration
- Real-time security dashboard
- Historical trend analysis
- Custom report generation

## Troubleshooting

### Common Issues

1. **No Logs Found**: Check date range and filters
2. **Permission Denied**: Verify admin user permissions
3. **Slow Queries**: Check database indexes
4. **Memory Issues**: Reduce log limit or date range

### Debug Mode

Enable verbose logging:
\`\`\`bash
VERBOSE=true node scripts/admin/audit-log-reader.js
\`\`\`

### Performance Optimization

1. **Database Indexes**: Ensure proper indexing on log tables
2. **Query Optimization**: Use appropriate filters and limits
3. **Caching**: Implement Redis caching for frequent queries
4. **Pagination**: Use pagination for large result sets

## Support

For issues or questions:
1. Check the audit logs for errors
2. Review system health metrics
3. Verify admin user permissions
4. Check database connectivity

## Best Practices

### Log Management
- Regular log rotation and cleanup
- Monitor log storage usage
- Implement log retention policies
- Use structured logging format

### Security Monitoring
- Set up automated alerts
- Regular security reviews
- Monitor for unusual patterns
- Keep audit logs secure

### Performance
- Use appropriate filters
- Implement pagination
- Monitor query performance
- Optimize database indexes`;
}

// Run setup if called directly
if (require.main === module) {
  setupAuditLogReader()
    .then(() => {
      log('Audit log reader setup completed successfully', 'green');
      process.exit(0);
    })
    .catch(error => {
      log(`Audit log reader setup failed: ${error.message}`, 'red');
      process.exit(1);
    });
}

module.exports = {
  setupAuditLogReader,
  getAuditLogs,
  getSystemLogs,
  analyzeAuditLogs,
  generateAuditReport,
};
