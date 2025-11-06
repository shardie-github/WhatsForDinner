#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const cron = require('node-cron')

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const JOB_PROCESSOR_URL = process.env.SUPABASE_URL + '/functions/v1/job-processor'

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

class JobQueueManager {
  constructor() {
    this.isRunning = false
    this.processingInterval = null
  }

  async start() {
        this.isRunning = true
    
    // Process jobs every 30 seconds
    this.processingInterval = setInterval(async () => {
      if (this.isRunning) {
        await this.processJobs()
      }
    }, 30000)

    // Schedule cleanup jobs
    this.scheduleCleanupJobs()

      }

  async stop() {
        this.isRunning = false
    
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
    }

      }

  async processJobs() {
    try {
      const response = await fetch(JOB_PROCESSOR_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      })

      const result = await response.json()
      
      if (result.job_id) {
                if (result.error) {
          console.error(`   Error: ${result.error}`)
        }
      }
    } catch (error) {
      console.error('❌ Error processing jobs:', error.message)
    }
  }

  scheduleCleanupJobs() {
    // Run cleanup every day at 2 AM
    cron.schedule('0 2 * * *', async () => {
            await this.createCleanupJob('old_jobs', 30)
      await this.createCleanupJob('expired_cache', 7)
      await this.createCleanupJob('expired_invites', 7)
    })

    // Run analytics processing every 6 hours
    cron.schedule('0 */6 * * *', async () => {
            await this.createAnalyticsJob('popular_ingredients')
      await this.createAnalyticsJob('cuisine_preferences')
      await this.createAnalyticsJob('user_engagement')
    })
  }

  async createCleanupJob(cleanupType, daysToKeep) {
    try {
      const { data, error } = await supabase.rpc('create_job', {
        job_type: 'data_cleanup',
        job_payload: {
          cleanup_type: cleanupType,
          days_to_keep: daysToKeep
        },
        job_priority: 1,
        job_max_retries: 3
      })

      if (error) {
        console.error(`❌ Error creating cleanup job for ${cleanupType}:`, error.message)
      } else {
        `)
      }
    } catch (error) {
      console.error(`❌ Error creating cleanup job:`, error.message)
    }
  }

  async createAnalyticsJob(analysisType) {
    try {
      const { data, error } = await supabase.rpc('create_job', {
        job_type: 'analytics_processing',
        job_payload: {
          analysis_type: analysisType,
          date_range: '7d'
        },
        job_priority: 2,
        job_max_retries: 2
      })

      if (error) {
        console.error(`❌ Error creating analytics job for ${analysisType}:`, error.message)
      } else {
        `)
      }
    } catch (error) {
      console.error(`❌ Error creating analytics job:`, error.message)
    }
  }

  async getJobStats() {
    try {
      const { data, error } = await supabase.rpc('get_job_stats')
      
      if (error) {
        console.error('❌ Error getting job stats:', error.message)
        return null
      }

      return data[0]
    } catch (error) {
      console.error('❌ Error getting job stats:', error.message)
      return null
    }
  }

  async createMealGenerationJob(pantryItems, userId, tenantId, preferences = {}) {
    try {
      const { data, error } = await supabase.rpc('create_job', {
        job_type: 'meal_generation',
        job_payload: {
          pantry_items: pantryItems,
          dietary_preferences: preferences.dietary_preferences || [],
          cuisine_type: preferences.cuisine_type,
          meal_type: preferences.meal_type,
          serving_size: preferences.serving_size || 4,
          tenant_id: tenantId,
          user_id: userId
        },
        job_priority: 5, // High priority for user-facing jobs
        job_tenant_id: tenantId,
        job_user_id: userId,
        job_max_retries: 3
      })

      if (error) {
        console.error('❌ Error creating meal generation job:', error.message)
        return null
      }

      `)
      return data
    } catch (error) {
      console.error('❌ Error creating meal generation job:', error.message)
      return null
    }
  }
}

// CLI interface
async function main() {
  const command = process.argv[2]
  const manager = new JobQueueManager()

  switch (command) {
    case 'start':
      await manager.start()
      // Keep the process running
      process.on('SIGINT', async () => {
        await manager.stop()
        process.exit(0)
      })
      break

    case 'stats':
      const stats = await manager.getJobStats()
      if (stats) {
                                                              }
      break

    case 'create-meal-job':
      const pantryItems = process.argv[3]?.split(',') || ['chicken', 'rice', 'vegetables']
      const userId = process.argv[4] || '00000000-0000-0000-0000-000000000000'
      const tenantId = process.argv[5] || '00000000-0000-0000-0000-000000000000'
      
      const jobId = await manager.createMealGenerationJob(pantryItems, userId, tenantId)
      if (jobId) {
              }
      break

    case 'cleanup':
      await manager.createCleanupJob('old_jobs', 30)
      await manager.createCleanupJob('expired_cache', 7)
      await manager.createCleanupJob('expired_invites', 7)
      break

    default:
                                          break
  }
}

if (require.main === module) {
  main().catch(console.error)
}

module.exports = JobQueueManager
