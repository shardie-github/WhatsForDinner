#!/usr/bin/env node

/**
 * Outreach Email Draft Generator
 * Generates personalized outbound emails from ICP inputs
 * 
 * Usage: node scripts/outreach-draft.mjs --icp <profile> --pain <pain> --company <name>
 */

import fs from 'fs';
import path from 'path';

const ICP_PROFILES = {
  'busy-families': {
    name: 'Busy Families',
    pain: [
      'decision fatigue around meal planning',
      'wasting ingredients bought but never used',
      'repetitive meals',
      'limited time for meal planning',
    ],
    value: [
      'saves 15+ minutes per meal decision',
      'reduces food waste',
      'personalizes to family preferences',
    ],
    tone: 'warm, empathetic, time-saving focused',
  },
  'diet-restricted': {
    name: 'Diet-Restricted Consumers',
    pain: [
      'generic apps don\'t respect strict diets',
      'constant ingredient checking',
      'limited recipe variety within constraints',
    ],
    value: [
      'specialized AI understands dietary constraints',
      'validates recipes against restrictions',
      'premium pricing justified by specificity',
    ],
    tone: 'professional, health-focused, precision-oriented',
  },
  'meal-prep': {
    name: 'Meal Prep Enthusiasts',
    pain: [
      'planning weekly meal prep is time-consuming',
      'ingredient optimization across meals',
      'storage and portion management',
    ],
    value: [
      'weekly meal planning optimization',
      'batch cooking recommendations',
      'grocery list generation',
    ],
    tone: 'efficiency-focused, productivity-oriented',
  },
  'wellness-platform': {
    name: 'Wellness Platforms (B2B)',
    pain: [
      'low engagement with wellness programs',
      'need differentiated employee benefits',
      'healthcare cost reduction goals',
    ],
    value: [
      'white-label integration',
      'enterprise multi-tenancy',
      'compliance-ready (HIPAA, SOC2)',
    ],
    tone: 'professional, ROI-focused, enterprise',
  },
};

function generateEmail(icpProfile, customPain, companyName, personalNote) {
  const profile = ICP_PROFILES[icpProfile];
  if (!profile) {
    throw new Error(`Unknown ICP profile: ${icpProfile}`);
  }

  const pain = customPain || profile.pain[0];
  const value = profile.value[0];

  const subject = `Quick question about ${pain}?`;

  const body = `Hi ${companyName ? `[Name at ${companyName}]` : '[Name]'},

I noticed ${companyName ? `${companyName} ` : 'you '}${pain.includes('you') ? pain : `faces ${pain}`}. 

I'm reaching out because I've built What's for Dinner, an AI meal planner that ${value}. 

[If applicable: I saw that ${companyName} [specific observation about their wellness program/meal services/etc.]. Our solution could help.]

Would you be open to a 15-minute call to explore if this could help ${companyName ? 'your team' : 'you'} save time on meal planning?

Best,
[Your Name]

${personalNote ? `P.S. ${personalNote}` : ''}

---
About What's for Dinner:
- AI-powered meal planning from pantry ingredients
- Universal platform (web + mobile)
- Learn more: [Your URL]`;

  return { subject, body };
}

function main() {
  const args = process.argv.slice(2);
  
  let icpProfile = 'busy-families';
  let customPain = null;
  let companyName = null;
  let personalNote = null;
  let count = 1;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--icp' && args[i + 1]) {
      icpProfile = args[i + 1];
      i++;
    } else if (args[i] === '--pain' && args[i + 1]) {
      customPain = args[i + 1];
      i++;
    } else if (args[i] === '--company' && args[i + 1]) {
      companyName = args[i + 1];
      i++;
    } else if (args[i] === '--note' && args[i + 1]) {
      personalNote = args[i + 1];
      i++;
    } else if (args[i] === '--count' && args[i + 1]) {
      count = parseInt(args[i + 1], 10);
      i++;
    }
  }

  console.log('='.repeat(60));
  console.log('OUTREACH EMAIL DRAFT GENERATOR');
  console.log('='.repeat(60));
  console.log();

  if (!ICP_PROFILES[icpProfile]) {
    console.error(`Error: Unknown ICP profile "${icpProfile}"`);
    console.log('\nAvailable profiles:');
    Object.keys(ICP_PROFILES).forEach(key => {
      console.log(`  - ${key}: ${ICP_PROFILES[key].name}`);
    });
    process.exit(1);
  }

  console.log(`ICP Profile: ${ICP_PROFILES[icpProfile].name}`);
  console.log(`Tone: ${ICP_PROFILES[icpProfile].tone}`);
  console.log();

  for (let i = 0; i < count; i++) {
    const email = generateEmail(icpProfile, customPain, companyName, personalNote);
    
    console.log(`--- Email ${i + 1} ---`);
    console.log(`Subject: ${email.subject}`);
    console.log();
    console.log(email.body);
    console.log();
  }

  console.log('='.repeat(60));
  console.log('\nTips:');
  console.log('- Personalize [Name] and company name');
  console.log('- Add specific observation if researching prospect');
  console.log('- Follow up after 3-5 days if no response');
  console.log('- Track open rates and responses');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateEmail, ICP_PROFILES };
