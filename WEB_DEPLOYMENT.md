# Web Deployment Guide for Madifa

This guide explains how to deploy the Madifa video streaming platform to various web hosting providers.

## Deployment to Vercel (Recommended)

### Option 1: Direct Deployment

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy the application:
   ```bash
   ./deploy-to-vercel.sh
   ```

4. Add environment variables in the Vercel dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add all required environment variables:
     - `DATABASE_URL`
     - `VIMEO_API_KEY`
     - `VIMEO_API_SECRET`
     - `VIMEO_ACCESS_TOKEN`
     - `PAYFAST_MERCHANT_ID`
     - `PAYFAST_MERCHANT_KEY`
     - `PAYFAST_PASSPHRASE`

### Option 2: GitHub Integration (Continuous Deployment)

See the detailed instructions in [GITHUB_DEPLOYMENT.md](./GITHUB_DEPLOYMENT.md)

## Alternative Deployment Options

### Deploying to Netlify

1. Install the Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Create a `netlify.toml` file in the root directory:
   ```toml
   [build]
     command = "npm run build"
     publish = "client/dist"
     functions = "netlify/functions"

   [dev]
     command = "npm run dev"
     port = 5000
     publish = "client/dist"

   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/api/:splat"
     status = 200

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

4. Create a Netlify serverless function for the API:
   - Create a directory: `mkdir -p netlify/functions`
   - Create a file: `netlify/functions/api.js` that exports your Express app

5. Deploy to Netlify:
   ```bash
   netlify deploy --prod
   ```

### Deploying to Digital Ocean App Platform

1. Sign up for Digital Ocean and create a new App
2. Connect to your GitHub repository
3. Configure the build settings:
   - Build Command: `npm run build`
   - Output Directory: `client/dist`
4. Add environment variables in the Digital Ocean dashboard
5. Deploy the application

## Troubleshooting Common Deployment Issues

### "Not Found" Error After Deployment

1. Check that your `vercel.json` configuration has the correct routes
2. Verify that the build process completed successfully
3. Ensure that environment variables are properly set
4. Check that database connections are properly configured

### CORS Issues

If you encounter CORS errors:

1. Ensure your API is setting the correct CORS headers
2. Verify that frontend requests are using the correct API URL
3. Check for any proxy configuration issues

### Database Connection Issues

1. Verify that your `DATABASE_URL` environment variable is correctly set
2. Ensure that your database allows connections from your deployment environment
3. Check that all required database tables are created

## Post-Deployment Verification

After deployment, verify that:

1. The application loads correctly
2. User authentication works
3. Video playback functions as expected
4. Payment processing is operational
5. Admin features are accessible to administrators