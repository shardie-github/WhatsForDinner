import { supabase } from './supabaseClient'
import { StripeService } from './stripe'

export interface ModelRecommendation {
  model_name: string
  provider: string
  cost_per_1k_tokens: number
  quality_score: number
  latency_ms: number
  total_cost: number
  confidence: number
  reasoning: string[]
}

export interface ModelPerformance {
  model_name: string
  provider: string
  total_requests: number
  average_latency: number
  average_cost: number
  success_rate: number
  quality_rating: number
  last_updated: string
}

export class ModelAdvisor {
  private static instance: ModelAdvisor
  private modelCache: Map<string, any> = new Map()
  private performanceCache: Map<string, any> = new Map()
  private readonly CACHE_TTL = 300000 // 5 minutes

  static getInstance(): ModelAdvisor {
    if (!ModelAdvisor.instance) {
      ModelAdvisor.instance = new ModelAdvisor()
    }
    return ModelAdvisor.instance
  }

  /**
   * Get optimal model recommendation based on requirements
   */
  async getOptimalModel(
    estimatedTokens: number,
    qualityRequirement: number = 0.8,
    maxLatencyMs: number = 5000,
    maxCostUsd: number = 1.0,
    useCase: string = 'general'
  ): Promise<ModelRecommendation> {
    try {
      // Get model recommendations from database
      const { data, error } = await supabase.rpc('get_optimal_ai_model', {
        estimated_tokens_param: estimatedTokens,
        quality_requirement_param: qualityRequirement,
        max_latency_ms_param: maxLatencyMs
      })

      if (error) {
        throw new Error(`Failed to get model recommendations: ${error.message}`)
      }

      if (!data || data.length === 0) {
        throw new Error('No suitable models found')
      }

      // Filter by cost constraint
      const affordableModels = data.filter((model: any) => model.total_cost <= maxCostUsd)

      if (affordableModels.length === 0) {
        // If no models meet cost constraint, return the cheapest option
        const cheapestModel = data.reduce((min: any, model: any) => 
          model.total_cost < min.total_cost ? model : min
        )
        
        return {
          ...cheapestModel,
          confidence: 0.6,
          reasoning: [
            'No models meet cost constraint',
            'Selected cheapest available option',
            'Consider increasing budget or reducing token count'
          ]
        }
      }

      // Select best model based on use case
      const selectedModel = this.selectModelForUseCase(affordableModels, useCase)

      // Calculate confidence score
      const confidence = this.calculateConfidence(selectedModel, qualityRequirement, maxLatencyMs)

      // Generate reasoning
      const reasoning = this.generateReasoning(selectedModel, estimatedTokens, useCase)

      return {
        ...selectedModel,
        confidence,
        reasoning
      }
    } catch (error) {
      console.error('Error getting optimal model:', error)
      throw error
    }
  }

  /**
   * Get model performance statistics
   */
  async getModelPerformance(period: string = '30d'): Promise<ModelPerformance[]> {
    const cacheKey = `performance_${period}`
    const now = Date.now()
    
    // Check cache
    if (this.performanceCache.has(cacheKey) && this.performanceCache.get(cacheKey).expiry > now) {
      return this.performanceCache.get(cacheKey).data
    }

    try {
      const periodDays = this.parsePeriod(period)
      const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000)

      // Get usage data
      const { data: usageData } = await supabase
        .from('api_usage_tracking')
        .select('model_used, response_time_ms, cost_usd, status_code, metadata')
        .gte('timestamp', startDate.toISOString())

      if (!usageData) {
        return []
      }

      // Group by model
      const modelStats = new Map<string, any>()

      usageData.forEach(record => {
        const model = record.metadata?.model || record.model_used || 'unknown'
        
        if (!modelStats.has(model)) {
          modelStats.set(model, {
            model_name: model,
            provider: this.getProviderFromModel(model),
            total_requests: 0,
            total_latency: 0,
            total_cost: 0,
            successful_requests: 0,
            quality_ratings: []
          })
        }

        const stats = modelStats.get(model)
        stats.total_requests++
        stats.total_latency += record.response_time_ms
        stats.total_cost += record.cost_usd
        
        if (record.status_code < 400) {
          stats.successful_requests++
        }

        // Extract quality rating from metadata if available
        if (record.metadata?.quality_rating) {
          stats.quality_ratings.push(record.metadata.quality_rating)
        }
      })

      // Calculate performance metrics
      const performance: ModelPerformance[] = Array.from(modelStats.values()).map(stats => {
        const averageLatency = stats.total_requests > 0 ? stats.total_latency / stats.total_requests : 0
        const averageCost = stats.total_requests > 0 ? stats.total_cost / stats.total_requests : 0
        const successRate = stats.total_requests > 0 ? stats.successful_requests / stats.total_requests : 0
        const qualityRating = stats.quality_ratings.length > 0 
          ? stats.quality_ratings.reduce((sum: number, rating: number) => sum + rating, 0) / stats.quality_ratings.length
          : 0.5 // Default quality rating

        return {
          model_name: stats.model_name,
          provider: stats.provider,
          total_requests: stats.total_requests,
          average_latency: Math.round(averageLatency),
          average_cost: Math.round(averageCost * 10000) / 10000, // Round to 4 decimal places
          success_rate: Math.round(successRate * 100) / 100,
          quality_rating: Math.round(qualityRating * 100) / 100,
          last_updated: new Date().toISOString()
        }
      })

      // Cache the result
      this.performanceCache.set(cacheKey, {
        data: performance,
        expiry: now + this.CACHE_TTL
      })

      return performance
    } catch (error) {
      console.error('Error getting model performance:', error)
      throw error
    }
  }

  /**
   * Update model performance data
   */
  async updateModelPerformance(
    modelName: string,
    provider: string,
    responseTime: number,
    cost: number,
    qualityRating?: number,
    success: boolean = true
  ): Promise<void> {
    try {
      // Update performance cache
      const cacheKey = 'performance_30d'
      if (this.performanceCache.has(cacheKey)) {
        const cached = this.performanceCache.get(cacheKey)
        const modelIndex = cached.data.findIndex((m: any) => m.model_name === modelName)
        
        if (modelIndex >= 0) {
          const model = cached.data[modelIndex]
          model.total_requests++
          model.total_latency += responseTime
          model.total_cost += cost
          model.successful_requests += success ? 1 : 0
          
          if (qualityRating) {
            model.quality_ratings.push(qualityRating)
            model.quality_rating = model.quality_ratings.reduce((sum: number, rating: number) => sum + rating, 0) / model.quality_ratings.length
          }
          
          model.average_latency = Math.round(model.total_latency / model.total_requests)
          model.average_cost = Math.round(model.total_cost / model.total_requests * 10000) / 10000
          model.success_rate = Math.round(model.successful_requests / model.total_requests * 100) / 100
          model.last_updated = new Date().toISOString()
        }
      }

      // Store in database for historical tracking
      await supabase
        .from('ai_evolution_logs')
        .insert({
          tenant_id: 'system',
          model_version: modelName,
          prompt_hash: 'performance_update',
          performance_metrics: {
            response_time: responseTime,
            cost: cost,
            quality_rating: qualityRating,
            success: success,
            provider: provider
          }
        })
    } catch (error) {
      console.error('Error updating model performance:', error)
    }
  }

  /**
   * Get cost comparison for multiple models
   */
  async getCostComparison(
    estimatedTokens: number,
    models: string[] = ['gpt-4o', 'gpt-4o-mini', 'claude-3-5-sonnet', 'claude-3-haiku', 'gemini-pro']
  ): Promise<Array<{ model: string; cost: number; quality: number; latency: number }>> {
    try {
      const { data, error } = await supabase
        .from('ai_model_advisor')
        .select('model_name, cost_per_1k_tokens, quality_score, latency_ms')
        .in('model_name', models)
        .eq('is_active', true)

      if (error) {
        throw new Error(`Failed to get model data: ${error.message}`)
      }

      return data?.map(model => ({
        model: model.model_name,
        cost: (model.cost_per_1k_tokens * estimatedTokens) / 1000,
        quality: model.quality_score,
        latency: model.latency_ms
      })) || []
    } catch (error) {
      console.error('Error getting cost comparison:', error)
      throw error
    }
  }

  /**
   * Select model based on use case
   */
  private selectModelForUseCase(models: any[], useCase: string): any {
    switch (useCase) {
      case 'cost_optimized':
        return models.reduce((min, model) => model.total_cost < min.total_cost ? model : min)
      
      case 'quality_optimized':
        return models.reduce((max, model) => model.quality_score > max.quality_score ? model : max)
      
      case 'speed_optimized':
        return models.reduce((min, model) => model.latency_ms < min.latency_ms ? model : min)
      
      case 'balanced':
        // Select model with best balance of cost, quality, and speed
        return models.reduce((best, model) => {
          const bestScore = (best.quality_score * 0.4) - (best.total_cost * 0.3) - (best.latency_ms / 10000 * 0.3)
          const modelScore = (model.quality_score * 0.4) - (model.total_cost * 0.3) - (model.latency_ms / 10000 * 0.3)
          return modelScore > bestScore ? model : best
        })
      
      default:
        return models[0] // Return first model as default
    }
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(model: any, qualityRequirement: number, maxLatencyMs: number): number {
    let confidence = 0.5 // Base confidence

    // Quality factor
    if (model.quality_score >= qualityRequirement) {
      confidence += 0.2
    } else {
      confidence -= (qualityRequirement - model.quality_score) * 0.3
    }

    // Latency factor
    if (model.latency_ms <= maxLatencyMs) {
      confidence += 0.2
    } else {
      confidence -= (model.latency_ms - maxLatencyMs) / 10000 * 0.2
    }

    // Cost factor (lower cost = higher confidence)
    confidence += Math.max(0, 0.1 - model.total_cost * 0.1)

    return Math.max(0, Math.min(1, confidence))
  }

  /**
   * Generate reasoning for model selection
   */
  private generateReasoning(model: any, estimatedTokens: number, useCase: string): string[] {
    const reasoning = []

    reasoning.push(`Selected ${model.model_name} from ${model.provider}`)
    reasoning.push(`Cost: $${model.total_cost.toFixed(4)} for ${estimatedTokens} tokens`)
    reasoning.push(`Quality score: ${(model.quality_score * 100).toFixed(1)}%`)
    reasoning.push(`Expected latency: ${model.latency_ms}ms`)

    switch (useCase) {
      case 'cost_optimized':
        reasoning.push('Optimized for cost efficiency')
        break
      case 'quality_optimized':
        reasoning.push('Optimized for response quality')
        break
      case 'speed_optimized':
        reasoning.push('Optimized for response speed')
        break
      case 'balanced':
        reasoning.push('Balanced optimization across cost, quality, and speed')
        break
    }

    return reasoning
  }

  /**
   * Get provider from model name
   */
  private getProviderFromModel(modelName: string): string {
    if (modelName.includes('gpt')) return 'openai'
    if (modelName.includes('claude')) return 'anthropic'
    if (modelName.includes('gemini')) return 'google'
    if (modelName.includes('azure')) return 'azure'
    return 'unknown'
  }

  /**
   * Parse period string to days
   */
  private parsePeriod(period: string): number {
    const periodMap: Record<string, number> = {
      '1d': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    }
    return periodMap[period] || 30
  }

  /**
   * Refresh model advisor data
   */
  async refreshModelData(): Promise<void> {
    try {
      // This would fetch latest pricing and performance data from providers
      // For now, we'll just clear the cache to force refresh
      this.modelCache.clear()
      this.performanceCache.clear()
      
      console.log('Model advisor data refreshed')
    } catch (error) {
      console.error('Error refreshing model data:', error)
    }
  }
}

export const modelAdvisor = ModelAdvisor.getInstance()