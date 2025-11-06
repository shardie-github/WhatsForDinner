#!/usr/bin/env node
/**
 * Nomad Grand Continuity Audit - Report Generator
 * Creates comprehensive continuity report from inventory and connectivity data
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

async function generateReport() {
  console.log('?? Generating Nomad Continuity Report...\n');
  
  // Load inventory and connectivity data
  const inventoryPath = join(ROOT, 'reports/inventory/coverage.json');
  const connectivityPath = join(ROOT, 'reports/connectivity/heatmap.json');
  
  const inventory = JSON.parse(readFileSync(inventoryPath, 'utf-8'));
  const connectivity = JSON.parse(readFileSync(connectivityPath, 'utf-8'));
  
  // Calculate metrics
  const totalApps = Object.keys(inventory.apps).length;
  const totalPackages = Object.keys(inventory.packages).length;
  const totalJobs = Object.keys(inventory.jobs).length;
  const registeredJobs = Object.values(inventory.jobs).filter(j => j.registered).length;
  const totalRoutes = Object.keys(inventory.routes).length;
  const routesWithAuth = Object.values(inventory.routes).filter(r => r.hasAuth).length;
  const routesWithValidation = Object.values(inventory.routes).filter(r => r.hasValidation).length;
  const testCoverage = Math.round((inventory.coverage.tested / (inventory.coverage.tested + inventory.coverage.untested)) * 100) || 0;
  
  const overallHealth = connectivity.health.overall || 0;
  const healthySubsystems = connectivity.health.healthyCount || 0;
  const totalSubsystems = connectivity.health.totalCount || 0;
  
  // Generate markdown report
  const report = `# Nomad Grand Continuity & Completion Audit Report

**Generated:** ${new Date().toISOString()}
**Audit Scope:** Complete system review across all layers, workflows, artifacts, and dependencies

---

## Executive Summary

### Overall Health Score: ${overallHealth}%

**System Status:**
- ? **Healthy Subsystems:** ${healthySubsystems}/${totalSubsystems}
- ?? **Components:** ${totalApps} apps, ${totalPackages} packages, ${totalJobs} jobs
- ??? **API Routes:** ${totalRoutes} total (${routesWithAuth} with auth, ${routesWithValidation} with validation)
- ?? **Test Coverage:** ${testCoverage}%
- ?? **Job Registration:** ${registeredJobs}/${totalJobs} jobs registered in queue

---

## 1. Architecture Continuity

### Component Inventory
- **Apps:** ${totalApps}
  ${Object.keys(inventory.apps).map(a => `  - \`${a}\` (${inventory.apps[a].dependencies.length} deps)`).join('\n')}

- **Packages:** ${totalPackages}
  ${Object.keys(inventory.packages).map(p => `  - \`${p}\` (${inventory.packages[p].dependencies.length} deps)`).join('\n')}

### TypeScript Configuration
${Object.values(inventory.apps).filter(a => a.hasTypeScript).length}/${totalApps} apps have TypeScript configuration

---

## 2. Data & API Layer

### Database Schema
- **Migrations:** ${inventory.database.migrations.length}
- **Table Files:** ${inventory.database.tables.length}
- **RLS Policies:** Found in ${inventory.database.rls.length} files

### API Routes
- **Total Routes:** ${totalRoutes}
- **Routes with Authentication:** ${routesWithAuth} (${Math.round(routesWithAuth/totalRoutes*100)}%)
- **Routes with Validation:** ${routesWithValidation} (${Math.round(routesWithValidation/totalRoutes*100)}%)

### Key Routes:
${Object.entries(inventory.routes).slice(0, 20).map(([path, info]) => 
  `- \`${path}\` [${info.method}] ${info.hasAuth ? '??' : '??'} ${info.hasValidation ? '?' : ''}`
).join('\n')}
${Object.keys(inventory.routes).length > 20 ? `\n... and ${Object.keys(inventory.routes).length - 20} more routes` : ''}

---

## 3. Jobs & Automation

### Job Inventory
Total Jobs: **${totalJobs}**
Registered in Queue: **${registeredJobs}**

${Object.entries(inventory.jobs).map(([name, job]) => `
#### \`${name}\`
- **Registered:** ${job.registered ? '?' : '?'}
- **Error Handling:** ${job.hasErrorHandling ? '?' : '??'}
- **Logging:** ${job.hasLogging ? '?' : '??'}
- **Metrics:** ${job.hasMetrics ? '?' : '??'}
`).join('')}

### Missing Queue Registrations
${Object.entries(inventory.jobs).filter(([_, job]) => !job.registered).map(([name]) => `- ? \`${name}\` - Not registered in queue`).join('\n') || '? All jobs registered'}

---

## 4. Cross-Service Connectivity

### Connectivity Heatmap

| Subsystem | Health | Score | Status |
|-----------|--------|-------|--------|
${Object.entries(connectivity.subsystems).map(([name, sys]) => 
  `| ${name} | ${sys.healthy ? '? Healthy' : '?? Needs Attention'} | ${sys.score}% | ${sys.healthy ? '??' : '??'}|`
).join('\n')}

### Critical Connections

#### ? Healthy Connections
${connectivity.connections.filter(c => c.connected).map(c => 
  `- **${c.from}** ? **${c.to}** (${c.health}%)`
).join('\n') || '- None detected'}

#### ?? Weak Connections (Health < 50%)
${connectivity.connections.filter(c => !c.connected && c.health < 50).slice(0, 10).map(c => 
  `- **${c.from}** ? **${c.to}** (${c.health}%) - Needs improvement`
).join('\n') || '- None'}

---

## 5. Integration Status

### Third-Party Integrations

| Integration | Configured | Status |
|-------------|------------|--------|
| Supabase | ${inventory.integrations.supabase.configured ? '?' : '?'} | ${inventory.integrations.supabase.configured ? 'Active' : 'Missing'} |
| Stripe | ${inventory.integrations.stripe.configured ? '?' : '?'} | ${inventory.integrations.stripe.configured ? 'Active' : 'Missing'} |
| Redis/BullMQ | ${inventory.integrations.bullmq.configured ? '?' : '?'} | ${inventory.integrations.bullmq.configured ? 'Active' : 'Missing'} |
| PostHog | ${inventory.integrations.posthog.configured ? '?' : '?'} | ${inventory.integrations.posthog.configured ? 'Active' : 'Missing'} |

---

## 6. Test Coverage

### Coverage Metrics
- **Test Files:** ${inventory.coverage.testFiles.length}
- **Tested Files:** ${inventory.coverage.tested}
- **Untested Files:** ${inventory.coverage.untested}
- **Coverage:** **${testCoverage}%** ${testCoverage >= 80 ? '?' : testCoverage >= 50 ? '??' : '?'}

${testCoverage < 80 ? `
### ?? Coverage Gap Analysis
Current coverage is below the recommended 80% threshold. Priority areas for test coverage:
- Core business logic
- API route handlers
- Job processors
- Critical user flows
` : ''}

---

## 7. Identified Issues & Recommendations

### Critical Issues

${connectivity.failures.map(f => `
#### ? ${f.subsystem}
**Missing Components:**
${f.missing.map(m => `- ${m}`).join('\n')}
`).join('\n') || '? No critical issues detected'}

### Warnings

${connectivity.warnings.map(w => `
#### ?? ${w.subsystem}
**Missing Components:**
${w.missing.map(m => `- ${m}`).join('\n')}
`).join('\n') || '? No warnings'}

### Recommendations

1. **Job Registration:** Register all jobs in the queue system
   - ${Object.entries(inventory.jobs).filter(([_, j]) => !j.registered).map(([name]) => `  - Add \`${name}\` to queue registration`).join('\n') || '  - ? All jobs registered'}

2. **API Security:** Improve authentication coverage
   - Current: ${routesWithAuth}/${totalRoutes} routes have auth
   - Target: ${Math.ceil(totalRoutes * 0.9)}/${totalRoutes} routes (90%)

3. **Test Coverage:** Increase test coverage to 80%+
   - Current: ${testCoverage}%
   - Target: 80%+

4. **Integration Connectivity:** Improve subsystem health scores
   - Current Average: ${overallHealth}%
   - Target: 85%+

---

## 8. Metrics Before/After

### Before Audit
- Connectivity Health: **Not measured**
- Job Registration: **Unknown**
- Test Coverage: **Unknown**

### After Audit
- Connectivity Health: **${overallHealth}%** ${overallHealth >= 85 ? '?' : '??'}
- Job Registration: **${Math.round(registeredJobs/totalJobs*100)}%** ${registeredJobs === totalJobs ? '?' : '??'}
- Test Coverage: **${testCoverage}%** ${testCoverage >= 80 ? '?' : '??'}

---

## 9. Next 90-Day Optimization Roadmap

### Phase 1: Critical Fixes (Weeks 1-2)
- [ ] Register all unregistered jobs in queue system
- [ ] Improve API route authentication coverage to 90%+
- [ ] Fix critical connectivity failures
- [ ] Implement missing integration components

### Phase 2: Quality Improvements (Weeks 3-6)
- [ ] Increase test coverage to 80%+
- [ ] Add error handling to all job processors
- [ ] Implement comprehensive logging and metrics
- [ ] Improve API validation coverage

### Phase 3: Optimization (Weeks 7-12)
- [ ] Optimize subsystem connectivity scores to 85%+
- [ ] Implement comprehensive monitoring and alerting
- [ ] Performance optimization pass
- [ ] Documentation completion

---

## 10. System Diagram

\`\`\`mermaid
graph TB
    subgraph "Frontend"
        WEB[Web App]
        MOBILE[Mobile App]
    end
    
    subgraph "Backend"
        API[API Routes]
        SERVER[Server Package]
        QUEUE[Job Queue]
    end
    
    subgraph "Services"
        DB[(Database)]
        REDIS[(Redis)]
        SUPABASE[Supabase]
        STRIPE[Stripe]
    end
    
    WEB --> API
    MOBILE --> API
    API --> SERVER
    SERVER --> DB
    SERVER --> QUEUE
    QUEUE --> REDIS
    SERVER --> SUPABASE
    SERVER --> STRIPE
\`\`\`

---

## Appendices

### A. Full Component List
See \`reports/inventory/coverage.json\` for complete component inventory.

### B. Connectivity Matrix
See \`reports/connectivity/heatmap.json\` for detailed connectivity matrix.

### C. Test Files
${inventory.coverage.testFiles.length} test files identified:
${inventory.coverage.testFiles.slice(0, 20).map(f => `- \`${f}\``).join('\n')}
${inventory.coverage.testFiles.length > 20 ? `\n... and ${inventory.coverage.testFiles.length - 20} more` : ''}

---

**Report Generated:** ${new Date().toISOString()}
**Audit Version:** 1.0
**Next Audit:** Schedule in 90 days
`;

  // Write report
  const outputPath = join(ROOT, 'docs/PROJECT_CONTINUITY_REPORT.md');
  writeFileSync(outputPath, report, 'utf-8');
  
  console.log(`? Continuity report generated!`);
  console.log(`?? Report written to: ${outputPath}`);
  
  // Print summary
  console.log('\n?? Summary:');
  console.log(`  Overall Health: ${overallHealth}%`);
  console.log(`  Job Registration: ${Math.round(registeredJobs/totalJobs*100)}%`);
  console.log(`  Test Coverage: ${testCoverage}%`);
  console.log(`  Critical Issues: ${connectivity.failures.length}`);
  console.log(`  Warnings: ${connectivity.warnings.length}`);
}

generateReport().catch(console.error);
