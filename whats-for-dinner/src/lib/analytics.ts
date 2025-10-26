import { supabase } from './supabaseClient'
import { v4 as uuidv4 } from 'uuid'

export interface AnalyticsEvent {
  id: string
  event_type: string
  user_id?: string
  session_id: string
  properties: Record<string, any>
  timestamp: string
  page_url?: string
  user_agent?: string
}

export interface RecipeMetrics {
  recipe_id: number
  user_id: string
  generated_at: string
  ingredients_used: string[]
  cuisine_type?: string
  cook_time: string
  calories: number
  feedback_score?: number
  api_latency_ms: number
  model_used: string
  retry_count: number
}

export interface SystemMetrics {
  id: string
  metric_type: 'api_performance' | 'user_engagement' | 'error_rate' | 'cost_analysis'
  value: number
  metadata: Record<string, any>
  timestamp: string
}

class AnalyticsService {
  private sessionId: string
  private userId?: string

  constructor() {
    this.sessionId = this.getOrCreateSessionId()
  }

  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return uuidv4()
    
    let sessionId = localStorage.getItem('analytics_session_id')
    if (!sessionId) {
      sessionId = uuidv4()
      localStorage.setItem('analytics_session_id', sessionId)
    }
    return sessionId
  }

  setUserId(userId: string) {
    this.userId = userId
  }

  async trackEvent(eventType: string, properties: Record<string, any> = {}) {
    const event: AnalyticsEvent = {
      id: uuidv4(),
      event_type: eventType,
      user_id: this.userId,
      session_id: this.sessionId,
      properties,
      timestamp: new Date().toISOString(),
      page_url: typeof window !== 'undefined' ? window.location.href : undefined,
      user_agent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
    }

    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert(event)
      
      if (error) {
        console.error('Analytics tracking error:', error)
      }
    } catch (error) {
      console.error('Failed to track analytics event:', error)
    }
  }

  async trackRecipeGeneration(metrics: Omit<RecipeMetrics, 'recipe_id'>) {
    try {
      const { data, error } = await supabase
        .from('recipe_metrics')
        .insert(metrics)
        .select('id')
        .single()

      if (error) {
        console.error('Recipe metrics tracking error:', error)
        return null
      }

      return data.id
    } catch (error) {
      console.error('Failed to track recipe metrics:', error)
      return null
    }
  }

  async trackSystemMetric(metricType: SystemMetrics['metric_type'], value: number, metadata: Record<string, any> = {}) {
    const metric: SystemMetrics = {
      id: uuidv4(),
      metric_type: metricType,
      value,
      metadata,
      timestamp: new Date().toISOString(),
    }

    try {
      const { error } = await supabase
        .from('system_metrics')
        .insert(metric)
      
      if (error) {
        console.error('System metrics tracking error:', error)
      }
    } catch (error) {
      console.error('Failed to track system metric:', error)
    }
  }

  async getRecipeAnalytics(timeframe: 'day' | 'week' | 'month' = 'week') {
    const timeframes = {
      day: 1,
      week: 7,
      month: 30
    }

    const days = timeframes[timeframe]
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    try {
      const { data, error } = await supabase
        .from('recipe_metrics')
        .select('*')
        .gte('generated_at', startDate.toISOString())

      if (error) {
        console.error('Failed to fetch recipe analytics:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Failed to fetch recipe analytics:', error)
      return null
    }
  }

  async getPopularIngredients(limit: number = 10) {
    try {
      const { data, error } = await supabase
        .rpc('get_popular_ingredients', { limit_count: limit })

      if (error) {
        console.error('Failed to fetch popular ingredients:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Failed to fetch popular ingredients:', error)
      return []
    }
  }

  async getCuisinePreferences() {
    try {
      const { data, error } = await supabase
        .rpc('get_cuisine_preferences')

      if (error) {
        console.error('Failed to fetch cuisine preferences:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Failed to fetch cuisine preferences:', error)
      return []
    }
  }

  async getAPIPerformanceMetrics() {
    try {
      const { data, error } = await supabase
        .from('system_metrics')
        .select('*')
        .eq('metric_type', 'api_performance')
        .order('timestamp', { ascending: false })
        .limit(100)

      if (error) {
        console.error('Failed to fetch API performance metrics:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Failed to fetch API performance metrics:', error)
      return []
    }
  }
}

export const analytics = new AnalyticsService()

// React hook for analytics
export function useAnalytics() {
  return {
    trackEvent: analytics.trackEvent.bind(analytics),
    trackRecipeGeneration: analytics.trackRecipeGeneration.bind(analytics),
    trackSystemMetric: analytics.trackSystemMetric.bind(analytics),
  }
}