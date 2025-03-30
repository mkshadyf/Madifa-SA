# Madifa Streams Backend

This directory contains the Express.js backend API for Madifa Streams.

## Structure

- `index.ts` - Main server entry point
- `routes.ts` - API route definitions
- `db.ts` - Database connection setup
- `storage.ts` - Database operations (using Drizzle ORM)
- `vimeo.ts` - Vimeo API service integration
- `vimeo-sync.ts` - Synchronization between Vimeo and local database
- `payfast.ts` - PayFast payment gateway integration
- `firebase.ts` - Firebase integration

## API Routes

The API provides endpoints for:

- Authentication and user management
- Content retrieval and management
- Categories and organization
- Vimeo integration
- Subscriptions and payments
- User ratings and reviews
- Analytics data

## Database

The application uses PostgreSQL with Drizzle ORM for database operations. Schema definitions are located in `shared/schema.ts`.

## Authentication

Authentication is handled using JWT tokens. The authentication middleware (`authenticate` and `authenticateAdmin`) is defined in `routes.ts`.

## External Services Integration

### Vimeo

The `VimeoService` class in `vimeo.ts` provides methods for:
- Fetching videos from Vimeo
- Uploading videos to Vimeo
- Managing video metadata
- Adding captions and subtitles

### PayFast

The `PayFast` class in `payfast.ts` handles payment processing with:
- Payment initiation
- Signature generation and verification
- Notification handling
- Test mode support

## Testing

Server-side code can be tested using:
- Jest for unit tests
- Supertest for API endpoint testing

## Environment Variables

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT token generation
- `VIMEO_ACCESS_TOKEN` - Vimeo API access token
- `VIMEO_CLIENT_ID` - Vimeo API client ID
- `VIMEO_CLIENT_SECRET` - Vimeo API client secret
- `PAYFAST_MERCHANT_ID` - PayFast merchant ID (for payments)
- `PAYFAST_MERCHANT_KEY` - PayFast merchant key
- `PAYFAST_PASSPHRASE` - PayFast passphrase