/**
 * UTM Parameter Tracking
 * Tracks UTM parameters from URL and stores them in user profile for attribution
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  ref?: string; // Referral code
}

/**
 * Extract UTM parameters from URL
 */
export function extractUTMParams(url: string | URL): UTMParams {
  const urlObj = typeof url === 'string' ? new URL(url) : url;
  const params: UTMParams = {};

  const utmSource = urlObj.searchParams.get('utm_source');
  const utmMedium = urlObj.searchParams.get('utm_medium');
  const utmCampaign = urlObj.searchParams.get('utm_campaign');
  const utmContent = urlObj.searchParams.get('utm_content');
  const utmTerm = urlObj.searchParams.get('utm_term');
  const ref = urlObj.searchParams.get('ref');

  if (utmSource) params.utm_source = utmSource;
  if (utmMedium) params.utm_medium = utmMedium;
  if (utmCampaign) params.utm_campaign = utmCampaign;
  if (utmContent) params.utm_content = utmContent;
  if (utmTerm) params.utm_term = utmTerm;
  if (ref) params.ref = ref;

  return params;
}

/**
 * Store UTM parameters in user profile
 */
export async function storeUTMParams(userId: string, params: UTMParams): Promise<void> {
  const supabase = createClientComponentClient();

  // Get current profile
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('metadata')
    .eq('id', userId)
    .single();

  if (fetchError) {
    console.error('Error fetching profile:', fetchError);
    return;
  }

  // Merge UTM params into metadata
  const updatedMetadata = {
    ...(profile?.metadata || {}),
    utm_source: params.utm_source,
    utm_medium: params.utm_medium,
    utm_campaign: params.utm_campaign,
    utm_content: params.utm_content,
    utm_term: params.utm_term,
    referral_code: params.ref,
    attribution_set_at: new Date().toISOString(),
  };

  // Update profile
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ metadata: updatedMetadata })
    .eq('id', userId);

  if (updateError) {
    console.error('Error updating profile with UTM params:', updateError);
  }
}

/**
 * Track signup event with UTM parameters
 */
export async function trackSignupWithUTM(
  userId: string,
  params: UTMParams
): Promise<void> {
  const supabase = createClientComponentClient();

  // Store in profile
  await storeUTMParams(userId, params);

  // Track signup event
  const { error } = await supabase.from('analytics_events').insert({
    event_type: 'user_signed_up',
    user_id: userId,
    session_id: crypto.randomUUID(),
    properties: {
      utm_source: params.utm_source,
      utm_medium: params.utm_medium,
      utm_campaign: params.utm_campaign,
      utm_content: params.utm_content,
      utm_term: params.utm_term,
      referral_code: params.ref,
    },
    timestamp: new Date().toISOString(),
  });

  if (error) {
    console.error('Error tracking signup:', error);
  }
}

/**
 * Get UTM parameters from localStorage (set before signup)
 */
export function getStoredUTMParams(): UTMParams | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem('utm_params');
  if (!stored) return null;

  try {
    return JSON.parse(stored) as UTMParams;
  } catch {
    return null;
  }
}

/**
 * Store UTM parameters in localStorage (for signup flow)
 */
export function storeUTMParamsLocal(params: UTMParams): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem('utm_params', JSON.stringify(params));
  // Also set expiration (7 days)
  localStorage.setItem('utm_params_expires', (Date.now() + 7 * 24 * 60 * 60 * 1000).toString());
}

/**
 * Initialize UTM tracking (call on page load)
 */
export function initUTMTracking(): void {
  if (typeof window === 'undefined') return;

  // Check if params expired
  const expires = localStorage.getItem('utm_params_expires');
  if (expires && Date.now() > parseInt(expires)) {
    localStorage.removeItem('utm_params');
    localStorage.removeItem('utm_params_expires');
    return;
  }

  // Extract UTM params from current URL
  const params = extractUTMParams(window.location.href);
  if (Object.keys(params).length > 0) {
    storeUTMParamsLocal(params);
  }
}
