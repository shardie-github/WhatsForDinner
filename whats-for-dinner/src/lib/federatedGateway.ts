import { supabase } from './supabaseClient'
import { StripeService } from './stripe'
import { aiOptimization } from './aiOptimization'

export interface FederatedRequest {
  partner: string
  endpoint: string
  method: string
  data?: Record<string, any>
  headers?: Record<string, string>
  metadata?: Record<string, any>
  tenantId: string
  userId?: string
  requestId: string
}

export interface FederatedResponse {
  success: boolean
  data?: any
  error?: string
  metadata: {
    partner: string
    endpoint: string
    responseTime: number
    costUsd: number
    revenueUsd: number
    tokensUsed: number
    cached: boolean
  }
}

export class FederatedAPIGateway {
  private static instance: FederatedAPIGateway
  private partnerCache: Map<string, any> = new Map()
  private cacheExpiry: Map<string, number> = new Map()
  private readonly CACHE_TTL = 300000 // 5 minutes

  static getInstance(): FederatedAPIGateway {
    if (!FederatedAPIGateway.instance) {
      FederatedAPIGateway.instance = new FederatedAPIGateway()
    }
    return FederatedAPIGateway.instance
  }

  /**
   * Route a request through the federated gateway
   */
  async routeRequest(request: FederatedRequest): Promise<FederatedResponse> {
    const startTime = Date.now()
    
    try {
      // Get partner configuration
      const partner = await this.getPartnerConfig(request.partner)
      if (!partner) {
        throw new Error(`Partner not found: ${request.partner}`)
      }

      // Get endpoint configuration
      const endpointConfig = await this.getEndpointConfig(partner.id, request.endpoint, request.method)
      if (!endpointConfig) {
        throw new Error(`Endpoint not found: ${request.partner}/${request.endpoint}`)
      }

      // Check rate limits
      await this.checkRateLimits(partner.id, endpointConfig.id, request.tenantId)

      // Route to appropriate handler based on partner type
      const result = await this.routeToPartner(partner, endpointConfig, request)

      // Calculate costs and revenue
      const responseTime = Date.now() - startTime
      const costUsd = this.calculateCost(result.tokensUsed || 0, partner.type)
      const revenueUsd = costUsd * (partner.revenue_share_percent / 100)

      // Track usage
      await this.trackUsage({
        partnerId: partner.id,
        tenantId: request.tenantId,
        endpointId: endpointConfig.id,
        userId: request.userId,
        requestId: request.requestId,
        method: request.method,
        endpoint: request.endpoint,
        statusCode: result.statusCode || 200,
        responseTime,
        tokensUsed: result.tokensUsed || 0,
        costUsd,
        metadata: request.metadata || {}
      })

      return {
        success: true,
        data: result.data,
        metadata: {
          partner: request.partner,
          endpoint: request.endpoint,
          responseTime,
          costUsd,
          revenueUsd,
          tokensUsed: result.tokensUsed || 0,
          cached: result.cached || false
        }
      }
    } catch (error) {
      console.error('Federated gateway error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          partner: request.partner,
          endpoint: request.endpoint,
          responseTime: Date.now() - startTime,
          costUsd: 0,
          revenueUsd: 0,
          tokensUsed: 0,
          cached: false
        }
      }
    }
  }

  /**
   * Get partner configuration with caching
   */
  private async getPartnerConfig(partnerName: string): Promise<any> {
    const cacheKey = `partner_${partnerName}`
    const now = Date.now()
    
    // Check cache
    if (this.partnerCache.has(cacheKey) && this.cacheExpiry.get(cacheKey)! > now) {
      return this.partnerCache.get(cacheKey)
    }

    // Fetch from database
    const { data, error } = await supabase
      .from('partner_registry')
      .select('*')
      .eq('name', partnerName)
      .eq('status', 'active')
      .single()

    if (error || !data) {
      throw new Error(`Partner not found: ${partnerName}`)
    }

    // Cache the result
    this.partnerCache.set(cacheKey, data)
    this.cacheExpiry.set(cacheKey, now + this.CACHE_TTL)

    return data
  }

  /**
   * Get endpoint configuration
   */
  private async getEndpointConfig(partnerId: string, endpoint: string, method: string): Promise<any> {
    const { data, error } = await supabase
      .from('federated_api_endpoints')
      .select('*')
      .eq('partner_id', partnerId)
      .eq('endpoint_path', endpoint)
      .eq('method', method)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      throw new Error(`Endpoint not found: ${endpoint}`)
    }

    return data
  }

  /**
   * Check rate limits for the request
   */
  private async checkRateLimits(partnerId: string, endpointId: string, tenantId: string): Promise<void> {
    const now = new Date()
    const oneMinuteAgo = new Date(now.getTime() - 60000)
    const oneHourAgo = new Date(now.getTime() - 3600000)

    // Check per-minute rate limit
    const { count: minuteCount } = await supabase
      .from('api_usage_tracking')
      .select('*', { count: 'exact', head: true })
      .eq('partner_id', partnerId)
      .eq('endpoint_id', endpointId)
      .eq('tenant_id', tenantId)
      .gte('timestamp', oneMinuteAgo.toISOString())

    // Check per-hour rate limit
    const { count: hourCount } = await supabase
      .from('api_usage_tracking')
      .select('*', { count: 'exact', head: true })
      .eq('partner_id', partnerId)
      .eq('endpoint_id', endpointId)
      .eq('tenant_id', tenantId)
      .gte('timestamp', oneHourAgo.toISOString())

    // Get endpoint rate limits
    const { data: endpointConfig } = await supabase
      .from('federated_api_endpoints')
      .select('rate_limit_per_minute, rate_limit_per_hour')
      .eq('id', endpointId)
      .single()

    if (endpointConfig) {
      if (minuteCount && minuteCount >= endpointConfig.rate_limit_per_minute) {
        throw new Error('Rate limit exceeded: per minute')
      }
      if (hourCount && hourCount >= endpointConfig.rate_limit_per_hour) {
        throw new Error('Rate limit exceeded: per hour')
      }
    }
  }

  /**
   * Route request to appropriate partner handler
   */
  private async routeToPartner(partner: any, endpointConfig: any, request: FederatedRequest): Promise<any> {
    const { type } = partner
    
    switch (type) {
      case 'shopify':
        return await this.handleShopifyRequest(partner, endpointConfig, request)
      case 'zapier':
        return await this.handleZapierRequest(partner, endpointConfig, request)
      case 'alexa':
        return await this.handleAlexaRequest(partner, endpointConfig, request)
      case 'google_home':
        return await this.handleGoogleHomeRequest(partner, endpointConfig, request)
      case 'tiktok':
        return await this.handleTikTokRequest(partner, endpointConfig, request)
      case 'instagram':
        return await this.handleInstagramRequest(partner, endpointConfig, request)
      case 'api_integration':
        return await this.handleGenericAPIRequest(partner, endpointConfig, request)
      default:
        throw new Error(`Unsupported partner type: ${type}`)
    }
  }

  /**
   * Handle Shopify integration requests
   */
  private async handleShopifyRequest(partner: any, endpointConfig: any, request: FederatedRequest): Promise<any> {
    const { api_base, api_key } = partner
    const targetUrl = `${api_base}${endpointConfig.target_url}`
    
    const headers = {
      'X-Shopify-Access-Token': api_key,
      'Content-Type': 'application/json',
      ...request.headers
    }

    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: request.data ? JSON.stringify(request.data) : undefined
    })

    const data = await response.json()
    
    return {
      data,
      statusCode: response.status,
      tokensUsed: this.estimateTokens(JSON.stringify(data))
    }
  }

  /**
   * Handle Zapier automation requests
   */
  private async handleZapierRequest(partner: any, endpointConfig: any, request: FederatedRequest): Promise<any> {
    const { webhook_url } = partner
    
    const response = await fetch(webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...request.headers
      },
      body: JSON.stringify({
        ...request.data,
        metadata: request.metadata,
        tenant_id: request.tenantId,
        user_id: request.userId
      })
    })

    const data = await response.json()
    
    return {
      data,
      statusCode: response.status,
      tokensUsed: this.estimateTokens(JSON.stringify(data))
    }
  }

  /**
   * Handle Alexa skill requests
   */
  private async handleAlexaRequest(partner: any, endpointConfig: any, request: FederatedRequest): Promise<any> {
    // Generate AI-powered voice response
    const prompt = `Generate a voice response for Alexa skill: ${JSON.stringify(request.data)}`
    
    const aiResult = await aiOptimization.getOptimizedResponse(
      prompt,
      'voice_response',
      request.tenantId,
      'pro', // Default to pro for voice features
      async (model: string) => {
        // This would integrate with actual AI service
        const mockResponse = {
          response: {
            outputSpeech: {
              type: 'PlainText',
              text: 'Here are some great dinner ideas for you!'
            },
            shouldEndSession: false
          },
          tokens: 50,
          cost: 0.001
        }
        return mockResponse
      }
    )

    return {
      data: aiResult.response,
      statusCode: 200,
      tokensUsed: aiResult.tokens,
      cached: aiResult.cached
    }
  }

  /**
   * Handle Google Home requests
   */
  private async handleGoogleHomeRequest(partner: any, endpointConfig: any, request: FederatedRequest): Promise<any> {
    // Similar to Alexa but with Google Home format
    const prompt = `Generate a response for Google Home: ${JSON.stringify(request.data)}`
    
    const aiResult = await aiOptimization.getOptimizedResponse(
      prompt,
      'google_home_response',
      request.tenantId,
      'pro',
      async (model: string) => {
        const mockResponse = {
          response: {
            fulfillmentText: 'I found some delicious dinner recipes for you!',
            fulfillmentMessages: [
              {
                text: {
                  text: ['Here are some great dinner ideas!']
                }
              }
            ]
          },
          tokens: 45,
          cost: 0.0009
        }
        return mockResponse
      }
    )

    return {
      data: aiResult.response,
      statusCode: 200,
      tokensUsed: aiResult.tokens,
      cached: aiResult.cached
    }
  }

  /**
   * Handle TikTok content generation requests
   */
  private async handleTikTokRequest(partner: any, endpointConfig: any, request: FederatedRequest): Promise<any> {
    const prompt = `Generate TikTok content for recipe: ${JSON.stringify(request.data)}`
    
    const aiResult = await aiOptimization.getOptimizedResponse(
      prompt,
      'tiktok_content',
      request.tenantId,
      'pro',
      async (model: string) => {
        const mockResponse = {
          response: {
            caption: '🔥 Quick dinner hack that will change your life! #cooking #dinner #recipe',
            hashtags: ['#cooking', '#dinner', '#recipe', '#foodhack', '#quickmeals'],
            script: 'Start by heating oil in a pan...',
            duration: 30
          },
          tokens: 100,
          cost: 0.002
        }
        return mockResponse
      }
    )

    return {
      data: aiResult.response,
      statusCode: 200,
      tokensUsed: aiResult.tokens,
      cached: aiResult.cached
    }
  }

  /**
   * Handle Instagram content generation requests
   */
  private async handleInstagramRequest(partner: any, endpointConfig: any, request: FederatedRequest): Promise<any> {
    const prompt = `Generate Instagram content for recipe: ${JSON.stringify(request.data)}`
    
    const aiResult = await aiOptimization.getOptimizedResponse(
      prompt,
      'instagram_content',
      request.tenantId,
      'pro',
      async (model: string) => {
        const mockResponse = {
          response: {
            caption: '✨ Tonight\'s dinner was absolutely amazing! This recipe is a game changer 🍽️',
            hashtags: ['#dinner', '#recipe', '#food', '#cooking', '#delicious'],
            storyText: 'Swipe up for the full recipe! 👆',
            carouselText: ['Step 1: Prep ingredients', 'Step 2: Cook with love', 'Step 3: Enjoy!']
          },
          tokens: 80,
          cost: 0.0016
        }
        return mockResponse
      }
    )

    return {
      data: aiResult.response,
      statusCode: 200,
      tokensUsed: aiResult.tokens,
      cached: aiResult.cached
    }
  }

  /**
   * Handle generic API integration requests
   */
  private async handleGenericAPIRequest(partner: any, endpointConfig: any, request: FederatedRequest): Promise<any> {
    const { api_base, api_key } = partner
    const targetUrl = `${api_base}${endpointConfig.target_url}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...request.headers
    }

    if (api_key) {
      headers['Authorization'] = `Bearer ${api_key}`
    }

    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: request.data ? JSON.stringify(request.data) : undefined
    })

    const data = await response.json()
    
    return {
      data,
      statusCode: response.status,
      tokensUsed: this.estimateTokens(JSON.stringify(data))
    }
  }

  /**
   * Calculate cost based on tokens and partner type
   */
  private calculateCost(tokens: number, partnerType: string): number {
    const baseCost = StripeService.calculateTokenCost(tokens, 'gpt-4o-mini')
    
    // Apply partner-specific multipliers
    const multipliers = {
      'shopify': 1.2,
      'zapier': 1.1,
      'alexa': 1.3,
      'google_home': 1.3,
      'tiktok': 1.5,
      'instagram': 1.5,
      'api_integration': 1.0
    }

    return baseCost * (multipliers[partnerType as keyof typeof multipliers] || 1.0)
  }

  /**
   * Estimate tokens in text
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4)
  }

  /**
   * Track API usage
   */
  private async trackUsage(usageData: {
    partnerId: string
    tenantId: string
    endpointId: string
    userId?: string
    requestId: string
    method: string
    endpoint: string
    statusCode: number
    responseTime: number
    tokensUsed: number
    costUsd: number
    metadata: Record<string, any>
  }): Promise<void> {
    try {
      await supabase.rpc('track_api_usage', {
        partner_id_param: usageData.partnerId,
        tenant_id_param: usageData.tenantId,
        endpoint_id_param: usageData.endpointId,
        user_id_param: usageData.userId,
        request_id_param: usageData.requestId,
        method_param: usageData.method,
        endpoint_param: usageData.endpoint,
        status_code_param: usageData.statusCode,
        response_time_ms_param: usageData.responseTime,
        tokens_used_param: usageData.tokensUsed,
        cost_usd_param: usageData.costUsd,
        metadata_param: usageData.metadata
      })
    } catch (error) {
      console.error('Error tracking API usage:', error)
    }
  }

  /**
   * Get partner statistics
   */
  async getPartnerStats(partnerId: string, period: string = '24h'): Promise<any> {
    const { data, error } = await supabase
      .from('api_usage_tracking')
      .select('*')
      .eq('partner_id', partnerId)
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (error) {
      throw new Error('Failed to fetch partner stats')
    }

    const stats = {
      totalRequests: data?.length || 0,
      totalCost: data?.reduce((sum, record) => sum + record.cost_usd, 0) || 0,
      totalRevenue: data?.reduce((sum, record) => sum + record.revenue_usd, 0) || 0,
      averageResponseTime: data?.reduce((sum, record) => sum + record.response_time_ms, 0) / (data?.length || 1) || 0,
      successRate: data?.filter(record => record.status_code < 400).length / (data?.length || 1) || 0
    }

    return stats
  }
}

export const federatedGateway = FederatedAPIGateway.getInstance()