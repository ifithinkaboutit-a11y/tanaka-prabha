// src/data/interfaces/content.d.ts

export interface Banner {
  title: string;
  subtitle: string;
  imageUrl: string;
  url: string;
}

export interface QuickAction {
  title: string;
  icon: keyof typeof import("@expo/vector-icons").Ionicons.glyphMap;
  iconColor?: string;
  bgColor?: string;
}

export interface Scheme {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  location?: string;
  date?: string;
  heroImageUrl?: string;
  keyObjectives?: string[];
  overview?: string;
  process?: string;
  support?: string;
  applyUrl?: string;
}
