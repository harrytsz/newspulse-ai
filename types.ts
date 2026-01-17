
export enum View {
  LOGIN = 'LOGIN',
  FACE_SCAN = 'FACE_SCAN',
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  CATEGORY = 'CATEGORY',
  ARTICLE = 'ARTICLE',
  STATS = 'STATS',
  PROFILE = 'PROFILE',
  ADMIN_CONTENT = 'ADMIN_CONTENT',
  ADMIN_USERS = 'ADMIN_USERS'
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  category: string;
  readTime: string;
  readCount: number;
  commentCount?: number; // Added commentCount
  matchScore: number;
  imageUrl: string;
  images?: string[]; // Added support for multiple images
  date: string;
  source: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'banned';
  joinDate: string;
  avatar: string;
  interests: string[];
}
