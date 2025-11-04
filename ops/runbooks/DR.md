# Disaster Recovery (DR) Playbook

**Version:** 1.0  
**Last Updated:** ${new Date().toISOString().split('T')[0]}  
**Owner:** DevOps Team

## Overview

This playbook outlines the disaster recovery procedures for What's for Dinner? production infrastructure.

## RTO/RPO Targets

- **RTO (Recovery Time Objective):** < 4 hours
- **RPO (Recovery Point Objective):** < 1 hour

## Recovery Procedures

### Scenario 1: Database Corruption

**Steps:**

1. Enable quiet mode
2. Assess impact
3. Restore from snapshot
4. Post-restore validation

### Scenario 2: Complete Infrastructure Failure

**Steps:**

1. Initial assessment
2. Spin temporary environment
3. Data migration
4. DNS/Configuration update
5. Smoke tests

## Quarterly DR Rehearsal

Schedule: Every 3 months

Procedure:
1. Create test environment
2. Run DR scenario
3. Measure RTO/RPO
4. Generate report

See full details in ops/runbooks/DR.md
