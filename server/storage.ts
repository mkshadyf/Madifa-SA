import {
  users, contents, categories, watchlist, watchHistory, subscriptions, captions,
  ratings, reviews, socialShares,
  type User, type InsertUser, 
  type Content, type InsertContent,
  type Category, type InsertCategory,
  type Watchlist, type InsertWatchlist,
  type WatchHistory, type InsertWatchHistory,
  type Subscription, type InsertSubscription,
  type Caption, type InsertCaption,
  type Rating, type InsertRating,
  type Review, type InsertReview,
  type SocialShare, type InsertSocialShare
} from "@shared/schema";
import { db } from "./db";
import { eq, and, count, avg, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserSubscription(userId: number, isPremium: boolean): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>; // Added for admin
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>; // Added for admin
  
  // Content methods
  getContent(id: number): Promise<Content | undefined>;
  getAllContents(): Promise<Content[]>;
  getContentsByCategory(categoryId: number): Promise<Content[]>;
  getPremiumContents(): Promise<Content[]>;
  getFreeContents(): Promise<Content[]>;
  createContent(content: InsertContent): Promise<Content>;
  updateContent(id: number, contentData: Partial<Content>): Promise<Content | undefined>; // Added for admin
  deleteContent(id: number): Promise<void>; // Added for admin
  
  // Category methods
  getCategory(id: number): Promise<Category | undefined>;
  getAllCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, categoryData: Partial<Category>): Promise<Category | undefined>; // Added for admin
  deleteCategory(id: number): Promise<void>; // Added for admin
  
  // Watchlist methods
  getWatchlist(userId: number): Promise<(Watchlist & { content: Content })[]>;
  addToWatchlist(item: InsertWatchlist): Promise<Watchlist>;
  removeFromWatchlist(userId: number, contentId: number): Promise<void>;
  
  // Watch history methods
  getWatchHistory(userId: number): Promise<(WatchHistory & { content: Content })[]>;
  updateWatchHistory(item: InsertWatchHistory): Promise<WatchHistory>;
  
  // Subscription methods
  getSubscription(userId: number): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, status: string, endDate?: Date, paymentReference?: string): Promise<Subscription | undefined>;
  
  // Captions methods
  getCaptions(contentId: number): Promise<Caption[]>;
  getCaption(id: number): Promise<Caption | undefined>;
  createCaption(caption: InsertCaption): Promise<Caption>;
  updateCaption(id: number, captionData: Partial<Caption>): Promise<Caption | undefined>;
  deleteCaption(id: number): Promise<void>;
  
  // Ratings methods
  getRatings(contentId: number): Promise<Rating[]>;
  getRating(id: number): Promise<Rating | undefined>;
  getUserRating(userId: number, contentId: number): Promise<Rating | undefined>;
  createRating(rating: InsertRating): Promise<Rating>;
  updateRating(id: number, ratingData: Partial<Rating>): Promise<Rating | undefined>;
  deleteRating(id: number): Promise<void>;
  getAverageRating(contentId: number): Promise<number>;
  
  // Reviews methods
  getReviews(contentId: number): Promise<(Review & { user: User })[]>;
  getReview(id: number): Promise<Review | undefined>;
  getUserReview(userId: number, contentId: number): Promise<Review | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: number, reviewData: Partial<Review>): Promise<Review | undefined>;
  deleteReview(id: number): Promise<void>;
  
  // Social Share methods
  getSocialShares(contentId: number): Promise<SocialShare[]>;
  getUserSocialShares(userId: number): Promise<SocialShare[]>;
  createSocialShare(share: InsertSocialShare): Promise<SocialShare>;
  deleteSocialShare(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private usersData: Map<number, User>;
  private contentsData: Map<number, Content>;
  private categoriesData: Map<number, Category>;
  private watchlistData: Map<number, Watchlist>;
  private watchHistoryData: Map<number, WatchHistory>;
  private subscriptionsData: Map<number, Subscription>;
  private captionsData: Map<number, Caption>;
  private ratingsData: Map<number, Rating>;
  private reviewsData: Map<number, Review>;
  private socialSharesData: Map<number, SocialShare>;
  private currentId: Record<string, number>;

  constructor() {
    this.usersData = new Map();
    this.contentsData = new Map();
    this.categoriesData = new Map();
    this.watchlistData = new Map();
    this.watchHistoryData = new Map();
    this.subscriptionsData = new Map();
    this.captionsData = new Map();
    this.ratingsData = new Map();
    this.reviewsData = new Map();
    this.socialSharesData = new Map();
    this.currentId = {
      users: 1,
      contents: 1,
      categories: 1,
      watchlist: 1,
      watchHistory: 1,
      subscriptions: 1,
      captions: 1,
      ratings: 1,
      reviews: 1,
      socialShares: 1
    };
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersData.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersData.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersData.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = { 
      id,
      username: insertUser.username,
      email: insertUser.email,
      password: insertUser.password,
      fullName: insertUser.fullName || null,
      avatarUrl: insertUser.avatarUrl || null,
      isPremium: insertUser.isPremium || false,
      isAdmin: insertUser.isAdmin || false,
      createdAt: new Date() 
    };
    this.usersData.set(id, user);
    return user;
  }

  async updateUserSubscription(userId: number, isPremium: boolean): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updatedUser = { ...user, isPremium };
    this.usersData.set(userId, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.usersData.values());
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    // Don't allow updating the ID
    const { id: _, ...updateData } = userData;
    
    const updatedUser: User = { ...user, ...updateData };
    this.usersData.set(id, updatedUser);
    return updatedUser;
  }

  // Content methods
  async getContent(id: number): Promise<Content | undefined> {
    return this.contentsData.get(id);
  }

  async getAllContents(): Promise<Content[]> {
    return Array.from(this.contentsData.values());
  }

  async getContentsByCategory(categoryId: number): Promise<Content[]> {
    return Array.from(this.contentsData.values()).filter(
      content => content.categoryId === categoryId
    );
  }

  async getPremiumContents(): Promise<Content[]> {
    return Array.from(this.contentsData.values()).filter(
      content => content.isPremium
    );
  }

  async getFreeContents(): Promise<Content[]> {
    return Array.from(this.contentsData.values()).filter(
      content => !content.isPremium
    );
  }

  async createContent(insertContent: InsertContent): Promise<Content> {
    const id = this.currentId.contents++;
    const content: Content = {
      id,
      title: insertContent.title,
      description: insertContent.description,
      thumbnailUrl: insertContent.thumbnailUrl,
      videoUrl: insertContent.videoUrl,
      trailerUrl: insertContent.trailerUrl,
      releaseYear: insertContent.releaseYear,
      categoryId: insertContent.categoryId,
      isPremium: insertContent.isPremium || null,
      duration: insertContent.duration || null,
      rating: insertContent.rating || null,
      createdAt: new Date(),
      metadata: insertContent.metadata || null,
      averageRating: insertContent.averageRating || null,
      reviewCount: insertContent.reviewCount || 0
    };
    this.contentsData.set(id, content);
    return content;
  }

  async updateContent(id: number, contentData: Partial<Content>): Promise<Content | undefined> {
    const content = await this.getContent(id);
    if (!content) return undefined;

    // Don't allow updating the ID
    const { id: _, ...updateData } = contentData;

    const updatedContent: Content = { ...content, ...updateData };
    this.contentsData.set(id, updatedContent);
    return updatedContent;
  }

  async deleteContent(id: number): Promise<void> {
    this.contentsData.delete(id);
  }

  // Category methods
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categoriesData.get(id);
  }

  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categoriesData.values());
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentId.categories++;
    const category: Category = {
      id,
      name: insertCategory.name,
      description: insertCategory.description || null,
      thumbnailUrl: insertCategory.thumbnailUrl || null
    };
    this.categoriesData.set(id, category);
    return category;
  }

  async updateCategory(id: number, categoryData: Partial<Category>): Promise<Category | undefined> {
    const category = await this.getCategory(id);
    if (!category) return undefined;

    // Don't allow updating the ID
    const { id: _, ...updateData } = categoryData;

    const updatedCategory: Category = { ...category, ...updateData };
    this.categoriesData.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<void> {
    this.categoriesData.delete(id);
  }

  // Watchlist methods
  async getWatchlist(userId: number): Promise<(Watchlist & { content: Content })[]> {
    const userWatchlist = Array.from(this.watchlistData.values()).filter(
      item => item.userId === userId
    );
    
    return userWatchlist.map(item => {
      const content = this.contentsData.get(item.contentId);
      return {
        ...item,
        content: content as Content
      };
    });
  }

  async addToWatchlist(insertWatchlist: InsertWatchlist): Promise<Watchlist> {
    const id = this.currentId.watchlist++;
    const watchlistItem: Watchlist = {
      ...insertWatchlist,
      id,
      addedAt: new Date()
    };
    this.watchlistData.set(id, watchlistItem);
    return watchlistItem;
  }

  async removeFromWatchlist(userId: number, contentId: number): Promise<void> {
    const items = Array.from(this.watchlistData.entries());
    for (const [key, value] of items) {
      if (value.userId === userId && value.contentId === contentId) {
        this.watchlistData.delete(key);
      }
    }
  }

  // Watch history methods
  async getWatchHistory(userId: number): Promise<(WatchHistory & { content: Content })[]> {
    const userHistory = Array.from(this.watchHistoryData.values()).filter(
      item => item.userId === userId
    );
    
    return userHistory.map(item => {
      const content = this.contentsData.get(item.contentId);
      return {
        ...item,
        content: content as Content
      };
    });
  }

  async updateWatchHistory(insertHistory: InsertWatchHistory): Promise<WatchHistory> {
    // Check if entry already exists
    const existingEntry = Array.from(this.watchHistoryData.values()).find(
      item => item.userId === insertHistory.userId && item.contentId === insertHistory.contentId
    );

    if (existingEntry) {
      const updatedEntry: WatchHistory = {
        ...existingEntry,
        progress: insertHistory.progress || existingEntry.progress,
        lastWatched: new Date()
      };
      this.watchHistoryData.set(existingEntry.id, updatedEntry);
      return updatedEntry;
    }

    // Create new entry
    const id = this.currentId.watchHistory++;
    const historyItem: WatchHistory = {
      id,
      userId: insertHistory.userId,
      contentId: insertHistory.contentId,
      progress: insertHistory.progress || null,
      lastWatched: new Date(),
      deviceId: insertHistory.deviceId || null
    };
    this.watchHistoryData.set(id, historyItem);
    return historyItem;
  }

  // Subscription methods
  async getSubscription(userId: number): Promise<Subscription | undefined> {
    return Array.from(this.subscriptionsData.values()).find(
      sub => sub.userId === userId
    );
  }

  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const id = this.currentId.subscriptions++;
    const subscription: Subscription = {
      id,
      userId: insertSubscription.userId,
      planId: insertSubscription.planId,
      planType: insertSubscription.planType || null,
      status: insertSubscription.status,
      amount: insertSubscription.amount || null,
      startDate: insertSubscription.startDate || null,
      endDate: insertSubscription.endDate || null,
      paymentId: insertSubscription.paymentId || null,
      paymentReference: insertSubscription.paymentReference || null
    };
    this.subscriptionsData.set(id, subscription);
    return subscription;
  }

  async updateSubscription(id: number, status: string, endDate?: Date, paymentReference?: string): Promise<Subscription | undefined> {
    const subscription = this.subscriptionsData.get(id);
    if (!subscription) return undefined;

    const updatedSubscription: Subscription = {
      ...subscription,
      status,
      endDate: endDate || subscription.endDate,
      paymentReference: paymentReference || subscription.paymentReference
    };
    
    this.subscriptionsData.set(id, updatedSubscription);
    return updatedSubscription;
  }

  // Captions methods
  async getCaptions(contentId: number): Promise<Caption[]> {
    return Array.from(this.captionsData.values()).filter(
      caption => caption.contentId === contentId
    );
  }

  async getCaption(id: number): Promise<Caption | undefined> {
    return this.captionsData.get(id);
  }

  async createCaption(insertCaption: InsertCaption): Promise<Caption> {
    const id = this.currentId.captions++;
    const caption: Caption = {
      id,
      contentId: insertCaption.contentId,
      language: insertCaption.language,
      label: insertCaption.label,
      fileUrl: insertCaption.fileUrl,
      isDefault: insertCaption.isDefault || false,
      createdAt: new Date()
    };
    this.captionsData.set(id, caption);
    return caption;
  }

  async updateCaption(id: number, captionData: Partial<Caption>): Promise<Caption | undefined> {
    const caption = await this.getCaption(id);
    if (!caption) return undefined;

    // Don't allow updating the ID
    const { id: _, ...updateData } = captionData;

    const updatedCaption: Caption = { ...caption, ...updateData };
    this.captionsData.set(id, updatedCaption);
    return updatedCaption;
  }

  async deleteCaption(id: number): Promise<void> {
    this.captionsData.delete(id);
  }

  // Ratings methods
  async getRatings(contentId: number): Promise<Rating[]> {
    return Array.from(this.ratingsData.values()).filter(
      rating => rating.contentId === contentId
    );
  }

  async getRating(id: number): Promise<Rating | undefined> {
    return this.ratingsData.get(id);
  }

  async getUserRating(userId: number, contentId: number): Promise<Rating | undefined> {
    return Array.from(this.ratingsData.values()).find(
      rating => rating.userId === userId && rating.contentId === contentId
    );
  }

  async createRating(insertRating: InsertRating): Promise<Rating> {
    // Check if the user already rated this content
    const existingRating = await this.getUserRating(insertRating.userId, insertRating.contentId);
    
    if (existingRating) {
      // Update existing rating
      const updatedRating: Rating = {
        ...existingRating,
        rating: insertRating.rating,
        updatedAt: new Date()
      };
      this.ratingsData.set(existingRating.id, updatedRating);
      
      // Update content average rating
      await this.updateContentRatingStats(insertRating.contentId);
      
      return updatedRating;
    }
    
    // Create new rating
    const id = this.currentId.ratings++;
    const rating: Rating = {
      id,
      userId: insertRating.userId,
      contentId: insertRating.contentId,
      rating: insertRating.rating,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.ratingsData.set(id, rating);
    
    // Update content average rating
    await this.updateContentRatingStats(insertRating.contentId);
    
    return rating;
  }

  async updateRating(id: number, ratingData: Partial<Rating>): Promise<Rating | undefined> {
    const rating = await this.getRating(id);
    if (!rating) return undefined;

    // Don't allow updating the ID
    const { id: _, ...updateData } = ratingData;

    const updatedRating: Rating = { 
      ...rating, 
      ...updateData,
      updatedAt: new Date()
    };
    this.ratingsData.set(id, updatedRating);
    
    // Update content average rating
    await this.updateContentRatingStats(rating.contentId);
    
    return updatedRating;
  }

  async deleteRating(id: number): Promise<void> {
    const rating = this.ratingsData.get(id);
    if (rating) {
      this.ratingsData.delete(id);
      
      // Update content average rating after deletion
      await this.updateContentRatingStats(rating.contentId);
    }
  }

  async getAverageRating(contentId: number): Promise<number> {
    const contentRatings = await this.getRatings(contentId);
    if (contentRatings.length === 0) return 0;
    
    const sum = contentRatings.reduce((total, rating) => total + rating.rating, 0);
    return sum / contentRatings.length;
  }
  
  // Helper method to update a content's average rating and review count
  private async updateContentRatingStats(contentId: number): Promise<void> {
    const content = await this.getContent(contentId);
    if (!content) return;
    
    const avgRating = await this.getAverageRating(contentId);
    const reviewCount = (await this.getRatings(contentId)).length;
    
    await this.updateContent(contentId, {
      averageRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal place
      reviewCount
    });
  }

  // Reviews methods
  async getReviews(contentId: number): Promise<(Review & { user: User })[]> {
    const contentReviews = Array.from(this.reviewsData.values()).filter(
      review => review.contentId === contentId && review.isVisible
    );
    
    return Promise.all(contentReviews.map(async review => {
      const user = await this.getUser(review.userId);
      return {
        ...review,
        user: user as User // Type assertion as we know the user exists
      };
    }));
  }

  async getReview(id: number): Promise<Review | undefined> {
    return this.reviewsData.get(id);
  }

  async getUserReview(userId: number, contentId: number): Promise<Review | undefined> {
    return Array.from(this.reviewsData.values()).find(
      review => review.userId === userId && review.contentId === contentId
    );
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    // Check if the user already reviewed this content
    const existingReview = await this.getUserReview(insertReview.userId, insertReview.contentId);
    
    if (existingReview) {
      // Update existing review
      const updatedReview: Review = {
        ...existingReview,
        title: insertReview.title,
        content: insertReview.content,
        isVisible: insertReview.isVisible !== undefined ? insertReview.isVisible : existingReview.isVisible,
        updatedAt: new Date()
      };
      this.reviewsData.set(existingReview.id, updatedReview);
      return updatedReview;
    }
    
    // Create new review
    const id = this.currentId.reviews++;
    const review: Review = {
      id,
      userId: insertReview.userId,
      contentId: insertReview.contentId,
      title: insertReview.title,
      content: insertReview.content,
      createdAt: new Date(),
      updatedAt: new Date(),
      isVisible: insertReview.isVisible !== undefined ? insertReview.isVisible : true,
      likeCount: 0
    };
    
    this.reviewsData.set(id, review);
    return review;
  }

  async updateReview(id: number, reviewData: Partial<Review>): Promise<Review | undefined> {
    const review = await this.getReview(id);
    if (!review) return undefined;

    // Don't allow updating the ID
    const { id: _, ...updateData } = reviewData;

    const updatedReview: Review = { 
      ...review, 
      ...updateData,
      updatedAt: new Date()
    };
    this.reviewsData.set(id, updatedReview);
    return updatedReview;
  }

  async deleteReview(id: number): Promise<void> {
    this.reviewsData.delete(id);
  }

  // Social Share methods
  async getSocialShares(contentId: number): Promise<SocialShare[]> {
    return Array.from(this.socialSharesData.values()).filter(
      share => share.contentId === contentId
    );
  }

  async getUserSocialShares(userId: number): Promise<SocialShare[]> {
    return Array.from(this.socialSharesData.values()).filter(
      share => share.userId === userId
    );
  }

  async createSocialShare(insertShare: InsertSocialShare): Promise<SocialShare> {
    const id = this.currentId.socialShares++;
    const share: SocialShare = {
      id,
      userId: insertShare.userId,
      contentId: insertShare.contentId,
      platform: insertShare.platform,
      sharedAt: new Date()
    };
    
    this.socialSharesData.set(id, share);
    return share;
  }

  async deleteSocialShare(id: number): Promise<void> {
    this.socialSharesData.delete(id);
  }
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserSubscription(userId: number, isPremium: boolean): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ isPremium })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    // Don't allow updating the ID
    const { id: _, ...updateData } = userData;
    
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Content methods
  async getContent(id: number): Promise<Content | undefined> {
    const [content] = await db.select().from(contents).where(eq(contents.id, id));
    return content;
  }

  async getAllContents(): Promise<Content[]> {
    return await db.select().from(contents);
  }

  async getContentsByCategory(categoryId: number): Promise<Content[]> {
    return await db
      .select()
      .from(contents)
      .where(eq(contents.categoryId, categoryId));
  }

  async getPremiumContents(): Promise<Content[]> {
    return await db
      .select()
      .from(contents)
      .where(eq(contents.isPremium, true));
  }

  async getFreeContents(): Promise<Content[]> {
    return await db
      .select()
      .from(contents)
      .where(eq(contents.isPremium, false));
  }

  async createContent(insertContent: InsertContent): Promise<Content> {
    const [content] = await db
      .insert(contents)
      .values(insertContent)
      .returning();
    return content;
  }

  async updateContent(id: number, contentData: Partial<Content>): Promise<Content | undefined> {
    // Don't allow updating the ID
    const { id: _, ...updateData } = contentData;
    
    const [updatedContent] = await db
      .update(contents)
      .set(updateData)
      .where(eq(contents.id, id))
      .returning();
    return updatedContent;
  }

  async deleteContent(id: number): Promise<void> {
    await db
      .delete(contents)
      .where(eq(contents.id, id));
  }

  // Category methods
  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));
    return category;
  }

  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return category;
  }

  async updateCategory(id: number, categoryData: Partial<Category>): Promise<Category | undefined> {
    // Don't allow updating the ID
    const { id: _, ...updateData } = categoryData;
    
    const [updatedCategory] = await db
      .update(categories)
      .set(updateData)
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<void> {
    await db
      .delete(categories)
      .where(eq(categories.id, id));
  }

  // Watchlist methods
  async getWatchlist(userId: number): Promise<(Watchlist & { content: Content })[]> {
    const watchlistItems = await db
      .select()
      .from(watchlist)
      .where(eq(watchlist.userId, userId));
    
    const result: (Watchlist & { content: Content })[] = [];
    
    for (const item of watchlistItems) {
      const [content] = await db
        .select()
        .from(contents)
        .where(eq(contents.id, item.contentId));
      
      if (content) {
        result.push({
          ...item,
          content
        });
      }
    }
    
    return result;
  }

  async addToWatchlist(insertWatchlist: InsertWatchlist): Promise<Watchlist> {
    // Check if already in watchlist
    const existing = await db
      .select()
      .from(watchlist)
      .where(and(
        eq(watchlist.userId, insertWatchlist.userId),
        eq(watchlist.contentId, insertWatchlist.contentId)
      ));
    
    if (existing.length > 0) {
      return existing[0];
    }
    
    const [watchlistItem] = await db
      .insert(watchlist)
      .values(insertWatchlist)
      .returning();
    return watchlistItem;
  }

  async removeFromWatchlist(userId: number, contentId: number): Promise<void> {
    await db
      .delete(watchlist)
      .where(and(
        eq(watchlist.userId, userId),
        eq(watchlist.contentId, contentId)
      ));
  }

  // Watch history methods
  async getWatchHistory(userId: number): Promise<(WatchHistory & { content: Content })[]> {
    const historyItems = await db
      .select()
      .from(watchHistory)
      .where(eq(watchHistory.userId, userId));
    
    const result: (WatchHistory & { content: Content })[] = [];
    
    for (const item of historyItems) {
      const [content] = await db
        .select()
        .from(contents)
        .where(eq(contents.id, item.contentId));
      
      if (content) {
        result.push({
          ...item,
          content
        });
      }
    }
    
    return result;
  }

  async updateWatchHistory(insertHistory: InsertWatchHistory): Promise<WatchHistory> {
    // Check if entry already exists
    const existing = await db
      .select()
      .from(watchHistory)
      .where(and(
        eq(watchHistory.userId, insertHistory.userId),
        eq(watchHistory.contentId, insertHistory.contentId)
      ));
    
    if (existing.length > 0) {
      // Update existing entry
      const [updatedHistory] = await db
        .update(watchHistory)
        .set({
          progress: insertHistory.progress,
          lastWatched: new Date()
        })
        .where(eq(watchHistory.id, existing[0].id))
        .returning();
      return updatedHistory;
    }
    
    // Create new entry
    const [historyItem] = await db
      .insert(watchHistory)
      .values(insertHistory)
      .returning();
    return historyItem;
  }

  // Subscription methods
  async getSubscription(userId: number): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId));
    return subscription;
  }

  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const [subscription] = await db
      .insert(subscriptions)
      .values(insertSubscription)
      .returning();
    return subscription;
  }

  async updateSubscription(id: number, status: string, endDate?: Date, paymentReference?: string): Promise<Subscription | undefined> {
    const updateData: Partial<Subscription> = { status };
    if (endDate) {
      updateData.endDate = endDate;
    }
    if (paymentReference) {
      updateData.paymentReference = paymentReference;
    }
    
    const [updatedSubscription] = await db
      .update(subscriptions)
      .set(updateData)
      .where(eq(subscriptions.id, id))
      .returning();
    return updatedSubscription;
  }

  // Caption methods
  async getCaptions(contentId: number): Promise<Caption[]> {
    return await db
      .select()
      .from(captions)
      .where(eq(captions.contentId, contentId));
  }

  async getCaption(id: number): Promise<Caption | undefined> {
    const [caption] = await db
      .select()
      .from(captions)
      .where(eq(captions.id, id));
    return caption;
  }

  async createCaption(insertCaption: InsertCaption): Promise<Caption> {
    const [caption] = await db
      .insert(captions)
      .values(insertCaption)
      .returning();
    return caption;
  }

  async updateCaption(id: number, captionData: Partial<Caption>): Promise<Caption | undefined> {
    // Don't allow updating the ID
    const { id: _, ...updateData } = captionData;
    
    const [updatedCaption] = await db
      .update(captions)
      .set(updateData)
      .where(eq(captions.id, id))
      .returning();
    return updatedCaption;
  }

  async deleteCaption(id: number): Promise<void> {
    await db
      .delete(captions)
      .where(eq(captions.id, id));
  }

  // Ratings methods
  async getRatings(contentId: number): Promise<Rating[]> {
    return await db
      .select()
      .from(ratings)
      .where(eq(ratings.contentId, contentId));
  }

  async getRating(id: number): Promise<Rating | undefined> {
    const [rating] = await db
      .select()
      .from(ratings)
      .where(eq(ratings.id, id));
    return rating;
  }

  async getUserRating(userId: number, contentId: number): Promise<Rating | undefined> {
    const [rating] = await db
      .select()
      .from(ratings)
      .where(and(
        eq(ratings.userId, userId),
        eq(ratings.contentId, contentId)
      ));
    return rating;
  }

  async createRating(insertRating: InsertRating): Promise<Rating> {
    // Check if the user already rated this content
    const existingRating = await this.getUserRating(insertRating.userId, insertRating.contentId);
    
    if (existingRating) {
      // Update existing rating
      const [updatedRating] = await db
        .update(ratings)
        .set({
          rating: insertRating.rating,
          updatedAt: new Date()
        })
        .where(eq(ratings.id, existingRating.id))
        .returning();
      
      // Update content average rating
      await this.updateContentRatingStats(insertRating.contentId);
      
      return updatedRating;
    }
    
    // Create new rating
    const [rating] = await db
      .insert(ratings)
      .values({
        ...insertRating,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    // Update content average rating
    await this.updateContentRatingStats(insertRating.contentId);
    
    return rating;
  }

  async updateRating(id: number, ratingData: Partial<Rating>): Promise<Rating | undefined> {
    const rating = await this.getRating(id);
    if (!rating) return undefined;

    // Don't allow updating the ID
    const { id: _, ...updateData } = ratingData;
    
    const [updatedRating] = await db
      .update(ratings)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(ratings.id, id))
      .returning();
    
    // Update content average rating
    await this.updateContentRatingStats(rating.contentId);
    
    return updatedRating;
  }

  async deleteRating(id: number): Promise<void> {
    const rating = await this.getRating(id);
    if (rating) {
      await db
        .delete(ratings)
        .where(eq(ratings.id, id));
      
      // Update content average rating after deletion
      await this.updateContentRatingStats(rating.contentId);
    }
  }

  async getAverageRating(contentId: number): Promise<number> {
    const result = await db
      .select({ avgRating: avg(ratings.rating) })
      .from(ratings)
      .where(eq(ratings.contentId, contentId));
    
    // Handle null/undefined values
    if (!result[0]?.avgRating) {
      return 0;
    }
    
    // Parse the average to a number explicitly
    const avgRating = parseFloat(result[0].avgRating.toString());
    return isNaN(avgRating) ? 0 : avgRating;
  }
  
  // Helper method to update a content's average rating and review count
  private async updateContentRatingStats(contentId: number): Promise<void> {
    const avgRating = await this.getAverageRating(contentId);
    
    const ratingCount = await db
      .select({ count: count() })
      .from(ratings)
      .where(eq(ratings.contentId, contentId));
    
    const reviewCount = ratingCount[0]?.count || 0;
    
    await db
      .update(contents)
      .set({
        averageRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal place
        reviewCount
      })
      .where(eq(contents.id, contentId));
  }

  // Reviews methods
  async getReviews(contentId: number): Promise<(Review & { user: User })[]> {
    const reviewsResult = await db
      .select()
      .from(reviews)
      .where(and(
        eq(reviews.contentId, contentId),
        eq(reviews.isVisible, true)
      ));
    
    const result: (Review & { user: User })[] = [];
    
    for (const review of reviewsResult) {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, review.userId));
      
      if (user) {
        result.push({
          ...review,
          user
        });
      }
    }
    
    return result;
  }

  async getReview(id: number): Promise<Review | undefined> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, id));
    return review;
  }

  async getUserReview(userId: number, contentId: number): Promise<Review | undefined> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(and(
        eq(reviews.userId, userId),
        eq(reviews.contentId, contentId)
      ));
    return review;
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    // Check if the user already reviewed this content
    const existingReview = await this.getUserReview(insertReview.userId, insertReview.contentId);
    
    if (existingReview) {
      // Update existing review
      const [updatedReview] = await db
        .update(reviews)
        .set({
          title: insertReview.title,
          content: insertReview.content,
          isVisible: insertReview.isVisible !== undefined ? insertReview.isVisible : existingReview.isVisible,
          updatedAt: new Date()
        })
        .where(eq(reviews.id, existingReview.id))
        .returning();
      return updatedReview;
    }
    
    // Create new review
    const [review] = await db
      .insert(reviews)
      .values({
        ...insertReview,
        createdAt: new Date(),
        updatedAt: new Date(),
        likeCount: 0
      })
      .returning();
    
    return review;
  }

  async updateReview(id: number, reviewData: Partial<Review>): Promise<Review | undefined> {
    // Don't allow updating the ID
    const { id: _, ...updateData } = reviewData;
    
    const [updatedReview] = await db
      .update(reviews)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(reviews.id, id))
      .returning();
    return updatedReview;
  }

  async deleteReview(id: number): Promise<void> {
    await db
      .delete(reviews)
      .where(eq(reviews.id, id));
  }

  // Social Share methods
  async getSocialShares(contentId: number): Promise<SocialShare[]> {
    return await db
      .select()
      .from(socialShares)
      .where(eq(socialShares.contentId, contentId));
  }

  async getUserSocialShares(userId: number): Promise<SocialShare[]> {
    return await db
      .select()
      .from(socialShares)
      .where(eq(socialShares.userId, userId));
  }

  async createSocialShare(insertShare: InsertSocialShare): Promise<SocialShare> {
    const [share] = await db
      .insert(socialShares)
      .values({
        ...insertShare,
        sharedAt: new Date()
      })
      .returning();
    
    return share;
  }

  async deleteSocialShare(id: number): Promise<void> {
    await db
      .delete(socialShares)
      .where(eq(socialShares.id, id));
  }
}

// Switch to DatabaseStorage to use PostgreSQL database
export const storage = new DatabaseStorage();
