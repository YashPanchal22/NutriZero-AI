export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  imageUrl?: string;
  followUps?: string[];
  isError?: boolean;
}

export interface ConversationSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface NutritionStaple {
  id: string;
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  costPerPortion: string;
  keyNutrients: string;
  sdgRole: string;
}

export interface StorageGuideline {
  item: string;
  duration: string;
  location: string;
  safetyRule: string;
}

export interface SDGPillar {
  name: string;
  description: string;
}

export interface SDGTarget {
  code: string;
  title: string;
  description: string;
}

export interface SDGInfo {
  title: string;
  subtitle: string;
  organization: string;
  pillars: SDGPillar[];
  keyTargets: SDGTarget[];
  foodWasteFacts: string[];
  individualActions: { action: string; detail: string }[];
}

export interface AppActivityStats {
  conversationsCount: number;
  recipesCount: number;
  mealPlansCount: number;
  wasteHacksCount: number;
  groceryPlansCount: number;
  lastActive: string;
}
