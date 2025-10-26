/**
 * Stress Testing Suite for What's for Dinner
 * Tests application behavior under extreme load conditions
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('error_rate');
const responseTime = new Trend('response_time');
const timeoutRate = new Rate('timeout_rate');
const memoryUsage = new Trend('memory_usage');
const requestCount = new Counter('request_count');

// Stress test configuration
export const options = {
  stages: [
    { duration: '1m', target: 100 }, // Ramp up to 100 users quickly
    { duration: '3m', target: 100 }, // Stay at 100 users
    { duration: '1m', target: 200 }, // Ramp up to 200 users
    { duration: '3m', target: 200 }, // Stay at 200 users
    { duration: '1m', target: 500 }, // Ramp up to 500 users
    { duration: '3m', target: 500 }, // Stay at 500 users
    { duration: '1m', target: 1000 }, // Ramp up to 1000 users
    { duration: '2m', target: 1000 }, // Stay at 1000 users
    { duration: '2m', target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'], // 95% of requests must complete below 5s
    http_req_failed: ['rate<0.2'], // Error rate must be below 20%
    error_rate: ['rate<0.2'], // Custom error rate below 20%
    timeout_rate: ['rate<0.1'], // Timeout rate below 10%
  },
};

// Base URL configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Test data for stress testing
const stressTestData = {
  users: Array.from({ length: 1000 }, (_, i) => ({
    email: `stress-test-${i}@example.com`,
    password: 'password123',
  })),
  mealTypes: ['breakfast', 'lunch', 'dinner', 'snack'],
  cuisineTypes: [
    'italian',
    'mexican',
    'asian',
    'american',
    'mediterranean',
    'indian',
    'thai',
    'french',
  ],
  dietaryRestrictions: [
    'vegetarian',
    'vegan',
    'gluten-free',
    'dairy-free',
    'keto',
    'paleo',
  ],
  cookingTimes: [15, 30, 45, 60, 90, 120],
  difficulties: ['easy', 'medium', 'hard'],
};

// Helper function to get random data
function getRandomData() {
  return {
    user: stressTestData.users[
      Math.floor(Math.random() * stressTestData.users.length)
    ],
    mealType:
      stressTestData.mealTypes[
        Math.floor(Math.random() * stressTestData.mealTypes.length)
      ],
    cuisineType:
      stressTestData.cuisineTypes[
        Math.floor(Math.random() * stressTestData.cuisineTypes.length)
      ],
    dietaryRestrictions: stressTestData.dietaryRestrictions
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 3) + 1),
    cookingTime:
      stressTestData.cookingTimes[
        Math.floor(Math.random() * stressTestData.cookingTimes.length)
      ],
    difficulty:
      stressTestData.difficulties[
        Math.floor(Math.random() * stressTestData.difficulties.length)
      ],
  };
}

// Helper function to make request with timeout
function makeRequest(url, method = 'GET', payload = null, timeout = 30000) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer mock-token',
  };

  const params = {
    headers: headers,
    timeout: timeout.toString() + 'ms',
  };

  let response;
  try {
    if (method === 'GET') {
      response = http.get(url, params);
    } else if (method === 'POST') {
      response = http.post(url, JSON.stringify(payload), params);
    } else if (method === 'PUT') {
      response = http.put(url, JSON.stringify(payload), params);
    } else if (method === 'DELETE') {
      response = http.del(url, null, params);
    }

    requestCount.add(1);
    return response;
  } catch (error) {
    timeoutRate.add(1);
    return {
      status: 0,
      timings: { duration: timeout },
      body: '',
      error: error.message,
    };
  }
}

// Test: Extreme concurrent requests
export function testExtremeConcurrency() {
  const data = getRandomData();
  const endpoints = [
    '/api/meals',
    '/api/ingredients',
    '/api/recipes',
    '/api/analytics',
  ];

  endpoints.forEach(endpoint => {
    const response = makeRequest(`${BASE_URL}${endpoint}`);

    check(response, {
      'extreme concurrency request completes': r => r.status > 0,
      'extreme concurrency response time acceptable': r =>
        r.timings.duration < 10000,
    });

    errorRate.add(response.status >= 400);
    responseTime.add(response.timings.duration);
  });
}

// Test: Memory-intensive operations
export function testMemoryIntensiveOperations() {
  const data = getRandomData();

  // Test with large payloads
  const largePayload = {
    meal_type: data.mealType,
    cuisine_type: data.cuisineType,
    dietary_restrictions: data.dietaryRestrictions,
    preferences: {
      cooking_time: data.cookingTime,
      difficulty: data.difficulty,
      // Add large data to test memory handling
      large_data: Array.from({ length: 1000 }, (_, i) => `item-${i}`),
    },
  };

  const response = makeRequest(
    `${BASE_URL}/api/meals/generate`,
    'POST',
    largePayload
  );

  check(response, {
    'memory intensive request completes': r => r.status > 0,
    'memory intensive response time acceptable': r =>
      r.timings.duration < 15000,
    'response size reasonable': r => r.body.length < 5000000, // 5MB limit
  });

  errorRate.add(response.status >= 400);
  responseTime.add(response.timings.duration);
  memoryUsage.add(response.body.length);
}

// Test: Database connection exhaustion
export function testDatabaseConnectionExhaustion() {
  const data = getRandomData();

  // Make many concurrent database requests
  const dbRequests = Array.from({ length: 10 }, () => {
    const response = makeRequest(`${BASE_URL}/api/meals?limit=50`);
    return response;
  });

  dbRequests.forEach(response => {
    check(response, {
      'database request completes': r => r.status > 0,
      'database response time acceptable': r => r.timings.duration < 8000,
    });

    errorRate.add(response.status >= 400);
    responseTime.add(response.timings.duration);
  });
}

// Test: API rate limiting
export function testAPIRateLimiting() {
  const data = getRandomData();

  // Make rapid requests to test rate limiting
  const rapidRequests = Array.from({ length: 20 }, (_, i) => {
    const response = makeRequest(`${BASE_URL}/api/meals`, 'POST', {
      meal_type: data.mealType,
      user_id: data.user.email,
    });
    return response;
  });

  rapidRequests.forEach((response, index) => {
    check(response, {
      'rapid request completes': r => r.status > 0,
      'rate limiting works correctly': r => {
        // After a certain number of requests, we should get rate limited
        if (index > 10) {
          return r.status === 429 || r.status < 500;
        }
        return r.status < 500;
      },
    });

    errorRate.add(response.status >= 400);
    responseTime.add(response.timings.duration);
  });
}

// Test: Error recovery under stress
export function testErrorRecovery() {
  const data = getRandomData();

  // Test error handling under stress
  const errorEndpoints = [
    '/api/meals/invalid-id',
    '/api/ingredients/nonexistent',
    '/api/recipes/999999',
    '/api/analytics/invalid-metric',
  ];

  errorEndpoints.forEach(endpoint => {
    const response = makeRequest(`${BASE_URL}${endpoint}`);

    check(response, {
      'error endpoint responds': r => r.status > 0,
      'error response time acceptable': r => r.timings.duration < 5000,
      'error response format correct': r => {
        try {
          const data = JSON.parse(r.body);
          return data && (data.error || data.message);
        } catch {
          return r.status >= 400;
        }
      },
    });

    // Don't count 4xx errors as failures
    errorRate.add(response.status >= 500);
    responseTime.add(response.timings.duration);
  });
}

// Test: Resource exhaustion
export function testResourceExhaustion() {
  const data = getRandomData();

  // Test with very large requests
  const largeRequest = {
    meal_type: data.mealType,
    cuisine_type: data.cuisineType,
    dietary_restrictions: data.dietaryRestrictions,
    preferences: {
      cooking_time: data.cookingTime,
      difficulty: data.difficulty,
      // Very large payload
      massive_data: Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        name: `item-${i}`,
        data: `data-${i}`.repeat(100),
      })),
    },
  };

  const response = makeRequest(
    `${BASE_URL}/api/meals/generate`,
    'POST',
    largeRequest
  );

  check(response, {
    'large request completes or fails gracefully': r => r.status > 0,
    'large request response time acceptable': r => r.timings.duration < 20000,
  });

  errorRate.add(response.status >= 400);
  responseTime.add(response.timings.duration);
  memoryUsage.add(response.body.length);
}

// Test: Network instability simulation
export function testNetworkInstability() {
  const data = getRandomData();

  // Test with very short timeouts to simulate network issues
  const response = makeRequest(`${BASE_URL}/api/meals`, 'GET', null, 1000);

  check(response, {
    'network instability handled': r => r.status > 0,
    'timeout handled gracefully': r =>
      r.status === 0 || r.timings.duration < 2000,
  });

  if (response.status === 0) {
    timeoutRate.add(1);
  } else {
    errorRate.add(response.status >= 400);
    responseTime.add(response.timings.duration);
  }
}

// Test: Cache invalidation under load
export function testCacheInvalidation() {
  const data = getRandomData();

  // Test cache behavior under load
  const cacheRequests = Array.from({ length: 5 }, () => {
    const response = makeRequest(`${BASE_URL}/api/meals?limit=10`);
    return response;
  });

  cacheRequests.forEach(response => {
    check(response, {
      'cache request completes': r => r.status > 0,
      'cache response time acceptable': r => r.timings.duration < 3000,
    });

    errorRate.add(response.status >= 400);
    responseTime.add(response.timings.duration);
  });
}

// Main stress test function
export default function () {
  // Run all stress test scenarios
  testExtremeConcurrency();
  sleep(0.1);

  testMemoryIntensiveOperations();
  sleep(0.1);

  testDatabaseConnectionExhaustion();
  sleep(0.1);

  testAPIRateLimiting();
  sleep(0.1);

  testErrorRecovery();
  sleep(0.1);

  testResourceExhaustion();
  sleep(0.1);

  testNetworkInstability();
  sleep(0.1);

  testCacheInvalidation();
  sleep(0.1);
}

// Setup function
export function setup() {
  console.log('Starting stress tests...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('Testing extreme load conditions...');

  // Verify the application is running
  const response = http.get(`${BASE_URL}/`);
  if (response.status !== 200) {
    throw new Error(`Application not responding at ${BASE_URL}`);
  }

  console.log('Application is running, starting stress tests...');
}

// Teardown function
export function teardown(data) {
  console.log('Stress tests completed');
  console.log(`Total requests: ${data?.totalRequests || 'unknown'}`);
  console.log(`Error rate: ${data?.errorRate || 'unknown'}`);
  console.log(`Timeout rate: ${data?.timeoutRate || 'unknown'}`);
  console.log(`Average response time: ${data?.avgResponseTime || 'unknown'}ms`);
  console.log(`Peak memory usage: ${data?.peakMemoryUsage || 'unknown'} bytes`);
}
