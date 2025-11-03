# Support Guide

## Getting Help

### Documentation
1. Check the [README.md](../README.md) for setup instructions
2. Review [API.md](./API.md) for API usage
3. See [SECURITY.md](./SECURITY.md) for security guidelines

### Common Issues

#### Environment Variables
- Ensure all required variables are set in `.env` or your deployment platform
- For Expo, variables must be prefixed with `EXPO_PUBLIC_`
- Restart development server after changing environment variables

#### Supabase Connection
- Verify your Supabase URL and keys are correct
- Check that RLS policies allow your operations
- Ensure migrations have been applied (`supabase db push`)

#### Build Failures
- Run `npm run doctor` to perform preflight checks
- Ensure Node.js version >= 18.0.0
- Clear caches: `npm run clean` or `expo r -c`

#### TypeScript Errors
- Run `npm run typecheck` to identify issues
- Ensure `@expo/config-types` is installed for `app.config.ts`

### Getting Help

1. **Check Existing Issues**: Search GitHub issues for similar problems
2. **Create New Issue**: Include:
   - Error messages/logs
   - Steps to reproduce
   - Environment details (OS, Node version, etc.)
   - Relevant configuration files (sanitized)

### Development Support

#### Local Development
```bash
# Install dependencies
npm install

# Run doctor check
npm run doctor

# Start development
npm run dev
```

#### Testing
```bash
# Run type checking
npm run typecheck

# Run linting
npm run lint

# Run tests
npm test
```

### Production Support

#### Deployment Issues
- Check Vercel deployment logs
- Verify environment variables in Vercel dashboard
- Ensure Supabase migrations are deployed

#### Performance Issues
- Monitor Supabase dashboard for query performance
- Check Vercel analytics for edge function metrics
- Review bundle size with `npm run analyze:bundle`

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [React Native Documentation](https://reactnative.dev/)
