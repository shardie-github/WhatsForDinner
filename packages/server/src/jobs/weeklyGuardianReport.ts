/**
 * Weekly Report Generation Job
 * Runs weekly to generate and store trust reports
 */

import { GuardianInspector } from '@whats-for-dinner/utils/guardian';
import * as fs from 'fs';
import * as path from 'path';

export async function generateWeeklyReports(): Promise<void> {
  const logsDir = './guardian/logs';
  const reportsDir = './guardian/reports';

  if (!fs.existsSync(logsDir)) {
    console.log('No Guardian logs found, skipping report generation');
    return;
  }

  // Ensure reports directory exists
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const inspector = new GuardianInspector(logsDir);
  const files = fs.readdirSync(logsDir).filter(f => f.endsWith('.jsonl'));

  const now = new Date();
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  let reportsGenerated = 0;

  for (const file of files) {
    try {
      const userId = file.replace('.jsonl', '');
      
      // Generate report
      const report = await inspector.analyzeAndGenerateReport(userId, weekStart, now);

      // Save JSON report
      const jsonPath = path.join(reportsDir, `trust_report_${userId}_${Date.now()}.json`);
      await inspector.saveReport(report, jsonPath);

      // Generate and save markdown report
      const markdown = await inspector.generateWeeklyReport(report);
      const mdPath = path.join(reportsDir, `trust_report_${userId}_${Date.now()}.md`);
      await fs.promises.writeFile(mdPath, markdown, 'utf-8');

      reportsGenerated++;

      console.log(`Generated report for user ${userId}`);
    } catch (error) {
      console.error(`Failed to generate report for ${file}:`, error);
    }
  }

  console.log(`Generated ${reportsGenerated} weekly reports`);
}

// Run if called directly
if (require.main === module) {
  generateWeeklyReports()
    .then(() => {
      console.log('Weekly report generation complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Weekly report generation failed:', error);
      process.exit(1);
    });
}
