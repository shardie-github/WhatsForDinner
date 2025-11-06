/**
 * Type definitions for referral, affiliate, and partner programs
 */

import type { User } from '@supabase/supabase-js';

export interface ReferralStats {
  total_referrals: number;
  completed_referrals: number;
  total_rewards: number;
  pending_rewards: number;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_user_id: string | null;
  referral_code: string;
  status: 'pending' | 'completed' | 'rewarded' | 'expired';
  referrer_reward_type: 'discount' | 'credit' | 'subscription_days' | 'cash';
  referrer_reward_amount: number;
  referred_reward_type: 'discount' | 'credit' | 'subscription_days';
  referred_reward_amount: number;
  conversion_event: string | null;
  conversion_date: string | null;
  reward_paid_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReferralReward {
  id: string;
  referral_id: string;
  user_id: string;
  reward_type: 'discount' | 'credit' | 'subscription_days' | 'cash';
  amount: number;
  status: 'pending' | 'applied' | 'expired' | 'revoked';
  applied_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface AffiliateStats {
  total_conversions: number;
  total_earnings: number;
  paid_earnings: number;
  pending_earnings: number;
  commission_rate: number;
}

export interface Affiliate {
  id: string;
  user_id: string;
  affiliate_code: string;
  company_name: string | null;
  website_url: string | null;
  contact_email: string;
  tax_id: string | null;
  payment_method: 'paypal' | 'bank_transfer' | 'stripe' | 'check' | null;
  payment_details: Record<string, unknown>;
  status: 'pending' | 'approved' | 'suspended' | 'rejected';
  commission_rate: number;
  commission_type: 'one_time' | 'recurring' | 'hybrid';
  minimum_payout: number;
  payout_frequency: 'weekly' | 'bi_weekly' | 'monthly' | 'quarterly';
  total_earnings: number;
  paid_earnings: number;
  pending_earnings: number;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
}

export interface AffiliateConversion {
  id: string;
  affiliate_id: string;
  user_id: string | null;
  subscription_id: string | null;
  conversion_type: 'signup' | 'trial' | 'subscription' | 'upgrade';
  commission_amount: number;
  commission_rate: number;
  revenue_amount: number;
  status: 'pending' | 'approved' | 'paid' | 'reversed';
  paid_at: string | null;
  payout_period: string | null;
  created_at: string;
}

export interface Partner {
  id: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  website_url: string | null;
  partner_type: 'strategic' | 'technology' | 'distribution' | 'channel' | 'integration';
  partner_tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'enterprise';
  revenue_share_rate: number;
  revenue_share_model: 'fixed' | 'tiered' | 'volume_based' | 'custom' | null;
  revenue_share_details: Record<string, unknown>;
  minimum_commitment: number | null;
  contract_start_date: string | null;
  contract_end_date: string | null;
  status: 'prospect' | 'active' | 'inactive' | 'terminated';
  total_revenue_share_paid: number;
  total_revenue_share_pending: number;
  created_at: string;
  updated_at: string;
}

export interface PartnerRevenueShare {
  id: string;
  partner_id: string;
  subscription_id: string | null;
  user_id: string | null;
  revenue_amount: number;
  share_rate: number;
  share_amount: number;
  period_start: string;
  period_end: string;
  status: 'pending' | 'approved' | 'paid' | 'reversed';
  paid_at: string | null;
  created_at: string;
}

export type ProgramType = 'referral' | 'affiliate' | 'partner';

export type ProgramStatus = 
  | 'pending' 
  | 'approved' 
  | 'active' 
  | 'completed' 
  | 'suspended' 
  | 'rejected' 
  | 'terminated';
