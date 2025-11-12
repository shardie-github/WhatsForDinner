/**
 * Verify Audit Log Signatures
 * 
 * Usage: npx tsx scripts/verify-audit.ts
 */

import { verifyAllAuditLogs } from '../packages/server/src/audit/index.js';

async function main() {
  
  const result = await verifyAllAuditLogs();

      
  if (result.invalid > 0) {
            result.invalidIds.slice(0, 10).forEach((id) => );
    process.exit(1);
  } else {
        process.exit(0);
  }
}

main().catch((error) => {
  console.error('Error verifying audit logs:', error);
  process.exit(1);
});
