/**
 * Guardian Verify Command
 * Verify hash chain integrity
 */

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { Guardian } from '@whats-for-dinner/utils/guardian';

export async function runGuardianVerify(options: { userId?: string }): Promise<void> {
  const logsDir = './guardian/logs';

  if (!fs.existsSync(logsDir)) {
    console.error('❌ Guardian logs directory not found');
    process.exit(1);
  }

  if (options.userId) {
    // Verify specific user
    const guardian = new Guardian(options.userId, logsDir);
    const integrity = guardian.verifyLedgerIntegrity();

    if (integrity.valid) {
          } else {
      console.error(`❌ Ledger integrity failed for user ${options.userId}:`);
      for (const error of integrity.errors) {
        console.error(`  - ${error}`);
      }
      process.exit(1);
    }
  } else {
    // Verify all users
    const files = fs.readdirSync(logsDir).filter(f => f.endsWith('.jsonl'));
    let allValid = true;

    for (const file of files) {
      const userId = file.replace('.jsonl', '');
      const guardian = new Guardian(userId, logsDir);
      const integrity = guardian.verifyLedgerIntegrity();

      if (integrity.valid) {
              } else {
        console.error(`❌ ${userId}: Failed`);
        for (const error of integrity.errors) {
          console.error(`  - ${error}`);
        }
        allValid = false;
      }
    }

    if (!allValid) {
      process.exit(1);
    }
  }
}
