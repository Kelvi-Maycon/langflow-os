import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useStore } from '@/store/main'
import { Shield, Zap } from 'lucide-react'
import { getLevelTier } from '@/lib/gamification'

export function LevelProgressWidget() {
  const { stats } = useStore()
  const { current, next } = getLevelTier(stats.xp)

  const progress = next
    ? ((stats.xp - current.threshold) / (next.threshold - current.threshold)) * 100
    : 100

  return (
    <Card className="p-6 md:p-8 bg-gradient-to-br from-card to-primary/5 border-border shadow-sm rounded-[32px] hover:shadow-md transition-all duration-300 group">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shadow-inner border border-primary/20 group-hover:scale-110 transition-transform duration-500">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
              Nível Atual
            </h3>
            <p className="text-3xl font-extrabold text-foreground tracking-tight">{current.name}</p>
          </div>
        </div>

        <div className="md:text-right flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center">
          <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary to-pink-500 flex items-center gap-1.5 tracking-tighter">
            {stats.xp} <Zap className="w-6 h-6 text-pink-500 fill-current" />
          </p>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">
            XP Total
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <Progress
          value={progress}
          className="h-4 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-pink-500 shadow-inner"
        />
        <div className="flex justify-between text-sm font-bold text-muted-foreground">
          <span>Progresso de Nível</span>
          {next ? (
            <span>
              {next.threshold - stats.xp} XP para {next.name}
            </span>
          ) : (
            <span>Nível Máximo!</span>
          )}
        </div>
      </div>
    </Card>
  )
}
