# Deep Linking Setup Guide

## Overview
Deep linking allows email links to open directly in the native app instead of the browser.

## What's Already Done
✅ Installed @capacitor/app plugin
✅ Created deep link handler service
✅ Updated AndroidManifest.xml with intent filters
✅ Added deep link routing in App.tsx
✅ Created verification files for iOS and Android

## What You Need to Do

### 1. Sync Native Projects
```bash
git pull
npx cap sync
```

### 2. iOS Setup (Universal Links)

#### A. Add Associated Domains in Xcode
1. Open `ios/App/App.xcodeproj` in Xcode
2. Select your app target
3. Go to "Signing & Capabilities"
4. Click "+ Capability" and add "Associated Domains"
5. Add domain: `applinks:app.joinkasper.com`

#### B. Update apple-app-site-association file
1. Replace `TEAM_ID` in `public/.well-known/apple-app-site-association`
2. Find your Team ID in Xcode → Account → View Details
3. Upload this file to: `https://app.joinkasper.com/.well-known/apple-app-site-association`
4. File must be served with `Content-Type: application/json`
5. No file extension needed

### 3. Android Setup (App Links)

#### A. Generate SHA256 Fingerprint
```bash
# For debug key
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# For release key (when you have one)
keytool -list -v -keystore your-release-key.keystore -alias your-alias
```

#### B. Update assetlinks.json
1. Copy the SHA256 fingerprint from the keytool output
2. Replace `YOUR_SHA256_FINGERPRINT_HERE` in `public/.well-known/assetlinks.json`
3. Upload this file to: `https://app.joinkasper.com/.well-known/assetlinks.json`
4. File must be served with `Content-Type: application/json`

#### C. Verify Android App Links
```bash
adb shell pm get-app-links com.digitaltskydd.app
```

### 4. Server Configuration

Upload both verification files to your web server:
- `https://app.joinkasper.com/.well-known/apple-app-site-association`
- `https://app.joinkasper.com/.well-known/assetlinks.json`

**Important:**
- Files must be served over HTTPS
- No redirects allowed
- Correct Content-Type headers required
- Files must be publicly accessible

### 5. Testing Deep Links

#### iOS Testing
```bash
# Test with xcrun
xcrun simctl openurl booted "https://app.joinkasper.com/checklist"
```

#### Android Testing
```bash
# Test with adb
adb shell am start -W -a android.intent.action.VIEW -d "https://app.joinkasper.com/checklist" com.digitaltskydd.app
```

#### Email Testing
1. Send a test email with a link like: `https://app.joinkasper.com/checklist`
2. Open the email on your device
3. Tap the link
4. The app should open directly (not browser)

### 6. Troubleshooting

**iOS not opening app:**
- Verify apple-app-site-association is accessible
- Check Associated Domains in Xcode
- Try deleting and reinstalling the app
- Check iOS Console logs

**Android not opening app:**
- Verify assetlinks.json is accessible
- Verify SHA256 fingerprint is correct
- Run: `adb shell pm verify-app-links --re-verify com.digitaltskydd.app`
- Check logcat: `adb logcat | grep -i "digitaltskydd"`

**Both platforms:**
- Ensure verification files are served over HTTPS
- Check file has correct Content-Type
- Try incognito/private browsing to test
- Wait up to 24 hours for CDN cache to clear

### 7. Email Link Format

When creating links in your emails, use the format:
```
https://app.joinkasper.com/[route]
```

Examples:
- `https://app.joinkasper.com/checklist`
- `https://app.joinkasper.com/monitoring`
- `https://app.joinkasper.com/guides`
- `https://app.joinkasper.com/reset-password?token=xxx`

The app will automatically handle these routes!

## Summary

Phase 1 (In-App Browser): ✅ Complete - Links in app now open in-app browser
Phase 2 (Deep Linking): ⚠️ Needs server setup - Follow steps above to enable email → app opening
