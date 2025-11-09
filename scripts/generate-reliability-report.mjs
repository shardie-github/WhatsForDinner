#!/usr/bin/env node
/**
 * Generate reliability markdown report from JSON
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const reliabilityJsonPath = join(projectRoot, 'admin', 'reliability.json');
const reliabilityMdPath = join(projectRoot, 'admin', 'reliability.md');

if (!existsSync(reliabilityJsonPath)) {
  console.error('❌ reliability.json not found. Run agent first.');
  process.exit(1);
}

const reliability = JSON.parse(readFileSync(reliabilityJsonPath, 'utf-8'));

const md = `# Reliability Dashboard

**Last Updated**: ${reliability.timestamp || 'Never'}

## Metrics

- **Uptime**: ${reliability.uptime ? `${(reliability.uptime * 100).toFixed(3)}%` : 'Calculating...'}
- **Latency**: ${reliability.latency ? `${reliability.latency}ms` : 'Calculating...'}
- **Error Rate**: ${reliability.error_rate ? `${(reliability.error_rate * 100).toFixed(2)}%` : 'Calculating...'}
- **Build Time**: ${reliability.build_time ? `${(reliability.build_time / 1000).toFixed(2)}s` : 'Calculating...'}
- **Test Pass Rate**: ${reliability.test_pass_rate ? `${(reliability.test_pass_rate * 100).toFixed(2)}%` : 'Calculating...'}
- **Bundle Size**: ${reliability.bundle_size ? `${(reliability.bundle_size / 1024).toFixed(2)}KB` : 'Calculating...'}

## Status

${reliability.status === 'healthy' ? '✅ System is healthy' : reliability.status === 'degraded' ? '⚠️ System performance degraded' : '🔄 Status unknown'}

## Recommendations

${reliability.recommendations && reliability.recommendations.length > 0 
  ? reliability.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')
  : 'No immediate recommendations.'}

## History

${reliability.history && reliability.history.length > 0
  ? 'See reliability.json for detailed history.'
  : 'No historical data available.'}
`;

writeFileSync(reliabilityMdPath, md);
console.log('✅ Reliability markdown report generated');
