'use client'

import { useState, useEffect } from 'react'
import { SocialAutomator, SocialPost, TrendingTheme, ContentStrategy } from '@/lib/socialAutomator'

export default function SocialAutomatorPage() {
  const [platform, setPlatform] = useState<SocialPost['platform']>('twitter')
  const [trendingThemes, setTrendingThemes] = useState<TrendingTheme[]>([])
  const [contentStrategy, setContentStrategy] = useState<ContentStrategy | null>(null)
  const [topPosts, setTopPosts] = useState<SocialPost[]>([])
  const [viralIdeas, setViralIdeas] = useState<string[]>([])
  const [contentCalendar, setContentCalendar] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState('')
  const [contentType, setContentType] = useState<'recipe_showcase' | 'cooking_tip' | 'ingredient_spotlight' | 'meal_prep' | 'nutrition_fact'>('recipe_showcase')
  const [generatedContent, setGeneratedContent] = useState<SocialPost | null>(null)

  const loadTrendingThemes = async () => {
    setIsLoading(true)
    try {
      const themes = await SocialAutomator.generateTrendingThemes()
      setTrendingThemes(themes)
    } catch (error) {
      console.error('Error loading trending themes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadContentStrategy = async () => {
    try {
      const strategy = await SocialAutomator.generateContentStrategy(platform)
      setContentStrategy(strategy)
    } catch (error) {
      console.error('Error loading content strategy:', error)
    }
  }

  const loadTopPosts = async () => {
    try {
      const posts = await SocialAutomator.getTopPerformingPosts(platform, 5)
      setTopPosts(posts)
    } catch (error) {
      console.error('Error loading top posts:', error)
    }
  }

  const loadViralIdeas = async () => {
    try {
      const ideas = await SocialAutomator.generateViralContentIdeas(platform)
      setViralIdeas(ideas)
    } catch (error) {
      console.error('Error loading viral ideas:', error)
    }
  }

  const loadContentCalendar = async () => {
    try {
      const calendar = await SocialAutomator.generateContentCalendar(platform, 7)
      setContentCalendar(calendar)
    } catch (error) {
      console.error('Error loading content calendar:', error)
    }
  }

  const generateContent = async () => {
    if (!selectedTheme) {
      alert('Please select a trending theme')
      return
    }

    setIsLoading(true)
    try {
      const content = await SocialAutomator.generateSocialContent(platform, selectedTheme, contentType)
      setGeneratedContent(content)
    } catch (error) {
      console.error('Error generating content:', error)
      alert('Failed to generate content')
    } finally {
      setIsLoading(false)
    }
  }

  const schedulePost = async (postId: string) => {
    const scheduledFor = new Date()
    scheduledFor.setHours(scheduledFor.getHours() + 1) // Schedule for 1 hour from now

    try {
      await SocialAutomator.schedulePost(postId, scheduledFor.toISOString(), platform)
      alert('Post scheduled successfully!')
    } catch (error) {
      console.error('Error scheduling post:', error)
      alert('Failed to schedule post')
    }
  }

  useEffect(() => {
    loadTrendingThemes()
    loadContentStrategy()
    loadTopPosts()
    loadViralIdeas()
    loadContentCalendar()
  }, [platform])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Social Media Automator</h1>
          <p className="mt-2 text-gray-600">Generate viral content and automate your social media strategy</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Content Generation Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Platform Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Platform & Content Generation</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as SocialPost['platform'])}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="twitter">Twitter</option>
                    <option value="tiktok">TikTok</option>
                    <option value="threads">Threads</option>
                    <option value="instagram">Instagram</option>
                    <option value="linkedin">LinkedIn</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Type
                  </label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value as any)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="recipe_showcase">Recipe Showcase</option>
                    <option value="cooking_tip">Cooking Tip</option>
                    <option value="ingredient_spotlight">Ingredient Spotlight</option>
                    <option value="meal_prep">Meal Prep</option>
                    <option value="nutrition_fact">Nutrition Fact</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Trending Theme
                </label>
                <select
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Choose a theme...</option>
                  {trendingThemes.map((theme, index) => (
                    <option key={index} value={theme.theme}>
                      {theme.theme} (Score: {theme.engagement_score}/10)
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={generateContent}
                disabled={isLoading || !selectedTheme}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Generating...' : 'Generate Content'}
              </button>
            </div>

            {/* Generated Content */}
            {generatedContent && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Generated Content</h3>
                <div className="border border-gray-200 rounded-lg p-4 mb-4">
                  <p className="text-gray-800 mb-2">{generatedContent.content}</p>
                  <div className="flex flex-wrap gap-2">
                    {generatedContent.hashtags.map((tag, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => schedulePost(generatedContent.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    Schedule Post
                  </button>
                  <button
                    onClick={() => setGeneratedContent(null)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                  >
                    Generate New
                  </button>
                </div>
              </div>
            )}

            {/* Trending Themes */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Trending Themes</h3>
                <button
                  onClick={loadTrendingThemes}
                  disabled={isLoading}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 disabled:opacity-50"
                >
                  Refresh
                </button>
              </div>
              <div className="space-y-3">
                {trendingThemes.map((theme, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{theme.theme}</h4>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        {theme.engagement_score}/10
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Platform: {theme.platform}</p>
                    <div className="flex flex-wrap gap-1">
                      {theme.hashtags.map((tag, tagIndex) => (
                        <span key={tagIndex} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Content Strategy */}
            {contentStrategy && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Content Strategy</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium">Posting Frequency:</span>
                    <p className="text-gray-600">{contentStrategy.posting_frequency}</p>
                  </div>
                  <div>
                    <span className="font-medium">Optimal Times:</span>
                    <p className="text-gray-600">{contentStrategy.optimal_times.join(', ')}</p>
                  </div>
                  <div>
                    <span className="font-medium">Content Types:</span>
                    <ul className="text-gray-600 list-disc list-inside">
                      {contentStrategy.content_types.map((type, index) => (
                        <li key={index}>{type}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Top Performing Posts */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Top Performing Posts</h3>
              <div className="space-y-3">
                {topPosts.map((post, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <p className="text-sm text-gray-800 mb-2 line-clamp-2">{post.content}</p>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Engagement: {(post.performance_metrics.engagement_rate * 100).toFixed(1)}%</span>
                      <span>{post.platform}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Viral Content Ideas */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Viral Content Ideas</h3>
              <div className="space-y-2">
                {viralIdeas.slice(0, 5).map((idea, index) => (
                  <div key={index} className="text-sm text-gray-700 p-2 bg-gray-50 rounded">
                    {idea}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content Calendar */}
        {contentCalendar.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">7-Day Content Calendar</h2>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {contentCalendar.map((day, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <h4 className="font-medium mb-2">{day.date}</h4>
                  <div className="space-y-2">
                    {day.content_ideas.slice(0, 3).map((idea: string, ideaIndex: number) => (
                      <div key={ideaIndex} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        {idea}
                      </div>
                    ))}
                  </div>
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-700">Best Times:</p>
                    <p className="text-xs text-gray-600">{day.optimal_times.join(', ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
