/**
 * Verify Audit Log Signatures
 * 
 * Usage: npx tsx scripts/verify-audit.ts
 */

import { verifyAllAuditLogs } from '../packages/server/src/audit/index.js';

async function main() {
  
  const result = await verifyAllAuditLogs();

  console.log(`Verified ${result.total} audit logs`);
  console.log(`Valid: ${result.valid}, Invalid: ${result.invalid}`);
      
  if (result.invalid > 0) {
    console.error('\nInvalid audit log IDs:');
    result.invalidIds.slice(0, 10).forEach((id) => console.error(`  - ${id}`));
    process.exit(1);
  } else {
    console.log('\n✅ All audit logs are valid');
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('Error verifying audit logs:', error);
  process.exit(1);
});
