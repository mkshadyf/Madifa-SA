import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertWatchHistorySchema, 
  insertWatchlistSchema, 
  insertSubscriptionSchema, 
  insertContentSchema, 
  insertCategorySchema,
  insertCaptionSchema,
  insertRatingSchema,
  insertReviewSchema,
  insertSocialShareSchema,
  User
} from "@shared/schema";

// Extended Request interface with user property
interface AuthRequest extends Request {
  user: User;
}
import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import payfast from "./payfast";
import { VimeoService } from "./vimeo";

// Constants
const JWT_SECRET = process.env.JWT_SECRET || "madifa-secret-key";
const PAYFAST_MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID || "10000100";
const PAYFAST_MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY || "46f0cd694581a";
const SUBSCRIPTION_AMOUNT = 59; // R59 monthly fee
const SALT_ROUNDS = 10;

// Helper to verify PayFast signature
const generatePayFastSignature = (data: Record<string, string | number>, passPhrase = "") => {
  // Remove signature field if present
  const { signature, ...dataToSign } = data;
  
  // Create parameter string
  const paramString = Object.entries(dataToSign)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}=${encodeURIComponent(value.toString())}`)
    .join("&");
  
  // Add passphrase if provided
  const stringToHash = paramString + (passPhrase ? `&passphrase=${encodeURIComponent(passPhrase)}` : "");
  
  // Generate MD5 hash
  return crypto.createHash("md5").update(stringToHash).digest("hex");
};

// Helper to check subscription status and update user premium status
const syncUserPremiumStatus = async (userId: number) => {
  // Get current subscription
  const subscription = await storage.getSubscription(userId);
  
  // User has premium if they have an active subscription that hasn't expired
  const isPremium = subscription && 
                    subscription.status === "active" && 
                    subscription.endDate && 
                    new Date(subscription.endDate) > new Date();
  
  // Update user premium status if needed
  const user = await storage.getUser(userId);
  if (user && user.isPremium !== !!isPremium) {
    await storage.updateUserSubscription(userId, !!isPremium);
  }
  
  return !!isPremium;
};

// JWT token generation
const generateToken = (userId: number) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
};

// Middleware to authenticate requests
const authenticate = async (req: Request, res: Response, next: Function) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("Auth header:", authHeader);
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Token:", token);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      console.log("Decoded token:", decoded);
      
      // Periodically check and update premium status for authenticated users
      // This ensures premium status stays in sync with subscription status
      if (Math.random() < 0.1) { // 10% chance to check on each request (to avoid doing it on every request)
        await syncUserPremiumStatus(decoded.userId);
      }
      
      const user = await storage.getUser(decoded.userId);
      console.log("Found user:", user ? "Yes" : "No");

      if (!user) {
        return res.status(401).json({ message: "Invalid token - user not found" });
      }

      // Add user to request object
      (req as AuthRequest).user = user;
      next();
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      return res.status(401).json({ message: "Invalid token - JWT verification failed" });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ message: "Authentication error" });
  }
};

// Middleware to authenticate admin requests
const authenticateAdmin = (req: Request, res: Response, next: Function) => {
  console.log("Admin auth - checking authentication");
  
  // Get the auth header
  const authHeader = req.headers.authorization;
  console.log("Admin auth header:", authHeader);
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const token = authHeader.split(" ")[1];
  console.log("Admin token:", token);
  
  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    console.log("Admin decoded token:", decoded);
    
    // Get the user
    storage.getUser(decoded.userId)
      .then(user => {
        console.log("Admin user found:", user ? "Yes" : "No");
        console.log("Is admin:", user?.isAdmin);
        
        if (!user) {
          return res.status(401).json({ message: "User not found" });
        }
        
        if (!user.isAdmin) {
          return res.status(403).json({ message: "Admin access required" });
        }
        
        // Add user to request object
        (req as AuthRequest).user = user;
        next();
      })
      .catch(error => {
        console.error("Admin auth user fetch error:", error);
        return res.status(500).json({ message: "Error fetching user data" });
      });
  } catch (error) {
    console.error("Admin auth JWT verification error:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // User Authentication Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if email already exists
      const existingUserByEmail = await storage.getUserByEmail(validatedData.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      // Check if username already exists
      const existingUserByUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, SALT_ROUNDS);
      
      // Create user
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword
      });
      
      // Generate token
      const token = generateToken(user.id);
      
      // Return user info without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword, token });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Supabase User Sync Route - Used when users sign in via Supabase
  app.post("/api/auth/sync-supabase-user", async (req, res) => {
    try {
      // Get Supabase ID and email from request
      const { supabaseId, email, username, fullName, password } = req.body;
      
      if (!supabaseId || !email) {
        return res.status(400).json({ message: "Supabase ID and email are required" });
      }
      
      // Check if user already exists by email
      const existingUserByEmail = await storage.getUserByEmail(email);
      if (existingUserByEmail) {
        // User exists, return them
        return res.status(200).json(existingUserByEmail);
      }
      
      // Create a new user in our database
      const hashedPassword = password 
        ? await bcrypt.hash(password, SALT_ROUNDS) 
        : await bcrypt.hash(crypto.randomBytes(16).toString('hex'), SALT_ROUNDS); // Generate random password if none provided
      
      let userUsername = username || email.split('@')[0];
      
      // Check if username already exists
      const existingUserByUsername = await storage.getUserByUsername(userUsername);
      if (existingUserByUsername) {
        // Add random string to username
        const randomSuffix = Math.floor(Math.random() * 10000);
        userUsername = `${userUsername}_${randomSuffix}`;
      }
      
      // Create user in our database
      const user = await storage.createUser({
        username: userUsername,
        email,
        password: hashedPassword,
        fullName
        // Note: supabaseId field would need to be added to schema.ts
      });
      
      return res.status(201).json(user);
    } catch (error) {
      console.error("Error syncing Supabase user:", error);
      return res.status(500).json({ message: "Error syncing Supabase user" });
    }
  });
  
  // Get user by email (for Supabase integration)
  app.get("/api/auth/user-by-email/:email", async (req, res) => {
    try {
      const { email } = req.params;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      // Use existing method to get user by email
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Error getting user by email:", error);
      return res.status(500).json({ message: "Error getting user by email" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      // Get user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Check password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Check and update premium status based on subscription
      await syncUserPremiumStatus(user.id);
      
      // Get updated user
      const updatedUser = await storage.getUser(user.id);
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to retrieve user data" });
      }
      
      // Generate token
      const token = generateToken(updatedUser.id);
      
      // Return user info without password
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/auth/me", authenticate, async (req, res) => {
    try {
      const user = (req as AuthRequest).user;
      
      // Check and update premium status based on subscription
      await syncUserPremiumStatus(user.id);
      
      // Get updated user
      const updatedUser = await storage.getUser(user.id);
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to retrieve user data" });
      }
      
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Content Routes
  app.get("/api/contents", async (req, res) => {
    try {
      // First try to get content from our database
      const contents = await storage.getAllContents();
      
      // If we have contents in the database, return them
      if (contents && contents.length > 0) {
        return res.json(contents);
      }
      
      // If no contents in database, fetch from Vimeo
      try {
        console.log("No content in database, fetching from Vimeo...");
        const vimeoResponse = await VimeoService.getAllVideos(1, 25);
        
        // Convert Vimeo videos to our content format
        // We're using category ID 1 by default and marking all as free content initially
        const transformedContent = vimeoResponse.videos.map((video, index) => {
          // Determine if it's a trailer based on title
          const isTrailer = video.title.toLowerCase().includes('trailer');
          
          return {
            id: index + 1, // Since we don't have real IDs yet
            title: video.title,
            description: video.description || `Video ${index + 1}`,
            thumbnailUrl: video.thumbnailUrl,
            videoUrl: video.streamingUrl,
            trailerUrl: isTrailer ? video.streamingUrl : '',
            releaseYear: new Date().getFullYear(),
            duration: video.duration,
            isPremium: !isTrailer, // Trailers are free, others are premium
            contentType: isTrailer ? 'trailer' : 'movie',
            vimeoId: video.id,
            categoryId: 1, // Default category
            displayPriority: index
          };
        });
        
        return res.json(transformedContent);
      } catch (vimeoError) {
        console.error("Failed to fetch from Vimeo:", vimeoError);
        // Return empty array if both database and Vimeo fail
        return res.json([]);
      }
    } catch (error) {
      console.error("Error fetching contents:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Important: More specific routes must come BEFORE parametrized routes
  app.get("/api/contents/premium", async (req, res) => {
    try {
      // First try to get premium content from our database
      const contents = await storage.getPremiumContents();
      
      // If we have contents in the database, return them
      if (contents && contents.length > 0) {
        return res.json(contents);
      }
      
      // If no premium contents in database, fetch from Vimeo
      try {
        console.log("No premium content in database, fetching from Vimeo...");
        const vimeoResponse = await VimeoService.getAllVideos(1, 25);
        
        // Convert Vimeo videos to our content format
        // Filter for premium content (not trailers)
        const transformedContent = vimeoResponse.videos
          .filter(video => !video.title.toLowerCase().includes('trailer'))
          .map((video, index) => {
            return {
              id: index + 100, // Using a different range for premium content
              title: video.title,
              description: video.description || `Video ${index + 1}`,
              thumbnailUrl: video.thumbnailUrl,
              videoUrl: video.streamingUrl,
              trailerUrl: '',
              releaseYear: new Date().getFullYear(),
              duration: video.duration,
              isPremium: true,
              contentType: 'movie',
              vimeoId: video.id,
              categoryId: 1, // Default category
              displayPriority: index
            };
          });
        
        return res.json(transformedContent);
      } catch (vimeoError) {
        console.error("Failed to fetch premium content from Vimeo:", vimeoError);
        // Return empty array if both database and Vimeo fail
        return res.json([]);
      }
    } catch (error) {
      console.error("Error fetching premium contents:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/contents/free", async (req, res) => {
    try {
      // First try to get free content from our database
      const contents = await storage.getFreeContents();
      
      // If we have contents in the database, return them
      if (contents && contents.length > 0) {
        return res.json(contents);
      }
      
      // If no free contents in database, fetch from Vimeo
      try {
        console.log("No free content in database, fetching from Vimeo...");
        const vimeoResponse = await VimeoService.getAllVideos(1, 25);
        
        // Convert Vimeo videos to our content format
        // Filter for free content (trailers only)
        const transformedContent = vimeoResponse.videos
          .filter(video => video.title.toLowerCase().includes('trailer'))
          .map((video, index) => {
            return {
              id: index + 200, // Using a different range for free content
              title: video.title,
              description: video.description || `Trailer ${index + 1}`,
              thumbnailUrl: video.thumbnailUrl,
              videoUrl: video.streamingUrl,
              trailerUrl: video.streamingUrl,
              releaseYear: new Date().getFullYear(),
              duration: video.duration,
              isPremium: false,
              contentType: 'trailer',
              vimeoId: video.id,
              categoryId: 1, // Default category
              displayPriority: index
            };
          });
        
        return res.json(transformedContent);
      } catch (vimeoError) {
        console.error("Failed to fetch free content from Vimeo:", vimeoError);
        // Return empty array if both database and Vimeo fail
        return res.json([]);
      }
    } catch (error) {
      console.error("Error fetching free contents:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/contents/category/:categoryId", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      if (isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const contents = await storage.getContentsByCategory(categoryId);
      
      // If we have data in the database, return it
      if (contents && contents.length > 0) {
        return res.json(contents);
      }
      
      // If no contents in database, we would need to add Vimeo fetch logic here
      // But since we don't have category information in the Vimeo videos yet,
      // we'll return an empty array
      return res.json([]);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Route to get contents by type
  app.get("/api/contents/type/:contentType", async (req, res) => {
    try {
      const { contentType } = req.params;
      
      // Validate content type
      if (!['movie', 'series', 'trailer', 'music_video'].includes(contentType)) {
        return res.status(400).json({ message: "Invalid content type. Must be movie, series, trailer, or music_video" });
      }
      
      // Try to get from database first (This endpoint doesn't exist yet in our storage interface)
      // Since we don't have a specific method for this, we'll get all contents and filter
      const allContents = await storage.getAllContents();
      
      // Filter by content type if we have data
      if (allContents && allContents.length > 0) {
        const filteredContents = allContents.filter(content => 
          (contentType === 'movie' && (!content.contentType || content.contentType === 'movie')) ||
          (content.contentType === contentType)
        );
        
        return res.json(filteredContents);
      }
      
      // If no content in database, fetch from Vimeo
      try {
        console.log(`No ${contentType} content in database, fetching from Vimeo...`);
        const vimeoResponse = await VimeoService.getAllVideos(1, 25);
        
        // Filter and transform Vimeo videos based on content type
        let transformedContent = [];
        
        if (contentType === 'trailer') {
          // For trailers - filter by title containing "trailer"
          transformedContent = vimeoResponse.videos
            .filter(video => video.title.toLowerCase().includes('trailer'))
            .map((video, index) => ({
              id: index + 300, // Using a different ID range
              title: video.title,
              description: video.description || `Trailer ${index + 1}`,
              thumbnailUrl: video.thumbnailUrl,
              videoUrl: video.streamingUrl,
              trailerUrl: video.streamingUrl,
              releaseYear: new Date().getFullYear(),
              duration: video.duration,
              isPremium: false, // Trailers are always free
              contentType: 'trailer',
              vimeoId: video.id,
              categoryId: 1,
              displayPriority: index
            }));
        } else if (contentType === 'movie') {
          // For movies - filter out trailers
          transformedContent = vimeoResponse.videos
            .filter(video => !video.title.toLowerCase().includes('trailer'))
            .map((video, index) => ({
              id: index + 400, // Using a different ID range
              title: video.title,
              description: video.description || `Movie ${index + 1}`,
              thumbnailUrl: video.thumbnailUrl,
              videoUrl: video.streamingUrl,
              trailerUrl: '',
              releaseYear: new Date().getFullYear(),
              duration: video.duration,
              isPremium: true, // Movies are premium
              contentType: 'movie',
              vimeoId: video.id,
              categoryId: 1,
              displayPriority: index
            }));
        } else if (contentType === 'music_video') {
          // For music videos - currently we don't have a reliable way to identify them
          // In a real app, we'd have proper metadata or naming conventions
          // For now, we'll return an empty array
          transformedContent = [];
        } else if (contentType === 'series') {
          // For series - currently we don't have a reliable way to identify them
          // In a real app, we'd have proper metadata or naming conventions
          // For now, we'll return an empty array
          transformedContent = [];
        }
        
        return res.json(transformedContent);
      } catch (vimeoError) {
        console.error(`Failed to fetch ${contentType} content from Vimeo:`, vimeoError);
        return res.json([]);
      }
    } catch (error) {
      console.error("Error fetching content by type:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/contents/:id", async (req, res) => {
    try {
      const contentId = parseInt(req.params.id);
      if (isNaN(contentId)) {
        return res.status(400).json({ message: "Invalid content ID" });
      }
      
      // Try to get from database first
      const content = await storage.getContent(contentId);
      
      // If found in database, return it
      if (content) {
        return res.json(content);
      }
      
      // If not found in database but has a vimeoId format (looking for direct Vimeo ID)
      if (req.params.id.match(/^\d+$/)) {
        try {
          console.log(`Content ID ${contentId} not found in database, trying Vimeo ID ${req.params.id}...`);
          // Try to get directly from Vimeo
          const vimeoId = req.params.id;
          const vimeoVideo = await VimeoService.getVideoDetails(vimeoId);
          
          if (vimeoVideo) {
            // Determine if it's a trailer based on title
            const isTrailer = vimeoVideo.title.toLowerCase().includes('trailer');
            
            // Create a content object
            const transformedContent = {
              id: contentId,
              title: vimeoVideo.title,
              description: vimeoVideo.description || `Video ${contentId}`,
              thumbnailUrl: vimeoVideo.thumbnailUrl,
              videoUrl: vimeoVideo.streamingUrl,
              trailerUrl: isTrailer ? vimeoVideo.streamingUrl : '',
              releaseYear: new Date().getFullYear(),
              duration: vimeoVideo.duration,
              isPremium: !isTrailer, // Trailers are free, others are premium
              contentType: isTrailer ? 'trailer' : 'movie',
              vimeoId: vimeoVideo.id,
              categoryId: 1, // Default category
              displayPriority: 0
            };
            
            return res.json(transformedContent);
          }
        } catch (vimeoError) {
          console.error(`Failed to fetch Vimeo video with ID ${req.params.id}:`, vimeoError);
          // Continue to 404 response
        }
      }
      
      // If we get here, content was not found in database or Vimeo
      return res.status(404).json({ message: "Content not found" });
    } catch (error) {
      console.error("Error fetching content:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Categories Routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/categories/:id", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      if (isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const category = await storage.getCategory(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Watchlist Routes
  app.get("/api/watchlist", authenticate, async (req, res) => {
    try {
      const user = (req as AuthRequest).user;
      const watchlist = await storage.getWatchlist(user.id);
      res.json(watchlist);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/watchlist", authenticate, async (req, res) => {
    try {
      const user = (req as AuthRequest).user;
      const { contentId } = req.body;
      
      if (!contentId) {
        return res.status(400).json({ message: "Content ID is required" });
      }
      
      const content = await storage.getContent(contentId);
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      const validatedData = insertWatchlistSchema.parse({
        userId: user.id,
        contentId
      });
      
      const watchlistItem = await storage.addToWatchlist(validatedData);
      res.status(201).json(watchlistItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/watchlist/:contentId", authenticate, async (req, res) => {
    try {
      const user = (req as AuthRequest).user;
      const contentId = parseInt(req.params.contentId);
      
      if (isNaN(contentId)) {
        return res.status(400).json({ message: "Invalid content ID" });
      }
      
      await storage.removeFromWatchlist(user.id, contentId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Watch History Routes
  app.get("/api/history", authenticate, async (req, res) => {
    try {
      const user = (req as AuthRequest).user;
      const history = await storage.getWatchHistory(user.id);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/history", authenticate, async (req, res) => {
    try {
      const user = (req as AuthRequest).user;
      const { contentId, progress, deviceId } = req.body;
      
      if (!contentId || progress === undefined) {
        return res.status(400).json({ message: "Content ID and progress are required" });
      }
      
      const content = await storage.getContent(contentId);
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      const validatedData = insertWatchHistorySchema.parse({
        userId: user.id,
        contentId,
        progress,
        deviceId
      });
      
      const historyItem = await storage.updateWatchHistory(validatedData);
      res.status(201).json(historyItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Sync watch history for cross-device viewing
  app.get("/api/history/sync", authenticate, async (req, res) => {
    try {
      const user = (req as AuthRequest).user;
      const history = await storage.getWatchHistory(user.id);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get content for continue watching
  app.get("/api/history/continue-watching", authenticate, async (req, res) => {
    try {
      const user = (req as AuthRequest).user;
      
      // Get watch history with content that is in progress (not completed)
      const watchHistory = await storage.getWatchHistory(user.id);
      const continueWatching = watchHistory
        .filter(item => (item.progress ?? 0) > 0 && (item.progress ?? 0) < 95) // Filter items in progress
        .map(item => ({
          ...item.content,
          progress: item.progress ?? 0
        }))
        .sort((a, b) => {
          // Sort by last watched (most recent first)
          const dateA = new Date(a.createdAt ?? 0).getTime();
          const dateB = new Date(b.createdAt ?? 0).getTime();
          return dateB - dateA;
        })
        .slice(0, 10); // Limit to 10 items
      
      res.json(continueWatching);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get watch progress for a specific content
  app.get("/api/history/:contentId", authenticate, async (req, res) => {
    try {
      const user = (req as AuthRequest).user;
      const contentId = parseInt(req.params.contentId);
      
      if (isNaN(contentId)) {
        return res.status(400).json({ message: "Invalid content ID" });
      }
      
      // Find the content in watch history
      const watchHistory = await storage.getWatchHistory(user.id);
      const contentHistory = watchHistory.find(item => item.content.id === contentId);
      
      if (!contentHistory) {
        return res.json({ progress: 0 });
      }
      
      res.json({ progress: contentHistory.progress });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Subscription Routes
  app.get("/api/subscription", authenticate, async (req, res) => {
    try {
      const user = (req as AuthRequest).user;
      
      // Check and update premium status based on subscription
      await syncUserPremiumStatus(user.id);
      
      const subscription = await storage.getSubscription(user.id);
      res.json(subscription || { status: "none" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/subscription/initiate", authenticate, async (req, res) => {
    try {
      const user = (req as AuthRequest).user;
      const { returnUrl, cancelUrl } = req.body;
      
      if (!returnUrl || !cancelUrl) {
        return res.status(400).json({ message: "Return URL and cancel URL are required" });
      }
      
      // Create payment data
      const paymentId = `SUB-${user.id}-${Date.now()}`;
      const paymentData: Record<string, string | number> = {
        merchant_id: PAYFAST_MERCHANT_ID,
        merchant_key: PAYFAST_MERCHANT_KEY,
        return_url: returnUrl,
        cancel_url: cancelUrl,
        notify_url: `${req.protocol}://${req.get('host')}/api/subscription/notify`,
        name_first: user.fullName || user.username,
        email_address: user.email,
        m_payment_id: paymentId,
        amount: SUBSCRIPTION_AMOUNT,
        item_name: "Madifa Premium Subscription",
        item_description: "Monthly subscription to Madifa Premium",
        custom_str1: user.id.toString()
      };
      
      // Generate signature
      paymentData.signature = generatePayFastSignature(paymentData);
      
      res.json({
        paymentUrl: "https://sandbox.payfast.co.za/eng/process",
        paymentData
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/subscription/notify", async (req, res) => {
    try {
      const { m_payment_id, pf_payment_id, payment_status, custom_str1 } = req.body;
      
      // Validate signature (would require data from PayFast to be properly implemented)
      // For now, just acknowledge the request
      
      if (!custom_str1 || !payment_status) {
        return res.status(400).json({ message: "Invalid notification data" });
      }
      
      const userId = parseInt(custom_str1);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check payment status
      if (payment_status === "COMPLETE") {
        // Calculate subscription end date (1 month from now)
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        
        // Check if user already has a subscription
        const existingSubscription = await storage.getSubscription(userId);
        
        if (existingSubscription) {
          // Update existing subscription
          await storage.updateSubscription(existingSubscription.id, "active", endDate);
        } else {
          // Create new subscription
          const subscriptionData = insertSubscriptionSchema.parse({
            userId,
            planId: "premium",
            status: "active",
            startDate: new Date(),
            endDate,
            paymentReference: pf_payment_id
          });
          
          await storage.createSubscription(subscriptionData);
        }
        
        // Update user premium status
        await storage.updateUserSubscription(userId, true);
      }
      
      // Acknowledge the notification
      res.status(200).send("OK");
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/subscription/cancel", authenticate, async (req, res) => {
    try {
      const user = (req as AuthRequest).user;
      
      // Get current subscription
      const subscription = await storage.getSubscription(user.id);
      if (!subscription) {
        return res.status(404).json({ message: "No active subscription found" });
      }
      
      // Update subscription status
      await storage.updateSubscription(subscription.id, "cancelled");
      
      // Check if the subscription has already expired
      const hasExpired = subscription.endDate && new Date(subscription.endDate) <= new Date();
      
      // If the subscription has expired, update the premium status immediately
      if (hasExpired) {
        await storage.updateUserSubscription(user.id, false);
      } else {
        // Otherwise, sync the premium status based on current subscription status
        await syncUserPremiumStatus(user.id);
      }
      
      res.json({ message: "Subscription cancelled" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Admin Routes
  // Content Management
  app.post("/api/admin/contents", authenticateAdmin, async (req, res) => {
    try {
      const validatedData = insertContentSchema.parse(req.body);
      
      const content = await storage.createContent(validatedData);
      res.status(201).json(content);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/admin/contents/:id", authenticateAdmin, async (req, res) => {
    try {
      const contentId = parseInt(req.params.id);
      if (isNaN(contentId)) {
        return res.status(400).json({ message: "Invalid content ID" });
      }
      
      const content = await storage.getContent(contentId);
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      // Update the content with the provided data
      const updatedContent = await storage.updateContent(contentId, req.body);
      if (!updatedContent) {
        return res.status(500).json({ message: "Failed to update content" });
      }
      
      res.json(updatedContent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/admin/contents/:id", authenticateAdmin, async (req, res) => {
    try {
      const contentId = parseInt(req.params.id);
      if (isNaN(contentId)) {
        return res.status(400).json({ message: "Invalid content ID" });
      }
      
      const content = await storage.getContent(contentId);
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      // Delete the content
      await storage.deleteContent(contentId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Category Management
  app.post("/api/admin/categories", authenticateAdmin, async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/admin/categories/:id", authenticateAdmin, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      if (isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const category = await storage.getCategory(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      // Update the category with the provided data
      const updatedCategory = await storage.updateCategory(categoryId, req.body);
      if (!updatedCategory) {
        return res.status(500).json({ message: "Failed to update category" });
      }
      
      res.json(updatedCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/admin/categories/:id", authenticateAdmin, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      if (isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const category = await storage.getCategory(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      // Delete the category
      await storage.deleteCategory(categoryId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // User Management
  app.get("/api/admin/users", authenticateAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      
      // Remove passwords from response
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/admin/users/:id", authenticateAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update the user with the provided data
      // Note: Do not allow updating password through this endpoint
      const { password, ...updateData } = req.body;
      
      const updatedUser = await storage.updateUser(userId, updateData);
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update user" });
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  // Admin Dashboard Stats
  app.get("/api/admin/stats", authenticateAdmin, async (req, res) => {
    try {
      // Get all necessary data for statistics
      const users = await storage.getAllUsers();
      const contents = await storage.getAllContents();
      const categories = await storage.getAllCategories();
      
      // Calculate stats
      const totalUsers = users.length;
      const premiumUsers = users.filter(user => user.isPremium).length;
      const totalContent = contents.length;
      const premiumContent = contents.filter(content => content.isPremium).length;
      const totalCategories = categories.length;
      
      // Return all statistics
      res.json({
        users: {
          total: totalUsers,
          premium: premiumUsers,
          free: totalUsers - premiumUsers,
          premiumPercentage: totalUsers > 0 ? Math.round((premiumUsers / totalUsers) * 100) : 0
        },
        content: {
          total: totalContent,
          premium: premiumContent,
          free: totalContent - premiumContent,
          premiumPercentage: totalContent > 0 ? Math.round((premiumContent / totalContent) * 100) : 0
        },
        categories: {
          total: totalCategories
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Caption Routes
  app.get("/api/captions/:contentId", async (req, res) => {
    try {
      const contentId = parseInt(req.params.contentId);
      if (isNaN(contentId)) {
        return res.status(400).json({ message: "Invalid content ID" });
      }
      
      const captionList = await storage.getCaptions(contentId);
      res.json(captionList);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/captions/detail/:id", async (req, res) => {
    try {
      const captionId = parseInt(req.params.id);
      if (isNaN(captionId)) {
        return res.status(400).json({ message: "Invalid caption ID" });
      }
      
      const caption = await storage.getCaption(captionId);
      if (!caption) {
        return res.status(404).json({ message: "Caption not found" });
      }
      
      res.json(caption);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Admin Caption Routes
  app.post("/api/admin/captions", authenticateAdmin, async (req, res) => {
    try {
      const validatedData = insertCaptionSchema.parse(req.body);
      
      // Check if content exists
      const content = await storage.getContent(validatedData.contentId);
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      // If isDefault is true, set all other captions for this content to false
      if (validatedData.isDefault) {
        const existingCaptions = await storage.getCaptions(validatedData.contentId);
        for (const caption of existingCaptions) {
          if (caption.isDefault) {
            await storage.updateCaption(caption.id, { isDefault: false });
          }
        }
      }
      
      const caption = await storage.createCaption(validatedData);
      res.status(201).json(caption);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/admin/captions/:id", authenticateAdmin, async (req, res) => {
    try {
      const captionId = parseInt(req.params.id);
      if (isNaN(captionId)) {
        return res.status(400).json({ message: "Invalid caption ID" });
      }
      
      // Check if caption exists
      const existingCaption = await storage.getCaption(captionId);
      if (!existingCaption) {
        return res.status(404).json({ message: "Caption not found" });
      }
      
      // Validate update data
      const updateData = req.body;
      
      // If setting this caption as default, set all other captions for this content to false
      if (updateData.isDefault) {
        const existingCaptions = await storage.getCaptions(existingCaption.contentId);
        for (const caption of existingCaptions) {
          if (caption.id !== captionId && caption.isDefault) {
            await storage.updateCaption(caption.id, { isDefault: false });
          }
        }
      }
      
      const updatedCaption = await storage.updateCaption(captionId, updateData);
      res.json(updatedCaption);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/admin/captions/:id", authenticateAdmin, async (req, res) => {
    try {
      const captionId = parseInt(req.params.id);
      if (isNaN(captionId)) {
        return res.status(400).json({ message: "Invalid caption ID" });
      }
      
      // Check if caption exists
      const existingCaption = await storage.getCaption(captionId);
      if (!existingCaption) {
        return res.status(404).json({ message: "Caption not found" });
      }
      
      await storage.deleteCaption(captionId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Vimeo API Routes
  app.get("/api/vimeo/auth-check", authenticateAdmin, async (req, res) => {
    try {
      const result = await VimeoService.checkAuthentication();
      res.json(result);
    } catch (error) {
      console.error("Vimeo auth check error:", error);
      res.status(500).json({ message: "Failed to check Vimeo authentication", error: String(error) });
    }
  });

  app.get("/api/vimeo/videos", authenticateAdmin, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.perPage as string) || 25;
      
      const result = await VimeoService.getAllVideos(page, perPage);
      res.json(result);
    } catch (error) {
      console.error("Failed to fetch Vimeo videos:", error);
      res.status(500).json({ message: "Failed to fetch Vimeo videos", error: String(error) });
    }
  });

  app.get("/api/vimeo/videos/:id", async (req, res) => {
    try {
      const videoId = req.params.id;
      const result = await VimeoService.getVideoDetails(videoId);
      res.json(result);
    } catch (error) {
      console.error("Failed to fetch Vimeo video details:", error);
      res.status(500).json({ message: "Failed to fetch Vimeo video details", error: String(error) });
    }
  });
  


  app.post("/api/vimeo/videos", authenticateAdmin, async (req, res) => {
    try {
      const { fileUrl, name, description, privacy } = req.body;
      
      if (!fileUrl || !name) {
        return res.status(400).json({ message: "File URL and name are required" });
      }
      
      const videoId = await VimeoService.uploadVideo(fileUrl, {
        name,
        description,
        privacy
      });
      
      res.status(201).json({ videoId, message: "Video upload initiated" });
    } catch (error) {
      console.error("Failed to upload video to Vimeo:", error);
      res.status(500).json({ message: "Failed to upload video to Vimeo", error: String(error) });
    }
  });

  app.delete("/api/vimeo/videos/:id", authenticateAdmin, async (req, res) => {
    try {
      const videoId = req.params.id;
      await VimeoService.deleteVideo(videoId);
      res.status(204).send();
    } catch (error) {
      console.error("Failed to delete Vimeo video:", error);
      res.status(500).json({ message: "Failed to delete Vimeo video", error: String(error) });
    }
  });

  app.get("/api/vimeo/videos/:id/captions", async (req, res) => {
    try {
      const videoId = req.params.id;
      const captions = await VimeoService.getVideoCaptions(videoId);
      res.json(captions);
    } catch (error) {
      console.error("Failed to fetch Vimeo video captions:", error);
      res.status(500).json({ message: "Failed to fetch Vimeo video captions", error: String(error) });
    }
  });
  
  // Update caption properties (e.g., set as active/default)
  app.put("/api/vimeo/videos/:videoId/captions/:captionId", authenticateAdmin, async (req, res) => {
    try {
      const { videoId, captionId } = req.params;
      const { active } = req.body;
      
      if (active === undefined) {
        return res.status(400).json({ message: "Active status is required" });
      }
      
      await VimeoService.updateVideoCaption(videoId, captionId, active);
      res.json({ message: "Caption updated successfully" });
    } catch (error) {
      console.error("Failed to update Vimeo video caption:", error);
      res.status(500).json({ message: "Failed to update Vimeo video caption", error: String(error) });
    }
  });
  
  // Delete a caption track
  app.delete("/api/vimeo/videos/:videoId/captions/:captionId", authenticateAdmin, async (req, res) => {
    try {
      const { videoId, captionId } = req.params;
      await VimeoService.deleteVideoCaption(videoId, captionId);
      res.json({ message: "Caption deleted successfully" });
    } catch (error) {
      console.error("Failed to delete Vimeo video caption:", error);
      res.status(500).json({ message: "Failed to delete Vimeo video caption", error: String(error) });
    }
  });

  app.post("/api/vimeo/videos/:id/captions", authenticateAdmin, async (req, res) => {
    try {
      const videoId = req.params.id;
      const { language, name, fileUrl, type } = req.body;
      
      if (!language || !name || !fileUrl) {
        return res.status(400).json({ message: "Language, name, and file URL are required" });
      }
      
      const captionUri = await VimeoService.addVideoCaption(
        videoId,
        language,
        name,
        fileUrl,
        type
      );
      
      res.status(201).json({ uri: captionUri, message: "Caption added successfully" });
    } catch (error) {
      console.error("Failed to add caption to Vimeo video:", error);
      res.status(500).json({ message: "Failed to add caption to Vimeo video", error: String(error) });
    }
  });

  // Import videos from Vimeo to our content database
  app.post("/api/vimeo/import/:videoId", authenticateAdmin, async (req, res) => {
    try {
      const videoId = req.params.videoId;
      const { categoryId, isPremium } = req.body;
      
      if (!categoryId) {
        return res.status(400).json({ message: "Category ID is required" });
      }
      
      // Get video details from Vimeo
      const videoDetails = await VimeoService.getVideoDetails(videoId);
      
      // Convert to our content format
      const contentData = VimeoService.convertToContentItem(videoDetails, categoryId, isPremium);
      
      // Save to our database using the content insert schema
      const validatedData = insertContentSchema.parse(contentData);
      const content = await storage.createContent(validatedData);
      
      // Import captions/subtitles if available
      try {
        const captions = await VimeoService.getVideoCaptions(videoId);
        if (captions && captions.length > 0) {
          console.log(`Importing ${captions.length} captions for video ${videoId}`);
          
          // Process each caption track
          for (const caption of captions) {
            // Create caption entry in our database
            const captionData = {
              contentId: content.id,
              language: caption.language,
              label: caption.name,
              fileUrl: caption.link,
              isDefault: caption.active
            };
            
            const validatedCaptionData = insertCaptionSchema.parse(captionData);
            await storage.createCaption(validatedCaptionData);
          }
        }
      } catch (captionError) {
        console.error(`Failed to import captions for video ${videoId}:`, captionError);
        // We don't want to fail the entire video import if captions fail
      }
      
      res.status(201).json({ 
        content, 
        message: "Video imported successfully",
        captionsImported: true
      });
    } catch (error) {
      console.error("Failed to import Vimeo video to content:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data format", errors: error.errors });
      }
      
      res.status(500).json({ message: "Failed to import Vimeo video", error: String(error) });
    }
  });

  // PayFast Routes
  app.post("/api/subscription/create", authenticate, async (req, res) => {
    try {
      const user = (req as AuthRequest).user;
      const { plan } = req.body;
      
      if (!plan) {
        return res.status(400).json({ message: "Plan is required" });
      }
      
      // Generate a unique payment ID with a consistent format for better tracking
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
      const paymentId = `MADIFA-${user.id}-${timestamp}`;
      
      // Get subscription amount based on plan
      let amount = SUBSCRIPTION_AMOUNT; // Default R59
      
      if (plan === 'annual') {
        // Apply discount for annual subscription (e.g., 10 months price for 12 months)
        amount = amount * 10;
      }
      
      // Create payment data for PayFast
      const paymentData = payfast.createPaymentData({
        amount,
        item_name: `Madifa ${plan === 'annual' ? 'Annual' : 'Monthly'} Premium Subscription`,
        name_first: user.name || user.username,
        email_address: user.email,
        m_payment_id: paymentId,
        
        // Store user ID and subscription details in custom fields
        custom_str1: user.id.toString(),
        custom_str2: plan,
        
        // Return URLs
        return_url: `${req.protocol}://${req.get('host')}/subscription/success`,
        cancel_url: `${req.protocol}://${req.get('host')}/subscription/cancel`,
        notify_url: `${req.protocol}://${req.get('host')}/api/subscription/notify`,
        
        // Subscription specific fields for recurring billing
        ...(plan === 'monthly' ? {
          subscription_type: "1", // Recurring billing
          frequency: 3, // Monthly (3 = monthly, 4 = quarterly, 5 = biannual, 6 = annual)
          cycles: 0 // Until canceled
        } : {})
      });
      
      // Get the payment URL
      const paymentUrl = payfast.getPaymentUrl(paymentData);
      
      // Create a pending subscription record
      await storage.createSubscription({
        userId: user.id,
        planId: plan, // plan is "monthly" or "annual"
        planType: plan,
        amount,
        paymentId,
        startDate: new Date(),
        status: 'pending'
      });
      
      res.json({
        paymentUrl,
        paymentId
      });
    } catch (error) {
      console.error("Subscription creation error:", error);
      res.status(500).json({ message: "Failed to create subscription", error: String(error) });
    }
  });

  app.post("/api/subscription/notify", async (req, res) => {
    try {
      // PayFast sends a POST to this notify URL
      const notification = req.body;
      
      // Log notification data (for debugging purposes)
      console.log("PayFast notification received:", JSON.stringify({
        payment_status: notification.payment_status,
        m_payment_id: notification.m_payment_id,
        pf_payment_id: notification.pf_payment_id,
        custom_str1: notification.custom_str1,
        custom_str2: notification.custom_str2,
        amount_gross: notification.amount_gross,
      }));
      
      // Verify the notification signature and IP
      const isValid = await payfast.verifyPayFastNotification(notification, req.ip || '');
      
      if (!isValid) {
        console.error("Invalid PayFast notification - signature or IP validation failed");
        return res.status(400).send("Invalid notification");
      }
      
      // Extract info
      const paymentId = notification.m_payment_id;
      const pfPaymentId = notification.pf_payment_id;
      const status = notification.payment_status;
      const userId = parseInt(notification.custom_str1);
      const plan = notification.custom_str2;
      
      if (!userId || isNaN(userId)) {
        console.error("Invalid user ID in notification:", notification.custom_str1);
        return res.status(400).send("Invalid user ID");
      }
      
      // Find the subscription by user ID
      const subscription = await storage.getSubscription(userId);
      
      if (!subscription) {
        console.error("Subscription not found for user ID:", userId);
        return res.status(404).send("Subscription not found");
      }
      
      // Update subscription status
      let endDate = null;
      let newStatus = subscription.status; // Default to current status
      
      // Handle different payment statuses from PayFast
      switch (status) {
        case 'COMPLETE':
          // Calculate end date based on plan
          const now = new Date();
          endDate = new Date();
          
          if (plan === 'monthly') {
            endDate.setMonth(now.getMonth() + 1);
          } else if (plan === 'annual') {
            endDate.setFullYear(now.getFullYear() + 1);
          }
          
          newStatus = 'active';
          
          // Update subscription details
          await storage.updateSubscription(
            subscription.id, 
            newStatus, 
            endDate,
            pfPaymentId // Save PayFast payment reference
          );
          
          // Update user's premium status
          await storage.updateUserSubscription(userId, true);
          
          console.log(`Subscription activated for user ${userId} until ${endDate.toISOString()}`);
          break;
          
        case 'FAILED':
        case 'CANCELLED':
          newStatus = status.toLowerCase();
          await storage.updateSubscription(subscription.id, newStatus);
          console.log(`Subscription status updated to ${newStatus} for user ${userId}`);
          break;
          
        case 'PENDING':
          // Update with the PayFast payment reference for better tracking
          await storage.updateSubscription(
            subscription.id, 
            'pending', 
            undefined, // Use undefined instead of null for Date type parameter
            pfPaymentId // Save PayFast payment reference
          );
          console.log(`Payment still pending for user ${userId}, updated with PayFast reference: ${pfPaymentId}`);
          break;
          
        default:
          console.log(`Unhandled payment status: ${status} for user ${userId}`);
      }
      
      // Always acknowledge the notification
      res.status(200).send("OK");
    } catch (error) {
      console.error("PayFast notification error:", error);
      res.status(500).send("Error processing notification");
    }
  });

  app.get("/api/subscription/status", authenticate, async (req, res) => {
    try {
      const user = (req as AuthRequest).user;
      
      // Get current subscription
      const subscription = await storage.getSubscription(user.id);
      
      // Check subscription status
      if (!subscription) {
        return res.json({ status: 'none' });
      }
      
      // Check if subscription is active and not expired
      const isActive = subscription.status === 'active' && 
                      subscription.endDate && 
                      new Date(subscription.endDate) > new Date();
      
      // If subscription is expired but still marked as active, update it
      if (subscription.status === 'active' && 
          subscription.endDate && 
          new Date(subscription.endDate) <= new Date()) {
        
        await storage.updateSubscription(subscription.id, 'expired');
        await storage.updateUserSubscription(user.id, false);
        
        return res.json({
          status: 'expired',
          subscription
        });
      }
      
      res.json({
        status: subscription.status,
        isActive,
        subscription
      });
    } catch (error) {
      console.error("Get subscription status error:", error);
      res.status(500).json({ message: "Failed to get subscription status", error: String(error) });
    }
  });

  // ========== SOCIAL FEATURES ROUTES ==========

  // Rating routes
  
  // Get ratings for a content
  app.get("/api/ratings/:contentId", async (req: Request, res: Response) => {
    try {
      const contentId = parseInt(req.params.contentId);
      if (isNaN(contentId)) {
        return res.status(400).json({ message: "Invalid content ID" });
      }
      
      const ratings = await storage.getRatings(contentId);
      res.json(ratings);
    } catch (error) {
      console.error("Get ratings error:", error);
      res.status(500).json({ message: "Failed to get ratings", error: String(error) });
    }
  });
  
  // Get average rating for a content
  app.get("/api/ratings/:contentId/average", async (req: Request, res: Response) => {
    try {
      const contentId = parseInt(req.params.contentId);
      if (isNaN(contentId)) {
        return res.status(400).json({ message: "Invalid content ID" });
      }
      
      const avgRating = await storage.getAverageRating(contentId);
      res.json({ average: avgRating });
    } catch (error) {
      console.error("Get average rating error:", error);
      res.status(500).json({ message: "Failed to get average rating", error: String(error) });
    }
  });
  
  // Get user's rating for a content
  app.get("/api/ratings/:contentId/user", authenticate, async (req: Request, res: Response) => {
    try {
      const contentId = parseInt(req.params.contentId);
      if (isNaN(contentId)) {
        return res.status(400).json({ message: "Invalid content ID" });
      }
      
      const userId = (req as AuthRequest).user.id;
      const rating = await storage.getUserRating(userId, contentId);
      
      if (!rating) {
        return res.status(404).json({ message: "Rating not found" });
      }
      
      res.json(rating);
    } catch (error) {
      console.error("Get user rating error:", error);
      res.status(500).json({ message: "Failed to get user rating", error: String(error) });
    }
  });
  
  // Create or update a rating
  app.post("/api/ratings", authenticate, async (req: Request, res: Response) => {
    try {
      const { contentId, rating } = req.body;
      
      // Validate input
      if (!contentId || !rating || isNaN(contentId) || isNaN(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Invalid rating data. Content ID and rating (1-5) are required." });
      }
      
      const userId = (req as AuthRequest).user.id;
      
      // Check if content exists
      const content = await storage.getContent(contentId);
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      const newRating = await storage.createRating({
        userId,
        contentId,
        rating
      });
      
      res.status(201).json(newRating);
    } catch (error) {
      console.error("Create rating error:", error);
      res.status(500).json({ message: "Failed to create rating", error: String(error) });
    }
  });
  
  // Delete a rating
  app.delete("/api/ratings/:ratingId", authenticate, async (req: Request, res: Response) => {
    try {
      const ratingId = parseInt(req.params.ratingId);
      if (isNaN(ratingId)) {
        return res.status(400).json({ message: "Invalid rating ID" });
      }
      
      const userId = (req as AuthRequest).user.id;
      const rating = await storage.getRating(ratingId);
      
      if (!rating) {
        return res.status(404).json({ message: "Rating not found" });
      }
      
      // Check if the rating belongs to the user or if user is admin
      if (rating.userId !== userId && !(req as AuthRequest).user.isAdmin) {
        return res.status(403).json({ message: "Not authorized to delete this rating" });
      }
      
      await storage.deleteRating(ratingId);
      res.status(204).end();
    } catch (error) {
      console.error("Delete rating error:", error);
      res.status(500).json({ message: "Failed to delete rating", error: String(error) });
    }
  });
  
  // Review routes
  
  // Get reviews for a content
  app.get("/api/reviews/:contentId", async (req: Request, res: Response) => {
    try {
      const contentId = parseInt(req.params.contentId);
      if (isNaN(contentId)) {
        return res.status(400).json({ message: "Invalid content ID" });
      }
      
      const reviews = await storage.getReviews(contentId);
      res.json(reviews);
    } catch (error) {
      console.error("Get reviews error:", error);
      res.status(500).json({ message: "Failed to get reviews", error: String(error) });
    }
  });
  
  // Get a specific review
  app.get("/api/reviews/single/:reviewId", async (req: Request, res: Response) => {
    try {
      const reviewId = parseInt(req.params.reviewId);
      if (isNaN(reviewId)) {
        return res.status(400).json({ message: "Invalid review ID" });
      }
      
      const review = await storage.getReview(reviewId);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      
      // Get the user information for the review
      const user = await storage.getUser(review.userId);
      if (!user) {
        return res.status(404).json({ message: "Review user not found" });
      }
      
      const result = { ...review, user };
      res.json(result);
    } catch (error) {
      console.error("Get review error:", error);
      res.status(500).json({ message: "Failed to get review", error: String(error) });
    }
  });
  
  // Get user's review for a content
  app.get("/api/reviews/:contentId/user", authenticate, async (req: Request, res: Response) => {
    try {
      const contentId = parseInt(req.params.contentId);
      if (isNaN(contentId)) {
        return res.status(400).json({ message: "Invalid content ID" });
      }
      
      const userId = (req as AuthRequest).user.id;
      const review = await storage.getUserReview(userId, contentId);
      
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      
      res.json(review);
    } catch (error) {
      console.error("Get user review error:", error);
      res.status(500).json({ message: "Failed to get user review", error: String(error) });
    }
  });
  
  // Create or update a review
  app.post("/api/reviews", authenticate, async (req: Request, res: Response) => {
    try {
      const { contentId, title, content, isVisible } = req.body;
      
      // Validate input
      if (!contentId || !title || !content || isNaN(contentId)) {
        return res.status(400).json({ 
          message: "Invalid review data. Content ID, title, and content are required." 
        });
      }
      
      const userId = (req as AuthRequest).user.id;
      
      // Check if content exists
      const contentItem = await storage.getContent(contentId);
      if (!contentItem) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      const newReview = await storage.createReview({
        userId,
        contentId,
        title,
        content,
        isVisible
      });
      
      res.status(201).json(newReview);
    } catch (error) {
      console.error("Create review error:", error);
      res.status(500).json({ message: "Failed to create review", error: String(error) });
    }
  });
  
  // Update a review
  app.put("/api/reviews/:reviewId", authenticate, async (req: Request, res: Response) => {
    try {
      const reviewId = parseInt(req.params.reviewId);
      if (isNaN(reviewId)) {
        return res.status(400).json({ message: "Invalid review ID" });
      }
      
      const userId = (req as AuthRequest).user.id;
      const review = await storage.getReview(reviewId);
      
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      
      // Check if the review belongs to the user or if user is admin
      if (review.userId !== userId && !(req as AuthRequest).user.isAdmin) {
        return res.status(403).json({ message: "Not authorized to update this review" });
      }
      
      const { title, content, isVisible } = req.body;
      const updatedReview = await storage.updateReview(reviewId, { 
        title, 
        content, 
        isVisible,
        updatedAt: new Date()
      });
      
      res.json(updatedReview);
    } catch (error) {
      console.error("Update review error:", error);
      res.status(500).json({ message: "Failed to update review", error: String(error) });
    }
  });
  
  // Delete a review
  app.delete("/api/reviews/:reviewId", authenticate, async (req: Request, res: Response) => {
    try {
      const reviewId = parseInt(req.params.reviewId);
      if (isNaN(reviewId)) {
        return res.status(400).json({ message: "Invalid review ID" });
      }
      
      const userId = (req as AuthRequest).user.id;
      const review = await storage.getReview(reviewId);
      
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      
      // Check if the review belongs to the user or if user is admin
      if (review.userId !== userId && !(req as AuthRequest).user.isAdmin) {
        return res.status(403).json({ message: "Not authorized to delete this review" });
      }
      
      await storage.deleteReview(reviewId);
      res.status(204).end();
    } catch (error) {
      console.error("Delete review error:", error);
      res.status(500).json({ message: "Failed to delete review", error: String(error) });
    }
  });
  
  // Social Share routes
  
  // Get social shares for a content
  app.get("/api/social-shares/:contentId", async (req: Request, res: Response) => {
    try {
      const contentId = parseInt(req.params.contentId);
      if (isNaN(contentId)) {
        return res.status(400).json({ message: "Invalid content ID" });
      }
      
      const shares = await storage.getSocialShares(contentId);
      res.json(shares);
    } catch (error) {
      console.error("Get social shares error:", error);
      res.status(500).json({ message: "Failed to get social shares", error: String(error) });
    }
  });
  
  // Get user's social shares
  app.get("/api/social-shares/user", authenticate, async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthRequest).user.id;
      const shares = await storage.getUserSocialShares(userId);
      res.json(shares);
    } catch (error) {
      console.error("Get user social shares error:", error);
      res.status(500).json({ message: "Failed to get user social shares", error: String(error) });
    }
  });
  
  // Create a social share
  app.post("/api/social-shares", authenticate, async (req: Request, res: Response) => {
    try {
      const { contentId, platform } = req.body;
      
      // Validate input
      if (!contentId || !platform || isNaN(contentId)) {
        return res.status(400).json({ 
          message: "Invalid social share data. Content ID and platform are required." 
        });
      }
      
      const userId = (req as AuthRequest).user.id;
      
      // Check if content exists
      const content = await storage.getContent(contentId);
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      const newShare = await storage.createSocialShare({
        userId,
        contentId,
        platform
      });
      
      res.status(201).json(newShare);
    } catch (error) {
      console.error("Create social share error:", error);
      res.status(500).json({ message: "Failed to create social share", error: String(error) });
    }
  });
  
  // Delete a social share
  app.delete("/api/social-shares/:shareId", authenticate, async (req: Request, res: Response) => {
    try {
      const shareId = parseInt(req.params.shareId);
      if (isNaN(shareId)) {
        return res.status(400).json({ message: "Invalid share ID" });
      }
      
      await storage.deleteSocialShare(shareId);
      res.status(204).end();
    } catch (error) {
      console.error("Delete social share error:", error);
      res.status(500).json({ message: "Failed to delete social share", error: String(error) });
    }
  });

  return httpServer;
}
