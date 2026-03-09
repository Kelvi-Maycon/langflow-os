import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import {
  AppState,
  WordEntry,
  UserSettings,
  WordStatus,
  UserStats,
  DailyMission,
  Achievement,
} from '@/lib/types'
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

const defaultAchievements: Achievement[] = [
  {
    id: 'a1',
    title: 'Primeiros Passos',
    description: 'Ganhe seus primeiros 50 XP',
    icon: 'zap',
    unlocked: false,
    requirement: 50,
    type: 'xp',
  },
  {
    id: 'a2',
    title: 'Consistência',
    description: 'Alcance uma ofensiva de 3 dias',
    icon: 'flame',
    unlocked: false,
    requirement: 3,
    type: 'streak',
  },
  {
    id: 'a3',
    title: 'Mestre da Revisão',
    description: 'Acerte 20 flashcards',
    icon: 'brain',
    unlocked: false,
    requirement: 20,
    type: 'flashcards',
  },
  {
    id: 'a4',
    title: 'Vocabulário Ativo',
    description: 'Adicione 10 palavras ao sistema',
    icon: 'book',
    unlocked: false,
    requirement: 10,
    type: 'words',
  },
]

const generateMissions = (): DailyMission[] => [
  {
    id: 'm1',
    title: 'Prática Diária',
    subtitle: 'Acerte 5 exercícios',
    type: 'practice',
    target: 5,
    progress: 0,
    xpReward: 50,
    completed: false,
    icon: 'check',
  },
  {
    id: 'm2',
    title: 'Revisão Constante',
    subtitle: 'Acerte 10 flashcards',
    type: 'flashcard',
    target: 10,
    progress: 0,
    xpReward: 80,
    completed: false,
    icon: 'brain',
  },
  {
    id: 'm3',
    title: 'Caçador de XP',
    subtitle: 'Ganhe 100 XP hoje',
    type: 'xp',
    target: 100,
    progress: 0,
    xpReward: 120,
    completed: false,
    icon: 'zap',
  },
]

const defaultStats: UserStats = {
  practiceAttempts: 0,
  practiceCorrect: 0,
  flashcardAttempts: 0,
  flashcardCorrect: 0,
  xp: 0,
  streak: 5,
  lastActiveDate: Date.now(),
  activityHistory: getMockActivityHistory(),
  dailyMissions: [],
  missionsDate: '',
  achievements: defaultAchievements,
  consecutiveCorrect: 0,
  consecutiveIncorrect: 0,
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

const checkGamification = (stats: UserStats, totalWords: number) => {
  let extraXp = 0

  const updatedMissions = (stats.dailyMissions || []).map((m) => {
    if (m.completed) return m
    if (m.progress >= m.target) {
      extraXp += m.xpReward
      return { ...m, completed: true, progress: m.target }
    }
    return m
  })

  stats.xp += extraXp

  const updatedAchievements = (stats.achievements || []).map((a) => {
    if (a.unlocked) return a
    let meetsReq = false
    switch (a.type) {
      case 'xp':
        meetsReq = stats.xp >= a.requirement
        break
      case 'streak':
        meetsReq = stats.streak >= a.requirement
        break
      case 'flashcards':
        meetsReq = stats.flashcardCorrect >= a.requirement
        break
      case 'words':
        meetsReq = totalWords >= a.requirement
        break
    }
    if (meetsReq) return { ...a, unlocked: true, unlockedAt: Date.now() }
    return a
  })

  return {
    ...stats,
    dailyMissions: updatedMissions,
    achievements: updatedAchievements,
  }
}

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
    let parsed = saved ? { ...defaultStats, ...JSON.parse(saved) } : defaultStats

    const now = new Date()
    const last = new Date(parsed.lastActiveDate)
    const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 3600 * 24))
    if (diffDays > 1) parsed.streak = 0
    if (!parsed.activityHistory || !parsed.activityHistory.length) {
      parsed.activityHistory = defaultStats.activityHistory
    }

    const todayStr = now.toISOString().split('T')[0]
    if (parsed.missionsDate !== todayStr) {
      parsed.dailyMissions = generateMissions()
      parsed.missionsDate = todayStr
    }

    if (!parsed.achievements || parsed.achievements.length === 0) {
      parsed.achievements = defaultAchievements
    } else {
      const achIds = parsed.achievements.map((a: Achievement) => a.id)
      defaultAchievements.forEach((da) => {
        if (!achIds.includes(da.id)) parsed.achievements.push(da)
      })
    }

    return parsed
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

  useEffect(() => {
    const { consecutiveCorrect = 0, consecutiveIncorrect = 0 } = stats
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const
    const currentLevelIndex = levels.indexOf(settings.level as any)

    if (
      consecutiveCorrect >= 5 &&
      currentLevelIndex > -1 &&
      currentLevelIndex < levels.length - 1
    ) {
      const newLevel = levels[currentLevelIndex + 1]
      const comp =
        newLevel === 'A1' || newLevel === 'A2'
          ? 'beginner'
          : newLevel === 'B1' || newLevel === 'B2'
            ? 'intermediate'
            : 'advanced'
      setSettings((prev) => ({ ...prev, level: newLevel, complexity: comp }))
      setStats((prev) => ({ ...prev, consecutiveCorrect: 0 }))
    } else if (consecutiveIncorrect >= 3 && currentLevelIndex > 0) {
      const newLevel = levels[currentLevelIndex - 1]
      const comp =
        newLevel === 'A1' || newLevel === 'A2'
          ? 'beginner'
          : newLevel === 'B1' || newLevel === 'B2'
            ? 'intermediate'
            : 'advanced'
      setSettings((prev) => ({ ...prev, level: newLevel, complexity: comp }))
      setStats((prev) => ({ ...prev, consecutiveIncorrect: 0 }))
    }
  }, [stats.consecutiveCorrect, stats.consecutiveIncorrect, settings.level])

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
    setWords((prev) => {
      const next = [newWord, ...prev]
      setStats((s) => checkGamification(s, next.length))
      return next
    })
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

      const baseXp = type === 'practice' ? (isCorrect ? 10 : 2) : isCorrect ? 15 : 5
      const newXp = (prev.xp || 0) + baseXp

      const flashcardAttempts = (prev.flashcardAttempts || 0) + (type === 'flashcard' ? 1 : 0)
      const flashcardCorrect =
        (prev.flashcardCorrect || 0) + (type === 'flashcard' && isCorrect ? 1 : 0)
      const practiceAttempts = (prev.practiceAttempts || 0) + (type === 'practice' ? 1 : 0)
      const practiceCorrect =
        (prev.practiceCorrect || 0) + (type === 'practice' && isCorrect ? 1 : 0)

      const newMissions = (prev.dailyMissions || []).map((m) => {
        if (m.completed) return m
        let p = m.progress
        if (m.type === type && isCorrect) p += 1
        if (m.type === 'xp') p += baseXp
        return { ...m, progress: p }
      })

      let { consecutiveCorrect = 0, consecutiveIncorrect = 0 } = prev
      if (isCorrect) {
        consecutiveCorrect += 1
        consecutiveIncorrect = 0
      } else {
        consecutiveIncorrect += 1
        consecutiveCorrect = 0
      }

      const newState = {
        ...prev,
        streak,
        lastActiveDate: now,
        activityHistory: hist,
        xp: newXp,
        flashcardAttempts,
        flashcardCorrect,
        practiceAttempts,
        practiceCorrect,
        dailyMissions: newMissions,
        consecutiveCorrect,
        consecutiveIncorrect,
      }

      return checkGamification(newState, words.length)
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
