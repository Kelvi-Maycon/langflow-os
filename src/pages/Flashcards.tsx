import { useState, useMemo } from 'react'
import { useStore } from '@/store/main'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BrainCircuit, Check, X, Frown, Smile, PartyPopper } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Flashcards() {
  const { words, reviewWord, recordFlashcardAttempt } = useStore()

  const dueCards = useMemo(
    () =>
      words
        .filter((w) => w.status === 'srs' && w.nextReviewDate <= Date.now())
        .sort((a, b) => a.nextReviewDate - b.nextReviewDate),
    [words],
  )

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  const currentCard = dueCards[currentIndex]

  const handleReview = (quality: number) => {
    if (!currentCard) return

    // Register the result in stats: 3, 4, 5 are considered correct/successful
    recordFlashcardAttempt(quality >= 3)

    reviewWord(currentCard.id, quality)
    setIsFlipped(false)
    setCurrentIndex(0)
  }

  if (dueCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in space-y-6">
        <div className="w-32 h-32 bg-success/10 rounded-full flex items-center justify-center mb-2 shadow-sm border border-success/20">
          <PartyPopper className="w-16 h-16 text-success animate-bounce" />
        </div>
        <h2 className="text-4xl font-bold text-foreground tracking-tight">Tudo Feito!</h2>
        <p className="text-muted-foreground max-w-md text-xl">
          Você não tem revisões pendentes para hoje. Excelente trabalho mantendo seu vocabulário
          afiado.
        </p>
      </div>
    )
  }

  const renderSentence = () => {
    if (!currentCard) return null
    // Escape regex characters in the word safely to prevent runtime errors
    const escapedWord = currentCard.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const parts = currentCard.contextSentence.split(new RegExp(`(${escapedWord})`, 'gi'))

    return parts.map((part, i) =>
      part.toLowerCase() === currentCard.word.toLowerCase() ? (
        <span
          key={i}
          className="bg-primary/20 text-primary px-2 py-0.5 rounded-md font-bold shadow-[0_0_10px_rgba(108,63,197,0.1)] border border-primary/20"
        >
          {part}
        </span>
      ) : (
        part
      ),
    )
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-xl mx-auto h-full flex flex-col">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-primary" />
            Revisão
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Pense na tradução e no contexto.</p>
        </div>
        <div className="bg-card px-5 py-2.5 rounded-full text-sm font-bold border border-border shadow-sm text-foreground">
          {dueCards.length} restantes
        </div>
      </header>

      {/* Perspective wrapper for 3D flip effect */}
      <div className="flex-1 perspective-1000 relative min-h-[450px]">
        <div
          className={cn(
            'w-full h-full absolute top-0 left-0 transition-all duration-700 preserve-3d cursor-pointer',
            isFlipped ? 'rotate-y-180' : '',
          )}
          onClick={() => !isFlipped && setIsFlipped(true)}
        >
          {/* Front of card */}
          <Card
            className={cn(
              'w-full h-full absolute top-0 left-0 backface-hidden p-8 flex flex-col items-center justify-center shadow-lg border-border bg-card/90 backdrop-blur-xl',
              isFlipped ? 'pointer-events-none opacity-0' : '',
            )}
          >
            <span className="text-sm font-bold tracking-widest uppercase text-muted-foreground/80 mb-10 bg-secondary px-4 py-2 rounded-full border border-border/50">
              Tradução Alvo
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground capitalize leading-tight font-sans text-center">
              {currentCard.translation}
            </h2>
            <p className="mt-16 text-primary/80 animate-pulse font-medium bg-primary/5 px-6 py-2 rounded-full border border-primary/10">
              Toque para revelar o contexto
            </p>
          </Card>

          {/* Back of card */}
          <Card
            className={cn(
              'w-full h-full absolute top-0 left-0 backface-hidden rotate-y-180 p-8 flex flex-col justify-between shadow-lg border-2 border-primary/20 bg-card',
              !isFlipped ? 'pointer-events-none opacity-0' : '',
            )}
          >
            <div className="text-center flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
              <span className="text-sm font-bold tracking-widest uppercase text-primary mb-6 bg-primary/5 px-4 py-2 rounded-full self-center mx-auto border border-primary/10">
                Inglês
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-8 font-sans">
                {currentCard.word}
              </h2>
              <div className="text-xl md:text-2xl text-foreground/80 italic leading-relaxed bg-secondary/40 p-6 rounded-[20px] border border-border shadow-inner">
                "{renderSentence()}"
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 pointer-events-auto">
              <Button
                variant="outline"
                className="h-14 rounded-full border-destructive/50 hover:bg-destructive hover:text-white transition-all group bg-background"
                onClick={(e) => {
                  e.stopPropagation()
                  handleReview(1)
                }}
              >
                <X className="w-5 h-5 mr-1 group-hover:scale-110 transition-transform" />
                <span className="font-bold">Errei</span>
              </Button>
              <Button
                variant="outline"
                className="h-14 rounded-full border-warning/50 hover:bg-warning hover:text-white transition-all group bg-background"
                onClick={(e) => {
                  e.stopPropagation()
                  handleReview(3)
                }}
              >
                <Frown className="w-5 h-5 mr-1 group-hover:scale-110 transition-transform" />
                <span className="font-bold">Difícil</span>
              </Button>
              <Button
                variant="outline"
                className="h-14 rounded-full border-success/50 hover:bg-success hover:text-white transition-all group bg-background"
                onClick={(e) => {
                  e.stopPropagation()
                  handleReview(4)
                }}
              >
                <Check className="w-5 h-5 mr-1 group-hover:scale-110 transition-transform" />
                <span className="font-bold">Bom</span>
              </Button>
              <Button
                variant="outline"
                className="h-14 rounded-full border-primary/50 hover:bg-primary hover:text-white transition-all group bg-background shadow-[0_0_15px_rgba(108,63,197,0.1)] hover:shadow-[0_0_20px_rgba(108,63,197,0.4)]"
                onClick={(e) => {
                  e.stopPropagation()
                  handleReview(5)
                }}
              >
                <Smile className="w-5 h-5 mr-1 group-hover:scale-110 transition-transform" />
                <span className="font-bold">Fácil</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <style>{`
        .perspective-1000 { perspective: 1200px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  )
}
