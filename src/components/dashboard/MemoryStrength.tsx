import { Card } from '@/components/ui/card'
import { useStore } from '@/store/main'
import { Brain } from 'lucide-react'
import { useMemo } from 'react'

export function MemoryStrength() {
  const { words } = useStore()

  const stats = useMemo(() => {
    const total = words.length
    if (total === 0) return { longTerm: 0, shortTerm: 0, learning: 0, lp: 0, sp: 0, lrn: 0 }

    const longTerm = words.filter((w) => w.interval > 21 || w.status === 'mastered').length
    const shortTerm = words.filter(
      (w) => w.interval > 0 && w.interval <= 21 && w.status !== 'mastered',
    ).length
    const learning = words.filter((w) => w.interval === 0).length

    return {
      longTerm,
      shortTerm,
      learning,
      lp: (longTerm / total) * 100,
      sp: (shortTerm / total) * 100,
      lrn: (learning / total) * 100,
    }
  }, [words])

  return (
    <Card className="p-6 bg-card border-border shadow-sm flex flex-col justify-between rounded-[24px] hover:shadow-md transition-shadow duration-300">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            Força da Memória
          </h3>
          <div className="p-2 bg-secondary rounded-full">
            <Brain className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        <div className="flex items-end gap-2 mb-8">
          <span className="text-5xl font-black text-foreground tracking-tighter">
            {Math.round(stats.lp)}%
          </span>
          <span className="text-sm font-bold text-muted-foreground pb-1.5 uppercase tracking-wider">
            NO LONGO PRAZO
          </span>
        </div>

        <div className="w-full h-4 rounded-full flex overflow-hidden mb-6 bg-secondary/50 border border-border/50">
          <div
            style={{ width: `${stats.lp}%` }}
            className="bg-success transition-all duration-1000 ease-out"
          />
          <div
            style={{ width: `${stats.sp}%` }}
            className="bg-warning transition-all duration-1000 ease-out"
          />
          <div
            style={{ width: `${stats.lrn}%` }}
            className="bg-muted transition-all duration-1000 ease-out"
          />
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-secondary/30 p-2 rounded-xl">
            <div className="flex items-center justify-center gap-1.5 font-bold text-success text-xs tracking-wider mb-1">
              <div className="w-2 h-2 rounded-full bg-success" /> LONGO
            </div>
            <span className="text-sm font-bold text-foreground">{stats.longTerm}</span>
          </div>
          <div className="bg-secondary/30 p-2 rounded-xl">
            <div className="flex items-center justify-center gap-1.5 font-bold text-warning text-xs tracking-wider mb-1">
              <div className="w-2 h-2 rounded-full bg-warning" /> CURTO
            </div>
            <span className="text-sm font-bold text-foreground">{stats.shortTerm}</span>
          </div>
          <div className="bg-secondary/30 p-2 rounded-xl">
            <div className="flex items-center justify-center gap-1.5 font-bold text-muted-foreground text-xs tracking-wider mb-1">
              <div className="w-2 h-2 rounded-full bg-muted-foreground" /> NOVO
            </div>
            <span className="text-sm font-bold text-foreground">{stats.learning}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
