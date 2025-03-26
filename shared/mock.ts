import { ContentItem, CategoryItem, ContentSection } from "./types";
import { 
  MOCK_CONTENTS, 
  MOCK_CATEGORIES, 
  MOCK_WATCH_HISTORY, 
  MOCK_WATCHLIST 
} from "../client/src/lib/constants";

// Preloaded mock data
export const mockData = {
  // Featured content for hero section
  featured: MOCK_CONTENTS.find(content => content.id === 1) || MOCK_CONTENTS[0],
  
  // Content sections for homepage
  contentSections: [
    {
      title: "Continue Watching",
      viewAllLink: "/browse",
      items: MOCK_CONTENTS.slice(0, 4).map(content => ({
        ...content,
        progress: Math.floor(Math.random() * content.duration!),
      })),
    },
    {
      title: "Trending in South Africa",
      viewAllLink: "/browse?sort=trending",
      items: MOCK_CONTENTS.slice(4, 9),
    },
    {
      title: "Premium Content",
      viewAllLink: "/browse?filter=premium",
      items: MOCK_CONTENTS.filter(item => item.isPremium).slice(0, 5),
    },
    {
      title: "Free to Watch",
      viewAllLink: "/browse?filter=free",
      items: MOCK_CONTENTS.filter(item => !item.isPremium).slice(0, 5),
    }
  ] as ContentSection[],
  
  // All available categories
  categories: MOCK_CATEGORIES,
  
  // All available content
  allContent: MOCK_CONTENTS,
  
  // User watch history and watchlist (for logged in users)
  userWatchHistory: MOCK_WATCH_HISTORY,
  userWatchlist: MOCK_WATCHLIST,
  
  // Function to get watch history for a user
  getWatchHistory: (userId: number): ContentItem[] => {
    const history = MOCK_WATCH_HISTORY.filter(item => item.userId === userId);
    return history.map(item => {
      const content = MOCK_CONTENTS.find(c => c.id === item.contentId);
      if (!content) return {} as ContentItem;
      return {
        ...content,
        progress: item.progress
      };
    });
  },
  
  // Function to get watchlist for a user
  getWatchlist: (userId: number): ContentItem[] => {
    const list = MOCK_WATCHLIST.filter(item => item.userId === userId);
    return list.map(item => {
      const content = MOCK_CONTENTS.find(c => c.id === item.contentId);
      return content || ({} as ContentItem);
    });
  },
  
  // Function to get content by ID
  getContentById: (id: number): ContentItem | undefined => {
    return MOCK_CONTENTS.find(content => content.id === id);
  },
  
  // Function to get related content (same category or premium status)
  getRelatedContent: (contentId: number): ContentItem[] => {
    const content = MOCK_CONTENTS.find(c => c.id === contentId);
    if (!content) return [];
    
    return MOCK_CONTENTS
      .filter(item => 
        item.id !== contentId && (
          item.categoryId === content.categoryId || 
          item.isPremium === content.isPremium
        )
      )
      .slice(0, 6);
  },
  
  // Function to get premium contents
  getPremiumContent: (): ContentItem[] => {
    return MOCK_CONTENTS.filter(content => content.isPremium);
  },
  
  // Function to get free contents
  getFreeContent: (): ContentItem[] => {
    return MOCK_CONTENTS.filter(content => !content.isPremium);
  }
};
