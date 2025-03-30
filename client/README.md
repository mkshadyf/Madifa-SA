# Madifa Streams Frontend

This directory contains the frontend React application for Madifa Streams.

## Structure

- `/src` - Source code
  - `/components` - Reusable components
    - `/ui` - Shadcn UI components
    - `/layout` - Layout components (headers, footers, etc.)
    - `/auth` - Authentication-related components
    - `/video` - Video player and related components
  - `/pages` - Page components
    - `/admin` - Admin dashboard pages
  - `/contexts` - React contexts
  - `/hooks` - Custom React hooks
  - `/lib` - Utility functions
  - `/styles` - CSS and styling files

## Component Architecture

The application uses a component-based architecture with:
- Shadcn UI for base components
- Custom components built on top of Shadcn UI
- Context API for state management
- React Query for data fetching and caching

## Admin Dashboard

The admin dashboard includes the following sections:
- Content Management
- Vimeo Integration
- Analytics
- User Management
- Subscription Management
- Settings

## Theme Customization

The theme is defined in `theme.json` and uses:
- Tailwind CSS for styling
- CSS variables for dynamic theming
- Light and dark mode support

## Testing

Components can be tested using:
- Jest for unit tests
- React Testing Library for component tests
- Cypress for end-to-end tests

## Adding New Features

When adding new features:
1. Create components in the appropriate directory
2. Use existing contexts or create new ones as needed
3. Add routes in `App.tsx`
4. Update tests