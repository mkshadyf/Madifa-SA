# Madifa Streams Shared Files

This directory contains shared files used by both the frontend and backend.

## Contents

- `schema.ts` - Database schema definitions using Drizzle ORM
- `types.ts` - Shared TypeScript types and interfaces

## Database Schema

The database schema is defined using Drizzle ORM in `schema.ts`. The schema includes tables for:

- Users
- Content (videos, movies, etc.)
- Categories
- Subscriptions and plans
- Payments and transactions
- User interactions (ratings, reviews)

## Types

Shared types in `types.ts` include:

- Request and response types for API endpoints
- Entity types that match the database schema
- Enums for content types, subscription statuses, and more

## Usage

These shared files ensure type consistency between the frontend and backend. They should be imported where needed:

```typescript
// In frontend components
import { User, ContentItem } from '@shared/types';

// In backend routes
import { users, content } from '@shared/schema';
```

## Modifying the Schema

When making changes to the database schema:

1. Update the table definitions in `schema.ts`
2. Update any corresponding types in `types.ts`
3. Run migrations to update the database:
   ```bash
   npm run db:push
   ```

## Best Practices

- Always keep frontend and backend types in sync
- Use Zod schemas for validation alongside TypeScript types
- Create insert schemas using `createInsertSchema` from `drizzle-zod`
- Define select types using `typeof table.$inferSelect`