# Supabase Schema Installation Guide

The master SQL file has been split into smaller parts for easier pasting into the Supabase SQL Editor.

## Installation Order

Run these files **IN ORDER** in your Supabase SQL Editor:

### Part 1: Core Tables
- File: `supabase_tables_part1_core.sql`
- Creates: profiles, pantry_items, recipes, favorites

### Part 2: Analytics Tables
- File: `supabase_tables_part2_analytics.sql`
- Creates: analytics_events, recipe_metrics, system_metrics, logs, error_reports, recipe_feedback, ai_config, workflow_state

### Part 3: Multi-Tenant Schema
- File: `supabase_tables_part3_multitenant.sql`
- Creates: tenants, tenant_memberships, subscriptions, usage_logs, tenant_invites, ai_cache, billing_events
- Also adds tenant_id columns to existing tables

### Part 4-13: Additional Tables
The remaining parts will be created next. For now, you can also use the full `master_supabase_schema.sql` file by copying it in sections.

## Quick Installation (Alternative)

If you prefer, you can also:
1. Download the `master_supabase_schema.sql` file
2. Open it in a text editor
3. Copy sections of ~200-300 lines at a time
4. Paste each section into Supabase SQL Editor
5. Run each section sequentially

## Notes

- Each file uses `CREATE TABLE IF NOT EXISTS` so it's safe to run multiple times
- Make sure to run files in order due to foreign key dependencies
- After creating all tables, you may want to set up Row Level Security policies
