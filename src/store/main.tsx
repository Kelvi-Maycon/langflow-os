import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AppState, WordEntry, UserSettings, WordStatus, UserStats } from '@/lib/types'
import { calculateSM2, getNextReviewDate } from '@/lib/sm2'

interface StoreContextType extends AppState {
  addWord: (
    word: Omit<
      WordEntry,
      'id' | 'createdAt' | 'nextReviewDate' | 'interval' | 'easeFactor' | 'repetitions'
    >,
  ) => void
  updateWordStatus: (id: string, status: WordStatus) => void
  reviewWord: (id: string, quality: number) => void
  updateSettings: (settings: Partial<UserSettings>) => void
  removeWord: (id: string) => void
  recordPracticeAttempt: (correct: boolean) => void
  recordFlashcardAttempt: (correct: boolean) => void
}

const defaultSettings: UserSettings = {
  level: 'B1',
  aiProvider: 'openai',
  apiKey: '',
  dailyGoal: 20,
  srsMultiplier: 1.2,
  complexity: 'intermediate',
  aiModel: 'gpt-4o-mini',
}

const defaultStats: UserStats = {
  practiceAttempts: 0,
  practiceCorrect: 0,
  flashcardAttempts: 0,
  flashcardCorrect: 0,
  xp: 0,
  streak: 0,
  lastActiveDate: Date.now(),
}

const mockWords: WordEntry[] = [
  {
    id: '1',
    word: 'serendipity',
    translation: 'serendipidade',
    contextSentence: 'Finding that old photograph was a moment of pure serendipity.',
    status: 'builder',
    nextReviewDate: Date.now() - 10000,
    interval: 1,
    easeFactor: 2.5,
    repetitions: 0,
    createdAt: Date.now(),
  },
  {
    id: '2',
    word: 'ephemeral',
    translation: 'efêmero',
    contextSentence: 'The beauty of a sunset is ephemeral.',
    status: 'srs',
    nextReviewDate: Date.now() - 86400000,
    interval: 1,
    easeFactor: 2.5,
    repetitions: 1,
    createdAt: Date.now() - 100000,
  },
]

const StoreContext = createContext<StoreContextType | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [words, setWords] = useState<WordEntry[]>(() => {
    const saved = localStorage.getItem('langflow_words')
    return saved ? JSON.parse(saved) : mockWords
  })

  const [settings, setSettings] = useState<UserSettings>(() => {
    const savedConfig = localStorage.getItem('langflow_config')
    if (savedConfig) return { ...defaultSettings, ...JSON.parse(savedConfig) }
    const savedSettings = localStorage.getItem('langflow_settings')
    if (savedSettings) return { ...defaultSettings, ...JSON.parse(savedSettings) }
    return defaultSettings
  })

  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('langflow_stats')
    if (saved) {
      const parsed = { ...defaultStats, ...JSON.parse(saved) }
      const now = new Date()
      const last = new Date(parsed.lastActiveDate)
      const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 3600 * 24))
      if (diffDays > 1) {
        parsed.streak = 0
      }
      return parsed
    }
    return defaultStats
  })

  useEffect(() => {
    localStorage.setItem('langflow_words', JSON.stringify(words))
  }, [words])

  useEffect(() => {
    localStorage.setItem('langflow_config', JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    localStorage.setItem('langflow_stats', JSON.stringify(stats))
  }, [stats])

  const addWord = (data: Parameters<StoreContextType['addWord']>[0]) => {
    const newWord: WordEntry = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      nextReviewDate: Date.now(),
      interval: 0,
      easeFactor: 2.5,
      repetitions: 0,
    }
    setWords((prev) => [newWord, ...prev])
  }

  const updateWordStatus = (id: string, status: WordStatus) => {
    setWords((prev) => prev.map((w) => (w.id === id ? { ...w, status } : w)))
  }

  const reviewWord = (id: string, quality: number) => {
    setWords((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w
        const sm2 = calculateSM2(
          quality,
          w.repetitions,
          w.interval,
          w.easeFactor,
          settings.srsMultiplier,
        )
        const nextReviewDate = getNextReviewDate(sm2.interval)
        const status = sm2.interval > 21 ? 'mastered' : 'srs'
        return { ...w, ...sm2, nextReviewDate, status }
      }),
    )
  }

  const removeWord = (id: string) => setWords((prev) => prev.filter((w) => w.id !== id))

  const updateSettings = (newSettings: Partial<UserSettings>) =>
    setSettings((prev) => ({ ...prev, ...newSettings }))

  const updateEngagement = () => {
    setStats((prev) => {
      const now = Date.now()
      const lastDate = new Date(prev.lastActiveDate)
      const currDate = new Date(now)
      const isSameDay = lastDate.toDateString() === currDate.toDateString()
      const isNextDay =
        new Date(lastDate.getTime() + 86400000).toDateString() === currDate.toDateString()

      let newStreak = prev.streak
      if (isNextDay) newStreak += 1
      else if (!isSameDay && !isNextDay) newStreak = 1
      else if (newStreak === 0) newStreak = 1

      return {
        ...prev,
        streak: newStreak,
        lastActiveDate: now,
      }
    })
  }

  const recordPracticeAttempt = (correct: boolean) => {
    updateEngagement()
    setStats((prev) => ({
      ...prev,
      practiceAttempts: (prev.practiceAttempts || 0) + 1,
      practiceCorrect: (prev.practiceCorrect || 0) + (correct ? 1 : 0),
      xp: (prev.xp || 0) + (correct ? 10 : 2),
    }))
  }

  const recordFlashcardAttempt = (correct: boolean) => {
    updateEngagement()
    setStats((prev) => ({
      ...prev,
      flashcardAttempts: (prev.flashcardAttempts || 0) + 1,
      flashcardCorrect: (prev.flashcardCorrect || 0) + (correct ? 1 : 0),
      xp: (prev.xp || 0) + (correct ? 15 : 5),
    }))
  }

  return React.createElement(
    StoreContext.Provider,
    {
      value: {
        words,
        settings,
        stats,
        addWord,
        updateWordStatus,
        reviewWord,
        updateSettings,
        removeWord,
        recordPracticeAttempt,
        recordFlashcardAttempt,
      },
    },
    children,
  )
}

export const useStore = () => {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
