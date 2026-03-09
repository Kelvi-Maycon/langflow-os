import { useStore } from '@/store/main'
import { useToast } from '@/hooks/use-toast'
import { TrendingUp, Download, BookOpen, Zap, BrainCircuit, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EvolutionActivityChart } from '@/components/evolution/EvolutionActivityChart'
import { SkillsRadarChart } from '@/components/evolution/SkillsRadarChart'
import { VocabFunnelChart } from '@/components/evolution/VocabFunnelChart'
import { MilestonesTimeline } from '@/components/evolution/MilestonesTimeline'

export default function Evolution() {
  const { stats, words, settings } = useStore()
  const { toast } = useToast()

  const retentionRate = stats.flashcardAttempts
    ? Math.round((stats.flashcardCorrect / stats.flashcardAttempts) * 100)
    : 0

  const handleExport = () => {
    const reportText = `
RELATÓRIO DE EVOLUÇÃO LANGFLOW
Data: ${new Date().toLocaleDateString('pt-BR')}

--- VISÃO GERAL ---
Nível Atual: ${settings.level}
XP Total: ${stats.xp} XP
Ofensiva Atual: ${stats.streak} dias
Taxa de Retenção (Revisões): ${retentionRate}%

--- VOCABULÁRIO (${words.length} palavras) ---
- Em Aprendizado: ${words.filter((w) => w.status === 'learning').length}
- Construção de Frases: ${words.filter((w) => w.status === 'builder').length}
- Em Revisão Espaçada: ${words.filter((w) => w.status === 'srs').length}
- Totalmente Dominadas: ${words.filter((w) => w.status === 'mastered' || w.interval > 21).length}

--- CONQUISTAS ALCANÇADAS ---
${
  stats.achievements
    .filter((a) => a.unlocked)
    .map(
      (a) => `- ${a.title} (${new Date(a.unlockedAt || Date.now()).toLocaleDateString('pt-BR')})`,
    )
    .join('\n') || 'Nenhuma conquista registrada ainda.'
}

Continue praticando para alcançar a fluência plena!
    `.trim()

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `langflow-relatorio-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: 'Relatório Exportado!',
      description: 'Seu resumo de evolução foi salvo com sucesso.',
      className: 'bg-success text-success-foreground border-success',
    })
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12 pt-2">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-2xl text-primary border border-primary/20 shadow-sm">
              <TrendingUp className="w-8 h-8" />
            </div>
            Dashboard de Evolução
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Visualize seu progresso, histórico de vocabulário e crescimento geral.
          </p>
        </div>

        <Button
          onClick={handleExport}
          size="lg"
          className="gap-2 rounded-full shadow-md font-bold h-12 px-6"
        >
          <Download className="w-5 h-5" /> Exportar Relatório
        </Button>
      </header>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-card border-border shadow-sm flex items-center gap-4 rounded-[20px] hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-wider text-muted-foreground mb-0.5">
              PALAVRAS
            </p>
            <p className="text-2xl font-black text-foreground">{words.length}</p>
          </div>
        </Card>

        <Card className="p-5 bg-card border-border shadow-sm flex items-center gap-4 rounded-[20px] hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 text-pink-500" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-wider text-muted-foreground mb-0.5">
              EXPERIÊNCIA
            </p>
            <p className="text-2xl font-black text-foreground">{stats.xp} XP</p>
          </div>
        </Card>

        <Card className="p-5 bg-card border-border shadow-sm flex items-center gap-4 rounded-[20px] hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
            <BrainCircuit className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-wider text-muted-foreground mb-0.5">
              RETENÇÃO
            </p>
            <p className="text-2xl font-black text-foreground">{retentionRate}%</p>
          </div>
        </Card>

        <Card className="p-5 bg-card border-border shadow-sm flex items-center gap-4 rounded-[20px] hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-success" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-wider text-muted-foreground mb-0.5">
              NÍVEL CEFR
            </p>
            <p className="text-2xl font-black text-foreground">{settings.level}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <EvolutionActivityChart />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SkillsRadarChart />
            <VocabFunnelChart />
          </div>
        </div>

        <div className="lg:col-span-1">
          <MilestonesTimeline />
        </div>
      </div>
    </div>
  )
}
