import { IRAQI_GOVERNORATES } from './constants';

export type Governorate = typeof IRAQI_GOVERNORATES[number];

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash?: string; // Hashed password, optional on client-side objects
  isVerified: boolean;
  isPremium: boolean;
  joinedAt: Date;
  credits: number;
  followers: number[]; // Array of user IDs
  following: number[]; // Array of user IDs
  role: 'admin' | 'user';
}

export interface Ad {
  id: number;
  title: string;
  description: string;
  price: number;
  governorate: Governorate;
  images: string[];
  postedAt: Date;
  userId: number; // Link to the user
  author: User; // Joined user data
  phoneNumber: string;
  likes: number;
  status: 'active' | 'sold';
  isPromoted: boolean;
}

export interface AdSenseConfig {
  enabled: boolean;
  clientId: string;
  slotId: string;
}

export type View = 'landing' | 'home' | 'postAd' | 'admin' | 'chat' | 'login' | 'signup';

// Chat System Types
export interface ChatMessage {
    id: string;
    conversationId: number;
    senderId: number;
    text: string;
    timestamp: Date;
    isRead: boolean;
}

export interface ChatConversation {
    id: number;
    participants: number[]; // Array of two user IDs
    messages: ChatMessage[];
    lastMessageTimestamp: Date;
    typingUser?: number; // ID of the user currently typing
}