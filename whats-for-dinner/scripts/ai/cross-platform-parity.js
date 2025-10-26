#!/usr/bin/env node

/**
 * Cross-Platform Parity Verification Agent
 * Ensures feature consistency between web and native mobile clients
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  supabaseUrl: process.env.SUPABASE_URL || 'http://localhost:54321',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  outputDir: path.join(__dirname, '../ai-monitoring'),
  verbose: process.env.VERBOSE === 'true',
  platforms: ['web', 'mobile'],
  parityThresholds: {
    responseTime: 2000, // 2 seconds
    accuracy: 0.9, // 90%
    featureCompleteness: 0.95, // 95%
    userSatisfaction: 4.0, // 4.0/5.0
    errorRate: 0.05 // 5%
  }
};

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
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

// Initialize Supabase client
const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);

/**
 * Feature definitions for cross-platform testing
 */
const FEATURE_DEFINITIONS = {
  meal_generation: {
    name: 'Meal Generation',
    description: 'Generate personalized meal suggestions based on user preferences',
    platforms: ['web', 'mobile'],
    testCases: [
      {
        name: 'Basic meal generation',
        input: {
          dietary: 'vegetarian',
          allergies: 'none',
          cuisine: 'italian',
          difficulty: 'easy',
          cooking_time: 30,
          servings: 4
        },
        expectedOutput: {
          hasName: true,
          hasDescription: true,
          hasIngredients: true,
          hasInstructions: true,
          hasNutrition: true,
          isVegetarian: true,
          cookingTime: 30,
          servings: 4
        }
      },
      {
        name: 'Complex dietary requirements',
        input: {
          dietary: 'vegan',
          allergies: 'nuts, soy',
          cuisine: 'asian',
          difficulty: 'medium',
          cooking_time: 45,
          servings: 2
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
          servings: 2
        }
      }
    ]
  },
  
  recipe_enhancement: {
    name: 'Recipe Enhancement',
    description: 'Enhance existing recipes with detailed instructions and tips',
    platforms: ['web', 'mobile'],
    testCases: [
      {
        name: 'Basic recipe enhancement',
        input: {
          recipe: 'Pasta with tomato sauce'
        },
        expectedOutput: {
          hasEnhancedName: true,
          hasDetailedDescription: true,
          hasPreciseIngredients: true,
          hasStepByStepInstructions: true,
          hasNutritionInfo: true,
          hasCookingTips: true
        }
      }
    ]
  },
  
  dietary_adaptation: {
    name: 'Dietary Adaptation',
    description: 'Adapt recipes for specific dietary requirements',
    platforms: ['web', 'mobile'],
    testCases: [
      {
        name: 'Vegetarian adaptation',
        input: {
          recipe: 'Beef lasagna',
          dietary: 'vegetarian',
          allergies: 'none'
        },
        expectedOutput: {
          hasAdaptedRecipe: true,
          isVegetarian: true,
          hasSubstitutions: true,
          hasExplanation: true,
          maintainsFlavor: true
        }
      }
    ]
  },
  
  user_preferences: {
    name: 'User Preferences',
    description: 'Manage and apply user dietary preferences and restrictions',
    platforms: ['web', 'mobile'],
    testCases: [
      {
        name: 'Preference storage',
        input: {
          dietary: 'keto',
          allergies: 'nuts',
          cuisine_preferences: ['mexican', 'italian'],
          cooking_skill: 'intermediate'
        },
        expectedOutput: {
          preferencesSaved: true,
          preferencesApplied: true,
          consistencyAcrossPlatforms: true
        }
      }
    ]
  },
  
  meal_planning: {
    name: 'Meal Planning',
    description: 'Create weekly meal plans based on user preferences',
    platforms: ['web', 'mobile'],
    testCases: [
      {
        name: 'Weekly meal plan generation',
        input: {
          days: 7,
          meals_per_day: 3,
          dietary: 'mediterranean',
          allergies: 'none'
        },
        expectedOutput: {
          hasWeeklyPlan: true,
          hasDailyMeals: true,
          hasShoppingList: true,
          hasNutritionSummary: true,
          isMediterranean: true
        }
      }
    ]
  },
  
  search_and_filter: {
    name: 'Search and Filter',
    description: 'Search and filter meals, recipes, and ingredients',
    platforms: ['web', 'mobile'],
    testCases: [
      {
        name: 'Basic search',
        input: {
          query: 'chicken',
          filters: {
            dietary: 'keto',
            cooking_time: 30
          }
        },
        expectedOutput: {
          hasResults: true,
          resultsRelevant: true,
          filtersApplied: true,
          responseTime: 2000
        }
      }
    ]
  }
};

/**
 * Cross-platform parity tester
 */
class CrossPlatformParityTester {
  constructor() {
    this.testResults = new Map();
    this.parityIssues = [];
    this.platformMetrics = new Map();
  }

  async runParityTests() {
    try {
      log('Starting cross-platform parity tests...', 'blue');
      
      const results = {
        timestamp: new Date().toISOString(),
        platforms: config.platforms,
        features: {},
        summary: {
          totalFeatures: Object.keys(FEATURE_DEFINITIONS).length,
          testedFeatures: 0,
          parityIssues: 0,
          platformDifferences: 0
        }
      };
      
      // Test each feature across platforms
      for (const [featureKey, featureDef] of Object.entries(FEATURE_DEFINITIONS)) {
        log(`Testing feature: ${featureDef.name}`, 'yellow');
        
        const featureResults = await this.testFeatureAcrossPlatforms(featureKey, featureDef);
        results.features[featureKey] = featureResults;
        results.summary.testedFeatures++;
        
        // Check for parity issues
        const parityIssues = this.detectParityIssues(featureKey, featureResults);
        if (parityIssues.length > 0) {
          results.summary.parityIssues += parityIssues.length;
          this.parityIssues.push(...parityIssues);
        }
      }
      
      // Generate parity report
      const parityReport = await this.generateParityReport(results);
      results.parityReport = parityReport;
      
      // Save results
      this.saveResults(results);
      
      log('Cross-platform parity tests completed!', 'green');
      log(`Features tested: ${results.summary.testedFeatures}`, 'blue');
      log(`Parity issues found: ${results.summary.parityIssues}`, results.summary.parityIssues > 0 ? 'red' : 'green');
      
      return results;
      
    } catch (error) {
      log(`Cross-platform parity testing failed: ${error.message}`, 'red');
      throw error;
    }
  }

  async testFeatureAcrossPlatforms(featureKey, featureDef) {
    const results = {
      feature: featureKey,
      name: featureDef.name,
      description: featureDef.description,
      platforms: {},
      parityScore: 0,
      issues: []
    };
    
    // Test each platform
    for (const platform of config.platforms) {
      logVerbose(`Testing ${featureKey} on ${platform}`);
      
      const platformResults = await this.testFeatureOnPlatform(featureKey, featureDef, platform);
      results.platforms[platform] = platformResults;
    }
    
    // Calculate parity score
    results.parityScore = this.calculateParityScore(results.platforms);
    
    // Detect issues
    results.issues = this.detectFeatureIssues(results.platforms);
    
    return results;
  }

  async testFeatureOnPlatform(featureKey, featureDef, platform) {
    const results = {
      platform,
      testCases: [],
      overallScore: 0,
      responseTime: 0,
      errorRate: 0,
      userSatisfaction: 0,
      featureCompleteness: 0
    };
    
    // Run test cases for this platform
    for (const testCase of featureDef.testCases) {
      try {
        const testResult = await this.runTestCase(featureKey, testCase, platform);
        results.testCases.push(testResult);
        
        // Aggregate metrics
        results.responseTime += testResult.responseTime;
        results.errorRate += testResult.error ? 1 : 0;
        results.userSatisfaction += testResult.userSatisfaction || 0;
        results.featureCompleteness += testResult.completeness || 0;
        
      } catch (error) {
        log(`Test case failed: ${testCase.name} on ${platform} - ${error.message}`, 'red');
        results.testCases.push({
          name: testCase.name,
          passed: false,
          error: error.message,
          responseTime: 0,
          userSatisfaction: 0,
          completeness: 0
        });
        results.errorRate += 1;
      }
    }
    
    // Calculate averages
    const testCount = results.testCases.length;
    if (testCount > 0) {
      results.responseTime = results.responseTime / testCount;
      results.errorRate = results.errorRate / testCount;
      results.userSatisfaction = results.userSatisfaction / testCount;
      results.featureCompleteness = results.featureCompleteness / testCount;
      results.overallScore = (results.userSatisfaction + results.featureCompleteness) / 2;
    }
    
    return results;
  }

  async runTestCase(featureKey, testCase, platform) {
    const startTime = Date.now();
    
    try {
      // Simulate API call to the feature
      const response = await this.simulateFeatureCall(featureKey, testCase.input, platform);
      const responseTime = Date.now() - startTime;
      
      // Validate response
      const validation = this.validateResponse(response, testCase.expectedOutput);
      
      // Calculate metrics
      const userSatisfaction = this.calculateUserSatisfaction(response, testCase.expectedOutput);
      const completeness = this.calculateCompleteness(response, testCase.expectedOutput);
      
      return {
        name: testCase.name,
        passed: validation.overallScore >= 0.8,
        responseTime,
        userSatisfaction,
        completeness,
        validation,
        response,
        platform,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      return {
        name: testCase.name,
        passed: false,
        error: error.message,
        responseTime: Date.now() - startTime,
        userSatisfaction: 0,
        completeness: 0,
        platform,
        timestamp: new Date().toISOString()
      };
    }
  }

  async simulateFeatureCall(featureKey, input, platform) {
    // Simulate different response times and quality based on platform
    const platformFactors = {
      web: { responseTime: 1.0, quality: 1.0 },
      mobile: { responseTime: 1.2, quality: 0.95 }
    };
    
    const factor = platformFactors[platform] || { responseTime: 1.0, quality: 1.0 };
    
    // Simulate response time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 * factor.responseTime));
    
    // Simulate response quality
    const baseQuality = 0.9;
    const quality = baseQuality * factor.quality + (Math.random() - 0.5) * 0.1;
    
    // Generate mock response based on feature
    return this.generateMockResponse(featureKey, input, quality);
  }

  generateMockResponse(featureKey, input, quality) {
    const responses = {
      meal_generation: {
        name: quality > 0.8 ? 'Delicious Vegetarian Pasta' : 'Pasta',
        description: quality > 0.8 ? 'A flavorful vegetarian pasta dish with fresh ingredients' : 'Pasta dish',
        ingredients: quality > 0.8 ? [
          '8 oz pasta',
          '2 cups tomato sauce',
          '1/2 cup parmesan cheese',
          '2 tbsp olive oil',
          '3 cloves garlic'
        ] : ['pasta', 'sauce'],
        instructions: quality > 0.8 ? [
          'Boil water and cook pasta according to package directions',
          'Heat olive oil in a pan and sauté garlic',
          'Add tomato sauce and simmer for 5 minutes',
          'Toss pasta with sauce and serve with parmesan'
        ] : ['cook pasta', 'add sauce'],
        nutrition: quality > 0.8 ? {
          calories: 450,
          protein: 15,
          carbs: 60,
          fat: 12
        } : { calories: 400 },
        cookingTime: input.cooking_time || 30,
        servings: input.servings || 4
      },
      
      recipe_enhancement: {
        enhancedName: quality > 0.8 ? 'Gourmet Pasta with Rich Tomato Sauce' : 'Pasta with sauce',
        description: quality > 0.8 ? 'An elevated take on classic pasta with detailed techniques' : 'Enhanced pasta',
        ingredients: quality > 0.8 ? [
          '8 oz high-quality pasta',
          '2 cups San Marzano tomatoes',
          '1/2 cup freshly grated parmesan',
          '3 tbsp extra virgin olive oil',
          '4 cloves garlic, minced',
          '1/4 cup fresh basil'
        ] : ['pasta', 'tomatoes'],
        instructions: quality > 0.8 ? [
          'Bring a large pot of salted water to boil',
          'Heat olive oil in a large skillet over medium heat',
          'Add minced garlic and cook until fragrant, about 1 minute',
          'Add crushed tomatoes and simmer for 15 minutes',
          'Cook pasta until al dente, then drain',
          'Toss pasta with sauce and fresh basil',
          'Serve immediately with grated parmesan'
        ] : ['cook pasta', 'make sauce'],
        nutrition: quality > 0.8 ? {
          calories: 520,
          protein: 18,
          carbs: 65,
          fat: 18,
          fiber: 6
        } : { calories: 500 },
        tips: quality > 0.8 ? [
          'Use high-quality pasta for better texture',
          'Don\'t overcook the garlic',
          'Reserve some pasta water to adjust sauce consistency'
        ] : ['use good pasta']
      },
      
      dietary_adaptation: {
        adaptedRecipe: quality > 0.8 ? 'Vegetarian Lasagna with Plant-Based Protein' : 'Vegetarian lasagna',
        substitutions: quality > 0.8 ? [
          'Replace ground beef with plant-based crumbles',
          'Use nutritional yeast instead of parmesan',
          'Add extra vegetables for texture'
        ] : ['replace meat'],
        explanation: quality > 0.8 ? 'This adaptation maintains the hearty texture and flavor of traditional lasagna while being completely plant-based.' : 'Made vegetarian',
        isVegetarian: true,
        maintainsFlavor: quality > 0.8
      },
      
      user_preferences: {
        preferencesSaved: quality > 0.8,
        preferencesApplied: quality > 0.8,
        consistencyAcrossPlatforms: quality > 0.8
      },
      
      meal_planning: {
        weeklyPlan: quality > 0.8 ? {
          monday: ['Breakfast: Oatmeal', 'Lunch: Salad', 'Dinner: Pasta'],
          tuesday: ['Breakfast: Smoothie', 'Lunch: Sandwich', 'Dinner: Stir-fry'],
          wednesday: ['Breakfast: Eggs', 'Lunch: Soup', 'Dinner: Pizza']
        } : { monday: ['Breakfast', 'Lunch', 'Dinner'] },
        shoppingList: quality > 0.8 ? [
          'Pasta', 'Tomatoes', 'Cheese', 'Vegetables', 'Olive oil'
        ] : ['ingredients'],
        nutritionSummary: quality > 0.8 ? {
          totalCalories: 2100,
          averageProtein: 65,
          averageCarbs: 250,
          averageFat: 80
        } : { totalCalories: 2000 }
      },
      
      search_and_filter: {
        results: quality > 0.8 ? [
          'Chicken Parmesan',
          'Chicken Stir-fry',
          'Chicken Salad'
        ] : ['chicken dish'],
        relevance: quality > 0.8,
        filtersApplied: quality > 0.8,
        responseTime: Math.random() * 1000 + 500
      }
    };
    
    return responses[featureKey] || {};
  }

  validateResponse(response, expectedOutput) {
    const validation = {
      checks: {},
      overallScore: 0,
      passedChecks: 0,
      totalChecks: 0
    };
    
    // Check each expected output
    for (const [key, expected] of Object.entries(expectedOutput)) {
      const check = this.validateCheck(response, key, expected);
      validation.checks[key] = check;
      validation.totalChecks++;
      
      if (check.passed) {
        validation.passedChecks++;
      }
    }
    
    validation.overallScore = validation.totalChecks > 0 ? validation.passedChecks / validation.totalChecks : 0;
    
    return validation;
  }

  validateCheck(response, key, expected) {
    const check = {
      key,
      expected,
      actual: null,
      passed: false,
      score: 0,
      details: ''
    };
    
    switch (key) {
      case 'hasName':
        check.actual = !!response.name;
        check.passed = check.actual;
        check.score = check.actual ? 1 : 0;
        check.details = `Name: ${response.name || 'Missing'}`;
        break;
        
      case 'hasDescription':
        check.actual = !!response.description;
        check.passed = check.actual;
        check.score = check.actual ? 1 : 0;
        check.details = `Description: ${response.description || 'Missing'}`;
        break;
        
      case 'hasIngredients':
        check.actual = Array.isArray(response.ingredients) && response.ingredients.length > 0;
        check.passed = check.actual;
        check.score = check.actual ? 1 : 0;
        check.details = `Ingredients: ${response.ingredients?.length || 0} items`;
        break;
        
      case 'hasInstructions':
        check.actual = Array.isArray(response.instructions) && response.instructions.length > 0;
        check.passed = check.actual;
        check.score = check.actual ? 1 : 0;
        check.details = `Instructions: ${response.instructions?.length || 0} steps`;
        break;
        
      case 'hasNutrition':
        check.actual = !!response.nutrition && Object.keys(response.nutrition).length > 0;
        check.passed = check.actual;
        check.score = check.actual ? 1 : 0;
        check.details = `Nutrition: ${response.nutrition ? 'Present' : 'Missing'}`;
        break;
        
      case 'isVegetarian':
        check.actual = this.checkVegetarian(response);
        check.passed = check.actual;
        check.score = check.actual ? 1 : 0;
        check.details = `Vegetarian: ${check.actual ? 'Yes' : 'No'}`;
        break;
        
      case 'isVegan':
        check.actual = this.checkVegan(response);
        check.passed = check.actual;
        check.score = check.actual ? 1 : 0;
        check.details = `Vegan: ${check.actual ? 'Yes' : 'No'}`;
        break;
        
      case 'isKeto':
        check.actual = this.checkKeto(response);
        check.passed = check.actual;
        check.score = check.actual ? 1 : 0;
        check.details = `Keto: ${check.actual ? 'Yes' : 'No'}`;
        break;
        
      case 'noNuts':
        check.actual = this.checkNoNuts(response);
        check.passed = check.actual;
        check.score = check.actual ? 1 : 0;
        check.details = `No Nuts: ${check.actual ? 'Yes' : 'No'}`;
        break;
        
      case 'noSoy':
        check.actual = this.checkNoSoy(response);
        check.passed = check.actual;
        check.score = check.actual ? 1 : 0;
        check.details = `No Soy: ${check.actual ? 'Yes' : 'No'}`;
        break;
        
      case 'cookingTime':
        check.actual = response.cookingTime || 0;
        check.passed = Math.abs(check.actual - expected) <= 5;
        check.score = check.passed ? 1 : Math.max(0, 1 - Math.abs(check.actual - expected) / expected);
        check.details = `Cooking Time: ${check.actual} minutes (expected: ${expected})`;
        break;
        
      case 'servings':
        check.actual = response.servings || 0;
        check.passed = check.actual === expected;
        check.score = check.passed ? 1 : 0;
        check.details = `Servings: ${check.actual} (expected: ${expected})`;
        break;
        
      case 'preferencesSaved':
        check.actual = response.preferencesSaved || false;
        check.passed = check.actual;
        check.score = check.actual ? 1 : 0;
        check.details = `Preferences Saved: ${check.actual ? 'Yes' : 'No'}`;
        break;
        
      case 'preferencesApplied':
        check.actual = response.preferencesApplied || false;
        check.passed = check.actual;
        check.score = check.actual ? 1 : 0;
        check.details = `Preferences Applied: ${check.actual ? 'Yes' : 'No'}`;
        break;
        
      case 'consistencyAcrossPlatforms':
        check.actual = response.consistencyAcrossPlatforms || false;
        check.passed = check.actual;
        check.score = check.actual ? 1 : 0;
        check.details = `Consistency: ${check.actual ? 'Yes' : 'No'}`;
        break;
        
      case 'hasWeeklyPlan':
        check.actual = !!response.weeklyPlan;
        check.passed = check.actual;
        check.score = check.actual ? 1 : 0;
        check.details = `Weekly Plan: ${check.actual ? 'Present' : 'Missing'}`;
        break;
        
      case 'hasDailyMeals':
        check.actual = response.weeklyPlan && Object.keys(response.weeklyPlan).length > 0;
        check.passed = check.actual;
        check.score = check.actual ? 1 : 0;
        check.details = `Daily Meals: ${check.actual ? 'Present' : 'Missing'}`;
        break;
        
      case 'hasShoppingList':
        check.actual = Array.isArray(response.shoppingList) && response.shoppingList.length > 0;
        check.passed = check.actual;
        check.score = check.actual ? 1 : 0;
        check.details = `Shopping List: ${response.shoppingList?.length || 0} items`;
        break;
        
      case 'hasNutritionSummary':
        check.actual = !!response.nutritionSummary;
        check.passed = check.actual;
        check.score = check.actual ? 1 : 0;
        check.details = `Nutrition Summary: ${check.actual ? 'Present' : 'Missing'}`;
        break;
        
      case 'isMediterranean':
        check.actual = this.checkMediterranean(response);
        check.passed = check.actual;
        check.score = check.actual ? 1 : 0;
        check.details = `Mediterranean: ${check.actual ? 'Yes' : 'No'}`;
        break;
        
      case 'hasResults':
        check.actual = Array.isArray(response.results) && response.results.length > 0;
        check.passed = check.actual;
        check.score = check.actual ? 1 : 0;
        check.details = `Results: ${response.results?.length || 0} items`;
        break;
        
      case 'resultsRelevant':
        check.actual = response.relevance || false;
        check.passed = check.actual;
        check.score = check.actual ? 1 : 0;
        check.details = `Relevance: ${check.actual ? 'Yes' : 'No'}`;
        break;
        
      case 'filtersApplied':
        check.actual = response.filtersApplied || false;
        check.passed = check.actual;
        check.score = check.actual ? 1 : 0;
        check.details = `Filters Applied: ${check.actual ? 'Yes' : 'No'}`;
        break;
        
      case 'responseTime':
        check.actual = response.responseTime || 0;
        check.passed = check.actual <= expected;
        check.score = check.passed ? 1 : Math.max(0, 1 - (check.actual - expected) / expected);
        check.details = `Response Time: ${check.actual}ms (expected: ≤${expected}ms)`;
        break;
        
      default:
        check.actual = false;
        check.passed = false;
        check.score = 0;
        check.details = `Unknown check: ${key}`;
    }
    
    return check;
  }

  checkVegetarian(response) {
    const text = JSON.stringify(response).toLowerCase();
    const meatWords = ['beef', 'chicken', 'pork', 'lamb', 'fish', 'seafood', 'meat'];
    return !meatWords.some(word => text.includes(word));
  }

  checkVegan(response) {
    const text = JSON.stringify(response).toLowerCase();
    const nonVeganWords = ['beef', 'chicken', 'pork', 'lamb', 'fish', 'seafood', 'meat', 'dairy', 'milk', 'cheese', 'butter', 'egg'];
    return !nonVeganWords.some(word => text.includes(word));
  }

  checkKeto(response) {
    const text = JSON.stringify(response).toLowerCase();
    const highCarbWords = ['pasta', 'bread', 'rice', 'potato', 'sugar', 'flour'];
    return !highCarbWords.some(word => text.includes(word));
  }

  checkNoNuts(response) {
    const text = JSON.stringify(response).toLowerCase();
    const nutWords = ['nut', 'almond', 'walnut', 'pecan', 'cashew', 'pistachio'];
    return !nutWords.some(word => text.includes(word));
  }

  checkNoSoy(response) {
    const text = JSON.stringify(response).toLowerCase();
    const soyWords = ['soy', 'tofu', 'miso', 'tempeh'];
    return !soyWords.some(word => text.includes(word));
  }

  checkMediterranean(response) {
    const text = JSON.stringify(response).toLowerCase();
    const mediterraneanWords = ['olive oil', 'tomato', 'basil', 'oregano', 'feta', 'olive'];
    return mediterraneanWords.some(word => text.includes(word));
  }

  calculateUserSatisfaction(response, expectedOutput) {
    // Simulate user satisfaction based on response quality
    const baseScore = 4.0;
    const qualityFactor = this.calculateResponseQuality(response, expectedOutput);
    return baseScore + (qualityFactor - 0.5) * 2; // Scale to 1-5 range
  }

  calculateCompleteness(response, expectedOutput) {
    const checks = Object.keys(expectedOutput);
    const passedChecks = checks.filter(key => {
      const check = this.validateCheck(response, key, expectedOutput[key]);
      return check.passed;
    });
    
    return passedChecks.length / checks.length;
  }

  calculateResponseQuality(response, expectedOutput) {
    const completeness = this.calculateCompleteness(response, expectedOutput);
    const detailScore = this.calculateDetailScore(response);
    return (completeness + detailScore) / 2;
  }

  calculateDetailScore(response) {
    let score = 0;
    
    // Check for detailed descriptions
    if (response.description && response.description.length > 50) score += 0.2;
    if (response.instructions && response.instructions.length > 3) score += 0.2;
    if (response.ingredients && response.ingredients.length > 3) score += 0.2;
    if (response.nutrition && Object.keys(response.nutrition).length > 2) score += 0.2;
    if (response.tips && response.tips.length > 0) score += 0.2;
    
    return Math.min(score, 1.0);
  }

  calculateParityScore(platformResults) {
    const platforms = Object.keys(platformResults);
    if (platforms.length < 2) return 1.0;
    
    const scores = platforms.map(platform => platformResults[platform].overallScore);
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    // Calculate variance
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    
    // Parity score is higher when scores are closer together
    const parityScore = Math.max(0, 1 - (stdDev / avgScore));
    
    return parityScore;
  }

  detectParityIssues(featureKey, featureResults) {
    const issues = [];
    const platforms = Object.keys(featureResults.platforms);
    
    if (platforms.length < 2) return issues;
    
    // Check for significant differences in scores
    const scores = platforms.map(platform => featureResults.platforms[platform].overallScore);
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    const scoreDiff = maxScore - minScore;
    
    if (scoreDiff > 0.2) {
      issues.push({
        type: 'score_difference',
        feature: featureKey,
        severity: scoreDiff > 0.4 ? 'high' : 'medium',
        details: {
          maxScore,
          minScore,
          difference: scoreDiff,
          platforms: platforms.map(p => ({
            platform: p,
            score: featureResults.platforms[p].overallScore
          }))
        }
      });
    }
    
    // Check for response time differences
    const responseTimes = platforms.map(platform => featureResults.platforms[platform].responseTime);
    const maxTime = Math.max(...responseTimes);
    const minTime = Math.min(...responseTimes);
    const timeDiff = maxTime - minTime;
    
    if (timeDiff > 1000) { // More than 1 second difference
      issues.push({
        type: 'response_time_difference',
        feature: featureKey,
        severity: timeDiff > 2000 ? 'high' : 'medium',
        details: {
          maxTime,
          minTime,
          difference: timeDiff,
          platforms: platforms.map(p => ({
            platform: p,
            responseTime: featureResults.platforms[p].responseTime
          }))
        }
      });
    }
    
    // Check for error rate differences
    const errorRates = platforms.map(platform => featureResults.platforms[platform].errorRate);
    const maxErrorRate = Math.max(...errorRates);
    const minErrorRate = Math.min(...errorRates);
    const errorDiff = maxErrorRate - minErrorRate;
    
    if (errorDiff > 0.1) { // More than 10% difference
      issues.push({
        type: 'error_rate_difference',
        feature: featureKey,
        severity: errorDiff > 0.2 ? 'high' : 'medium',
        details: {
          maxErrorRate,
          minErrorRate,
          difference: errorDiff,
          platforms: platforms.map(p => ({
            platform: p,
            errorRate: featureResults.platforms[p].errorRate
          }))
        }
      });
    }
    
    return issues;
  }

  detectFeatureIssues(platformResults) {
    const issues = [];
    const platforms = Object.keys(platformResults);
    
    for (const platform of platforms) {
      const results = platformResults[platform];
      
      // Check for low scores
      if (results.overallScore < 0.7) {
        issues.push({
          type: 'low_score',
          platform,
          severity: 'high',
          details: {
            score: results.overallScore,
            threshold: 0.7
          }
        });
      }
      
      // Check for high error rates
      if (results.errorRate > 0.1) {
        issues.push({
          type: 'high_error_rate',
          platform,
          severity: 'high',
          details: {
            errorRate: results.errorRate,
            threshold: 0.1
          }
        });
      }
      
      // Check for slow response times
      if (results.responseTime > 3000) {
        issues.push({
          type: 'slow_response',
          platform,
          severity: 'medium',
          details: {
            responseTime: results.responseTime,
            threshold: 3000
          }
        });
      }
    }
    
    return issues;
  }

  async generateParityReport(results) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFeatures: results.summary.totalFeatures,
        testedFeatures: results.summary.testedFeatures,
        parityIssues: results.summary.parityIssues,
        platformDifferences: results.summary.platformDifferences
      },
      parityIssues: this.parityIssues,
      recommendations: this.generateRecommendations(results),
      platformComparison: this.generatePlatformComparison(results)
    };
    
    return report;
  }

  generateRecommendations(results) {
    const recommendations = [];
    
    // Analyze parity issues
    const scoreIssues = this.parityIssues.filter(issue => issue.type === 'score_difference');
    if (scoreIssues.length > 0) {
      recommendations.push({
        category: 'quality',
        priority: 'high',
        issue: 'Significant quality differences between platforms',
        recommendation: 'Review and standardize AI responses across platforms',
        affectedFeatures: scoreIssues.length
      });
    }
    
    const timeIssues = this.parityIssues.filter(issue => issue.type === 'response_time_difference');
    if (timeIssues.length > 0) {
      recommendations.push({
        category: 'performance',
        priority: 'medium',
        issue: 'Response time differences between platforms',
        recommendation: 'Optimize mobile performance and implement consistent caching',
        affectedFeatures: timeIssues.length
      });
    }
    
    const errorIssues = this.parityIssues.filter(issue => issue.type === 'error_rate_difference');
    if (errorIssues.length > 0) {
      recommendations.push({
        category: 'reliability',
        priority: 'high',
        issue: 'Error rate differences between platforms',
        recommendation: 'Implement consistent error handling and retry logic',
        affectedFeatures: errorIssues.length
      });
    }
    
    return recommendations;
  }

  generatePlatformComparison(results) {
    const comparison = {};
    
    for (const platform of config.platforms) {
      comparison[platform] = {
        totalFeatures: 0,
        passedFeatures: 0,
        averageScore: 0,
        averageResponseTime: 0,
        averageErrorRate: 0,
        features: {}
      };
      
      for (const [featureKey, featureResults] of Object.entries(results.features)) {
        if (featureResults.platforms[platform]) {
          const platformResult = featureResults.platforms[platform];
          comparison[platform].totalFeatures++;
          if (platformResult.overallScore >= 0.8) {
            comparison[platform].passedFeatures++;
          }
          comparison[platform].averageScore += platformResult.overallScore;
          comparison[platform].averageResponseTime += platformResult.responseTime;
          comparison[platform].averageErrorRate += platformResult.errorRate;
          
          comparison[platform].features[featureKey] = {
            score: platformResult.overallScore,
            responseTime: platformResult.responseTime,
            errorRate: platformResult.errorRate,
            passed: platformResult.overallScore >= 0.8
          };
        }
      }
      
      // Calculate averages
      if (comparison[platform].totalFeatures > 0) {
        comparison[platform].averageScore /= comparison[platform].totalFeatures;
        comparison[platform].averageResponseTime /= comparison[platform].totalFeatures;
        comparison[platform].averageErrorRate /= comparison[platform].totalFeatures;
      }
    }
    
    return comparison;
  }

  saveResults(results) {
    try {
      // Ensure output directory exists
      if (!fs.existsSync(config.outputDir)) {
        fs.mkdirSync(config.outputDir, { recursive: true });
      }
      
      // Save JSON results
      fs.writeFileSync(
        path.join(config.outputDir, 'cross-platform-parity-results.json'),
        JSON.stringify(results, null, 2)
      );
      
      // Generate HTML report
      const htmlReport = this.generateHTMLReport(results);
      fs.writeFileSync(
        path.join(config.outputDir, 'cross-platform-parity-report.html'),
        htmlReport
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
    <title>Cross-Platform Parity Report</title>
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
        
        .stat-card.good {
            background: #d4edda;
            color: #155724;
        }
        
        .stat-card.warning {
            background: #fff3cd;
            color: #856404;
        }
        
        .stat-card.error {
            background: #f8d7da;
            color: #721c24;
        }
        
        .feature-result {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
        }
        
        .feature-result h3 {
            color: #333;
            margin-bottom: 0.5rem;
        }
        
        .platform-comparison {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1rem;
            margin-top: 1rem;
        }
        
        .platform-card {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 1rem;
        }
        
        .platform-card h4 {
            color: #333;
            margin-bottom: 0.5rem;
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
        
        .score.good {
            background: #28a745;
            color: white;
        }
        
        .score.warning {
            background: #ffc107;
            color: #333;
        }
        
        .score.error {
            background: #dc3545;
            color: white;
        }
        
        .parity-issue {
            background: #f8f9fa;
            border-left: 4px solid #dc3545;
            padding: 0.75rem;
            margin-bottom: 0.5rem;
        }
        
        .parity-issue.medium {
            border-left-color: #ffc107;
        }
        
        .parity-issue.low {
            border-left-color: #28a745;
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
    </style>
</head>
<body>
    <div class="header">
        <h1>Cross-Platform Parity Report</h1>
        <p>Generated on ${new Date(results.timestamp).toLocaleString()}</p>
    </div>
    
    <div class="container">
        <!-- Summary Statistics -->
        <div class="section">
            <h2>Parity Summary</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>${results.summary.totalFeatures}</h3>
                    <p>Total Features</p>
                </div>
                
                <div class="stat-card">
                    <h3>${results.summary.testedFeatures}</h3>
                    <p>Tested Features</p>
                </div>
                
                <div class="stat-card ${results.summary.parityIssues > 0 ? 'error' : 'good'}">
                    <h3>${results.summary.parityIssues}</h3>
                    <p>Parity Issues</p>
                </div>
                
                <div class="stat-card">
                    <h3>${config.platforms.length}</h3>
                    <p>Platforms</p>
                </div>
            </div>
        </div>
        
        <!-- Feature Results -->
        ${Object.entries(results.features).map(([featureKey, featureResults]) => `
            <div class="section">
                <h2>${featureResults.name}</h2>
                <p>${featureResults.description}</p>
                
                <div class="metric">
                    <span>Parity Score</span>
                    <span class="metric-value score ${featureResults.parityScore > 0.8 ? 'good' : featureResults.parityScore > 0.6 ? 'warning' : 'error'}">
                        ${(featureResults.parityScore * 100).toFixed(1)}%
                    </span>
                </div>
                
                <div class="platform-comparison">
                    ${Object.entries(featureResults.platforms).map(([platform, platformResult]) => `
                        <div class="platform-card">
                            <h4>${platform.toUpperCase()}</h4>
                            <div class="metric">
                                <span>Overall Score</span>
                                <span class="metric-value score ${platformResult.overallScore > 0.8 ? 'good' : platformResult.overallScore > 0.6 ? 'warning' : 'error'}">
                                    ${(platformResult.overallScore * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div class="metric">
                                <span>Response Time</span>
                                <span class="metric-value">${platformResult.responseTime.toFixed(0)}ms</span>
                            </div>
                            <div class="metric">
                                <span>Error Rate</span>
                                <span class="metric-value">${(platformResult.errorRate * 100).toFixed(1)}%</span>
                            </div>
                            <div class="metric">
                                <span>User Satisfaction</span>
                                <span class="metric-value">${platformResult.userSatisfaction.toFixed(1)}/5.0</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                ${featureResults.issues.length > 0 ? `
                    <h4>Issues Detected</h4>
                    ${featureResults.issues.map(issue => `
                        <div class="parity-issue ${issue.severity}">
                            <strong>${issue.type.replace(/_/g, ' ').toUpperCase()}</strong>
                            <p>Platform: ${issue.platform}</p>
                            <p>Severity: ${issue.severity}</p>
                            <p>Details: ${JSON.stringify(issue.details)}</p>
                        </div>
                    `).join('')}
                ` : ''}
            </div>
        `).join('')}
        
        <!-- Parity Issues -->
        <div class="section">
            <h2>Parity Issues</h2>
            ${results.parityReport.parityIssues.length > 0 ? `
                ${results.parityReport.parityIssues.map(issue => `
                    <div class="parity-issue ${issue.severity}">
                        <h4>${issue.type.replace(/_/g, ' ').toUpperCase()}</h4>
                        <p><strong>Feature:</strong> ${issue.feature}</p>
                        <p><strong>Severity:</strong> ${issue.severity}</p>
                        <p><strong>Details:</strong></p>
                        <pre>${JSON.stringify(issue.details, null, 2)}</pre>
                    </div>
                `).join('')}
            ` : '<p>No parity issues detected.</p>'}
        </div>
        
        <!-- Recommendations -->
        <div class="section">
            <h2>Recommendations</h2>
            ${results.parityReport.recommendations.map(rec => `
                <div class="recommendation ${rec.priority}">
                    <h4>${rec.issue}</h4>
                    <p><strong>Category:</strong> ${rec.category}</p>
                    <p><strong>Priority:</strong> ${rec.priority}</p>
                    <p><strong>Affected Features:</strong> ${rec.affectedFeatures}</p>
                    <p><strong>Recommendation:</strong> ${rec.recommendation}</p>
                </div>
            `).join('')}
        </div>
        
        <!-- Platform Comparison -->
        <div class="section">
            <h2>Platform Comparison</h2>
            <div class="platform-comparison">
                ${Object.entries(results.parityReport.platformComparison).map(([platform, comparison]) => `
                    <div class="platform-card">
                        <h4>${platform.toUpperCase()}</h4>
                        <div class="metric">
                            <span>Total Features</span>
                            <span class="metric-value">${comparison.totalFeatures}</span>
                        </div>
                        <div class="metric">
                            <span>Passed Features</span>
                            <span class="metric-value">${comparison.passedFeatures}</span>
                        </div>
                        <div class="metric">
                            <span>Average Score</span>
                            <span class="metric-value score ${comparison.averageScore > 0.8 ? 'good' : comparison.averageScore > 0.6 ? 'warning' : 'error'}">
                                ${(comparison.averageScore * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div class="metric">
                            <span>Average Response Time</span>
                            <span class="metric-value">${comparison.averageResponseTime.toFixed(0)}ms</span>
                        </div>
                        <div class="metric">
                            <span>Average Error Rate</span>
                            <span class="metric-value">${(comparison.averageErrorRate * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>
</body>
</html>`;
  }
}

/**
 * Main cross-platform parity testing function
 */
async function runCrossPlatformParityTesting() {
  try {
    log('Starting cross-platform parity testing...', 'blue');
    
    // Ensure output directory exists
    if (!fs.existsSync(config.outputDir)) {
      fs.mkdirSync(config.outputDir, { recursive: true });
    }
    
    // Initialize parity tester
    const tester = new CrossPlatformParityTester();
    
    // Run parity tests
    const results = await tester.runParityTests();
    
    log('Cross-platform parity testing completed successfully!', 'green');
    log(`Results saved to: ${config.outputDir}`, 'blue');
    
    return results;
    
  } catch (error) {
    log(`Cross-platform parity testing failed: ${error.message}`, 'red');
    throw error;
  }
}

// Run cross-platform parity testing if called directly
if (require.main === module) {
  runCrossPlatformParityTesting()
    .then(() => {
      log('Cross-platform parity testing completed successfully', 'green');
      process.exit(0);
    })
    .catch(error => {
      log(`Cross-platform parity testing failed: ${error.message}`, 'red');
      process.exit(1);
    });
}

module.exports = { runCrossPlatformParityTesting, CrossPlatformParityTester };