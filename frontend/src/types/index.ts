// TypeScript Type Definitions for Anikama

export interface User {
  id: string;
  username: string;
  tier: 'free' | 'premium';
  created_at: string;
  updated_at: string;
}

export interface Companion {
  id: string;
  name: string;
  anime_source: string;
  archetype: string;
  avatar_url: string;
  personality_traits: string[];
  tags: string[];
  system_prompt: string;
  mood: string;
  has_stories?: boolean;
  created_at: string;
  relationship?: Relationship;
}

export interface Relationship {
  user_id: string;
  companion_id: string;
  affinity_score: number;
  current_mood: string;
  last_interaction_at: string;
}


export interface Story {
  id: string;
  companion_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  duration: number;
  order_index: number;
  mood?: string;
  is_premium?: boolean;
  is_locked?: boolean;
  created_at: string;
}

export interface UserAffinity {
  user_id: string;
  companion_id: string;
  xp: number;
  level: number;
  last_interaction: string;
  created_at: string;
}

export interface CompanionWithAffinity extends Companion {
  affinity?: UserAffinity;
}

export interface StoriesGrouped {
  companion_id: string;
  companion_name: string;
  avatar_url: string;
  stories: Story[];
}

export interface ChatRequest {
  companion_id: string;
  message: string;
}

export interface ChatResponse {
  companion_id: string;
  message: string;
  is_limited: boolean;
}

export interface InteractionRequest {
  companion_id: string;
  action: 'view_story' | 'sent_msg';
}

export interface InteractionResponse {
  companion_id: string;
  xp: number;
  level: number;
  xp_gained: number;
  leveled_up: boolean;
  new_score: number;
  delta: number;
  new_mood: string;
  toast_message: string;
  reaction_video_url?: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'companion';
  timestamp: Date;
  companionId: string;
}

export interface ChatListItem {
  id: string;
  companion_id: string;
  companion_name: string;
  avatar_url: string;
  last_message: string;
  last_message_at: string;
}

export interface ChatListResponse {
  chats: ChatListItem[];
}

export interface Post {
  id: number;
  image_url: string;
  title: string;
  user: {
    name: string;
    avatar: string;
  };
  likes: number;
  comments: number;
  isLocked?: boolean;
}
