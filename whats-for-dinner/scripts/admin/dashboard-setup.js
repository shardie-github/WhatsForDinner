#!/usr/bin/env node

/**
 * Admin Dashboard Setup Script
 * Sets up the admin dashboard with analytics views and role-based access
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  supabaseUrl: process.env.SUPABASE_URL || 'http://localhost:54321',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  outputDir: path.join(__dirname, '../admin-dashboard'),
  verbose: process.env.VERBOSE === 'true'
};

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
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
 * Create admin user
 */
async function createAdminUser(userId, role = 'admin', permissions = {}) {
  try {
    log(`Creating admin user with role: ${role}`, 'yellow');
    
    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        user_id: userId,
        role: role,
        permissions: permissions,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    
    log(`Admin user created successfully: ${data.id}`, 'green');
    return data;
  } catch (error) {
    log(`Error creating admin user: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Get dashboard statistics
 */
async function getDashboardStats() {
  try {
    log('Fetching dashboard statistics...', 'yellow');
    
    const { data, error } = await supabase
      .rpc('get_admin_dashboard_stats');

    if (error) throw error;
    
    log('Dashboard statistics fetched successfully', 'green');
    return data;
  } catch (error) {
    log(`Error fetching dashboard stats: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Get user activity trends
 */
async function getUserActivityTrends(days = 30) {
  try {
    log(`Fetching user activity trends for last ${days} days...`, 'yellow');
    
    const { data, error } = await supabase
      .rpc('get_user_activity_trends', { days });

    if (error) throw error;
    
    log('User activity trends fetched successfully', 'green');
    return data;
  } catch (error) {
    log(`Error fetching user activity trends: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Get popular content
 */
async function getPopularContent(limit = 10) {
  try {
    log(`Fetching popular content (limit: ${limit})...`, 'yellow');
    
    const { data, error } = await supabase
      .rpc('get_popular_content', { limit_count: limit });

    if (error) throw error;
    
    log('Popular content fetched successfully', 'green');
    return data;
  } catch (error) {
    log(`Error fetching popular content: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Get system health metrics
 */
async function getSystemHealthMetrics() {
  try {
    log('Fetching system health metrics...', 'yellow');
    
    const { data, error } = await supabase
      .rpc('get_system_health_metrics');

    if (error) throw error;
    
    log('System health metrics fetched successfully', 'green');
    return data;
  } catch (error) {
    log(`Error fetching system health metrics: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Generate admin dashboard HTML
 */
function generateAdminDashboardHTML(stats, trends, popularContent, healthMetrics) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>What's for Dinner - Admin Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
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
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .stat-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s;
        }
        
        .stat-card:hover {
            transform: translateY(-2px);
        }
        
        .stat-card h3 {
            color: #666;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 0.5rem;
        }
        
        .stat-card .value {
            font-size: 2rem;
            font-weight: bold;
            color: #333;
            margin-bottom: 0.5rem;
        }
        
        .stat-card .change {
            font-size: 0.9rem;
            color: #28a745;
        }
        
        .chart-container {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .chart-container h3 {
            margin-bottom: 1rem;
            color: #333;
        }
        
        .content-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
        }
        
        .table-container {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .table-container h3 {
            margin-bottom: 1rem;
            color: #333;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        th, td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        
        th {
            background-color: #f8f9fa;
            font-weight: 600;
            color: #666;
        }
        
        .status-badge {
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .status-active {
            background-color: #d4edda;
            color: #155724;
        }
        
        .status-inactive {
            background-color: #f8d7da;
            color: #721c24;
        }
        
        .status-dormant {
            background-color: #fff3cd;
            color: #856404;
        }
        
        @media (max-width: 768px) {
            .content-grid {
                grid-template-columns: 1fr;
            }
            
            .stats-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>What's for Dinner</h1>
        <p>Admin Dashboard</p>
    </div>
    
    <div class="container">
        <!-- Statistics Cards -->
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Total Users</h3>
                <div class="value">${stats.total_users || 0}</div>
                <div class="change">+${stats.active_users || 0} active</div>
            </div>
            
            <div class="stat-card">
                <h3>Total Meals</h3>
                <div class="value">${stats.total_meals || 0}</div>
                <div class="change">${stats.meals_today || 0} today</div>
            </div>
            
            <div class="stat-card">
                <h3>Recipes</h3>
                <div class="value">${stats.total_recipes || 0}</div>
                <div class="change">${stats.published_recipes || 0} published</div>
            </div>
            
            <div class="stat-card">
                <h3>Success Rate</h3>
                <div class="value">${((stats.success_rate || 0) * 100).toFixed(1)}%</div>
                <div class="change">Meal generation</div>
            </div>
            
            <div class="stat-card">
                <h3>Ingredients</h3>
                <div class="value">${stats.total_ingredients || 0}</div>
                <div class="change">${stats.available_ingredients || 0} available</div>
            </div>
            
            <div class="stat-card">
                <h3>Avg Response Time</h3>
                <div class="value">${(stats.avg_response_time || 0).toFixed(0)}ms</div>
                <div class="change">Last 24 hours</div>
            </div>
        </div>
        
        <!-- Charts -->
        <div class="chart-container">
            <h3>User Activity Trends</h3>
            <canvas id="activityChart" width="400" height="200"></canvas>
        </div>
        
        <div class="content-grid">
            <!-- Popular Content -->
            <div class="table-container">
                <h3>Popular Content</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Name</th>
                            <th>Usage</th>
                            <th>Rating</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${popularContent.map(item => `
                            <tr>
                                <td>${item.content_type}</td>
                                <td>${item.name}</td>
                                <td>${item.usage_count}</td>
                                <td>${item.rating ? item.rating.toFixed(1) : 'N/A'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <!-- System Health -->
            <div class="table-container">
                <h3>System Health</h3>
                <table>
                    <tbody>
                        <tr>
                            <td>Database Size</td>
                            <td>${healthMetrics.database_size || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td>Active Connections</td>
                            <td>${healthMetrics.active_connections || 0} / ${healthMetrics.max_connections || 0}</td>
                        </tr>
                        <tr>
                            <td>Cache Hit Ratio</td>
                            <td>${healthMetrics.cache_hit_ratio || 0}%</td>
                        </tr>
                        <tr>
                            <td>Slow Queries</td>
                            <td>${healthMetrics.slow_queries || 0}</td>
                        </tr>
                        <tr>
                            <td>Error Rate</td>
                            <td>${healthMetrics.error_rate || 0}%</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    
    <script>
        // Activity Chart
        const ctx = document.getElementById('activityChart').getContext('2d');
        const activityData = ${JSON.stringify(trends)};
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: activityData.map(item => new Date(item.date).toLocaleDateString()),
                datasets: [{
                    label: 'New Users',
                    data: activityData.map(item => item.new_users),
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.1
                }, {
                    label: 'Active Users',
                    data: activityData.map(item => item.active_users),
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    tension: 0.1
                }, {
                    label: 'Total Meals',
                    data: activityData.map(item => item.total_meals),
                    borderColor: 'rgb(54, 162, 235)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    </script>
</body>
</html>`;
}

/**
 * Generate admin dashboard API endpoints
 */
function generateAdminAPIEndpoints() {
  return `// Admin Dashboard API Endpoints
// This file contains all the API endpoints for the admin dashboard

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Get dashboard statistics
export async function GET() {
  try {
    const { data, error } = await supabase
      .rpc('get_admin_dashboard_stats');

    if (error) throw error;

    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Get user activity trends
export async function POST(request) {
  try {
    const { days = 30 } = await request.json();
    
    const { data, error } = await supabase
      .rpc('get_user_activity_trends', { days });

    if (error) throw error;

    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Get popular content
export async function PUT(request) {
  try {
    const { limit = 10 } = await request.json();
    
    const { data, error } = await supabase
      .rpc('get_popular_content', { limit_count: limit });

    if (error) throw error;

    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Get system health metrics
export async function PATCH() {
  try {
    const { data, error } = await supabase
      .rpc('get_system_health_metrics');

    if (error) throw error;

    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}`;
}

/**
 * Generate admin dashboard React components
 */
function generateAdminReactComponents() {
  return `// Admin Dashboard React Components
// This file contains React components for the admin dashboard

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Dashboard Stats Component
export function DashboardStats({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_users || 0}</div>
          <p className="text-xs text-muted-foreground">
            +{stats.active_users || 0} active users
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Meals</CardTitle>
          <Utensils className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_meals || 0}</div>
          <p className="text-xs text-muted-foreground">
            {stats.meals_today || 0} generated today
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {((stats.success_rate || 0) * 100).toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            Meal generation success
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// User Activity Chart Component
export function UserActivityChart({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Activity Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="new_users" stroke="#8884d8" />
            <Line type="monotone" dataKey="active_users" stroke="#82ca9d" />
            <Line type="monotone" dataKey="total_meals" stroke="#ffc658" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Popular Content Table Component
export function PopularContentTable({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Popular Content</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Badge variant={item.content_type === 'recipe' ? 'default' : 'secondary'}>
                  {item.content_type}
                </Badge>
                <span className="font-medium">{item.name}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{item.usage_count} uses</div>
                {item.rating && (
                  <div className="text-xs text-muted-foreground">
                    {item.rating.toFixed(1)} rating
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// System Health Component
export function SystemHealth({ metrics }) {
  const getHealthStatus = (value, threshold) => {
    if (value < threshold) return 'good';
    if (value < threshold * 1.5) return 'warning';
    return 'critical';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Health</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Database Size</span>
            <span className="text-sm text-muted-foreground">{metrics.database_size}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Active Connections</span>
            <span className="text-sm text-muted-foreground">
              {metrics.active_connections} / {metrics.max_connections}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Cache Hit Ratio</span>
            <Badge variant={getHealthStatus(metrics.cache_hit_ratio, 90)}>
              {metrics.cache_hit_ratio}%
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Slow Queries</span>
            <Badge variant={getHealthStatus(metrics.slow_queries, 5)}>
              {metrics.slow_queries}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Error Rate</span>
            <Badge variant={getHealthStatus(metrics.error_rate, 5)}>
              {metrics.error_rate}%
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Admin Dashboard Component
export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [popularContent, setPopularContent] = useState([]);
  const [healthMetrics, setHealthMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, trendsRes, contentRes, healthRes] = await Promise.all([
          fetch('/api/admin/dashboard-stats'),
          fetch('/api/admin/user-activity-trends', { method: 'POST', body: JSON.stringify({ days: 30 }) }),
          fetch('/api/admin/popular-content', { method: 'PUT', body: JSON.stringify({ limit: 10 }) }),
          fetch('/api/admin/system-health', { method: 'PATCH' })
        ]);

        const [statsData, trendsData, contentData, healthData] = await Promise.all([
          statsRes.json(),
          trendsRes.json(),
          contentRes.json(),
          healthRes.json()
        ]);

        setStats(statsData.data);
        setTrends(trendsData.data);
        setPopularContent(contentData.data);
        setHealthMetrics(healthData.data);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading admin dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor and manage your What's for Dinner application
        </p>
      </div>

      <DashboardStats stats={stats} />
      
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
        </TabsList>
        
        <TabsContent value="activity">
          <UserActivityChart data={trends} />
        </TabsContent>
        
        <TabsContent value="content">
          <PopularContentTable data={popularContent} />
        </TabsContent>
        
        <TabsContent value="health">
          <SystemHealth metrics={healthMetrics} />
        </TabsContent>
      </Tabs>
    </div>
  );
}`;
}

/**
 * Main setup function
 */
async function setupAdminDashboard() {
  try {
    log('Setting up admin dashboard...', 'blue');
    
    // Ensure output directory exists
    if (!fs.existsSync(config.outputDir)) {
      fs.mkdirSync(config.outputDir, { recursive: true });
    }
    
    // Fetch dashboard data
    const stats = await getDashboardStats();
    const trends = await getUserActivityTrends(30);
    const popularContent = await getPopularContent(10);
    const healthMetrics = await getSystemHealthMetrics();
    
    // Generate HTML dashboard
    const htmlDashboard = generateAdminDashboardHTML(stats, trends, popularContent, healthMetrics);
    fs.writeFileSync(path.join(config.outputDir, 'dashboard.html'), htmlDashboard);
    log('Generated HTML dashboard', 'green');
    
    // Generate API endpoints
    const apiEndpoints = generateAdminAPIEndpoints();
    fs.writeFileSync(path.join(config.outputDir, 'api-endpoints.js'), apiEndpoints);
    log('Generated API endpoints', 'green');
    
    // Generate React components
    const reactComponents = generateAdminReactComponents();
    fs.writeFileSync(path.join(config.outputDir, 'react-components.tsx'), reactComponents);
    log('Generated React components', 'green');
    
    // Generate README
    const readme = generateAdminReadme();
    fs.writeFileSync(path.join(config.outputDir, 'README.md'), readme);
    log('Generated README', 'green');
    
    log('Admin dashboard setup completed successfully!', 'green');
    log(`Output directory: ${config.outputDir}`, 'blue');
    
  } catch (error) {
    log(`Error setting up admin dashboard: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Generate admin dashboard README
 */
function generateAdminReadme() {
  return `# Admin Dashboard for What's for Dinner

This directory contains the admin dashboard setup for the What's for Dinner application.

## Files Overview

- \`dashboard.html\` - Standalone HTML dashboard with charts and statistics
- \`api-endpoints.js\` - API endpoints for admin dashboard data
- \`react-components.tsx\` - React components for admin dashboard
- \`README.md\` - This documentation file

## Features

### Dashboard Statistics
- Total users and active users
- Total meals and daily meal generation
- Recipe and ingredient counts
- Success rates and performance metrics

### User Activity Trends
- New user registrations over time
- Active user engagement
- Meal generation trends
- Interactive charts and visualizations

### Popular Content
- Most used recipes
- Most popular ingredients
- Usage statistics and ratings
- Content performance metrics

### System Health
- Database size and performance
- Connection pool status
- Cache hit ratios
- Error rates and slow queries

## Setup Instructions

### 1. Database Setup
Run the admin dashboard migration:
\`\`\`sql
-- Run the migration
\\i supabase/migrations/009_admin_dashboard_schema.sql
\`\`\`

### 2. Create Admin User
\`\`\`sql
-- Insert admin user (replace with actual user ID)
INSERT INTO admin_users (user_id, role, permissions) 
VALUES ('your-user-id-here', 'super_admin', '{"all": true}');
\`\`\`

### 3. Deploy API Endpoints
Copy the API endpoints to your Next.js API routes:
\`\`\`bash
cp api-endpoints.js src/app/api/admin/dashboard-stats/route.js
\`\`\`

### 4. Deploy React Components
Copy the React components to your admin dashboard:
\`\`\`bash
cp react-components.tsx src/components/admin/AdminDashboard.tsx
\`\`\`

### 5. Access Dashboard
Open the HTML dashboard in your browser:
\`\`\`bash
open dashboard.html
\`\`\`

## API Endpoints

### GET /api/admin/dashboard-stats
Returns overall dashboard statistics.

### POST /api/admin/user-activity-trends
Returns user activity trends for specified number of days.

### PUT /api/admin/popular-content
Returns popular content with specified limit.

### PATCH /api/admin/system-health
Returns system health metrics.

## Security

The admin dashboard uses Row Level Security (RLS) to ensure:
- Only admin users can access admin data
- Super admins have full access
- Regular admins have limited access
- All actions are logged in audit logs

## Monitoring

The dashboard includes:
- Real-time performance metrics
- Error rate monitoring
- User engagement tracking
- System health indicators

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure user has admin role
2. **Data Not Loading**: Check database connections
3. **Charts Not Rendering**: Verify Chart.js is loaded
4. **API Errors**: Check Supabase configuration

### Debug Mode

Enable verbose logging:
\`\`\`bash
VERBOSE=true node scripts/admin/dashboard-setup.js
\`\`\`

## Support

For issues or questions:
1. Check the audit logs
2. Review system health metrics
3. Verify admin user permissions
4. Check database connectivity`;
}

// Run setup if called directly
if (require.main === module) {
  setupAdminDashboard()
    .then(() => {
      log('Admin dashboard setup completed successfully', 'green');
      process.exit(0);
    })
    .catch(error => {
      log(`Admin dashboard setup failed: ${error.message}`, 'red');
      process.exit(1);
    });
}

module.exports = { setupAdminDashboard };