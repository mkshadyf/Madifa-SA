# Madifa Technical Architecture Documentation

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Madifa Streaming Platform                    │
└─────────────────────────────────────────────────────────────────┘
                                 │
          ┌─────────────────────┴─────────────────────┐
          ▼                                           ▼
┌─────────────────────┐                   ┌─────────────────────┐
│     Frontend        │                   │     Backend         │
│  (React + Vite)     │◄──REST API────────│  (Express.js)       │
└─────────────────────┘                   └─────────────────────┘
          │                                           │
          │                                           │
          ▼                                           ▼
┌─────────────────────┐                   ┌─────────────────────┐
│  State Management   │                   │  Database Layer     │
│  (React Query,      │                   │  (Drizzle ORM,      │
│   Context API)      │                   │   PostgreSQL)       │
└─────────────────────┘                   └─────────────────────┘
          │                                           │
          ▼                                           │
┌─────────────────────┐                               │
│   UI Components     │                               │
│   (Shadcn UI,       │                               │
│    Tailwind CSS)    │                               │
└─────────────────────┘                               │
          │                                           │
          ▼                                           ▼
┌─────────────────────┐                   ┌─────────────────────┐
│ External Services   │                   │ External Services    │
│ - Vimeo Player      │                   │ - Vimeo API         │
│ - PWA Features      │                   │ - PayFast Payment   │
│ - Firebase Auth     │                   │ - Supabase Storage  │
└─────────────────────┘                   └─────────────────────┘
```

## Directory Structure

```
/
├── api/
│   └── index.js                # Serverless functions entry point
├── client/
│   ├── index.html              # Entry HTML file
│   └── src/
│       ├── App.tsx             # Main app component
│       ├── components/         # Reusable UI components
│       │   ├── ads/            # Advertisement components
│       │   ├── app/            # App-wide components
│       │   ├── auth/           # Authentication components
│       │   ├── dashboard/      # Admin dashboard components
│       │   ├── home/           # Homepage components
│       │   ├── icons/          # Custom icon components
│       │   ├── layout/         # Layout components (navbar, footer)
│       │   ├── social/         # Social sharing components
│       │   ├── ui/             # Shadcn UI components
│       │   └── video/          # Video player components
│       ├── contexts/           # React context providers
│       │   ├── AuthContext.tsx # Authentication state
│       │   ├── DataSourceContext.tsx # Data source management
│       │   └── WatchProgressContext.tsx # Video progress tracking
│       ├── hooks/              # Custom React hooks
│       ├── lib/                # Utility functions and constants
│       │   ├── animations.ts   # Animation configurations
│       │   ├── helpers.ts      # Helper functions
│       │   ├── queryClient.ts  # React Query configuration
│       │   ├── supabase.ts     # Supabase client
│       │   └── utils.ts        # General utilities
│       ├── pages/              # Page components
│       │   ├── Admin.tsx       # Admin dashboard
│       │   ├── Browse.tsx      # Content browsing
│       │   ├── Home.tsx        # Homepage
│       │   ├── Login.tsx       # Login page
│       │   ├── MovieDetails.tsx # Individual content view
│       │   ├── MyList.tsx      # User's saved content
│       │   ├── Profile.tsx     # User profile
│       │   ├── Register.tsx    # Registration page
│       │   └── Subscription.tsx # Subscription management
│       └── index.tsx           # React entry point
├── server/
│   ├── db.ts                   # Database connection
│   ├── firebase.ts             # Firebase integration
│   ├── index.ts                # Express server entry point
│   ├── payfast.ts              # PayFast payment integration
│   ├── routes.ts               # API route definitions
│   ├── storage.ts              # Storage interface
│   └── vimeo.ts                # Vimeo API integration
├── shared/
│   ├── schema.ts               # Database schema definitions
│   └── types.ts                # Shared TypeScript types
└── scripts/
    ├── create-admin.ts         # Admin user creation script
    ├── db-test.ts              # Database testing utility
    ├── import-vimeo-videos.js  # Vimeo content import
    └── update-vimeo-descriptions.ts # Content metadata updater
```

## Data Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  User Input  │────▶│ React State  │────▶│  API Request │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  UI Update   │◀────│  React Query │◀────│  Express API │
└──────────────┘     │  Cache       │     │  Handler     │
                     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
                                          ┌──────────────┐
                                          │  Drizzle ORM │
                                          └──────────────┘
                                                 │
                                                 ▼
                                          ┌──────────────┐
                                          │  PostgreSQL  │
                                          └──────────────┘
```

## Authentication Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Login Form  │────▶│  AuthContext │────▶│  /api/login  │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  UI Update   │◀────│  JWT Token   │◀────│ User Lookup  │
└──────────────┘     │  Storage     │     │ & Validation │
                     └──────────────┘     └──────────────┘
```

## Key Components

### Frontend

#### Context Providers
- **AuthContext**: Manages user authentication state and provides login/logout functionality
- **WatchProgressContext**: Tracks and persists video watching progress
- **DataSourceContext**: Controls data source for development/production environments

#### React Query Setup
- Centralized query client setup in `client/src/lib/queryClient.ts`
- API request helper functions for consistent error handling
- Cache invalidation patterns for data freshness

#### UI Component Hierarchy
- Shadcn UI as base component library
- Custom video player components with Vimeo integration
- Content cards and carousels for media browsing

### Backend

#### API Routes
- RESTful API with Express.js
- JWT authentication middleware
- Role-based access control

#### Database Schema
- Content tables (movies, series, episodes)
- User-related tables (users, subscriptions, watch history)
- Interaction tables (ratings, reviews, watch lists)

#### External Integrations
- Vimeo API for video content management
- PayFast for payment processing
- Firebase/Supabase for authentication and storage

## Development Guidelines

### State Management
- Use React Query for server state
- Use React Context for global UI state
- Use local component state for UI-specific state

### API Communication
- All API requests should use the custom `apiRequest` utility
- Requests should include appropriate error handling
- Use React Query for automatic retries and caching

### Component Design
- Prefer composition over inheritance
- Keep components focused on a single responsibility
- Use Tailwind CSS for styling

### Testing Strategy
- Jest for unit and integration tests
- Cypress for end-to-end tests
- Test critical user flows and authentication

## Deployment Process

### Web Deployment (Vercel)
1. Build frontend assets with `npm run build`
2. Deploy using Vercel CLI or GitHub integration

### Android Deployment
1. Build Android assets with Capacitor
2. Package APK for Google Play Store

## Database Migration Process

1. Update schema in `shared/schema.ts`
2. Run migration with `npm run db:push`
3. Verify schema changes

## Monitoring and Analytics

- Client-side error tracking
- API performance monitoring
- User behavior analytics

## Security Considerations

- JWT token security
- API rate limiting
- Input validation and sanitization
- Secure environment variable handling

## Performance Optimization

- Code splitting for improved load times
- Lazy loading for non-critical components
- Image optimization for faster rendering
- Caching strategies for frequent data