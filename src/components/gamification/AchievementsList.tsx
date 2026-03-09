import { Card } from '@/components/ui/card'
import { useStore } from '@/store/main'
import { Star, Flame, Brain, BookOpen, Trophy, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  const achievements = stats.achievements || []
  const unlockedCount = achievements.filter((a) => a.unlocked).length

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-foreground tracking-tight">Conquistas & Emblemas</h3>
        <span className="bg-secondary text-foreground font-bold text-sm px-4 py-1.5 rounded-full border border-border/60 shadow-sm">
          {unlockedCount} / {achievements.length} Desbloqueados
        </span>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {achievements.map((ach) => {
          const Icon = iconMap[ach.icon] || Trophy
          return (
            <Card
              key={ach.id}
              className={cn(
                'p-5 flex flex-col items-center text-center gap-4 transition-all duration-300 rounded-[24px]',
                ach.unlocked
                  ? 'bg-card border-primary/30 shadow-sm hover:-translate-y-1 hover:shadow-md cursor-pointer'
                  : 'bg-secondary/30 border-dashed opacity-60 grayscale',
              )}
            >
              <div
                className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-500 shadow-sm',
                  ach.unlocked
                    ? 'bg-primary/20 border border-primary/20'
                    : 'bg-muted border border-border',
                )}
              >
                <Icon
                  className={cn('w-8 h-8', ach.unlocked ? 'text-primary' : 'text-muted-foreground')}
                />
              </div>
              <div>
                <h4 className="font-bold text-[15px] leading-tight text-foreground">{ach.title}</h4>
                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                  {ach.description}
                </p>
              </div>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
