import { Button } from '@/components/ui/button'
import { Settings2, Volume2, StopCircle } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface ReaderHeaderProps {
  isReadingMode: boolean
  isPlayingTTS: boolean
  aiModel: string
  onToggleTTS: () => void
  onModelChange: (model: string) => void
}

export function ReaderHeader({
  isReadingMode,
  isPlayingTTS,
  aiModel,
  onToggleTTS,
  onModelChange,
}: ReaderHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-start justify-between gap-4 shrink-0">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Leitor Imersivo</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Processe textos ou vídeos do YouTube e capture vocabulário em contexto.
        </p>
      </div>

      {isReadingMode && (
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            onClick={onToggleTTS}
            variant="secondary"
            size="sm"
            className={cn(
              'h-9 gap-2 shadow-sm rounded-xl px-3 border border-border transition-all',
              isPlayingTTS && 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20',
            )}
          >
            {isPlayingTTS ? <StopCircle className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isPlayingTTS ? 'Parar Áudio' : 'Ouvir Texto'}</span>
          </Button>
          <div className="flex items-center gap-2 bg-secondary/40 p-1.5 rounded-xl border border-border animate-fade-in shadow-sm shrink-0">
            <Settings2 className="w-4 h-4 text-primary ml-2" />
            <Select value={aiModel || 'gpt-4o-mini'} onValueChange={onModelChange}>
              <SelectTrigger className="w-[160px] h-9 border-0 bg-transparent focus:ring-0 shadow-none font-medium">
                <SelectValue placeholder="Modelo de IA" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </header>
  )
}
