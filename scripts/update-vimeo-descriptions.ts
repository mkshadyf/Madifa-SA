import { storage } from '../server/storage';

/**
 * This script updates all content items that have "Video from Vimeo" as their description
 * to a more appropriate description based on their title.
 */
async function updateVimeoDescriptions() {
  console.log('Starting update of "Video from Vimeo" descriptions...');
  
  try {
    // Get all contents
    const allContents = await storage.getAllContents();
    
    // Filter for contents with the generic "Video from Vimeo" description
    const contentsToUpdate = allContents.filter(
      content => content.description === 'Video from Vimeo'
    );
    
    console.log(`Found ${contentsToUpdate.length} content items with generic descriptions.`);
    
    // Update each content item
    let updatedCount = 0;
    
    for (const content of contentsToUpdate) {
      const newDescription = `Exclusive content on ${content.title}. Watch now on Madifa.`;
      
      await storage.updateContent(content.id, {
        description: newDescription
      });
      
      updatedCount++;
      console.log(`Updated description for: ${content.title}`);
    }
    
    console.log(`Successfully updated ${updatedCount} content descriptions.`);
  } catch (error) {
    console.error('Error updating descriptions:', error);
  }
}

// Execute the update function
updateVimeoDescriptions()
  .then(() => {
    console.log('Description update process completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });