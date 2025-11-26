#!/usr/bin/env node
/**
 * Testimonial Request Email Script
 * 
 * Generates testimonial request emails for beta users
 * Usage: node scripts/send-testimonial-requests.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function generateTestimonialRequests() {
  console.log('📧 Generating testimonial request emails...\n');

  try {
    // Get active users (users who generated 3+ recipes)
    const { data: activeUsers, error: usersError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        created_at,
        plan
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      process.exit(1);
    }

    // Get recipe counts per user
    const { data: recipeCounts, error: recipesError } = await supabase
      .from('recipes')
      .select('user_id')
      .not('user_id', 'is', null);

    const userRecipeCounts = {};
    recipeCounts?.forEach(r => {
      if (r.user_id) {
        userRecipeCounts[r.user_id] = (userRecipeCounts[r.user_id] || 0) + 1;
      }
    });

    // Filter to users with 3+ recipes
    const qualifiedUsers = activeUsers?.filter(u => (userRecipeCounts[u.id] || 0) >= 3) || [];

    console.log(`✅ Found ${qualifiedUsers.length} qualified users (3+ recipes)`);

    // Generate email template for each user
    const emails = qualifiedUsers.map(user => {
      const recipeCount = userRecipeCounts[user.id] || 0;
      const daysSinceSignup = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        to: user.email,
        subject: 'Quick favor - Help us improve What\'s for Dinner',
        body: `Hi there,

I hope you're enjoying What's for Dinner! I'm reaching out because you're one of our early users, and your feedback would be incredibly valuable.

I noticed you've generated ${recipeCount} recipes${daysSinceSignup > 0 ? ` over the past ${daysSinceSignup} days` : ''}—that's awesome!

Would you be willing to share a quick testimonial? Just 2-3 sentences about:
- What problem we solved for you
- How much time you save
- Whether you'd recommend us to others

If you're open to it, I'd also love to feature your story (with your permission, of course).

Thanks so much!
Scott Hardie
Founder, CEO & Operator
What's for Dinner

P.S. If you have any feedback or feature requests, I'd love to hear those too!`,
      };
    });

    // Save to file
    const outputPath = join(process.cwd(), 'yc', 'TESTIMONIAL_REQUESTS.md');
    const content = `# Testimonial Request Emails

**Generated**: ${new Date().toISOString()}  
**Qualified Users**: ${qualifiedUsers.length} (users with 3+ recipes)

---

## Email Template

**Subject**: Quick favor - Help us improve What's for Dinner

**Body**:
\`\`\`
Hi there,

I hope you're enjoying What's for Dinner! I'm reaching out because you're one of our early users, and your feedback would be incredibly valuable.

Would you be willing to share a quick testimonial? Just 2-3 sentences about:
- What problem we solved for you
- How much time you save
- Whether you'd recommend us to others

If you're open to it, I'd also love to feature your story (with your permission, of course).

Thanks so much!
Scott Hardie
Founder, CEO & Operator
What's for Dinner
\`\`\`

---

## Users to Contact

${qualifiedUsers.map((user, idx) => {
  const recipeCount = userRecipeCounts[user.id] || 0;
  const daysSinceSignup = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24));
  
  return `### ${idx + 1}. ${user.email || 'User ' + user.id.substring(0, 8)}
- **Recipes Generated**: ${recipeCount}
- **Days Since Signup**: ${daysSinceSignup}
- **Plan**: ${user.plan || 'free'}
- **Status**: [ ] Not contacted | [ ] Contacted | [ ] Responded | [ ] Testimonial received`;
}).join('\n\n')}

---

## Next Steps

1. **Review list** above
2. **Send emails** to qualified users (copy template above)
3. **Track responses** in this document
4. **Follow up** with non-responders after 1 week
5. **Create case studies** for detailed responses

---

**Note**: This list is generated from database. Update status as you contact users.

`;

    writeFileSync(outputPath, content);
    console.log(`\n✅ Testimonial requests saved to: ${outputPath}`);
    console.log(`\n📧 Ready to send ${qualifiedUsers.length} emails`);
    console.log('   Review the list and send emails manually (or use your email service)');

  } catch (error) {
    console.error('❌ Error generating testimonial requests:', error);
    process.exit(1);
  }
}

generateTestimonialRequests();
