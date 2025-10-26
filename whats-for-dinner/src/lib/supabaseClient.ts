import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          preferences: any | null
          tenant_id: string | null
          role: 'owner' | 'editor' | 'viewer'
        }
        Insert: {
          id: string
          name?: string | null
          preferences?: any | null
          tenant_id?: string | null
          role?: 'owner' | 'editor' | 'viewer'
        }
        Update: {
          id?: string
          name?: string | null
          preferences?: any | null
          tenant_id?: string | null
          role?: 'owner' | 'editor' | 'viewer'
        }
      }
      tenants: {
        Row: {
          id: string
          name: string
          plan: 'free' | 'pro' | 'family'
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          status: 'active' | 'inactive' | 'suspended' | 'cancelled'
          created_at: string
          updated_at: string
          settings: any
          metadata: any
        }
        Insert: {
          id?: string
          name: string
          plan?: 'free' | 'pro' | 'family'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: 'active' | 'inactive' | 'suspended' | 'cancelled'
          created_at?: string
          updated_at?: string
          settings?: any
          metadata?: any
        }
        Update: {
          id?: string
          name?: string
          plan?: 'free' | 'pro' | 'family'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: 'active' | 'inactive' | 'suspended' | 'cancelled'
          created_at?: string
          updated_at?: string
          settings?: any
          metadata?: any
        }
      }
      tenant_memberships: {
        Row: {
          id: string
          tenant_id: string
          user_id: string
          role: 'owner' | 'editor' | 'viewer'
          invited_by: string | null
          joined_at: string
          status: 'active' | 'pending' | 'suspended'
        }
        Insert: {
          id?: string
          tenant_id: string
          user_id: string
          role: 'owner' | 'editor' | 'viewer'
          invited_by?: string | null
          joined_at?: string
          status?: 'active' | 'pending' | 'suspended'
        }
        Update: {
          id?: string
          tenant_id?: string
          user_id?: string
          role?: 'owner' | 'editor' | 'viewer'
          invited_by?: string | null
          joined_at?: string
          status?: 'active' | 'pending' | 'suspended'
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string | null
          tenant_id: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          plan: 'free' | 'pro' | 'family'
          status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid'
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
          metadata: any
        }
        Insert: {
          id?: string
          user_id?: string | null
          tenant_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan: 'free' | 'pro' | 'family'
          status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid'
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
          metadata?: any
        }
        Update: {
          id?: string
          user_id?: string | null
          tenant_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: 'free' | 'pro' | 'family'
          status?: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid'
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
          metadata?: any
        }
      }
      usage_logs: {
        Row: {
          id: number
          user_id: string | null
          tenant_id: string | null
          action: string
          tokens_used: number
          cost_usd: number
          model_used: string | null
          timestamp: string
          metadata: any
        }
        Insert: {
          id?: number
          user_id?: string | null
          tenant_id?: string | null
          action: string
          tokens_used?: number
          cost_usd?: number
          model_used?: string | null
          timestamp?: string
          metadata?: any
        }
        Update: {
          id?: number
          user_id?: string | null
          tenant_id?: string | null
          action?: string
          tokens_used?: number
          cost_usd?: number
          model_used?: string | null
          timestamp?: string
          metadata?: any
        }
      }
      pantry_items: {
        Row: {
          id: number
          user_id: string
          ingredient: string
          quantity: number
        }
        Insert: {
          user_id: string
          ingredient: string
          quantity?: number
        }
        Update: {
          id?: number
          user_id?: string
          ingredient?: string
          quantity?: number
        }
      }
      recipes: {
        Row: {
          id: number
          user_id: string
          title: string
          details: any
          calories: number
          time: string
        }
        Insert: {
          user_id: string
          title: string
          details: any
          calories: number
          time: string
        }
        Update: {
          id?: number
          user_id?: string
          title?: string
          details?: any
          calories?: number
          time?: string
        }
      }
      favorites: {
        Row: {
          id: number
          user_id: string
          recipe_id: number
        }
        Insert: {
          user_id: string
          recipe_id: number
        }
        Update: {
          id?: number
          user_id?: string
          recipe_id?: number
        }
      }
      analytics_events: {
        Row: {
          id: string
          event_type: string
          user_id: string | null
          session_id: string
          properties: any
          timestamp: string
          page_url: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          event_type: string
          user_id?: string | null
          session_id: string
          properties?: any
          timestamp?: string
          page_url?: string | null
          user_agent?: string | null
        }
        Update: {
          id?: string
          event_type?: string
          user_id?: string | null
          session_id?: string
          properties?: any
          timestamp?: string
          page_url?: string | null
          user_agent?: string | null
        }
      }
      recipe_metrics: {
        Row: {
          id: number
          recipe_id: number | null
          user_id: string | null
          generated_at: string
          ingredients_used: string[]
          cuisine_type: string | null
          cook_time: string
          calories: number
          feedback_score: number | null
          api_latency_ms: number
          model_used: string
          retry_count: number
        }
        Insert: {
          id?: number
          recipe_id?: number | null
          user_id?: string | null
          generated_at?: string
          ingredients_used: string[]
          cuisine_type?: string | null
          cook_time: string
          calories: number
          feedback_score?: number | null
          api_latency_ms: number
          model_used: string
          retry_count?: number
        }
        Update: {
          id?: number
          recipe_id?: number | null
          user_id?: string | null
          generated_at?: string
          ingredients_used?: string[]
          cuisine_type?: string | null
          cook_time?: string
          calories?: number
          feedback_score?: number | null
          api_latency_ms?: number
          model_used?: string
          retry_count?: number
        }
      }
      system_metrics: {
        Row: {
          id: string
          metric_type: 'api_performance' | 'user_engagement' | 'error_rate' | 'cost_analysis'
          value: number
          metadata: any
          timestamp: string
        }
        Insert: {
          id?: string
          metric_type: 'api_performance' | 'user_engagement' | 'error_rate' | 'cost_analysis'
          value: number
          metadata?: any
          timestamp?: string
        }
        Update: {
          id?: string
          metric_type?: 'api_performance' | 'user_engagement' | 'error_rate' | 'cost_analysis'
          value?: number
          metadata?: any
          timestamp?: string
        }
      }
      logs: {
        Row: {
          id: string
          level: 'error' | 'warn' | 'info' | 'debug'
          message: string
          context: any
          user_id: string | null
          session_id: string | null
          stack_trace: string | null
          timestamp: string
          source: 'frontend' | 'api' | 'edge_function' | 'system'
          component: string | null
        }
        Insert: {
          id?: string
          level: 'error' | 'warn' | 'info' | 'debug'
          message: string
          context?: any
          user_id?: string | null
          session_id?: string | null
          stack_trace?: string | null
          timestamp?: string
          source: 'frontend' | 'api' | 'edge_function' | 'system'
          component?: string | null
        }
        Update: {
          id?: string
          level?: 'error' | 'warn' | 'info' | 'debug'
          message?: string
          context?: any
          user_id?: string | null
          session_id?: string | null
          stack_trace?: string | null
          timestamp?: string
          source?: 'frontend' | 'api' | 'edge_function' | 'system'
          component?: string | null
        }
      }
      error_reports: {
        Row: {
          id: string
          error_type: string
          message: string
          stack_trace: string | null
          user_id: string | null
          session_id: string | null
          context: any
          resolved: boolean
          created_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          error_type: string
          message: string
          stack_trace?: string | null
          user_id?: string | null
          session_id?: string | null
          context?: any
          resolved?: boolean
          created_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          error_type?: string
          message?: string
          stack_trace?: string | null
          user_id?: string | null
          session_id?: string | null
          context?: any
          resolved?: boolean
          created_at?: string
          resolved_at?: string | null
        }
      }
      recipe_feedback: {
        Row: {
          id: number
          recipe_id: number | null
          user_id: string | null
          feedback_type: 'thumbs_up' | 'thumbs_down' | 'rating'
          score: number | null
          feedback_text: string | null
          created_at: string
        }
        Insert: {
          id?: number
          recipe_id?: number | null
          user_id?: string | null
          feedback_type: 'thumbs_up' | 'thumbs_down' | 'rating'
          score?: number | null
          feedback_text?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          recipe_id?: number | null
          user_id?: string | null
          feedback_type?: 'thumbs_up' | 'thumbs_down' | 'rating'
          score?: number | null
          feedback_text?: string | null
          created_at?: string
        }
      }
      ai_config: {
        Row: {
          id: string
          model_name: string
          system_prompt: string
          message_templates: any
          version: string
          is_active: boolean
          created_at: string
          performance_score: number | null
          metadata: any
        }
        Insert: {
          id?: string
          model_name: string
          system_prompt: string
          message_templates: any
          version: string
          is_active?: boolean
          created_at?: string
          performance_score?: number | null
          metadata?: any
        }
        Update: {
          id?: string
          model_name?: string
          system_prompt?: string
          message_templates?: any
          version?: string
          is_active?: boolean
          created_at?: string
          performance_score?: number | null
          metadata?: any
        }
      }
      workflow_state: {
        Row: {
          id: string
          workflow_name: string
          status: 'pending' | 'running' | 'completed' | 'failed'
          current_step: string | null
          progress_percentage: number
          metadata: any
          started_at: string
          completed_at: string | null
          error_message: string | null
        }
        Insert: {
          id?: string
          workflow_name: string
          status: 'pending' | 'running' | 'completed' | 'failed'
          current_step?: string | null
          progress_percentage?: number
          metadata?: any
          started_at?: string
          completed_at?: string | null
          error_message?: string | null
        }
        Update: {
          id?: string
          workflow_name?: string
          status?: 'pending' | 'running' | 'completed' | 'failed'
          current_step?: string | null
          progress_percentage?: number
          metadata?: any
          started_at?: string
          completed_at?: string | null
          error_message?: string | null
        }
      }
    }
    Functions: {
      get_popular_ingredients: {
        Args: {
          limit_count?: number
        }
        Returns: {
          ingredient: string
          usage_count: number
        }[]
      }
      get_cuisine_preferences: {
        Args: Record<PropertyKey, never>
        Returns: {
          cuisine_type: string
          preference_count: number
        }[]
      }
      get_recipe_feedback_summary: {
        Args: {
          recipe_id_param: number
        }
        Returns: {
          total_feedback: number
          average_rating: number
          thumbs_up_count: number
          thumbs_down_count: number
        }[]
      }
      update_recipe_feedback: {
        Args: {
          recipe_id_param: number
          user_id_param: string
          feedback_type_param: string
          score_param?: number
          feedback_text_param?: string
        }
        Returns: number
      }
    }
  }
}