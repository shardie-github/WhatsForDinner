'use client';

import { useState, useEffect } from 'react';
import { AICopywriter, CopyVariant } from '@/lib/aiCopywriter';

export default function AICopywriterPage() {
  const [contentType, setContentType] =
    useState<CopyVariant['content_type']>('landing_headline');
  const [context, setContext] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [tone, setTone] = useState<
    'professional' | 'casual' | 'urgent' | 'friendly'
  >('professional');
  const [numberOfVariants, setNumberOfVariants] = useState(3);
  const [generatedVariants, setGeneratedVariants] = useState<CopyVariant[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [selectedTestId, setSelectedTestId] = useState('');
  const [testResults, setTestResults] = useState<any>(null);

  const generateVariants = async () => {
    if (!context || !targetAudience) {
      alert('Please provide context and target audience');
      return;
    }

    setIsGenerating(true);
    try {
      const variants = await AICopywriter.generateCopyVariants(
        contentType,
        context,
        targetAudience,
        tone,
        numberOfVariants
      );
      setGeneratedVariants(variants);
    } catch (error) {
      console.error('Error generating variants:', error);
      alert('Failed to generate variants');
    } finally {
      setIsGenerating(false);
    }
  };

  const loadInsights = async () => {
    try {
      const data = await AICopywriter.getCopyInsights(contentType);
      setInsights(data);
    } catch (error) {
      console.error('Error loading insights:', error);
    }
  };

  const analyzeTest = async () => {
    if (!selectedTestId) {
      alert('Please enter a test ID');
      return;
    }

    try {
      const results = await AICopywriter.analyzeTestResults(selectedTestId);
      setTestResults(results);
    } catch (error) {
      console.error('Error analyzing test:', error);
      alert('Failed to analyze test results');
    }
  };

  const updateMetrics = async (
    variantId: string,
    metricType: 'impressions' | 'clicks' | 'conversions',
    value: number
  ) => {
    try {
      await AICopywriter.updateCopyMetrics(variantId, { [metricType]: value });
      // Reload variants to show updated metrics
      loadInsights();
    } catch (error) {
      console.error('Error updating metrics:', error);
    }
  };

  useEffect(() => {
    loadInsights();
  }, [contentType]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            AI Copywriter Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Generate and A/B test copy variants for maximum conversion
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Copy Generation Panel */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">
              Generate Copy Variants
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Content Type
                </label>
                <select
                  value={contentType}
                  onChange={e =>
                    setContentType(
                      e.target.value as CopyVariant['content_type']
                    )
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="landing_headline">Landing Headline</option>
                  <option value="email_subject">Email Subject</option>
                  <option value="cta_button">CTA Button</option>
                  <option value="feature_copy">Feature Copy</option>
                  <option value="social_post">Social Post</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Context
                </label>
                <textarea
                  value={context}
                  onChange={e => setContext(e.target.value)}
                  placeholder="Describe the context for this copy..."
                  className="h-20 w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={e => setTargetAudience(e.target.value)}
                  placeholder="e.g., Busy professionals, Health-conscious families"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Tone
                  </label>
                  <select
                    value={tone}
                    onChange={e => setTone(e.target.value as any)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="urgent">Urgent</option>
                    <option value="friendly">Friendly</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Number of Variants
                  </label>
                  <input
                    type="number"
                    value={numberOfVariants}
                    onChange={e =>
                      setNumberOfVariants(parseInt(e.target.value))
                    }
                    min="2"
                    max="5"
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>

              <button
                onClick={generateVariants}
                disabled={isGenerating}
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isGenerating ? 'Generating...' : 'Generate Variants'}
              </button>
            </div>
          </div>

          {/* Test Analysis Panel */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">Test Analysis</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Test ID
                </label>
                <input
                  type="text"
                  value={selectedTestId}
                  onChange={e => setSelectedTestId(e.target.value)}
                  placeholder="Enter test ID to analyze"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>

              <button
                onClick={analyzeTest}
                className="w-full rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                Analyze Test Results
              </button>

              {testResults && (
                <div className="mt-4 rounded-md bg-gray-50 p-4">
                  <h3 className="mb-2 font-semibold">Test Results</h3>
                  <p className="mb-2 text-sm text-gray-600">
                    Confidence Level:{' '}
                    {(testResults.confidence_level * 100).toFixed(1)}%
                  </p>
                  <p className="mb-2 text-sm text-gray-600">
                    Recommendation: {testResults.recommended_action}
                  </p>
                  {testResults.winner && (
                    <div className="mt-2 rounded bg-green-100 p-2">
                      <p className="text-sm font-medium text-green-800">
                        Winner:
                      </p>
                      <p className="text-sm text-green-700">
                        {testResults.winner.content}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Generated Variants */}
        {generatedVariants.length > 0 && (
          <div className="mt-8 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">Generated Variants</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {generatedVariants.map((variant, index) => (
                <div
                  key={variant.id}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <h3 className="mb-2 font-medium">{variant.variant_name}</h3>
                  <p className="mb-3 text-gray-700">{variant.content}</p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Impressions:</span>
                      <input
                        type="number"
                        defaultValue={variant.performance_metrics.impressions}
                        onChange={e =>
                          updateMetrics(
                            variant.id,
                            'impressions',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-20 rounded border border-gray-300 px-2 py-1"
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Clicks:</span>
                      <input
                        type="number"
                        defaultValue={variant.performance_metrics.clicks}
                        onChange={e =>
                          updateMetrics(
                            variant.id,
                            'clicks',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-20 rounded border border-gray-300 px-2 py-1"
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Conversions:</span>
                      <input
                        type="number"
                        defaultValue={variant.performance_metrics.conversions}
                        onChange={e =>
                          updateMetrics(
                            variant.id,
                            'conversions',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-20 rounded border border-gray-300 px-2 py-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Insights */}
        {insights && (
          <div className="mt-8 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">Performance Insights</h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 font-medium">Average Metrics</h3>
                <div className="space-y-1 text-sm">
                  <p>CTR: {(insights.average_metrics.ctr * 100).toFixed(2)}%</p>
                  <p>
                    Conversion Rate:{' '}
                    {(insights.average_metrics.conversion_rate * 100).toFixed(
                      2
                    )}
                    %
                  </p>
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-medium">Recommendations</h3>
                <ul className="space-y-1 text-sm">
                  {insights.recommendations.map(
                    (rec: string, index: number) => (
                      <li key={index} className="text-gray-600">
                        • {rec}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>

            {insights.best_performing.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-2 font-medium">Best Performing Variants</h3>
                <div className="space-y-2">
                  {insights.best_performing.map(
                    (variant: CopyVariant, index: number) => (
                      <div
                        key={index}
                        className="rounded border-l-4 border-green-400 bg-green-50 p-3"
                      >
                        <p className="text-sm font-medium">{variant.content}</p>
                        <p className="text-xs text-gray-600">
                          CTR:{' '}
                          {(variant.performance_metrics.ctr * 100).toFixed(2)}%
                          | Conv:{' '}
                          {(
                            variant.performance_metrics.conversion_rate * 100
                          ).toFixed(2)}
                          %
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
