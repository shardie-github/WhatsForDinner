# Solo Operator Guide

**Running What's for Dinner solo?** This guide is for you. Everything here is designed to make your life easier as a solo founder.

---

## Quick Start Commands

**The commands you'll use most:**

```bash
# Start developing
./scripts/dev.sh          # Start all apps
./scripts/dev.sh web      # Web app only
./scripts/dev.sh mobile   # Mobile app only

# Run tests
./scripts/test.sh         # Run all tests
./scripts/test.sh watch   # Watch mode
./scripts/test.sh coverage  # With coverage

# Check code quality
./scripts/check.sh         # Run all checks
./scripts/check.sh lint    # Lint only
./scripts/check.sh type    # Type check only

# Build everything
pnpm build                # Build all apps
pnpm build:web            # Web app only
pnpm build:mobile         # Mobile app only
```

**Make scripts executable:**
```bash
chmod +x scripts/*.sh
```

---

## Daily Workflow

### Morning Routine

1. **Check status**
   ```bash
   pnpm health:check
   ```

2. **Pull latest changes**
   ```bash
   git pull origin main
   pnpm install  # If dependencies changed
   ```

3. **Start developing**
   ```bash
   ./scripts/dev.sh
   ```

### Before Committing

1. **Run checks**
   ```bash
   ./scripts/check.sh
   ```

2. **Run tests**
   ```bash
   ./scripts/test.sh
   ```

3. **Format code**
   ```bash
   pnpm format
   ```

### Before Pushing

1. **Run CI checks locally**
   ```bash
   ./scripts/test.sh ci
   pnpm lint
   pnpm type-check
   ```

2. **Build to verify**
   ```bash
   pnpm build
   ```

---

## Project Structure Explained

**Where everything lives:**

```
whats-for-dinner/
├── apps/
│   ├── web/              # Main web app (Next.js)
│   └── mobile/           # Mobile app (React Native)
├── packages/
│   ├── ui/               # Shared UI components
│   ├── utils/            # Shared utilities
│   ├── theme/           # Design system
│   ├── config/          # Configuration
│   └── server/          # Server utilities
├── scripts/             # Helper scripts (you are here!)
├── docs/                # Documentation
└── .github/             # GitHub templates & workflows
```

**Key folders:**
- `apps/web/src/app/` - Next.js app routes
- `apps/web/src/components/` - React components
- `packages/ui/src/` - Shared UI components
- `packages/server/src/` - Server-side code

---

## Common Tasks

### Adding a New Feature

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Add code
   - Add tests
   - Update docs

3. **Test it**
   ```bash
   ./scripts/test.sh
   ./scripts/check.sh
   ```

4. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin feature/your-feature-name
   ```

5. **Open a PR** - Use the PR template!

### Fixing a Bug

1. **Reproduce the bug**
   - Understand what's wrong
   - Write a test that fails

2. **Fix it**
   - Make the test pass
   - Verify the fix works

3. **Test everything**
   ```bash
   ./scripts/test.sh
   ```

4. **Commit with `fix:` prefix**
   ```bash
   git commit -m "fix: description of the bug fix"
   ```

### Updating Dependencies

1. **Check for updates**
   ```bash
   pnpm outdated
   ```

2. **Update dependencies**
   ```bash
   pnpm update
   ```

3. **Test everything**
   ```bash
   ./scripts/test.sh
   pnpm build
   ```

4. **Commit**
   ```bash
   git commit -m "chore: update dependencies"
   ```

---

## Automation Tips

### Pre-commit Hooks

**Already set up!** Husky runs automatically:
- Formatting (Prettier)
- Linting (ESLint)
- Type checking

**Want to skip hooks?** (Not recommended)
```bash
git commit --no-verify
```

### GitHub Actions

**Everything is automated:**
- Tests run on every push
- Builds verify on every PR
- Deployments happen automatically

**Check CI status:**
- Go to your PR
- Click "Checks" tab
- See what's running

---

## Troubleshooting

### "Command not found"

**Make scripts executable:**
```bash
chmod +x scripts/*.sh
```

### Tests failing

**Run tests locally first:**
```bash
./scripts/test.sh
```

**Check what's failing:**
- Read the error message
- Check the test file
- Verify your changes

### Build failing

**Clean and rebuild:**
```bash
rm -rf node_modules
pnpm install
pnpm build:packages
pnpm build
```

### Type errors

**Check types:**
```bash
pnpm type-check
```

**Common fixes:**
- Add missing types
- Fix import paths
- Update type definitions

---

## Time-Saving Tips

### Use VS Code Tasks

**Create `.vscode/tasks.json`:**
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "dev",
      "type": "shell",
      "command": "./scripts/dev.sh",
      "problemMatcher": []
    },
    {
      "label": "test",
      "type": "shell",
      "command": "./scripts/test.sh",
      "problemMatcher": []
    }
  ]
}
```

**Run with:** `Cmd+Shift+P` → "Run Task" → "dev"

### Use Aliases

**Add to your `~/.bashrc` or `~/.zshrc`:**
```bash
alias wfd-dev="./scripts/dev.sh"
alias wfd-test="./scripts/test.sh"
alias wfd-check="./scripts/check.sh"
alias wfd-build="pnpm build"
```

**Then use:**
```bash
wfd-dev
wfd-test
wfd-check
```

---

## Staying Organized

### Issue Templates

**Use the templates:**
- Bug reports → `.github/ISSUE_TEMPLATE/bug_report.md`
- Feature requests → `.github/ISSUE_TEMPLATE/feature_request.md`

**They help you:**
- Remember what to include
- Stay consistent
- Save time

### PR Template

**Always use the PR template:**
- Describes your changes
- Links related issues
- Shows what you tested

**It makes reviews easier** (even if you're reviewing your own PRs).

---

## Mental Models

### When to Test

**Test when:**
- Adding new features
- Fixing bugs
- Refactoring code
- Updating dependencies

**Don't test:**
- Documentation-only changes (usually)
- Formatting-only changes

### When to Document

**Document when:**
- Adding new features
- Changing APIs
- Fixing confusing bugs
- Adding new workflows

**Keep it simple.** Good docs save time later.

---

## Getting Help

**Stuck? Here's where to look:**

1. **Check the docs** - `docs/README.md`
2. **Check existing issues** - Maybe someone had the same problem
3. **Check the code** - It's well-commented
4. **Run health check** - `pnpm health:check`

**Remember:** You're not alone. The codebase is designed to help you succeed.

---

## Quick Reference

**Most common commands:**

```bash
# Development
./scripts/dev.sh              # Start dev server
./scripts/test.sh              # Run tests
./scripts/check.sh             # Check code quality

# Building
pnpm build                     # Build everything
pnpm build:web                 # Build web app
pnpm build:mobile             # Build mobile app

# Code Quality
pnpm lint                      # Lint code
pnpm lint:fix                  # Fix linting issues
pnpm format                    # Format code
pnpm type-check                # Check types

# Operations
pnpm health:check              # Health dashboard
pnpm ops:doctor                # System checks
```

**Print this and keep it handy!**

---

<div align="center">

**You've got this! 💪**

Running solo doesn't mean running alone. The tools are here to help.

[Back to README](../README.md) • [Contributing Guide](../CONTRIBUTING.md)

</div>
