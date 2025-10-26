import { supabase } from './supabaseClient'
import { analytics } from './analytics'
import { logger } from './logger'

export interface RecipeFeedback {
  id: number
  recipe_id: number | null
  user_id: string | null
  feedback_type: 'thumbs_up' | 'thumbs_down' | 'rating'
  score: number | null
  feedback_text: string | null
  created_at: string
}

export interface FeedbackSummary {
  total_feedback: number
  average_rating: number
  thumbs_up_count: number
  thumbs_down_count: number
}

export interface TrainingData {
  prompt: string
  response: string
  feedback_score: number
  user_id: string
  timestamp: string
  metadata: Record<string, any>
}

class FeedbackSystem {
  async submitFeedback(
    recipeId: number,
    userId: string,
    feedbackType: 'thumbs_up' | 'thumbs_down' | 'rating',
    score?: number,
    feedbackText?: string
  ): Promise<boolean> {
    try {
      // Submit feedback to database
      const { data, error } = await supabase
        .rpc('update_recipe_feedback', {
          recipe_id_param: recipeId,
          user_id_param: userId,
          feedback_type_param: feedbackType,
          score_param: score,
          feedback_text_param: feedbackText
        })

      if (error) {
        logger.error('Failed to submit feedback', { error, recipeId, userId, feedbackType }, 'api', 'feedback')
        return false
      }

      // Track analytics event
      await analytics.trackEvent('recipe_feedback_submitted', {
        recipe_id: recipeId,
        feedback_type: feedbackType,
        score: score,
        has_text: !!feedbackText
      })

      // Log the feedback
      await logger.info('Recipe feedback submitted', {
        recipe_id: recipeId,
        user_id: userId,
        feedback_type: feedbackType,
        score: score
      }, 'api', 'feedback')

      return true
    } catch (error) {
      logger.error('Error submitting feedback', { error, recipeId, userId }, 'api', 'feedback')
      return false
    }
  }

  async getFeedbackSummary(recipeId: number): Promise<FeedbackSummary | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_recipe_feedback_summary', {
          recipe_id_param: recipeId
        })

      if (error) {
        logger.error('Failed to get feedback summary', { error, recipeId }, 'api', 'feedback')
        return null
      }

      return data?.[0] || {
        total_feedback: 0,
        average_rating: 0,
        thumbs_up_count: 0,
        thumbs_down_count: 0
      }
    } catch (error) {
      logger.error('Error getting feedback summary', { error, recipeId }, 'api', 'feedback')
      return null
    }
  }

  async getUserFeedback(userId: string, limit: number = 50): Promise<RecipeFeedback[]> {
    try {
      const { data, error } = await supabase
        .from('recipe_feedback')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        logger.error('Failed to get user feedback', { error, userId }, 'api', 'feedback')
        return []
      }

      return data || []
    } catch (error) {
      logger.error('Error getting user feedback', { error, userId }, 'api', 'feedback')
      return []
    }
  }

  async getRecipeFeedback(recipeId: number, limit: number = 50): Promise<RecipeFeedback[]> {
    try {
      const { data, error } = await supabase
        .from('recipe_feedback')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        logger.error('Failed to get recipe feedback', { error, recipeId }, 'api', 'feedback')
        return []
      }

      return data || []
    } catch (error) {
      logger.error('Error getting recipe feedback', { error, recipeId }, 'api', 'feedback')
      return []
    }
  }

  async generateTrainingData(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<TrainingData[]> {
    try {
      const timeframes = {
        day: 1,
        week: 7,
        month: 30
      }

      const days = timeframes[timeframe]
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      // Get recipe metrics with feedback scores
      const { data: recipeMetrics, error: metricsError } = await supabase
        .from('recipe_metrics')
        .select(`
          *,
          recipes!inner(title, details)
        `)
        .gte('generated_at', startDate.toISOString())
        .not('feedback_score', 'is', null)

      if (metricsError) {
        logger.error('Failed to fetch recipe metrics for training data', { error: metricsError }, 'api', 'feedback')
        return []
      }

      // Get feedback details
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('recipe_feedback')
        .select('*')
        .gte('created_at', startDate.toISOString())

      if (feedbackError) {
        logger.error('Failed to fetch feedback data for training', { error: feedbackError }, 'api', 'feedback')
        return []
      }

      // Combine data into training format
      const trainingData: TrainingData[] = []

      for (const metric of recipeMetrics || []) {
        const feedback = feedbackData?.find(f => f.recipe_id === metric.recipe_id)
        
        if (feedback && metric.recipes) {
          // Reconstruct the original prompt
          const prompt = this.reconstructPrompt(metric.ingredients_used, metric.cuisine_type)
          
          // Get the recipe response
          const response = JSON.stringify({
            title: metric.recipes.title,
            details: metric.recipes.details,
            cookTime: metric.cook_time,
            calories: metric.calories
          })

          trainingData.push({
            prompt,
            response,
            feedback_score: feedback.score || (feedback.feedback_type === 'thumbs_up' ? 5 : 1),
            user_id: metric.user_id || 'anonymous',
            timestamp: metric.generated_at,
            metadata: {
              ingredients: metric.ingredients_used,
              cuisine_type: metric.cuisine_type,
              model_used: metric.model_used,
              api_latency: metric.api_latency_ms,
              retry_count: metric.retry_count
            }
          })
        }
      }

      return trainingData
    } catch (error) {
      logger.error('Error generating training data', { error }, 'api', 'feedback')
      return []
    }
  }

  private reconstructPrompt(ingredients: string[], cuisineType?: string): string {
    let prompt = `Generate dinner recipes using these ingredients: ${ingredients.join(', ')}`
    
    if (cuisineType) {
      prompt += `\nFocus on ${cuisineType} cuisine.`
    }
    
    prompt += '\nProvide creative, delicious, and healthy dinner ideas.'
    
    return prompt
  }

  async exportTrainingData(format: 'json' | 'csv' = 'json'): Promise<string> {
    const trainingData = await this.generateTrainingData('month')
    
    if (format === 'json') {
      return JSON.stringify(trainingData, null, 2)
    } else {
      // Convert to CSV format
      const headers = ['prompt', 'response', 'feedback_score', 'user_id', 'timestamp', 'metadata']
      const csvRows = [headers.join(',')]
      
      for (const item of trainingData) {
        const row = [
          `"${item.prompt.replace(/"/g, '""')}"`,
          `"${item.response.replace(/"/g, '""')}"`,
          item.feedback_score,
          item.user_id,
          item.timestamp,
          `"${JSON.stringify(item.metadata).replace(/"/g, '""')}"`
        ]
        csvRows.push(row.join(','))
      }
      
      return csvRows.join('\n')
    }
  }

  async getFeedbackAnalytics(timeframe: 'day' | 'week' | 'month' = 'week') {
    try {
      const timeframes = {
        day: 1,
        week: 7,
        month: 30
      }

      const days = timeframes[timeframe]
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await supabase
        .from('recipe_feedback')
        .select('*')
        .gte('created_at', startDate.toISOString())

      if (error) {
        logger.error('Failed to fetch feedback analytics', { error }, 'api', 'feedback')
        return null
      }

      const analytics = {
        total_feedback: data?.length || 0,
        average_rating: 0,
        thumbs_up_count: 0,
        thumbs_down_count: 0,
        rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        feedback_by_type: {
          thumbs_up: 0,
          thumbs_down: 0,
          rating: 0
        },
        feedback_with_text: 0
      }

      for (const feedback of data || []) {
        if (feedback.feedback_type === 'thumbs_up') {
          analytics.thumbs_up_count++
          analytics.feedback_by_type.thumbs_up++
        } else if (feedback.feedback_type === 'thumbs_down') {
          analytics.thumbs_down_count++
          analytics.feedback_by_type.thumbs_down++
        } else if (feedback.feedback_type === 'rating' && feedback.score) {
          analytics.feedback_by_type.rating++
          analytics.rating_distribution[feedback.score as keyof typeof analytics.rating_distribution]++
        }

        if (feedback.feedback_text) {
          analytics.feedback_with_text++
        }
      }

      // Calculate average rating
      const ratings = data?.filter(f => f.score).map(f => f.score!) || []
      analytics.average_rating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
        : 0

      return analytics
    } catch (error) {
      logger.error('Error getting feedback analytics', { error }, 'api', 'feedback')
      return null
    }
  }

  async optimizePromptsBasedOnFeedback(): Promise<boolean> {
    try {
      // Get recent feedback data
      const trainingData = await this.generateTrainingData('week')
      
      if (trainingData.length < 10) {
        logger.info('Insufficient feedback data for prompt optimization', { count: trainingData.length }, 'api', 'feedback')
        return false
      }

      // Analyze feedback patterns
      const lowRatedPrompts = trainingData.filter(item => item.feedback_score < 3)
      const highRatedPrompts = trainingData.filter(item => item.feedback_score >= 4)

      // Identify common patterns in low-rated responses
      const commonIssues = this.identifyCommonIssues(lowRatedPrompts)
      
      // Generate improved prompts
      const improvedPrompts = this.generateImprovedPrompts(commonIssues)

      // Log optimization results
      await logger.info('Prompt optimization completed', {
        total_feedback: trainingData.length,
        low_rated_count: lowRatedPrompts.length,
        high_rated_count: highRatedPrompts.length,
        common_issues: commonIssues,
        improved_prompts: improvedPrompts.length
      }, 'api', 'feedback')

      return true
    } catch (error) {
      logger.error('Error optimizing prompts based on feedback', { error }, 'api', 'feedback')
      return false
    }
  }

  private identifyCommonIssues(lowRatedPrompts: TrainingData[]): string[] {
    const issues: string[] = []
    
    // Simple pattern analysis (in a real system, this would use more sophisticated NLP)
    const commonWords = ['bland', 'boring', 'unclear', 'difficult', 'time-consuming']
    
    for (const prompt of lowRatedPrompts) {
      const response = JSON.parse(prompt.response)
      const text = `${response.title} ${response.details} ${response.steps?.join(' ')}`
      
      for (const word of commonWords) {
        if (text.toLowerCase().includes(word) && !issues.includes(word)) {
          issues.push(word)
        }
      }
    }
    
    return issues
  }

  private generateImprovedPrompts(issues: string[]): string[] {
    const improvements: string[] = []
    
    if (issues.includes('bland')) {
      improvements.push('Focus on bold, flavorful combinations and seasoning techniques')
    }
    
    if (issues.includes('boring')) {
      improvements.push('Emphasize creative presentation and unique ingredient combinations')
    }
    
    if (issues.includes('unclear')) {
      improvements.push('Provide detailed, step-by-step instructions with specific measurements')
    }
    
    if (issues.includes('difficult')) {
      improvements.push('Prioritize simple techniques and beginner-friendly methods')
    }
    
    if (issues.includes('time-consuming')) {
      improvements.push('Focus on quick preparation methods and time-saving techniques')
    }
    
    return improvements
  }
}

export const feedbackSystem = new FeedbackSystem()

// React hook for feedback
export function useFeedback() {
  return {
    submitFeedback: feedbackSystem.submitFeedback.bind(feedbackSystem),
    getFeedbackSummary: feedbackSystem.getFeedbackSummary.bind(feedbackSystem),
    getUserFeedback: feedbackSystem.getUserFeedback.bind(feedbackSystem),
    getRecipeFeedback: feedbackSystem.getRecipeFeedback.bind(feedbackSystem),
    getFeedbackAnalytics: feedbackSystem.getFeedbackAnalytics.bind(feedbackSystem)
  }
}