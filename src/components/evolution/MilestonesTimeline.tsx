import { useStore } from '@/store/main'
import { Card } from '@/components/ui/card'
import { Trophy } from 'lucide-react'

export function MilestonesTimeline() {
  const { stats } = useStore()
  const achievements = stats.achievements || []

  // Sort unlocked achievements by date (newest first)
  const unlocked = achievements
    .filter((a) => a.unlocked)
    .sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0))

  return (
    <Card className="p-6 md:p-8 bg-gradient-to-br from-card to-secondary/30 border-border shadow-sm rounded-[24px] h-full">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-warning/15 rounded-2xl border border-warning/20 shadow-sm">
          <Trophy className="w-6 h-6 text-warning" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">Marcos Históricos</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Sua jornada de evolução</p>
        </div>
      </div>

      <div className="relative pl-6 border-l-2 border-border/80 space-y-8 mt-4 overflow-y-auto max-h-[600px] pr-2 pb-4 scrollbar-thin">
        {unlocked.map((ach) => (
          <div key={ach.id} className="relative group">
            <div className="absolute -left-[33px] w-4 h-4 rounded-full bg-background border-[3px] border-warning shadow-[0_0_10px_rgba(234,179,8,0.3)] group-hover:scale-125 transition-transform duration-300" />

            <div className="bg-background/60 p-4 rounded-xl border border-border/60 shadow-sm hover:shadow-md transition-shadow group-hover:border-warning/30">
              <h4 className="text-base font-bold text-foreground leading-tight">{ach.title}</h4>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                {ach.description}
              </p>
              {ach.unlockedAt && (
                <p className="text-xs font-bold text-warning/80 mt-3 uppercase tracking-wider bg-warning/10 inline-block px-2 py-1 rounded-md">
                  {new Date(ach.unlockedAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              )}
            </div>
          </div>
        ))}

        {unlocked.length === 0 && (
          <div className="relative">
            <div className="absolute -left-[33px] w-4 h-4 rounded-full bg-background border-[3px] border-muted" />
            <p className="text-muted-foreground italic pl-2">
              Continue praticando para desbloquear suas primeiras conquistas e ver seu histórico
              crescer!
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
