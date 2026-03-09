export type WordStatus = 'learning' | 'builder' | 'srs' | 'mastered'

export interface WordEntry {
  id: string
  word: string
  translation: string
  contextSentence: string
  status: WordStatus
  nextReviewDate: number
  interval: number
  easeFactor: number
  repetitions: number
  createdAt: number
}

export interface UserSettings {
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  apiKey: string
  dailyGoal: number
  srsMultiplier: number
  complexity: string
  aiModel?: string
}

export interface UserStats {
  practiceAttempts: number
  practiceCorrect: number
  flashcardAttempts: number
  flashcardCorrect: number
}

export interface AppState {
  words: WordEntry[]
  settings: UserSettings
  stats: UserStats
}
