# Contributing to What's for Dinner

**Thank you for wanting to help!** We're thrilled you're interested in contributing. This guide will help you get started quickly and make your first contribution in under 10 minutes.

---

## Your First Contribution

**New to open source? No problem!** Here's how to make your first contribution:

1. **Fork the repository** - Click the "Fork" button at the top right
2. **Clone your fork** - `git clone https://github.com/your-username/whats-for-dinner.git`
3. **Install dependencies** - `cd whats-for-dinner && pnpm install`
4. **Create a branch** - `git checkout -b feature/your-feature-name`
5. **Make your changes** - Fix a bug, add a feature, improve docs
6. **Test your changes** - `pnpm test` and `pnpm lint`
7. **Commit and push** - `git commit -m "feat: your change" && git push`
8. **Open a pull request** - We'll review it and help you get it merged!

**That's it!** We're here to help if you get stuck.

---

## How We Work

### Development Workflow

1. **Start with an issue** - Check existing issues or create one to discuss your idea
2. **Get feedback** - We'll help you refine your approach before you code
3. **Write code** - Make your changes following our style guide
4. **Test everything** - Write tests, run the test suite, make sure it works
5. **Document it** - Update docs if needed
6. **Submit for review** - Open a PR and we'll review it together

**We're collaborative, not critical.** Every contribution makes the project better, and we're here to help you succeed.

---

## Code Style

**We keep it simple:**

- **TypeScript** - We use TypeScript for type safety
- **Prettier** - Code is auto-formatted, so don't worry about formatting
- **ESLint** - Follow the linting rules (they're mostly common sense)
- **Tests** - Write tests for new features (we'll help you if you're new to testing)

**Don't stress about perfection.** We'll help you polish your code during review.

### Formatting

We use Prettier, so just run:
```bash
pnpm format
```

It'll format everything automatically. No manual formatting needed!

### Linting

Check for issues:
```bash
pnpm lint
```

Fix issues automatically:
```bash
pnpm lint:fix
```

---

## Commit Messages

**We use conventional commits** - they help us understand what changed and why.

Format: `type: description`

Types:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Formatting, missing semicolons, etc.
- `refactor:` - Code refactoring (no behavior change)
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add pantry expiration alerts
fix: resolve meal plan sync issue
docs: update setup instructions
test: add tests for meal generation
```

**Keep it simple and descriptive.** We're not strict about this—just try your best!

---

## Pull Request Process

### Before You Submit

1. **Update documentation** - If you changed how something works, update the docs
2. **Add tests** - New features need tests (we'll help you write them)
3. **Run the test suite** - `pnpm test` should pass
4. **Check linting** - `pnpm lint` should pass
5. **Test manually** - Try your changes in the app

### Opening a Pull Request

1. **Write a clear title** - Describe what your PR does
2. **Add a description** - Explain what changed and why
3. **Link related issues** - Use "Closes #123" if your PR fixes an issue
4. **Add screenshots** - If you changed the UI, show us what it looks like!

### What Happens Next

1. **We'll review it** - Usually within 24-48 hours
2. **We might ask for changes** - Don't worry, this is normal! We'll help you fix it
3. **We'll merge it** - Once it's ready, we'll merge it and celebrate your contribution!

**We're friendly reviewers.** We want your PR to succeed, so we'll help you get it right.

---

## What to Contribute

**Everything helps!** Here are some ideas:

### Good First Issues

- Fix typos in documentation
- Improve error messages
- Add test coverage
- Improve accessibility
- Translate the app
- Fix bugs you've found

### Feature Ideas

- New recipe filters
- Better pantry management
- Integration with grocery stores
- Nutrition tracking improvements
- Family planning features

**Have an idea?** Open an issue and let's discuss it!

---

## Getting Help

**Stuck? We're here to help!**

- **Open an issue** - Ask questions, report bugs, suggest features
- **Join discussions** - Use GitHub Discussions for longer conversations
- **Check the docs** - We have comprehensive documentation in the `docs/` folder
- **Read the code** - The codebase is well-commented and organized

**No question is too small.** We'd rather help you than have you struggle alone.

---

## Code of Conduct

**Be respectful, be kind, be helpful.**

We're building a community where everyone feels welcome. That means:
- ✅ Be respectful in discussions
- ✅ Welcome newcomers
- ✅ Help others learn
- ✅ Give constructive feedback
- ❌ No harassment or discrimination

**We're all here to make What's for Dinner better.** Let's do it together.

---

## Recognition

**We appreciate every contribution!**

- Contributors are listed in our README
- Significant contributions get special recognition
- We celebrate every PR that gets merged

**Your work matters.** Thank you for helping make What's for Dinner better!

---

## About the Founder

**What's for Dinner** is built by **Scott Hardie**, Founder, CEO & Operator.

With 15+ years building SaaS products and AI-powered solutions, Scott brings expertise in solution architecture, AI integration, and product development. He built What's for Dinner to solve his own daily "what's for dinner?" problem.

**Connect**:
- 📧 Email: scottrmhardie@gmail.com
- 💼 LinkedIn: [linkedin.com/in/scottrmhardie](https://www.linkedin.com/in/scottrmhardie)
- 💻 GitHub: [github.com/shardie-github](https://github.com/shardie-github)

---

## Questions?

**Still have questions?** That's totally fine!

- Open an issue with the `question` label
- Tag maintainers in discussions
- Check existing issues and discussions

**We're here to help you succeed.** Let's build something amazing together!

---

<div align="center">

**Thank you for contributing! 🙏**

Every contribution, no matter how small, makes What's for Dinner better.

[Get Started](#your-first-contribution) • [Open an Issue](https://github.com/your-org/whats-for-dinner/issues) • [Join Discussions](https://github.com/your-org/whats-for-dinner/discussions)

</div>
