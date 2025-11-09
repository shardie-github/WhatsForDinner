#!/usr/bin/env node

/**
 * Cost Forecaster
 * Collects metrics from Vercel, Supabase, Expo, GitHub Actions
 * Computes rolling averages and forecasts costs
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export class CostForecaster {
  constructor(supabase, budget) {
    this.supabase = supabase;
    this.budget = budget;
    this.results = {
      timestamp: new Date().toISOString(),
      currentMonthly: 0,
      forecastedMonthly: 0,
      breakdown: {
        supabase: { current: 0, forecasted: 0 },
        vercel: { current: 0, forecasted: 0 },
        expo: { current: 0, forecasted: 0 },
        github: { current: 0, forecasted: 0 }
      },
      trend: 'stable',
      recommendations: []
    };
  }

  async run() {
    try {
      // Get historical usage from metrics_log
      const historicalData = await this.getHistoricalUsage();
      
      // Calculate current costs
      await this.calculateCurrentCosts(historicalData);
      
      // Forecast future costs
      await this.forecastCosts(historicalData);
      
      // Generate recommendations
      this.generateRecommendations();
      
      return this.results;
    } catch (error) {
      console.error('Error in cost forecasting:', error);
      throw error;
    }
  }

  async getHistoricalUsage() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data, error } = await this.supabase
      .from('metrics_log')
      .select('*')
      .gte('ts', thirtyDaysAgo.toISOString())
      .in('source', ['vercel', 'supabase', 'expo', 'github'])
      .order('ts', { ascending: false });
    
    if (error) {
      console.warn('Could not fetch historical usage:', error.message);
      return [];
    }
    
    return data || [];
  }

  async calculateCurrentCosts(historicalData) {
    // Group by source and calculate costs
    const costsBySource = {
      supabase: [],
      vercel: [],
      expo: [],
      github: []
    };
    
    historicalData.forEach(record => {
      const source = record.source;
      if (costsBySource[source]) {
        const cost = record.metric?.cost_usd || record.metric?.cost || 0;
        if (cost > 0) {
          costsBySource[source].push(cost);
        }
      }
    });
    
    // Calculate monthly averages (extrapolate from available data)
    const daysOfData = Math.min(30, historicalData.length > 0 ? 
      Math.ceil((new Date() - new Date(historicalData[historicalData.length - 1].ts)) / (1000 * 60 * 60 * 24)) : 1);
    
    Object.keys(costsBySource).forEach(source => {
      const costs = costsBySource[source];
      if (costs.length > 0) {
        const dailyAvg = costs.reduce((sum, c) => sum + c, 0) / daysOfData;
        const monthly = dailyAvg * 30;
        this.results.breakdown[source].current = Math.round(monthly * 100) / 100;
      }
    });
    
    // Also check usage_logs table for Supabase costs
    await this.getSupabaseUsageFromLogs();
    
    // Calculate total
    this.results.currentMonthly = Object.values(this.results.breakdown)
      .reduce((sum, b) => sum + b.current, 0);
  }

  async getSupabaseUsageFromLogs() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data } = await this.supabase
        .from('usage_logs')
        .select('cost_usd, timestamp')
        .gte('timestamp', thirtyDaysAgo.toISOString());
      
      if (data && data.length > 0) {
        const totalCost = data.reduce((sum, log) => sum + (parseFloat(log.cost_usd) || 0), 0);
        // Extrapolate to monthly if we have partial data
        const daysOfData = Math.min(30, Math.ceil((new Date() - new Date(data[data.length - 1].timestamp)) / (1000 * 60 * 60 * 24)));
        const monthly = (totalCost / daysOfData) * 30;
        this.results.breakdown.supabase.current = Math.max(
          this.results.breakdown.supabase.current,
          Math.round(monthly * 100) / 100
        );
      }
    } catch (error) {
      // usage_logs table might not exist - not critical
      console.warn('Could not fetch usage_logs:', error.message);
    }
  }

  async forecastCosts(historicalData) {
    // Simple linear regression for forecasting
    // Group by source and calculate trend
    const trends = {};
    
    ['supabase', 'vercel', 'expo', 'github'].forEach(source => {
      const sourceData = historicalData.filter(d => d.source === source);
      if (sourceData.length >= 7) {
        // Calculate trend over last 7 days
        const recent = sourceData.slice(0, 7);
        const costs = recent.map(d => d.metric?.cost_usd || d.metric?.cost || 0);
        const avgCost = costs.reduce((sum, c) => sum + c, 0) / costs.length;
        const trend = this.calculateTrend(costs);
        
        trends[source] = {
          current: avgCost * 30, // monthly projection
          trend: trend
        };
      } else {
        // Use current as forecast if not enough data
        trends[source] = {
          current: this.results.breakdown[source].current,
          trend: 'stable'
        };
      }
    });
    
    // Forecast next month
    Object.keys(trends).forEach(source => {
      const trend = trends[source];
      let forecasted = trend.current;
      
      if (trend.trend === 'increasing') {
        forecasted = trend.current * 1.1; // 10% increase
      } else if (trend.trend === 'decreasing') {
        forecasted = trend.current * 0.95; // 5% decrease
      }
      
      this.results.breakdown[source].forecasted = Math.round(forecasted * 100) / 100;
    });
    
    this.results.forecastedMonthly = Object.values(this.results.breakdown)
      .reduce((sum, b) => sum + b.forecasted, 0);
    
    // Determine overall trend
    if (this.results.forecastedMonthly > this.results.currentMonthly * 1.05) {
      this.results.trend = 'increasing';
    } else if (this.results.forecastedMonthly < this.results.currentMonthly * 0.95) {
      this.results.trend = 'decreasing';
    } else {
      this.results.trend = 'stable';
    }
  }

  calculateTrend(values) {
    if (values.length < 2) return 'stable';
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length;
    
    const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (change > 5) return 'increasing';
    if (change < -5) return 'decreasing';
    return 'stable';
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Budget check
    if (this.results.forecastedMonthly > this.budget) {
      const overage = this.results.forecastedMonthly - this.budget;
      recommendations.push({
        type: 'budget',
        severity: 'high',
        message: `Forecasted cost ($${this.results.forecastedMonthly.toFixed(2)}) exceeds budget ($${this.budget}) by $${overage.toFixed(2)}`,
        actions: [
          'Review caching strategies',
          'Optimize database queries',
          'Consider connection pooling',
          'Review Vercel function execution time'
        ]
      });
    }
    
    // High cost services
    Object.entries(this.results.breakdown).forEach(([service, costs]) => {
      if (costs.forecasted > this.budget * 0.4) {
        recommendations.push({
          type: 'optimization',
          severity: 'medium',
          message: `${service} forecasted cost ($${costs.forecasted.toFixed(2)}) is high`,
          actions: [
            `Review ${service} usage patterns`,
            `Implement caching for ${service}`,
            `Optimize ${service} queries/requests`
          ]
        });
      }
    });
    
    // Increasing trend
    if (this.results.trend === 'increasing') {
      recommendations.push({
        type: 'trend',
        severity: 'medium',
        message: 'Cost trend is increasing',
        actions: [
          'Monitor usage patterns',
          'Review recent deployments',
          'Check for resource leaks'
        ]
      });
    }
    
    this.results.recommendations = recommendations;
  }
}
