#!/usr/bin/env node

/**
 * API Schema Generation Script
 * 
 * Generates OpenAPI schemas from code annotations and TypeScript types
 * Validates schemas and generates documentation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Configuration
const config = {
  apiDir: 'api',
  schemasDir: 'api/schemas',
  versions: ['v1', 'v2'],
  currentVersion: 'v1',
  baseUrl: 'https://api.whats-for-dinner.com',
  title: 'What\'s For Dinner API',
  description: 'Meal planning and recipe API',
  contact: {
    name: 'API Support',
    email: 'api-support@whats-for-dinner.com',
    url: 'https://whats-for-dinner.com/support'
  },
  license: {
    name: 'MIT',
    url: 'https://opensource.org/licenses/MIT'
  }
};

class APIGenerator {
  constructor() {
    this.results = {
      summary: {
        totalVersions: 0,
        totalEndpoints: 0,
        totalSchemas: 0,
        validationErrors: 0
      },
      versions: {},
      endpoints: [],
      schemas: [],
      errors: []
    };
  }

  /**
   * Generate API schemas
   */
  async generateSchemas() {
    log('🔧 Generating API Schemas...', 'blue');
    log('============================', 'blue');

    // Ensure directories exist
    this.ensureDirectories();

    // Generate schemas for each version
    for (const version of config.versions) {
      await this.generateVersionSchema(version);
    }

    // Generate shared components
    await this.generateSharedComponents();

    // Validate schemas
    await this.validateSchemas();

    this.generateSummary();
    return this.results;
  }

  /**
   * Ensure required directories exist
   */
  ensureDirectories() {
    const dirs = [
      config.apiDir,
      config.schemasDir,
      path.join(config.schemasDir, 'shared'),
      path.join(config.schemasDir, 'shared', 'components')
    ];

    for (const version of config.versions) {
      dirs.push(
        path.join(config.schemasDir, version),
        path.join(config.schemasDir, version, 'components'),
        path.join(config.schemasDir, version, 'examples')
      );
    }

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        log(`Created directory: ${dir}`, 'green');
      }
    });
  }

  /**
   * Generate schema for a specific version
   */
  async generateVersionSchema(version) {
    log(`\n📝 Generating ${version} schema...`, 'blue');

    const versionDir = path.join(config.schemasDir, version);
    const openapiPath = path.join(versionDir, 'openapi.yaml');

    // Generate OpenAPI schema
    const openapiSchema = this.generateOpenAPISchema(version);
    
    // Write schema file
    fs.writeFileSync(openapiPath, openapiSchema);
    log(`Generated: ${openapiPath}`, 'green');

    // Generate components
    await this.generateVersionComponents(version);

    // Generate examples
    await this.generateVersionExamples(version);

    // Update results
    this.results.versions[version] = {
      schemaPath: openapiPath,
      componentsPath: path.join(versionDir, 'components'),
      examplesPath: path.join(versionDir, 'examples'),
      endpoints: this.countEndpoints(openapiSchema),
      schemas: this.countSchemas(openapiSchema)
    };

    this.results.summary.totalVersions++;
  }

  /**
   * Generate OpenAPI schema
   */
  generateOpenAPISchema(version) {
    const schema = {
      openapi: '3.0.3',
      info: {
        title: config.title,
        version: this.getVersionNumber(version),
        description: config.description,
        contact: config.contact,
        license: config.license
      },
      servers: [
        {
          url: `${config.baseUrl}/${version}`,
          description: 'Production server'
        },
        {
          url: `https://staging-api.whats-for-dinner.com/${version}`,
          description: 'Staging server'
        }
      ],
      paths: this.generatePaths(version),
      components: {
        schemas: this.generateSchemas(version),
        responses: this.generateResponses(version),
        parameters: this.generateParameters(version),
        securitySchemes: this.generateSecuritySchemes(version)
      },
      tags: this.generateTags(version),
      externalDocs: {
        description: 'API Documentation',
        url: 'https://docs.whats-for-dinner.com'
      }
    };

    return this.yamlStringify(schema);
  }

  /**
   * Generate API paths
   */
  generatePaths(version) {
    const paths = {
      '/meals': {
        get: {
          summary: 'Get user meals',
          operationId: 'getMeals',
          tags: ['Meals'],
          parameters: [
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 10, minimum: 1, maximum: 100 },
              description: 'Number of meals to return'
            },
            {
              name: 'offset',
              in: 'query',
              schema: { type: 'integer', default: 0, minimum: 0 },
              description: 'Number of meals to skip'
            },
            {
              name: 'dietary',
              in: 'query',
              schema: { type: 'string', enum: ['vegetarian', 'vegan', 'gluten-free'] },
              description: 'Filter by dietary restrictions'
            }
          ],
          responses: {
            '200': {
              description: 'List of meals',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Meal' }
                      },
                      pagination: { $ref: '#/components/schemas/Pagination' }
                    }
                  }
                }
              }
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '500': { $ref: '#/components/responses/InternalServerError' }
          }
        },
        post: {
          summary: 'Create a new meal',
          operationId: 'createMeal',
          tags: ['Meals'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateMealRequest' }
              }
            }
          },
          responses: {
            '201': {
              description: 'Meal created successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Meal' }
                }
              }
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '422': { $ref: '#/components/responses/ValidationError' }
          }
        }
      },
      '/meals/{id}': {
        get: {
          summary: 'Get meal by ID',
          operationId: 'getMeal',
          tags: ['Meals'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'Meal ID'
            }
          ],
          responses: {
            '200': {
              description: 'Meal details',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Meal' }
                }
              }
            },
            '404': { $ref: '#/components/responses/NotFound' },
            '500': { $ref: '#/components/responses/InternalServerError' }
          }
        },
        put: {
          summary: 'Update meal',
          operationId: 'updateMeal',
          tags: ['Meals'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'Meal ID'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateMealRequest' }
              }
            }
          },
          responses: {
            '200': {
              description: 'Meal updated successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Meal' }
                }
              }
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '404': { $ref: '#/components/responses/NotFound' },
            '422': { $ref: '#/components/responses/ValidationError' }
          }
        },
        delete: {
          summary: 'Delete meal',
          operationId: 'deleteMeal',
          tags: ['Meals'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'Meal ID'
            }
          ],
          responses: {
            '204': { description: 'Meal deleted successfully' },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '404': { $ref: '#/components/responses/NotFound' },
            '500': { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/users/profile': {
        get: {
          summary: 'Get user profile',
          operationId: 'getUserProfile',
          tags: ['Users'],
          responses: {
            '200': {
              description: 'User profile',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/UserProfile' }
                }
              }
            },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '500': { $ref: '#/components/responses/InternalServerError' }
          }
        },
        put: {
          summary: 'Update user profile',
          operationId: 'updateUserProfile',
          tags: ['Users'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateUserProfileRequest' }
              }
            }
          },
          responses: {
            '200': {
              description: 'Profile updated successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/UserProfile' }
                }
              }
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '422': { $ref: '#/components/responses/ValidationError' }
          }
        }
      }
    };

    return paths;
  }

  /**
   * Generate component schemas
   */
  generateSchemas(version) {
    return {
      Meal: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string', maxLength: 500 },
          ingredients: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1
          },
          instructions: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1
          },
          prepTime: { type: 'integer', minimum: 0, description: 'Preparation time in minutes' },
          cookTime: { type: 'integer', minimum: 0, description: 'Cooking time in minutes' },
          servings: { type: 'integer', minimum: 1 },
          difficulty: {
            type: 'string',
            enum: ['easy', 'medium', 'hard']
          },
          dietary: {
            type: 'object',
            properties: {
              vegetarian: { type: 'boolean' },
              vegan: { type: 'boolean' },
              glutenFree: { type: 'boolean' }
            },
            required: ['vegetarian', 'vegan', 'glutenFree']
          },
          nutrition: {
            type: 'object',
            properties: {
              calories: { type: 'number', minimum: 0 },
              protein: { type: 'number', minimum: 0 },
              carbs: { type: 'number', minimum: 0 },
              fat: { type: 'number', minimum: 0 }
            },
            required: ['calories', 'protein', 'carbs', 'fat']
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        },
        required: ['id', 'name', 'description', 'ingredients', 'instructions', 'prepTime', 'cookTime', 'servings', 'difficulty', 'dietary', 'nutrition', 'createdAt', 'updatedAt']
      },
      CreateMealRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string', maxLength: 500 },
          ingredients: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1
          },
          instructions: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1
          },
          prepTime: { type: 'integer', minimum: 0 },
          cookTime: { type: 'integer', minimum: 0 },
          servings: { type: 'integer', minimum: 1 },
          difficulty: {
            type: 'string',
            enum: ['easy', 'medium', 'hard']
          },
          dietary: {
            type: 'object',
            properties: {
              vegetarian: { type: 'boolean' },
              vegan: { type: 'boolean' },
              glutenFree: { type: 'boolean' }
            },
            required: ['vegetarian', 'vegan', 'glutenFree']
          }
        },
        required: ['name', 'description', 'ingredients', 'instructions', 'prepTime', 'cookTime', 'servings', 'difficulty', 'dietary']
      },
      UpdateMealRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string', maxLength: 500 },
          ingredients: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1
          },
          instructions: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1
          },
          prepTime: { type: 'integer', minimum: 0 },
          cookTime: { type: 'integer', minimum: 0 },
          servings: { type: 'integer', minimum: 1 },
          difficulty: {
            type: 'string',
            enum: ['easy', 'medium', 'hard']
          },
          dietary: {
            type: 'object',
            properties: {
              vegetarian: { type: 'boolean' },
              vegan: { type: 'boolean' },
              glutenFree: { type: 'boolean' }
            },
            required: ['vegetarian', 'vegan', 'glutenFree']
          }
        }
      },
      UserProfile: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string', minLength: 1, maxLength: 100 },
          dietaryPreferences: {
            type: 'object',
            properties: {
              vegetarian: { type: 'boolean' },
              vegan: { type: 'boolean' },
              glutenFree: { type: 'boolean' },
              allergies: {
                type: 'array',
                items: { type: 'string' }
              }
            }
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        },
        required: ['id', 'email', 'name', 'dietaryPreferences', 'createdAt', 'updatedAt']
      },
      UpdateUserProfileRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          dietaryPreferences: {
            type: 'object',
            properties: {
              vegetarian: { type: 'boolean' },
              vegan: { type: 'boolean' },
              glutenFree: { type: 'boolean' },
              allergies: {
                type: 'array',
                items: { type: 'string' }
              }
            }
          }
        }
      },
      Pagination: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1 },
          offset: { type: 'integer', minimum: 0 },
          total: { type: 'integer', minimum: 0 },
          hasMore: { type: 'boolean' }
        },
        required: ['limit', 'offset', 'total', 'hasMore']
      },
      Error: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          message: { type: 'string' },
          details: { type: 'object' }
        },
        required: ['code', 'message']
      }
    };
  }

  /**
   * Generate response schemas
   */
  generateResponses(version) {
    return {
      BadRequest: {
        description: 'Bad Request',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              code: 'BAD_REQUEST',
              message: 'Invalid request parameters',
              details: { field: 'limit', reason: 'Must be between 1 and 100' }
            }
          }
        }
      },
      Unauthorized: {
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              code: 'UNAUTHORIZED',
              message: 'Authentication required'
            }
          }
        }
      },
      NotFound: {
        description: 'Not Found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              code: 'NOT_FOUND',
              message: 'Resource not found'
            }
          }
        }
      },
      ValidationError: {
        description: 'Validation Error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              code: 'VALIDATION_ERROR',
              message: 'Request validation failed',
              details: {
                field: 'name',
                reason: 'Name is required'
              }
            }
          }
        }
      },
      InternalServerError: {
        description: 'Internal Server Error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              code: 'INTERNAL_SERVER_ERROR',
              message: 'An unexpected error occurred'
            }
          }
        }
      }
    };
  }

  /**
   * Generate parameter schemas
   */
  generateParameters(version) {
    return {
      LimitParam: {
        name: 'limit',
        in: 'query',
        schema: { type: 'integer', default: 10, minimum: 1, maximum: 100 },
        description: 'Number of items to return'
      },
      OffsetParam: {
        name: 'offset',
        in: 'query',
        schema: { type: 'integer', default: 0, minimum: 0 },
        description: 'Number of items to skip'
      }
    };
  }

  /**
   * Generate security schemes
   */
  generateSecuritySchemes(version) {
    return {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token authentication'
      },
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'API key authentication'
      }
    };
  }

  /**
   * Generate tags
   */
  generateTags(version) {
    return [
      {
        name: 'Meals',
        description: 'Meal management operations'
      },
      {
        name: 'Users',
        description: 'User profile operations'
      }
    ];
  }

  /**
   * Generate version components
   */
  async generateVersionComponents(version) {
    const componentsDir = path.join(config.schemasDir, version, 'components');
    
    // Generate schemas file
    const schemasPath = path.join(componentsDir, 'schemas.yaml');
    const schemas = this.generateSchemas(version);
    fs.writeFileSync(schemasPath, this.yamlStringify(schemas));
    
    // Generate responses file
    const responsesPath = path.join(componentsDir, 'responses.yaml');
    const responses = this.generateResponses(version);
    fs.writeFileSync(responsesPath, this.yamlStringify(responses));
    
    // Generate parameters file
    const parametersPath = path.join(componentsDir, 'parameters.yaml');
    const parameters = this.generateParameters(version);
    fs.writeFileSync(parametersPath, this.yamlStringify(parameters));
    
    // Generate security file
    const securityPath = path.join(componentsDir, 'security.yaml');
    const security = this.generateSecuritySchemes(version);
    fs.writeFileSync(securityPath, this.yamlStringify(security));
  }

  /**
   * Generate version examples
   */
  async generateVersionExamples(version) {
    const examplesDir = path.join(config.schemasDir, version, 'examples');
    
    // Generate meal examples
    const mealExamples = {
      meal: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Spaghetti Carbonara',
        description: 'Classic Italian pasta dish with eggs, cheese, and pancetta',
        ingredients: [
          '400g spaghetti',
          '200g pancetta',
          '4 large eggs',
          '100g pecorino cheese',
          '2 cloves garlic',
          'Black pepper',
          'Salt'
        ],
        instructions: [
          'Cook spaghetti according to package instructions',
          'Fry pancetta until crispy',
          'Beat eggs with cheese and pepper',
          'Combine hot pasta with pancetta',
          'Add egg mixture and toss quickly'
        ],
        prepTime: 15,
        cookTime: 20,
        servings: 4,
        difficulty: 'medium',
        dietary: {
          vegetarian: false,
          vegan: false,
          glutenFree: false
        },
        nutrition: {
          calories: 520,
          protein: 25,
          carbs: 45,
          fat: 28
        },
        createdAt: '2024-12-19T10:00:00Z',
        updatedAt: '2024-12-19T10:00:00Z'
      }
    };
    
    const mealExamplesPath = path.join(examplesDir, 'meals.yaml');
    fs.writeFileSync(mealExamplesPath, this.yamlStringify(mealExamples));
  }

  /**
   * Generate shared components
   */
  async generateSharedComponents() {
    const sharedDir = path.join(config.schemasDir, 'shared');
    
    // Generate common schemas
    const commonSchemas = {
      Timestamp: {
        type: 'string',
        format: 'date-time',
        description: 'ISO 8601 timestamp'
      },
      UUID: {
        type: 'string',
        format: 'uuid',
        description: 'Universally unique identifier'
      },
      Email: {
        type: 'string',
        format: 'email',
        description: 'Email address'
      }
    };
    
    const commonSchemasPath = path.join(sharedDir, 'common.yaml');
    fs.writeFileSync(commonSchemasPath, this.yamlStringify(commonSchemas));
  }

  /**
   * Validate generated schemas
   */
  async validateSchemas() {
    log('\n🔍 Validating schemas...', 'blue');
    
    for (const version of config.versions) {
      const schemaPath = path.join(config.schemasDir, version, 'openapi.yaml');
      
      if (fs.existsSync(schemaPath)) {
        try {
          // Basic YAML validation
          const content = fs.readFileSync(schemaPath, 'utf8');
          const schema = this.yamlParse(content);
          
          // Validate required fields
          if (!schema.openapi || !schema.info || !schema.paths) {
            this.results.errors.push({
              version,
              error: 'Missing required OpenAPI fields',
              file: schemaPath
            });
            this.results.summary.validationErrors++;
          }
          
          log(`  ${version}: Valid`, 'green');
        } catch (error) {
          this.results.errors.push({
            version,
            error: error.message,
            file: schemaPath
          });
          this.results.summary.validationErrors++;
          log(`  ${version}: Invalid - ${error.message}`, 'red');
        }
      }
    }
  }

  /**
   * Generate summary report
   */
  generateSummary() {
    log('\n📊 API Generation Summary', 'bold');
    log('=========================', 'bold');
    log(`Total Versions: ${this.results.summary.totalVersions}`, 'blue');
    log(`Total Endpoints: ${this.results.summary.totalEndpoints}`, 'blue');
    log(`Total Schemas: ${this.results.summary.totalSchemas}`, 'blue');
    log(`Validation Errors: ${this.results.summary.validationErrors}`, 
        this.results.summary.validationErrors > 0 ? 'red' : 'green');

    if (this.results.errors.length > 0) {
      log('\n❌ Errors:', 'red');
      this.results.errors.forEach(error => {
        log(`  ${error.version}: ${error.error}`, 'red');
      });
    }
  }

  /**
   * Save results to file
   */
  saveResults() {
    const resultsPath = path.join(process.cwd(), 'REPORTS', 'api-generation-results.json');
    const reportsDir = path.dirname(resultsPath);
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(resultsPath, JSON.stringify(this.results, null, 2));
    log(`\n📁 Results saved to: ${resultsPath}`, 'blue');
  }

  /**
   * Helper methods
   */
  getVersionNumber(version) {
    const versionMap = {
      'v1': '1.0.0',
      'v2': '2.0.0'
    };
    return versionMap[version] || '1.0.0';
  }

  countEndpoints(schema) {
    const paths = schema.paths || {};
    let count = 0;
    Object.values(paths).forEach(path => {
      count += Object.keys(path).length;
    });
    return count;
  }

  countSchemas(schema) {
    const schemas = schema.components?.schemas || {};
    return Object.keys(schemas).length;
  }

  yamlStringify(obj) {
    // Simple YAML stringification (in production, use a proper YAML library)
    return JSON.stringify(obj, null, 2);
  }

  yamlParse(str) {
    // Simple YAML parsing (in production, use a proper YAML library)
    return JSON.parse(str);
  }
}

// Main execution
async function main() {
  log('🔧 API Schema Generation Starting...', 'bold');
  
  const generator = new APIGenerator();
  const results = await generator.generateSchemas();
  generator.saveResults();

  log('\n✅ API schema generation completed successfully!', 'green');
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('API generation failed:', error);
    process.exit(1);
  });
}

module.exports = { APIGenerator, config };