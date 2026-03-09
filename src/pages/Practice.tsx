import { useState, useMemo, useEffect } from 'react'
import { useStore } from '@/store/main'
import { Card } from '@/components/ui/card'
import { BrainCircuit, Loader2, Zap } from 'lucide-react'
import { usePracticeEngine } from '@/hooks/use-practice-engine'
import { PracticeEmpty } from '@/components/practice-empty'
import { PracticeContent } from '@/components/practice/PracticeContent'

export default function Practice() {
  const { words, settings } = useStore()
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set())

  const queue = useMemo(() => {
    const now = Date.now()
    const reviews = words.filter(
      (w) => w.status === 'srs' && w.nextReviewDate <= now && !reviewedIds.has(w.id),
    )
    const builders = words.filter((w) => w.status === 'builder' && !reviewedIds.has(w.id))
    return [...reviews.sort((a, b) => a.nextReviewDate - b.nextReviewDate), ...builders]
  }, [words, reviewedIds])

  const currentWord = queue[0]

  const [initialQueueSize, setInitialQueueSize] = useState(0)
  useEffect(() => {
    const total = queue.length + reviewedIds.size
    if (total > initialQueueSize) setInitialQueueSize(total)
  }, [queue.length, reviewedIds.size])

  const { practiceData, isLoading, shuffledBlocks, exerciseType } = usePracticeEngine(
    currentWord,
    settings,
  )

  if (!queue.length) return <PracticeEmpty />

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col pt-4">
      <header className="flex justify-between items-end mb-2 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            {currentWord.status === 'srs' ? (
              <>
                <BrainCircuit className="w-8 h-8 text-orange-500" /> Revisão Espaçada
              </>
            ) : (
              <>
                <Zap className="w-8 h-8 text-primary" /> Sentence Builder
              </>
            )}
          </h1>
        </div>
        <div className="text-sm font-medium bg-card px-4 py-2 rounded-full border shadow-sm">
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
            currentWord={currentWord}
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
