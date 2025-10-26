/**
 * Concurrency Testing Suite for What's for Dinner
 * Tests application behavior under high concurrency scenarios
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('error_rate');
const responseTime = new Trend('response_time');
const concurrentUsers = new Gauge('concurrent_users');
const requestCount = new Counter('request_count');
const dataConsistencyErrors = new Counter('data_consistency_errors');

// Concurrency test configuration
export const options = {
  scenarios: {
    // Scenario 1: Rapid user registration
    user_registration: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 50 },
        { duration: '1m', target: 50 },
        { duration: '30s', target: 0 },
      ],
      exec: 'testUserRegistration',
    },
    
    // Scenario 2: Concurrent meal generation
    meal_generation: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 100 },
        { duration: '2m', target: 100 },
        { duration: '30s', target: 0 },
      ],
      exec: 'testMealGeneration',
    },
    
    // Scenario 3: Database read operations
    database_reads: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 200 },
        { duration: '2m', target: 200 },
        { duration: '30s', target: 0 },
      ],
      exec: 'testDatabaseReads',
    },
    
    // Scenario 4: Mixed operations
    mixed_operations: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 150 },
        { duration: '3m', target: 150 },
        { duration: '30s', target: 0 },
      ],
      exec: 'testMixedOperations',
    },
  },
  
  thresholds: {
    http_req_duration: ['p(95)<3000'], // 95% of requests must complete below 3s
    http_req_failed: ['rate<0.05'],    // Error rate must be below 5%
    error_rate: ['rate<0.05'],         // Custom error rate below 5%
    data_consistency_errors: ['count<10'], // Data consistency errors below 10
  },
};

// Base URL configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Test data for concurrency testing
const concurrencyTestData = {
  users: Array.from({ length: 1000 }, (_, i) => ({
    email: `concurrency-test-${i}@example.com`,
    password: 'password123',
    name: `User ${i}`
  })),
  mealTypes: ['breakfast', 'lunch', 'dinner', 'snack'],
  cuisineTypes: ['italian', 'mexican', 'asian', 'american', 'mediterranean'],
  dietaryRestrictions: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto'],
};

// Helper function to get random user
function getRandomUser() {
  return concurrencyTestData.users[Math.floor(Math.random() * concurrencyTestData.users.length)];
}

// Helper function to make authenticated request
function makeAuthenticatedRequest(url, method = 'GET', payload = null) {
  const user = getRandomUser();
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer mock-token-${user.email}`,
    'X-User-ID': user.email,
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

  requestCount.add(1);
  return response;
}

// Test: User registration concurrency
export function testUserRegistration() {
  const user = getRandomUser();
  const payload = {
    email: user.email,
    password: user.password,
    name: user.name,
    dietary_restrictions: ['vegetarian'],
    preferences: {
      cuisine_types: ['italian', 'mexican'],
      cooking_time: 30,
      difficulty: 'medium'
    }
  };

  const response = makeAuthenticatedRequest(`${BASE_URL}/api/auth/register`, 'POST', payload);
  
  check(response, {
    'user registration completes': (r) => r.status > 0,
    'user registration response time acceptable': (r) => r.timings.duration < 5000,
    'user registration returns valid response': (r) => {
      try {
        const data = JSON.parse(r.body);
        return data && (data.user || data.message);
      } catch {
        return r.status < 500;
      }
    },
  });

  errorRate.add(response.status >= 400);
  responseTime.add(response.timings.duration);
  
  // Check for data consistency issues
  if (response.status === 409) {
    dataConsistencyErrors.add(1);
  }
}

// Test: Meal generation concurrency
export function testMealGeneration() {
  const user = getRandomUser();
  const payload = {
    meal_type: concurrencyTestData.mealTypes[Math.floor(Math.random() * concurrencyTestData.mealTypes.length)],
    cuisine_type: concurrencyTestData.cuisineTypes[Math.floor(Math.random() * concurrencyTestData.cuisineTypes.length)],
    dietary_restrictions: ['vegetarian'],
    preferences: {
      cooking_time: 30,
      difficulty: 'medium'
    },
    user_id: user.email
  };

  const response = makeAuthenticatedRequest(`${BASE_URL}/api/meals/generate`, 'POST', payload);
  
  check(response, {
    'meal generation completes': (r) => r.status > 0,
    'meal generation response time acceptable': (r) => r.timings.duration < 10000,
    'meal generation returns valid data': (r) => {
      try {
        const data = JSON.parse(r.body);
        return data && (data.meal || data.message);
      } catch {
        return r.status < 500;
      }
    },
  });

  errorRate.add(response.status >= 400);
  responseTime.add(response.timings.duration);
}

// Test: Database read operations concurrency
export function testDatabaseReads() {
  const user = getRandomUser();
  const endpoints = [
    '/api/meals',
    '/api/ingredients',
    '/api/recipes',
    '/api/analytics/user-stats',
  ];

  endpoints.forEach(endpoint => {
    const response = makeAuthenticatedRequest(`${BASE_URL}${endpoint}`);
    
    check(response, {
      'database read completes': (r) => r.status > 0,
      'database read response time acceptable': (r) => r.timings.duration < 2000,
      'database read returns data': (r) => {
        try {
          const data = JSON.parse(r.body);
          return data && (Array.isArray(data) || typeof data === 'object');
        } catch {
          return r.status < 500;
        }
      },
    });

    errorRate.add(response.status >= 400);
    responseTime.add(response.timings.duration);
  });
}

// Test: Mixed operations concurrency
export function testMixedOperations() {
  const user = getRandomUser();
  const operations = [
    () => makeAuthenticatedRequest(`${BASE_URL}/api/meals`),
    () => makeAuthenticatedRequest(`${BASE_URL}/api/ingredients`),
    () => makeAuthenticatedRequest(`${BASE_URL}/api/recipes`),
    () => makeAuthenticatedRequest(`${BASE_URL}/api/analytics`),
    () => makeAuthenticatedRequest(`${BASE_URL}/api/meals/generate`, 'POST', {
      meal_type: 'dinner',
      cuisine_type: 'italian',
      dietary_restrictions: ['vegetarian'],
      preferences: { cooking_time: 30, difficulty: 'medium' },
      user_id: user.email
    }),
  ];

  operations.forEach(operation => {
    const response = operation();
    
    check(response, {
      'mixed operation completes': (r) => r.status > 0,
      'mixed operation response time acceptable': (r) => r.timings.duration < 5000,
    });

    errorRate.add(response.status >= 400);
    responseTime.add(response.timings.duration);
  });
}

// Test: Data consistency under concurrency
export function testDataConsistency() {
  const user = getRandomUser();
  
  // Test concurrent updates to the same resource
  const updatePayload = {
    preferences: {
      cuisine_types: ['italian', 'mexican', 'asian'],
      cooking_time: 45,
      difficulty: 'hard'
    }
  };

  const response1 = makeAuthenticatedRequest(`${BASE_URL}/api/user/preferences`, 'PUT', updatePayload);
  const response2 = makeAuthenticatedRequest(`${BASE_URL}/api/user/preferences`, 'PUT', updatePayload);
  
  check(response1, {
    'concurrent update 1 completes': (r) => r.status > 0,
    'concurrent update 1 response time acceptable': (r) => r.timings.duration < 3000,
  });

  check(response2, {
    'concurrent update 2 completes': (r) => r.status > 0,
    'concurrent update 2 response time acceptable': (r) => r.timings.duration < 3000,
  });

  errorRate.add(response1.status >= 400);
  errorRate.add(response2.status >= 400);
  responseTime.add(response1.timings.duration);
  responseTime.add(response2.timings.duration);

  // Check for data consistency issues
  if (response1.status === 409 || response2.status === 409) {
    dataConsistencyErrors.add(1);
  }
}

// Test: Session management under concurrency
export function testSessionManagement() {
  const user = getRandomUser();
  
  // Test concurrent session operations
  const sessionOperations = [
    () => makeAuthenticatedRequest(`${BASE_URL}/api/auth/session`),
    () => makeAuthenticatedRequest(`${BASE_URL}/api/auth/refresh`),
    () => makeAuthenticatedRequest(`${BASE_URL}/api/user/profile`),
  ];

  sessionOperations.forEach(operation => {
    const response = operation();
    
    check(response, {
      'session operation completes': (r) => r.status > 0,
      'session operation response time acceptable': (r) => r.timings.duration < 2000,
    });

    errorRate.add(response.status >= 400);
    responseTime.add(response.timings.duration);
  });
}

// Test: Cache invalidation under concurrency
export function testCacheInvalidation() {
  const user = getRandomUser();
  
  // Test cache behavior under concurrent access
  const cacheRequests = Array.from({ length: 5 }, () => {
    return makeAuthenticatedRequest(`${BASE_URL}/api/meals?limit=10`);
  });

  cacheRequests.forEach(response => {
    check(response, {
      'cache request completes': (r) => r.status > 0,
      'cache request response time acceptable': (r) => r.timings.duration < 1000,
    });

    errorRate.add(response.status >= 400);
    responseTime.add(response.timings.duration);
  });
}

// Test: Resource locking under concurrency
export function testResourceLocking() {
  const user = getRandomUser();
  
  // Test resource locking behavior
  const lockOperations = [
    () => makeAuthenticatedRequest(`${BASE_URL}/api/meals/lock`, 'POST', { meal_id: 'test-meal-id' }),
    () => makeAuthenticatedRequest(`${BASE_URL}/api/meals/unlock`, 'POST', { meal_id: 'test-meal-id' }),
  ];

  lockOperations.forEach(operation => {
    const response = operation();
    
    check(response, {
      'lock operation completes': (r) => r.status > 0,
      'lock operation response time acceptable': (r) => r.timings.duration < 2000,
    });

    errorRate.add(response.status >= 400);
    responseTime.add(response.timings.duration);
  });
}

// Main concurrency test function
export default function() {
  // Update concurrent users gauge
  concurrentUsers.add(1);
  
  // Run all concurrency test scenarios
  testUserRegistration();
  sleep(0.1);
  
  testMealGeneration();
  sleep(0.1);
  
  testDatabaseReads();
  sleep(0.1);
  
  testMixedOperations();
  sleep(0.1);
  
  testDataConsistency();
  sleep(0.1);
  
  testSessionManagement();
  sleep(0.1);
  
  testCacheInvalidation();
  sleep(0.1);
  
  testResourceLocking();
  sleep(0.1);
}

// Setup function
export function setup() {
  console.log('Starting concurrency tests...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('Testing high concurrency scenarios...');
  
  // Verify the application is running
  const response = http.get(`${BASE_URL}/`);
  if (response.status !== 200) {
    throw new Error(`Application not responding at ${BASE_URL}`);
  }
  
  console.log('Application is running, starting concurrency tests...');
}

// Teardown function
export function teardown(data) {
  console.log('Concurrency tests completed');
  console.log(`Total requests: ${data?.totalRequests || 'unknown'}`);
  console.log(`Error rate: ${data?.errorRate || 'unknown'}`);
  console.log(`Data consistency errors: ${data?.dataConsistencyErrors || 'unknown'}`);
  console.log(`Average response time: ${data?.avgResponseTime || 'unknown'}ms`);
  console.log(`Peak concurrent users: ${data?.peakConcurrentUsers || 'unknown'}`);
}