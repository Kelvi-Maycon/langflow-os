export type WordStatus = 'learning' | 'builder' | 'srs' | 'mastered'
export type WordType = 'word' | 'collocation'

export interface WordEntry {
  id: string
  word: string
  translation: string
  contextSentence: string
  type?: WordType
  status: WordStatus
  nextReviewDate: number
  interval: number
  easeFactor: number
  repetitions: number
  createdAt: number
}

export interface Flashcard {
  id: string
  wordId: string
  targetText: string
  translation: string
  contextSentenceEn: string
  contextSentencePt: string
  nextReviewDate: number
  interval: number
  easeFactor: number
  repetitions: number
  createdAt: number
}

export interface UserSettings {
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  aiProvider: 'openai' | 'gemini'
  apiKey: string
  dailyGoal: number
  srsMultiplier: number
  complexity: string
  aiModel?: string
  dailyPromptReminder?: boolean
  studySessionReminder?: boolean
  preferredStudyTime?: string
}

export interface ActivityEntry {
  date: string
  count: number
}

export interface DailyMission {
  id: string
  title: string
  subtitle: string
  type: 'practice' | 'flashcard' | 'xp' | 'prompt'
  target: number
  progress: number
  xpReward: number
  completed: boolean
  icon: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: number
  requirement: number
  type: 'streak' | 'words' | 'xp' | 'flashcards'
}

export interface DailyPromptEntry {
  date: string
  prompt: string
  targetWord: string
  response: string
}

export interface UserStats {
  practiceAttempts: number
  practiceCorrect: number
  flashcardAttempts: number
  flashcardCorrect: number
  xp: number
  streak: number
  lastActiveDate: number
  activityHistory?: ActivityEntry[]
  dailyMissions: DailyMission[]
  missionsDate: string
  achievements: Achievement[]
  consecutiveCorrect?: number
  consecutiveIncorrect?: number
  dailyPromptsHistory?: DailyPromptEntry[]
}

export interface AppNotification {
  id: string
  title: string
  body: string
  date: number
  read: boolean
}

export interface RecentVideo {
  id: string
  videoId: string
  url: string
  title: string
  text: string
  timestamp: number
}

export interface AppState {
  words: WordEntry[]
  settings: UserSettings
  stats: UserStats
  notifications: AppNotification[]
  recentVideos: RecentVideo[]
}
