import fs from "fs";
import path from "path";
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('flags-ts');
const FLAGS_PATH = path.join(process.cwd(), "featureflags", "flags.json");

export function loadFlags(): Record<string, unknown> {
  try {
    if (fs.existsSync(FLAGS_PATH)) {
      return JSON.parse(fs.readFileSync(FLAGS_PATH, "utf8"));
    }
  } catch (e) {
    logger.error('Failed to load flags:', { e });
  }
  return {};
}

export function getFlag(key: string, defaultValue: any = false): unknown {
  const flags = loadFlags();
  return flags[key] ?? defaultValue;
}
