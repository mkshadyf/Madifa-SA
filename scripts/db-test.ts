import { db } from "../server/db";
import { users, categories, contents } from "../shared/schema";
import { eq } from "drizzle-orm";

async function testDatabaseConnection() {
  try {
    console.log("Testing database connection...");
    
    // Test user creation
    const [user] = await db.insert(users).values({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      fullName: "Test User",
      isPremium: false
    }).returning();
    
    console.log("Created user:", user);
    
    // Test category creation
    const [category] = await db.insert(categories).values({
      name: "Test Category",
      description: "A test category",
      thumbnailUrl: null
    }).returning();
    
    console.log("Created category:", category);
    
    // Test content creation
    const [content] = await db.insert(contents).values({
      title: "Test Content",
      description: "A test content item",
      thumbnailUrl: "https://example.com/thumbnail.jpg",
      videoUrl: "https://example.com/video.mp4",
      trailerUrl: "https://example.com/trailer.mp4",
      releaseYear: 2024,
      duration: 120,
      isPremium: false,
      rating: "PG",
      categoryId: category.id
    }).returning();
    
    console.log("Created content:", content);
    
    // Test fetching data
    const allUsers = await db.select().from(users);
    console.log("All users:", allUsers);
    
    const allCategories = await db.select().from(categories);
    console.log("All categories:", allCategories);
    
    const allContents = await db.select().from(contents);
    console.log("All contents:", allContents);
    
    console.log("Database connection and operations successful!");
  } catch (error) {
    console.error("Database test failed:", error);
  }
}

testDatabaseConnection();