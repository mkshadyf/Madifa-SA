import request from 'supertest';
import { Express, Request, Response } from 'express';
import { registerRoutes } from '../../../server/routes';
import { Content } from '../../../shared/schema';
import { MemStorage } from '../../../server/storage';
import jwt from 'jsonwebtoken';

// Mock the entire VimeoService
jest.mock('../../../server/vimeo', () => {
  return {
    VimeoService: {
      getAllVideos: jest.fn().mockResolvedValue({
        videos: [
          {
            id: 'vimeo123',
            title: 'Test Movie',
            description: 'Test movie description',
            thumbnailUrl: 'https://example.com/thumbnail.jpg',
            streamingUrl: 'https://example.com/movie.mp4',
            duration: 120,
          },
          {
            id: 'vimeo456',
            title: 'Test Trailer',
            description: 'Test trailer description',
            thumbnailUrl: 'https://example.com/trailer-thumb.jpg',
            streamingUrl: 'https://example.com/trailer.mp4',
            duration: 60,
          }
        ]
      }),
      checkAuthentication: jest.fn().mockResolvedValue(true)
    }
  };
});

// Mock JWT secret for authentication
process.env.JWT_SECRET = 'test-secret-key';

describe('Content API Routes', () => {
  let app: Express;
  let storage: MemStorage;
  const adminToken = jwt.sign(
    { userId: 1, isAdmin: true, username: 'admin' },
    process.env.JWT_SECRET
  );
  const userToken = jwt.sign(
    { userId: 2, isAdmin: false, username: 'user' },
    process.env.JWT_SECRET
  );
  
  beforeEach(async () => {
    // Reset the storage before each test
    storage = new MemStorage();
    app = await registerRoutes(storage);
  });
  
  describe('GET /api/contents', () => {
    it('should return an empty array when no content exists', async () => {
      const response = await request(app).get('/api/contents');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
    
    it('should fetch from Vimeo when no content exists in storage', async () => {
      const response = await request(app).get('/api/contents');
      
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body[0].title).toBe('Test Movie');
      expect(response.body[1].title).toBe('Test Trailer');
    });
    
    it('should return content from storage when it exists', async () => {
      // Add sample content to storage
      const content: Content = {
        id: 1,
        title: 'Stored Movie',
        description: 'Description',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        videoUrl: 'https://example.com/video.mp4',
        trailerUrl: 'https://example.com/trailer.mp4',
        releaseYear: 2023,
        duration: 120,
        isPremium: false,
        contentType: 'movie',
        categoryId: 1,
        createdAt: new Date(),
        displayPriority: 0,
        vimeoId: null,
        rating: null,
        metadata: null,
        averageRating: null,
        reviewCount: 0
      };
      
      await storage.createContent(content);
      
      const response = await request(app).get('/api/contents');
      
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toBe('Stored Movie');
    });
  });
  
  describe('GET /api/contents/premium', () => {
    it('should return premium content from storage', async () => {
      // Add premium content to storage
      const premiumContent: Content = {
        id: 1,
        title: 'Premium Movie',
        description: 'Description',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        videoUrl: 'https://example.com/video.mp4',
        trailerUrl: 'https://example.com/trailer.mp4',
        releaseYear: 2023,
        duration: 120,
        isPremium: true,
        contentType: 'movie',
        categoryId: 1,
        createdAt: new Date(),
        displayPriority: 0,
        vimeoId: null,
        rating: null,
        metadata: null,
        averageRating: null,
        reviewCount: 0
      };
      
      await storage.createContent(premiumContent);
      
      const response = await request(app).get('/api/contents/premium');
      
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].isPremium).toBe(true);
      expect(response.body[0].title).toBe('Premium Movie');
    });
  });
  
  describe('Admin Content Management', () => {
    it('should create new content when admin is authenticated', async () => {
      const newContent = {
        title: 'New Movie',
        description: 'Description',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        videoUrl: 'https://example.com/video.mp4',
        trailerUrl: 'https://example.com/trailer.mp4',
        releaseYear: 2023,
        duration: 120,
        isPremium: false,
        contentType: 'movie',
        categoryId: 1,
      };
      
      const response = await request(app)
        .post('/api/admin/contents')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newContent);
      
      expect(response.status).toBe(201);
      expect(response.body.title).toBe('New Movie');
    });
    
    it('should reject content creation without admin authorization', async () => {
      const newContent = {
        title: 'New Movie',
        description: 'Description',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        videoUrl: 'https://example.com/video.mp4',
        trailerUrl: 'https://example.com/trailer.mp4',
        releaseYear: 2023,
        duration: 120,
        isPremium: false,
        contentType: 'movie',
        categoryId: 1,
      };
      
      const response = await request(app)
        .post('/api/admin/contents')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newContent);
      
      expect(response.status).toBe(403);
    });
    
    it('should update existing content when admin is authenticated', async () => {
      // First create content
      const content: Content = {
        id: 1,
        title: 'Original Title',
        description: 'Description',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        videoUrl: 'https://example.com/video.mp4',
        trailerUrl: 'https://example.com/trailer.mp4',
        releaseYear: 2023,
        duration: 120,
        isPremium: false,
        contentType: 'movie',
        categoryId: 1,
        createdAt: new Date(),
        displayPriority: 0,
        vimeoId: null,
        rating: null,
        metadata: null,
        averageRating: null,
        reviewCount: 0
      };
      
      await storage.createContent(content);
      
      // Now update it
      const updateResponse = await request(app)
        .put('/api/admin/contents/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated Title' });
      
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.title).toBe('Updated Title');
      expect(updateResponse.body.description).toBe('Description'); // Other fields should remain unchanged
    });
    
    it('should delete existing content when admin is authenticated', async () => {
      // First create content
      const content: Content = {
        id: 1,
        title: 'To Be Deleted',
        description: 'Description',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        videoUrl: 'https://example.com/video.mp4',
        trailerUrl: 'https://example.com/trailer.mp4',
        releaseYear: 2023,
        duration: 120,
        isPremium: false,
        contentType: 'movie',
        categoryId: 1,
        createdAt: new Date(),
        displayPriority: 0,
        vimeoId: null,
        rating: null,
        metadata: null,
        averageRating: null,
        reviewCount: 0
      };
      
      await storage.createContent(content);
      
      // Now delete it
      const deleteResponse = await request(app)
        .delete('/api/admin/contents/1')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(deleteResponse.status).toBe(204);
      
      // Verify it's been deleted
      const getResponse = await request(app).get('/api/contents');
      expect(getResponse.body.length).toBe(0);
    });
  });
});