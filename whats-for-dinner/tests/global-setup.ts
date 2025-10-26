import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🔧 Setting up global test environment...')
  
  // Start a browser instance for setup
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  try {
    // Wait for the application to be ready
    console.log('⏳ Waiting for application to start...')
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })
    
    // Verify the application is running
    const title = await page.title()
    if (!title.includes("What's for Dinner")) {
      throw new Error('Application not ready or incorrect title')
    }
    
    console.log('✅ Application is ready for testing')
    
    // Set up test data if needed
    await setupTestData(page)
    
  } catch (error) {
    console.error('❌ Global setup failed:', error)
    throw error
  } finally {
    await browser.close()
  }
}

async function setupTestData(page: any) {
  console.log('📝 Setting up test data...')
  
  // Create test user session if needed
  // This would typically involve:
  // 1. Creating a test user account
  // 2. Logging in
  // 3. Setting up test pantry items
  // 4. Creating test recipes
  
  try {
    // Example: Set up test pantry items
    await page.evaluate(() => {
      localStorage.setItem('test-pantry', JSON.stringify([
        'chicken', 'rice', 'tomatoes', 'onions', 'garlic'
      ]))
    })
    
    console.log('✅ Test data setup complete')
  } catch (error) {
    console.warn('⚠️ Test data setup failed:', error)
    // Don't fail the entire setup for test data issues
  }
}

export default globalSetup