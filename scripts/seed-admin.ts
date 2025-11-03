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

const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    email: { type: 'string' },
    role: { type: 'string' },
  },
});

async function seedAdmin() {
  if (!values.email) {
    console.error('Error: --email is required');
    process.exit(1);
  }

  const role = (values.role as any) || 'superadmin';
  const validRoles = ['superadmin', 'finance', 'reviewer', 'support'];
  
  if (!validRoles.includes(role)) {
    console.error(`Error: Invalid role. Must be one of: ${validRoles.join(', ')}`);
    process.exit(1);
  }

  // Check if admin exists
  const [existing] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, values.email))
    .limit(1);

  if (existing) {
    console.log(`Admin user already exists: ${values.email}`);
    console.log(`Role: ${existing.role}, Status: ${existing.status}`);
    
    // Generate token
    const token = await mintAdminToken(existing.id);
    console.log('\nAdmin Token:');
    console.log(token);
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

  console.log(`? Admin user created:`);
  console.log(`   Email: ${admin.email}`);
  console.log(`   Role: ${admin.role}`);
  console.log(`   ID: ${admin.id}`);

  // Generate token
  const token = await mintAdminToken(admin.id);
  console.log('\n?? Admin Token:');
  console.log(token);
  console.log('\n??  Save this token securely. It will not be shown again.');
  console.log('\n?? Next steps:');
  console.log('   1. Set up 2FA for this admin account');
  console.log('   2. Configure VPN allowlist if required');
  console.log('   3. Test admin console access at /admin/dashboard');
}

seedAdmin().catch((error) => {
  console.error('Error seeding admin:', error);
  process.exit(1);
});
