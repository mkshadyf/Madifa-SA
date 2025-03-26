import jwt from 'jsonwebtoken';
import fs from 'fs';

// Create an admin token for testing
const token = jwt.sign(
  { 
    userId: 1, 
    username: "admin", 
    isAdmin: true 
  }, 
  process.env.JWT_SECRET || 'madifa-secret-key', 
  { expiresIn: '1d' }
);

// Save to file
fs.writeFileSync('server/test-token.txt', token);

console.log('Admin token created and saved to server/test-token.txt');
console.log('Token:', token);