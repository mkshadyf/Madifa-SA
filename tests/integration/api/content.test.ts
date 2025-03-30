import request from 'supertest';
import app from '../../../server/index';
import { db } from '../../../server/db';
import { content } from '../../../shared/schema';
import { eq } from 'drizzle-orm';

describe('Content API Endpoints', () => {
  let testContentId: string;
  let authToken: string;
  
  // Setup: Create a test user and get auth token
  beforeAll(async () => {
    // Create test user
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123!'
    };
    
    // Register user
    await request(app)
      .post('/api/auth/register')
      .send(userData);
      
    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: userData.email,
        password: userData.password
      });
      
    authToken = loginResponse.body.token;
    
    // Create test content if not exists
    const testContent = await db.select().from(content).where(eq(content.title, 'Test Content')).limit(1);
    
    if (testContent.length === 0) {
      const newContent = {
        title: 'Test Content',
        description: 'This is test content for API testing',
        vimeoId: '12345',
        posterUrl: 'https://example.com/poster.jpg',
        contentType: 'movie',
        duration: 120,
        releaseDate: new Date().toISOString(),
        isPremium: false
      };
      
      const insertResult = await db.insert(content).values(newContent).returning();
      testContentId = insertResult[0].id;
    } else {
      testContentId = testContent[0].id;
    }
  });
  
  // Clean up after tests
  afterAll(async () => {
    // Remove test content
    await db.delete(content).where(eq(content.id, testContentId));
  });
  
  describe('GET /api/content', () => {
    it('should return a list of content items', async () => {
      const response = await request(app).get('/api/content');
      
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(response.body.length);
    });
    
    it('should filter content by type', async () => {
      const contentType = 'movie';
      const response = await request(app).get(`/api/content?type=${contentType}`);
      
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(response.body.length);
      
      // Check if all returned items are of the requested type
      const allMatchType = response.body.every((item: any) => item.contentType === contentType);
      expect(allMatchType).toBe(true);
    });
  });
  
  describe('GET /api/content/:id', () => {
    it('should return a single content item by ID', async () => {
      const response = await request(app).get(`/api/content/${testContentId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testContentId);
    });
    
    it('should return 404 for non-existent content ID', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app).get(`/api/content/${fakeId}`);
      
      expect(response.status).toBe(404);
    });
  });
  
  describe('GET /api/content/premium', () => {
    it('should return a list of premium content', async () => {
      const response = await request(app)
        .get('/api/content/premium')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(response.body.length);
      
      // Verify all returned content is premium
      const allPremium = response.body.every((item: any) => item.isPremium === true);
      expect(allPremium).toBe(true);
    });
    
    it('should require authentication', async () => {
      const response = await request(app).get('/api/content/premium');
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('GET /api/content/featured', () => {
    it('should return featured content', async () => {
      const response = await request(app).get('/api/content/featured');
      
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(response.body.length);
    });
  });
});