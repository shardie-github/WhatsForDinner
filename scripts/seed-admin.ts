/**
 * Seed Default Admin User
 * 
 * Usage: npx tsx scripts/seed-admin.ts --email admin@nomad.app --role superadmin
 */

import { parseArgs } from 'util';
import { db } from '../packages/server/src/db/index.js';
import { adminUsers } from '../packages/server/src/db/schema.js';
import { eq } from 'drizzle-orm';
import { mintAdminToken } from '../packages/server/src/auth/admin.js';
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('seed-admin-ts');
const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    email: { type: 'string' },
    role: { type: 'string' },
  },
});

async function seedAdmin() {
  if (!values.email) {
    logger.error('Error: --email is required');
    process.exit(1);
  }

  const role = (values.role as any) || 'superadmin';
  const validRoles = ['superadmin', 'finance', 'reviewer', 'support'];
  
  if (!validRoles.includes(role)) {
    logger.error('Error: Invalid role. Must be one of: ' + validRoles.join(', '));
    process.exit(1);
  }

  // Check if admin exists
  const [existing] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, values.email))
    .limit(1);

  if (existing) {
            
    // Generate token
    const token = await mintAdminToken(existing.id);
            return;
  }

  // Create new admin
  const [admin] = await db
    .insert(adminUsers)
    .values({
      email: values.email,
      role: role as any,
      status: 'active',
    })
    .returning();

        
  // Generate token
  const token = await mintAdminToken(admin.id);
              }

seedAdmin().catch((error) => {
  logger.error('Error seeding admin:', { error });
  process.exit(1);
});
