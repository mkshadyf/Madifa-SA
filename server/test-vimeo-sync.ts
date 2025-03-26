import axios from 'axios';
import { VimeoSync } from './vimeo-sync';

const BASE_URL = 'http://localhost:5000';
let adminToken: string | null = null;

/**
 * Admin login for testing
 */
async function adminLogin() {
  try {
    console.log('\n--- Admin Login for Testing ---');
    
    const loginData = {
      email: 'testadmin@madifa.com',
      password: 'Admin@123' // Use plaintext password
    };
    
    console.log(`Attempting to login as admin with email: ${loginData.email}`);
    
    const response = await axios.post(`${BASE_URL}/api/auth/login`, loginData);
    
    if (response.status === 200 && response.data.token && response.data.user.isAdmin) {
      console.log('✅ Admin login successful!');
      console.log(`User ID: ${response.data.user.id}`);
      console.log(`Username: ${response.data.user.username}`);
      console.log(`Is Admin: ${response.data.user.isAdmin}`);
      
      // Save the token for other tests
      adminToken = response.data.token;
      
      return {
        success: true,
        token: adminToken
      };
    } else {
      console.log('❌ Admin login failed or user is not admin');
      console.log('Response:', response.data);
      return { success: false };
    }
  } catch (error: any) {
    console.log('❌ Admin login failed with error');
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log('Error data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
    return { success: false, error };
  }
}

/**
 * Test Vimeo synchronization through API
 */
async function testVimeoSync() {
  try {
    console.log('\n--- Testing Vimeo Synchronization ---');
    
    if (!adminToken) {
      console.log('❌ No admin token available. Please run admin login first.');
      return { success: false };
    }
    
    console.log('Initiating Vimeo content synchronization');
    
    const response = await axios.post(`${BASE_URL}/api/admin/vimeo-sync`, {}, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });
    
    if (response.status === 200 && response.data) {
      console.log('✅ Vimeo sync request successful!');
      console.log(`Added: ${response.data.added} videos`);
      console.log(`Updated: ${response.data.updated} videos`);
      console.log(`Failed: ${response.data.failed} videos`);
      console.log(`Total videos from Vimeo: ${response.data.totalVimeoVideos}`);
      return { success: true, data: response.data };
    } else {
      console.log('❌ Vimeo sync failed with unexpected response');
      console.log('Response:', response.data);
      return { success: false };
    }
  } catch (error: any) {
    console.log('❌ Vimeo sync failed with error');
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log('Error data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
    return { success: false, error };
  }
}

/**
 * Test direct class-based Vimeo synchronization
 */
async function testDirectVimeoSync() {
  try {
    console.log('\n--- Testing Direct Vimeo Synchronization ---');
    
    console.log('Calling VimeoSync.syncAllVideos directly');
    
    const result = await VimeoSync.syncAllVideos();
    
    console.log('✅ Direct Vimeo sync successful!');
    console.log(`Added: ${result.added} videos`);
    console.log(`Updated: ${result.updated} videos`);
    console.log(`Failed: ${result.failed} videos`);
    console.log(`Total videos from Vimeo: ${result.totalVimeoVideos}`);
    return { success: true, data: result };
  } catch (error: any) {
    console.log('❌ Direct Vimeo sync failed with error');
    console.log('Error:', error.message);
    return { success: false, error };
  }
}

/**
 * Test Vimeo sync status
 */
async function testVimeoSyncStatus() {
  try {
    console.log('\n--- Testing Vimeo Sync Status ---');
    
    if (!adminToken) {
      console.log('❌ No admin token available. Please run admin login first.');
      return { success: false };
    }
    
    console.log('Fetching Vimeo sync status');
    
    const response = await axios.get(`${BASE_URL}/api/admin/vimeo-sync-status`, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });
    
    if (response.status === 200 && response.data) {
      console.log('✅ Retrieved Vimeo sync status successfully!');
      console.log(`Database content count: ${response.data.databaseContentCount}`);
      console.log(`Vimeo content count: ${response.data.vimeoContentCount}`);
      console.log(`Sync needed: ${response.data.syncNeeded}`);
      return { success: true, data: response.data };
    } else {
      console.log('❌ Vimeo sync status failed with unexpected response');
      console.log('Response:', response.data);
      return { success: false };
    }
  } catch (error: any) {
    console.log('❌ Vimeo sync status failed with error');
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log('Error data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
    return { success: false, error };
  }
}

/**
 * Test categories
 */
async function testCategories() {
  try {
    console.log('\n--- Testing Categories ---');
    
    console.log('Fetching all categories');
    
    const response = await axios.get(`${BASE_URL}/api/categories`);
    
    if (response.status === 200 && Array.isArray(response.data)) {
      console.log('✅ Categories retrieved successfully!');
      console.log(`Total categories: ${response.data.length}`);
      
      // Display each category
      response.data.forEach((category, index) => {
        console.log(`${index + 1}. ${category.name} (ID: ${category.id})`);
        if (category.description) {
          console.log(`   Description: ${category.description}`);
        }
      });
      
      return { success: true, data: response.data };
    } else {
      console.log('❌ Categories retrieval failed with unexpected response');
      console.log('Response:', response.data);
      return { success: false };
    }
  } catch (error: any) {
    console.log('❌ Categories retrieval failed with error');
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log('Error data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
    return { success: false, error };
  }
}

/**
 * Test content by category
 */
async function testContentByCategory(categoryId: number) {
  try {
    console.log(`\n--- Testing Content for Category ${categoryId} ---`);
    
    console.log(`Fetching content for category ID: ${categoryId}`);
    
    const response = await axios.get(`${BASE_URL}/api/contents/category/${categoryId}`);
    
    if (response.status === 200 && Array.isArray(response.data)) {
      console.log('✅ Category content retrieved successfully!');
      console.log(`Total content items: ${response.data.length}`);
      
      // Display a few content items if available
      const displayLimit = Math.min(5, response.data.length);
      for (let i = 0; i < displayLimit; i++) {
        const content = response.data[i];
        console.log(`${i + 1}. ${content.title} (ID: ${content.id})`);
        console.log(`   Type: ${content.contentType}, Premium: ${content.isPremium}`);
      }
      
      if (response.data.length > displayLimit) {
        console.log(`... and ${response.data.length - displayLimit} more items`);
      }
      
      return { success: true, data: response.data };
    } else {
      console.log('❌ Category content retrieval failed with unexpected response');
      console.log('Response:', response.data);
      return { success: false };
    }
  } catch (error: any) {
    console.log('❌ Category content retrieval failed with error');
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log('Error data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
    return { success: false, error };
  }
}

/**
 * Run all tests in sequence
 */
async function runAllTests() {
  console.log('=== STARTING VIMEO SYNC & CATEGORY TESTS ===');
  
  // Admin login
  const loginResult = await adminLogin();
  
  if (loginResult.success) {
    // Test Vimeo sync status (before sync)
    await testVimeoSyncStatus();
    
    // Test direct Vimeo sync
    await testDirectVimeoSync();
    
    // Test API based Vimeo sync
    await testVimeoSync();
    
    // Test Vimeo sync status (after sync)
    await testVimeoSyncStatus();
  }
  
  // Test categories (doesn't require admin)
  const categoriesResult = await testCategories();
  
  // Test content by category for each category
  if (categoriesResult.success && Array.isArray(categoriesResult.data)) {
    for (const category of categoriesResult.data) {
      await testContentByCategory(category.id);
    }
  }
  
  console.log('\n=== VIMEO SYNC & CATEGORY TESTS COMPLETE ===');
}

// Run tests when this file is executed directly
// Using import.meta.url to check if this is the main module
if (import.meta.url.endsWith('/test-vimeo-sync.ts')) {
  runAllTests().catch(console.error);
}

export {
  adminLogin,
  testVimeoSync,
  testDirectVimeoSync,
  testVimeoSyncStatus,
  testCategories,
  testContentByCategory,
  runAllTests
};