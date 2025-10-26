import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface JobData {
  job_id: number;
  job_type: string;
  job_payload: any;
  job_priority: number;
  job_tenant_id: string;
  job_user_id: string;
  job_max_retries: number;
  job_retry_count: number;
}

serve(async req => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Create Supabase client with service role key for admin operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get next pending job
    const { data: jobs, error: jobError } =
      await supabaseClient.rpc('get_next_job');

    if (jobError) {
      console.error('Error getting next job:', jobError);
      return new Response(JSON.stringify({ error: 'Failed to get next job' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!jobs || jobs.length === 0) {
      return new Response(JSON.stringify({ message: 'No pending jobs' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const job: JobData = jobs[0];
    console.log(`Processing job ${job.job_id} of type ${job.job_type}`);

    // Log job start
    await supabaseClient.rpc('log_job_activity', {
      job_id_param: job.job_id,
      log_level: 'info',
      log_message: `Starting job processing`,
      log_metadata: {
        job_type: job.job_type,
        retry_count: job.job_retry_count,
      },
    });

    let result: any = null;
    let success = false;
    let errorMessage = '';

    try {
      // Process job based on type
      switch (job.job_type) {
        case 'meal_generation':
          result = await processMealGenerationJob(supabaseClient, job);
          success = true;
          break;
        case 'email_notification':
          result = await processEmailNotificationJob(supabaseClient, job);
          success = true;
          break;
        case 'data_cleanup':
          result = await processDataCleanupJob(supabaseClient, job);
          success = true;
          break;
        case 'analytics_processing':
          result = await processAnalyticsJob(supabaseClient, job);
          success = true;
          break;
        default:
          throw new Error(`Unknown job type: ${job.job_type}`);
      }

      // Complete the job
      await supabaseClient.rpc('complete_job', {
        job_id_param: job.job_id,
        result_data: result,
        success: success,
      });

      console.log(`Job ${job.job_id} completed successfully`);
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Job ${job.job_id} failed:`, errorMessage);

      // Log the error
      await supabaseClient.rpc('log_job_activity', {
        job_id_param: job.job_id,
        log_level: 'error',
        log_message: `Job failed: ${errorMessage}`,
        log_metadata: { error: errorMessage, job_type: job.job_type },
      });

      // Fail the job (with retry logic)
      await supabaseClient.rpc('fail_job', {
        job_id_param: job.job_id,
        error_message_param: errorMessage,
      });
    }

    return new Response(
      JSON.stringify({
        message: 'Job processed',
        job_id: job.job_id,
        success: success,
        error: errorMessage || null,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Job processor error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processMealGenerationJob(
  supabaseClient: any,
  job: JobData
): Promise<any> {
  const {
    pantry_items,
    dietary_preferences,
    cuisine_type,
    meal_type,
    serving_size,
  } = job.job_payload;

  // This would integrate with the meal generation logic
  // For now, we'll simulate the process
  await supabaseClient.rpc('log_job_activity', {
    job_id_param: job.job_id,
    log_level: 'info',
    log_message: 'Generating meal based on pantry items',
    log_metadata: { pantry_items: pantry_items?.length || 0 },
  });

  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000));

  return {
    message: 'Meal generation completed',
    generated_at: new Date().toISOString(),
    pantry_items_used: pantry_items,
  };
}

async function processEmailNotificationJob(
  supabaseClient: any,
  job: JobData
): Promise<any> {
  const { to, subject, template, data } = job.job_payload;

  await supabaseClient.rpc('log_job_activity', {
    job_id_param: job.job_id,
    log_level: 'info',
    log_message: 'Sending email notification',
    log_metadata: { to, subject },
  });

  // Here you would integrate with your email service (SendGrid, Resend, etc.)
  // For now, we'll simulate the process
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    message: 'Email sent successfully',
    sent_at: new Date().toISOString(),
    recipient: to,
  };
}

async function processDataCleanupJob(
  supabaseClient: any,
  job: JobData
): Promise<any> {
  const { cleanup_type, days_to_keep } = job.job_payload;

  await supabaseClient.rpc('log_job_activity', {
    job_id_param: job.job_id,
    log_level: 'info',
    log_message: 'Starting data cleanup',
    log_metadata: { cleanup_type, days_to_keep },
  });

  let cleanedCount = 0;

  switch (cleanup_type) {
    case 'old_jobs':
      // Clean up old completed jobs
      const { data: cleanupResult } = await supabaseClient.rpc(
        'cleanup_old_jobs',
        {
          days_to_keep: days_to_keep || 30,
        }
      );
      cleanedCount = cleanupResult || 0;
      break;
    case 'expired_cache':
      // Clean up expired AI cache entries
      const { data: cacheResult } = await supabaseClient
        .from('ai_cache')
        .delete()
        .lt('expires_at', new Date().toISOString())
        .select('id');

      cleanedCount = cacheResult?.length || 0;
      break;
    case 'expired_invites':
      // Clean up expired tenant invites
      const { data: inviteResult } = await supabaseClient
        .from('tenant_invites')
        .delete()
        .lt('expires_at', new Date().toISOString())
        .is('used_at', null)
        .select('id');

      cleanedCount = inviteResult?.length || 0;
      break;
  }

  return {
    message: 'Data cleanup completed',
    cleaned_count: cleanedCount,
    cleanup_type,
    completed_at: new Date().toISOString(),
  };
}

async function processAnalyticsJob(
  supabaseClient: any,
  job: JobData
): Promise<any> {
  const { analysis_type, date_range } = job.job_payload;

  await supabaseClient.rpc('log_job_activity', {
    job_id_param: job.job_id,
    log_level: 'info',
    log_message: 'Processing analytics data',
    log_metadata: { analysis_type, date_range },
  });

  let analyticsData = {};

  switch (analysis_type) {
    case 'popular_ingredients':
      const { data: ingredients } = await supabaseClient.rpc(
        'get_popular_ingredients',
        {
          limit_count: 10,
        }
      );
      analyticsData = { popular_ingredients: ingredients };
      break;
    case 'cuisine_preferences':
      const { data: cuisines } = await supabaseClient.rpc(
        'get_cuisine_preferences'
      );
      analyticsData = { cuisine_preferences: cuisines };
      break;
    case 'user_engagement':
      const { data: engagement } = await supabaseClient
        .from('analytics_events')
        .select('event_type, count(*)')
        .gte(
          'timestamp',
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        )
        .group('event_type');

      analyticsData = { user_engagement: engagement };
      break;
  }

  return {
    message: 'Analytics processing completed',
    analysis_type,
    data: analyticsData,
    processed_at: new Date().toISOString(),
  };
}
