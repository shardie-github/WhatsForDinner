#!/usr/bin/env node
import fs from "fs"; const stamp=()=>new Date().toISOString().slice(0,10);
import { createComponentLogger } from '@whats-for-dinner/utils';
const logger = createComponentLogger('system-health-ts');
const dirs=["reports/system","solutions/system","backlog","dashboards"]; dirs.forEach(d=>fs.mkdirSync(d,{recursive:true}));
const parts=["loops","second_order","socio_tech_alignment","constraints_report","resilience_index","multi_agent_sync"];
for(const p of parts){ fs.writeFileSync(`reports/system/${p}.md`, `# ${p}\nGenerated ${stamp()}\n`); fs.writeFileSync(`solutions/system/${p}_solutions.md`, `# Solutions for ${p}\n`); }
fs.writeFileSync(`reports/system_health_${stamp()}.md`, `# System Health (${stamp()})\nModules: ${parts.join(", ")}\nSee /solutions/system/* for remedies.\n`);
logger.info('✅ System Health files written.');
