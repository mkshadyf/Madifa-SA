import axios from 'axios';

const BASE_URL = 'http://localhost:5000';
let authToken: string | null = null;
let userId: number | null = null;

/**
 * Test user registration
 */
async function testRegistration() {
  try {
    console.log('\n--- Testing User Registration ---');
    
    // Create a test user with random username to avoid conflicts
    const randomSuffix = Math.floor(Math.random() * 10000);
    const testUser = {
      username: `testuser_${randomSuffix}`,
      email: `test_${randomSuffix}@example.com`,
      password: 'Test@123',
      fullName: 'Test User'
    };
    
    console.log(`Attempting to register user: ${testUser.username}`);
    
    const response = await axios.post(`${BASE_URL}/api/auth/register`, testUser);
    
    if (response.status === 201 && response.data.token && response.data.user) {
      console.log('✅ Registration successful!');
      console.log(`User ID: ${response.data.user.id}`);
      console.log(`Username: ${response.data.user.username}`);
      console.log(`Email: ${response.data.user.email}`);
      console.log(`Token received: ${response.data.token.substring(0, 15)}...`);
      
      // Save the token and user ID for other tests
      authToken = response.data.token;
      userId = response.data.user.id;
      
      return {
        success: true,
        token: authToken,
        userId: userId,
        credentials: testUser
      };
    } else {
      console.log('❌ Registration failed with unexpected response');
      console.log('Response:', response.data);
      return { success: false };
    }
  } catch (error: any) {
    console.log('❌ Registration failed with error');
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
 * Test user login
 */
async function testLogin(credentials?: { username?: string, email: string, password: string }) {
  try {
    console.log('\n--- Testing User Login ---');
    
    const loginData = credentials || {
      email: 'admin@madifa.com',
      password: 'Admin@123'
    };
    
    console.log(`Attempting to login with email: ${loginData.email}`);
    
    const response = await axios.post(`${BASE_URL}/api/auth/login`, loginData);
    
    if (response.status === 200 && response.data.token && response.data.user) {
      console.log('✅ Login successful!');
      console.log(`User ID: ${response.data.user.id}`);
      console.log(`Username: ${response.data.user.username}`);
      console.log(`Email: ${response.data.user.email}`);
      console.log(`Token received: ${response.data.token.substring(0, 15)}...`);
      
      // Save the token and user ID for other tests
      authToken = response.data.token;
      userId = response.data.user.id;
      
      return {
        success: true,
        token: authToken,
        userId: userId
      };
    } else {
      console.log('❌ Login failed with unexpected response');
      console.log('Response:', response.data);
      return { success: false };
    }
  } catch (error: any) {
    console.log('❌ Login failed with error');
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
 * Test invalid login (wrong password)
 */
async function testInvalidLogin() {
  try {
    console.log('\n--- Testing Invalid Login ---');
    
    const loginData = {
      email: 'admin@madifa.com',
      password: 'WrongPassword'
    };
    
    console.log(`Attempting to login with incorrect password for: ${loginData.email}`);
    
    const response = await axios.post(`${BASE_URL}/api/auth/login`, loginData);
    
    console.log('❌ Test failed - invalid login should not succeed');
    console.log('Response:', response.data);
    return { success: false };
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      console.log('✅ Invalid login correctly rejected with 401 Unauthorized');
      return { success: true };
    } else {
      console.log('❌ Invalid login test failed with unexpected error');
      if (error.response) {
        console.log(`Status: ${error.response.status}`);
        console.log('Error data:', error.response.data);
      } else {
        console.log('Error:', error.message);
      }
      return { success: false, error };
    }
  }
}

/**
 * Test authentication verification (me endpoint)
 */
async function testAuthVerification() {
  try {
    console.log('\n--- Testing Auth Verification ---');
    
    if (!authToken) {
      console.log('❌ No auth token available. Please run login test first.');
      return { success: false };
    }
    
    console.log('Attempting to fetch user profile with token');
    
    const response = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    
    if (response.status === 200 && response.data) {
      console.log('✅ Auth verification successful!');
      console.log(`User ID: ${response.data.id}`);
      console.log(`Username: ${response.data.username}`);
      console.log(`Email: ${response.data.email}`);
      return { success: true };
    } else {
      console.log('❌ Auth verification failed with unexpected response');
      console.log('Response:', response.data);
      return { success: false };
    }
  } catch (error: any) {
    console.log('❌ Auth verification failed with error');
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
 * Test expired token (modify token to be expired)
 */
async function testExpiredToken() {
  try {
    console.log('\n--- Testing Expired Token ---');
    
    if (!authToken) {
      console.log('❌ No auth token available. Please run login test first.');
      return { success: false };
    }
    
    // Create an expired token by modifying the payload
    // This is a naive approach that might not work with all JWT implementations
    // but it's a way to simulate an expired token without waiting
    const parts = authToken.split('.');
    if (parts.length !== 3) {
      console.log('❌ Invalid JWT token format');
      return { success: false };
    }
    
    // Decode the payload
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    
    // Set expiration to a past time
    payload.exp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
    
    // Re-encode (this will create an invalid signature, but that's part of the test)
    const modifiedPayload = Buffer.from(JSON.stringify(payload)).toString('base64')
      .replace(/=/g, '') // Remove padding
      .replace(/\+/g, '-') // URL-safe
      .replace(/\//g, '_'); // URL-safe
    
    const expiredToken = `${parts[0]}.${modifiedPayload}.${parts[2]}`;
    
    console.log('Attempting to use expired/invalid token');
    
    const response = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${expiredToken}`
      }
    });
    
    console.log('❌ Test failed - expired token should not work');
    console.log('Response:', response.data);
    return { success: false };
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      console.log('✅ Expired token correctly rejected with 401 Unauthorized');
      return { success: true };
    } else {
      console.log('❌ Expired token test failed with unexpected error');
      if (error.response) {
        console.log(`Status: ${error.response.status}`);
        console.log('Error data:', error.response.data);
      } else {
        console.log('Error:', error.message);
      }
      return { success: false, error };
    }
  }
}

/**
 * Run all tests in sequence
 */
async function runAllTests() {
  console.log('=== STARTING AUTHENTICATION TESTS ===');
  
  // Test registration
  const regResult = await testRegistration();
  
  // Test login with the registered user if registration was successful
  let loginResult;
  if (regResult.success && regResult.credentials) {
    loginResult = await testLogin(regResult.credentials);
  } else {
    // Try to login with existing admin user
    loginResult = await testLogin();
  }
  
  // Run other tests if login succeeded
  if (loginResult.success) {
    await testAuthVerification();
    await testExpiredToken();
  }
  
  // Test invalid login
  await testInvalidLogin();
  
  console.log('\n=== AUTHENTICATION TESTS COMPLETE ===');
}

// Run tests when this file is executed directly
// Using import.meta.url to check if this is the main module
if (import.meta.url.endsWith('/test-auth.ts')) {
  runAllTests().catch(console.error);
}

export {
  testRegistration,
  testLogin,
  testInvalidLogin,
  testAuthVerification,
  testExpiredToken,
  runAllTests
};