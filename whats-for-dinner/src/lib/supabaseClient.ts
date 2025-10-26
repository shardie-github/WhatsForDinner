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
        }
        Insert: {
          id: string
          name?: string | null
          preferences?: any | null
        }
        Update: {
          id?: string
          name?: string | null
          preferences?: any | null
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
    }
  }
}