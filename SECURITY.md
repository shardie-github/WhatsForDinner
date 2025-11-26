# Security Policy

**Your security matters to us.** We take security seriously and appreciate your help in keeping What's for Dinner safe for everyone.

---

## Reporting a Vulnerability

**Found a security issue? Thank you for reporting it!**

We want to fix security issues quickly and safely. Here's how to report them:

### How to Report

1. **Go to GitHub Security Advisories**
   - Navigate to the "Security" tab in this repository
   - Click "Report a vulnerability"
   - Fill out the advisory form with details

2. **Include as much detail as possible:**
   - What the vulnerability is
   - How to reproduce it
   - What impact it might have
   - Any potential fixes you've thought of

3. **Please don't:**
   - Create public issues for security vulnerabilities
   - Share details publicly until we've fixed it
   - Use the vulnerability maliciously

### What Happens Next

- **We'll acknowledge receipt** within 48 hours
- **We'll investigate** the issue thoroughly
- **We'll work with you** to understand and fix it
- **We'll credit you** (if you want) when we release the fix

**We appreciate responsible disclosure.** It helps us fix issues before they can be exploited.

---

## Security Best Practices

**We follow these practices to keep the project secure:**

### Secrets Management

- ✅ **Never commit secrets** - All secrets are stored in environment variables or secret management systems
- ✅ **Rotate credentials immediately** - If you suspect a compromise, rotate credentials right away
- ✅ **Use secure defaults** - We use secure defaults everywhere possible

### Code Security

- ✅ **Regular dependency updates** - We keep dependencies up to date
- ✅ **Security scanning** - Automated security scans in CI/CD
- ✅ **Code reviews** - All code changes are reviewed
- ✅ **Least privilege** - We follow the principle of least privilege

### Data Protection

- ✅ **Encryption** - Sensitive data encrypted at rest and in transit
- ✅ **Access controls** - Row-level security in the database
- ✅ **Privacy by design** - Privacy built into the system from the start

---

## Security Updates

**We fix security issues quickly:**

- **Critical issues** - Fixed within 24-48 hours
- **High priority** - Fixed within a week
- **Medium/Low priority** - Fixed in the next release cycle

**Security patches are released as soon as possible** after vulnerability identification. Critical security updates are announced via GitHub Releases.

---

## Supported Versions

**We provide security updates for:**

- Latest stable release
- Previous major version

**Older versions** may not receive security updates. We recommend staying up to date!

---

## Security Checklist

**For contributors and maintainers:**

See [SECURITY_CHECKLIST.md](./docs/SECURITY_CHECKLIST.md) for our comprehensive security controls and checklist.

**Everyone plays a role in security.** Following these practices helps keep everyone safe.

---

## Security Contact

**Need to report a security issue?**

- **Founder, CEO & Operator**: Scott Hardie
- **Email**: scottrmhardie@gmail.com
- **Use GitHub Security Advisories** - For reporting vulnerabilities
- **Tag maintainers in Issues** - For general security questions

**We're here to help.** Don't hesitate to reach out if you have security concerns.

---

## Responsible Disclosure

**We appreciate responsible disclosure.**

If you find a security vulnerability:
1. **Report it privately** - Don't share it publicly
2. **Give us time** - Allow us time to fix it before disclosing
3. **Work with us** - Help us understand and fix the issue

**In return, we'll:**
- Acknowledge your report quickly
- Keep you updated on our progress
- Credit you (if you want) when we fix it
- Work with you to ensure a safe disclosure

**Together, we keep What's for Dinner secure.**

---

## Security Resources

**Want to learn more about security?**

- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - Common security risks
- [Security Best Practices](https://cheatsheetseries.owasp.org/) - OWASP Cheat Sheets
- [Our Security Checklist](./docs/SECURITY_CHECKLIST.md) - Our specific practices

**Security is a journey, not a destination.** We're always learning and improving.

---

<div align="center">

**Thank you for helping keep What's for Dinner secure! 🔒**

Your vigilance helps protect everyone who uses the app.

[Report a Vulnerability](#reporting-a-vulnerability) • [Security Checklist](./docs/SECURITY_CHECKLIST.md)

</div>
