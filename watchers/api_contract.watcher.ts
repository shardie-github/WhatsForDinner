/**
 * API Contract Watcher
 * Compares latest OpenAPI spec vs deployed endpoints
 * Validates API consistency and reports breaking changes
 */

import { Octokit } from '@octokit/rest';
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

interface APIContract {
  path: string;
  method: string;
  parameters: APIParameter[];
  responses: APIResponse[];
  summary: string;
  description: string;
  tags: string[];
  deprecated?: boolean;
}

interface APIParameter {
  name: string;
  in: 'query' | 'path' | 'header' | 'cookie';
  required: boolean;
  schema: {
    type: string;
    format?: string;
    enum?: string[];
  };
  description?: string;
}

interface APIResponse {
  status: string;
  description: string;
  schema?: {
    type: string;
    properties?: Record<string, any>;
  };
}

interface ContractComparison {
  endpoint: string;
  method: string;
  status: 'added' | 'removed' | 'modified' | 'unchanged';
  changes: ContractChange[];
  severity: 'breaking' | 'non-breaking' | 'info';
}

interface ContractChange {
  type: 'parameter' | 'response' | 'endpoint' | 'method';
  field: string;
  old_value?: any;
  new_value?: any;
  description: string;
}

interface ContractReport {
  timestamp: string;
  total_endpoints: number;
  added_endpoints: number;
  removed_endpoints: number;
  modified_endpoints: number;
  breaking_changes: number;
  comparisons: ContractComparison[];
  recommendations: string[];
}

class APIContractWatcher {
  private octokit: Octokit;
  private projectRoot: string;

  constructor() {
    this.projectRoot = process.cwd();
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
  }

  /**
   * Run API contract validation
   */
  async validateAPIContracts(): Promise<ContractReport> {
    console.log('📋 Validating API contracts...');

    try {
      // Load current OpenAPI spec
      const currentSpec = await this.loadOpenAPISpec();
      
      // Discover deployed endpoints
      const deployedEndpoints = await this.discoverDeployedEndpoints();
      
      // Compare contracts
      const comparisons = await this.compareContracts(currentSpec, deployedEndpoints);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(comparisons);

      const report: ContractReport = {
        timestamp: new Date().toISOString(),
        total_endpoints: deployedEndpoints.length,
        added_endpoints: comparisons.filter(c => c.status === 'added').length,
        removed_endpoints: comparisons.filter(c => c.status === 'removed').length,
        modified_endpoints: comparisons.filter(c => c.status === 'modified').length,
        breaking_changes: comparisons.filter(c => c.severity === 'breaking').length,
        comparisons,
        recommendations
      };

      // Store report
      await this.storeReport(report);

      // Create GitHub issue if breaking changes found
      if (report.breaking_changes > 0) {
        await this.createContractIssue(report);
      }

      return report;
    } catch (error) {
      console.error('API contract validation failed:', error);
      throw error;
    }
  }

  /**
   * Load OpenAPI specification
   */
  private async loadOpenAPISpec(): Promise<APIContract[]> {
    const contracts: APIContract[] = [];

    try {
      // Look for OpenAPI spec files
      const specFiles = await glob('**/openapi.json', { cwd: this.projectRoot });
      const swaggerFiles = await glob('**/swagger.json', { cwd: this.projectRoot });
      const yamlFiles = await glob('**/openapi.yaml', { cwd: this.projectRoot });

      const allSpecFiles = [...specFiles, ...swaggerFiles, ...yamlFiles];

      for (const specFile of allSpecFiles) {
        try {
          const specPath = path.join(this.projectRoot, specFile);
          const specContent = fs.readFileSync(specPath, 'utf8');
          const spec = JSON.parse(specContent);

          // Extract API contracts from OpenAPI spec
          const fileContracts = this.extractContractsFromSpec(spec);
          contracts.push(...fileContracts);
        } catch (error) {
          console.warn(`Failed to load spec file ${specFile}:`, error.message);
        }
      }

      // If no spec files found, generate from code analysis
      if (contracts.length === 0) {
        console.log('No OpenAPI spec found, analyzing code for API contracts...');
        const codeContracts = await this.generateContractsFromCode();
        contracts.push(...codeContracts);
      }

    } catch (error) {
      console.error('Failed to load OpenAPI spec:', error);
    }

    return contracts;
  }

  /**
   * Extract contracts from OpenAPI specification
   */
  private extractContractsFromSpec(spec: any): APIContract[] {
    const contracts: APIContract[] = [];

    if (!spec.paths) {
      return contracts;
    }

    for (const [path, pathItem] of Object.entries(spec.paths)) {
      for (const [method, operation] of Object.entries(pathItem as any)) {
        if (typeof operation === 'object' && operation !== null) {
          const contract: APIContract = {
            path,
            method: method.toUpperCase(),
            parameters: this.extractParameters(operation.parameters || []),
            responses: this.extractResponses(operation.responses || {}),
            summary: operation.summary || '',
            description: operation.description || '',
            tags: operation.tags || [],
            deprecated: operation.deprecated || false
          };

          contracts.push(contract);
        }
      }
    }

    return contracts;
  }

  /**
   * Extract parameters from OpenAPI operation
   */
  private extractParameters(parameters: any[]): APIParameter[] {
    return parameters.map(param => ({
      name: param.name,
      in: param.in,
      required: param.required || false,
      schema: {
        type: param.schema?.type || 'string',
        format: param.schema?.format,
        enum: param.schema?.enum
      },
      description: param.description
    }));
  }

  /**
   * Extract responses from OpenAPI operation
   */
  private extractResponses(responses: any): APIResponse[] {
    return Object.entries(responses).map(([status, response]: [string, any]) => ({
      status,
      description: response.description || '',
      schema: response.content?.['application/json']?.schema
    }));
  }

  /**
   * Generate contracts from code analysis
   */
  private async generateContractsFromCode(): Promise<APIContract[]> {
    const contracts: APIContract[] = [];

    try {
      // Look for API route files
      const apiFiles = await glob('apps/web/app/api/**/*.{ts,js}', { cwd: this.projectRoot });
      
      for (const apiFile of apiFiles) {
        try {
          const filePath = path.join(this.projectRoot, apiFile);
          const content = fs.readFileSync(filePath, 'utf8');
          
          const fileContracts = this.parseAPIFile(apiFile, content);
          contracts.push(...fileContracts);
        } catch (error) {
          console.warn(`Failed to parse API file ${apiFile}:`, error.message);
        }
      }
    } catch (error) {
      console.error('Failed to generate contracts from code:', error);
    }

    return contracts;
  }

  /**
   * Parse API file to extract contracts
   */
  private parseAPIFile(filePath: string, content: string): APIContract[] {
    const contracts: APIContract[] = [];
    
    // Extract route path from file path
    const routePath = filePath
      .replace(/.*\/app\/api/, '')
      .replace(/\/route\.(ts|js)$/, '')
      .replace(/\[([^\]]+)\]/g, '{$1}'); // Convert [param] to {param}

    // Extract HTTP methods from content
    const methods = this.extractHTTPMethods(content);
    
    for (const method of methods) {
      const contract: APIContract = {
        path: routePath,
        method: method.toUpperCase(),
        parameters: this.extractParametersFromCode(content),
        responses: this.extractResponsesFromCode(content),
        summary: this.extractSummaryFromCode(content),
        description: this.extractDescriptionFromCode(content),
        tags: this.extractTagsFromCode(content),
        deprecated: content.includes('@deprecated')
      };

      contracts.push(contract);
    }

    return contracts;
  }

  /**
   * Extract HTTP methods from code
   */
  private extractHTTPMethods(content: string): string[] {
    const methods: string[] = [];
    const methodPatterns = [
      /export\s+(?:async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)/gi,
      /export\s+const\s+(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)/gi,
      /\.(get|post|put|delete|patch|head|options)\s*\(/gi
    ];

    for (const pattern of methodPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const method = match.replace(/export\s+(?:async\s+)?function\s+|export\s+const\s+|\./g, '').toUpperCase();
          if (!methods.includes(method)) {
            methods.push(method);
          }
        });
      }
    }

    return methods.length > 0 ? methods : ['GET']; // Default to GET if no methods found
  }

  /**
   * Extract parameters from code
   */
  private extractParametersFromCode(content: string): APIParameter[] {
    const parameters: APIParameter[] = [];
    
    // Look for parameter patterns in code
    const paramPatterns = [
      /req\.query\.(\w+)/g,
      /req\.params\.(\w+)/g,
      /req\.headers\[['"`](\w+)['"`]\]/g
    ];

    for (const pattern of paramPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const paramName = match.replace(/req\.(query|params|headers)\[?['"`]?|['"`]?\]?/g, '');
          if (!parameters.find(p => p.name === paramName)) {
            parameters.push({
              name: paramName,
              in: match.includes('query') ? 'query' : 
                  match.includes('params') ? 'path' : 'header',
              required: true, // Assume required by default
              schema: { type: 'string' },
              description: ''
            });
          }
        });
      }
    }

    return parameters;
  }

  /**
   * Extract responses from code
   */
  private extractResponsesFromCode(content: string): APIResponse[] {
    const responses: APIResponse[] = [];
    
    // Look for response status codes
    const statusPatterns = [
      /return\s+Response\.json\([^,]*,\s*(\d+)\)/g,
      /res\.status\((\d+)\)/g,
      /new\s+Response\([^,]*,\s*{\s*status:\s*(\d+)/g
    ];

    for (const pattern of statusPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const statusMatch = match.match(/(\d+)/);
          if (statusMatch) {
            const status = statusMatch[1];
            if (!responses.find(r => r.status === status)) {
              responses.push({
                status,
                description: this.getStatusDescription(parseInt(status)),
                schema: { type: 'object' }
              });
            }
          }
        });
      }
    }

    return responses.length > 0 ? responses : [
      { status: '200', description: 'Success', schema: { type: 'object' } }
    ];
  }

  /**
   * Extract summary from code
   */
  private extractSummaryFromCode(content: string): string {
    // Look for JSDoc comments
    const jsdocMatch = content.match(/\/\*\*\s*\n\s*\*\s*(.+?)\s*\n/);
    if (jsdocMatch) {
      return jsdocMatch[1].trim();
    }

    // Look for function names
    const functionMatch = content.match(/export\s+(?:async\s+)?function\s+(\w+)/);
    if (functionMatch) {
      return functionMatch[1].replace(/([A-Z])/g, ' $1').trim();
    }

    return '';
  }

  /**
   * Extract description from code
   */
  private extractDescriptionFromCode(content: string): string {
    // Look for multi-line JSDoc comments
    const jsdocMatch = content.match(/\/\*\*([\s\S]*?)\*\//);
    if (jsdocMatch) {
      return jsdocMatch[1]
        .replace(/\*\s*/g, '')
        .replace(/\n\s*\n/g, '\n')
        .trim();
    }

    return '';
  }

  /**
   * Extract tags from code
   */
  private extractTagsFromCode(content: string): string[] {
    const tags: string[] = [];
    
    // Look for @tag annotations
    const tagMatches = content.match(/@tag\s+(\w+)/g);
    if (tagMatches) {
      tagMatches.forEach(match => {
        const tag = match.replace('@tag ', '');
        if (!tags.includes(tag)) {
          tags.push(tag);
        }
      });
    }

    return tags;
  }

  /**
   * Get status code description
   */
  private getStatusDescription(status: number): string {
    const descriptions: Record<number, string> = {
      200: 'OK',
      201: 'Created',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      500: 'Internal Server Error'
    };

    return descriptions[status] || 'Unknown';
  }

  /**
   * Discover deployed endpoints
   */
  private async discoverDeployedEndpoints(): Promise<APIContract[]> {
    // In a real implementation, this would:
    // - Query the deployed API
    // - Use API discovery tools
    // - Check API documentation endpoints
    
    // For now, return empty array as this requires actual API access
    console.log('⚠️  Endpoint discovery not implemented - requires deployed API access');
    return [];
  }

  /**
   * Compare API contracts
   */
  private async compareContracts(
    specContracts: APIContract[],
    deployedEndpoints: APIContract[]
  ): Promise<ContractComparison[]> {
    const comparisons: ContractComparison[] = [];

    // Create maps for easier comparison
    const specMap = new Map<string, APIContract>();
    const deployedMap = new Map<string, APIContract>();

    specContracts.forEach(contract => {
      const key = `${contract.method}:${contract.path}`;
      specMap.set(key, contract);
    });

    deployedEndpoints.forEach(contract => {
      const key = `${contract.method}:${contract.path}`;
      deployedMap.set(key, contract);
    });

    // Find added endpoints
    for (const [key, contract] of specMap) {
      if (!deployedMap.has(key)) {
        comparisons.push({
          endpoint: contract.path,
          method: contract.method,
          status: 'added',
          changes: [{
            type: 'endpoint',
            field: 'endpoint',
            new_value: contract,
            description: `New endpoint ${contract.method} ${contract.path} added`
          }],
          severity: 'info'
        });
      }
    }

    // Find removed endpoints
    for (const [key, contract] of deployedMap) {
      if (!specMap.has(key)) {
        comparisons.push({
          endpoint: contract.path,
          method: contract.method,
          status: 'removed',
          changes: [{
            type: 'endpoint',
            field: 'endpoint',
            old_value: contract,
            description: `Endpoint ${contract.method} ${contract.path} removed`
          }],
          severity: 'breaking'
        });
      }
    }

    // Find modified endpoints
    for (const [key, specContract] of specMap) {
      const deployedContract = deployedMap.get(key);
      if (deployedContract) {
        const changes = this.compareEndpointDetails(specContract, deployedContract);
        if (changes.length > 0) {
          const hasBreakingChanges = changes.some(c => c.type === 'parameter' && c.field.includes('required'));
          
          comparisons.push({
            endpoint: specContract.path,
            method: specContract.method,
            status: 'modified',
            changes,
            severity: hasBreakingChanges ? 'breaking' : 'non-breaking'
          });
        }
      }
    }

    return comparisons;
  }

  /**
   * Compare endpoint details
   */
  private compareEndpointDetails(spec: APIContract, deployed: APIContract): ContractChange[] {
    const changes: ContractChange[] = [];

    // Compare parameters
    const specParams = new Map(spec.parameters.map(p => [p.name, p]));
    const deployedParams = new Map(deployed.parameters.map(p => [p.name, p]));

    // Check for added parameters
    for (const [name, param] of specParams) {
      if (!deployedParams.has(name)) {
        changes.push({
          type: 'parameter',
          field: `parameter.${name}`,
          new_value: param,
          description: `Parameter ${name} added`
        });
      } else {
        const deployedParam = deployedParams.get(name)!;
        if (param.required !== deployedParam.required) {
          changes.push({
            type: 'parameter',
            field: `parameter.${name}.required`,
            old_value: deployedParam.required,
            new_value: param.required,
            description: `Parameter ${name} required status changed from ${deployedParam.required} to ${param.required}`
          });
        }
      }
    }

    // Check for removed parameters
    for (const [name, param] of deployedParams) {
      if (!specParams.has(name)) {
        changes.push({
          type: 'parameter',
          field: `parameter.${name}`,
          old_value: param,
          description: `Parameter ${name} removed`
        });
      }
    }

    // Compare responses
    const specResponses = new Map(spec.responses.map(r => [r.status, r]));
    const deployedResponses = new Map(deployed.responses.map(r => [r.status, r]));

    for (const [status, response] of specResponses) {
      if (!deployedResponses.has(status)) {
        changes.push({
          type: 'response',
          field: `response.${status}`,
          new_value: response,
          description: `Response ${status} added`
        });
      }
    }

    for (const [status, response] of deployedResponses) {
      if (!specResponses.has(status)) {
        changes.push({
          type: 'response',
          field: `response.${status}`,
          old_value: response,
          description: `Response ${status} removed`
        });
      }
    }

    return changes;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(comparisons: ContractComparison[]): string[] {
    const recommendations: string[] = [];
    const breakingChanges = comparisons.filter(c => c.severity === 'breaking');

    if (breakingChanges.length > 0) {
      recommendations.push('Immediate action required: Fix breaking API changes');
      recommendations.push('Update API documentation to reflect changes');
      recommendations.push('Notify API consumers about breaking changes');
    }

    const addedEndpoints = comparisons.filter(c => c.status === 'added');
    if (addedEndpoints.length > 0) {
      recommendations.push('Update API documentation with new endpoints');
    }

    const removedEndpoints = comparisons.filter(c => c.status === 'removed');
    if (removedEndpoints.length > 0) {
      recommendations.push('Consider deprecation period before removing endpoints');
    }

    return recommendations;
  }

  /**
   * Store contract report
   */
  private async storeReport(report: ContractReport) {
    // In a real implementation, this would store in a database
    console.log('📊 Contract report generated:', {
      total_endpoints: report.total_endpoints,
      breaking_changes: report.breaking_changes,
      modified_endpoints: report.modified_endpoints
    });
  }

  /**
   * Create GitHub issue for contract violations
   */
  private async createContractIssue(report: ContractReport) {
    const issue = {
      title: `🚨 API Contract Violations Detected (${report.breaking_changes} breaking changes)`,
      body: this.generateContractIssueBody(report),
      labels: ['api', 'contract', 'breaking-change', 'automated']
    };

    try {
      const { data } = await this.octokit.rest.issues.create({
        owner: process.env.GITHUB_OWNER || 'your-org',
        repo: process.env.GITHUB_REPO || 'whats-for-dinner-monorepo',
        title: issue.title,
        body: issue.body,
        labels: issue.labels
      });

      console.log(`✅ Contract issue created: ${data.html_url}`);
    } catch (error) {
      console.error('Failed to create contract issue:', error);
    }
  }

  /**
   * Generate GitHub issue body for contract violations
   */
  private generateContractIssueBody(report: ContractReport): string {
    const breakingChanges = report.comparisons.filter(c => c.severity === 'breaking');
    
    return `
## 🚨 API Contract Violations Report

**Timestamp:** ${report.timestamp}  
**Total Endpoints:** ${report.total_endpoints}  
**Breaking Changes:** ${report.breaking_changes}  
**Modified Endpoints:** ${report.modified_endpoints}  
**Added Endpoints:** ${report.added_endpoints}  
**Removed Endpoints:** ${report.removed_endpoints}

### ❌ Breaking Changes

${breakingChanges.map(change => `
#### ${change.method} ${change.endpoint}
${change.changes.map(c => `- **${c.type}:** ${c.description}`).join('\n')}
`).join('\n')}

### 📋 Recommendations

${report.recommendations.map(rec => `- ${rec}`).join('\n')}

### 🔧 Next Steps

1. Review breaking changes and assess impact
2. Update API documentation
3. Notify API consumers
4. Implement versioning strategy if needed

---
*This report was automatically generated by the API Contract Watcher.*
    `.trim();
  }

  /**
   * Run nightly contract check
   */
  async runNightlyCheck() {
    console.log('🌙 Running nightly API contract check...');
    
    try {
      const report = await this.validateAPIContracts();
      
      console.log(`✅ Nightly check completed: ${report.total_endpoints} endpoints checked`);
      
      if (report.breaking_changes > 0) {
        console.log(`❌ ${report.breaking_changes} breaking changes found`);
      }
      
      if (report.modified_endpoints > 0) {
        console.log(`⚠️  ${report.modified_endpoints} endpoints modified`);
      }
    } catch (error) {
      console.error('Nightly contract check failed:', error);
    }
  }
}

export default APIContractWatcher;