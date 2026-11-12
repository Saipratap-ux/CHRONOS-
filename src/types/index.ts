export type Language = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'hi';

export interface HistoricalEra {
  id: string;
  nameKey: string;
  defaultName: string;
  year: string;
  location: string;
  period: string;
  tagline: string;
  description: string;
  costume: string;
  promptTemplate: string;
  color: {
    primary: string;
    secondary: string;
    accent: string;
    border: string;
    bgGradient: string;
  };
  filter: 'vintage-sepia' | 'renaissance-oil' | 'technicolor' | 'lunar-bw' | 'edo-wash' | 'steampunk' | 'cyber-neon' | 'medieval-tapestry';
  funFact: string;
  svgScene: string; // inline SVG background illustration for offline compositing
}

export interface TemporalAnalysis {
  bestEraId: string;
  historicalAlterEgo: string;
  eraVibeSummary: string;
  recommendedCostume: string;
  historicalFact: string;
  timelineSafetyScore: number;
}

export interface PhotoCapture {
  id: string;
  timestamp: number;
  originalImage: string; // base64
  transformedImage?: string; // base64
  eraId: string;
  customPrompt?: string;
  analysis?: TemporalAnalysis;
  filterApplied?: string;
  stickers?: StickerItem[];
  modelUsed?: string;
}

export interface StickerItem {
  id: string;
  type: string;
  emoji: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export interface PhotoboothStripConfig {
  id: string;
  layout: '3-vertical' | '4-vertical' | '2x2-grid' | 'polaroid';
  theme: 'vintage-cream' | 'noir-black' | 'art-deco-gold' | 'cyber-slate' | 'pastel-retro';
  title: string;
  dateStamp: string;
  photoIds: string[];
}

export interface AdminAnalytics {
  totalCaptures: number;
  totalTransformed: number;
  totalAnalyzed: number;
  totalExports: number;
  eraStats: Record<string, number>;
  lastActive: string;
}
