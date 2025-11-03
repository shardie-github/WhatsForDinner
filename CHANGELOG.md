# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-01-01

### Added
- Initial production-ready setup
- Expo SDK 52 configuration with TypeScript
- Supabase integration (database, auth, RLS)
- Baseline database schema (profiles, app_settings, audit_log, push_tokens)
- Supabase Edge Functions (healthcheck, profile-sync)
- Row Level Security (RLS) policies for all tables
- GitHub Actions CI workflow
- Doctor script for preflight checks
- Comprehensive documentation (README, API, SUPPORT, SECURITY, CONTRIBUTING)
- Vercel deployment configuration
- Environment variable templates (.env.example)
- TypeScript strict mode configuration
- ESLint and Prettier setup

### Changed
- Migrated app.config.js to TypeScript (app.config.ts)
- Standardized package.json scripts
- Updated documentation structure

### Security
- All tables protected with RLS policies
- Service role keys properly scoped
- Environment variables properly configured
- Security headers in Vercel config

[0.1.0]: https://github.com/your-org/hardonia-app/releases/tag/v0.1.0
