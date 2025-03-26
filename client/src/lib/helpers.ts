import { ContentItem, CategoryItem } from "@shared/types";
import { MOCK_CONTENTS, MOCK_CATEGORIES, MOCK_WATCH_HISTORY, MOCK_WATCHLIST } from "./constants";

// Helper functions for mock data

export const getMockContent = (contentId: number): ContentItem | undefined => {
  return MOCK_CONTENTS.find(content => content.id === contentId);
};

export const getMockContents = (): ContentItem[] => {
  return MOCK_CONTENTS;
};

export const getMockContentsByCategory = (categoryId: number): ContentItem[] => {
  return MOCK_CONTENTS.filter(content => content.categoryId === categoryId);
};

export const getMockPremiumContents = (): ContentItem[] => {
  return MOCK_CONTENTS.filter(content => content.isPremium);
};

export const getMockFreeContents = (): ContentItem[] => {
  return MOCK_CONTENTS.filter(content => !content.isPremium);
};

export const getMockCategory = (categoryId: number): CategoryItem | undefined => {
  return MOCK_CATEGORIES.find(category => category.id === categoryId);
};

export const getMockCategories = (): CategoryItem[] => {
  return MOCK_CATEGORIES;
};

export const getMockWatchHistory = (userId: number): ContentItem[] => {
  const userHistory = MOCK_WATCH_HISTORY.filter(item => item.userId === userId);
  
  return userHistory.map(item => {
    const content = getMockContent(item.contentId);
    return {
      ...content!,
      progress: item.progress
    };
  });
};

export const getMockWatchlist = (userId: number): ContentItem[] => {
  const userWatchlist = MOCK_WATCHLIST.filter(item => item.userId === userId);
  
  return userWatchlist.map(item => {
    const content = getMockContent(item.contentId);
    return content!;
  });
};

// Helper functions for content organization

export const getRelatedContent = (contentItem: ContentItem, allContent: ContentItem[]): ContentItem[] => {
  if (!contentItem) return [];
  
  return allContent
    .filter(item => 
      item.id !== contentItem.id && 
      (item.categoryId === contentItem.categoryId || item.isPremium === contentItem.isPremium)
    )
    .slice(0, 6);
};

export const groupContentByCategory = (contents: ContentItem[], categories: CategoryItem[]) => {
  const groupedContent: { [categoryId: number]: ContentItem[] } = {};
  
  categories.forEach(category => {
    groupedContent[category.id] = contents.filter(content => content.categoryId === category.id);
  });
  
  return groupedContent;
};

// Get random element from array
export const getRandomElement = <T>(array: T[]): T => {
  if (!array || array.length === 0) return null as unknown as T;
  return array[Math.floor(Math.random() * array.length)];
};

// Safely handle Adsense insertion
export const insertAdsByGoogle = () => {
  if (typeof window !== 'undefined') {
    try {
      // Type declaration for window.adsbygoogle
      interface Window {
        adsbygoogle: any[];
      }
      
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (error) {
      console.error('Ad loading error:', error);
    }
  }
};
