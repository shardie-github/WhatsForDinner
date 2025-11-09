# Unified Hardonia Agent - Quick Start

## 🚀 Activation Steps

1. **Run Setup**:
   ```bash
   pnpm run agent:setup
   ```

2. **Set Environment Variables** (if not already set):
   ```bash
   export NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
   export SUPABASE_SERVICE_ROLE_KEY="your-service-key"
   ```

3. **Run Agent**:
   ```bash
   pnpm run agent:run
   ```

4. **Generate Reports**:
   ```bash
   pnpm run agent:reports
   ```

5. **Check Artifacts**:
   - `admin/reliability.json` & `admin/reliability.md`
   - `admin/compliance.json` & `admin/compliance.md`
   - `security/sbom.json`
   - `docs/intent-log.md`
   - `roadmap/current-sprint.md`
   - `auto/next-steps.md`

## 📋 Agent Modes

The agent automatically detects your repository type and applies appropriate behaviors:

- **WebApp Mode**: Next.js optimization, Vercel monitoring
- **Mobile Mode**: Expo EAS management
- **Backend Mode**: Supabase edge validation, schema sync
- **Library Mode**: Type definitions, semantic versioning
- **Monorepo Mode**: All of the above

## 🔄 Scheduled Runs

The agent runs automatically via GitHub Actions:
- **Every 12 hours** (configurable)
- **Manual trigger** available via GitHub Actions UI

## 🛠️ Customization

Edit `.cursor/config/master-agent.json` to:
- Enable/disable specific agents
- Adjust schedules
- Configure artifact paths
- Set safety guardrails

## 📊 Monitoring

- **Metrics Dashboard**: `/admin/metrics.jsx` (React component)
- **API Endpoint**: `/api/metrics` (JSON)
- **Reliability**: `admin/reliability.json`
- **Compliance**: `admin/compliance.json`

## 🔐 Security

The agent:
- ✅ Never exposes secrets
- ✅ Requires CI approval for major changes
- ✅ Prefers PRs over direct commits
- ✅ Retains audit snapshots

## 🆘 Troubleshooting

**Agent won't start**:
- Check environment variables
- Verify dependencies: `pnpm install`
- Check logs in `.cursor/agent-discoveries.md`

**Artifacts not updating**:
- Verify write permissions
- Check GitHub Actions workflow
- Review agent logs

**Security checks failing**:
- Review `admin/compliance.json`
- Run `pnpm audit` manually
- Check `security/sbom.json`

## 📚 Full Documentation

See `README_AGENT.md` for complete documentation.
