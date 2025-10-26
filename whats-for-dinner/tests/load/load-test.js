/**
 * Load Testing Suite for What's for Dinner
 * Tests application performance under various load conditions
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('error_rate');
const responseTime = new Trend('response_time');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up to 10 users
    { duration: '5m', target: 10 }, // Stay at 10 users
    { duration: '2m', target: 20 }, // Ramp up to 20 users
    { duration: '5m', target: 20 }, // Stay at 20 users
    { duration: '2m', target: 50 }, // Ramp up to 50 users
    { duration: '5m', target: 50 }, // Stay at 50 users
    { duration: '2m', target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2s
    http_req_failed: ['rate<0.1'], // Error rate must be below 10%
    error_rate: ['rate<0.1'], // Custom error rate below 10%
  },
};

// Base URL configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const SUPABASE_URL = __ENV.SUPABASE_URL || 'http://localhost:54321';

// Test data
const testUsers = [
  { email: 'test1@example.com', password: 'password123' },
  { email: 'test2@example.com', password: 'password123' },
  { email: 'test3@example.com', password: 'password123' },
  { email: 'test4@example.com', password: 'password123' },
  { email: 'test5@example.com', password: 'password123' },
];

const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
const cuisineTypes = [
  'italian',
  'mexican',
  'asian',
  'american',
  'mediterranean',
];

// Helper function to get random user
function getRandomUser() {
  return testUsers[Math.floor(Math.random() * testUsers.length)];
}

// Helper function to get random meal type
function getRandomMealType() {
  return mealTypes[Math.floor(Math.random() * mealTypes.length)];
}

// Helper function to get random cuisine type
function getRandomCuisineType() {
  return cuisineTypes[Math.floor(Math.random() * cuisineTypes.length)];
}

// Helper function to make authenticated request
function makeAuthenticatedRequest(url, method = 'GET', payload = null) {
  const user = getRandomUser();

  // In a real test, you would authenticate and get a token
  // For this example, we'll simulate with headers
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer mock-token-${user.email}`,
  };

  const params = {
    headers: headers,
    timeout: '30s',
  };

  let response;
  if (method === 'GET') {
    response = http.get(url, params);
  } else if (method === 'POST') {
    response = http.post(url, JSON.stringify(payload), params);
  } else if (method === 'PUT') {
    response = http.put(url, JSON.stringify(payload), params);
  } else if (method === 'DELETE') {
    response = http.del(url, null, params);
  }

  return response;
}

// Test: Home page load
export function testHomePageLoad() {
  const response = http.get(`${BASE_URL}/`);

  check(response, {
    'home page status is 200': r => r.status === 200,
    'home page loads within 2s': r => r.timings.duration < 2000,
    'home page has correct content type': r =>
      r.headers['Content-Type']?.includes('text/html'),
  });

  errorRate.add(response.status !== 200);
  responseTime.add(response.timings.duration);
}

// Test: API endpoints load
export function testAPIEndpoints() {
  const endpoints = [
    '/api/meals',
    '/api/ingredients',
    '/api/recipes',
    '/api/analytics',
  ];

  endpoints.forEach(endpoint => {
    const response = makeAuthenticatedRequest(`${BASE_URL}${endpoint}`);

    check(response, {
      [`${endpoint} status is 200 or 401`]: r =>
        r.status === 200 || r.status === 401,
      [`${endpoint} loads within 1s`]: r => r.timings.duration < 1000,
      [`${endpoint} has JSON content type`]: r =>
        r.headers['Content-Type']?.includes('application/json'),
    });

    errorRate.add(response.status >= 400);
    responseTime.add(response.timings.duration);
  });
}

// Test: Meal generation under load
export function testMealGeneration() {
  const payload = {
    meal_type: getRandomMealType(),
    cuisine_type: getRandomCuisineType(),
    dietary_restrictions: ['vegetarian'],
    preferences: {
      cooking_time: 30,
      difficulty: 'medium',
    },
  };

  const response = makeAuthenticatedRequest(
    `${BASE_URL}/api/meals/generate`,
    'POST',
    payload
  );

  check(response, {
    'meal generation status is 200 or 401': r =>
      r.status === 200 || r.status === 401,
    'meal generation completes within 10s': r => r.timings.duration < 10000,
    'meal generation returns JSON': r =>
      r.headers['Content-Type']?.includes('application/json'),
  });

  errorRate.add(response.status >= 400);
  responseTime.add(response.timings.duration);
}

// Test: Database queries under load
export function testDatabaseQueries() {
  const queries = [
    '/api/meals?limit=10',
    '/api/ingredients?category=vegetables',
    '/api/recipes?cuisine_type=italian',
    '/api/analytics/user-stats',
  ];

  queries.forEach(query => {
    const response = makeAuthenticatedRequest(`${BASE_URL}${query}`);

    check(response, {
      [`${query} status is 200 or 401`]: r =>
        r.status === 200 || r.status === 401,
      [`${query} loads within 2s`]: r => r.timings.duration < 2000,
      [`${query} returns data`]: r => {
        try {
          const data = JSON.parse(r.body);
          return data && (Array.isArray(data) || typeof data === 'object');
        } catch {
          return false;
        }
      },
    });

    errorRate.add(response.status >= 400);
    responseTime.add(response.timings.duration);
  });
}

// Test: Concurrent user sessions
export function testConcurrentSessions() {
  const user = getRandomUser();

  // Simulate user session with multiple requests
  const sessionRequests = [
    () => makeAuthenticatedRequest(`${BASE_URL}/api/meals`),
    () => makeAuthenticatedRequest(`${BASE_URL}/api/ingredients`),
    () => makeAuthenticatedRequest(`${BASE_URL}/api/recipes`),
    () => makeAuthenticatedRequest(`${BASE_URL}/api/analytics`),
  ];

  sessionRequests.forEach(requestFn => {
    const response = requestFn();

    check(response, {
      'concurrent session request succeeds': r => r.status < 500,
      'concurrent session request completes within 3s': r =>
        r.timings.duration < 3000,
    });

    errorRate.add(response.status >= 500);
    responseTime.add(response.timings.duration);
  });
}

// Test: Memory usage under load
export function testMemoryUsage() {
  const response = makeAuthenticatedRequest(`${BASE_URL}/api/meals?limit=100`);

  check(response, {
    'memory test request succeeds': r => r.status < 500,
    'memory test completes within 5s': r => r.timings.duration < 5000,
    'response size is reasonable': r => r.body.length < 1000000, // 1MB limit
  });

  errorRate.add(response.status >= 500);
  responseTime.add(response.timings.duration);
}

// Test: Error handling under load
export function testErrorHandling() {
  const errorEndpoints = [
    '/api/meals/invalid-id',
    '/api/ingredients/nonexistent',
    '/api/recipes/999999',
    '/api/analytics/invalid-metric',
  ];

  errorEndpoints.forEach(endpoint => {
    const response = makeAuthenticatedRequest(`${BASE_URL}${endpoint}`);

    check(response, {
      'error endpoint returns appropriate status': r =>
        r.status >= 400 && r.status < 600,
      'error response completes within 2s': r => r.timings.duration < 2000,
      'error response has proper error format': r => {
        try {
          const data = JSON.parse(r.body);
          return data && (data.error || data.message);
        } catch {
          return false;
        }
      },
    });

    // Don't count 4xx errors as failures for this test
    errorRate.add(response.status >= 500);
    responseTime.add(response.timings.duration);
  });
}

// Main test function
export default function () {
  // Run all test scenarios
  testHomePageLoad();
  sleep(1);

  testAPIEndpoints();
  sleep(1);

  testMealGeneration();
  sleep(2);

  testDatabaseQueries();
  sleep(1);

  testConcurrentSessions();
  sleep(1);

  testMemoryUsage();
  sleep(1);

  testErrorHandling();
  sleep(1);
}

// Setup function (runs once before all tests)
export function setup() {
  console.log('Starting load tests...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Supabase URL: ${SUPABASE_URL}`);

  // Verify the application is running
  const response = http.get(`${BASE_URL}/`);
  if (response.status !== 200) {
    throw new Error(`Application not responding at ${BASE_URL}`);
  }

  console.log('Application is running, starting load tests...');
}

// Teardown function (runs once after all tests)
export function teardown(data) {
  console.log('Load tests completed');
  console.log(`Total requests: ${data?.totalRequests || 'unknown'}`);
  console.log(`Error rate: ${data?.errorRate || 'unknown'}`);
  console.log(`Average response time: ${data?.avgResponseTime || 'unknown'}ms`);
}
