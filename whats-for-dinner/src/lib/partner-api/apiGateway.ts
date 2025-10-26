/**
 * Partner API Gateway
 * Provides REST, GraphQL, and OpenAPI endpoints for B2B partners
 */

import { createClient } from '../supabaseClient';
import { z } from 'zod';

export interface APIKey {
  id: string;
  key: string;
  name: string;
  partnerId: string;
  permissions: string[];
  rateLimit: {
    requests: number;
    window: number; // in seconds
  };
  isActive: boolean;
  createdAt: string;
  lastUsed?: string;
}

export interface Partner {
  id: string;
  name: string;
  email: string;
  website?: string;
  description?: string;
  tier: 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended';
  apiKeys: APIKey[];
  webhooks: Webhook[];
  createdAt: string;
  updatedAt: string;
}

export interface Webhook {
  id: string;
  partnerId: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  createdAt: string;
}

export interface APIRequest {
  id: string;
  partnerId: string;
  apiKeyId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: string;
  userAgent?: string;
  ipAddress?: string;
}

class PartnerAPIGateway {
  private supabase = createClient();
  private rateLimitCache = new Map<string, { count: number; resetTime: number }>();

  /**
   * Authenticate API request
   */
  async authenticateRequest(apiKey: string): Promise<{ partner: Partner; apiKey: APIKey } | null> {
    try {
      const { data: keyData, error } = await this.supabase
        .from('api_keys')
        .select(`
          *,
          partner:partners(*)
        `)
        .eq('key', apiKey)
        .eq('is_active', true)
        .single();

      if (error || !keyData) {
        return null;
      }

      // Check rate limit
      if (!this.checkRateLimit(apiKey, keyData.rate_limit)) {
        throw new Error('Rate limit exceeded');
      }

      // Update last used
      await this.supabase
        .from('api_keys')
        .update({ last_used: new Date().toISOString() })
        .eq('id', keyData.id);

      return {
        partner: keyData.partner,
        apiKey: keyData
      };
    } catch (error) {
      console.error('API authentication error:', error);
      return null;
    }
  }

  /**
   * Check rate limit for API key
   */
  private checkRateLimit(apiKey: string, rateLimit: { requests: number; window: number }): boolean {
    const now = Date.now();
    const key = `rate_limit:${apiKey}`;
    const cached = this.rateLimitCache.get(key);

    if (!cached || now > cached.resetTime) {
      // Reset or initialize
      this.rateLimitCache.set(key, {
        count: 1,
        resetTime: now + (rateLimit.window * 1000)
      });
      return true;
    }

    if (cached.count >= rateLimit.requests) {
      return false;
    }

    cached.count++;
    return true;
  }

  /**
   * Log API request
   */
  async logRequest(
    partnerId: string,
    apiKeyId: string,
    endpoint: string,
    method: string,
    statusCode: number,
    responseTime: number,
    userAgent?: string,
    ipAddress?: string
  ): Promise<void> {
    try {
      await this.supabase
        .from('api_requests')
        .insert({
          partner_id: partnerId,
          api_key_id: apiKeyId,
          endpoint,
          method,
          status_code: statusCode,
          response_time: responseTime,
          user_agent: userAgent,
          ip_address: ipAddress,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging API request:', error);
    }
  }

  /**
   * Create new partner
   */
  async createPartner(partnerData: {
    name: string;
    email: string;
    website?: string;
    description?: string;
    tier: 'basic' | 'pro' | 'enterprise';
  }): Promise<Partner> {
    try {
      const { data, error } = await this.supabase
        .from('partners')
        .insert({
          ...partnerData,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating partner:', error);
      throw error;
    }
  }

  /**
   * Generate API key for partner
   */
  async generateAPIKey(
    partnerId: string,
    name: string,
    permissions: string[],
    rateLimit: { requests: number; window: number }
  ): Promise<APIKey> {
    try {
      const key = this.generateSecureKey();
      
      const { data, error } = await this.supabase
        .from('api_keys')
        .insert({
          key,
          name,
          partner_id: partnerId,
          permissions,
          rate_limit: rateLimit,
          is_active: true,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error generating API key:', error);
      throw error;
    }
  }

  /**
   * Generate secure API key
   */
  private generateSecureKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'wfd_';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Get partner API keys
   */
  async getPartnerAPIKeys(partnerId: string): Promise<APIKey[]> {
    try {
      const { data, error } = await this.supabase
        .from('api_keys')
        .select('*')
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error getting API keys:', error);
      return [];
    }
  }

  /**
   * Revoke API key
   */
  async revokeAPIKey(apiKeyId: string): Promise<void> {
    try {
      await this.supabase
        .from('api_keys')
        .update({ is_active: false })
        .eq('id', apiKeyId);
    } catch (error) {
      console.error('Error revoking API key:', error);
      throw error;
    }
  }

  /**
   * Get API usage statistics
   */
  async getAPIUsageStats(partnerId: string, timeframe: 'day' | 'week' | 'month' = 'day'): Promise<{
    totalRequests: number;
    successRate: number;
    averageResponseTime: number;
    topEndpoints: Array<{ endpoint: string; count: number }>;
    errors: Array<{ statusCode: number; count: number }>;
  }> {
    try {
      const timeframes = {
        day: 1,
        week: 7,
        month: 30
      };

      const days = timeframes[timeframe];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: requests, error } = await this.supabase
        .from('api_requests')
        .select('*')
        .eq('partner_id', partnerId)
        .gte('created_at', startDate.toISOString());

      if (error) {
        throw error;
      }

      const totalRequests = requests?.length || 0;
      const successfulRequests = requests?.filter(r => r.status_code >= 200 && r.status_code < 300).length || 0;
      const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;
      const averageResponseTime = requests?.reduce((sum, r) => sum + r.response_time, 0) / totalRequests || 0;

      // Top endpoints
      const endpointCounts = requests?.reduce((acc, r) => {
        acc[r.endpoint] = (acc[r.endpoint] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const topEndpoints = Object.entries(endpointCounts)
        .map(([endpoint, count]) => ({ endpoint, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Error breakdown
      const errorCounts = requests?.reduce((acc, r) => {
        if (r.status_code >= 400) {
          acc[r.status_code] = (acc[r.status_code] || 0) + 1;
        }
        return acc;
      }, {} as Record<number, number>) || {};

      const errors = Object.entries(errorCounts)
        .map(([statusCode, count]) => ({ statusCode: parseInt(statusCode), count }))
        .sort((a, b) => b.count - a.count);

      return {
        totalRequests,
        successRate,
        averageResponseTime,
        topEndpoints,
        errors
      };
    } catch (error) {
      console.error('Error getting API usage stats:', error);
      return {
        totalRequests: 0,
        successRate: 0,
        averageResponseTime: 0,
        topEndpoints: [],
        errors: []
      };
    }
  }

  /**
   * Send webhook notification
   */
  async sendWebhook(partnerId: string, event: string, data: any): Promise<void> {
    try {
      const { data: webhooks, error } = await this.supabase
        .from('webhooks')
        .select('*')
        .eq('partner_id', partnerId)
        .eq('is_active', true)
        .contains('events', [event]);

      if (error || !webhooks) {
        return;
      }

      for (const webhook of webhooks) {
        try {
          const signature = this.generateWebhookSignature(JSON.stringify(data), webhook.secret);
          
          await fetch(webhook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Signature': signature,
              'X-Webhook-Event': event,
              'User-Agent': 'What\'s for Dinner API/1.0'
            },
            body: JSON.stringify({
              event,
              data,
              timestamp: new Date().toISOString()
            })
          });
        } catch (error) {
          console.error(`Error sending webhook to ${webhook.url}:`, error);
        }
      }
    } catch (error) {
      console.error('Error sending webhook:', error);
    }
  }

  /**
   * Generate webhook signature
   */
  private generateWebhookSignature(payload: string, secret: string): string {
    // In a real implementation, you would use HMAC-SHA256
    return `sha256=${Buffer.from(payload + secret).toString('base64')}`;
  }

  /**
   * Create webhook
   */
  async createWebhook(
    partnerId: string,
    url: string,
    events: string[],
    secret: string
  ): Promise<Webhook> {
    try {
      const { data, error } = await this.supabase
        .from('webhooks')
        .insert({
          partner_id: partnerId,
          url,
          events,
          secret,
          is_active: true,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating webhook:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const partnerAPIGateway = new PartnerAPIGateway();