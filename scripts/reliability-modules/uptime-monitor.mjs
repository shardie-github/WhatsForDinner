#!/usr/bin/env node

/**
 * Uptime Monitor
 * Pings /api/health every 6h and records latency
 * Detects downtime > 2min and creates alerts
 */

import https from 'https';
import http from 'http';

export class UptimeMonitor {
  constructor(supabase, config) {
    this.supabase = supabase;
    this.config = config;
    this.results = {
      timestamp: new Date().toISOString(),
      uptime: 1.0,
      avgLatency: 0,
      downtime: 0,
      checks: [],
      alerts: []
    };
  }

  async run() {
    try {
      // Get health check endpoint URL
      const healthUrl = process.env.HEALTH_CHECK_URL || 
                       process.env.NEXT_PUBLIC_SITE_URL + '/api/health' ||
                       'http://localhost:3000/api/health';
      
      // Perform health check
      const checkResult = await this.performHealthCheck(healthUrl);
      
      // Store in metrics_log
      await this.storeHealthCheck(checkResult);
      
      // Get historical data for uptime calculation
      await this.calculateUptime();
      
      // Check for downtime alerts
      await this.checkDowntimeAlerts();
      
      return this.results;
    } catch (error) {
      console.error('Error in uptime monitoring:', error);
      throw error;
    }
  }

  async performHealthCheck(url) {
    const startTime = Date.now();
    
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      
      const req = client.get(url, { timeout: 10000 }, (res) => {
        const latency = Date.now() - startTime;
        const status = res.statusCode;
        
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          const isHealthy = status >= 200 && status < 300;
          
          resolve({
            timestamp: new Date().toISOString(),
            url,
            status,
            latency,
            healthy: isHealthy,
            response: data.substring(0, 500) // Truncate response
          });
        });
      });
      
      req.on('error', (error) => {
        const latency = Date.now() - startTime;
        resolve({
          timestamp: new Date().toISOString(),
          url,
          status: 0,
          latency,
          healthy: false,
          error: error.message
        });
      });
      
      req.on('timeout', () => {
        req.destroy();
        const latency = Date.now() - startTime;
        resolve({
          timestamp: new Date().toISOString(),
          url,
          status: 0,
          latency,
          healthy: false,
          error: 'Timeout'
        });
      });
    });
  }

  async storeHealthCheck(checkResult) {
    this.results.checks.push(checkResult);
    
    // Store in metrics_log
    await this.supabase.from('metrics_log').insert({
      source: 'healthcheck',
      metric: {
        type: 'health_check',
        url: checkResult.url,
        status: checkResult.status,
        latency: checkResult.latency,
        healthy: checkResult.healthy,
        error: checkResult.error
      },
      ts: checkResult.timestamp
    });
  }

  async calculateUptime() {
    // Get health checks from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data } = await this.supabase
      .from('metrics_log')
      .select('*')
      .eq('source', 'healthcheck')
      .gte('ts', sevenDaysAgo.toISOString())
      .order('ts', { ascending: false });
    
    if (!data || data.length === 0) {
      // Use current check only
      const currentCheck = this.results.checks[0];
      this.results.uptime = currentCheck?.healthy ? 1.0 : 0.0;
      this.results.avgLatency = currentCheck?.latency || 0;
      return;
    }
    
    // Calculate uptime percentage
    const healthyChecks = data.filter(d => d.metric?.healthy !== false);
    this.results.uptime = healthyChecks.length / data.length;
    
    // Calculate average latency
    const latencies = data
      .map(d => d.metric?.latency)
      .filter(l => l !== undefined && l > 0);
    
    if (latencies.length > 0) {
      this.results.avgLatency = Math.round(
        latencies.reduce((sum, l) => sum + l, 0) / latencies.length
      );
    }
    
    // Calculate downtime (in milliseconds)
    const downtimePeriods = [];
    let lastHealthyTime = null;
    
    data.reverse().forEach(check => {
      const checkTime = new Date(check.ts);
      if (check.metric?.healthy === false) {
        if (lastHealthyTime) {
          downtimePeriods.push(checkTime - lastHealthyTime);
        }
      } else {
        lastHealthyTime = checkTime;
      }
    });
    
    this.results.downtime = downtimePeriods.reduce((sum, d) => sum + d, 0);
  }

  async checkDowntimeAlerts() {
    // Check if downtime exceeds threshold
    if (this.results.downtime > this.config.downtimeThreshold) {
      const alert = {
        type: 'downtime',
        severity: 'high',
        message: `Downtime detected: ${Math.round(this.results.downtime / 1000)}s exceeds threshold of ${Math.round(this.config.downtimeThreshold / 1000)}s`,
        timestamp: new Date().toISOString()
      };
      
      this.results.alerts.push(alert);
      
      // Send webhook if configured
      const webhookUrl = process.env.RELIABILITY_ALERT_WEBHOOK;
      if (webhookUrl) {
        await this.sendWebhookAlert(webhookUrl, alert);
      }
    }
    
    // Check if uptime is below threshold
    if (this.results.uptime < this.config.uptimeThreshold) {
      const alert = {
        type: 'uptime',
        severity: 'high',
        message: `Uptime ${(this.results.uptime * 100).toFixed(3)}% is below threshold of ${(this.config.uptimeThreshold * 100).toFixed(2)}%`,
        timestamp: new Date().toISOString()
      };
      
      this.results.alerts.push(alert);
      
      const webhookUrl = process.env.RELIABILITY_ALERT_WEBHOOK;
      if (webhookUrl) {
        await this.sendWebhookAlert(webhookUrl, alert);
      }
    }
  }

  async sendWebhookAlert(webhookUrl, alert) {
    try {
      const https = await import('https');
      const http = await import('http');
      const url = new URL(webhookUrl);
      const client = url.protocol === 'https:' ? https : http;
      
      const payload = JSON.stringify({
        text: `🚨 Reliability Alert: ${alert.message}`,
        alert: alert,
        timestamp: alert.timestamp
      });
      
      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      };
      
      return new Promise((resolve, reject) => {
        const req = client.request(options, (res) => {
          resolve();
        });
        
        req.on('error', reject);
        req.write(payload);
        req.end();
      });
    } catch (error) {
      console.warn('Failed to send webhook alert:', error.message);
    }
  }
}
