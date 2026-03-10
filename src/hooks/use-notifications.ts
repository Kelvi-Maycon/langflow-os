import { useEffect, useRef } from 'react'
import { useStore } from '@/store/main'
import useCardStore from '@/stores/useCardStore'

export function useNotificationEngine() {
  const { settings, stats, addNotification } = useStore()
  const { cards } = useCardStore()
  const notified = useRef(new Set<string>())

  useEffect(() => {
    if (!settings?.studySessionReminder) return

    const now = Date.now()
    const dueReviews = cards.filter((c) => c.nextReviewDate <= now).length

    if (dueReviews > 0) {
      const today = new Date().toISOString().split('T')[0]
      const key = `reviews-${today}`
      if (!notified.current.has(key)) {
        addNotification(
          'Revisões Pendentes! 🧠',
          `Você tem ${dueReviews} flashcards para revisar hoje. Mantenha sua constância!`,
        )
        notified.current.add(key)
      }
    }
  }, [cards, settings?.studySessionReminder, addNotification])

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
