#!/usr/bin/env node

/**
 * API Validation Script
 * 
 * Validates OpenAPI schemas, checks for breaking changes, and ensures contract compliance
 */

const fs = require('fs');
const path = require('path');

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
  schemasDir: 'api/schemas',
  versions: ['v1', 'v2'],
  currentVersion: 'v1',
  breakingChangeTypes: [
    'removed_endpoint',
    'removed_field',
    'changed_field_type',
    'changed_response_structure',
    'removed_parameter',
    'changed_parameter_type',
    'added_required_field'
  ]
};

class APIValidator {
  constructor() {
    this.results = {
      summary: {
        totalSchemas: 0,
        validSchemas: 0,
        invalidSchemas: 0,
        breakingChanges: 0,
        warnings: 0
      },
      schemas: {},
      breakingChanges: [],
      warnings: [],
      errors: []
    };
  }

  /**
   * Run all validation checks
   */
  async runValidation() {
    log('🔍 Running API Validation...', 'blue');
    log('============================', 'blue');

    // Validate individual schemas
    await this.validateSchemas();

    // Check for breaking changes
    await this.checkBreakingChanges();

    // Validate contract compliance
    await this.validateContractCompliance();

    this.generateSummary();
    return this.results;
  }

  /**
   * Validate individual schemas
   */
  async validateSchemas() {
    log('\n📋 Validating Schemas...', 'blue');

    for (const version of config.versions) {
      const schemaPath = path.join(config.schemasDir, version, 'openapi.yaml');
      
      if (fs.existsSync(schemaPath)) {
        const validation = await this.validateSchema(schemaPath, version);
        this.results.schemas[version] = validation;
        this.results.summary.totalSchemas++;

        if (validation.valid) {
          this.results.summary.validSchemas++;
          log(`  ${version}: Valid`, 'green');
        } else {
          this.results.summary.invalidSchemas++;
          log(`  ${version}: Invalid`, 'red');
        }
      } else {
        log(`  ${version}: Schema not found`, 'yellow');
        this.results.warnings.push({
          version,
          type: 'missing_schema',
          message: `Schema file not found: ${schemaPath}`
        });
      }
    }
  }

  /**
   * Validate a single schema
   */
  async validateSchema(schemaPath, version) {
    const validation = {
      version,
      path: schemaPath,
      valid: true,
      errors: [],
      warnings: [],
      endpoints: 0,
      schemas: 0,
      parameters: 0
    };

    try {
      const content = fs.readFileSync(schemaPath, 'utf8');
      const schema = this.parseYAML(content);

      // Validate OpenAPI version
      if (!schema.openapi || !schema.openapi.startsWith('3.')) {
        validation.errors.push({
          type: 'invalid_openapi_version',
          message: 'OpenAPI version must be 3.x'
        });
        validation.valid = false;
      }

      // Validate required fields
      if (!schema.info) {
        validation.errors.push({
          type: 'missing_info',
          message: 'Missing required info section'
        });
        validation.valid = false;
      }

      if (!schema.paths) {
        validation.errors.push({
          type: 'missing_paths',
          message: 'Missing required paths section'
        });
        validation.valid = false;
      }

      // Validate info section
      if (schema.info) {
        if (!schema.info.title) {
          validation.errors.push({
            type: 'missing_title',
            message: 'Missing required title in info section'
          });
          validation.valid = false;
        }

        if (!schema.info.version) {
          validation.errors.push({
            type: 'missing_version',
            message: 'Missing required version in info section'
          });
          validation.valid = false;
        }
      }

      // Validate paths
      if (schema.paths) {
        validation.endpoints = this.countEndpoints(schema.paths);
        
        for (const [path, pathItem] of Object.entries(schema.paths)) {
          this.validatePath(path, pathItem, validation);
        }
      }

      // Validate components
      if (schema.components) {
        if (schema.components.schemas) {
          validation.schemas = Object.keys(schema.components.schemas).length;
          this.validateSchemas(schema.components.schemas, validation);
        }

        if (schema.components.parameters) {
          validation.parameters = Object.keys(schema.components.parameters).length;
        }
      }

    } catch (error) {
      validation.errors.push({
        type: 'parse_error',
        message: `Failed to parse schema: ${error.message}`
      });
      validation.valid = false;
    }

    return validation;
  }

  /**
   * Validate a path item
   */
  validatePath(path, pathItem, validation) {
    // Validate path format
    if (!path.startsWith('/')) {
      validation.errors.push({
        type: 'invalid_path',
        message: `Path must start with '/': ${path}`
      });
      validation.valid = false;
    }

    // Validate HTTP methods
    const validMethods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];
    for (const [method, operation] of Object.entries(pathItem)) {
      if (validMethods.includes(method)) {
        this.validateOperation(method, operation, validation);
      }
    }
  }

  /**
   * Validate an operation
   */
  validateOperation(method, operation, validation) {
    // Validate required fields
    if (!operation.operationId) {
      validation.warnings.push({
        type: 'missing_operation_id',
        message: `Operation ${method} missing operationId`
      });
    }

    if (!operation.summary && !operation.description) {
      validation.warnings.push({
        type: 'missing_description',
        message: `Operation ${method} missing summary or description`
      });
    }

    // Validate responses
    if (!operation.responses) {
      validation.errors.push({
        type: 'missing_responses',
        message: `Operation ${method} missing responses`
      });
        validation.valid = false;
    } else {
      this.validateResponses(operation.responses, validation);
    }

    // Validate parameters
    if (operation.parameters) {
      this.validateParameters(operation.parameters, validation);
    }

    // Validate request body
    if (operation.requestBody) {
      this.validateRequestBody(operation.requestBody, validation);
    }
  }

  /**
   * Validate responses
   */
  validateResponses(responses, validation) {
    const requiredResponses = ['200', '400', '401', '500'];
    
    for (const statusCode of requiredResponses) {
      if (!responses[statusCode]) {
        validation.warnings.push({
          type: 'missing_response',
          message: `Missing recommended response: ${statusCode}`
        });
      }
    }

    // Validate response structure
    for (const [statusCode, response] of Object.entries(responses)) {
      if (!response.description) {
        validation.warnings.push({
          type: 'missing_response_description',
          message: `Response ${statusCode} missing description`
        });
      }
    }
  }

  /**
   * Validate parameters
   */
  validateParameters(parameters, validation) {
    for (const param of parameters) {
      if (!param.name) {
        validation.errors.push({
          type: 'missing_parameter_name',
          message: 'Parameter missing name'
        });
        validation.valid = false;
      }

      if (!param.in) {
        validation.errors.push({
          type: 'missing_parameter_location',
          message: `Parameter ${param.name} missing location (in)`
        });
        validation.valid = false;
      }

      if (!param.schema && !param.content) {
        validation.errors.push({
          type: 'missing_parameter_schema',
          message: `Parameter ${param.name} missing schema or content`
        });
        validation.valid = false;
      }
    }
  }

  /**
   * Validate request body
   */
  validateRequestBody(requestBody, validation) {
    if (!requestBody.content) {
      validation.errors.push({
        type: 'missing_request_body_content',
        message: 'Request body missing content'
      });
      validation.valid = false;
    }
  }

  /**
   * Validate schemas
   */
  validateSchemas(schemas, validation) {
    for (const [name, schema] of Object.entries(schemas)) {
      if (!schema.type) {
        validation.warnings.push({
          type: 'missing_schema_type',
          message: `Schema ${name} missing type`
        });
      }

      if (schema.type === 'object' && !schema.properties) {
        validation.warnings.push({
          type: 'missing_schema_properties',
          message: `Object schema ${name} missing properties`
        });
      }
    }
  }

  /**
   * Check for breaking changes
   */
  async checkBreakingChanges() {
    log('\n🚨 Checking for Breaking Changes...', 'blue');

    const versions = config.versions.sort();
    
    for (let i = 1; i < versions.length; i++) {
      const fromVersion = versions[i - 1];
      const toVersion = versions[i];
      
      const changes = await this.compareVersions(fromVersion, toVersion);
      this.results.breakingChanges.push(...changes);
      this.results.summary.breakingChanges += changes.length;

      if (changes.length > 0) {
        log(`  ${fromVersion} → ${toVersion}: ${changes.length} breaking changes`, 'red');
      } else {
        log(`  ${fromVersion} → ${toVersion}: No breaking changes`, 'green');
      }
    }
  }

  /**
   * Compare two versions
   */
  async compareVersions(fromVersion, toVersion) {
    const changes = [];
    
    const fromSchema = this.loadSchema(fromVersion);
    const toSchema = this.loadSchema(toVersion);

    if (!fromSchema || !toSchema) {
      return changes;
    }

    // Check for removed endpoints
    const fromPaths = fromSchema.paths || {};
    const toPaths = toSchema.paths || {};

    for (const [path, pathItem] of Object.entries(fromPaths)) {
      if (!toPaths[path]) {
        changes.push({
          type: 'removed_endpoint',
          path,
          message: `Endpoint ${path} was removed`,
          severity: 'high'
        });
      } else {
        // Check for removed methods
        for (const [method, operation] of Object.entries(pathItem)) {
          if (validMethods.includes(method) && !toPaths[path][method]) {
            changes.push({
              type: 'removed_endpoint',
              path: `${path} ${method.toUpperCase()}`,
              message: `Method ${method.toUpperCase()} was removed from ${path}`,
              severity: 'high'
            });
          }
        }
      }
    }

    // Check for schema changes
    const fromSchemas = fromSchema.components?.schemas || {};
    const toSchemas = toSchema.components?.schemas || {};

    for (const [schemaName, fromSchemaDef] of Object.entries(fromSchemas)) {
      if (!toSchemas[schemaName]) {
        changes.push({
          type: 'removed_schema',
          path: schemaName,
          message: `Schema ${schemaName} was removed`,
          severity: 'high'
        });
      } else {
        const schemaChanges = this.compareSchemas(schemaName, fromSchemaDef, toSchemas[schemaName]);
        changes.push(...schemaChanges);
      }
    }

    return changes;
  }

  /**
   * Compare two schemas
   */
  compareSchemas(schemaName, fromSchema, toSchema) {
    const changes = [];

    if (fromSchema.type !== toSchema.type) {
      changes.push({
        type: 'changed_field_type',
        path: `${schemaName}.type`,
        message: `Schema ${schemaName} type changed from ${fromSchema.type} to ${toSchema.type}`,
        severity: 'high'
      });
    }

    if (fromSchema.properties && toSchema.properties) {
      const fromProps = fromSchema.properties;
      const toProps = toSchema.properties;

      // Check for removed properties
      for (const [propName, propDef] of Object.entries(fromProps)) {
        if (!toProps[propName]) {
          changes.push({
            type: 'removed_field',
            path: `${schemaName}.${propName}`,
            message: `Property ${propName} was removed from ${schemaName}`,
            severity: 'high'
          });
        } else {
          // Check for type changes
          if (propDef.type !== toProps[propName].type) {
            changes.push({
              type: 'changed_field_type',
              path: `${schemaName}.${propName}`,
              message: `Property ${propName} type changed from ${propDef.type} to ${toProps[propName].type}`,
              severity: 'high'
            });
          }
        }
      }

      // Check for new required fields
      const fromRequired = fromSchema.required || [];
      const toRequired = toSchema.required || [];
      
      for (const requiredField of toRequired) {
        if (!fromRequired.includes(requiredField)) {
          changes.push({
            type: 'added_required_field',
            path: `${schemaName}.${requiredField}`,
            message: `Property ${requiredField} is now required in ${schemaName}`,
            severity: 'high'
          });
        }
      }
    }

    return changes;
  }

  /**
   * Validate contract compliance
   */
  async validateContractCompliance() {
    log('\n📋 Validating Contract Compliance...', 'blue');

    // Check for required endpoints
    const requiredEndpoints = [
      '/meals',
      '/meals/{id}',
      '/users/profile'
    ];

    for (const version of config.versions) {
      const schema = this.loadSchema(version);
      if (schema && schema.paths) {
        for (const endpoint of requiredEndpoints) {
          if (!schema.paths[endpoint]) {
            this.results.warnings.push({
              version,
              type: 'missing_required_endpoint',
              message: `Missing required endpoint: ${endpoint}`
            });
          }
        }
      }
    }

    // Check for required schemas
    const requiredSchemas = ['Meal', 'UserProfile', 'Error'];
    
    for (const version of config.versions) {
      const schema = this.loadSchema(version);
      if (schema && schema.components && schema.components.schemas) {
        for (const schemaName of requiredSchemas) {
          if (!schema.components.schemas[schemaName]) {
            this.results.warnings.push({
              version,
              type: 'missing_required_schema',
              message: `Missing required schema: ${schemaName}`
            });
          }
        }
      }
    }
  }

  /**
   * Load schema from file
   */
  loadSchema(version) {
    const schemaPath = path.join(config.schemasDir, version, 'openapi.yaml');
    
    if (!fs.existsSync(schemaPath)) {
      return null;
    }

    try {
      const content = fs.readFileSync(schemaPath, 'utf8');
      return this.parseYAML(content);
    } catch (error) {
      return null;
    }
  }

  /**
   * Count endpoints in paths
   */
  countEndpoints(paths) {
    let count = 0;
    for (const pathItem of Object.values(paths)) {
      count += Object.keys(pathItem).length;
    }
    return count;
  }

  /**
   * Parse YAML content
   */
  parseYAML(content) {
    // Simple YAML parsing (in production, use a proper YAML library)
    try {
      return JSON.parse(content);
    } catch (error) {
      // Fallback to basic parsing
      return {};
    }
  }

  /**
   * Generate summary report
   */
  generateSummary() {
    log('\n📊 API Validation Summary', 'bold');
    log('=========================', 'bold');
    log(`Total Schemas: ${this.results.summary.totalSchemas}`, 'blue');
    log(`Valid Schemas: ${this.results.summary.validSchemas}`, 'green');
    log(`Invalid Schemas: ${this.results.summary.invalidSchemas}`, 'red');
    log(`Breaking Changes: ${this.results.summary.breakingChanges}`, 
        this.results.summary.breakingChanges > 0 ? 'red' : 'green');
    log(`Warnings: ${this.results.summary.warnings}`, 
        this.results.summary.warnings > 0 ? 'yellow' : 'green');

    if (this.results.breakingChanges.length > 0) {
      log('\n🚨 Breaking Changes:', 'red');
      this.results.breakingChanges.forEach(change => {
        log(`  ${change.type}: ${change.message}`, 'red');
      });
    }

    if (this.results.warnings.length > 0) {
      log('\n⚠️  Warnings:', 'yellow');
      this.results.warnings.forEach(warning => {
        log(`  ${warning.type}: ${warning.message}`, 'yellow');
      });
    }
  }

  /**
   * Save results to file
   */
  saveResults() {
    const resultsPath = path.join(process.cwd(), 'REPORTS', 'api-validation-results.json');
    const reportsDir = path.dirname(resultsPath);
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(resultsPath, JSON.stringify(this.results, null, 2));
    log(`\n📁 Results saved to: ${resultsPath}`, 'blue');
  }
}

// Main execution
async function main() {
  log('🔍 API Validation Starting...', 'bold');
  
  const validator = new APIValidator();
  const results = await validator.runValidation();
  validator.saveResults();

  // Exit with appropriate code
  const hasErrors = results.summary.invalidSchemas > 0 || results.summary.breakingChanges > 0;
  process.exit(hasErrors ? 1 : 0);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('API validation failed:', error);
    process.exit(1);
  });
}

module.exports = { APIValidator, config };