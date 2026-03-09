import { useStore } from '@/store/main'
import { Card, CardContent } from '@/components/ui/card'
import { Trophy, Flame, Star } from 'lucide-react'

export function UserProgress() {
  const { stats } = useStore()

  return (
    <Card className="w-full max-w-md bg-gradient-to-br from-primary/10 to-secondary/30 border-primary/20 shadow-sm animate-fade-in-up">
      <CardContent className="p-6 grid grid-cols-3 gap-4 text-center">
        <div className="flex flex-col items-center space-y-2">
          <div className="p-3 bg-orange-500/20 rounded-full">
            <Flame className="w-6 h-6 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.streak}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            Ofensiva
          </p>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <div className="p-3 bg-yellow-500/20 rounded-full">
            <Star className="w-6 h-6 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.xp}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            XP Total
          </p>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <div className="p-3 bg-blue-500/20 rounded-full">
            <Trophy className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.practiceCorrect}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            Acertos
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
