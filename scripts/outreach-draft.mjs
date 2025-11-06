#!/usr/bin/env node

/**
 * Outreach Draft Generator
 * 
 * Generates personalized outbound emails from ICP inputs
 * 
 * Usage:
 *   node scripts/outreach-draft.mjs <ICP> <pain-point> [name] [company]
 * 
 * Examples:
 *   node scripts/outreach-draft.mjs "busy-families" "decision-fatigue"
 *   node scripts/outreach-draft.mjs "diet-restricted" "keto-options" "Sarah" "TechCorp"
 */

const ICP_PROFILES = {
  'busy-families': {
    name: 'Busy Families',
    painPoints: {
      'decision-fatigue': {
        hook: 'tired of standing in your kitchen wondering what to cook',
        value: 'dinner ideas in 30 seconds, no decision fatigue',
      },
      'waste': {
        hook: 'frustrated by wasting ingredients you bought but never used',
        value: 'use ingredients you already have, reduce food waste',
      },
      'time': {
        hook: 'spending too much time planning meals',
        value: 'save 15 minutes per meal decision',
      },
    },
    cta: 'Try it free and see what you can make with ingredients you already have.',
  },
  'diet-restricted': {
    name: 'Diet-Restricted Consumers',
    painPoints: {
      'keto-options': {
        hook: 'tired of generic keto apps that don\'t understand your specific needs',
        value: 'AI that understands keto, validates every recipe against your restrictions',
      },
      'allergies': {
        hook: 'constantly checking ingredients for allergies',
        value: 'recipes validated against your specific allergies, automatically',
      },
      'variety': {
        hook: 'running out of recipes that fit your diet',
        value: 'unlimited recipe variety, all within your dietary constraints',
      },
    },
    cta: 'Start your free trial and see recipes that actually respect your diet.',
  },
  'meal-prep': {
    name: 'Meal Prep Enthusiasts',
    painPoints: {
      'planning': {
        hook: 'spending hours planning weekly meal prep',
        value: 'optimized weekly meal plans in minutes, not hours',
      },
      'efficiency': {
        hook: 'wasting ingredients across meal prep recipes',
        value: 'maximize batch cooking efficiency, minimize waste',
      },
      'variety': {
        hook: 'getting bored of the same meal prep recipes',
        value: 'new recipe suggestions every week, optimized for meal prep',
      },
    },
    cta: 'Try it free and optimize your next meal prep plan.',
  },
  'b2b-wellness': {
    name: 'Wellness Platform (B2B)',
    painPoints: {
      'engagement': {
        hook: 'low employee engagement with wellness programs',
        value: 'meal planning as a differentiated wellness benefit, 80%+ engagement',
      },
      'differentiation': {
        hook: 'need unique employee benefits that stand out',
        value: 'white-label meal planning platform, fully HIPAA-compliant',
      },
      'cost': {
        hook: 'healthcare costs rising, need prevention-focused benefits',
        value: 'improved nutrition reduces healthcare costs, proven ROI',
      },
    },
    cta: 'Let\'s discuss a partnership. We can offer meal planning for $5-20 per employee/month.',
  },
};

function generateEmail(icp, painPoint, name = null, company = null) {
  const profile = ICP_PROFILES[icp];
  if (!profile) {
    throw new Error(`Unknown ICP: ${icp}. Valid options: ${Object.keys(ICP_PROFILES).join(', ')}`);
  }

  const pain = profile.painPoints[painPoint];
  if (!pain) {
    throw new Error(`Unknown pain point: ${painPoint}. Valid options: ${Object.keys(profile.painPoints).join(', ')}`);
  }

  const greeting = name ? `Hi ${name},` : 'Hi there,';
  const companyLine = company ? ` at ${company}` : '';

  const subject = `Quick question${name ? `, ${name}` : ''}: Are you ${pain.hook}?`;

  const body = `${greeting}

Are you${companyLine} ${pain.hook}?

What's for Dinner solves this with ${pain.value}.

Here's how it works:
1. Add ingredients you already have (or connect your pantry)
2. Get personalized recipe suggestions in 30 seconds
3. Save your favorites—our AI learns your preferences

${profile.cta}

See it in action: [Your URL]

Quick stats:
• 10,000+ recipes generated this month
• Saves 15 minutes per meal decision
• Works for keto, vegan, allergies, and more

Happy to answer any questions.

Best,
[Your Name]
[Your Title]
What's for Dinner`;

  return { subject, body };
}

function printEmail(email) {
  console.log('\n' + '='.repeat(60));
  console.log('SUBJECT:');
  console.log('='.repeat(60));
  console.log(email.subject);
  console.log('\n' + '='.repeat(60));
  console.log('BODY:');
  console.log('='.repeat(60));
  console.log(email.body);
  console.log('='.repeat(60) + '\n');
}

function listOptions() {
  console.log('\nAvailable ICPs:');
  for (const [key, profile] of Object.entries(ICP_PROFILES)) {
    console.log(`\n  ${key} (${profile.name}):`);
    console.log('    Pain Points:');
    for (const [painKey] of Object.entries(profile.painPoints)) {
      console.log(`      - ${painKey}`);
    }
  }
  console.log('\n');
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  console.log(`
Usage: node scripts/outreach-draft.mjs <ICP> <pain-point> [name] [company]

ICP Options:
  busy-families      - Busy Families (primary ICP)
  diet-restricted    - Diet-Restricted Consumers
  meal-prep          - Meal Prep Enthusiasts
  b2b-wellness       - Wellness Platforms (B2B)

Examples:
  node scripts/outreach-draft.mjs busy-families decision-fatigue
  node scripts/outreach-draft.mjs diet-restricted keto-options Sarah
  node scripts/outreach-draft.mjs b2b-wellness engagement "John" "TechCorp"

Options:
  --list             Show all ICPs and pain points
`);
  listOptions();
  process.exit(0);
}

if (args[0] === '--list') {
  listOptions();
  process.exit(0);
}

if (args.length < 2) {
  console.error('Error: Missing required arguments. Use --help for usage.');
  process.exit(1);
}

const [icp, painPoint, name, company] = args;

try {
  const email = generateEmail(icp, painPoint, name, company);
  printEmail(email);

  // Also output as JSON for automation
  console.log('JSON Output (for automation):');
  console.log(JSON.stringify(email, null, 2));
  console.log('\n');
} catch (error) {
  console.error(`Error: ${error.message}`);
  listOptions();
  process.exit(1);
}
