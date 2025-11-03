/**
 * Verify Audit Log Signatures
 * 
 * Usage: npx tsx scripts/verify-audit.ts
 */

import { verifyAllAuditLogs } from '../packages/server/src/audit/index.js';

async function main() {
  console.log('?? Verifying audit log signatures...\n');

  const result = await verifyAllAuditLogs();

  console.log(`Total logs: ${result.total}`);
  console.log(`? Valid: ${result.valid}`);
  console.log(`? Invalid: ${result.invalid}`);

  if (result.invalid > 0) {
    console.log(`\n??  WARNING: ${result.invalid} audit logs have invalid signatures!`);
    console.log('First 10 invalid IDs:');
    result.invalidIds.slice(0, 10).forEach((id) => console.log(`  - ${id}`));
    process.exit(1);
  } else {
    console.log('\n? All audit logs are valid. No tampering detected.');
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('Error verifying audit logs:', error);
  process.exit(1);
});
