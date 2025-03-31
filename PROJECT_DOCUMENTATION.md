# Madifa Streaming Platform

## Project Overview

Madifa is a dynamic South African video streaming platform that delivers localized, inclusive content experiences with advanced video interaction capabilities. The platform is designed to showcase South African cultural content including movies, short films, music videos, and trailers while providing an engaging and user-friendly experience.

## Key Features

### Content Management
- **Multiple Content Types**: Support for movies, short films, music videos, and trailers
- **Content Categorization**: Organized content structure matching Vimeo folders and tags
- **Premium and Free Content**: Tiered content access with premium subscription options
- **Continue Watching**: Feature that allows users to resume content where they left off

### User Experience
- **Responsive Design**: Mobile-first approach ensuring excellent experience across all devices
- **Multi-language Support**: Interface and content available in multiple languages
- **Advanced Captioning**: Subtitle support for improved accessibility
- **Dark Mode Theme**: Visually comfortable viewing experience
- **Personalized Recommendations**: Content suggestions based on user preferences and viewing history

### User Engagement
- **Rating System**: Allows users to rate content they've watched
- **Review System**: Enables users to share their thoughts on content
- **Watch Lists**: Users can create personalized collections of content
- **Social Sharing**: Integration with social platforms for content sharing

### Technical Features
- **Progressive Web App (PWA)**: App-like experience with offline capabilities
- **Advanced Video Player**: Custom-built player with optimized streaming
- **Vimeo Integration**: High-quality video infrastructure
- **Analytics Dashboard**: Comprehensive viewing metrics and insights
- **User Authentication**: Secure sign-up, login, and profile management
- **Subscription Management**: Payment processing and subscription handling

## System Architecture

### Frontend
- **Framework**: React.js with TypeScript
- **State Management**: Context API and React Query
- **Routing**: Wouter for lightweight route handling
- **UI Components**: Shadcn UI component library with Tailwind CSS
- **Animation**: Framer Motion for smooth transitions and interactions
- **Form Handling**: React Hook Form with Zod validation

### Backend
- **Server**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT-based authentication with role-based access control
- **Storage**: Supabase for media asset storage
- **APIs**: RESTful API architecture

### Integration Services
- **Video Hosting**: Vimeo API integration
- **Payment Processing**: PayFast integration for subscription payments
- **Authentication**: Firebase Authentication (optional)
- **Analytics**: Custom analytics tracking

## User Roles and Permissions

### Anonymous Users
- Browse content catalog
- View content details
- Register for an account
- Access free content

### Registered Users
- All anonymous user capabilities
- Create and manage a profile
- Rate and review content
- Create and manage watch lists
- Track viewing history
- Access content based on subscription level

### Premium Users
- All registered user capabilities
- Access premium content
- Ad-free viewing experience
- Enhanced video quality options
- Download content for offline viewing

### Admin Users
- All premium user capabilities
- Content management
- User management
- Review moderation
- Analytics access
- System configuration

## Content Organization

The content on Madifa is organized into the following main categories:

1. **Movies**: Full-length feature films
   - Includes subcategories: Short Films and Trailers
   
2. **Music Videos**: Musical content from South African artists

Content can be filtered by:
- Content type
- Genre/category
- Release year
- Rating
- Premium/free status

## User Interface

### Navigation
The main navigation includes:
- **Home**: Featured and recommended content
- **Movies**: All movies, including dropdown access to short films and trailers
- **Music Videos**: Collection of music videos
- **My List**: User's saved content
- **Downloads**: Content available offline (premium users)

### Layout
- Responsive grid layout adjusting from 1 to 5 columns based on screen size
- Card-based content display with hover effects for desktop
- Optimized thumbnail view for mobile devices
- Dark theme design for comfortable viewing

## Development Guidelines

### Code Structure
- **Client-side**: Component-based architecture with clear separation of concerns
- **Server-side**: Modular API routes with middleware for authentication
- **Shared**: Common types and utilities shared between client and server

### Best Practices
- TypeScript for type safety throughout the application
- React Query for efficient API data fetching and caching
- Responsive design principles for all UI components
- Accessibility considerations for inclusive user experience

## Deployment

The application supports multiple deployment options:

### Web Deployment
- Vercel for hosting the web application
- Automated deployments from GitHub

### Mobile Deployment
- Android app using Capacitor
- Progressive Web App for all platforms

## Environment Configuration

The application requires the following environment variables:

### Database Connection
- `DATABASE_URL`: PostgreSQL connection string

### External Services
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- `VITE_SUPABASE_SERVICE_KEY`: Supabase service key
- `SUPABASE_JWT_SECRET`: JWT secret for authentication

### Payment Processing
- `PAYFAST_MERCHANT_ID`: PayFast merchant ID
- `PAYFAST_MERCHANT_KEY`: PayFast merchant key
- `PAYFAST_PASSPHRASE`: PayFast passphrase

### Firebase Configuration (if used)
- `VITE_FIREBASE_API_KEY`: Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN`: Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID`: Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET`: Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID`: Firebase app ID
- `VITE_FIREBASE_MEASUREMENT_ID`: Firebase measurement ID

## User Journey

### New User Experience
1. User visits Madifa platform
2. Browses available content catalog
3. Views details about specific content
4. Creates an account to access free content
5. Receives personalized content recommendations
6. Upgrades to premium for full content access

### Returning User Experience
1. User logs into their account
2. Sees "Continue Watching" section to resume content
3. Receives updated recommendations based on viewing history
4. Manages their watchlist and profile
5. Rates and reviews content they've watched

## Technical Maintenance

### Database Migrations
- Use Drizzle ORM for schema management and migrations
- Run migrations with `npm run db:push`

### Content Synchronization
- Automated Vimeo content synchronization scripts
- Category and tag management system

### Performance Monitoring
- Client-side performance tracking
- API response time monitoring
- Error logging and reporting

## Roadmap for Future Development

### Phase 1 (Current Implementation)
- Core platform functionality
- Basic content management
- User authentication and profiles
- Subscription system

### Phase 2 (Planned)
- Enhanced recommendation algorithms
- Expanded content library
- Advanced analytics dashboard
- Improved mobile experience

### Phase 3 (Future)
- Live streaming capabilities
- Creator platform for content submission
- Community features
- Enhanced offline capabilities

## Support and Documentation

### Technical Support
- System administrator documentation
- Troubleshooting guides
- API documentation

### User Support
- FAQ section
- User guides
- Contact information for assistance

### Developer Resources
- Codebase documentation
- Component library
- API endpoints and usage

## Conclusion

The Madifa streaming platform provides a comprehensive solution for delivering South African cultural content to a global audience. With its focus on performance, user experience, and content management, it offers both users and administrators a powerful yet intuitive platform for engaging with high-quality media content.