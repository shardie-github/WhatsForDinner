#!/usr/bin/env node

/**
 * AI Regression Testing Agent
 * Automatically tests AI responses for regressions and quality degradation
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
  verbose: process.env.VERBOSE === 'true',
  testThresholds: {
    responseTime: 5000, // 5 seconds
    accuracy: 0.8, // 80%
    relevance: 0.8, // 80%
    completeness: 0.8, // 80%
    creativity: 0.7, // 70%
    jsonValidity: 0.95, // 95%
    userSatisfaction: 4.0, // 4.0/5.0
  },
};

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
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
 * Test case definitions for different AI scenarios
 */
const TEST_CASES = {
  meal_generation: [
    {
      name: 'Basic meal generation',
      input: {
        dietary: 'vegetarian',
        allergies: 'none',
        cuisine: 'italian',
        difficulty: 'easy',
        cooking_time: 30,
        servings: 4,
      },
      expectedOutput: {
        hasName: true,
        hasDescription: true,
        hasIngredients: true,
        hasInstructions: true,
        hasNutrition: true,
        isVegetarian: true,
        cookingTime: 30,
        servings: 4,
      },
    },
    {
      name: 'Complex dietary requirements',
      input: {
        dietary: 'vegan',
        allergies: 'nuts, soy',
        cuisine: 'asian',
        difficulty: 'medium',
        cooking_time: 45,
        servings: 2,
      },
      expectedOutput: {
        hasName: true,
        hasDescription: true,
        hasIngredients: true,
        hasInstructions: true,
        hasNutrition: true,
        isVegan: true,
        noNuts: true,
        noSoy: true,
        cookingTime: 45,
        servings: 2,
      },
    },
    {
      name: 'Quick meal generation',
      input: {
        dietary: 'keto',
        allergies: 'none',
        cuisine: 'american',
        difficulty: 'easy',
        cooking_time: 15,
        servings: 1,
      },
      expectedOutput: {
        hasName: true,
        hasDescription: true,
        hasIngredients: true,
        hasInstructions: true,
        hasNutrition: true,
        isKeto: true,
        cookingTime: 15,
        servings: 1,
      },
    },
  ],

  recipe_enhancement: [
    {
      name: 'Basic recipe enhancement',
      input: {
        recipe: 'Pasta with tomato sauce',
      },
      expectedOutput: {
        hasEnhancedName: true,
        hasDetailedDescription: true,
        hasPreciseIngredients: true,
        hasStepByStepInstructions: true,
        hasNutritionInfo: true,
        hasCookingTips: true,
      },
    },
    {
      name: 'Complex recipe enhancement',
      input: {
        recipe: 'Chicken stir fry with vegetables',
      },
      expectedOutput: {
        hasEnhancedName: true,
        hasDetailedDescription: true,
        hasPreciseIngredients: true,
        hasStepByStepInstructions: true,
        hasNutritionInfo: true,
        hasCookingTips: true,
        hasVariations: true,
      },
    },
  ],

  dietary_adaptation: [
    {
      name: 'Vegetarian adaptation',
      input: {
        recipe: 'Beef lasagna',
        dietary: 'vegetarian',
        allergies: 'none',
      },
      expectedOutput: {
        hasAdaptedRecipe: true,
        isVegetarian: true,
        hasSubstitutions: true,
        hasExplanation: true,
        maintainsFlavor: true,
      },
    },
    {
      name: 'Gluten-free adaptation',
      input: {
        recipe: 'Chocolate cake',
        dietary: 'gluten-free',
        allergies: 'none',
      },
      expectedOutput: {
        hasAdaptedRecipe: true,
        isGlutenFree: true,
        hasSubstitutions: true,
        hasExplanation: true,
        maintainsTexture: true,
      },
    },
  ],
};

/**
 * Regression testing engine
 */
class RegressionTester {
  constructor() {
    this.testResults = [];
    this.baselineResults = new Map();
    this.regressionThresholds = config.testThresholds;
  }

  async runRegressionTests() {
    try {
      log('Starting regression tests...', 'blue');

      const results = {
        timestamp: new Date().toISOString(),
        testSuites: {},
        summary: {
          totalTests: 0,
          passedTests: 0,
          failedTests: 0,
          regressions: 0,
          improvements: 0,
        },
      };

      // Run tests for each AI scenario
      for (const [scenario, testCases] of Object.entries(TEST_CASES)) {
        log(`Running tests for ${scenario}...`, 'yellow');

        const scenarioResults = await this.runScenarioTests(
          scenario,
          testCases
        );
        results.testSuites[scenario] = scenarioResults;

        results.summary.totalTests += scenarioResults.totalTests;
        results.summary.passedTests += scenarioResults.passedTests;
        results.summary.failedTests += scenarioResults.failedTests;
        results.summary.regressions += scenarioResults.regressions;
        results.summary.improvements += scenarioResults.improvements;
      }

      // Generate regression report
      const regressionReport = await this.generateRegressionReport(results);
      results.regressionReport = regressionReport;

      // Save results
      this.saveResults(results);

      log('Regression tests completed!', 'green');
      log(`Total tests: ${results.summary.totalTests}`, 'blue');
      log(`Passed: ${results.summary.passedTests}`, 'green');
      log(`Failed: ${results.summary.failedTests}`, 'red');
      log(`Regressions: ${results.summary.regressions}`, 'red');
      log(`Improvements: ${results.summary.improvements}`, 'green');

      return results;
    } catch (error) {
      log(`Regression testing failed: ${error.message}`, 'red');
      throw error;
    }
  }

  async runScenarioTests(scenario, testCases) {
    const results = {
      scenario,
      totalTests: testCases.length,
      passedTests: 0,
      failedTests: 0,
      regressions: 0,
      improvements: 0,
      testResults: [],
    };

    for (const testCase of testCases) {
      try {
        logVerbose(`Running test: ${testCase.name}`);

        const testResult = await this.runSingleTest(scenario, testCase);
        results.testResults.push(testResult);

        if (testResult.passed) {
          results.passedTests++;
        } else {
          results.failedTests++;
        }

        // Check for regressions
        if (testResult.regression) {
          results.regressions++;
        }

        // Check for improvements
        if (testResult.improvement) {
          results.improvements++;
        }
      } catch (error) {
        log(`Test failed: ${testCase.name} - ${error.message}`, 'red');
        results.failedTests++;
        results.testResults.push({
          testName: testCase.name,
          passed: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }
    }

    return results;
  }

  async runSingleTest(scenario, testCase) {
    const startTime = Date.now();

    try {
      // Generate AI response
      const response = await this.generateAIResponse(scenario, testCase.input);
      const responseTime = Date.now() - startTime;

      // Parse response
      const parsedResponse = this.parseResponse(response);

      // Validate response
      const validation = this.validateResponse(
        parsedResponse,
        testCase.expectedOutput
      );

      // Check for regressions
      const regression = await this.checkRegression(scenario, testCase.name, {
        responseTime,
        validation,
        parsedResponse,
      });

      // Check for improvements
      const improvement = await this.checkImprovement(scenario, testCase.name, {
        responseTime,
        validation,
        parsedResponse,
      });

      return {
        testName: testCase.name,
        passed: validation.overallScore >= 0.8,
        responseTime,
        validation,
        regression,
        improvement,
        parsedResponse,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        testName: testCase.name,
        passed: false,
        error: error.message,
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async generateAIResponse(scenario, input) {
    try {
      const prompt = this.buildPrompt(scenario, input);

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful cooking assistant. Provide detailed, accurate, and creative meal suggestions.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      return response.choices[0].message.content;
    } catch (error) {
      throw new Error(`AI response generation failed: ${error.message}`);
    }
  }

  buildPrompt(scenario, input) {
    const prompts = {
      meal_generation: `Generate a meal suggestion based on the following criteria:
- Dietary restrictions: ${input.dietary}
- Allergies: ${input.allergies}
- Cuisine preferences: ${input.cuisine}
- Difficulty level: ${input.difficulty}
- Cooking time: ${input.cooking_time} minutes
- Servings: ${input.servings}

Please provide:
1. Meal name
2. Brief description
3. List of ingredients with quantities
4. Step-by-step cooking instructions
5. Nutritional information
6. Cooking tips

Format the response as JSON.`,

      recipe_enhancement: `Enhance this recipe to make it more appealing and detailed:
${input.recipe}

Please improve:
1. Recipe name and description
2. Ingredient list with better measurements
3. Cooking instructions with more detail
4. Nutritional information
5. Cooking tips and variations

Format the response as JSON.`,

      dietary_adaptation: `Adapt this recipe for the following dietary requirements:
Recipe: ${input.recipe}
Dietary needs: ${input.dietary}
Allergies: ${input.allergies}

Please modify the recipe accordingly and format as JSON.`,
    };

    return prompts[scenario] || '';
  }

  parseResponse(response) {
    try {
      // Try to parse as JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback to text parsing
      return this.parseTextResponse(response);
    } catch (error) {
      return {
        raw: response,
        parseError: error.message,
        isValidJson: false,
      };
    }
  }

  parseTextResponse(response) {
    const lines = response
      .split('\n')
      .map(line => line.trim())
      .filter(line => line);

    const parsed = {
      raw: response,
      isValidJson: false,
      name: '',
      description: '',
      ingredients: [],
      instructions: [],
      nutrition: {},
      tips: [],
    };

    let currentSection = '';

    for (const line of lines) {
      if (
        line.toLowerCase().includes('name') ||
        line.toLowerCase().includes('title')
      ) {
        currentSection = 'name';
        parsed.name = line.replace(/^.*?[:]\s*/, '');
      } else if (line.toLowerCase().includes('description')) {
        currentSection = 'description';
        parsed.description = line.replace(/^.*?[:]\s*/, '');
      } else if (line.toLowerCase().includes('ingredient')) {
        currentSection = 'ingredients';
      } else if (
        line.toLowerCase().includes('instruction') ||
        line.toLowerCase().includes('step')
      ) {
        currentSection = 'instructions';
      } else if (line.toLowerCase().includes('nutrition')) {
        currentSection = 'nutrition';
      } else if (line.toLowerCase().includes('tip')) {
        currentSection = 'tips';
      } else if (
        line.startsWith('-') ||
        line.startsWith('•') ||
        line.match(/^\d+\./)
      ) {
        const content = line.replace(/^[-•\d.\s]+/, '');
        if (currentSection === 'ingredients') {
          parsed.ingredients.push(content);
        } else if (currentSection === 'instructions') {
          parsed.instructions.push(content);
        } else if (currentSection === 'tips') {
          parsed.tips.push(content);
        }
      } else if (currentSection === 'name' && !parsed.name) {
        parsed.name = line;
      } else if (currentSection === 'description' && !parsed.description) {
        parsed.description = line;
      }
    }

    return parsed;
  }

  validateResponse(parsedResponse, expectedOutput) {
    const validation = {
      checks: {},
      overallScore: 0,
      passedChecks: 0,
      totalChecks: 0,
    };

    // Check each expected output
    for (const [key, expected] of Object.entries(expectedOutput)) {
      const check = this.validateCheck(parsedResponse, key, expected);
      validation.checks[key] = check;
      validation.totalChecks++;

      if (check.passed) {
        validation.passedChecks++;
      }
    }

    validation.overallScore =
      validation.totalChecks > 0
        ? validation.passedChecks / validation.totalChecks
        : 0;

    return validation;
  }

  validateCheck(parsedResponse, key, expected) {
    const check = {
      key,
      expected,
      actual: null,
      passed: false,
      score: 0,
      details: '',
    };

    switch (key) {
      case 'hasName':
        check.actual = !!parsedResponse.name;
        check.passed = check.actual;
        check.score = check.actual ? 1 : 0;
        check.details = `Name: ${parsedResponse.name || 'Missing'}`;
        break;

      case 'hasDescription':
        check.actual = !!parsedResponse.description;
        check.passed = check.actual;
        check.score = check.actual ? 1 : 0;
        check.details = `Description: ${parsedResponse.description || 'Missing'}`;
        break;

      case 'hasIngredients':
        check.actual =
          Array.isArray(parsedResponse.ingredients) &&
          parsedResponse.ingredients.length > 0;
        check.passed = check.actual;
        check.score = check.actual ? 1 : 0;
        check.details = `Ingredients: ${parsedResponse.ingredients?.length || 0} items`;
        break;

      case 'hasInstructions':
        check.actual =
          Array.isArray(parsedResponse.instructions) &&
          parsedResponse.instructions.length > 0;
        check.passed = check.actual;
        check.score = check.actual ? 1 : 0;
        check.details = `Instructions: ${parsedResponse.instructions?.length || 0} steps`;
        break;

      case 'hasNutrition':
        check.actual =
          !!parsedResponse.nutrition &&
          Object.keys(parsedResponse.nutrition).length > 0;
        check.passed = check.actual;
        check.score = check.actual ? 1 : 0;
        check.details = `Nutrition: ${parsedResponse.nutrition ? 'Present' : 'Missing'}`;
        break;

      case 'isVegetarian':
        check.actual = this.checkVegetarian(parsedResponse);
        check.passed = check.actual;
        check.score = check.actual ? 1 : 0;
        check.details = `Vegetarian: ${check.actual ? 'Yes' : 'No'}`;
        break;

      case 'isVegan':
        check.actual = this.checkVegan(parsedResponse);
        check.passed = check.actual;
        check.score = check.actual ? 1 : 0;
        check.details = `Vegan: ${check.actual ? 'Yes' : 'No'}`;
        break;

      case 'isKeto':
        check.actual = this.checkKeto(parsedResponse);
        check.passed = check.actual;
        check.score = check.actual ? 1 : 0;
        check.details = `Keto: ${check.actual ? 'Yes' : 'No'}`;
        break;

      case 'noNuts':
        check.actual = this.checkNoNuts(parsedResponse);
        check.passed = check.actual;
        check.score = check.actual ? 1 : 0;
        check.details = `No Nuts: ${check.actual ? 'Yes' : 'No'}`;
        break;

      case 'noSoy':
        check.actual = this.checkNoSoy(parsedResponse);
        check.passed = check.actual;
        check.score = check.actual ? 1 : 0;
        check.details = `No Soy: ${check.actual ? 'Yes' : 'No'}`;
        break;

      case 'cookingTime':
        check.actual = this.extractCookingTime(parsedResponse);
        check.passed = Math.abs(check.actual - expected) <= 5; // Within 5 minutes
        check.score = check.passed
          ? 1
          : Math.max(0, 1 - Math.abs(check.actual - expected) / expected);
        check.details = `Cooking Time: ${check.actual} minutes (expected: ${expected})`;
        break;

      case 'servings':
        check.actual = this.extractServings(parsedResponse);
        check.passed = check.actual === expected;
        check.score = check.passed ? 1 : 0;
        check.details = `Servings: ${check.actual} (expected: ${expected})`;
        break;

      default:
        check.actual = false;
        check.passed = false;
        check.score = 0;
        check.details = `Unknown check: ${key}`;
    }

    return check;
  }

  checkVegetarian(parsedResponse) {
    const text = JSON.stringify(parsedResponse).toLowerCase();
    const meatWords = [
      'beef',
      'chicken',
      'pork',
      'lamb',
      'fish',
      'seafood',
      'meat',
    ];
    return !meatWords.some(word => text.includes(word));
  }

  checkVegan(parsedResponse) {
    const text = JSON.stringify(parsedResponse).toLowerCase();
    const nonVeganWords = [
      'beef',
      'chicken',
      'pork',
      'lamb',
      'fish',
      'seafood',
      'meat',
      'dairy',
      'milk',
      'cheese',
      'butter',
      'egg',
    ];
    return !nonVeganWords.some(word => text.includes(word));
  }

  checkKeto(parsedResponse) {
    const text = JSON.stringify(parsedResponse).toLowerCase();
    const highCarbWords = [
      'pasta',
      'bread',
      'rice',
      'potato',
      'sugar',
      'flour',
    ];
    return !highCarbWords.some(word => text.includes(word));
  }

  checkNoNuts(parsedResponse) {
    const text = JSON.stringify(parsedResponse).toLowerCase();
    const nutWords = [
      'nut',
      'almond',
      'walnut',
      'pecan',
      'cashew',
      'pistachio',
    ];
    return !nutWords.some(word => text.includes(word));
  }

  checkNoSoy(parsedResponse) {
    const text = JSON.stringify(parsedResponse).toLowerCase();
    const soyWords = ['soy', 'tofu', 'miso', 'tempeh'];
    return !soyWords.some(word => text.includes(word));
  }

  extractCookingTime(parsedResponse) {
    const text = JSON.stringify(parsedResponse);
    const timeMatch = text.match(/(\d+)\s*(?:min|minute|hour|hr)/i);
    return timeMatch ? parseInt(timeMatch[1]) : 0;
  }

  extractServings(parsedResponse) {
    const text = JSON.stringify(parsedResponse);
    const servingMatch = text.match(/(\d+)\s*(?:serving|portion|person)/i);
    return servingMatch ? parseInt(servingMatch[1]) : 0;
  }

  async checkRegression(scenario, testName, currentResult) {
    try {
      const baselineKey = `${scenario}_${testName}`;
      const baseline = this.baselineResults.get(baselineKey);

      if (!baseline) {
        // Store as new baseline
        this.baselineResults.set(baselineKey, currentResult);
        return false;
      }

      // Compare with baseline
      const regression = {
        responseTime: currentResult.responseTime > baseline.responseTime * 1.2,
        accuracy:
          currentResult.validation.overallScore <
          baseline.validation.overallScore * 0.9,
        jsonValidity:
          currentResult.parsedResponse.isValidJson === false &&
          baseline.parsedResponse.isValidJson === true,
      };

      return Object.values(regression).some(Boolean);
    } catch (error) {
      log(`Error checking regression: ${error.message}`, 'red');
      return false;
    }
  }

  async checkImprovement(scenario, testName, currentResult) {
    try {
      const baselineKey = `${scenario}_${testName}`;
      const baseline = this.baselineResults.get(baselineKey);

      if (!baseline) {
        return false;
      }

      // Compare with baseline
      const improvement = {
        responseTime: currentResult.responseTime < baseline.responseTime * 0.8,
        accuracy:
          currentResult.validation.overallScore >
          baseline.validation.overallScore * 1.1,
        jsonValidity:
          currentResult.parsedResponse.isValidJson === true &&
          baseline.parsedResponse.isValidJson === false,
      };

      return Object.values(improvement).some(Boolean);
    } catch (error) {
      log(`Error checking improvement: ${error.message}`, 'red');
      return false;
    }
  }

  async generateRegressionReport(results) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: results.summary,
      regressions: [],
      improvements: [],
      recommendations: [],
    };

    // Collect regressions and improvements
    for (const [scenario, scenarioResults] of Object.entries(
      results.testSuites
    )) {
      for (const testResult of scenarioResults.testResults) {
        if (testResult.regression) {
          report.regressions.push({
            scenario,
            testName: testResult.testName,
            details: testResult,
          });
        }

        if (testResult.improvement) {
          report.improvements.push({
            scenario,
            testName: testResult.testName,
            details: testResult,
          });
        }
      }
    }

    // Generate recommendations
    report.recommendations = this.generateRecommendations(report);

    return report;
  }

  generateRecommendations(report) {
    const recommendations = [];

    // Response time recommendations
    const slowTests = report.regressions.filter(
      r => r.details.responseTime > config.testThresholds.responseTime
    );
    if (slowTests.length > 0) {
      recommendations.push({
        category: 'performance',
        priority: 'high',
        issue: 'Slow response times detected',
        recommendation:
          'Optimize AI prompts, implement caching, or scale resources',
        affectedTests: slowTests.length,
      });
    }

    // Accuracy recommendations
    const lowAccuracyTests = report.regressions.filter(
      r => r.details.validation.overallScore < config.testThresholds.accuracy
    );
    if (lowAccuracyTests.length > 0) {
      recommendations.push({
        category: 'quality',
        priority: 'high',
        issue: 'Low accuracy detected',
        recommendation: 'Review and improve AI prompts, add more training data',
        affectedTests: lowAccuracyTests.length,
      });
    }

    // JSON validity recommendations
    const invalidJsonTests = report.regressions.filter(
      r => !r.details.parsedResponse.isValidJson
    );
    if (invalidJsonTests.length > 0) {
      recommendations.push({
        category: 'format',
        priority: 'medium',
        issue: 'Invalid JSON responses detected',
        recommendation: 'Strengthen JSON format requirements in prompts',
        affectedTests: invalidJsonTests.length,
      });
    }

    return recommendations;
  }

  saveResults(results) {
    try {
      // Ensure output directory exists
      if (!fs.existsSync(config.outputDir)) {
        fs.mkdirSync(config.outputDir, { recursive: true });
      }

      // Save JSON results
      fs.writeFileSync(
        path.join(config.outputDir, 'regression-test-results.json'),
        JSON.stringify(results, null, 2)
      );

      // Generate HTML report
      const htmlReport = this.generateHTMLReport(results);
      fs.writeFileSync(
        path.join(config.outputDir, 'regression-test-report.html'),
        htmlReport
      );

      // Save baseline results
      const baselineData = Object.fromEntries(this.baselineResults);
      fs.writeFileSync(
        path.join(config.outputDir, 'baseline-results.json'),
        JSON.stringify(baselineData, null, 2)
      );

      log(`Results saved to: ${config.outputDir}`, 'blue');
    } catch (error) {
      log(`Error saving results: ${error.message}`, 'red');
    }
  }

  generateHTMLReport(results) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Regression Test Report</title>
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
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
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
        
        .stat-card.passed {
            background: #d4edda;
            color: #155724;
        }
        
        .stat-card.failed {
            background: #f8d7da;
            color: #721c24;
        }
        
        .stat-card.regression {
            background: #fff3cd;
            color: #856404;
        }
        
        .stat-card.improvement {
            background: #d1ecf1;
            color: #0c5460;
        }
        
        .test-result {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
        }
        
        .test-result.passed {
            border-left: 4px solid #28a745;
        }
        
        .test-result.failed {
            border-left: 4px solid #dc3545;
        }
        
        .test-result h3 {
            color: #333;
            margin-bottom: 0.5rem;
        }
        
        .test-details {
            margin-top: 1rem;
            font-size: 0.9rem;
            color: #666;
        }
        
        .validation-checks {
            margin-top: 1rem;
        }
        
        .check {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
            padding: 0.5rem;
            background: #f8f9fa;
            border-radius: 4px;
        }
        
        .check.passed {
            background: #d4edda;
        }
        
        .check.failed {
            background: #f8d7da;
        }
        
        .check-name {
            font-weight: bold;
        }
        
        .check-score {
            font-weight: bold;
        }
        
        .recommendation {
            background: #f8f9fa;
            border-left: 4px solid #007bff;
            padding: 0.75rem;
            margin-bottom: 0.5rem;
        }
        
        .recommendation.high {
            border-left-color: #dc3545;
        }
        
        .recommendation.medium {
            border-left-color: #ffc107;
        }
        
        .recommendation.low {
            border-left-color: #28a745;
        }
        
        .metric {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
        }
        
        .metric-value {
            font-weight: bold;
        }
        
        .score {
            font-weight: bold;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
        }
        
        .score.passed {
            background: #28a745;
            color: white;
        }
        
        .score.failed {
            background: #dc3545;
            color: white;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>AI Regression Test Report</h1>
        <p>Generated on ${new Date(results.timestamp).toLocaleString()}</p>
    </div>
    
    <div class="container">
        <!-- Summary Statistics -->
        <div class="section">
            <h2>Test Summary</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>${results.summary.totalTests}</h3>
                    <p>Total Tests</p>
                </div>
                
                <div class="stat-card passed">
                    <h3>${results.summary.passedTests}</h3>
                    <p>Passed</p>
                </div>
                
                <div class="stat-card failed">
                    <h3>${results.summary.failedTests}</h3>
                    <p>Failed</p>
                </div>
                
                <div class="stat-card regression">
                    <h3>${results.summary.regressions}</h3>
                    <p>Regressions</p>
                </div>
                
                <div class="stat-card improvement">
                    <h3>${results.summary.improvements}</h3>
                    <p>Improvements</p>
                </div>
            </div>
        </div>
        
        <!-- Test Results by Scenario -->
        ${Object.entries(results.testSuites)
          .map(
            ([scenario, scenarioResults]) => `
            <div class="section">
                <h2>${scenario.replace('_', ' ').toUpperCase()} Tests</h2>
                <div class="metric">
                    <span>Total Tests</span>
                    <span class="metric-value">${scenarioResults.totalTests}</span>
                </div>
                <div class="metric">
                    <span>Passed</span>
                    <span class="metric-value">${scenarioResults.passedTests}</span>
                </div>
                <div class="metric">
                    <span>Failed</span>
                    <span class="metric-value">${scenarioResults.failedTests}</span>
                </div>
                <div class="metric">
                    <span>Regressions</span>
                    <span class="metric-value">${scenarioResults.regressions}</span>
                </div>
                <div class="metric">
                    <span>Improvements</span>
                    <span class="metric-value">${scenarioResults.improvements}</span>
                </div>
                
                ${scenarioResults.testResults
                  .map(
                    testResult => `
                    <div class="test-result ${testResult.passed ? 'passed' : 'failed'}">
                        <h3>${testResult.testName}</h3>
                        <p><strong>Status:</strong> ${testResult.passed ? 'PASSED' : 'FAILED'}</p>
                        <p><strong>Response Time:</strong> ${testResult.responseTime}ms</p>
                        <p><strong>Overall Score:</strong> <span class="score ${testResult.passed ? 'passed' : 'failed'}">${(testResult.validation.overallScore * 100).toFixed(1)}%</span></p>
                        
                        ${testResult.regression ? '<p><strong>⚠️ REGRESSION DETECTED</strong></p>' : ''}
                        ${testResult.improvement ? '<p><strong>✅ IMPROVEMENT DETECTED</strong></p>' : ''}
                        
                        <div class="test-details">
                            <h4>Validation Checks:</h4>
                            <div class="validation-checks">
                                ${Object.entries(testResult.validation.checks)
                                  .map(
                                    ([key, check]) => `
                                    <div class="check ${check.passed ? 'passed' : 'failed'}">
                                        <span class="check-name">${key}</span>
                                        <span class="check-score">${check.passed ? '✓' : '✗'} ${(check.score * 100).toFixed(0)}%</span>
                                    </div>
                                `
                                  )
                                  .join('')}
                            </div>
                        </div>
                    </div>
                `
                  )
                  .join('')}
            </div>
        `
          )
          .join('')}
        
        <!-- Regression Report -->
        <div class="section">
            <h2>Regression Analysis</h2>
            ${
              results.regressionReport.regressions.length > 0
                ? `
                <h3>Detected Regressions (${results.regressionReport.regressions.length})</h3>
                ${results.regressionReport.regressions
                  .map(
                    regression => `
                    <div class="test-result failed">
                        <h3>${regression.scenario} - ${regression.testName}</h3>
                        <p><strong>Response Time:</strong> ${regression.details.responseTime}ms</p>
                        <p><strong>Overall Score:</strong> ${(regression.details.validation.overallScore * 100).toFixed(1)}%</p>
                    </div>
                `
                  )
                  .join('')}
            `
                : '<p>No regressions detected.</p>'
            }
            
            ${
              results.regressionReport.improvements.length > 0
                ? `
                <h3>Detected Improvements (${results.regressionReport.improvements.length})</h3>
                ${results.regressionReport.improvements
                  .map(
                    improvement => `
                    <div class="test-result passed">
                        <h3>${improvement.scenario} - ${improvement.testName}</h3>
                        <p><strong>Response Time:</strong> ${improvement.details.responseTime}ms</p>
                        <p><strong>Overall Score:</strong> ${(improvement.details.validation.overallScore * 100).toFixed(1)}%</p>
                    </div>
                `
                  )
                  .join('')}
            `
                : ''
            }
        </div>
        
        <!-- Recommendations -->
        <div class="section">
            <h2>Recommendations</h2>
            ${results.regressionReport.recommendations
              .map(
                rec => `
                <div class="recommendation ${rec.priority}">
                    <h4>${rec.issue}</h4>
                    <p><strong>Category:</strong> ${rec.category}</p>
                    <p><strong>Priority:</strong> ${rec.priority}</p>
                    <p><strong>Affected Tests:</strong> ${rec.affectedTests}</p>
                    <p><strong>Recommendation:</strong> ${rec.recommendation}</p>
                </div>
            `
              )
              .join('')}
        </div>
    </div>
</body>
</html>`;
  }
}

/**
 * Main regression testing function
 */
async function runRegressionTesting() {
  try {
    log('Starting AI regression testing...', 'blue');

    // Ensure output directory exists
    if (!fs.existsSync(config.outputDir)) {
      fs.mkdirSync(config.outputDir, { recursive: true });
    }

    // Initialize regression tester
    const tester = new RegressionTester();

    // Run regression tests
    const results = await tester.runRegressionTests();

    log('AI regression testing completed successfully!', 'green');
    log(`Results saved to: ${config.outputDir}`, 'blue');

    return results;
  } catch (error) {
    log(`AI regression testing failed: ${error.message}`, 'red');
    throw error;
  }
}

// Run regression testing if called directly
if (require.main === module) {
  runRegressionTesting()
    .then(() => {
      log('Regression testing completed successfully', 'green');
      process.exit(0);
    })
    .catch(error => {
      log(`Regression testing failed: ${error.message}`, 'red');
      process.exit(1);
    });
}

module.exports = { runRegressionTesting, RegressionTester };
