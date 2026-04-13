export type MentionSource = 'manual' | 'journal';

export interface Mention {
  id: string;
  timestamp: Date;
  source: MentionSource;
  context?: string;
}

export interface JournalEntry {
  id: string;
  timestamp: Date;
  content: string;
  mood: number; // 1-5
  mentionsDetected: number;
  aiInsights?: string;
}

export interface MoodCheck {
  id: string;
  timestamp: Date;
  level: number; // 1-5
  triggers: string[];
}

export interface DailyStats {
  date: string; // ISO date
  mentionCount: number;
  averageMood: number;
  journalCount: number;
}

export interface UserProfile {
  name: string;
  onboarded: boolean;
  streak: number;
  lettingGoScore: number;
}
