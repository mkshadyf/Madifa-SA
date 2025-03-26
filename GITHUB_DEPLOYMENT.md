# GitHub to Vercel Automatic Deployment Setup

This guide explains how to set up automatic deployments from GitHub to Vercel using GitHub Actions.

## Prerequisites

- A GitHub repository containing your Madifa application
- A Vercel account linked to your GitHub account
- Admin access to both GitHub repository and Vercel project

## Step 1: Obtain Vercel Deployment Tokens

1. Log in to your Vercel account
2. Go to Settings → Tokens
3. Create a new token with scope "Full Account" and copy it (this is your `VERCEL_TOKEN`)
4. Go to your Vercel project settings
5. Copy the "Project ID" (this is your `VERCEL_PROJECT_ID`)
6. Go to your Vercel team or personal account settings
7. Copy the "ID" (this is your `VERCEL_ORG_ID`)

## Step 2: Add Secrets to GitHub Repository

1. Go to your GitHub repository
2. Click on "Settings" → "Secrets and variables" → "Actions"
3. Add the following repository secrets:
   - `VERCEL_TOKEN`: Your Vercel token
   - `VERCEL_PROJECT_ID`: Your Vercel project ID
   - `VERCEL_ORG_ID`: Your Vercel organization ID

## Step 3: Add Environment Variables to Vercel

Make sure all required environment variables are added to your Vercel project:

1. Go to your Vercel project
2. Click on "Settings" → "Environment Variables"
3. Add all required environment variables:
   - `DATABASE_URL`
   - `VIMEO_API_KEY`
   - `VIMEO_API_SECRET`
   - `VIMEO_ACCESS_TOKEN`
   - `PAYFAST_MERCHANT_ID`
   - `PAYFAST_MERCHANT_KEY`
   - `PAYFAST_PASSPHRASE`

## Step 4: Push Your Code to GitHub

The workflow file at `.github/workflows/vercel-deploy.yml` will automatically trigger a deployment when you push to the main branch.

```bash
git add .
git commit -m "Set up automatic deployment to Vercel"
git push origin main
```

## Troubleshooting

If deployments fail, check the following:

1. Verify that all secrets are correctly set up in GitHub
2. Check the GitHub Actions workflow logs for any errors
3. Ensure your Vercel configuration is correct
4. Verify that your GitHub account is linked to Vercel and has proper permissions
5. Check that your environment variables are correctly set in Vercel

## Manual Deployment

You can also manually trigger a deployment by:

1. Going to your GitHub repository
2. Clicking on "Actions"
3. Selecting the "Deploy to Vercel" workflow
4. Clicking "Run workflow"