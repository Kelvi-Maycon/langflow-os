import { Card } from '@/components/ui/card'
import { Flame } from 'lucide-react'
import { useStore } from '@/store/main'
import { useMemo } from 'react'

export function StreakWidget() {
  const { stats } = useStore()

  const days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      const dateStr = d.toISOString().split('T')[0]
      const label = d.toLocaleDateString('pt-BR', { weekday: 'short' })[0].toUpperCase()
      const entry = stats.activityHistory?.find((h) => h.date === dateStr)
      const isToday = i === 6
      return { label, active: !!entry && entry.count > 0, isToday }
    })
  }, [stats.activityHistory])

  return (
    <Card className="p-6 bg-card border-border shadow-sm flex flex-col justify-between rounded-[24px] hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
      <div className="absolute -right-8 -top-8 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-orange-500/20 transition-colors duration-700" />

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
              Ofensiva de Estudo
            </h3>
            <div className="p-2 bg-orange-500/10 rounded-full border border-orange-500/20">
              <Flame className="w-4 h-4 text-orange-500 fill-current" />
            </div>
          </div>

          <div className="flex items-end gap-2 mb-8">
            <span className="text-5xl font-black text-foreground tracking-tighter">
              {stats.streak}
            </span>
            <span className="text-sm font-bold text-muted-foreground pb-1.5 uppercase tracking-wider">
              DIAS SEGUIDOS
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center bg-secondary/40 p-4 rounded-2xl border border-border shadow-inner">
          {days.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <span
                className={`text-[10px] font-bold ${
                  d.isToday ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {d.label}
              </span>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                  d.active
                    ? 'bg-orange-500 text-white shadow-[0_0_10px_rgba(249,115,22,0.3)] scale-110'
                    : 'bg-background border border-border text-transparent'
                } ${d.isToday && !d.active ? 'border-dashed border-orange-500/50' : ''}`}
              >
                {d.active && <Flame className="w-3.5 h-3.5 fill-current" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
