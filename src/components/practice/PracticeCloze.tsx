import { cn } from '@/lib/utils'

interface Props {
  practiceData: any
  textInput: string
  setTextInput: (v: string) => void
  status: string
  onEnter: () => void
}

export function PracticeCloze({ practiceData, textInput, setTextInput, status, onEnter }: Props) {
  const parts = practiceData.en.split(new RegExp(`\\b(${practiceData.word})\\b`, 'gi'))

  return (
    <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-fade-in">
      <p className="text-xl md:text-2xl text-muted-foreground text-center font-medium">
        {practiceData.pt}
      </p>
      <div className="text-2xl md:text-4xl font-medium text-center leading-[3.5rem] text-foreground">
        {parts.map((part: string, i: number) => {
          if (part.toLowerCase() === practiceData.word.toLowerCase()) {
            return (
              <input
                key={i}
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onEnter()}
                disabled={status === 'correct' || status === 'incorrect'}
                autoFocus
                className={cn(
                  'mx-2 inline-block border-b-4 border-primary bg-transparent text-center focus:outline-none focus:border-primary/80 transition-colors placeholder:text-muted-foreground/30',
                  practiceData.word.includes(' ') ? 'w-48 md:w-64' : 'w-36 md:w-48',
                  status === 'checking' && 'border-destructive text-destructive',
                  status === 'correct' && 'border-success text-success',
                  status === 'incorrect' && 'border-destructive text-destructive',
                )}
                placeholder="____"
              />
            )
          }
          return <span key={i}>{part}</span>
        })}
      </div>
    </div>
  )
}
