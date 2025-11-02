# Launch Runbook: What's for Dinner? Mobile Apps

## Pre-Launch Checklist (T-7 Days)

### Store Accounts & Credentials
- [ ] Google Play Console account verified
- [ ] App Store Connect account verified
- [ ] Developer program memberships active
- [ ] API keys generated (App Store Connect API Key)
- [ ] Service account JSON for Play Console created
- [ ] Keystore generated and backed up securely
- [ ] Signing certificates backed up

### Store Listings
- [ ] App name finalized: "What's for Dinner?"
- [ ] Short description written (<80 chars)
- [ ] Full description written (4000 chars max)
- [ ] Keywords selected (100 chars, comma-separated)
- [ ] Screenshots captured (all required sizes)
- [ ] Feature graphic created (Google Play)
- [ ] App icon finalized (all densities)
- [ ] Privacy Policy hosted and linked
- [ ] Terms of Service hosted and linked
- [ ] Support URL configured

### Compliance
- [ ] Privacy Policy reviewed by legal
- [ ] Terms of Service reviewed by legal
- [ ] Data Safety form completed (Google)
- [ ] Privacy Nutrition Labels completed (Apple)
- [ ] Age rating questionnaire completed
- [ ] Export Compliance form completed (Apple)
- [ ] Content rating completed (Google)

### Testing
- [ ] Internal testing completed
- [ ] TestFlight external testing completed
- [ ] Play Closed Testing completed
- [ ] QA checklist signed off
- [ ] Beta tester feedback incorporated

## Launch Day (T-0)

### Morning (9:00 AM)
1. **Final Build Verification**
   ```bash
   # Check build numbers
   # Android: versionCode in build.gradle
   # iOS: CFBundleVersion in Info.plist
   
   # Verify build artifacts
   ls -lh apps/web/android/app/build/outputs/bundle/release/*.aab
   ls -lh apps/web/ios/*.ipa
   ```

2. **Store Metadata Review**
   - [ ] Double-check all screenshots are correct
   - [ ] Verify descriptions have no typos
   - [ ] Check pricing is correct
   - [ ] Confirm support URLs work

3. **Backend Readiness**
   - [ ] API endpoints verified
   - [ ] Database migrations applied
   - [ ] Environment variables set
   - [ ] Monitoring dashboards active
   - [ ] Error tracking enabled

### Mid-Day (12:00 PM)

4. **Submit to Stores**
   
   **Google Play:**
   ```bash
   cd ops/fastlane
   fastlane android production
   ```
   - [ ] AAB uploaded successfully
   - [ ] Release notes added
   - [ ] Staged rollout enabled (5% ? 10% ? 50% ? 100%)
   - [ ] Submit for review

   **App Store:**
   ```bash
   cd ops/fastlane
   fastlane ios production
   ```
   - [ ] IPA uploaded successfully
   - [ ] Release notes added
   - [ ] Submit for review
   - [ ] Set release date/time

5. **Internal Communication**
   - [ ] Notify team of submission
   - [ ] Share tracking links
   - [ ] Set up monitoring alerts

### Afternoon (3:00 PM)

6. **Post-Submission Tasks**
   - [ ] Monitor submission status
   - [ ] Check for immediate rejections
   - [ ] Respond to any review questions
   - [ ] Set up analytics dashboards
   - [ ] Prepare marketing assets

## Launch +1 Day

7. **Store Review Status**
   - [ ] Check Play Console review status
   - [ ] Check App Store Connect review status
   - [ ] Respond to any reviewer questions
   - [ ] Address any rejections immediately

8. **Prepare for Approval**
   - [ ] Marketing materials ready
   - [ ] Social media posts scheduled
   - [ ] Email campaigns prepared
   - [ ] Press kit finalized

## Launch +2-7 Days (Review Period)

9. **Monitor & Respond**
   - [ ] Daily check of review status
   - [ ] Respond to reviewer feedback within 24h
   - [ ] Test app on fresh devices
   - [ ] Monitor crash reports
   - [ ] Check analytics for issues

## Launch Approval (Go Live)

10. **Final Approval Steps**
    
    **Google Play:**
    - [ ] Review approved
    - [ ] Confirm staged rollout percentage
    - [ ] Monitor initial installs
    - [ ] Check crash reports
    - [ ] Monitor analytics

    **App Store:**
    - [ ] Review approved
    - [ ] Confirm release date/time
    - [ ] App goes live
    - [ ] Monitor initial installs
    - [ ] Check crash reports

11. **Go-Live Communication**
    - [ ] Announce on social media
    - [ ] Send email to user base
    - [ ] Update website with app links
    - [ ] Notify internal team

12. **Immediate Post-Launch (First 4 Hours)**
    - [ ] Monitor crash reports every 30 minutes
    - [ ] Check analytics for anomalies
    - [ ] Monitor server logs
    - [ ] Watch for negative reviews
    - [ ] Be ready to hotfix if critical issues

## Rollback Procedure

### If Critical Bug Found

**Immediate Actions (< 1 hour):**
1. Identify severity and impact
2. Notify stakeholders
3. Decide: hotfix vs rollback

**Rollback Steps:**

**Google Play:**
```bash
# Pause staged rollout
# In Play Console: Release ? Production ? Pause rollout

# Or rollback to previous version
fastlane android rollback
```

**App Store:**
```bash
# Remove from sale (takes ~24h to process)
# In App Store Connect: App ? Remove from Sale

# Or submit expedited review for hotfix
fastlane ios hotfix
```

**Communication:**
- Post in-app notification if possible
- Update status page
- Communicate via support channels

## Hotfix Procedure

### For Critical Bugs

1. **Create Hotfix Branch**
   ```bash
   git checkout -b hotfix/v1.0.1
   ```

2. **Fix & Test**
   - Fix bug
   - Write test
   - Test on device
   - Get QA sign-off

3. **Build & Submit**
   ```bash
   # Increment build number
   # Android: versionCode +1
   # iOS: CFBundleVersion +1
   
   # Build
   pnpm build:web
   pnpm cap:build:android  # or ios
   
   # Submit
   fastlane android production  # with expedited review request
   ```

4. **Expedited Review Request (iOS)**
   - Submit request via App Store Connect
   - Explain criticality
   - Apple typically responds within hours

## Post-Launch Week 1

### Daily Monitoring
- [ ] Crash rate < 1%
- [ ] ANR rate < 0.5% (Android)
- [ ] App Store rating > 4.0
- [ ] Review response rate > 80%
- [ ] Purchase conversion tracking
- [ ] Push notification delivery rates

### Metrics to Track
- Daily Active Users (DAU)
- Retention (D1, D7, D30)
- Crash-free sessions
- Purchase conversion rate
- Average session duration
- Feature adoption rates

### Weekly Review
- [ ] User feedback analysis
- [ ] Crash report prioritization
- [ ] Performance optimization opportunities
- [ ] Feature usage analytics
- [ ] Revenue metrics

## Store Maintenance

### Regular Updates
- **Schedule:** Monthly or as needed
- **Process:**
  1. Collect user feedback
  2. Prioritize bugs/features
  3. Develop update
  4. Test thoroughly
  5. Submit to stores
  6. Monitor release

### Required Updates
- Fix critical bugs
- Address security vulnerabilities
- Comply with OS updates
- Update privacy policies
- Renew certificates/credentials

## Emergency Contacts

### Technical Escalation
- **On-Call Engineer:** [Contact Info]
- **Backend Team:** [Contact Info]
- **DevOps:** [Contact Info]

### Store Support
- **Google Play Support:** [URL]
- **App Store Developer Support:** [URL]

### Legal/Compliance
- **Legal Team:** [Contact Info]
- **Privacy Officer:** [Contact Info]

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Next Review:** After first launch
