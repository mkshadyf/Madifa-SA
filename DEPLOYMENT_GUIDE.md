# Madifa Deployment Guide

This guide provides instructions for deploying the Madifa streaming platform to various environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Web Deployment](#web-deployment)
5. [Android Deployment](#android-deployment)
6. [Environment Variables](#environment-variables)
7. [Monitoring Setup](#monitoring-setup)
8. [Backup Procedures](#backup-procedures)
9. [Scaling Considerations](#scaling-considerations)

## Prerequisites

Before deployment, ensure you have:

- Node.js 18+ installed
- PostgreSQL 14+ database access
- Vimeo Pro account with API access
- PayFast merchant account
- Supabase project (optional)
- Firebase project (optional)
- Vercel account for web deployment
- Google Play Developer account for Android deployment

## Environment Setup

### Development Environment

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/madifa.git
   cd madifa
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy example environment file:
   ```bash
   cp .env.example .env
   ```

4. Fill in environment variables (see [Environment Variables](#environment-variables) section)

5. Start development server:
   ```bash
   npm run dev
   ```

### Production Environment

1. Ensure you have a production-ready PostgreSQL database
2. Configure all required environment variables in your deployment platform
3. Set `NODE_ENV=production`

## Database Setup

### Initial Database Setup

1. Create a PostgreSQL database:
   ```sql
   CREATE DATABASE madifa;
   ```

2. Configure database connection in `.env`:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/madifa
   ```

3. Run database schema push:
   ```bash
   npm run db:push
   ```

### Database Migrations

For future schema changes:

1. Update `shared/schema.ts` with new schema definitions
2. Run database migration:
   ```bash
   npm run db:push
   ```

### Creating an Admin User

1. Run the admin user creation script:
   ```bash
   npm run create-admin -- --username=admin --password=secure_password --email=admin@example.com
   ```

## Web Deployment

### Deploying to Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy the application:
   ```bash
   npm run deploy-to-vercel
   ```
   
   Alternatively, you can use the convenience script:
   ```bash
   ./deploy-to-vercel.sh
   ```

4. Configure environment variables in the Vercel dashboard

### Deploying to Firebase Hosting

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase:
   ```bash
   firebase init
   ```

4. Deploy to Firebase:
   ```bash
   npm run deploy-to-firebase
   ```
   
   Alternatively, use the convenience script:
   ```bash
   ./deploy-to-firebase.sh
   ```

## Android Deployment

### Building the Android App

1. Install required dependencies:
   ```bash
   npm install @capacitor/android @capacitor/cli
   ```

2. Build the web application:
   ```bash
   npm run build
   ```

3. Add Android platform:
   ```bash
   npx cap add android
   ```

4. Sync built web code to Android project:
   ```bash
   npx cap sync
   ```

5. Build the Android app:
   ```bash
   ./build-android.sh
   ```

### Deploying to Google Play Store

1. Sign the APK:
   ```bash
   ./sign-android-release.sh
   ```

2. Upload the signed APK to Google Play Console
3. Complete store listing information
4. Submit for review

## Environment Variables

The following environment variables are required for deployment:

### Core Configuration
```
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://username:password@host:port/database
```

### Supabase Configuration
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_KEY=your-service-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

### PayFast Configuration
```
PAYFAST_MERCHANT_ID=your-merchant-id
PAYFAST_MERCHANT_KEY=your-merchant-key
PAYFAST_PASSPHRASE=your-passphrase
```

### Firebase Configuration (if used)
```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### Vimeo Configuration
```
VIMEO_CLIENT_ID=your-client-id
VIMEO_CLIENT_SECRET=your-client-secret
VIMEO_ACCESS_TOKEN=your-access-token
```

### Google AdSense (if used)
```
VITE_ADSENSE_PUBLISHER_ID=your-publisher-id
VITE_ADSENSE_MULTIPLEX_SLOT=your-multiplex-slot
VITE_ADSENSE_ANYWHERE_SLOT=your-anywhere-slot
```

### Application Settings
```
VITE_WEBSITE_URL=https://your-production-domain.com
```

## Monitoring Setup

### Server Monitoring

Set up monitoring using:

1. New Relic:
   - Create a New Relic account
   - Add the New Relic agent to the application
   - Configure the `NEW_RELIC_LICENSE_KEY` environment variable

2. Datadog:
   - Create a Datadog account
   - Install the Datadog agent
   - Configure API keys in the environment

### Error Tracking

Implement error tracking with:

1. Sentry:
   - Create a Sentry project
   - Add Sentry SDK to the application
   - Configure the `SENTRY_DSN` environment variable

### Performance Monitoring

Track application performance with:

1. Lighthouse CI:
   - Set up Lighthouse CI in your CI/CD pipeline
   - Configure performance budgets

2. Web Vitals:
   - Implement Web Vitals tracking
   - Send metrics to your analytics platform

## Backup Procedures

### Database Backups

1. Scheduled automatic backups:
   ```bash
   pg_dump -U username -d madifa > madifa_backup_$(date +%Y%m%d).sql
   ```

2. Set up a cron job to run daily backups:
   ```cron
   0 2 * * * /path/to/backup/script.sh
   ```

3. Configure backup retention policy:
   - Keep daily backups for 7 days
   - Keep weekly backups for 4 weeks
   - Keep monthly backups for 12 months

### Content Backups

1. Regularly sync content metadata:
   ```bash
   npm run sync-vimeo-metadata
   ```

2. Export user data periodically:
   ```bash
   npm run export-user-data
   ```

## Scaling Considerations

### Database Scaling

1. Connection pooling:
   - Configure connection pools appropriately
   - Monitor connection usage

2. Read replicas:
   - Set up PostgreSQL read replicas for heavy read workloads
   - Update the application to use read replicas for queries

### Application Scaling

1. Horizontal scaling:
   - Deploy multiple instances behind a load balancer
   - Ensure session state is shared across instances

2. Caching:
   - Implement Redis caching for frequently accessed data
   - Configure proper cache invalidation

### Content Delivery

1. CDN setup:
   - Configure a CDN for static assets
   - Use appropriate cache headers

2. Video delivery:
   - Leverage Vimeo's CDN for video content
   - Configure appropriate quality settings based on user devices