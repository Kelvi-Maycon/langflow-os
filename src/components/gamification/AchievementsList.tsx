import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useStore } from '@/store/main'
import { Star, Flame, Brain, BookOpen, Trophy, Zap, Lock, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useShareProgress } from '@/hooks/use-share-progress'

const iconMap: Record<string, any> = {
  star: Star,
  flame: Flame,
  brain: Brain,
  book: BookOpen,
  zap: Zap,
  trophy: Trophy,
}

export function AchievementsList() {
  const { stats } = useStore()
  const { share } = useShareProgress()
  const achievements = stats.achievements || []
  const unlockedCount = achievements.filter((a) => a.unlocked).length

  return (
    <section className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-2xl font-bold text-foreground tracking-tight">Conquistas & Emblemas</h3>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => share()}
            className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all"
          >
            <Share2 className="w-4 h-4 mr-2" />
            <span className="font-bold">Compartilhar</span>
          </Button>
          <span className="bg-secondary text-foreground font-bold text-sm px-4 py-2 rounded-full border border-border/60 shadow-sm hidden md:inline-block">
            {unlockedCount} / {achievements.length} Desbloqueados
          </span>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <TooltipProvider>
          {achievements.map((ach) => {
            const Icon = iconMap[ach.icon] || Trophy
            const isUnlocked = ach.unlocked
            return (
              <Tooltip key={ach.id} delayDuration={300}>
                <TooltipTrigger asChild>
                  <Card
                    className={cn(
                      'p-5 flex flex-col items-center text-center gap-4 transition-all duration-300 rounded-[24px]',
                      isUnlocked
                        ? 'bg-card border-primary/30 shadow-sm hover:-translate-y-1 hover:shadow-md cursor-pointer'
                        : 'bg-secondary/30 border-dashed opacity-60 grayscale hover:opacity-80 hover:grayscale-0 cursor-help',
                    )}
                  >
                    <div
                      className={cn(
                        'w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-500 shadow-sm',
                        isUnlocked
                          ? 'bg-primary/20 border border-primary/20'
                          : 'bg-muted border border-border',
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-8 h-8',
                          isUnlocked ? 'text-primary' : 'text-muted-foreground',
                        )}
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-[15px] leading-tight text-foreground">
                        {ach.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                        {ach.description}
                      </p>
                    </div>
                  </Card>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="text-center p-3 max-w-[200px] bg-popover text-popover-foreground border border-border shadow-lg"
                >
                  <p className="font-bold text-sm mb-1">{ach.title}</p>
                  <p className="text-xs text-muted-foreground">{ach.description}</p>
                  {!isUnlocked && (
                    <div className="mt-3 bg-secondary rounded-full px-3 py-1.5 text-[10px] font-bold text-foreground flex items-center justify-center gap-1.5 w-fit mx-auto border border-border/50">
                      STATUS: BLOQUEADO <Lock className="w-3 h-3 opacity-60" />
                    </div>
                  )}
                  {isUnlocked && (
                    <div className="mt-3 bg-primary/10 text-primary rounded-full px-3 py-1.5 text-[10px] font-bold flex items-center justify-center gap-1.5 w-fit mx-auto border border-primary/20">
                      <Star className="w-3 h-3 fill-current" /> DESBLOQUEADO
                    </div>
                  )}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </TooltipProvider>
      </div>
    </section>
  )
}
