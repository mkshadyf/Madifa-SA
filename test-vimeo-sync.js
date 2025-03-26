const { VimeoSync } = require('./server/vimeo-sync');

async function testVimeoSync() {
  try {
    console.log('Testing Vimeo Sync...');
    
    const syncResults = await VimeoSync.syncAllVideos();
    
    console.log('Sync complete. Results:', syncResults);
    console.log(`Added ${syncResults.added} videos`);
    console.log(`Updated ${syncResults.updated} videos`);
    console.log(`Failed to process ${syncResults.failed} videos`);
    console.log(`Total Vimeo videos: ${syncResults.totalVimeoVideos}`);
    
  } catch (error) {
    console.error('Error during Vimeo sync test:', error);
  }
}

testVimeoSync();