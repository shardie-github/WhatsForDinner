# DNS Verification Guide

## Overview
This guide provides instructions for verifying and configuring DNS records for the What's for Dinner application.

## Current Status
- [ ] DNS records verified
- [ ] Domain configured
- [ ] SSL/TLS certificates verified
- [ ] CDN configuration verified

## DNS Records to Verify

### A Record (Root Domain)
```
Type: A
Name: @
Value: 76.76.21.21 (Vercel IP)
TTL: 3600
```

### CNAME Record (www subdomain)
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### CNAME Record (staging subdomain)
```
Type: CNAME
Name: staging
Value: cname.vercel-dns.com
TTL: 3600
```

## Verification Steps

### 1. Check DNS Propagation
Use online tools to verify DNS propagation:
```bash
# Using dig
dig whats-for-dinner.com

# Using nslookup
nslookup whats-for-dinner.com

# Online tools:
# - https://dnschecker.org
# - https://www.whatsmydns.net
```

### 2. Verify SSL/TLS Certificate
```bash
# Check certificate
openssl s_client -connect whats-for-dinner.com:443 -servername whats-for-dinner.com

# Verify certificate chain
curl -vI https://whats-for-dinner.com
```

Expected results:
- Certificate is valid
- Certificate chain is complete
- TLS 1.3 is supported
- No certificate warnings

### 3. Verify CDN Configuration
Check that CDN is properly configured:
```bash
# Check headers
curl -I https://whats-for-dinner.com

# Verify CDN headers:
# - CF-Cache-Status (if using Cloudflare)
# - X-Cache (if using Vercel Edge)
```

### 4. Test Domain Resolution
```bash
# Test root domain
ping whats-for-dinner.com

# Test www subdomain
ping www.whats-for-dinner.com

# Test staging
ping staging.whats-for-dinner.com
```

## Common DNS Issues

### Issue: DNS Not Propagating
**Symptoms**: Domain resolves to old IP or doesn't resolve
**Solution**: 
- Wait 24-48 hours for full propagation
- Clear DNS cache: `sudo dscacheutil -flushcache` (macOS)
- Verify DNS settings with registrar

### Issue: SSL Certificate Errors
**Symptoms**: Browser shows certificate warnings
**Solution**:
- Verify certificate is issued for correct domain
- Check certificate expiration date
- Verify DNS points to Vercel

### Issue: Subdomain Not Working
**Symptoms**: www or staging subdomain doesn't resolve
**Solution**:
- Verify CNAME records are correct
- Check subdomain configuration in Vercel
- Wait for DNS propagation

## Vercel DNS Configuration

### In Vercel Dashboard
1. Go to Project Settings ? Domains
2. Add domain: `whats-for-dinner.com`
3. Add www subdomain: `www.whats-for-dinner.com`
4. Add staging subdomain: `staging.whats-for-dinner.com`
5. Follow Vercel's DNS configuration instructions

### DNS Provider Configuration
1. Log in to domain registrar
2. Navigate to DNS management
3. Add/update DNS records as specified above
4. Save changes
5. Wait for propagation (typically 5 minutes to 48 hours)

## Testing Checklist

- [ ] Root domain resolves correctly
- [ ] www subdomain resolves correctly
- [ ] Staging subdomain resolves correctly
- [ ] SSL certificate is valid and working
- [ ] HTTPS redirect works
- [ ] No certificate warnings
- [ ] CDN is serving content
- [ ] DNS propagation complete globally

## Monitoring

### Automated DNS Monitoring
Set up monitoring to alert if DNS changes:
- Use UptimeRobot or similar service
- Monitor DNS resolution
- Alert if domain becomes unreachable

### Regular Checks
- [ ] Monthly DNS health check
- [ ] Certificate expiration monitoring (renew 30 days before expiration)
- [ ] DNS record review quarterly

## Next Steps
1. Complete DNS verification
2. Set up DNS monitoring
3. Document DNS provider and access credentials
4. Set up certificate renewal automation
