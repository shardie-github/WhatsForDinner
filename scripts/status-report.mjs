#!/usr/bin/env node
import { readFileSync } from 'fs';
import { join } from 'path';

const health = JSON.parse(readFileSync('PROJECT_HEALTH_DASHBOARD.json', 'utf8'));
console.log('Project Status:', health.overall.status);
console.log('Score:', health.overall.score + '/100');
