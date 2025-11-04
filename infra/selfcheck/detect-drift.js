#!/usr/bin/env node
/**
 * Detects architectural drift by comparing current state to expected architecture
 * Compares against system intelligence map and guardrails
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACE_ROOT = path.resolve(__dirname, '../..');
const SYSTEM_MAP = path.join(WORKSPACE_ROOT, 'src/observability/system_intelligence_map.json');
const GUARDRAILS = path.join(WORKSPACE_ROOT, 'infra/selfcheck/guardrails.yaml');

function detectDrift() {
  console.log('🔍 Detecting architectural drift...');
  
  const drift = [];
  
  // Check if system intelligence map exists
  if (!fs.existsSync(SYSTEM_MAP)) {
    console.error('❌ System intelligence map not found');
    drift.push({
      type: 'missing_map',
      severity: 'high',
      message: 'System intelligence map not found - architectural intent unclear'
    });
    return drift;
  }
  
  // Check if guardrails exist
  if (!fs.existsSync(GUARDRAILS)) {
    console.error('❌ Guardrails file not found');
    drift.push({
      type: 'missing_guardrails',
      severity: 'critical',
      message: 'Guardrails file not found - no architectural enforcement'
    });
    return drift;
  }
  
  // Parse system map
  let systemMap;
  try {
    systemMap = JSON.parse(fs.readFileSync(SYSTEM_MAP, 'utf8'));
  } catch (error) {
    console.error('❌ Failed to parse system intelligence map:', error.message);
    drift.push({
      type: 'invalid_map',
      severity: 'high',
      message: `System intelligence map is invalid: ${error.message}`
    });
    return drift;
  }
  
  // Check for modules that exist in map but not in filesystem
  if (systemMap.modules) {
    for (const [moduleId, module] of Object.entries(systemMap.modules)) {
      if (module.path) {
        const modulePath = path.join(WORKSPACE_ROOT, module.path);
        if (!fs.existsSync(modulePath)) {
          console.warn(`⚠️  Module ${moduleId} mapped to ${module.path} but path doesn't exist`);
          drift.push({
            type: 'module_path_mismatch',
            severity: 'medium',
            message: `Module ${moduleId} path ${module.path} doesn't exist`,
            module: moduleId
          });
        }
      }
    }
  }
  
  // Check for critical modules that should exist
  const criticalModules = [
    'packages/server/src/queue',
    'packages/server/src/db',
    'apps/web/src/app/api'
  ];
  
  for (const modulePath of criticalModules) {
    const fullPath = path.join(WORKSPACE_ROOT, modulePath);
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ Critical module missing: ${modulePath}`);
      drift.push({
        type: 'critical_module_missing',
        severity: 'critical',
        message: `Critical module ${modulePath} is missing`,
        module: modulePath
      });
    }
  }
  
  // Check guardrails are being enforced
  try {
    const guardrailsContent = fs.readFileSync(GUARDRAILS, 'utf8');
    const guardrailCount = (guardrailsContent.match(/- name:/g) || []).length;
    console.log(`📊 Found ${guardrailCount} guardrails defined`);
    
    if (guardrailCount === 0) {
      drift.push({
        type: 'no_guardrails',
        severity: 'critical',
        message: 'No guardrails defined - architectural enforcement disabled'
      });
    }
  } catch (error) {
    console.error('❌ Failed to read guardrails:', error.message);
  }
  
  // Check for architectural intent status
  if (systemMap.architectural_intent) {
    for (const [intent, status] of Object.entries(systemMap.architectural_intent)) {
      if (status.status === 'planned' && status.remaining_work && status.remaining_work.length > 0) {
        console.log(`📋 Intent "${intent}" is planned with ${status.remaining_work.length} items remaining`);
        // This is informational, not drift
      }
    }
  }
  
  return drift;
}

// Main
try {
  const drift = detectDrift();
  
  if (drift.length === 0) {
    console.log('✅ No architectural drift detected');
    process.exit(0);
  } else {
    console.log(`\n⚠️  Detected ${drift.length} drift issue(s):`);
    drift.forEach((issue, index) => {
      console.log(`\n${index + 1}. [${issue.severity.toUpperCase()}] ${issue.type}`);
      console.log(`   ${issue.message}`);
    });
    
    // Exit with error if critical issues found
    const criticalIssues = drift.filter(d => d.severity === 'critical');
    if (criticalIssues.length > 0) {
      console.error(`\n❌ ${criticalIssues.length} critical drift issue(s) found!`);
      process.exit(1);
    }
    
    // Warning for high/medium issues
    process.exit(0);
  }
} catch (error) {
  console.error('❌ Drift detection failed:', error.message);
  process.exit(1);
}
