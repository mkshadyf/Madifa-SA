import { VimeoService } from './server/vimeo.ts';

async function checkVimeoFolders() {
  try {
    // First check authentication
    const authStatus = await VimeoService.checkAuthentication();
    console.log('Authentication status:', authStatus);
    
    if (!authStatus.authenticated) {
      console.error('Not authenticated with Vimeo API. Please check credentials.');
      return;
    }
    
    // Get all videos
    console.log('Fetching videos...');
    const videosData = await VimeoService.getAllVideos(1, 10);
    console.log(`Found ${videosData.total} videos. Displaying first ${videosData.videos.length}:`);
    
    // Check for folders and tags in video data
    for (const video of videosData.videos) {
      console.log(`\nVideo ID: ${video.id}`);
      console.log(`Title: ${video.title}`);
      console.log(`Description: ${video.description}`);
      
      // Get full video details to check for tags, folders, and other metadata
      const fullDetails = await VimeoService.getVideoDetails(video.id);
      
      // Print any other useful categorization info
      console.log('Content type categorization info:');
      console.log('-------------------------------');
      
      // Log raw response for inspection
      console.log('Raw video data for inspection:');
      console.log(JSON.stringify(fullDetails, null, 2));
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkVimeoFolders().catch(console.error);