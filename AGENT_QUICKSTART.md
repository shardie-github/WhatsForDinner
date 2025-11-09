# Unified Agent System - Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Run Your First Agent Cycle

```bash
pnpm agent:run
```

This will:
- Detect your repository type
- Run all enabled agents
- Generate initial artifacts
- Create reports and dashboards

### 2. Check Generated Artifacts

After running, check these locations:

```bash
# Performance metrics
cat admin/reliability.json
cat admin/reliability.md

# Security status
cat admin/compliance.json
cat SECURITY_COMPLIANCE_REPORT.md

# Cost analysis
cat admin/costs.json
cat admin/costs.md

# Roadmap
cat roadmap/current-sprint.md

# Next steps
cat auto/next-steps.md
```

### 3. Configure for Your Needs

Edit `.cursor/config/master-agent.json`:

```json
{
  "agents": {
    "reliability": { "enabled": true },
    "cost": { "enabled": true },
    "security": { "enabled": true }
  }
}
```

## 📋 Common Commands

```bash
# Run all agents
pnpm agent:run

# Run specific agent
pnpm agent:security
pnpm agent:cost
pnpm agent:reliability

# Check agent status
ls -la admin/ security/ roadmap/ auto/
```

## 🔧 Configuration

### Enable/Disable Agents

Edit `.cursor/config/master-agent.json`:

```json
{
  "agents": {
    "reliability": { "enabled": true },
    "cost": { "enabled": false }  // Disable cost agent
  }
}
```

### Set Budget

Create `.cursor/config/budget.json`:

```json
{
  "monthly": 100
}
```

## 📊 View Dashboards

- **Metrics Dashboard**: Visit `/admin/(console)/metrics` in your web app
- **Reliability**: `admin/reliability.md`
- **Costs**: `admin/costs.md`
- **Security**: `SECURITY_COMPLIANCE_REPORT.md`

## 🔄 Automation

The GitHub Actions workflow (`.github/workflows/agent-runner.yml`) runs automatically every 6 hours.

To trigger manually:
1. Go to GitHub Actions
2. Select "Unified Agent Runner"
3. Click "Run workflow"

## 🆘 Troubleshooting

### Agents not running?

1. Check Node.js version: `node --version` (needs >= 18)
2. Install dependencies: `pnpm install`
3. Check config: `cat .cursor/config/master-agent.json`

### No artifacts generated?

1. Check permissions on `admin/`, `security/`, `roadmap/`, `auto/` directories
2. Review console output for errors
3. Run individual agents to isolate issues

### Missing metrics?

Some agents require API access:
- **Cost Agent**: Needs `VERCEL_TOKEN`, `SUPABASE_URL`
- **Security Agent**: Needs package.json and npm/pnpm access
- **Reliability Agent**: Needs build artifacts or CI logs

## 📚 Learn More

- **Full Documentation**: `agents/README.md`
- **System Summary**: `AGENT_SYSTEM_SUMMARY.md`
- **Configuration**: `.cursor/config/master-agent.json`

## 🎯 Next Steps

1. ✅ Run `pnpm agent:run`
2. ✅ Review generated artifacts
3. ✅ Customize configuration
4. ✅ Set up automation (GitHub Actions)
5. ✅ Monitor dashboards regularly

---

**Ready to go!** Run `pnpm agent:run` to start.
