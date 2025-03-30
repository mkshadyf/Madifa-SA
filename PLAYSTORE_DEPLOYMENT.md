# Deploying Madifa to Google Play Store

This guide outlines the steps to bundle and deploy the Madifa app to the Google Play Store.

## Prerequisites

Before you begin, ensure you have:

1. A Google Play Developer account ($25 one-time fee)
2. Node.js and npm installed
3. JDK 11 or higher installed
4. Android Studio installed (optional, but recommended)
5. Android SDK installed and configured

## Build Setup

This project uses Capacitor to package the web app as an Android application.

## Generating the App Bundle

1. Make sure the web app is working correctly locally
2. Run the build script:

```bash
chmod +x build-android.sh
./build-android.sh
```

This will:
- Build the web app
- Initialize Capacitor (if not already done)
- Sync the web content to the Android project
- Build a release App Bundle (AAB) file

The AAB file will be generated at:
```
android/app/build/outputs/bundle/release/app-release.aab
```

## Signing the App

For security, the app needs to be signed with a keystore file. The build script uses a keystore file defined in `capacitor.config.ts`.

To create a new keystore:

```bash
keytool -genkey -v -keystore android/madifa.keystore -alias madifa -keyalg RSA -keysize 2048 -validity 10000
```

**IMPORTANT:** Keep your keystore file safe and remember your passwords. If you lose them, you won't be able to update your app.

## Publishing to Play Store

1. Login to the [Google Play Console](https://play.google.com/console)
2. Create a new application
3. Fill out the required information:
   - App name: Madifa
   - Default language
   - App or game: App
   - Free or paid: Choose appropriate option

4. Complete the store listing:
   - Provide short and full descriptions
   - Upload screenshots for different device types
   - Upload a high-resolution icon (512x512 px)
   - Add a feature graphic (1024x500 px)

5. Set up your app's content rating by completing the questionnaire

6. Navigate to "Production" > "Create new release"
7. Upload the AAB file generated earlier
8. Add release notes
9. Roll out the release

## App Updates

For future updates:

1. Make your changes to the web app
2. Update the version number in `package.json`
3. Run the build script again to generate a new AAB
4. Create a new release in the Play Console
5. Upload the new AAB file
6. Add release notes describing the changes
7. Roll out the update

## Troubleshooting

If you encounter issues:

1. Check that all environment paths are set correctly
2. Ensure the app works correctly on the web before bundling
3. If you get signing errors, verify your keystore information
4. If the app crashes on Android, check browser compatibility

## Additional Resources

- [Capacitor Android Documentation](https://capacitorjs.com/docs/android)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)
- [App Signing by Google Play](https://developer.android.com/studio/publish/app-signing#app-signing-google-play)