import { Card } from '@/components/ui/card'
import { useStore } from '@/store/main'
import { BookOpen, Flame, Trophy, CalendarPlus, Star, Share2 } from 'lucide-react'
import { useMemo } from 'react'
import { useShareProgress } from '@/hooks/use-share-progress'

export function LearningStatsCentral() {
  const { words, stats } = useStore()
  const { share } = useShareProgress()

  const totalWords = words.length
  const streak = stats?.streak || 0
  const masteredWords = words.filter((w) => w.status === 'mastered').length

  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const wordsThisWeek = words.filter((w) => (w.createdAt || Date.now()) > oneWeekAgo).length

  const latestAchievement = useMemo(() => {
    const unlocked = stats?.achievements?.filter((a) => a.unlocked) || []
    if (unlocked.length === 0) return null
    return unlocked.reduce((latest, current) => {
      return (current.unlockedAt || 0) > (latest.unlockedAt || 0) ? current : latest
    }, unlocked[0])
  }, [stats?.achievements])

  return (
    <Card className="p-6 md:p-8 bg-card border-border shadow-sm rounded-[32px] overflow-hidden relative group transition-all duration-300 hover:shadow-md">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/10 transition-colors duration-700" />

      <div className="relative z-10">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-foreground tracking-tight">
              Estatísticas de Aprendizado
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Seu progresso consolidado em tempo real
            </p>
          </div>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col items-center justify-center p-5 bg-blue-500/5 rounded-[24px] border border-blue-500/10 transition-transform duration-300 hover:scale-[1.02] shadow-sm">
            <div className="p-3 bg-blue-500/10 rounded-full mb-3">
              <BookOpen className="w-6 h-6 text-blue-500" />
            </div>
            <span className="text-3xl font-black text-foreground tracking-tighter">
              {totalWords}
            </span>
            <span className="text-[10px] font-bold text-blue-600/80 uppercase tracking-widest mt-1 text-center">
              Palavras Aprendidas
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-5 bg-orange-500/5 rounded-[24px] border border-orange-500/10 transition-transform duration-300 hover:scale-[1.02] shadow-sm">
            <div className="p-3 bg-orange-500/10 rounded-full mb-3">
              <Flame className="w-6 h-6 text-orange-500" />
            </div>
            <span className="text-3xl font-black text-foreground tracking-tighter">{streak}</span>
            <span className="text-[10px] font-bold text-orange-600/80 uppercase tracking-widest mt-1 text-center">
              Dias de Ofensiva
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-5 bg-yellow-500/5 rounded-[24px] border border-yellow-500/10 transition-transform duration-300 hover:scale-[1.02] shadow-sm">
            <div className="p-3 bg-yellow-500/10 rounded-full mb-3">
              <Trophy className="w-6 h-6 text-yellow-500" />
            </div>
            <span className="text-3xl font-black text-foreground tracking-tighter">
              {masteredWords}
            </span>
            <span className="text-[10px] font-bold text-yellow-600/80 uppercase tracking-widest mt-1 text-center">
              Palavras Dominadas
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-5 bg-green-500/5 rounded-[24px] border border-green-500/10 transition-transform duration-300 hover:scale-[1.02] shadow-sm">
            <div className="p-3 bg-green-500/10 rounded-full mb-3">
              <CalendarPlus className="w-6 h-6 text-green-500" />
            </div>
            <span className="text-3xl font-black text-foreground tracking-tighter">
              {wordsThisWeek}
            </span>
            <span className="text-[10px] font-bold text-green-600/80 uppercase tracking-widest mt-1 text-center">
              Adicionadas na Semana
            </span>
          </div>
        </div>

        {latestAchievement && (
          <div className="mt-6 p-4 rounded-[20px] bg-gradient-to-r from-primary/10 via-secondary to-pink-500/5 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-inner animate-fade-in-up">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-card rounded-full border border-border shadow-sm shrink-0">
                <Star className="w-6 h-6 text-primary" fill="currentColor" />
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                  Último Marco Alcançado
                </h4>
                <p className="text-sm font-bold text-foreground">{latestAchievement.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
                  {latestAchievement.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <div className="px-4 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20 whitespace-nowrap flex items-center gap-1.5 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Desbloqueado
              </div>
              <button
                onClick={() =>
                  share(
                    `I just unlocked the ${latestAchievement.title} badge in Langflow! My current streak is ${streak} days. #LangflowLearning`,
                  )
                }
                className="p-2 text-primary bg-card border border-border shadow-sm hover:bg-primary/10 hover:border-primary/30 rounded-lg transition-all active:scale-95"
                title="Compartilhar Conquista"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
