import { useEffect, useRef } from 'react'
import { UserSettings, UserStats, WordEntry } from '@/lib/types'

export function useNotificationEngine(
  settings: UserSettings,
  stats: UserStats,
  words: WordEntry[],
  addNotification: (title: string, body: string) => void,
) {
  const notified = useRef(new Set<string>())

  useEffect(() => {
    if (!settings?.studySessionReminder) return

    const now = Date.now()
    const dueReviews = words.filter((w) => w.status === 'srs' && w.nextReviewDate <= now).length

    if (dueReviews > 0) {
      const today = new Date().toISOString().split('T')[0]
      const key = `reviews-${today}`
      if (!notified.current.has(key)) {
        addNotification(
          'Revisões Pendentes! 🧠',
          `Você tem ${dueReviews} flashcards para revisar hoje. Mantenha sua ofensiva!`,
        )
        notified.current.add(key)
      }
    }
  }, [words, settings?.studySessionReminder, addNotification])

  useEffect(() => {
    if (!settings?.dailyPromptReminder) return

    const today = new Date().toISOString().split('T')[0]
    const completedPrompt = stats?.dailyPromptsHistory?.some((h) => h.date === today)

    if (!completedPrompt) {
      const key = `prompt-${today}`
      if (!notified.current.has(key)) {
        addNotification(
          'Daily Prompt Disponível ✍️',
          'Não se esqueça de praticar sua escrita criativa hoje!',
        )
        notified.current.add(key)
      }
    }
  }, [stats?.dailyPromptsHistory, settings?.dailyPromptReminder, addNotification])
}
