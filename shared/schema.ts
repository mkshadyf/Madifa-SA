import { pgTable, text, serial, integer, boolean, timestamp, json, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  isPremium: boolean("is_premium").default(false),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  supabaseId: text("supabase_id").unique(),
  provider: text("provider"), // 'email', 'google', 'facebook', etc.
});

// Content table for movies/videos
export const contents = pgTable("contents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  videoUrl: text("video_url").notNull(),
  trailerUrl: text("trailer_url").notNull(),
  releaseYear: integer("release_year").notNull(),
  duration: integer("duration"),
  isPremium: boolean("is_premium").default(false),
  contentType: text("content_type").default("movie").notNull(), // 'movie', 'series', 'music_video', 'trailer', 'short_film'
  displayPriority: integer("display_priority").default(0), // Used for featuring content
  vimeoId: text("vimeo_id"), // Store the Vimeo ID for direct API access
  rating: text("rating"),
  categoryId: integer("category_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: json("metadata"), // For additional content-specific data
  averageRating: integer("average_rating"),
  reviewCount: integer("review_count").default(0),
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
});

// Watchlist table
export const watchlist = pgTable("watchlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  contentId: integer("content_id").notNull(),
  addedAt: timestamp("added_at").defaultNow(),
});

// Watch history table
export const watchHistory = pgTable("watch_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  contentId: integer("content_id").notNull(),
  progress: integer("progress").default(0),
  lastWatched: timestamp("last_watched").defaultNow(),
  deviceId: text("device_id"),
});

// Subscriptions table
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  planId: text("plan_id").notNull(),
  planType: text("plan_type"),  // "monthly" or "annual"
  status: text("status").notNull(),
  amount: integer("amount"),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  paymentId: text("payment_id"),
  paymentReference: text("payment_reference"),
});

// Captions table
export const captions = pgTable("captions", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").notNull(),
  language: text("language").notNull(),
  label: text("label").notNull(),
  fileUrl: text("file_url").notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Ratings table
export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  contentId: integer("content_id").notNull(),
  rating: integer("rating").notNull(), // 1-5 star rating
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  contentId: integer("content_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isVisible: boolean("is_visible").default(true), // For moderation
  likeCount: integer("like_count").default(0),
});

// Social shares table
export const socialShares = pgTable("social_shares", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  contentId: integer("content_id").notNull(),
  platform: text("platform").notNull(), // e.g. facebook, twitter, whatsapp
  sharedAt: timestamp("shared_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  fullName: true,
  avatarUrl: true,
  isPremium: true,
  isAdmin: true,
  supabaseId: true,
  provider: true,
});

export const insertContentSchema = createInsertSchema(contents).pick({
  title: true,
  description: true,
  thumbnailUrl: true,
  videoUrl: true,
  trailerUrl: true,
  releaseYear: true,
  duration: true,
  isPremium: true,
  contentType: true,
  displayPriority: true,
  vimeoId: true,
  rating: true,
  categoryId: true,
  metadata: true,
  averageRating: true,
  reviewCount: true,
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  description: true,
  thumbnailUrl: true,
});

export const insertWatchlistSchema = createInsertSchema(watchlist).pick({
  userId: true,
  contentId: true,
});

export const insertWatchHistorySchema = createInsertSchema(watchHistory).pick({
  userId: true,
  contentId: true,
  progress: true,
  deviceId: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).pick({
  userId: true,
  planId: true,
  planType: true,
  status: true,
  amount: true,
  startDate: true,
  endDate: true,
  paymentId: true,
  paymentReference: true,
});

export const insertCaptionSchema = createInsertSchema(captions).pick({
  contentId: true,
  language: true,
  label: true,
  fileUrl: true,
  isDefault: true,
});

export const insertRatingSchema = createInsertSchema(ratings).pick({
  userId: true,
  contentId: true,
  rating: true,
});

export const insertReviewSchema = createInsertSchema(reviews).pick({
  userId: true,
  contentId: true,
  title: true,
  content: true,
  isVisible: true,
});

export const insertSocialShareSchema = createInsertSchema(socialShares).pick({
  userId: true,
  contentId: true,
  platform: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Content = typeof contents.$inferSelect;
export type InsertContent = z.infer<typeof insertContentSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Watchlist = typeof watchlist.$inferSelect;
export type InsertWatchlist = z.infer<typeof insertWatchlistSchema>;

export type WatchHistory = typeof watchHistory.$inferSelect;
export type InsertWatchHistory = z.infer<typeof insertWatchHistorySchema>;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

export type Caption = typeof captions.$inferSelect;
export type InsertCaption = z.infer<typeof insertCaptionSchema>;

export type Rating = typeof ratings.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type SocialShare = typeof socialShares.$inferSelect;
export type InsertSocialShare = z.infer<typeof insertSocialShareSchema>;
