import { useStore } from '@/store/main'
import { EmptyState } from '@/components/ui/empty-state'
import { Activity, TrendingUp, Brain, Target, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

export default function Evolution() {
  const { stats } = useStore()
  const navigate = useNavigate()

  const history = stats.activityHistory || []
  const hasActivity = history.some((h) => h.count > 0)

  return (
    <div className="space-y-8 animate-fade-in-up max-w-5xl mx-auto pb-12 pt-4">
      <header>
        <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <TrendingUp className="w-10 h-10 text-primary" />
          Evolução e Histórico
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Acompanhe seu progresso, histórico de atividades e estatísticas.
        </p>
      </header>

      {!hasActivity ? (
        <EmptyState
          icon={<Activity className="w-12 h-12" />}
          title="Sem histórico de atividades"
          description="Você ainda não completou nenhuma sessão de prática. Comece a estudar para gerar gráficos de evolução e acompanhar suas métricas detalhadas."
          action={
            <Button onClick={() => navigate('/practice')} className="rounded-full px-8">
              Começar a Praticar
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-background to-secondary/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Total de Práticas
                </CardTitle>
                <Target className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-foreground">{stats.practiceAttempts}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.practiceCorrect} acertos (
                  {stats.practiceAttempts > 0
                    ? Math.round((stats.practiceCorrect / stats.practiceAttempts) * 100)
                    : 0}
                  %)
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-background to-secondary/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Flashcards Revisados
                </CardTitle>
                <Brain className="w-4 h-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-foreground">{stats.flashcardAttempts}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.flashcardCorrect} acertos (
                  {stats.flashcardAttempts > 0
                    ? Math.round((stats.flashcardCorrect / stats.flashcardAttempts) * 100)
                    : 0}
                  %)
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-background to-secondary/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  XP Acumulado
                </CardTitle>
                <Star className="w-4 h-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-foreground">{stats.xp}</div>
                <p className="text-xs text-muted-foreground mt-1">Mantendo o ritmo diário</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border shadow-sm p-8 flex flex-col items-center justify-center min-h-[300px] text-center bg-secondary/10">
            <Activity className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Gráficos em Breve</h3>
            <p className="text-muted-foreground max-w-sm">
              Continue praticando! Suas métricas de consistência visual estarão disponíveis aqui nas
              próximas atualizações.
            </p>
          </Card>
        </div>
      )}
    </div>
  )
}
