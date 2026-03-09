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

const getMockActivityHistory = () =>
  Array.from({ length: 90 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    return {
      date: d.toISOString().split('T')[0],
      count: Math.random() > 0.3 ? Math.floor(Math.random() * 20) + 5 : 0,
    }
  }).reverse()

const defaultStats: UserStats = {
  practiceAttempts: 0,
  practiceCorrect: 0,
  flashcardAttempts: 0,
  flashcardCorrect: 0,
  xp: 0,
  streak: 5,
  lastActiveDate: Date.now(),
  activityHistory: getMockActivityHistory(),
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
      if (diffDays > 1) parsed.streak = 0
      if (!parsed.activityHistory || !parsed.activityHistory.length) {
        parsed.activityHistory = defaultStats.activityHistory
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

  const updateStats = (isCorrect: boolean, type: 'practice' | 'flashcard') => {
    setStats((prev) => {
      const now = Date.now()
      const dNow = new Date(now),
        dLast = new Date(prev.lastActiveDate)
      const isNext = new Date(dLast.getTime() + 86400000).toDateString() === dNow.toDateString()
      let streak = isNext
        ? prev.streak + 1
        : dLast.toDateString() === dNow.toDateString()
          ? prev.streak
          : 1

      const todayStr = dNow.toISOString().split('T')[0]
      const hist = prev.activityHistory ? [...prev.activityHistory] : []
      const idx = hist.findIndex((h) => h.date === todayStr)
      if (idx >= 0) hist[idx].count += 1
      else hist.push({ date: todayStr, count: 1 })

      return {
        ...prev,
        streak,
        lastActiveDate: now,
        activityHistory: hist,
        xp: (prev.xp || 0) + (type === 'practice' ? (isCorrect ? 10 : 2) : isCorrect ? 15 : 5),
        ...(type === 'practice'
          ? {
              practiceAttempts: (prev.practiceAttempts || 0) + 1,
              practiceCorrect: (prev.practiceCorrect || 0) + (isCorrect ? 1 : 0),
            }
          : {
              flashcardAttempts: (prev.flashcardAttempts || 0) + 1,
              flashcardCorrect: (prev.flashcardCorrect || 0) + (isCorrect ? 1 : 0),
            }),
      }
    })
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
        recordPracticeAttempt: (correct) => updateStats(correct, 'practice'),
        recordFlashcardAttempt: (correct) => updateStats(correct, 'flashcard'),
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
