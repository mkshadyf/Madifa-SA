/**
 * Tests for Vimeo service integration
 * These tests mock the Vimeo API calls to avoid actual API requests
 */

import { VimeoService } from '../server/vimeo';
import { ContentItem } from '../shared/types';

// Mock the Vimeo library
jest.mock('@vimeo/vimeo', () => {
  return {
    Vimeo: jest.fn().mockImplementation(() => {
      return {
        request: jest.fn().mockImplementation((options, callback) => {
          // Mock videos response
          if (options.path === '/me/videos') {
            callback(null, {
              data: [
                {
                  uri: '/videos/123456',
                  name: 'Test Video',
                  description: 'Test video description',
                  duration: 3600,
                  pictures: {
                    sizes: [{ link: 'https://example.com/thumb.jpg' }]
                  },
                  privacy: {
                    view: 'anybody',
                    embed: 'public',
                    download: true,
                    add: true
                  },
                  files: [
                    { quality: 'hd', link: 'https://example.com/video.mp4' }
                  ],
                  metadata: {
                    connections: {
                      texttracks: {
                        uri: '/videos/123456/texttracks'
                      }
                    }
                  }
                }
              ],
              total: 1,
              page: 1,
              per_page: 25
            });
          }
          // Mock single video response
          else if (options.path.includes('/videos/')) {
            callback(null, {
              uri: '/videos/123456',
              name: 'Test Video',
              description: 'Test video description',
              duration: 3600,
              pictures: {
                sizes: [{ link: 'https://example.com/thumb.jpg' }]
              },
              privacy: {
                view: 'anybody',
                embed: 'public',
                download: true,
                add: true
              },
              files: [
                { quality: 'hd', link: 'https://example.com/video.mp4' }
              ],
              metadata: {
                connections: {
                  texttracks: {
                    uri: '/videos/123456/texttracks'
                  }
                }
              }
            });
          }
          // Mock text tracks (captions) response
          else if (options.path.includes('/texttracks')) {
            callback(null, {
              data: [
                {
                  uri: '/videos/123456/texttracks/987',
                  active: true,
                  language: 'en',
                  link: 'https://example.com/captions.vtt',
                  name: 'English',
                  type: 'subtitles'
                }
              ]
            });
          }
          // Fallback for unknown paths
          else {
            callback(new Error('Not implemented in mock'), null);
          }
        }),
        upload: jest.fn().mockImplementation((file, options, completeCallback, progressCallback, errorCallback) => {
          // Simulate successful upload
          completeCallback('/videos/123456');
        })
      };
    })
  };
});

describe('Vimeo Service', () => {
  describe('Video Retrieval', () => {
    test('getVideoDetails should retrieve video information', async () => {
      const details = await VimeoService.getVideoDetails('123456');
      
      expect(details).toHaveProperty('id', '123456');
      expect(details).toHaveProperty('title', 'Test Video');
      expect(details).toHaveProperty('description', 'Test video description');
      expect(details).toHaveProperty('duration', 3600);
      expect(details).toHaveProperty('thumbnailUrl', 'https://example.com/thumb.jpg');
      expect(details).toHaveProperty('videoUrl', 'https://example.com/video.mp4');
    });
    
    test('getAllVideos should retrieve multiple videos', async () => {
      const result = await VimeoService.getAllVideos();
      
      expect(result).toHaveProperty('videos');
      expect(Array.isArray(result.videos)).toBe(true);
      expect(result.videos.length).toBe(1);
      expect(result).toHaveProperty('total', 1);
      expect(result).toHaveProperty('page', 1);
    });
  });
  
  describe('Video Upload', () => {
    test('uploadVideo should upload to Vimeo and return video ID', async () => {
      const videoId = await VimeoService.uploadVideo('https://example.com/upload.mp4', {
        name: 'Upload Test',
        description: 'Test upload description',
        privacy: {
          view: 'anybody',
          embed: 'public',
          download: true,
          add: true
        }
      });
      
      expect(videoId).toBe('123456');
    });
  });
  
  describe('Captions', () => {
    test('getVideoCaptions should retrieve caption tracks', async () => {
      const captions = await VimeoService.getVideoCaptions('123456');
      
      expect(Array.isArray(captions)).toBe(true);
      expect(captions.length).toBe(1);
      expect(captions[0]).toHaveProperty('uri', '/videos/123456/texttracks/987');
      expect(captions[0]).toHaveProperty('language', 'en');
      expect(captions[0]).toHaveProperty('link', 'https://example.com/captions.vtt');
    });
  });
  
  describe('Content Conversion', () => {
    test('convertToContentItem should convert Vimeo format to ContentItem', () => {
      const vimeoVideo = {
        id: '123456',
        title: 'Test Video',
        description: 'Test video description',
        duration: 3600,
        thumbnailUrl: 'https://example.com/thumb.jpg',
        videoUrl: 'https://example.com/video.mp4',
        streamingUrl: 'https://example.com/stream.m3u8',
        privacySettings: {
          view: 'anybody',
          embed: 'public',
          download: true,
          add: true
        }
      };
      
      const contentItem = VimeoService.convertToContentItem(vimeoVideo, 1, true);
      
      expect(contentItem).toHaveProperty('title', 'Test Video');
      expect(contentItem).toHaveProperty('description', 'Test video description');
      expect(contentItem).toHaveProperty('thumbnailUrl', 'https://example.com/thumb.jpg');
      expect(contentItem).toHaveProperty('videoUrl', 'https://example.com/video.mp4');
      expect(contentItem).toHaveProperty('categoryId', 1);
      expect(contentItem).toHaveProperty('isPremium', true);
      expect(contentItem).toHaveProperty('duration', 3600);
    });
  });
  
  describe('Embed HTML', () => {
    test('getEmbedHtml should generate valid embed HTML', () => {
      const embedHtml = VimeoService.getEmbedHtml('123456', {
        width: 640,
        height: 360,
        autoplay: true,
        responsive: true
      });
      
      expect(typeof embedHtml).toBe('string');
      expect(embedHtml).toContain('iframe');
      expect(embedHtml).toContain('123456');
      expect(embedHtml).toContain('autoplay=1');
    });
  });
});