/**
 * Verify Audit Log Signatures
 * 
 * Usage: npx tsx scripts/verify-audit.ts
 */

import { verifyAllAuditLogs } from '../packages/server/src/audit/index.js';
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('verify-audit-ts');
async function main() {
  
  const result = await verifyAllAuditLogs();

  logger.info('Verified ${result.total} audit logs');
  logger.info('Valid: ${result.valid}', { Invalid: ${result.invalid}` });
      
  if (result.invalid > 0) {
    logger.error('\nInvalid audit log IDs:');
    result.invalidIds.slice(0, 10).forEach((id) => logger.error('  - ${id}'));
    process.exit(1);
  } else {
    logger.info('\n✅ All audit logs are valid');
    process.exit(0);
  }
}

main().catch((error) => {
  logger.error('Error verifying audit logs:', { error });
  process.exit(1);
});
