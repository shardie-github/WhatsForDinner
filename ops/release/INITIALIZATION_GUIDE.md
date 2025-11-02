# Capacitor Initialization Guide

This guide walks through initializing Capacitor and setting up iOS/Android platforms after the web app is built.

## Prerequisites

- Node.js 18+
- pnpm 9+
- For iOS: Xcode 14+ (macOS only)
- For Android: Android Studio with Android SDK
- Java 17+

## Step 1: Build Web App

First, build the Next.js web app to generate static files:

```bash
cd apps/web
pnpm build
```

This creates the `dist` directory with static HTML/JS/CSS files.

## Step 2: Initialize Capacitor (if not already done)

```bash
cd apps/web
npx cap init "What's for Dinner?" app.whatsfordinner
```

This creates `capacitor.config.ts` (already created, but verify it points to `dist` directory).

## Step 3: Add Platforms

### iOS

```bash
npx cap add ios
```

This creates the `ios/` directory with Xcode project.

### Android

```bash
npx cap add android
```

This creates the `android/` directory with Android project.

## Step 4: Sync Web Assets

After any web build, sync assets to native platforms:

```bash
npx cap sync
```

This:
- Copies web assets to native projects
- Updates native dependencies
- Regenerates native projects

## Step 5: Configure Native Projects

### iOS Configuration

1. Open Xcode project:
   ```bash
   npx cap open ios
   ```

2. Configure signing:
   - Select project in Xcode
   - Go to "Signing & Capabilities"
   - Select your development team
   - Enable "Automatically manage signing"

3. Configure app icons:
   - Place icons in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
   - Or use Capacitor assets CLI: `npx @capacitor/assets generate`

4. Configure deep links:
   - Add URL Scheme: `whatsfordinner` in Info.plist
   - Configure Associated Domains for Universal Links

### Android Configuration

1. Open Android Studio:
   ```bash
   npx cap open android
   ```

2. Configure app icons:
   - Place icons in `android/app/src/main/res/mipmap-*`
   - Or use Capacitor assets CLI: `npx @capacitor/assets generate`

3. Configure app ID:
   - Verify `applicationId` in `android/app/build.gradle` is `app.whatsfordinner`

4. Configure deep links:
   - Add intent filters in `AndroidManifest.xml`

## Step 6: Install Native Dependencies

### iOS

```bash
cd ios/App
pod install
```

### Android

Dependencies are managed via Gradle and install automatically.

## Step 7: Test on Devices

### iOS

```bash
# Build and run on simulator
npx cap run ios

# Or open in Xcode and run from there
npx cap open ios
```

### Android

```bash
# Build and run on emulator/device
npx cap run android

# Or open in Android Studio and run from there
npx cap open android
```

## Step 8: Generate App Icons

Use Capacitor Assets CLI (recommended):

```bash
npx @capacitor/assets generate --iconPath ops/branding/appicon.svg --splashPath ops/branding/appicon.svg
```

This generates all required icon sizes for both platforms.

## Step 9: Configure Push Notifications

### iOS (APNs)

1. Create APNs Key in Apple Developer Portal
2. Download `.p8` key file
3. Store in `ops/certs/AuthKey_XXXXXXXXXX.p8`
4. Configure in `ios/App/App/Capabilities` ? Push Notifications

### Android (FCM)

1. Create Firebase project
2. Download `google-services.json`
3. Place in `android/app/google-services.json`
4. Configure in `android/app/build.gradle`

## Step 10: Configure Store Signing

### Android

1. Generate keystore:
   ```bash
   keytool -genkey -v -keystore android-release.keystore -alias whatsfordinner -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Store securely (encrypted in GitHub Secrets for CI/CD)

3. Configure in `android/app/build.gradle`:
   ```gradle
   signingConfigs {
       release {
           storeFile file('../android-release.keystore')
           storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD")
           keyAlias "whatsfordinner"
           keyPassword System.getenv("ANDROID_KEY_PASSWORD")
       }
   }
   ```

### iOS

1. Configure in Xcode ? Signing & Capabilities
2. Use App Store Connect API Key for CI/CD (no manual certs needed)

## Common Issues

### Build Errors

**iOS:**
- Ensure `pod install` ran successfully
- Check Xcode version compatibility
- Verify signing certificates

**Android:**
- Check Java version (17+)
- Verify `ANDROID_HOME` environment variable
- Check Gradle version compatibility

### Sync Issues

If native projects are out of sync:
```bash
npx cap sync --force
```

### Plugin Issues

If plugins aren't working:
1. Ensure plugins are installed: `pnpm add @capacitor/push-notifications`
2. Sync: `npx cap sync`
3. Rebuild native projects

## Next Steps

After initialization:

1. Test core functionality on real devices
2. Configure deep links and test
3. Set up push notifications
4. Test purchase flows (sandbox)
5. Complete store metadata
6. Submit for review

See `LAUNCH_RUNBOOK.md` for submission process.
