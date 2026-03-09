import { useEffect, useRef } from 'react'
import { useStore } from '@/store/main'
import { useToast } from '@/hooks/use-toast'

export function GamificationWatcher() {
  const { stats } = useStore()
  const { toast } = useToast()

  const prevMissions = useRef(stats.dailyMissions)
  const prevAchievements = useRef(stats.achievements)

  useEffect(() => {
    if (!stats.dailyMissions || !stats.achievements) return

    stats.dailyMissions.forEach((mission) => {
      const prev = prevMissions.current?.find((m) => m.id === mission.id)
      if (prev && !prev.completed && mission.completed) {
        toast({
          title: '🎉 Missão Concluída!',
          description: `Você completou "${mission.title}" e ganhou ${mission.xpReward} XP.`,
        })
      }
    })
    prevMissions.current = stats.dailyMissions

    stats.achievements.forEach((ach) => {
      const prev = prevAchievements.current?.find((a) => a.id === ach.id)
      if (prev && !prev.unlocked && ach.unlocked) {
        toast({
          title: '🏆 Nova Conquista!',
          description: `Você desbloqueou o emblema: ${ach.title}`,
        })
      }
    })
    prevAchievements.current = stats.achievements
  }, [stats.dailyMissions, stats.achievements, toast])

  return null
}
