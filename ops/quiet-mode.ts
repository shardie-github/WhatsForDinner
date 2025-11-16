/**
 * Quiet Mode - Global config toggle to degrade non-critical features during incident
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const QUIET_MODE_CONFIG = join(process.cwd(), 'ops', 'quiet-mode.json');

interface QuietModeConfig {
  enabled: boolean;
  degradedFeatures: string[];
  message: string;
  enabledAt?: string;
}

function getQuietModeConfig(): QuietModeConfig {
  if (existsSync(QUIET_MODE_CONFIG)) {
    return JSON.parse(require('fs').readFileSync(QUIET_MODE_CONFIG, 'utf-8'));
  }

  return {
    enabled: false,
    degradedFeatures: [],
    message: ''
  };
}

function setQuietMode(enabled: boolean, message?: string, degradedFeatures?: string[]): void {
  const config: QuietModeConfig = {
    enabled,
    degradedFeatures: degradedFeatures || [
      'ai_meal_generation',
      'analytics',
      'non_critical_notifications'
    ],
    message: message || (enabled ? 'System operating in quiet mode' : ''),
    enabledAt: enabled ? new Date().toISOString() : undefined
  };

  if (!existsSync(join(process.cwd(), 'ops'))) {
    mkdirSync(join(process.cwd(), 'ops'), { recursive: true });
  }

  writeFileSync(QUIET_MODE_CONFIG, JSON.stringify(config, null, 2));
}

function isQuietModeEnabled(): boolean {
  return getQuietModeConfig().enabled;
}

function getQuietModeBanner(): string {
  const config = getQuietModeConfig();
  if (!config.enabled) return '';

  return `
<div class="quiet-mode-banner" style="background: #f59e0b; color: white; padding: 12px; text-align: center;">
  ${config.message}
</div>
`;
}

if (require.main === module) {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  switch (command) {
    case 'enable':
      setQuietMode(true, args[0]);
            break;
    case 'disable':
      setQuietMode(false);
            break;
    case 'status':
      const config = getQuietModeConfig();
      if (config.enabled) {
        console.log('Quiet mode is enabled');
      } else {
        console.log('Quiet mode is disabled');
      }
      break;
    default:
      console.error('Usage: quiet-mode.ts [enable|disable|status]');
      process.exit(1);
  }
}

export { setQuietMode, isQuietModeEnabled, getQuietModeBanner, getQuietModeConfig };
