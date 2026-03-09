import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { useStore } from '@/store/main'
import { Shield, Zap, Share2 } from 'lucide-react'
import { getLevelTier } from '@/lib/gamification'
import { useShareProgress } from '@/hooks/use-share-progress'

export function LevelProgressWidget() {
  const { stats } = useStore()
  const { current, next } = getLevelTier(stats.xp)
  const { share } = useShareProgress()

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

        <div className="flex flex-row items-center justify-between w-full md:w-auto gap-4 md:gap-8">
          <Button
            onClick={() => share()}
            variant="outline"
            className="rounded-lg text-primary border-primary/30 bg-primary/5 hover:bg-primary/10 shadow-sm transition-all h-10"
          >
            <Share2 className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline font-bold">Compartilhar</span>
          </Button>

          <div className="flex flex-col items-end">
            <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary to-pink-500 flex items-center gap-1.5 tracking-tighter">
              {stats.xp} <Zap className="w-6 h-6 text-pink-500 fill-current" />
            </p>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">
              XP Total
            </p>
          </div>
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
