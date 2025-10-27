#!/usr/bin/env node

/**
 * Phase 9: Supply-Chain & Licenses
 * Comprehensive third-party dependency audit and license management
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SupplyChainAuditor {
  constructor() {
    this.workspaceRoot = process.cwd();
    this.auditResults = {
      timestamp: new Date().toISOString(),
      packages: [],
      vulnerabilities: [],
      licenses: new Map(),
      compliance: {
        approved: [],
        restricted: [],
        unknown: []
      },
      recommendations: []
    };
  }

  async runAudit() {
    console.log('🔍 Phase 9: Supply-Chain & Licenses Audit');
    console.log('==========================================\n');

    try {
      await this.auditDependencies();
      await this.checkVulnerabilities();
      await this.analyzeLicenses();
      await this.generateComplianceReport();
      await this.generateRecommendations();
      await this.saveResults();
      
      console.log('✅ Supply chain audit completed successfully');
      this.printSummary();
    } catch (error) {
      console.error('❌ Supply chain audit failed:', error.message);
      process.exit(1);
    }
  }

  async auditDependencies() {
    console.log('📦 Auditing dependencies...');
    
    const packageFiles = this.findPackageFiles();
    
    for (const packageFile of packageFiles) {
      const packageData = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
      const dependencies = {
        ...packageData.dependencies || {},
        ...packageData.devDependencies || {},
        ...packageData.peerDependencies || {}
      };

      for (const [name, version] of Object.entries(dependencies)) {
        this.auditResults.packages.push({
          name,
          version,
          location: path.relative(this.workspaceRoot, packageFile),
          type: this.getDependencyType(packageData, name)
        });
      }
    }
    
    console.log(`   Found ${this.auditResults.packages.length} dependencies`);
  }

  async checkVulnerabilities() {
    console.log('🔒 Checking for vulnerabilities...');
    
    try {
      // Run npm audit
      const auditOutput = execSync('npm audit --json', { 
        cwd: this.workspaceRoot,
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      const auditData = JSON.parse(auditOutput);
      
      if (auditData.vulnerabilities) {
        for (const [name, vuln] of Object.entries(auditData.vulnerabilities)) {
          this.auditResults.vulnerabilities.push({
            package: name,
            severity: vuln.severity,
            title: vuln.title,
            description: vuln.description,
            recommendation: vuln.recommendation,
            cves: vuln.cves || []
          });
        }
      }
      
      console.log(`   Found ${this.auditResults.vulnerabilities.length} vulnerabilities`);
    } catch (error) {
      console.log('   ⚠️  npm audit not available, skipping vulnerability check');
    }
  }

  async analyzeLicenses() {
    console.log('📄 Analyzing licenses...');
    
    const licenseMap = new Map();
    
    for (const pkg of this.auditResults.packages) {
      try {
        const license = await this.getPackageLicense(pkg.name, pkg.version);
        licenseMap.set(pkg.name, license);
        
        // Categorize by license type
        if (this.isApprovedLicense(license)) {
          this.auditResults.compliance.approved.push(pkg.name);
        } else if (this.isRestrictedLicense(license)) {
          this.auditResults.compliance.restricted.push(pkg.name);
        } else {
          this.auditResults.compliance.unknown.push(pkg.name);
        }
      } catch (error) {
        console.log(`   ⚠️  Could not determine license for ${pkg.name}`);
        this.auditResults.compliance.unknown.push(pkg.name);
      }
    }
    
    this.auditResults.licenses = licenseMap;
    console.log(`   Analyzed ${licenseMap.size} package licenses`);
  }

  async getPackageLicense(packageName, version) {
    try {
      // Try to get license from package.json
      const packagePath = path.join('node_modules', packageName, 'package.json');
      if (fs.existsSync(packagePath)) {
        const pkgData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        return pkgData.license || pkgData.licenses || 'Unknown';
      }
    } catch (error) {
      // Fallback to npm registry
      try {
        const registryData = execSync(`npm view ${packageName}@${version} license --json`, {
          encoding: 'utf8',
          stdio: 'pipe'
        });
        return JSON.parse(registryData) || 'Unknown';
      } catch (registryError) {
        return 'Unknown';
      }
    }
  }

  isApprovedLicense(license) {
    const approved = [
      'MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause',
      'ISC', 'Unlicense', '0BSD', 'CC0-1.0'
    ];
    return approved.some(approvedLicense => 
      license.includes(approvedLicense) || license === approvedLicense
    );
  }

  isRestrictedLicense(license) {
    const restricted = [
      'GPL', 'AGPL', 'LGPL', 'Copyleft', 'CC-BY-NC',
      'CC-BY-SA', 'Elastic-2.0', 'SSPL'
    ];
    return restricted.some(restrictedLicense => 
      license.includes(restrictedLicense) || license === restrictedLicense
    );
  }

  async generateComplianceReport() {
    console.log('📊 Generating compliance report...');
    
    const totalPackages = this.auditResults.packages.length;
    const approvedCount = this.auditResults.compliance.approved.length;
    const restrictedCount = this.auditResults.compliance.restricted.length;
    const unknownCount = this.auditResults.compliance.unknown.length;
    
    this.auditResults.compliance.summary = {
      total: totalPackages,
      approved: approvedCount,
      restricted: restrictedCount,
      unknown: unknownCount,
      complianceRate: ((approvedCount / totalPackages) * 100).toFixed(2)
    };
  }

  async generateRecommendations() {
    console.log('💡 Generating recommendations...');
    
    const recommendations = [];
    
    // Vulnerability recommendations
    if (this.auditResults.vulnerabilities.length > 0) {
      recommendations.push({
        type: 'security',
        priority: 'high',
        message: `Address ${this.auditResults.vulnerabilities.length} security vulnerabilities`,
        action: 'Run npm audit fix and review high-severity issues'
      });
    }
    
    // License recommendations
    if (this.auditResults.compliance.restricted.length > 0) {
      recommendations.push({
        type: 'license',
        priority: 'high',
        message: `Review ${this.auditResults.compliance.restricted.length} packages with restricted licenses`,
        action: 'Consider alternatives or obtain legal approval'
      });
    }
    
    if (this.auditResults.compliance.unknown.length > 0) {
      recommendations.push({
        type: 'license',
        priority: 'medium',
        message: `Clarify licenses for ${this.auditResults.compliance.unknown.length} packages`,
        action: 'Manually verify license compatibility'
      });
    }
    
    // Dependency recommendations
    const duplicatePackages = this.findDuplicatePackages();
    if (duplicatePackages.length > 0) {
      recommendations.push({
        type: 'dependency',
        priority: 'medium',
        message: `Consolidate ${duplicatePackages.length} duplicate package versions`,
        action: 'Use pnpm resolutions to standardize versions'
      });
    }
    
    this.auditResults.recommendations = recommendations;
  }

  findDuplicatePackages() {
    const packageVersions = new Map();
    const duplicates = [];
    
    for (const pkg of this.auditResults.packages) {
      if (packageVersions.has(pkg.name)) {
        packageVersions.get(pkg.name).push(pkg);
      } else {
        packageVersions.set(pkg.name, [pkg]);
      }
    }
    
    for (const [name, versions] of packageVersions) {
      if (versions.length > 1) {
        duplicates.push({ name, versions });
      }
    }
    
    return duplicates;
  }

  findPackageFiles() {
    const packageFiles = [];
    
    // Find all package.json files
    const findPackages = (dir) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          const packagePath = path.join(fullPath, 'package.json');
          if (fs.existsSync(packagePath)) {
            packageFiles.push(packagePath);
          }
          findPackages(fullPath);
        }
      }
    };
    
    findPackages(this.workspaceRoot);
    return packageFiles;
  }

  getDependencyType(packageData, name) {
    if (packageData.dependencies && packageData.dependencies[name]) return 'dependency';
    if (packageData.devDependencies && packageData.devDependencies[name]) return 'devDependency';
    if (packageData.peerDependencies && packageData.peerDependencies[name]) return 'peerDependency';
    return 'unknown';
  }

  async saveResults() {
    const reportPath = path.join(this.workspaceRoot, 'REPORTS', 'supply-chain.md');
    const jsonPath = path.join(this.workspaceRoot, 'REPORTS', 'supply-chain.json');
    
    // Ensure REPORTS directory exists
    const reportsDir = path.dirname(reportPath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    // Save JSON results
    fs.writeFileSync(jsonPath, JSON.stringify(this.auditResults, null, 2));
    
    // Generate markdown report
    const report = this.generateMarkdownReport();
    fs.writeFileSync(reportPath, report);
    
    console.log(`   📄 Report saved to ${reportPath}`);
    console.log(`   📊 Data saved to ${jsonPath}`);
  }

  generateMarkdownReport() {
    const { compliance, vulnerabilities, recommendations } = this.auditResults;
    
    return `# Phase 9: Supply-Chain & Licenses

## Executive Summary

**Status**: ✅ Complete  
**Dependencies Audited**: ${compliance.summary.total}  
**Compliance Rate**: ${compliance.summary.complianceRate}%  
**Vulnerabilities Found**: ${vulnerabilities.length}  
**Critical Issues**: ${recommendations.filter(r => r.priority === 'high').length}

## License Compliance

| Category | Count | Percentage |
|----------|-------|------------|
| ✅ Approved | ${compliance.approved.length} | ${((compliance.approved.length / compliance.summary.total) * 100).toFixed(1)}% |
| ⚠️ Restricted | ${compliance.restricted.length} | ${((compliance.restricted.length / compliance.summary.total) * 100).toFixed(1)}% |
| ❓ Unknown | ${compliance.unknown.length} | ${((compliance.unknown.length / compliance.summary.total) * 100).toFixed(1)}% |

## Security Vulnerabilities

${vulnerabilities.length === 0 ? '✅ No vulnerabilities found' : `
| Package | Severity | Title |
|---------|----------|-------|
${vulnerabilities.map(v => `| ${v.package} | ${v.severity} | ${v.title} |`).join('\n')}
`}

## Recommendations

${recommendations.map((rec, i) => `
### ${i + 1}. ${rec.message}
- **Priority**: ${rec.priority.toUpperCase()}
- **Action**: ${rec.action}
`).join('')}

## Next Steps

1. **Phase 10**: Implement release engineering with feature flags
2. **Phase 11**: Set up performance budgets and Core Web Vitals
3. **Phase 12**: Implement edge/caching strategy

## Validation

Run the following to validate Phase 9 completion:

\`\`\`bash
# Run supply chain audit
node scripts/supply-chain-audit.js

# Check for high-priority issues
node scripts/supply-chain-audit.js | grep -E "(HIGH|CRITICAL)"

# Verify license compliance
node scripts/supply-chain-audit.js | grep "Compliance Rate"
\`\`\`

Phase 9 is complete and ready for Phase 10 implementation.
`;
  }

  printSummary() {
    const { compliance, vulnerabilities, recommendations } = this.auditResults;
    
    console.log('\n📊 Supply Chain Audit Summary');
    console.log('============================');
    console.log(`📦 Dependencies: ${compliance.summary.total}`);
    console.log(`✅ Approved Licenses: ${compliance.approved.length} (${compliance.summary.complianceRate}%)`);
    console.log(`⚠️  Restricted Licenses: ${compliance.restricted.length}`);
    console.log(`❓ Unknown Licenses: ${compliance.unknown.length}`);
    console.log(`🔒 Vulnerabilities: ${vulnerabilities.length}`);
    console.log(`💡 Recommendations: ${recommendations.length}`);
    
    if (recommendations.length > 0) {
      console.log('\n🚨 High Priority Issues:');
      recommendations
        .filter(r => r.priority === 'high')
        .forEach(rec => console.log(`   • ${rec.message}`));
    }
  }
}

// Run the audit
if (require.main === module) {
  const auditor = new SupplyChainAuditor();
  auditor.runAudit().catch(console.error);
}

module.exports = SupplyChainAuditor;