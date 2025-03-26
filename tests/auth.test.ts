/**
 * Tests for authentication functionality
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { MemStorage } from '../server/storage';

describe('Authentication Functions', () => {
  let storage: MemStorage;

  beforeEach(() => {
    storage = new MemStorage();
  });

  describe('Password Hashing', () => {
    test('bcrypt should hash passwords correctly', async () => {
      const password = 'TestPassword123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Hash should be different from original password
      expect(hashedPassword).not.toBe(password);
      
      // Hash should be valid and verifiable
      const isValid = await bcrypt.compare(password, hashedPassword);
      expect(isValid).toBe(true);
      
      // Wrong password should not verify
      const isInvalid = await bcrypt.compare('WrongPassword', hashedPassword);
      expect(isInvalid).toBe(false);
    });
  });

  describe('JWT Token Generation', () => {
    const secret = 'test-secret-key';
    
    test('jwt should generate valid tokens', () => {
      const payload = { id: 1, username: 'testuser' };
      const token = jwt.sign(payload, secret, { expiresIn: '1h' });
      
      // Token should be a string
      expect(typeof token).toBe('string');
      
      // Token should be verifiable
      const decoded = jwt.verify(token, secret);
      expect(decoded).toHaveProperty('id', payload.id);
      expect(decoded).toHaveProperty('username', payload.username);
    });
    
    test('jwt should reject expired tokens', () => {
      const payload = { id: 1, username: 'testuser' };
      // Create a token that expires immediately
      const token = jwt.sign(payload, secret, { expiresIn: '0s' });
      
      // Wait a moment to ensure it's expired
      setTimeout(() => {
        // Verification should throw an error
        expect(() => {
          jwt.verify(token, secret);
        }).toThrow();
      }, 100);
    });
    
    test('jwt should reject tokens with wrong signature', () => {
      const payload = { id: 1, username: 'testuser' };
      const token = jwt.sign(payload, secret);
      
      // Try to verify with a different secret
      expect(() => {
        jwt.verify(token, 'wrong-secret');
      }).toThrow();
    });
  });

  describe('User Authentication', () => {
    test('should register and authenticate a user', async () => {
      // Step 1: Register a new user
      const username = 'testuser';
      const email = 'test@example.com';
      const password = 'TestPassword123';
      const name = 'Test User';
      
      // Hash the password before storing
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        name,
        isAdmin: false,
        isPremium: false,
      });
      
      expect(user).toHaveProperty('id');
      
      // Step 2: Verify the user exists
      const foundUser = await storage.getUserByUsername(username);
      expect(foundUser).not.toBeUndefined();
      
      // Step 3: Authenticate the user
      const isPasswordValid = await bcrypt.compare(password, foundUser!.password);
      expect(isPasswordValid).toBe(true);
      
      // Step 4: Generate a token for the authenticated user
      const secret = 'test-secret-key';
      const token = jwt.sign(
        { id: foundUser!.id, username: foundUser!.username },
        secret,
        { expiresIn: '1h' }
      );
      
      // Token should be valid
      const decoded = jwt.verify(token, secret) as { id: number; username: string };
      expect(decoded.id).toBe(foundUser!.id);
      expect(decoded.username).toBe(foundUser!.username);
    });
    
    test('should reject invalid login attempts', async () => {
      // Create a user
      const username = 'testuser';
      const hashedPassword = await bcrypt.hash('CorrectPassword', 10);
      
      await storage.createUser({
        username,
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
        isAdmin: false,
        isPremium: false,
      });
      
      // Try to authenticate with wrong password
      const foundUser = await storage.getUserByUsername(username);
      const isPasswordValid = await bcrypt.compare('WrongPassword', foundUser!.password);
      
      // Should not validate
      expect(isPasswordValid).toBe(false);
    });
  });
});