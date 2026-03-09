import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

interface Props {
  practiceData: any
  textInput: string
  setTextInput: (v: string) => void
  status: string
  onEnter: () => void
}

export function PracticeTransform({
  practiceData,
  textInput,
  setTextInput,
  status,
  onEnter,
}: Props) {
  return (
    <div className="flex-1 flex flex-col justify-center space-y-8 max-w-xl mx-auto w-full animate-fade-in">
      <div className="bg-primary/10 p-5 rounded-2xl border border-primary/20 text-center animate-fade-in-up shadow-sm">
        <p className="text-xs uppercase tracking-widest text-primary font-bold mb-2">
          Transform Instruction
        </p>
        <p className="text-2xl font-semibold text-foreground">{practiceData.instruction}</p>
      </div>

      <div className="text-center space-y-3 mb-6">
        <p className="text-3xl font-medium text-foreground">{practiceData.original}</p>
        <p className="text-lg text-muted-foreground font-medium">{practiceData.pt}</p>
      </div>

      <Input
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        disabled={status === 'correct' || status === 'incorrect'}
        placeholder="Type the transformed sentence here..."
        className={cn(
          'h-16 text-xl text-center rounded-2xl shadow-sm border-2 transition-all duration-300 placeholder:text-muted-foreground/50',
          status === 'checking' &&
            'border-destructive focus-visible:ring-destructive text-destructive',
          status === 'correct' && 'border-success focus-visible:ring-success text-success',
          status === 'incorrect' &&
            'border-destructive focus-visible:ring-destructive text-destructive',
          status === 'idle' && 'border-border focus-visible:border-primary',
        )}
        onKeyDown={(e) => e.key === 'Enter' && onEnter()}
        autoFocus
      />
    </div>
  )
}
