// Test authentication endpoints
import fetch from 'node-fetch';

async function testAuth() {
  const API_BASE_URL = 'http://localhost:5000';
  let token = null;
  let userId = null;

  console.log('=============== AUTH TESTING ===============');
  
  try {
    // 1. Test registration
    console.log('\n1. Testing registration with new user:');
    const randomNum = Math.floor(Math.random() * 10000);
    const registrationData = {
      username: `testuser${randomNum}`,
      email: `test${randomNum}@example.com`,
      password: 'Password123!',
      fullName: 'Test User'
    };
    
    const regResponse = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData)
    });
    
    if (regResponse.ok) {
      const regData = await regResponse.json();
      console.log('✅ Registration successful');
      console.log('User ID:', regData.user.id);
      console.log('Username:', regData.user.username);
      console.log('Email:', regData.user.email);
      console.log('Token received:', !!regData.token);
      
      token = regData.token;
      userId = regData.user.id;
    } else {
      const regError = await regResponse.json();
      console.log('❌ Registration failed:', regError);
    }
    
    // 2. Test registration with existing user (should fail)
    if (token) {
      console.log('\n2. Testing registration with existing email:');
      const duplicateResponse = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData)
      });
      
      if (!duplicateResponse.ok) {
        const duplicateError = await duplicateResponse.json();
        console.log('✅ Correctly rejected duplicate registration:', duplicateError.message);
      } else {
        console.log('❌ Duplicate registration should have failed but succeeded');
      }
    }
    
    // 3. Test login with created user
    console.log('\n3. Testing login with created user:');
    const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: registrationData.email,
        password: registrationData.password
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login successful');
      console.log('User ID:', loginData.user.id);
      console.log('Username:', loginData.user.username);
      console.log('Email:', loginData.user.email);
      console.log('Token received:', !!loginData.token);
      
      // Update token to use latest one
      token = loginData.token;
    } else {
      const loginError = await loginResponse.json();
      console.log('❌ Login failed:', loginError);
    }
    
    // 4. Test auth/me endpoint to get user profile
    if (token) {
      console.log('\n4. Testing auth/me endpoint with token:');
      const meResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (meResponse.ok) {
        const userData = await meResponse.json();
        console.log('✅ Retrieved user profile successfully');
        console.log('User ID:', userData.id);
        console.log('Username:', userData.username);
        console.log('Email:', userData.email);
      } else {
        const meError = await meResponse.json();
        console.log('❌ Failed to get user profile:', meError);
      }
    }
    
    // 5. Test auth/me with invalid token
    console.log('\n5. Testing auth/me with invalid token:');
    const badTokenResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { 'Authorization': 'Bearer invalid_token_here' }
    });
    
    if (!badTokenResponse.ok) {
      const badTokenError = await badTokenResponse.json();
      console.log('✅ Correctly rejected invalid token:', badTokenError.message);
    } else {
      console.log('❌ Invalid token should have been rejected but was accepted');
    }
    
    // 6. Test login with wrong password
    console.log('\n6. Testing login with wrong password:');
    const wrongPassResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: registrationData.email,
        password: 'WrongPassword123!'
      })
    });
    
    if (!wrongPassResponse.ok) {
      const wrongPassError = await wrongPassResponse.json();
      console.log('✅ Correctly rejected wrong password:', wrongPassError.message);
    } else {
      console.log('❌ Wrong password should have been rejected but was accepted');
    }
    
    // 7. Test login with non-existent user
    console.log('\n7. Testing login with non-existent user:');
    const nonUserResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nonexistent_user@example.com',
        password: 'Password123!'
      })
    });
    
    if (!nonUserResponse.ok) {
      const nonUserError = await nonUserResponse.json();
      console.log('✅ Correctly rejected non-existent user:', nonUserError.message);
    } else {
      console.log('❌ Non-existent user should have been rejected but was accepted');
    }
    
    // 8. Test Supabase user sync
    console.log('\n8. Testing Supabase user sync:');
    const supabaseId = `supabase_${Date.now()}`;
    const supabaseUserResponse = await fetch(`${API_BASE_URL}/api/auth/sync-supabase-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supabaseId,
        email: `supabase_${Date.now()}@example.com`,
        username: `supabase_user_${Date.now()}`,
        fullName: 'Supabase Test User'
      })
    });
    
    if (supabaseUserResponse.ok) {
      const supabaseUserData = await supabaseUserResponse.json();
      console.log('✅ Supabase user sync successful');
      console.log('User ID:', supabaseUserData.id);
      console.log('Username:', supabaseUserData.username);
      console.log('Email:', supabaseUserData.email);
    } else {
      const supabaseUserError = await supabaseUserResponse.json();
      console.log('❌ Supabase user sync failed:', supabaseUserError);
    }
    
  } catch (error) {
    console.error('Test failed with error:', error);
  }
  
  console.log('\n=============== AUTH TESTING COMPLETE ===============');
}

testAuth();

// Add explicit module export
export default testAuth;