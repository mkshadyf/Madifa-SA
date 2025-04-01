import { storage } from '../server/storage';
import { InsertUser } from '../shared/schema';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    // Admin user details - you can use these credentials to log in
    const username = 'admin2023';
    const email = 'admin2023@madifa.com';
    const password = 'Admin2023@Madifa'; // Strong password with special chars
    
    // Check if user already exists
    const existingUserByEmail = await storage.getUserByEmail(email);
    if (existingUserByEmail) {
      console.log('An admin with this email already exists.');
      return;
    }
    
    const existingUserByUsername = await storage.getUserByUsername(username);
    if (existingUserByUsername) {
      console.log('An admin with this username already exists.');
      return;
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Create the admin user
    const adminUser: InsertUser = {
      username,
      email,
      password: hashedPassword,
      fullName: 'System Administrator',
      isAdmin: true,
      isPremium: true,
    };
    
    const user = await storage.createUser(adminUser);
    
    // Log success (without showing the password)
    console.log('Admin user created successfully:');
    console.log({
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      isPremium: user.isPremium
    });
    
    console.log('\nAdmin credentials:');
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    console.log('\nPlease keep these credentials secure!');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

// Execute the function
createAdminUser().then(() => {
  console.log('Script execution complete.');
  process.exit(0);
}).catch(error => {
  console.error('Script error:', error);
  process.exit(1);
});