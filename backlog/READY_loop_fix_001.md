# READY_loop_fix_001: Fix Acquisition → Activation Loop

**Type:** System Health Fix  
**Priority:** High  
**Owner:** Growth Lead  
**Status:** Ready

## Problem

Empty pantry requires manual input (5+ minutes), activation rate only 60%. Acquisition → Activation loop is broken.

## Solution

Pre-fill onboarding with sample items and auto-generate first meal plan.

## Implementation

1. Pre-fill pantry with 10-15 common Canadian pantry items (7 days)
2. Add one-click "Generate my first meal plan" button (7 days)
3. A/B test: 50% rollout (7 days)
4. Measure: activation rate, time-to-activation (7 days)

## Success Criteria

- Activation rate: 75%+ (treatment) vs. 60% (control)
- Time-to-activation: <2 minutes (treatment) vs. 5+ minutes (control)

## KPI

**Target:** Activation rate >75%

## 30-Day Signal

Activation rate >70% in treatment group

## Dependencies

None

## Impact

**High** - Fixes broken acquisition → activation loop, increases activation rate by 25%
