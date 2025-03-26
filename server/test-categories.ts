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
      password: 'Admin@123'
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
 * Test creating a new category
 */
async function testCreateCategory() {
  try {
    console.log('\n--- Testing Category Creation ---');
    
    if (!adminToken) {
      console.log('❌ No admin token available. Please run admin login first.');
      return { success: false };
    }
    
    const uniqueSuffix = Math.floor(Math.random() * 10000);
    const categoryData = {
      name: `Test Category ${uniqueSuffix}`,
      description: `This is a test category created during automated testing ${new Date().toISOString()}`
    };
    
    console.log(`Creating new category: ${categoryData.name}`);
    
    const response = await axios.post(`${BASE_URL}/api/admin/categories`, categoryData, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });
    
    if (response.status === 201 && response.data) {
      console.log('✅ Category created successfully!');
      console.log(`ID: ${response.data.id}`);
      console.log(`Name: ${response.data.name}`);
      console.log(`Description: ${response.data.description}`);
      return { success: true, data: response.data };
    } else {
      console.log('❌ Category creation failed with unexpected response');
      console.log('Response:', response.data);
      return { success: false };
    }
  } catch (error: any) {
    console.log('❌ Category creation failed with error');
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
 * Test updating a category
 */
async function testUpdateCategory(categoryId: number) {
  try {
    console.log(`\n--- Testing Category Update for ID ${categoryId} ---`);
    
    if (!adminToken) {
      console.log('❌ No admin token available. Please run admin login first.');
      return { success: false };
    }
    
    const updateData = {
      description: `Updated description from automated testing ${new Date().toISOString()}`
    };
    
    console.log(`Updating category ${categoryId} with new description`);
    
    const response = await axios.put(`${BASE_URL}/api/admin/categories/${categoryId}`, updateData, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });
    
    if (response.status === 200 && response.data) {
      console.log('✅ Category updated successfully!');
      console.log(`ID: ${response.data.id}`);
      console.log(`Name: ${response.data.name}`);
      console.log(`Description: ${response.data.description}`);
      return { success: true, data: response.data };
    } else {
      console.log('❌ Category update failed with unexpected response');
      console.log('Response:', response.data);
      return { success: false };
    }
  } catch (error: any) {
    console.log('❌ Category update failed with error');
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
 * Test getting all categories
 */
async function testGetAllCategories() {
  try {
    console.log('\n--- Testing Get All Categories ---');
    
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
 * Test content assignment to categories
 */
async function testContentCategoryAssignment() {
  try {
    console.log('\n--- Testing Content Category Assignment ---');
    
    if (!adminToken) {
      console.log('❌ No admin token available. Please run admin login first.');
      return { success: false };
    }
    
    // First get a list of all content
    const contentResponse = await axios.get(`${BASE_URL}/api/contents`);
    
    if (!contentResponse.data || !Array.isArray(contentResponse.data) || contentResponse.data.length === 0) {
      console.log('❌ No content available to test category assignment');
      return { success: false };
    }
    
    // Get all categories
    const categoriesResponse = await axios.get(`${BASE_URL}/api/categories`);
    
    if (!categoriesResponse.data || !Array.isArray(categoriesResponse.data) || categoriesResponse.data.length === 0) {
      console.log('❌ No categories available to test assignment');
      return { success: false };
    }
    
    // Pick a random content item and category
    const contentItem = contentResponse.data[Math.floor(Math.random() * contentResponse.data.length)];
    const category = categoriesResponse.data[Math.floor(Math.random() * categoriesResponse.data.length)];
    
    console.log(`Selected content: ${contentItem.title} (ID: ${contentItem.id})`);
    console.log(`Selected category: ${category.name} (ID: ${category.id})`);
    
    // Update the content's category
    const updateData = {
      categoryId: category.id
    };
    
    console.log(`Updating content ${contentItem.id} to category ${category.id}`);
    
    const updateResponse = await axios.put(`${BASE_URL}/api/admin/contents/${contentItem.id}`, updateData, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });
    
    if (updateResponse.status === 200 && updateResponse.data) {
      console.log('✅ Content category updated successfully!');
      console.log(`Content ID: ${updateResponse.data.id}`);
      console.log(`New Category ID: ${updateResponse.data.categoryId}`);
      
      // Verify by getting content for this category
      const verifyResponse = await axios.get(`${BASE_URL}/api/contents/category/${category.id}`);
      
      if (verifyResponse.status === 200 && Array.isArray(verifyResponse.data)) {
        const foundInCategory = verifyResponse.data.some(item => item.id === contentItem.id);
        if (foundInCategory) {
          console.log('✅ Content successfully verified in category!');
        } else {
          console.log('❌ Content not found in expected category');
        }
      }
      
      return { success: true, data: updateResponse.data };
    } else {
      console.log('❌ Content category update failed with unexpected response');
      console.log('Response:', updateResponse.data);
      return { success: false };
    }
  } catch (error: any) {
    console.log('❌ Content category assignment failed with error');
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
 * Test synchronizing default categories
 */
async function testSyncDefaultCategories() {
  try {
    console.log('\n--- Testing Default Categories Sync ---');
    
    console.log('Ensuring default categories exist');
    
    // Use the syncAllVideos method which internally calls ensureDefaultCategories
    // This avoids accessing the private method directly
    await VimeoSync.syncAllVideos();
    
    // Get all categories to verify
    const categoriesResponse = await axios.get(`${BASE_URL}/api/categories`);
    
    if (categoriesResponse.status === 200 && Array.isArray(categoriesResponse.data)) {
      console.log('✅ Default categories verified!');
      console.log(`Total categories: ${categoriesResponse.data.length}`);
      
      // Check if the default categories exist
      const defaultCategories = ['Movies', 'Trailers', 'Music Videos', 'Short Films'];
      const missingCategories = defaultCategories.filter(defaultCat => 
        !categoriesResponse.data.some((cat: { name: string }) => cat.name === defaultCat)
      );
      
      if (missingCategories.length === 0) {
        console.log('✅ All default categories are present in the database');
      } else {
        console.log('❌ Some default categories are missing:', missingCategories);
      }
      
      // Display each category
      categoriesResponse.data.forEach((category, index) => {
        console.log(`${index + 1}. ${category.name} (ID: ${category.id})`);
        if (category.description) {
          console.log(`   Description: ${category.description}`);
        }
      });
      
      return { success: true, data: categoriesResponse.data };
    } else {
      console.log('❌ Categories retrieval failed with unexpected response');
      console.log('Response:', categoriesResponse.data);
      return { success: false };
    }
  } catch (error: any) {
    console.log('❌ Default categories sync failed with error');
    console.log('Error:', error.message);
    return { success: false, error };
  }
}

/**
 * Run all tests in sequence
 */
async function runAllTests() {
  console.log('=== STARTING CATEGORY MANAGEMENT TESTS ===');
  
  // Admin login
  const loginResult = await adminLogin();
  
  if (!loginResult.success) {
    console.log('❌ Admin login failed, cannot proceed with admin-only tests');
  }
  
  // Test getting all categories
  const categoriesResult = await testGetAllCategories();
  
  // Test creating a new category
  if (loginResult.success) {
    const createResult = await testCreateCategory();
    
    // Test updating the category if creation was successful
    if (createResult.success && createResult.data) {
      await testUpdateCategory(createResult.data.id);
    }
    
    // Test content category assignment
    await testContentCategoryAssignment();
  }
  
  // Test synchronizing default categories
  await testSyncDefaultCategories();
  
  console.log('\n=== CATEGORY MANAGEMENT TESTS COMPLETE ===');
}

// Run tests when this file is executed directly
if (import.meta.url.endsWith('/test-categories.ts')) {
  runAllTests().catch(console.error);
}

export {
  adminLogin,
  testCreateCategory,
  testUpdateCategory,
  testGetAllCategories,
  testContentCategoryAssignment,
  testSyncDefaultCategories,
  runAllTests
};