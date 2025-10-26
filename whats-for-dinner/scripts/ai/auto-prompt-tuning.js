#!/usr/bin/env node

/**
 * AI Auto-Prompt Tuning Agent
 * Automatically optimizes OpenAI prompts based on performance metrics and user feedback
 */

const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  supabaseUrl: process.env.SUPABASE_URL || 'http://localhost:54321',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
  outputDir: path.join(__dirname, '../ai-monitoring'),
  verbose: process.env.VERBOSE === 'true'
};

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logVerbose(message) {
  if (config.verbose) {
    log(`[VERBOSE] ${message}`, 'blue');
  }
}

// Initialize clients
const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);
const openai = new OpenAI({ apiKey: config.openaiApiKey });

/**
 * Prompt templates for different meal generation scenarios
 */
const PROMPT_TEMPLATES = {
  meal_generation: {
    base: `Generate a meal suggestion based on the following criteria:
- Dietary restrictions: {dietary}
- Allergies: {allergies}
- Cuisine preferences: {cuisine}
- Difficulty level: {difficulty}
- Cooking time: {cooking_time} minutes
- Servings: {servings}

Please provide:
1. Meal name
2. Brief description
3. List of ingredients with quantities
4. Step-by-step cooking instructions
5. Nutritional information
6. Cooking tips

Format the response as JSON.`,
    
    optimized_v1: `You are a professional chef and nutritionist. Create a meal that perfectly matches the user's preferences:

DIETARY REQUIREMENTS: {dietary}
ALLERGIES TO AVOID: {allergies}
CUISINE STYLE: {cuisine}
SKILL LEVEL: {difficulty}
TIME AVAILABLE: {cooking_time} minutes
SERVING SIZE: {servings} people

Generate a complete meal plan with:
- Creative, appealing meal name
- Detailed description highlighting key flavors
- Precise ingredient list with exact measurements
- Clear, numbered cooking steps
- Complete nutritional breakdown (calories, protein, carbs, fat)
- Pro cooking tips and variations

Respond in valid JSON format only.`,
    
    optimized_v2: `Create the perfect meal for this user profile:

🎯 TARGET: {dietary} diet, {cuisine} cuisine
⚠️ AVOID: {allergies}
👨‍🍳 SKILL: {difficulty} level
⏰ TIME: {cooking_time} minutes
👥 SERVES: {servings}

Deliver a restaurant-quality meal suggestion with:
- Compelling, descriptive name
- Rich flavor profile description
- Detailed ingredient list (exact measurements)
- Professional cooking instructions
- Complete nutrition facts
- Chef's tips and substitutions

JSON format required.`
  },
  
  recipe_enhancement: {
    base: `Enhance this recipe to make it more appealing and detailed:
{recipe}

Please improve:
1. Recipe name and description
2. Ingredient list with better measurements
3. Cooking instructions with more detail
4. Nutritional information
5. Cooking tips and variations`,
    
    optimized: `Transform this recipe into a culinary masterpiece:

ORIGINAL RECIPE: {recipe}

Enhance with:
- More enticing name and description
- Professional ingredient measurements
- Detailed, foolproof instructions
- Complete nutritional analysis
- Expert tips and creative variations
- Difficulty assessment and time estimates

Make it restaurant-quality while keeping it accessible.`
  },
  
  dietary_adaptation: {
    base: `Adapt this recipe for the following dietary requirements:
Recipe: {recipe}
Dietary needs: {dietary}
Allergies: {allergies}

Please modify the recipe accordingly.`,
    
    optimized: `Intelligently adapt this recipe for specific dietary needs:

ORIGINAL: {recipe}
DIETARY: {dietary}
RESTRICTIONS: {allergies}

Provide:
- Modified recipe with appropriate substitutions
- Explanation of changes made
- Alternative ingredient options
- Adjusted cooking instructions if needed
- Nutritional impact of modifications
- Tips for maintaining flavor and texture`
  }
};

/**
 * Performance metrics for prompt evaluation
 */
class PromptMetrics {
  constructor() {
    this.metrics = {
      response_time: [],
      user_satisfaction: [],
      accuracy: [],
      creativity: [],
      completeness: [],
      json_validity: []
    };
  }

  addMetric(type, value) {
    if (this.metrics[type]) {
      this.metrics[type].push({
        value,
        timestamp: new Date().toISOString()
      });
    }
  }

  getAverage(type) {
    const values = this.metrics[type] || [];
    if (values.length === 0) return 0;
    return values.reduce((sum, item) => sum + item.value, 0) / values.length;
  }

  getTrend(type, days = 7) {
    const values = this.metrics[type] || [];
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const recent = values.filter(item => new Date(item.timestamp) > cutoff);
    const older = values.filter(item => new Date(item.timestamp) <= cutoff);
    
    if (recent.length === 0 || older.length === 0) return 0;
    
    const recentAvg = recent.reduce((sum, item) => sum + item.value, 0) / recent.length;
    const olderAvg = older.reduce((sum, item) => sum + item.value, 0) / older.length;
    
    return ((recentAvg - olderAvg) / olderAvg) * 100;
  }
}

/**
 * A/B testing framework for prompt optimization
 */
class PromptABTesting {
  constructor() {
    this.experiments = new Map();
  }

  createExperiment(name, variants) {
    const experiment = {
      name,
      variants,
      traffic_split: 0.5, // 50/50 split
      start_date: new Date().toISOString(),
      status: 'active',
      results: {
        variant_a: { impressions: 0, conversions: 0, metrics: new PromptMetrics() },
        variant_b: { impressions: 0, conversions: 0, metrics: new PromptMetrics() }
      }
    };
    
    this.experiments.set(name, experiment);
    return experiment;
  }

  selectVariant(experimentName, userId) {
    const experiment = this.experiments.get(experimentName);
    if (!experiment) return null;

    // Simple hash-based selection for consistency
    const hash = this.hashString(userId + experimentName);
    const isVariantA = hash % 100 < (experiment.traffic_split * 100);
    
    return isVariantA ? 'variant_a' : 'variant_b';
  }

  recordImpression(experimentName, variant, userId) {
    const experiment = this.experiments.get(experimentName);
    if (!experiment) return;

    experiment.results[variant].impressions++;
    logVerbose(`Recorded impression for ${experimentName} - ${variant}`);
  }

  recordConversion(experimentName, variant, userId, metrics) {
    const experiment = this.experiments.get(experimentName);
    if (!experiment) return;

    experiment.results[variant].conversions++;
    
    // Record detailed metrics
    Object.keys(metrics).forEach(metricType => {
      experiment.results[variant].metrics.addMetric(metricType, metrics[metricType]);
    });
    
    logVerbose(`Recorded conversion for ${experimentName} - ${variant}`);
  }

  getExperimentResults(experimentName) {
    const experiment = this.experiments.get(experimentName);
    if (!experiment) return null;

    const { variant_a, variant_b } = experiment.results;
    
    return {
      name: experimentName,
      status: experiment.status,
      duration: Date.now() - new Date(experiment.start_date).getTime(),
      results: {
        variant_a: {
          impressions: variant_a.impressions,
          conversions: variant_a.conversions,
          conversion_rate: variant_a.impressions > 0 ? variant_a.conversions / variant_a.impressions : 0,
          avg_metrics: this.calculateAverageMetrics(variant_a.metrics)
        },
        variant_b: {
          impressions: variant_b.impressions,
          conversions: variant_b.conversions,
          conversion_rate: variant_b.impressions > 0 ? variant_b.conversions / variant_b.impressions : 0,
          avg_metrics: this.calculateAverageMetrics(variant_b.metrics)
        }
      },
      winner: this.determineWinner(variant_a, variant_b)
    };
  }

  calculateAverageMetrics(metrics) {
    const result = {};
    Object.keys(metrics.metrics).forEach(type => {
      result[type] = metrics.getAverage(type);
    });
    return result;
  }

  determineWinner(variant_a, variant_b) {
    const rate_a = variant_a.impressions > 0 ? variant_a.conversions / variant_a.impressions : 0;
    const rate_b = variant_b.impressions > 0 ? variant_b.conversions / variant_b.impressions : 0;
    
    if (rate_a > rate_b) return 'variant_a';
    if (rate_b > rate_a) return 'variant_b';
    return 'tie';
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

/**
 * Prompt optimization engine
 */
class PromptOptimizer {
  constructor() {
    this.abTesting = new PromptABTesting();
    this.optimizationHistory = [];
  }

  async optimizePrompt(promptType, userContext, performanceData) {
    try {
      log(`Optimizing prompt for type: ${promptType}`, 'yellow');
      
      // Analyze current performance
      const analysis = await this.analyzePerformance(promptType, performanceData);
      
      // Generate optimization suggestions
      const suggestions = await this.generateOptimizationSuggestions(promptType, analysis);
      
      // Create optimized prompt
      const optimizedPrompt = await this.createOptimizedPrompt(promptType, suggestions);
      
      // Set up A/B test
      const experiment = this.abTesting.createExperiment(
        `${promptType}_optimization_${Date.now()}`,
        ['current', 'optimized']
      );
      
      // Store optimization
      this.optimizationHistory.push({
        promptType,
        originalPrompt: PROMPT_TEMPLATES[promptType].base,
        optimizedPrompt,
        suggestions,
        analysis,
        experimentId: experiment.name,
        createdAt: new Date().toISOString()
      });
      
      log(`Prompt optimization completed for ${promptType}`, 'green');
      return {
        optimizedPrompt,
        suggestions,
        experimentId: experiment.name
      };
      
    } catch (error) {
      log(`Error optimizing prompt: ${error.message}`, 'red');
      throw error;
    }
  }

  async analyzePerformance(promptType, performanceData) {
    const analysis = {
      responseTime: this.calculateAverage(performanceData, 'response_time'),
      userSatisfaction: this.calculateAverage(performanceData, 'user_satisfaction'),
      accuracy: this.calculateAverage(performanceData, 'accuracy'),
      creativity: this.calculateAverage(performanceData, 'creativity'),
      completeness: this.calculateAverage(performanceData, 'completeness'),
      jsonValidity: this.calculateAverage(performanceData, 'json_validity'),
      trends: this.calculateTrends(performanceData)
    };
    
    return analysis;
  }

  calculateAverage(data, metric) {
    if (!data || data.length === 0) return 0;
    const values = data.map(item => item[metric]).filter(val => val !== undefined);
    return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
  }

  calculateTrends(data) {
    const trends = {};
    const metrics = ['response_time', 'user_satisfaction', 'accuracy', 'creativity', 'completeness', 'json_validity'];
    
    metrics.forEach(metric => {
      const values = data.map(item => item[metric]).filter(val => val !== undefined);
      if (values.length > 1) {
        const firstHalf = values.slice(0, Math.floor(values.length / 2));
        const secondHalf = values.slice(Math.floor(values.length / 2));
        
        const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
        
        trends[metric] = ((secondAvg - firstAvg) / firstAvg) * 100;
      }
    });
    
    return trends;
  }

  async generateOptimizationSuggestions(promptType, analysis) {
    const suggestions = [];
    
    // Response time optimization
    if (analysis.responseTime > 3000) {
      suggestions.push({
        type: 'response_time',
        priority: 'high',
        suggestion: 'Simplify prompt structure and reduce complexity to improve response time',
        impact: 'Reduce response time by 20-30%'
      });
    }
    
    // User satisfaction optimization
    if (analysis.userSatisfaction < 4.0) {
      suggestions.push({
        type: 'user_satisfaction',
        priority: 'high',
        suggestion: 'Add more specific instructions and examples to improve output quality',
        impact: 'Increase user satisfaction by 15-25%'
      });
    }
    
    // Accuracy optimization
    if (analysis.accuracy < 0.8) {
      suggestions.push({
        type: 'accuracy',
        priority: 'high',
        suggestion: 'Add validation criteria and specific requirements to improve accuracy',
        impact: 'Improve accuracy by 10-20%'
      });
    }
    
    // Creativity optimization
    if (analysis.creativity < 3.5) {
      suggestions.push({
        type: 'creativity',
        priority: 'medium',
        suggestion: 'Add creative constraints and inspiration prompts to enhance creativity',
        impact: 'Increase creativity score by 15-30%'
      });
    }
    
    // JSON validity optimization
    if (analysis.jsonValidity < 0.95) {
      suggestions.push({
        type: 'json_validity',
        priority: 'high',
        suggestion: 'Strengthen JSON format requirements and add validation examples',
        impact: 'Improve JSON validity to 98%+'
      });
    }
    
    return suggestions;
  }

  async createOptimizedPrompt(promptType, suggestions) {
    const basePrompt = PROMPT_TEMPLATES[promptType].base;
    let optimizedPrompt = basePrompt;
    
    // Apply optimizations based on suggestions
    suggestions.forEach(suggestion => {
      switch (suggestion.type) {
        case 'response_time':
          optimizedPrompt = this.optimizeForResponseTime(optimizedPrompt);
          break;
        case 'user_satisfaction':
          optimizedPrompt = this.optimizeForUserSatisfaction(optimizedPrompt);
          break;
        case 'accuracy':
          optimizedPrompt = this.optimizeForAccuracy(optimizedPrompt);
          break;
        case 'creativity':
          optimizedPrompt = this.optimizeForCreativity(optimizedPrompt);
          break;
        case 'json_validity':
          optimizedPrompt = this.optimizeForJsonValidity(optimizedPrompt);
          break;
      }
    });
    
    return optimizedPrompt;
  }

  optimizeForResponseTime(prompt) {
    // Remove unnecessary words and simplify structure
    return prompt
      .replace(/\s+/g, ' ')
      .replace(/Please provide:/g, 'Provide:')
      .replace(/Please generate:/g, 'Generate:')
      .trim();
  }

  optimizeForUserSatisfaction(prompt) {
    // Add more specific instructions and examples
    return prompt + '\n\nIMPORTANT: Be specific, detailed, and helpful. Include practical tips and variations.';
  }

  optimizeForAccuracy(prompt) {
    // Add validation criteria
    return prompt + '\n\nVALIDATION: Ensure all measurements are precise, instructions are clear, and nutritional data is accurate.';
  }

  optimizeForCreativity(prompt) {
    // Add creative constraints
    return prompt + '\n\nCREATIVITY: Think outside the box while staying practical. Suggest unique flavor combinations and presentation ideas.';
  }

  optimizeForJsonValidity(prompt) {
    // Strengthen JSON requirements
    return prompt + '\n\nFORMAT: Respond ONLY with valid JSON. No additional text, explanations, or markdown formatting.';
  }

  async getOptimizationReport() {
    const report = {
      totalOptimizations: this.optimizationHistory.length,
      activeExperiments: Array.from(this.abTesting.experiments.keys()),
      recentOptimizations: this.optimizationHistory.slice(-10),
      performanceImprovements: this.calculatePerformanceImprovements()
    };
    
    return report;
  }

  calculatePerformanceImprovements() {
    const improvements = {};
    const metrics = ['response_time', 'user_satisfaction', 'accuracy', 'creativity', 'completeness', 'json_validity'];
    
    metrics.forEach(metric => {
      const values = this.optimizationHistory.map(opt => 
        opt.analysis[metric] || 0
      );
      
      if (values.length > 1) {
        const first = values[0];
        const last = values[values.length - 1];
        improvements[metric] = ((last - first) / first) * 100;
      }
    });
    
    return improvements;
  }
}

/**
 * Main auto-prompt tuning function
 */
async function runAutoPromptTuning() {
  try {
    log('Starting auto-prompt tuning process...', 'blue');
    
    // Ensure output directory exists
    if (!fs.existsSync(config.outputDir)) {
      fs.mkdirSync(config.outputDir, { recursive: true });
    }
    
    const optimizer = new PromptOptimizer();
    
    // Get performance data from database
    const performanceData = await getPerformanceData();
    
    // Optimize each prompt type
    const optimizations = {};
    for (const promptType of Object.keys(PROMPT_TEMPLATES)) {
      log(`Optimizing ${promptType}...`, 'yellow');
      
      const optimization = await optimizer.optimizePrompt(
        promptType,
        {},
        performanceData[promptType] || []
      );
      
      optimizations[promptType] = optimization;
    }
    
    // Generate optimization report
    const report = await optimizer.getOptimizationReport();
    
    // Save results
    const results = {
      timestamp: new Date().toISOString(),
      optimizations,
      report,
      abTestingResults: {}
    };
    
    // Get A/B testing results
    for (const experimentName of report.activeExperiments) {
      results.abTestingResults[experimentName] = optimizer.abTesting.getExperimentResults(experimentName);
    }
    
    // Save to files
    fs.writeFileSync(
      path.join(config.outputDir, 'prompt-optimizations.json'),
      JSON.stringify(results, null, 2)
    );
    
    // Generate HTML report
    const htmlReport = generateOptimizationHTMLReport(results);
    fs.writeFileSync(
      path.join(config.outputDir, 'prompt-optimization-report.html'),
      htmlReport
    );
    
    // Generate optimized prompt templates
    const optimizedTemplates = generateOptimizedTemplates(optimizations);
    fs.writeFileSync(
      path.join(config.outputDir, 'optimized-prompts.js'),
      optimizedTemplates
    );
    
    log('Auto-prompt tuning completed successfully!', 'green');
    log(`Results saved to: ${config.outputDir}`, 'blue');
    
    return results;
    
  } catch (error) {
    log(`Auto-prompt tuning failed: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Get performance data from database
 */
async function getPerformanceData() {
  try {
    log('Fetching performance data...', 'yellow');
    
    // Get meal generation performance data
    const { data: mealData, error: mealError } = await supabase
      .from('meal_analytics')
      .select('*')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    
    if (mealError) throw mealError;
    
    // Get user feedback data
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('user_feedback')
      .select('*')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    
    if (feedbackError) throw feedbackError;
    
    // Process data by prompt type
    const performanceData = {
      meal_generation: processMealGenerationData(mealData, feedbackData),
      recipe_enhancement: processRecipeEnhancementData(feedbackData),
      dietary_adaptation: processDietaryAdaptationData(feedbackData)
    };
    
    log(`Fetched performance data for ${Object.keys(performanceData).length} prompt types`, 'green');
    return performanceData;
    
  } catch (error) {
    log(`Error fetching performance data: ${error.message}`, 'red');
    return {};
  }
}

/**
 * Process meal generation performance data
 */
function processMealGenerationData(mealData, feedbackData) {
  const data = [];
  
  mealData.forEach(meal => {
    const feedback = feedbackData.find(f => f.meal_id === meal.id);
    
    data.push({
      response_time: meal.response_time || 0,
      user_satisfaction: feedback?.satisfaction_rating || 0,
      accuracy: feedback?.accuracy_rating || 0,
      creativity: feedback?.creativity_rating || 0,
      completeness: feedback?.completeness_rating || 0,
      json_validity: meal.json_valid ? 1 : 0,
      timestamp: meal.created_at
    });
  });
  
  return data;
}

/**
 * Process recipe enhancement performance data
 */
function processRecipeEnhancementData(feedbackData) {
  return feedbackData
    .filter(f => f.feedback_type === 'recipe_enhancement')
    .map(feedback => ({
      response_time: feedback.response_time || 0,
      user_satisfaction: feedback.satisfaction_rating || 0,
      accuracy: feedback.accuracy_rating || 0,
      creativity: feedback.creativity_rating || 0,
      completeness: feedback.completeness_rating || 0,
      json_validity: feedback.json_valid ? 1 : 0,
      timestamp: feedback.created_at
    }));
}

/**
 * Process dietary adaptation performance data
 */
function processDietaryAdaptationData(feedbackData) {
  return feedbackData
    .filter(f => f.feedback_type === 'dietary_adaptation')
    .map(feedback => ({
      response_time: feedback.response_time || 0,
      user_satisfaction: feedback.satisfaction_rating || 0,
      accuracy: feedback.accuracy_rating || 0,
      creativity: feedback.creativity_rating || 0,
      completeness: feedback.completeness_rating || 0,
      json_validity: feedback.json_valid ? 1 : 0,
      timestamp: feedback.created_at
    }));
}

/**
 * Generate HTML optimization report
 */
function generateOptimizationHTMLReport(results) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Prompt Optimization Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f5f5f5;
            color: #333;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }
        
        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .section {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .section h2 {
            margin-bottom: 1rem;
            color: #333;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }
        
        .stat-card {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 1rem;
            text-align: center;
        }
        
        .stat-card h3 {
            font-size: 2rem;
            color: #333;
            margin-bottom: 0.5rem;
        }
        
        .stat-card p {
            color: #666;
            font-size: 0.9rem;
        }
        
        .optimization-item {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
        }
        
        .optimization-item h3 {
            color: #333;
            margin-bottom: 0.5rem;
        }
        
        .suggestions {
            margin-top: 1rem;
        }
        
        .suggestion {
            background: #f8f9fa;
            border-left: 4px solid #007bff;
            padding: 0.75rem;
            margin-bottom: 0.5rem;
        }
        
        .suggestion.high {
            border-left-color: #dc3545;
        }
        
        .suggestion.medium {
            border-left-color: #ffc107;
        }
        
        .suggestion.low {
            border-left-color: #28a745;
        }
        
        .ab-test-results {
            margin-top: 1rem;
        }
        
        .variant {
            display: inline-block;
            background: #e9ecef;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            margin-right: 1rem;
            margin-bottom: 0.5rem;
        }
        
        .variant.winner {
            background: #d4edda;
            color: #155724;
        }
        
        .metric {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
        }
        
        .metric-value {
            font-weight: bold;
        }
        
        .improvement {
            color: #28a745;
        }
        
        .decline {
            color: #dc3545;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>AI Prompt Optimization Report</h1>
        <p>Generated on ${new Date(results.timestamp).toLocaleString()}</p>
    </div>
    
    <div class="container">
        <!-- Summary Statistics -->
        <div class="section">
            <h2>Optimization Summary</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>${results.report.totalOptimizations}</h3>
                    <p>Total Optimizations</p>
                </div>
                
                <div class="stat-card">
                    <h3>${results.report.activeExperiments.length}</h3>
                    <p>Active A/B Tests</p>
                </div>
                
                <div class="stat-card">
                    <h3>${Object.keys(results.optimizations).length}</h3>
                    <p>Prompt Types Optimized</p>
                </div>
                
                <div class="stat-card">
                    <h3>${Object.keys(results.report.performanceImprovements).length}</h3>
                    <p>Metrics Tracked</p>
                </div>
            </div>
        </div>
        
        <!-- Performance Improvements -->
        <div class="section">
            <h2>Performance Improvements</h2>
            ${Object.entries(results.report.performanceImprovements).map(([metric, improvement]) => `
                <div class="metric">
                    <span>${metric.replace('_', ' ').toUpperCase()}</span>
                    <span class="metric-value ${improvement > 0 ? 'improvement' : 'decline'}">
                        ${improvement > 0 ? '+' : ''}${improvement.toFixed(1)}%
                    </span>
                </div>
            `).join('')}
        </div>
        
        <!-- Optimizations by Prompt Type -->
        <div class="section">
            <h2>Optimizations by Prompt Type</h2>
            ${Object.entries(results.optimizations).map(([promptType, optimization]) => `
                <div class="optimization-item">
                    <h3>${promptType.replace('_', ' ').toUpperCase()}</h3>
                    <p><strong>Experiment ID:</strong> ${optimization.experimentId}</p>
                    
                    <div class="suggestions">
                        <h4>Optimization Suggestions:</h4>
                        ${optimization.suggestions.map(suggestion => `
                            <div class="suggestion ${suggestion.priority}">
                                <strong>${suggestion.type.replace('_', ' ').toUpperCase()}</strong>
                                <p>${suggestion.suggestion}</p>
                                <small>Expected impact: ${suggestion.impact}</small>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
        
        <!-- A/B Testing Results -->
        <div class="section">
            <h2>A/B Testing Results</h2>
            ${Object.entries(results.abTestingResults).map(([experimentName, result]) => `
                <div class="optimization-item">
                    <h3>${experimentName}</h3>
                    <p><strong>Status:</strong> ${result.status}</p>
                    <p><strong>Duration:</strong> ${Math.round(result.duration / (1000 * 60 * 60))} hours</p>
                    
                    <div class="ab-test-results">
                        <div class="variant ${result.winner === 'variant_a' ? 'winner' : ''}">
                            <strong>Variant A</strong>
                            <p>Impressions: ${result.results.variant_a.impressions}</p>
                            <p>Conversions: ${result.results.variant_a.conversions}</p>
                            <p>Conversion Rate: ${(result.results.variant_a.conversion_rate * 100).toFixed(2)}%</p>
                        </div>
                        
                        <div class="variant ${result.winner === 'variant_b' ? 'winner' : ''}">
                            <strong>Variant B</strong>
                            <p>Impressions: ${result.results.variant_b.impressions}</p>
                            <p>Conversions: ${result.results.variant_b.conversions}</p>
                            <p>Conversion Rate: ${(result.results.variant_b.conversion_rate * 100).toFixed(2)}%</p>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;
}

/**
 * Generate optimized prompt templates
 */
function generateOptimizedTemplates(optimizations) {
  return `// Optimized AI Prompt Templates
// Generated by Auto-Prompt Tuning Agent

const OPTIMIZED_PROMPT_TEMPLATES = {
${Object.entries(optimizations).map(([promptType, optimization]) => `
  ${promptType}: {
    base: \`${PROMPT_TEMPLATES[promptType].base}\`,
    optimized: \`${optimization.optimizedPrompt}\`,
    suggestions: ${JSON.stringify(optimization.suggestions, null, 4)},
    experimentId: '${optimization.experimentId}'
  },`).join('')}
};

module.exports = { OPTIMIZED_PROMPT_TEMPLATES };`;
}

// Run auto-prompt tuning if called directly
if (require.main === module) {
  runAutoPromptTuning()
    .then(() => {
      log('Auto-prompt tuning completed successfully', 'green');
      process.exit(0);
    })
    .catch(error => {
      log(`Auto-prompt tuning failed: ${error.message}`, 'red');
      process.exit(1);
    });
}

module.exports = { runAutoPromptTuning, PromptOptimizer, PromptABTesting };