import { useState, useMemo, useEffect } from 'react'
import { useStore } from '@/store/main'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Zap, ArrowRight, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { usePracticeEngine } from '@/hooks/use-practice-engine'
import { PracticeEmpty } from '@/components/practice-empty'

export default function Practice() {
  const { words, updateWordStatus, settings, recordPracticeAttempt } = useStore()
  const { toast } = useToast()

  const builderWords = useMemo(() => words.filter((w) => w.status === 'builder'), [words])
  const [currentIndex, setCurrentIndex] = useState(0)
  const currentWord = builderWords[currentIndex]

  const { practiceData, isLoading, shuffledBlocks } = usePracticeEngine(currentWord, settings)

  const [selectedIndices, setSelectedIndices] = useState<number[]>([])
  const [attempts, setAttempts] = useState(0)
  const [status, setStatus] = useState<'idle' | 'checking' | 'correct' | 'incorrect'>('idle')
  const [feedback, setFeedback] = useState<boolean[]>([])
  const [draggedId, setDraggedId] = useState<number | null>(null)
  const [dragTarget, setDragTarget] = useState<number | null>(null)

  useEffect(() => {
    setSelectedIndices([])
    setAttempts(0)
    setStatus('idle')
    setFeedback([])
    setDraggedId(null)
    setDragTarget(null)
  }, [currentWord])

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

  const handleNext = () => {
    if (status === 'correct' || status === 'incorrect') updateWordStatus(currentWord.id, 'srs')
    if (currentIndex >= builderWords.length - 1) setCurrentIndex(0)
  }

  const onDragStart = (e: React.DragEvent, id: number) => {
    if (status === 'correct' || status === 'incorrect') return e.preventDefault()
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

  if (!builderWords.length) return <PracticeEmpty />

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto h-full flex flex-col pt-4">
      <header className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Zap className="w-8 h-8 text-primary" /> Sentence Builder
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Arraste os blocos para montar a frase.
          </p>
        </div>
        <div className="text-sm font-medium bg-card px-4 py-2 rounded-full border border-border shadow-sm text-foreground">
          {currentIndex + 1} de {builderWords.length}
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
              <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full font-bold text-sm border border-primary/20 uppercase tracking-wider inline-block mb-6">
                Construa a frase
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
                {status === 'correct' || status === 'incorrect' ? (
                  <Button
                    onClick={handleNext}
                    size="lg"
                    className={cn(
                      'w-full h-16 text-lg rounded-2xl group shadow-md animate-fade-in',
                      status === 'correct'
                        ? 'bg-success hover:bg-success/90 text-success-foreground'
                        : 'bg-primary hover:bg-primary/90 text-primary-foreground',
                    )}
                  >
                    {currentIndex < builderWords.length - 1 ? 'Próxima Palavra' : 'Concluir Sessão'}{' '}
                    <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
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
