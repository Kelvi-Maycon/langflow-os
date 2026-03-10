import { useState, useMemo, useEffect, useRef } from 'react'
import { useStore } from '@/store/main'
import useCardStore from '@/stores/useCardStore'
import { Card } from '@/components/ui/card'
import { BrainCircuit, Loader2, Zap, TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { usePracticeEngine } from '@/hooks/use-practice-engine'
import { PracticeEmpty } from '@/components/practice-empty'
import { PracticeContent } from '@/components/practice/PracticeContent'
import { useToast } from '@/hooks/use-toast'

export default function Practice() {
  const { words, settings, stats } = useStore()
  const { cards } = useCardStore()
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set())
  const { toast } = useToast()
  const prevLevelRef = useRef(settings.level)

  useEffect(() => {
    if (prevLevelRef.current && prevLevelRef.current !== settings.level) {
      const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
      const oldIdx = levels.indexOf(prevLevelRef.current as any)
      const newIdx = levels.indexOf(settings.level as any)

      if (newIdx > oldIdx) {
        toast({
          title: 'Nível Aumentado! 🚀',
          description: `Seu nível subiu para ${settings.level}. Os próximos exercícios serão mais desafiadores.`,
          className: 'bg-success text-success-foreground border-success',
        })
      } else if (newIdx < oldIdx) {
        toast({
          title: 'Nível Ajustado 📉',
          description: `Seu nível foi ajustado para ${settings.level} para melhor fixação.`,
          className: 'bg-primary text-primary-foreground border-primary',
        })
      }
      prevLevelRef.current = settings.level
    }
  }, [settings.level, toast])

  const queue = useMemo(() => {
    const now = Date.now()
    const reviews = cards
      .filter((c) => c.nextReviewDate <= now && !reviewedIds.has(c.id))
      .map((c) => ({ ...c, isCard: true }))

    const builders = words
      .filter((w) => w.status === 'builder' && !reviewedIds.has(w.id))
      .map((w) => ({ ...w, isCard: false }))

    return [...reviews.sort((a, b) => a.nextReviewDate - b.nextReviewDate), ...builders]
  }, [words, cards, reviewedIds])

  const currentItem = queue[0]

  const [initialQueueSize, setInitialQueueSize] = useState(0)
  useEffect(() => {
    const total = queue.length + reviewedIds.size
    if (total > initialQueueSize) setInitialQueueSize(total)
  }, [queue.length, reviewedIds.size])

  const { practiceData, isLoading, shuffledBlocks, exerciseType } = usePracticeEngine(
    currentItem,
    settings,
  )

  if (!queue.length) return <PracticeEmpty />

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col pt-4">
      <header className="flex justify-between items-start mb-2 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            {currentItem.isCard ? (
              <>
                <BrainCircuit className="w-8 h-8 text-orange-500" /> Revisão Espaçada
              </>
            ) : (
              <>
                <Zap className="w-8 h-8 text-primary" /> Sentence Builder
              </>
            )}
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-secondary text-secondary-foreground border">
              <Activity className="w-3.5 h-3.5" />
              Nível: {settings.level}
            </span>

            <div
              className="flex items-center gap-1 text-xs text-muted-foreground font-medium"
              title="Desempenho recente"
            >
              {stats.consecutiveCorrect ? (
                <span className="flex items-center gap-1 text-success">
                  <TrendingUp className="w-3.5 h-3.5" /> +{stats.consecutiveCorrect}
                </span>
              ) : stats.consecutiveIncorrect ? (
                <span className="flex items-center gap-1 text-destructive">
                  <TrendingDown className="w-3.5 h-3.5" /> -{stats.consecutiveIncorrect}
                </span>
              ) : null}
            </div>
          </div>
        </div>
        <div className="text-sm font-medium bg-card px-4 py-2 rounded-full border shadow-sm mt-1">
          {reviewedIds.size + 1} de {Math.max(initialQueueSize, 1)}
        </div>
      </header>

      <Card className="flex-1 p-6 md:p-10 flex flex-col border-2 shadow-sm bg-card/80 backdrop-blur-sm relative overflow-hidden min-h-0">
        {isLoading || !practiceData ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground font-medium animate-pulse">
              Gerando exercício ideal com IA...
            </p>
          </div>
        ) : (
          <PracticeContent
            currentItem={currentItem}
            practiceData={practiceData}
            shuffledBlocks={shuffledBlocks}
            exerciseType={exerciseType}
            onNext={(id) => setReviewedIds(new Set(reviewedIds).add(id))}
          />
        )}
      </Card>
    </div>
  )
}
