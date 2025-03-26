/**
 * Unit tests for storage implementations
 */

import { MemStorage } from '../server/storage';
import { Content, Category, User, Watchlist, WatchHistory, Rating, Review } from '../shared/schema';

describe('MemStorage Implementation', () => {
  let storage: MemStorage;

  beforeEach(() => {
    // Create a new storage instance for each test
    storage = new MemStorage();
  });

  describe('User methods', () => {
    const testUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword',
      name: 'Test User',
      isAdmin: false,
      isPremium: false,
    };

    test('createUser should add a user and return it with an ID', async () => {
      const user = await storage.createUser(testUser);
      expect(user).toHaveProperty('id');
      expect(user.username).toBe(testUser.username);
      expect(user.email).toBe(testUser.email);
    });

    test('getUserByUsername should find user by username', async () => {
      const createdUser = await storage.createUser(testUser);
      const foundUser = await storage.getUserByUsername(testUser.username);
      
      expect(foundUser).not.toBeUndefined();
      expect(foundUser?.id).toBe(createdUser.id);
    });

    test('updateUserSubscription should update isPremium status', async () => {
      const user = await storage.createUser(testUser);
      const updatedUser = await storage.updateUserSubscription(user.id, true);
      
      expect(updatedUser).not.toBeUndefined();
      expect(updatedUser?.isPremium).toBe(true);
    });
  });

  describe('Content methods', () => {
    const testCategory = {
      name: 'Test Category',
      description: 'Test category description',
    };

    const testContent = {
      title: 'Test Content',
      description: 'Test content description',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      videoUrl: 'https://example.com/video.mp4',
      trailerUrl: 'https://example.com/trailer.mp4',
      releaseYear: 2023,
      duration: 3600,
      isPremium: true,
      categoryId: 0, // Will be set after category creation
    };

    test('createCategory and getCategory should work', async () => {
      const category = await storage.createCategory(testCategory);
      expect(category).toHaveProperty('id');
      
      const foundCategory = await storage.getCategory(category.id);
      expect(foundCategory).not.toBeUndefined();
      expect(foundCategory?.name).toBe(testCategory.name);
    });

    test('createContent and getContent should work', async () => {
      const category = await storage.createCategory(testCategory);
      const content = await storage.createContent({
        ...testContent,
        categoryId: category.id,
      });
      
      expect(content).toHaveProperty('id');
      
      const foundContent = await storage.getContent(content.id);
      expect(foundContent).not.toBeUndefined();
      expect(foundContent?.title).toBe(testContent.title);
      expect(foundContent?.categoryId).toBe(category.id);
    });

    test('getPremiumContents should return only premium content', async () => {
      const category = await storage.createCategory(testCategory);
      
      // Add premium content
      await storage.createContent({
        ...testContent,
        categoryId: category.id,
        isPremium: true,
      });
      
      // Add free content
      await storage.createContent({
        ...testContent,
        title: 'Free Content',
        categoryId: category.id,
        isPremium: false,
      });
      
      const premiumContents = await storage.getPremiumContents();
      expect(premiumContents.length).toBe(1);
      expect(premiumContents[0].isPremium).toBe(true);
    });
  });

  describe('Watch History and Watchlist', () => {
    let user: User;
    let content: Content;

    beforeEach(async () => {
      // Create test user
      user = await storage.createUser({
        username: 'watchuser',
        email: 'watch@example.com',
        password: 'hashedpassword',
        name: 'Watch User',
        isAdmin: false,
        isPremium: false,
      });
      
      // Create test category
      const category = await storage.createCategory({
        name: 'Watch Category',
        description: 'Watch category description',
      });
      
      // Create test content
      content = await storage.createContent({
        title: 'Watch Content',
        description: 'Watch content description',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        videoUrl: 'https://example.com/video.mp4',
        trailerUrl: 'https://example.com/trailer.mp4',
        releaseYear: 2023,
        duration: 3600,
        isPremium: false,
        categoryId: category.id,
      });
    });

    test('addToWatchlist and getWatchlist should work', async () => {
      await storage.addToWatchlist({
        userId: user.id,
        contentId: content.id,
      });
      
      const watchlist = await storage.getWatchlist(user.id);
      expect(watchlist.length).toBe(1);
      expect(watchlist[0].userId).toBe(user.id);
      expect(watchlist[0].contentId).toBe(content.id);
      expect(watchlist[0].content).toHaveProperty('title', content.title);
    });

    test('removeFromWatchlist should remove content from watchlist', async () => {
      await storage.addToWatchlist({
        userId: user.id,
        contentId: content.id,
      });
      
      await storage.removeFromWatchlist(user.id, content.id);
      
      const watchlist = await storage.getWatchlist(user.id);
      expect(watchlist.length).toBe(0);
    });

    test('updateWatchHistory should add or update watch history', async () => {
      // Add to watch history
      await storage.updateWatchHistory({
        userId: user.id,
        contentId: content.id,
        progress: 30,
        completed: false,
        deviceId: 'test-device',
      });
      
      let history = await storage.getWatchHistory(user.id);
      expect(history.length).toBe(1);
      expect(history[0].progress).toBe(30);
      
      // Update the same entry
      await storage.updateWatchHistory({
        userId: user.id,
        contentId: content.id,
        progress: 60,
        completed: false,
        deviceId: 'test-device',
      });
      
      history = await storage.getWatchHistory(user.id);
      expect(history.length).toBe(1);
      expect(history[0].progress).toBe(60);
    });
  });

  describe('Ratings and Reviews', () => {
    let user: User;
    let content: Content;

    beforeEach(async () => {
      // Create test user
      user = await storage.createUser({
        username: 'rateuser',
        email: 'rate@example.com',
        password: 'hashedpassword',
        name: 'Rate User',
        isAdmin: false,
        isPremium: false,
      });
      
      // Create test category
      const category = await storage.createCategory({
        name: 'Rate Category',
        description: 'Rate category description',
      });
      
      // Create test content
      content = await storage.createContent({
        title: 'Rate Content',
        description: 'Rate content description',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        videoUrl: 'https://example.com/video.mp4',
        trailerUrl: 'https://example.com/trailer.mp4',
        releaseYear: 2023,
        duration: 3600,
        isPremium: false,
        categoryId: category.id,
      });
    });

    test('createRating and getUserRating should work', async () => {
      await storage.createRating({
        userId: user.id,
        contentId: content.id,
        rating: 4,
      });
      
      const userRating = await storage.getUserRating(user.id, content.id);
      expect(userRating).not.toBeUndefined();
      expect(userRating?.rating).toBe(4);
    });

    test('getAverageRating should calculate the average correctly', async () => {
      // Add first rating (4 stars)
      await storage.createRating({
        userId: user.id,
        contentId: content.id,
        rating: 4,
      });
      
      // Create another user and add a different rating (2 stars)
      const user2 = await storage.createUser({
        username: 'rateuser2',
        email: 'rate2@example.com',
        password: 'hashedpassword',
        name: 'Rate User 2',
        isAdmin: false,
        isPremium: false,
      });
      
      await storage.createRating({
        userId: user2.id,
        contentId: content.id,
        rating: 2,
      });
      
      // Average should be (4 + 2) / 2 = 3
      const averageRating = await storage.getAverageRating(content.id);
      expect(averageRating).toBe(3);
    });

    test('createReview and getUserReview should work', async () => {
      await storage.createReview({
        userId: user.id,
        contentId: content.id,
        review: 'This is a test review',
        rating: 4,
      });
      
      const userReview = await storage.getUserReview(user.id, content.id);
      expect(userReview).not.toBeUndefined();
      expect(userReview?.review).toBe('This is a test review');
    });

    test('getReviews should include user information', async () => {
      await storage.createReview({
        userId: user.id,
        contentId: content.id,
        review: 'This is a test review',
        rating: 4,
      });
      
      const reviews = await storage.getReviews(content.id);
      expect(reviews.length).toBe(1);
      expect(reviews[0].user).toHaveProperty('username', user.username);
    });
  });
});