import { useEffect } from 'react'
import { UserSettings, UserStats, WordEntry } from '@/lib/types'

export function useNotificationEngine(
  settings: UserSettings,
  stats: UserStats,
  words: WordEntry[],
) {
  useEffect(() => {
    if (!settings.dailyPromptReminder && !settings.studySessionReminder) return

    if (!('Notification' in window)) return

    const checkAndNotify = () => {
      if (Notification.permission !== 'granted') return

      const now = new Date()
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()
      const todayStr = now.toISOString().split('T')[0]

      const preferredTime = settings.preferredStudyTime || '18:00'
      const [prefHour, prefMin] = preferredTime.split(':').map(Number)

      const lastNotifiedStr = localStorage.getItem('langflow_last_notified') || ''
      if (lastNotifiedStr === todayStr) return

      const isAfterPreferredTime =
        currentHour > prefHour || (currentHour === prefHour && currentMinute >= prefMin)

      if (isAfterPreferredTime) {
        let notified = false

        if (settings.dailyPromptReminder) {
          const promptHistory = stats.dailyPromptsHistory || []
          const didPromptToday = promptHistory.some((h) => h.date === todayStr)
          if (!didPromptToday) {
            new Notification('Daily Prompt Disponível! ✍️', {
              body: 'Seu desafio diário de escrita está te esperando. Mantenha sua consistência!',
            })
            notified = true
          }
        }

        if (!notified && settings.studySessionReminder) {
          const pendingReviews = words.filter(
            (w) => w.nextReviewDate <= Date.now() && w.status !== 'learning',
          )
          if (pendingReviews.length > 0) {
            new Notification('Hora da Revisão! 🧠', {
              body: `Você tem ${pendingReviews.length} palavras prontas para revisão no seu SRS.`,
            })
            notified = true
          }
        }

        if (notified) {
          localStorage.setItem('langflow_last_notified', todayStr)
        }
      }
    }

    const interval = setInterval(checkAndNotify, 60 * 1000)
    checkAndNotify()

    return () => clearInterval(interval)
  }, [
    settings.dailyPromptReminder,
    settings.studySessionReminder,
    settings.preferredStudyTime,
    stats.dailyPromptsHistory,
    words,
  ])
}
