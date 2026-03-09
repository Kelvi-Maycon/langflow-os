import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Check, Mic, LibrarySquare } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const initialMissions = [
  {
    id: 1,
    title: 'Leitura Matinal',
    subtitle: 'Artigo: The Future of AI Design • 15 min',
    xp: '+50 XP',
    icon: Check,
    iconBg: 'bg-success/15',
    iconColor: 'text-success',
    completed: true,
  },
  {
    id: 2,
    title: 'Revisão SRS Diária',
    subtitle: '45 flashcards aguardando sua atenção',
    xp: '+120 XP',
    icon: LibrarySquare,
    iconBg: 'bg-pink-500/15',
    iconColor: 'text-pink-600',
    completed: false,
    progress: 60,
  },
  {
    id: 3,
    title: 'Podcast Imersivo',
    subtitle: 'Episódio #42 do Daily English Podcast',
    xp: '+80 XP',
    icon: Mic,
    iconBg: 'bg-warning/15',
    iconColor: 'text-warning-foreground',
    completed: false,
  },
]

export function MissionsToday() {
  const [missions, setMissions] = useState(initialMissions)
  const { toast } = useToast()

  const completedCount = useMemo(() => missions.filter((m) => m.completed).length, [missions])

  const handleMissionClick = (id: number) => {
    setMissions((prev) =>
      prev.map((m) => {
        if (m.id === id && !m.completed) {
          toast({
            title: '🎉 Missão Concluída!',
            description: `Você finalizou "${m.title}" e ganhou ${m.xp}.`,
          })
          return {
            ...m,
            completed: true,
            progress: 100,
            icon: Check,
            iconBg: 'bg-success/15',
            iconColor: 'text-success',
          }
        }
        return m
      }),
    )
  }

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
          const Icon = mission.icon
          return (
            <Card
              key={mission.id}
              onClick={() => handleMissionClick(mission.id)}
              className={`p-5 flex items-center gap-5 bg-card hover:bg-secondary/40 border-border shadow-sm transition-all duration-250 ease-out hover:scale-[1.02] hover:shadow-md cursor-pointer active:scale-[0.98] rounded-[24px] ${mission.completed ? 'opacity-80' : ''}`}
            >
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-colors duration-500 ${mission.iconBg}`}
              >
                <Icon className={`w-6 h-6 transition-colors duration-500 ${mission.iconColor}`} />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-foreground text-lg truncate">{mission.title}</h4>
                <p className="text-sm text-muted-foreground truncate">{mission.subtitle}</p>
                {mission.progress !== undefined && (
                  <Progress value={mission.progress} className="h-1.5 mt-3 w-1/2" />
                )}
              </div>

              <div className="font-bold text-sm text-muted-foreground bg-secondary px-3 py-1.5 rounded-full whitespace-nowrap border border-border/60">
                {mission.xp}
              </div>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
