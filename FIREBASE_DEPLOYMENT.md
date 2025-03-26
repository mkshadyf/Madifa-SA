# Firebase Deployment Guide for Madifa

This guide provides instructions for deploying the Madifa video streaming platform to Firebase Hosting while continuing to use Supabase for authentication.

## Architecture Overview

- **Firebase**: Used for web hosting and CDN delivery
- **Supabase**: Used for authentication, database services and storage
- **Vimeo**: Used for video content delivery
- **PayFast**: Used for payment processing

## Prerequisites

1. **Firebase Account**: Make sure you have a Firebase account and access to the `madifa-7d087` project.
2. **Firebase CLI**: You'll need the Firebase CLI tool. It's already included in the project's dependencies.
3. **Node.js and NPM**: Ensure you have Node.js (version 14 or later) and NPM installed.
4. **Supabase Project**: Continued access to your Supabase project for authentication.

## Configuration Files

The following configuration files are already set up in the repository:

- `.firebaserc` - Specifies the Firebase project to deploy to
- `firebase.json` - Contains Firebase Hosting configuration 
- `config/firebase-service-account.json` - Service account credentials for Firebase Admin SDK

## Deployment Steps

### 1. Build the Application

Build the application to generate the production-ready files:

```bash
npm run build
```

This command creates a `dist` directory containing the optimized build.

### 2. Deploy to Firebase

You can deploy to Firebase using one of the following methods:

#### Option 1: Using the Provided Script

For convenience, we've included a deployment script that handles building and deploying in one step:

```bash
./deploy-to-firebase.sh
```

#### Option 2: Manual Firebase Deployment

If you prefer to deploy manually:

```bash
# Make sure you're logged in to Firebase
npx firebase login

# Deploy to Firebase
npx firebase deploy
```

### 3. Verify the Deployment

Once deployment is complete, your application will be available at:

- https://madifa-7d087.web.app
- https://madifa-7d087.firebaseapp.com

## Custom Domain (Optional)

To use a custom domain with your Firebase Hosting:

1. Log in to the [Firebase Console](https://console.firebase.google.com/)
2. Select the Madifa project
3. Go to Hosting in the left navigation
4. Click "Add custom domain"
5. Follow the instructions to verify domain ownership and set up DNS records

## Environment Variables

The application requires several environment variables to function properly:

### For GitHub Actions Deployment:

Add the following secrets to your GitHub repository:

1. `VITE_SUPABASE_URL`: Your Supabase project URL
2. `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
3. `VITE_API_BASE_URL`: Your API base URL
4. `VITE_PAYFAST_MERCHANT_ID`: Your PayFast merchant ID
5. `VITE_PAYFAST_MERCHANT_KEY`: Your PayFast merchant key
6. `VITE_VIMEO_API_KEY`: Your Vimeo API key
7. `FIREBASE_SERVICE_ACCOUNT`: JSON content of your Firebase service account file (formatted as a single line)

### For Local Development:

Create a `.env` file in the root directory with the following variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=your_api_base_url
VITE_PAYFAST_MERCHANT_ID=your_payfast_merchant_id
VITE_PAYFAST_MERCHANT_KEY=your_payfast_merchant_key
VITE_VIMEO_API_KEY=your_vimeo_api_key
```

### For Firebase Service Account:

1. In the Firebase Console, go to Project Settings > Service accounts
2. Click "Generate new private key" to download a new service account key
3. Save this file securely as `config/firebase-service-account.json`

## Continuous Deployment (CI/CD)

For setting up continuous deployment with GitHub:

1. In the Firebase Console, go to Hosting
2. Click "Set up GitHub Action"
3. Connect to your GitHub repository
4. Firebase will create and commit a GitHub workflow file to deploy on push

## Troubleshooting

### Common Issues

1. **Deployment Failed**: Check if your build was successful and verify the Firebase configuration files.
2. **Permission Errors**: Ensure you're logged in with an account that has the right permissions to the Firebase project.
3. **404 Not Found After Deployment**: Check your `firebase.json` file to make sure the `public` directory is correctly specified as `dist`.

### Logs

To check deployment logs:

```bash
npx firebase hosting:log
```

## Additional Resources

- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Managing Firebase Environments](https://firebase.google.com/docs/projects/multiprojects)