// Import Vimeo videos into the platform
import fetch from 'node-fetch';

// Configuration 
const API_URL = 'http://localhost:5000';
const CATEGORY_ID = 2; // "Drama Films" category
const TOKEN = process.env.ADMIN_TOKEN; // From server/test-token.txt

async function importVimeoVideos() {
  try {
    console.log('Fetching videos from Vimeo...');
    
    // Get list of videos from Vimeo API
    const videosResponse = await fetch(`${API_URL}/api/vimeo/videos`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    
    if (!videosResponse.ok) {
      throw new Error(`Failed to fetch videos: ${videosResponse.statusText}`);
    }
    
    const videosData = await videosResponse.json();
    const videos = videosData.videos;
    
    console.log(`Found ${videos.length} videos on Vimeo`);
    
    // Import each video
    for (const video of videos) {
      console.log(`Importing video: ${video.title} (${video.id})`);
      
      // Determine if it's a premium video or a free trailer
      const isPremium = !video.title.toLowerCase().includes('trailer');
      
      // Import the video
      const importResponse = await fetch(`${API_URL}/api/vimeo/import/${video.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          categoryId: CATEGORY_ID,
          isPremium
        })
      });
      
      if (importResponse.ok) {
        const result = await importResponse.json();
        console.log(`Successfully imported: ${result.content.title} (ID: ${result.content.id})`);
      } else {
        const error = await importResponse.text();
        console.error(`Failed to import video ${video.id}: ${error}`);
      }
      
      // Add a small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('Import completed');
  } catch (error) {
    console.error('Import failed:', error);
  }
}

// Read token from environment variable or from command line
if (!TOKEN) {
  console.error('Please set the ADMIN_TOKEN environment variable');
  console.error('Example: ADMIN_TOKEN=$(cat server/test-token.txt) node scripts/import-vimeo-videos.js');
  process.exit(1);
}

// Run the import
importVimeoVideos();