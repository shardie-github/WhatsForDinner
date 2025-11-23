#!/usr/bin/env node
import fs from "fs"; import { withDb } from "../lib/db";
import { createComponentLogger } from '@whats-for-dinner/utils';
(async()=>{
  const sql=fs.readFileSync("tests/data_quality.sql","utf8");
  await withDb(async c=>{ await c.query(sql); });
  logger.info('# Data Quality: PASS');
})().catch(e=>{ logger.error('e'); process.exit(1); });
const logger = createComponentLogger('run-data-quality-ts');
