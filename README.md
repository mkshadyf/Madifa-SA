# Madifa Streams

A dynamic South African video streaming platform delivering localized, inclusive content experiences with advanced video interaction capabilities.

## Features

- React.js frontend with responsive, mobile-first design
- Express.js backend with comprehensive analytics
- Progressive Web App (PWA) with mobile optimizations
- Multi-language support with advanced captioning
- Vimeo-integrated streaming infrastructure with optimized custom video controls
- Adaptive user experience with multilingual and accessibility features
- Enhanced onboarding and profile completion mechanisms
- Secure admin user management system

## Technologies

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI components
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT-based authentication
- **Streaming**: Vimeo API integration
- **Testing**: Jest (unit tests), Cypress (e2e tests)
- **Deployment**: Vercel, Firebase (options available)

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/madifa
   JWT_SECRET=your_jwt_secret
   VIMEO_ACCESS_TOKEN=your_vimeo_access_token
   VIMEO_CLIENT_ID=your_vimeo_client_id
   VIMEO_CLIENT_SECRET=your_vimeo_client_secret
   ```

4. Set up the database:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

- `/client` - Frontend React application
- `/server` - Express.js backend API
- `/shared` - Shared types and utilities
- `/scripts` - Utility scripts for database operations and imports
- `/types` - TypeScript type definitions
- `/tests` - Test files
- `/cypress` - End-to-end test files

## Testing

### Unit Tests

Run unit tests using Jest:

```bash
npm run test
```

### End-to-End Tests

Run Cypress tests:

```bash
npm run test:e2e
```

## Deployment Options

- **Vercel**: Follow instructions in [WEB_DEPLOYMENT.md](WEB_DEPLOYMENT.md)
- **Firebase**: Follow instructions in [FIREBASE_DEPLOYMENT.md](FIREBASE_DEPLOYMENT.md)
- **GitHub Pages**: Follow instructions in [GITHUB_DEPLOYMENT.md](GITHUB_DEPLOYMENT.md)

## Admin Dashboard

Access the admin dashboard at `/admin` with an admin account to:
- Manage content and categories
- View analytics
- Configure system settings
- Manage user subscriptions and payments
- Import videos from Vimeo

## License

All rights reserved.