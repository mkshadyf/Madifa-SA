import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@shared/schema";

// Connection pooling for serverless environment
let dbInstance: ReturnType<typeof drizzle> | null = null;

// Create or reuse a database connection
export function getDb() {
  if (!dbInstance) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    
    const sql = neon(process.env.DATABASE_URL);
    dbInstance = drizzle(sql, { schema });
    console.log("Database connection initialized");
  }
  return dbInstance;
}

// For compatibility with existing code
export const db = getDb();
