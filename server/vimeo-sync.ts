import { VimeoService, VimeoVideoDetails } from './vimeo';
import { storage } from './storage';
import { 
  insertContentSchema, 
  insertCategorySchema,
  type InsertContent
} from '@shared/schema';

/**
 * Helper class to synchronize Vimeo videos with our database
 */
export class VimeoSync {
  /**
   * Default categories to create if they don't exist
   */
  private static defaultCategories = [
    {
      name: 'Movies',
      description: 'Feature length films'
    },
    {
      name: 'Trailers',
      description: 'Movie trailers and previews'
    },
    {
      name: 'Music Videos',
      description: 'Music performances and music videos'
    },
    {
      name: 'Short Films',
      description: 'Short format films and stories'
    },
  ];

  /**
   * Sync all videos from Vimeo to our database
   */
  static async syncAllVideos(): Promise<{ 
    added: number, 
    updated: number, 
    failed: number, 
    totalVimeoVideos: number 
  }> {
    console.log('Starting Vimeo video sync...');
    
    // Initialize counters
    let added = 0;
    let updated = 0;
    let failed = 0;
    
    try {
      // First, ensure we have our default categories
      await this.ensureDefaultCategories();
      
      // Get all categories from our database
      const categories = await storage.getAllCategories();
      
      // Get available videos from Vimeo
      const vimeoResponse = await VimeoService.getAllVideos(1, 50);
      const vimeoVideos = vimeoResponse.videos;
      
      console.log(`Found ${vimeoVideos.length} videos on Vimeo`);
      
      // Process each video
      for (const video of vimeoVideos) {
        try {
          // Determine video category
          const categoryId = this.determineCategoryId(video, categories);
          
          // Check if video already exists in our database
          const existingContent = await this.findExistingContent(video.id);
          
          if (existingContent) {
            // Update existing content
            await this.updateExistingContent(existingContent.id, video, categoryId);
            updated++;
          } else {
            // Create new content
            await this.createNewContent(video, categoryId);
            added++;
          }
        } catch (error) {
          console.error(`Failed to process Vimeo video ${video.id}:`, error);
          failed++;
        }
      }
      
      console.log(`Vimeo sync complete. Added: ${added}, Updated: ${updated}, Failed: ${failed}`);
      
      return {
        added,
        updated,
        failed,
        totalVimeoVideos: vimeoVideos.length
      };
    } catch (error) {
      console.error('Error syncing Vimeo videos:', error);
      throw error;
    }
  }
  
  /**
   * Find a content item by Vimeo ID
   */
  private static async findExistingContent(vimeoId: string) {
    // Get all contents (in a production system, we would add a specific method to find by vimeoId)
    const allContents = await storage.getAllContents();
    return allContents.find(content => content.vimeoId === vimeoId);
  }
  
  /**
   * Ensure default categories exist in the database
   */
  private static async ensureDefaultCategories() {
    const existingCategories = await storage.getAllCategories();
    
    for (const category of this.defaultCategories) {
      const exists = existingCategories.some(c => c.name === category.name);
      
      if (!exists) {
        console.log(`Creating default category: ${category.name}`);
        await storage.createCategory(insertCategorySchema.parse({
          name: category.name,
          description: category.description
        }));
      }
    }
  }
  
  /**
   * Determine the appropriate category ID for a video
   * This is a simple heuristic based on video title and could be enhanced
   */
  private static determineCategoryId(video: VimeoVideoDetails, categories: any[]) {
    const title = video.title.toLowerCase();
    
    // Check for trailers
    if (title.includes('trailer') || title.includes('preview') || title.includes('teaser')) {
      const trailersCategory = categories.find(c => c.name === 'Trailers');
      return trailersCategory ? trailersCategory.id : 1;
    }
    
    // Check for music videos
    if (
      title.includes('music video') || 
      title.includes('official video') || 
      title.includes('lyric') ||
      title.includes('performance')
    ) {
      const musicCategory = categories.find(c => c.name === 'Music Videos');
      return musicCategory ? musicCategory.id : 1;
    }
    
    // Check for short films
    if (title.includes('short film') || title.includes('short')) {
      const shortFilmsCategory = categories.find(c => c.name === 'Short Films');
      return shortFilmsCategory ? shortFilmsCategory.id : 1;
    }
    
    // Default to Movies
    const moviesCategory = categories.find(c => c.name === 'Movies');
    return moviesCategory ? moviesCategory.id : 1;
  }
  
  /**
   * Create a new content item from a Vimeo video
   */
  private static async createNewContent(video: VimeoVideoDetails, categoryId: number) {
    // Get categories to check
    const categories = await storage.getAllCategories();
    
    // Determine if it's a trailer based on title and category
    const isTrailer = 
      video.title.toLowerCase().includes('trailer') || 
      categoryId === categories.find((c: any) => c.name === 'Trailers')?.id;
    
    // Format the video data according to our schema
    const contentData: InsertContent = {
      title: video.title,
      description: video.description || `Exclusive content on ${video.title}. Watch now on Madifa.`,
      thumbnailUrl: video.thumbnailUrl,
      videoUrl: video.streamingUrl,
      trailerUrl: isTrailer ? video.streamingUrl : '',
      releaseYear: new Date().getFullYear(),
      duration: video.duration,
      isPremium: !isTrailer, // Trailers are free, others are premium
      contentType: isTrailer ? 'trailer' : 
                   categoryId === categories.find((c: any) => c.name === 'Music Videos')?.id ? 'music_video' : 'movie',
      vimeoId: video.id,
      categoryId: categoryId,
      rating: null,
      metadata: null,
      averageRating: null,
      reviewCount: 0
    };
    
    // Validate and create the content
    await storage.createContent(insertContentSchema.parse(contentData));
    
    console.log(`Created new content: ${video.title}`);
  }
  
  /**
   * Update an existing content item
   */
  private static async updateExistingContent(contentId: number, video: VimeoVideoDetails, categoryId: number) {
    // Get categories to check
    const categories = await storage.getAllCategories();
    
    // Determine if it's a trailer based on title and category
    const isTrailer = 
      video.title.toLowerCase().includes('trailer') || 
      categoryId === categories.find((c: any) => c.name === 'Trailers')?.id;
    
    // Format the update data
    const updateData = {
      title: video.title,
      description: video.description || `Exclusive content on ${video.title}. Watch now on Madifa.`,
      thumbnailUrl: video.thumbnailUrl,
      videoUrl: video.streamingUrl,
      trailerUrl: isTrailer ? video.streamingUrl : '',
      isPremium: !isTrailer,
      contentType: isTrailer ? 'trailer' : 
                   categoryId === categories.find((c: any) => c.name === 'Music Videos')?.id ? 'music_video' : 'movie',
      categoryId: categoryId,
    };
    
    // Update the content
    await storage.updateContent(contentId, updateData);
    
    console.log(`Updated content #${contentId}: ${video.title}`);
  }
}

// Categories will be fetched inside methods as needed