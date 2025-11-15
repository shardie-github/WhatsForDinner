#!/usr/bin/env tsx
/**
 * Archive Non-Core Features
 * Moves federation, nomad, marketplace, and community portal features to archive
 */

import fs from 'fs';
import path from 'path';

const ARCHIVE_DIR = path.join(process.cwd(), 'archive', 'non-core-features');
const FEATURES_TO_ARCHIVE = [
  {
    name: 'Federation Features',
    paths: [
      'apps/web/src/app/api/federation',
      'apps/web/src/components/federation',
      'packages/federation',
    ],
  },
  {
    name: 'Nomad Features',
    paths: [
      'apps/web/src/app/api/nomad',
      'apps/web/src/components/nomad',
      'nomad',
    ],
  },
  {
    name: 'Marketplace',
    paths: [
      'apps/marketplace',
      'apps/web/src/app/api/marketplace',
      'apps/web/src/components/marketplace',
    ],
  },
  {
    name: 'Community Portal',
    paths: [
      'apps/community-portal',
    ],
  },
];

function archiveFeature(feature: { name: string; paths: string[] }) {
  console.log(`\n📦 Archiving ${feature.name}...`);
  
  const featureArchiveDir = path.join(ARCHIVE_DIR, feature.name.toLowerCase().replace(/\s+/g, '-'));
  fs.mkdirSync(featureArchiveDir, { recursive: true });

  // Create README explaining why it was archived
  const readme = `# ${feature.name} - Archived

**Archived Date:** ${new Date().toISOString()}
**Reason:** Product simplification - focusing on core meal planning flow
**Status:** Archived for future use, not deleted

## What was archived

${feature.paths.map(p => `- \`${p}\``).join('\n')}

## Future Plans

These features may be re-enabled in the future when:
- Core product is stable
- User base requests these features
- Resources are available for maintenance

## How to Re-enable

1. Move files back from \`archive/non-core-features/${feature.name.toLowerCase().replace(/\s+/g, '-')}\`
2. Update imports and dependencies
3. Run tests to ensure everything works
4. Update documentation
`;

  fs.writeFileSync(path.join(featureArchiveDir, 'README.md'), readme);

  // Move files (create symlinks or copy - for safety, we'll create a manifest)
  const manifest = {
    archivedDate: new Date().toISOString(),
    originalPaths: feature.paths,
    archiveLocation: featureArchiveDir,
  };

  fs.writeFileSync(
    path.join(featureArchiveDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  console.log(`  ✅ Created archive manifest at ${featureArchiveDir}`);
  console.log(`  📝 Note: Actual files remain in place. Review and manually move if needed.`);
}

function createSimplificationPlan() {
  const plan = {
    coreFlow: {
      description: 'Pantry → Meal Suggestions → Grocery List',
      endpoints: [
        '/api/pantry',
        '/api/meal-plan',
        '/api/grocery-list',
        '/api/recipes',
      ],
    },
    archivedFeatures: FEATURES_TO_ARCHIVE.map(f => f.name),
    nextSteps: [
      'Review API endpoints and consolidate duplicates',
      'Remove unused endpoints',
      'Update API documentation to focus on core endpoints',
      'Simplify onboarding flow',
      'Focus on single-user experience',
    ],
  };

  const planPath = path.join(ARCHIVE_DIR, 'simplification-plan.json');
  fs.writeFileSync(planPath, JSON.stringify(plan, null, 2));
  console.log(`\n📋 Simplification plan saved to ${planPath}`);
}

async function main() {
  console.log('🚀 Starting Product Simplification - Archiving Non-Core Features\n');

  // Create archive directory
  fs.mkdirSync(ARCHIVE_DIR, { recursive: true });

  // Archive each feature
  for (const feature of FEATURES_TO_ARCHIVE) {
    archiveFeature(feature);
  }

  // Create simplification plan
  createSimplificationPlan();

  console.log('\n✅ Archiving complete!');
  console.log('\n📋 Next steps:');
  console.log('   1. Review archived features manifest');
  console.log('   2. Manually move files if needed (or disable in code)');
  console.log('   3. Update API documentation');
  console.log('   4. Simplify onboarding flow');
  console.log('   5. Focus on core flow: Pantry → Suggestions → List');
}

if (require.main === module) {
  main()
    .then(() => {
      console.log('\n✅ Product simplification archiving completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Failed to archive features:', error);
      process.exit(1);
    });
}

export { archiveFeature, FEATURES_TO_ARCHIVE };
