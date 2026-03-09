import { useStore } from '@/store/main'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Check, Mic, LibrarySquare, Zap, Star, Flame, Brain } from 'lucide-react'

const iconMap: Record<string, any> = {
  check: Check,
  brain: Brain,
  zap: Zap,
  star: Star,
  flame: Flame,
  mic: Mic,
  library: LibrarySquare,
}

export function MissionsToday() {
  const { stats } = useStore()
  const missions = stats.dailyMissions || []
  const completedCount = missions.filter((m) => m.completed).length

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-foreground tracking-tight">Missões de Hoje</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Complete as tarefas para ganhar XP bônus
          </p>
        </div>
        <div className="bg-pink-500/10 text-pink-600 font-bold text-sm px-4 py-1.5 rounded-full border border-pink-500/20">
          {completedCount}/{missions.length} Completas
        </div>
      </header>

      <div className="space-y-3">
        {missions.map((mission) => {
          const Icon = iconMap[mission.icon] || Check
          const progressPct = Math.min((mission.progress / mission.target) * 100, 100)

          return (
            <Card
              key={mission.id}
              className={`p-5 flex items-center gap-5 bg-card hover:bg-secondary/40 border-border shadow-sm transition-all duration-250 ease-out rounded-[24px] ${mission.completed ? 'opacity-80' : ''}`}
            >
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-colors duration-500 ${mission.completed ? 'bg-success/15 text-success' : 'bg-pink-500/15 text-pink-600'}`}
              >
                <Icon className="w-6 h-6" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <h4 className="font-bold text-foreground text-lg truncate">{mission.title}</h4>
                    <p className="text-sm text-muted-foreground truncate">{mission.subtitle}</p>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground bg-secondary px-2.5 py-1 rounded-full border border-border/50">
                    {Math.floor(mission.progress)} / {mission.target}
                  </span>
                </div>
                <Progress value={progressPct} className="h-1.5 w-full" />
              </div>

              <div className="font-bold text-sm text-muted-foreground bg-secondary px-3 py-1.5 rounded-full whitespace-nowrap border border-border/60">
                +{mission.xpReward} XP
              </div>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
