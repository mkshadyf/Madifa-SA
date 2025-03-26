import { Plan } from "@shared/types";

// App constants
export const APP_NAME = "Madifa";
export const APP_DESCRIPTION = "South African Original Content Platform";

// Subscription plans
export const SUBSCRIPTION_PLANS: Plan[] = [
  {
    id: "premium",
    name: "Premium",
    price: 59,
    currency: "R",
    features: [
      "Ad-free viewing",
      "Access to all movies and series",
      "HD and 4K quality where available",
      "Watch on all your devices",
      "Download content for offline viewing"
    ]
  }
];

// Mock data source constants
export const MOCK_CATEGORIES = [
  { id: 1, name: "Drama", description: "Emotionally-driven narrative works", thumbnailUrl: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" },
  { id: 2, name: "Comedy", description: "Light-hearted and humorous content", thumbnailUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" },
  { id: 3, name: "Action", description: "Fast-paced and thrilling adventures", thumbnailUrl: "https://images.unsplash.com/photo-1613331455414-1e9c5099458f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" },
  { id: 4, name: "Documentary", description: "Educational and informative content", thumbnailUrl: "https://images.unsplash.com/photo-1575599550825-6a7a7a0c1c0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" },
  { id: 5, name: "Thriller", description: "Suspenseful and exciting narrative", thumbnailUrl: "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" },
  { id: 6, name: "Local Stories", description: "South African stories and culture", thumbnailUrl: "https://images.unsplash.com/photo-1559108318-39ed452bb6c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" }
];

export const MOCK_CONTENTS = [
  {
    id: 1,
    title: "Umzansi Chronicles",
    description: "A gripping tale of resilience and cultural pride in post-apartheid South Africa, following the journey of a young artist navigating tradition and modernity.",
    thumbnailUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
    videoUrl: "https://www.dailymotion.com/video/x8b36tl",
    trailerUrl: "https://www.dailymotion.com/video/x8b36tl",
    releaseYear: 2023,
    duration: 7500, // 2h 5m in seconds
    isPremium: true,
    rating: "16+",
    categoryId: 1
  },
  {
    id: 2,
    title: "Soweto Blues",
    description: "A musical journey through the vibrant streets of Soweto, exploring the rich history of jazz and its role in the fight against apartheid.",
    thumbnailUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    videoUrl: "https://www.dailymotion.com/video/x8mh8w6",
    trailerUrl: "https://www.dailymotion.com/video/x8mh8w6",
    releaseYear: 2022,
    duration: 6300, // 1h 45m in seconds
    isPremium: true,
    rating: "13+",
    categoryId: 1
  },
  {
    id: 3,
    title: "Cape Town Nights",
    description: "A thrilling crime drama set in the bustling streets of Cape Town, following a detective trying to solve a series of mysterious disappearances.",
    thumbnailUrl: "https://images.unsplash.com/photo-1550184658-ff6132a71714?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    videoUrl: "https://www.dailymotion.com/video/x8j5rf2",
    trailerUrl: "https://www.dailymotion.com/video/x8j5rf2",
    releaseYear: 2023,
    duration: 6900, // 1h 55m in seconds
    isPremium: true,
    rating: "18+",
    categoryId: 5
  },
  {
    id: 4,
    title: "Joburg Stories",
    description: "An anthology series exploring the diverse lives and interconnected stories of people living in Johannesburg, South Africa's largest city.",
    thumbnailUrl: "https://images.unsplash.com/photo-1559108318-39ed452bb6c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    videoUrl: "https://www.dailymotion.com/video/x8jtw86",
    trailerUrl: "https://www.dailymotion.com/video/x8jtw86",
    releaseYear: 2022,
    duration: 5400, // 1h 30m in seconds
    isPremium: true,
    rating: "16+",
    categoryId: 6
  },
  {
    id: 5,
    title: "Durban Heat",
    description: "A summer romance set against the backdrop of Durban's golden beaches, following two young lovers from different backgrounds.",
    thumbnailUrl: "https://images.unsplash.com/photo-1518487684529-eb34ed2aa3bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    videoUrl: "https://www.dailymotion.com/video/x8lzpq5",
    trailerUrl: "https://www.dailymotion.com/video/x8lzpq5",
    releaseYear: 2023,
    duration: 6600, // 1h 50m in seconds
    isPremium: true,
    rating: "13+",
    categoryId: 1
  },
  {
    id: 6,
    title: "Township Tales",
    description: "A heartwarming coming-of-age story about a group of friends growing up in a township outside of Port Elizabeth.",
    thumbnailUrl: "https://images.unsplash.com/photo-1484318571209-661cf29a69c3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    videoUrl: "https://www.dailymotion.com/video/x8hfps1",
    trailerUrl: "https://www.dailymotion.com/video/x8hfps1",
    releaseYear: 2022,
    duration: 5700, // 1h 35m in seconds
    isPremium: false,
    rating: "PG",
    categoryId: 6
  },
  {
    id: 7,
    title: "Safari Stories",
    description: "A documentary series exploring the incredible wildlife of South Africa's national parks and the conservation efforts to protect them.",
    thumbnailUrl: "https://images.unsplash.com/photo-1447069387593-a5de0862481e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    videoUrl: "https://www.dailymotion.com/video/x8js98e",
    trailerUrl: "https://www.dailymotion.com/video/x8js98e",
    releaseYear: 2023,
    duration: 5100, // 1h 25m in seconds
    isPremium: false,
    rating: "G",
    categoryId: 4
  },
  {
    id: 8,
    title: "Voices of Freedom",
    description: "A powerful documentary featuring interviews with anti-apartheid activists and their stories of struggle and triumph.",
    thumbnailUrl: "https://images.unsplash.com/photo-1521729839347-131a32f9abcb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    videoUrl: "https://www.dailymotion.com/video/x8l2hpb",
    trailerUrl: "https://www.dailymotion.com/video/x8l2hpb",
    releaseYear: 2021,
    duration: 6000, // 1h 40m in seconds
    isPremium: false,
    rating: "13+",
    categoryId: 4
  },
  {
    id: 9,
    title: "Drums of Africa",
    description: "A musical celebration of traditional African drumming and its influence on modern South African music.",
    thumbnailUrl: "https://images.unsplash.com/photo-1580707221190-bd94d9087b7f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    videoUrl: "https://www.dailymotion.com/video/x8k87c2",
    trailerUrl: "https://www.dailymotion.com/video/x8k87c2",
    releaseYear: 2022,
    duration: 5400, // 1h 30m in seconds
    isPremium: false,
    rating: "G",
    categoryId: 4
  },
  {
    id: 10,
    title: "Rainbow Nation",
    description: "A heartfelt drama about reconciliation and healing in the early days of South Africa's democracy.",
    thumbnailUrl: "https://images.unsplash.com/photo-1508002366005-75a695ee2d17?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    videoUrl: "https://www.dailymotion.com/video/x8kz5tp",
    trailerUrl: "https://www.dailymotion.com/video/x8kz5tp",
    releaseYear: 2023,
    duration: 8100, // 2h 15m in seconds
    isPremium: true,
    rating: "PG-13",
    categoryId: 1
  },
  {
    id: 11,
    title: "Kalahari Dreams",
    description: "An adventure film following a family's journey across the Kalahari Desert in search of their ancestral homeland.",
    thumbnailUrl: "https://images.unsplash.com/photo-1533062618053-d51e617307ec?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    videoUrl: "https://www.dailymotion.com/video/x8l9bt6",
    trailerUrl: "https://www.dailymotion.com/video/x8l9bt6",
    releaseYear: 2023,
    duration: 6900, // 1h 55m in seconds
    isPremium: true,
    rating: "PG",
    categoryId: 3
  },
  {
    id: 12,
    title: "Shebeen Queens",
    description: "A hilarious comedy about three women who run competing shebeens in a small township and their unlikely friendship.",
    thumbnailUrl: "https://images.unsplash.com/photo-1622219809260-ce065fc5277e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    videoUrl: "https://www.dailymotion.com/video/x8jg86f",
    trailerUrl: "https://www.dailymotion.com/video/x8jg86f",
    releaseYear: 2022,
    duration: 6300, // 1h 45m in seconds
    isPremium: true,
    rating: "16+",
    categoryId: 2
  },
  {
    id: 13,
    title: "Karoo Nights",
    description: "A suspenseful thriller set in the isolated expanses of the Karoo, where a traveling family finds themselves in danger.",
    thumbnailUrl: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    videoUrl: "https://www.dailymotion.com/video/x8k3vf2",
    trailerUrl: "https://www.dailymotion.com/video/x8k3vf2",
    releaseYear: 2023,
    duration: 7500, // 2h 05m in seconds
    isPremium: true,
    rating: "16+",
    categoryId: 5
  },
  {
    id: 14,
    title: "Table Mountain Secrets",
    description: "A mystery series centered around the legends and hidden histories of Cape Town's iconic Table Mountain.",
    thumbnailUrl: "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    videoUrl: "https://www.dailymotion.com/video/x8jrht6",
    trailerUrl: "https://www.dailymotion.com/video/x8jrht6",
    releaseYear: 2022,
    duration: 6600, // 1h 50m in seconds
    isPremium: true,
    rating: "13+",
    categoryId: 5
  }
];

// Mock watch history data
export const MOCK_WATCH_HISTORY = [
  { userId: 1, contentId: 1, progress: 1350 }, // 30% of Umzansi Chronicles
  { userId: 1, contentId: 2, progress: 3150 }, // 50% of Soweto Blues
  { userId: 1, contentId: 3, progress: 5175 }, // 75% of Cape Town Nights
  { userId: 1, contentId: 4, progress: 1620 }  // 30% of Joburg Stories
];

// Mock watchlist data
export const MOCK_WATCHLIST = [
  { userId: 1, contentId: 5 }, // Durban Heat
  { userId: 1, contentId: 10 }, // Rainbow Nation
  { userId: 1, contentId: 12 } // Shebeen Queens
];
