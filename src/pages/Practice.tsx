import { useState, useMemo, useEffect } from 'react'
import { useStore } from '@/store/main'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Zap, ArrowRight, CheckCircle2, XCircle, Loader2, BrainCircuit } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { usePracticeEngine } from '@/hooks/use-practice-engine'
import { PracticeEmpty } from '@/components/practice-empty'
import { calculateSM2 } from '@/lib/sm2'

export default function Practice() {
  const { words, reviewWord, settings, recordPracticeAttempt } = useStore()
  const { toast } = useToast()

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
    const currentTotal = queue.length + reviewedIds.size
    if (currentTotal > initialQueueSize) {
      setInitialQueueSize(currentTotal)
    }
  }, [queue.length, reviewedIds.size, initialQueueSize])

  const { practiceData, isLoading, shuffledBlocks } = usePracticeEngine(currentWord, settings)

  const [selectedIndices, setSelectedIndices] = useState<number[]>([])
  const [attempts, setAttempts] = useState(0)
  const [status, setStatus] = useState<'idle' | 'checking' | 'correct' | 'incorrect'>('idle')
  const [feedback, setFeedback] = useState<boolean[]>([])
  const [draggedId, setDraggedId] = useState<number | null>(null)
  const [dragTarget, setDragTarget] = useState<number | null>(null)

  useEffect(() => {
    if (currentWord) {
      setSelectedIndices([])
      setAttempts(0)
      setStatus('idle')
      setFeedback([])
      setDraggedId(null)
      setDragTarget(null)
    }
  }, [currentWord?.id])

  const handleBlockClick = (id: number) => {
    if (status !== 'idle' && status !== 'checking') return
    if (selectedIndices.includes(id)) setSelectedIndices((prev) => prev.filter((x) => x !== id))
    else setSelectedIndices((prev) => [...prev, id])
    if (status === 'checking') setStatus('idle')
  }

  const checkAnswer = () => {
    if (!practiceData) return
    const targetWords = practiceData.en.split(' ').filter(Boolean)
    if (selectedIndices.length !== targetWords.length) {
      toast({
        title: 'Faltam blocos',
        description: 'Utilize todas as palavras.',
        variant: 'destructive',
      })
      return
    }

    let isCorrect = true
    const newFeedback = selectedIndices.map((id, i) => {
      const text = shuffledBlocks.find((b) => b.id === id)!.text
      const correct =
        text.toLowerCase().replace(/[.,!?]/g, '') ===
        targetWords[i].toLowerCase().replace(/[.,!?]/g, '')
      if (!correct) isCorrect = false
      return correct
    })

    setFeedback(newFeedback)
    if (isCorrect) {
      setStatus('correct')
      recordPracticeAttempt(true)
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      if (newAttempts >= 3) {
        setStatus('incorrect')
        recordPracticeAttempt(false)
      } else {
        setStatus('checking')
        setTimeout(() => {
          setStatus('idle')
          setFeedback([])
        }, 1500)
      }
    }
  }

  const handleRate = (quality: number) => {
    if (!currentWord) return
    reviewWord(currentWord.id, quality)
    setReviewedIds((prev) => {
      const next = new Set(prev)
      next.add(currentWord.id)
      return next
    })
  }

  const getPredictedInterval = (quality: number) => {
    if (!currentWord) return 0
    const { interval } = calculateSM2(
      quality,
      currentWord.repetitions,
      currentWord.interval,
      currentWord.easeFactor,
      settings.srsMultiplier,
    )
    return interval
  }

  const formatInterval = (days: number) => {
    if (days === 0) return '<1d'
    if (days < 30) return `${days}d`
    if (days < 365) return `${Math.round(days / 30)}m`
    return `${Math.round(days / 365)}a`
  }

  const onDragStart = (e: React.DragEvent, id: number) => {
    if (status === 'correct' || status === 'incorrect') {
      e.preventDefault()
      return
    }
    setDraggedId(id)
    e.dataTransfer.setData('text/plain', id.toString())
  }

  const onDropBlock = (e: React.DragEvent, targetId: number) => {
    e.preventDefault()
    e.stopPropagation()
    setDragTarget(null)
    if (draggedId === null || draggedId === targetId) return
    const isDragSel = selectedIndices.includes(draggedId)
    const isTargetSel = selectedIndices.includes(targetId)
    const newInd = [...selectedIndices]

    if (isDragSel && isTargetSel) {
      newInd.splice(newInd.indexOf(draggedId), 1)
      newInd.splice(newInd.indexOf(targetId), 0, draggedId)
    } else if (!isDragSel && isTargetSel) {
      newInd.splice(newInd.indexOf(targetId), 0, draggedId)
    }
    setSelectedIndices(newInd)
    setDraggedId(null)
  }

  const getBlockClass = (id: number, inZone: boolean, i?: number) => {
    let base =
      'px-5 py-3 rounded-xl font-bold text-lg border-2 transition-all cursor-pointer select-none active:scale-95'
    if (inZone) {
      if (status === 'checking')
        base = cn(
          base,
          feedback[i!]
            ? 'bg-success text-success-foreground border-success'
            : 'bg-destructive text-destructive-foreground border-destructive',
        )
      else if (status === 'correct')
        base = cn(base, 'bg-success text-success-foreground border-success')
      else if (status === 'incorrect')
        base = cn(base, 'bg-destructive/10 text-destructive border-destructive/30')
      else base = cn(base, 'bg-background border-border text-foreground hover:bg-secondary')
      if (dragTarget === id) base = cn(base, 'ring-2 ring-primary ring-offset-2 border-primary')
    } else {
      if (selectedIndices.includes(id))
        base = cn(
          base,
          'bg-secondary/50 text-transparent border-transparent shadow-none scale-95 pointer-events-none',
        )
      else
        base = cn(
          base,
          'bg-card border-border hover:bg-secondary text-foreground hover:-translate-y-1 shadow-sm hover:shadow-md',
        )
    }
    return cn(base, draggedId === id && 'opacity-50')
  }

  if (!queue.length) return <PracticeEmpty />

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto h-full flex flex-col pt-4">
      <header className="flex justify-between items-end mb-4">
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
          <p className="text-muted-foreground mt-2 text-lg flex items-center gap-2">
            {currentWord.status === 'srs' ? (
              <>
                <span className="bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border border-orange-500/20">
                  Revisão
                </span>
                Relembre como formar esta frase.
              </>
            ) : (
              <>
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border border-primary/20">
                  Novo
                </span>
                Arraste os blocos para montar a frase.
              </>
            )}
          </p>
        </div>
        <div className="text-sm font-medium bg-card px-4 py-2 rounded-full border border-border shadow-sm text-foreground">
          {reviewedIds.size + 1} de {Math.max(initialQueueSize, 1)}
        </div>
      </header>

      <Card className="flex-1 p-8 md:p-12 flex flex-col border-2 border-border/50 shadow-sm bg-card/80 backdrop-blur-sm relative overflow-hidden">
        {isLoading || !practiceData ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground font-medium text-lg animate-pulse">
              Gerando exercício ideal com IA...
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full z-10">
            <div className="mb-8 text-center">
              <span
                className={cn(
                  'px-4 py-1.5 rounded-full font-bold text-sm border uppercase tracking-wider inline-block mb-6',
                  currentWord.status === 'srs'
                    ? 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                    : 'bg-primary/10 text-primary border-primary/20',
                )}
              >
                {currentWord.status === 'srs' ? 'Revisão da Frase' : 'Construa a frase'}
              </span>
              <p className="text-3xl md:text-4xl font-medium text-foreground leading-tight">
                {practiceData.pt}
              </p>
            </div>

            <div className="flex-1 flex flex-col justify-end space-y-6">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragTarget(null)
                  if (draggedId !== null && !selectedIndices.includes(draggedId))
                    setSelectedIndices([...selectedIndices, draggedId])
                  setDraggedId(null)
                }}
                className={cn(
                  'min-h-[100px] p-6 rounded-3xl border-2 flex flex-wrap gap-3 items-center transition-colors',
                  selectedIndices.length === 0
                    ? 'border-dashed border-border/80 bg-secondary/20'
                    : 'border-solid border-primary/30 bg-primary/5',
                )}
              >
                {selectedIndices.length === 0 && (
                  <span className="text-muted-foreground/60 italic px-2 font-medium w-full text-center">
                    Arraste ou clique nos blocos abaixo para inseri-los aqui...
                  </span>
                )}
                {selectedIndices.map((id, i) => (
                  <button
                    key={id}
                    draggable
                    onDragStart={(e) => onDragStart(e, id)}
                    onDragOver={(e) => {
                      e.preventDefault()
                      if (draggedId !== id) setDragTarget(id)
                    }}
                    onDragLeave={() => setDragTarget(null)}
                    onDrop={(e) => onDropBlock(e, id)}
                    onClick={() => handleBlockClick(id)}
                    className={getBlockClass(id, true, i)}
                  >
                    {shuffledBlocks.find((b) => b.id === id)?.text}
                  </button>
                ))}
              </div>

              {status === 'incorrect' && (
                <div className="text-destructive flex items-start gap-4 bg-destructive/10 border border-destructive/20 p-5 rounded-2xl animate-fade-in-up">
                  <XCircle className="w-6 h-6 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-lg">Tentativas esgotadas</p>
                    <p className="text-base opacity-90">
                      A frase correta era:{' '}
                      <strong className="font-semibold">{practiceData.en}</strong>
                    </p>
                  </div>
                </div>
              )}
              {status === 'correct' && (
                <div className="text-success-foreground flex items-center gap-4 bg-success/10 border border-success/20 p-5 rounded-2xl animate-fade-in-up">
                  <CheckCircle2 className="w-7 h-7 shrink-0 text-success" />
                  <span className="font-bold text-lg text-success">
                    Excelente! Construção perfeita.
                  </span>
                </div>
              )}

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragTarget(null)
                  if (draggedId !== null && selectedIndices.includes(draggedId))
                    setSelectedIndices((prev) => prev.filter((id) => id !== draggedId))
                  setDraggedId(null)
                }}
                className="flex flex-wrap justify-center gap-3 py-6 min-h-[100px]"
              >
                {shuffledBlocks.map((block) => (
                  <button
                    key={block.id}
                    draggable={!selectedIndices.includes(block.id)}
                    onDragStart={(e) => onDragStart(e, block.id)}
                    onClick={() => handleBlockClick(block.id)}
                    disabled={
                      selectedIndices.includes(block.id) ||
                      status === 'correct' ||
                      status === 'incorrect'
                    }
                    className={getBlockClass(block.id, false)}
                  >
                    {block.text}
                  </button>
                ))}
              </div>

              <div className="pt-4 border-t border-border mt-auto">
                {status === 'correct' ? (
                  <div className="flex flex-col gap-3 w-full animate-fade-in pt-2">
                    <p className="text-center text-sm text-muted-foreground font-medium mb-1">
                      Avalie sua facilidade de lembrar:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
                      <Button
                        onClick={() => handleRate(1)}
                        variant="outline"
                        className="h-16 flex-col gap-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all"
                      >
                        <span className="font-bold text-base">Errei</span>
                        <span className="text-xs opacity-80 font-medium">
                          {formatInterval(getPredictedInterval(1))}
                        </span>
                      </Button>
                      <Button
                        onClick={() => handleRate(3)}
                        variant="outline"
                        className="h-16 flex-col gap-1 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white transition-all"
                      >
                        <span className="font-bold text-base">Difícil</span>
                        <span className="text-xs opacity-80 font-medium">
                          {formatInterval(getPredictedInterval(3))}
                        </span>
                      </Button>
                      <Button
                        onClick={() => handleRate(4)}
                        variant="outline"
                        className="h-16 flex-col gap-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                      >
                        <span className="font-bold text-base">Bom</span>
                        <span className="text-xs opacity-80 font-medium">
                          {formatInterval(getPredictedInterval(4))}
                        </span>
                      </Button>
                      <Button
                        onClick={() => handleRate(5)}
                        variant="outline"
                        className="h-16 flex-col gap-1 border-success text-success hover:bg-success hover:text-success-foreground transition-all"
                      >
                        <span className="font-bold text-base">Fácil</span>
                        <span className="text-xs opacity-80 font-medium">
                          {formatInterval(getPredictedInterval(5))}
                        </span>
                      </Button>
                    </div>
                  </div>
                ) : status === 'incorrect' ? (
                  <Button
                    onClick={() => handleRate(1)}
                    size="lg"
                    className="w-full h-16 text-lg rounded-2xl shadow-md bg-primary hover:bg-primary/90 text-primary-foreground animate-fade-in"
                  >
                    Continuar <ArrowRight className="w-6 h-6 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={checkAnswer}
                    size="lg"
                    className="w-full h-16 text-lg rounded-2xl shadow-md"
                    disabled={selectedIndices.length === 0}
                  >
                    Verificar Resposta
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
