'use client';

import { useState, useEffect } from 'react';
import {
  SocialAutomator,
  SocialPost,
  TrendingTheme,
  ContentStrategy,
} from '@/lib/socialAutomator';

export default function SocialAutomatorPage() {
  const [platform, setPlatform] = useState<SocialPost['platform']>('twitter');
  const [trendingThemes, setTrendingThemes] = useState<TrendingTheme[]>([]);
  const [contentStrategy, setContentStrategy] =
    useState<ContentStrategy | null>(null);
  const [topPosts, setTopPosts] = useState<SocialPost[]>([]);
  const [viralIdeas, setViralIdeas] = useState<string[]>([]);
  const [contentCalendar, setContentCalendar] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('');
  const [contentType, setContentType] = useState<
    | 'recipe_showcase'
    | 'cooking_tip'
    | 'ingredient_spotlight'
    | 'meal_prep'
    | 'nutrition_fact'
  >('recipe_showcase');
  const [generatedContent, setGeneratedContent] = useState<SocialPost | null>(
    null
  );

  const loadTrendingThemes = async () => {
    setIsLoading(true);
    try {
      const themes = await SocialAutomator.generateTrendingThemes();
      setTrendingThemes(themes);
    } catch (error) {
      console.error('Error loading trending themes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadContentStrategy = async () => {
    try {
      const strategy = await SocialAutomator.generateContentStrategy(platform);
      setContentStrategy(strategy);
    } catch (error) {
      console.error('Error loading content strategy:', error);
    }
  };

  const loadTopPosts = async () => {
    try {
      const posts = await SocialAutomator.getTopPerformingPosts(platform, 5);
      setTopPosts(posts);
    } catch (error) {
      console.error('Error loading top posts:', error);
    }
  };

  const loadViralIdeas = async () => {
    try {
      const ideas = await SocialAutomator.generateViralContentIdeas(platform);
      setViralIdeas(ideas);
    } catch (error) {
      console.error('Error loading viral ideas:', error);
    }
  };

  const loadContentCalendar = async () => {
    try {
      const calendar = await SocialAutomator.generateContentCalendar(
        platform,
        7
      );
      setContentCalendar(calendar);
    } catch (error) {
      console.error('Error loading content calendar:', error);
    }
  };

  const generateContent = async () => {
    if (!selectedTheme) {
      alert('Please select a trending theme');
      return;
    }

    setIsLoading(true);
    try {
      const content = await SocialAutomator.generateSocialContent(
        platform,
        selectedTheme,
        contentType
      );
      setGeneratedContent(content);
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Failed to generate content');
    } finally {
      setIsLoading(false);
    }
  };

  const schedulePost = async (postId: string) => {
    const scheduledFor = new Date();
    scheduledFor.setHours(scheduledFor.getHours() + 1); // Schedule for 1 hour from now

    try {
      await SocialAutomator.schedulePost(
        postId,
        scheduledFor.toISOString(),
        platform
      );
      alert('Post scheduled successfully!');
    } catch (error) {
      console.error('Error scheduling post:', error);
      alert('Failed to schedule post');
    }
  };

  useEffect(() => {
    loadTrendingThemes();
    loadContentStrategy();
    loadTopPosts();
    loadViralIdeas();
    loadContentCalendar();
  }, [platform]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Social Media Automator
          </h1>
          <p className="mt-2 text-gray-600">
            Generate viral content and automate your social media strategy
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Content Generation Panel */}
          <div className="space-y-6 lg:col-span-2">
            {/* Platform Selection */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold">
                Platform & Content Generation
              </h2>

              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Platform
                  </label>
                  <select
                    value={platform}
                    onChange={e =>
                      setPlatform(e.target.value as SocialPost['platform'])
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="twitter">Twitter</option>
                    <option value="tiktok">TikTok</option>
                    <option value="threads">Threads</option>
                    <option value="instagram">Instagram</option>
                    <option value="linkedin">LinkedIn</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Content Type
                  </label>
                  <select
                    value={contentType}
                    onChange={e => setContentType(e.target.value as any)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="recipe_showcase">Recipe Showcase</option>
                    <option value="cooking_tip">Cooking Tip</option>
                    <option value="ingredient_spotlight">
                      Ingredient Spotlight
                    </option>
                    <option value="meal_prep">Meal Prep</option>
                    <option value="nutrition_fact">Nutrition Fact</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Select Trending Theme
                </label>
                <select
                  value={selectedTheme}
                  onChange={e => setSelectedTheme(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
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
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Generating...' : 'Generate Content'}
              </button>
            </div>

            {/* Generated Content */}
            {generatedContent && (
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-4 text-lg font-semibold">
                  Generated Content
                </h3>
                <div className="mb-4 rounded-lg border border-gray-200 p-4">
                  <p className="mb-2 text-gray-800">
                    {generatedContent.content}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {generatedContent.hashtags.map((tag, index) => (
                      <span
                        key={index}
                        className="rounded bg-blue-100 px-2 py-1 text-sm text-blue-800"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => schedulePost(generatedContent.id)}
                    className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                  >
                    Schedule Post
                  </button>
                  <button
                    onClick={() => setGeneratedContent(null)}
                    className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                  >
                    Generate New
                  </button>
                </div>
              </div>
            )}

            {/* Trending Themes */}
            <div className="rounded-lg bg-white p-6 shadow">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Trending Themes</h3>
                <button
                  onClick={loadTrendingThemes}
                  disabled={isLoading}
                  className="rounded bg-gray-600 px-3 py-1 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
                >
                  Refresh
                </button>
              </div>
              <div className="space-y-3">
                {trendingThemes.map((theme, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-gray-200 p-3"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <h4 className="font-medium">{theme.theme}</h4>
                      <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800">
                        {theme.engagement_score}/10
                      </span>
                    </div>
                    <p className="mb-2 text-sm text-gray-600">
                      Platform: {theme.platform}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {theme.hashtags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700"
                        >
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
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-4 text-lg font-semibold">Content Strategy</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium">Posting Frequency:</span>
                    <p className="text-gray-600">
                      {contentStrategy.posting_frequency}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Optimal Times:</span>
                    <p className="text-gray-600">
                      {contentStrategy.optimal_times.join(', ')}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Content Types:</span>
                    <ul className="list-inside list-disc text-gray-600">
                      {contentStrategy.content_types.map((type, index) => (
                        <li key={index}>{type}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Top Performing Posts */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-4 text-lg font-semibold">
                Top Performing Posts
              </h3>
              <div className="space-y-3">
                {topPosts.map((post, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-gray-200 p-3"
                  >
                    <p className="mb-2 line-clamp-2 text-sm text-gray-800">
                      {post.content}
                    </p>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>
                        Engagement:{' '}
                        {(
                          post.performance_metrics.engagement_rate * 100
                        ).toFixed(1)}
                        %
                      </span>
                      <span>{post.platform}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Viral Content Ideas */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-4 text-lg font-semibold">
                Viral Content Ideas
              </h3>
              <div className="space-y-2">
                {viralIdeas.slice(0, 5).map((idea, index) => (
                  <div
                    key={index}
                    className="rounded bg-gray-50 p-2 text-sm text-gray-700"
                  >
                    {idea}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content Calendar */}
        {contentCalendar.length > 0 && (
          <div className="mt-8 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">
              7-Day Content Calendar
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-7">
              {contentCalendar.map((day, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-200 p-3"
                >
                  <h4 className="mb-2 font-medium">{day.date}</h4>
                  <div className="space-y-2">
                    {day.content_ideas
                      .slice(0, 3)
                      .map((idea: string, ideaIndex: number) => (
                        <div
                          key={ideaIndex}
                          className="rounded bg-gray-50 p-2 text-xs text-gray-600"
                        >
                          {idea}
                        </div>
                      ))}
                  </div>
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-700">
                      Best Times:
                    </p>
                    <p className="text-xs text-gray-600">
                      {day.optimal_times.join(', ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
