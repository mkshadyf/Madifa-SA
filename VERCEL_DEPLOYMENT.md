# Deploying Madifa to Vercel

This guide explains how to deploy the Madifa video streaming platform to Vercel using our custom configuration.

## Prerequisites

- A Vercel account
- The Madifa codebase
- Environment variables (DATABASE_URL, VIMEO credentials, PAYFAST credentials)

## Deployment Configuration

The Madifa application is a full-stack application with:
- React frontend (client)
- Express.js backend (server)
- PostgreSQL database (external)

Our Vercel deployment is configured using:
1. `vercel.json` - Defines build settings and routing rules
2. `vercel-build.sh` - Custom build script that handles both frontend and backend builds
3. `.vercel/output/config.json` - Advanced routing configuration

## Deployment Steps

1. **Connect your GitHub repository to Vercel**
   - Create a new project in Vercel
   - Connect it to your GitHub repository
   - For the framework preset, select "Other"

2. **Configure environment variables**
   - Add all required environment variables in Vercel's project settings
   - Required variables include:
     - `DATABASE_URL`
     - `VIMEO_API_KEY`
     - `VIMEO_API_SECRET`
     - `VIMEO_ACCESS_TOKEN`
     - `PAYFAST_MERCHANT_ID`
     - `PAYFAST_MERCHANT_KEY`
     - `PAYFAST_PASSPHRASE`

3. **Deploy**
   - Trigger a deployment from the Vercel dashboard or push changes to your GitHub repository

## Troubleshooting

If you encounter a 404 error after deployment:
1. Check the Vercel logs for build errors
2. Verify that all environment variables are correctly set
3. Ensure that the database is accessible from Vercel's servers
4. Check the Function logs in Vercel for runtime errors

## Manually Deploying

You can also manually deploy using the Vercel CLI:

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Deploying Express.js to Vercel](https://vercel.com/guides/using-express-with-vercel)
- [Environment Variables in Vercel](https://vercel.com/docs/concepts/projects/environment-variables)