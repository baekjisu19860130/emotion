export type EmotionCategoryId = 'positive' | 'calm' | 'tense';

export interface EmotionCategory {
  id: EmotionCategoryId;
  code: 'A' | 'B' | 'C';
  name: string;
  subTitle: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  gradient: string;
  iconName: string;
}

export interface EmotionWord {
  id: string;
  categoryId: EmotionCategoryId;
  word: string;
  emoji?: string;
}

export type CheckInType = 'before' | 'after';

export interface EmotionResponse {
  id: string;
  timestamp: string; // ISO format or localized
  date: string; // YYYY-MM-DD
  sessionId: string;
  sessionName: string;
  studentName: string;
  type: CheckInType; // 'before' | 'after'
  categoryCode: 'A' | 'B' | 'C';
  categoryName: string;
  emotionWord: string;
  comment: string; // expectation in 'before', reflection in 'after'
  rating?: number; // 1-5 optional satisfaction rating in 'after'
  tags?: string[];
}

export interface SessionData {
  id: string;
  title: string;
  instructorName?: string;
  description?: string;
  date: string;
  roster: string[]; // list of student names
  isActive: boolean;
  createdAt: string;
}

export interface BeforeAfterPair {
  studentName: string;
  sessionId: string;
  sessionName: string;
  date: string;
  beforeResponse?: EmotionResponse;
  afterResponse?: EmotionResponse;
  hasBoth: boolean;
  status: 'both' | 'before_only' | 'after_only';
}

export interface GasConfig {
  webhookUrl: string;
  sheetId?: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}

export interface AIAnalysisReport {
  generatedAt: string;
  sessionTitle: string;
  totalBeforeCount: number;
  totalAfterCount: number;
  matchedCount: number;
  summary: string;
  emotionalShift: {
    positiveShiftRate: number; // e.g., 85%
    keyInsights: string[];
    dominantBeforeCategory: string;
    dominantAfterCategory: string;
  };
  expectationHighlights: string[];
  reflectionHighlights: string[];
  instructorRecommendations: string[];
  reportMarkdown: string;
}
