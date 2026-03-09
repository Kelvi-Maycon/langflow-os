import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react'
import { calculateSM2 } from '@/lib/sm2'
import { useStore } from '@/store/main'

interface Props {
  status: string
  currentWord: any
  practiceData: any
  exerciseType: string
  selectedIndicesLength?: number
  textInputLength?: number
  checkAnswer: () => void
  handleRate: (quality: number) => void
}

export function PracticeFooter({
  status,
  currentWord,
  practiceData,
  exerciseType,
  selectedIndicesLength = 0,
  textInputLength = 0,
  checkAnswer,
  handleRate,
}: Props) {
  const { settings } = useStore()

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

  const isBtnDisabled =
    exerciseType === 'builder' ? selectedIndicesLength === 0 : textInputLength === 0

  return (
    <div className="pt-4 border-t border-border mt-auto w-full">
      {status === 'incorrect' && (
        <div className="text-destructive flex items-start gap-4 bg-destructive/10 border border-destructive/20 p-5 rounded-2xl animate-fade-in-up mb-4">
          <XCircle className="w-6 h-6 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-lg">Tentativas esgotadas</p>
            <p className="text-base opacity-90">
              A resposta correta era:{' '}
              <strong className="font-semibold">
                {exerciseType === 'transform'
                  ? practiceData.transformed
                  : exerciseType === 'cloze'
                    ? practiceData.word
                    : practiceData.en}
              </strong>
            </p>
          </div>
        </div>
      )}
      {status === 'correct' && (
        <div className="text-success-foreground flex items-center gap-4 bg-success/10 border border-success/20 p-5 rounded-2xl animate-fade-in-up mb-4">
          <CheckCircle2 className="w-7 h-7 shrink-0 text-success" />
          <span className="font-bold text-lg text-success">Excelente! Construção perfeita.</span>
        </div>
      )}

      {status === 'correct' ? (
        <div className="flex flex-col gap-3 w-full animate-fade-in pt-2">
          <p className="text-center text-sm text-muted-foreground font-medium mb-1">
            Avalie sua facilidade de lembrar:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
            <Button
              onClick={() => handleRate(1)}
              variant="outline"
              className="h-16 flex-col gap-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <span className="font-bold text-base">Errei</span>
              <span className="text-xs opacity-80 font-medium">
                {formatInterval(getPredictedInterval(1))}
              </span>
            </Button>
            <Button
              onClick={() => handleRate(3)}
              variant="outline"
              className="h-16 flex-col gap-1 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
            >
              <span className="font-bold text-base">Difícil</span>
              <span className="text-xs opacity-80 font-medium">
                {formatInterval(getPredictedInterval(3))}
              </span>
            </Button>
            <Button
              onClick={() => handleRate(4)}
              variant="outline"
              className="h-16 flex-col gap-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <span className="font-bold text-base">Bom</span>
              <span className="text-xs opacity-80 font-medium">
                {formatInterval(getPredictedInterval(4))}
              </span>
            </Button>
            <Button
              onClick={() => handleRate(5)}
              variant="outline"
              className="h-16 flex-col gap-1 border-success text-success hover:bg-success hover:text-success-foreground"
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
          disabled={isBtnDisabled}
        >
          Verificar Resposta
        </Button>
      )}
    </div>
  )
}
