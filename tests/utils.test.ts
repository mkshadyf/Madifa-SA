/**
 * Tests for utility functions
 */

import { formatDuration, formatDate, parseVideoUrl, generateAvatarUrl, calculateProgress } from '../client/src/lib/utils';

describe('Utility Functions', () => {
  describe('formatDuration', () => {
    test('should format seconds into HH:MM:SS format', () => {
      // Test various durations
      expect(formatDuration(90)).toBe('1:30');
      expect(formatDuration(3600)).toBe('1:00:00');
      expect(formatDuration(3661)).toBe('1:01:01');
      
      // Edge cases
      expect(formatDuration(0)).toBe('0:00');
      expect(formatDuration(59)).toBe('0:59');
    });
  });
  
  describe('formatDate', () => {
    test('should format dates into readable strings', () => {
      // Test with specific date
      const testDate = new Date('2023-01-15T12:00:00Z');
      expect(formatDate(testDate)).toMatch(/Jan 15, 2023/);
      
      // Test with ISO string
      expect(formatDate('2023-01-15T12:00:00Z')).toMatch(/Jan 15, 2023/);
    });
  });
  
  describe('parseVideoUrl', () => {
    test('should extract provider and ID from video URLs', () => {
      // YouTube URL
      const youtubeResult = parseVideoUrl('https://www.youtube.com/watch?v=abcd1234');
      expect(youtubeResult?.provider).toBe('youtube');
      expect(youtubeResult?.id).toBe('abcd1234');
      
      // Vimeo URL
      const vimeoResult = parseVideoUrl('https://vimeo.com/1234567');
      expect(vimeoResult?.provider).toBe('vimeo');
      expect(vimeoResult?.id).toBe('1234567');
      
      // Invalid URL
      const invalidResult = parseVideoUrl('https://example.com');
      expect(invalidResult).toBeNull();
    });
  });
  
  describe('generateAvatarUrl', () => {
    test('should generate avatar URLs based on user names', () => {
      const url = generateAvatarUrl('Test User');
      expect(url).toContain('test+user');
      
      // With special characters
      const specialUrl = generateAvatarUrl('John Doe!@#');
      expect(specialUrl).toContain('john+doe');
    });
  });
  
  describe('calculateProgress', () => {
    test('should calculate percentage progress', () => {
      // Normal cases
      expect(calculateProgress(50, 100)).toBe(50);
      expect(calculateProgress(25, 100)).toBe(25);
      expect(calculateProgress(0, 100)).toBe(0);
      expect(calculateProgress(100, 100)).toBe(100);
      
      // Edge cases
      expect(calculateProgress(150, 100)).toEqual(100); // Exceeding total
      expect(calculateProgress(50, 0)).toEqual(0); // Zero total
    });
  });
});