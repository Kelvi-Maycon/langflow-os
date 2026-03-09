import { Button } from '@/components/ui/button'
import { CheckCircle2, ArrowRight } from 'lucide-react'

interface CapturedWord {
  word: string
  translation: string
  sentence: string
}

interface ReaderActiveSessionProps {
  capturedWords: CapturedWord[]
  onExit: () => void
  onNextPhase: () => void
}

export function ReaderActiveSession({
  capturedWords,
  onExit,
  onNextPhase,
}: ReaderActiveSessionProps) {
  if (capturedWords.length === 0) {
    return (
      <div className="flex flex-col sm:flex-row justify-between items-center bg-card/80 backdrop-blur-md p-4 px-6 rounded-[24px] border border-border shadow-sm shrink-0 gap-4">
        <div className="text-sm font-medium flex items-center gap-3 text-muted-foreground w-full sm:w-auto text-center sm:text-left">
          <div className="p-2 bg-primary/10 rounded-full hidden sm:block">
            <CheckCircle2 className="w-4 h-4 text-primary" />
          </div>
          Clique nas palavras no texto acima para gerar explicações com IA e salvá-las.
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl h-10 bg-background hover:bg-secondary border-border w-full sm:w-auto"
          onClick={onExit}
        >
          Editar Fonte
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-card/95 backdrop-blur-md p-5 rounded-[24px] border border-primary/30 shadow-lg animate-fade-in-up shrink-0 ring-1 ring-primary/20">
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div className="flex-1">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-foreground uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            Sessão Ativa ({capturedWords.length})
          </h3>
          <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto">
            {capturedWords.map((cw) => (
              <div
                key={cw.word}
                className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-primary/10 text-primary border border-primary/20 shadow-sm transition-all hover:bg-primary/20"
              >
                {cw.word}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 md:w-auto w-full shrink-0 items-end md:items-center justify-end">
          <Button
            variant="ghost"
            className="h-12 rounded-xl text-muted-foreground hover:text-foreground"
            onClick={onExit}
          >
            Sair do Leitor
          </Button>
          <Button
            className="h-12 rounded-xl shadow-md group text-base px-6 w-full sm:w-auto"
            onClick={onNextPhase}
          >
            Praticar Palavras{' '}
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  )
}
