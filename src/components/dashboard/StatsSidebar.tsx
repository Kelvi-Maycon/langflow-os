import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Trophy, BookOpen, Zap, BrainCircuit } from 'lucide-react'
import { WeeklyChart } from './WeeklyChart'
import { useToast } from '@/hooks/use-toast'
import { useStore } from '@/store/main'

export function StatsSidebar() {
  const { toast } = useToast()
  const { words, stats } = useStore()

  const totalWords = words.length
  const goal = 3000
  const progress = Math.min((totalWords / goal) * 100, 100)

  const practiceAccuracy =
    stats.practiceAttempts > 0
      ? Math.round((stats.practiceCorrect / stats.practiceAttempts) * 100)
      : 0

  const flashcardAccuracy =
    stats.flashcardAttempts > 0
      ? Math.round((stats.flashcardCorrect / stats.flashcardAttempts) * 100)
      : 0

  return (
    <div className="space-y-6">
      {/* Próxima Conquista */}
      <Card
        onClick={() =>
          toast({
            title: 'Detalhes da Conquista',
            description: `Aprenda mais ${goal - totalWords} palavras para alcançar a classe Poliglota Jr.`,
          })
        }
        className="p-8 bg-card border-border shadow-sm hover:shadow-md transition-all duration-300 ease-out hover:-translate-y-1 active:scale-[0.98] cursor-pointer rounded-[32px] flex flex-col items-center text-center group"
      >
        <span className="text-xs font-bold tracking-widest text-muted-foreground mb-8">
          PRÓXIMA CONQUISTA
        </span>

        <div className="relative mb-6">
          <div className="absolute inset-0 bg-warning/20 blur-xl rounded-full group-hover:bg-warning/30 transition-colors duration-500" />
          <div className="w-24 h-24 rounded-full border-[4px] border-warning/20 border-t-warning flex items-center justify-center relative bg-card shadow-sm rotate-45 group-hover:rotate-[225deg] transition-transform duration-1000 ease-out">
            <div className="-rotate-45 group-hover:-rotate-[225deg] transition-transform duration-1000 ease-out">
              <Trophy className="w-10 h-10 text-warning" />
            </div>
          </div>
        </div>

        <h4 className="text-2xl font-bold text-foreground mb-2">Poliglota Jr.</h4>
        <p className="text-sm text-muted-foreground mb-8">
          Complete {goal.toLocaleString('pt-BR')} palavras para desbloquear
        </p>

        <div className="w-full space-y-2">
          <Progress
            value={progress}
            className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-pink-500 [&>div]:to-orange-400"
          />
          <div className="flex justify-between text-xs font-bold text-muted-foreground">
            <span>
              {totalWords.toLocaleString('pt-BR')} / {goal.toLocaleString('pt-BR')}
            </span>
            <span className="text-foreground">{Math.round(progress)}%</span>
          </div>
        </div>
      </Card>

      {/* Mini Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card
          onClick={() =>
            toast({
              title: 'Estatísticas',
              description: `Você adicionou ${totalWords} palavras ao seu vocabulário até agora.`,
            })
          }
          className="p-5 bg-card border-border shadow-sm flex flex-col items-center text-center justify-center gap-3 transition-all duration-300 ease-out hover:scale-[1.04] hover:shadow-md active:scale-[0.98] cursor-pointer rounded-[24px]"
        >
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <div className="text-xl font-bold text-foreground">{totalWords}</div>
            <div className="text-[10px] font-bold tracking-wider text-muted-foreground mt-0.5">
              VOCABULÁRIO
            </div>
          </div>
        </Card>

        <Card
          onClick={() =>
            toast({
              title: 'Prática Rápida',
              description: `Você acertou ${stats.practiceCorrect} de ${stats.practiceAttempts} tentativas na prática.`,
            })
          }
          className="p-5 bg-card border-border shadow-sm flex flex-col items-center text-center justify-center gap-3 transition-all duration-300 ease-out hover:scale-[1.04] hover:shadow-md active:scale-[0.98] cursor-pointer rounded-[24px]"
        >
          <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-pink-500" />
          </div>
          <div>
            <div className="text-xl font-bold text-foreground">{practiceAccuracy}%</div>
            <div className="text-[10px] font-bold tracking-wider text-muted-foreground mt-0.5">
              PRECISÃO PRÁTICA
            </div>
          </div>
        </Card>

        {/* Flashcard Stats */}
        <Card
          onClick={() =>
            toast({
              title: 'Revisões Concluídas',
              description: `Você lembrou corretamente de ${stats.flashcardCorrect} cartões em ${stats.flashcardAttempts} revisões.`,
            })
          }
          className="col-span-2 p-5 bg-card border-border shadow-sm flex items-center justify-between gap-3 transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-md active:scale-[0.98] cursor-pointer rounded-[24px]"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-left">
              <div className="text-xl font-bold text-foreground">{flashcardAccuracy}%</div>
              <div className="text-[10px] font-bold tracking-wider text-muted-foreground mt-0.5">
                TAXA DE LEMBRANÇA
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-foreground">{stats.flashcardAttempts}</div>
            <div className="text-[10px] font-bold tracking-wider text-muted-foreground mt-0.5">
              REVISÕES FEITAS
            </div>
          </div>
        </Card>
      </div>

      {/* Chart */}
      <WeeklyChart />
    </div>
  )
}
